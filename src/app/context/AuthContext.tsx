import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  title?: string;
  bio?: string;
  phone?: string;
  timezone?: string;
}

export interface ProfileUpdate {
  name: string;
  title: string;
  bio: string;
  phone: string;
  timezone: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(supabaseUser: User | null, coachRow?: Record<string, string> | null): AuthUser | null {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    name: coachRow?.name ?? supabaseUser.user_metadata?.name ?? supabaseUser.email?.split("@")[0] ?? "Coach",
    email: supabaseUser.email ?? "",
    title: coachRow?.title ?? supabaseUser.user_metadata?.title ?? "",
    bio: coachRow?.bio ?? supabaseUser.user_metadata?.bio ?? "",
    phone: coachRow?.phone ?? supabaseUser.user_metadata?.phone ?? "",
    timezone: coachRow?.timezone ?? supabaseUser.user_metadata?.timezone ?? "America/New_York",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserWithProfile = async (supabaseUser: User | null) => {
    if (!supabaseUser) { setUser(null); return; }
    // Fetch extended profile from coaches table
    const { data: coachRow } = await supabase
      .from("coaches")
      .select("name, title, bio, phone, timezone")
      .eq("id", supabaseUser.id)
      .single();
    setUser(mapUser(supabaseUser, coachRow));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserWithProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserWithProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return;

    // Update coaches table (add columns if missing via migration)
    const { error: dbError } = await supabase
      .from("coaches")
      .update({
        name: updates.name,
        title: updates.title,
        bio: updates.bio,
        phone: updates.phone,
        timezone: updates.timezone,
      })
      .eq("id", user.id);

    if (dbError) throw dbError;

    // Also update auth user_metadata so name shows immediately everywhere
    await supabase.auth.updateUser({
      data: { name: updates.name, title: updates.title },
    });

    // Update local state immediately
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
