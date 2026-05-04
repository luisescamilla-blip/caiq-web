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
  avatarUrl?: string;
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
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
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
    avatarUrl: coachRow?.avatar_url ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadUserWithProfile = async (supabaseUser: User | null) => {
    if (!supabaseUser) { setUser(null); return; }
    setProfileLoading(true);
    // Retry a couple times — coaches row is created by a DB trigger after signup
    let coachRow = null;
    for (let i = 0; i < 3; i++) {
      const { data } = await supabase
        .from("coaches")
        .select("name, title, bio, phone, timezone, avatar_url")
        .eq("id", supabaseUser.id)
        .single();
      if (data) { coachRow = data; break; }
      await new Promise((r) => setTimeout(r, 500)); // wait 500ms between retries
    }
    setUser(mapUser(supabaseUser, coachRow));
    setProfileLoading(false);
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

    const { error: dbError } = await supabase
      .from("coaches")
      .update({
        name: updates.name,
        title: updates.title,
        bio: updates.bio,
        phone: updates.phone,
        timezone: updates.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (dbError) throw dbError;

    await supabase.auth.updateUser({
      data: { name: updates.name, title: updates.title },
    });

    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error("Not authenticated");

    const path = `${user.id}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`; // cache-bust

    // Save url to coaches table
    await supabase.from("coaches").update({ avatar_url: avatarUrl }).eq("id", user.id);

    setUser((prev) => prev ? { ...prev, avatarUrl } : prev);
    return avatarUrl;
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, authLoading: profileLoading, signIn, signUp, signOut, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
