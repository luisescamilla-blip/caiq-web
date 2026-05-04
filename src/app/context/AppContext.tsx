import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./AuthContext";
import {
  Student,
  Session,
  Note,
  Goal,
} from "../data/mockData";

export interface Drill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  youtubeUrl?: string;
  createdAt: string;
}

interface AppContextType {
  students: Student[];
  sessions: Session[];
  drills: Drill[];
  loading: boolean;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addSession: (session: Session) => Promise<void>;
  updateSession: (session: Session) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  addNote: (studentId: string, note: Note) => Promise<void>;
  updateNote: (studentId: string, note: Note) => Promise<void>;
  deleteNote: (studentId: string, noteId: string) => Promise<void>;
  updateGoal: (studentId: string, goal: Goal) => Promise<void>;
  addGoal: (studentId: string, goal: Goal) => Promise<void>;
  deleteGoal: (studentId: string, goalId: string) => Promise<void>;
  addDrill: (drill: Drill) => Promise<void>;
  updateDrill: (drill: Drill) => Promise<void>;
  deleteDrill: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Mappers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStudent(row: any, goals: Goal[], notes: Note[], totalSessions: number): Student {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    avatar: row.avatar ?? row.name?.split(" ").map((w: string) => w[0]).join("").toUpperCase() ?? "??",
    status: row.status,
    joinDate: row.join_date ?? row.created_at?.slice(0, 10) ?? "",
    program: row.program ?? "",
    totalSessions,
    tags: row.tags ?? [],
    goals,
    notes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGoal(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    progress: row.progress ?? 0,
    dueDate: row.due_date ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNote(row: any): Note {
  return {
    id: row.id,
    date: row.created_at?.slice(0, 10) ?? "",
    content: row.content,
    sessionId: row.session_id,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDrill(row: any): Drill {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category: row.category ?? "Other",
    tags: row.tags ?? [],
    difficulty: row.difficulty ?? "beginner",
    duration: row.duration ?? 15,
    youtubeUrl: row.youtube_url ?? undefined,
    createdAt: row.created_at?.slice(0, 10) ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSession(row: any): Session {
  return {
    id: row.id,
    studentId: row.student_id,
    date: row.date,
    time: row.time ?? "",
    duration: row.duration ?? 60,
    status: row.status,
    topic: row.topic,
    notes: row.notes ?? undefined,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Load data when user is authenticated ──────────────────────────────────
  useEffect(() => {
    if (!user) {
      setStudents([]);
      setSessions([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const coachId = user.id;

        // Fetch students, sessions, goals, notes, drills in parallel
        const [studentsRes, sessionsRes, goalsRes, notesRes, drillsRes] = await Promise.all([
          supabase.from("students").select("*").eq("coach_id", coachId).order("created_at", { ascending: false }),
          supabase.from("sessions").select("*").eq("coach_id", coachId).order("date", { ascending: false }),
          supabase.from("goals").select("*").eq("coach_id", coachId).eq("parent_type", "student"),
          supabase.from("notes").select("*").eq("coach_id", coachId).eq("parent_type", "student").order("created_at", { ascending: false }),
          supabase.from("drills").select("*").eq("coach_id", coachId).order("created_at", { ascending: false }),
        ]);

        const rawStudents = studentsRes.data ?? [];
        const rawSessions = sessionsRes.data ?? [];
        const rawGoals = goalsRes.data ?? [];
        const rawNotes = notesRes.data ?? [];
        const rawDrills = drillsRes.data ?? [];

        // Map sessions
        const mappedSessions = rawSessions.map(mapSession);
        setSessions(mappedSessions);

        // Map drills
        setDrills(rawDrills.map(mapDrill));

        // Build completed session count per student (excludes cancelled)
        const sessionCountMap: Record<string, number> = {};
        rawSessions
          .filter((s) => s.status !== "cancelled")
          .forEach((s) => {
            sessionCountMap[s.student_id] = (sessionCountMap[s.student_id] ?? 0) + 1;
          });

        // Map students with their goals, notes, and session counts
        const mappedStudents = rawStudents.map((s) => {
          const goals = rawGoals.filter((g) => g.parent_id === s.id).map(mapGoal);
          const notes = rawNotes.filter((n) => n.parent_id === s.id).map(mapNote);
          const totalSessions = sessionCountMap[s.id] ?? 0;
          return mapStudent(s, goals, notes, totalSessions);
        });
        setStudents(mappedStudents);
      } catch (err) {
        console.error("AppContext: failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // ── Students ──────────────────────────────────────────────────────────────

  const addStudent = async (student: Student) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("students")
      .insert({
        id: student.id,
        coach_id: user.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        avatar: student.avatar,
        status: student.status,
        program: student.program,
        join_date: student.joinDate,
        tags: student.tags,
      })
      .select()
      .single();

    if (error) { console.error("addStudent error:", error); throw error; }
    const mapped = mapStudent(data, [], [], 0);
    setStudents((prev) => [mapped, ...prev]);
  };

  const updateStudent = async (student: Student) => {
    if (!user) return;
    const { error } = await supabase
      .from("students")
      .update({
        name: student.name,
        email: student.email,
        phone: student.phone,
        avatar: student.avatar,
        status: student.status,
        program: student.program,
        join_date: student.joinDate,
        tags: student.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", student.id)
      .eq("coach_id", user.id);

    if (error) { console.error("updateStudent error:", error); throw error; }
    setStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
  };

  const deleteStudent = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id)
      .eq("coach_id", user.id);

    if (error) { console.error("deleteStudent error:", error); throw error; }
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setSessions((prev) => prev.filter((s) => s.studentId !== id));
  };

  // ── Sessions ──────────────────────────────────────────────────────────────

  const addSession = async (session: Session) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        id: session.id,
        coach_id: user.id,
        student_id: session.studentId,
        topic: session.topic,
        date: session.date,
        time: session.time,
        duration: session.duration,
        status: session.status,
        notes: session.notes,
      })
      .select()
      .single();

    if (error) { console.error("addSession error:", error); throw error; }
    const newSession = mapSession(data);
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      // Recompute totalSessions for this student from source of truth
      if (newSession.status !== "cancelled") {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === newSession.studentId ? { ...s, totalSessions: s.totalSessions + 1 } : s
          )
        );
      }
      return updated;
    });
  };

  const updateSession = async (session: Session) => {
    if (!user) return;
    const { error } = await supabase
      .from("sessions")
      .update({
        student_id: session.studentId,
        topic: session.topic,
        date: session.date,
        time: session.time,
        duration: session.duration,
        status: session.status,
        notes: session.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .eq("coach_id", user.id);

    if (error) { console.error("updateSession error:", error); throw error; }
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === session.id ? session : s));
      // Recompute totalSessions for affected student (status may have changed)
      setStudents((students) =>
        students.map((s) => {
          if (s.id !== session.studentId) return s;
          const count = updated.filter(
            (sess) => sess.studentId === s.id && sess.status !== "cancelled"
          ).length;
          return { ...s, totalSessions: count };
        })
      );
      return updated;
    });
  };

  const deleteSession = async (id: string) => {
    if (!user) return;
    const sessionToDelete = sessions.find((s) => s.id === id);
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)
      .eq("coach_id", user.id);

    if (error) { console.error("deleteSession error:", error); throw error; }
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      // Recompute totalSessions from remaining non-cancelled sessions
      if (sessionToDelete && sessionToDelete.status !== "cancelled") {
        setStudents((students) =>
          students.map((s) => {
            if (s.id !== sessionToDelete.studentId) return s;
            const count = updated.filter(
              (sess) => sess.studentId === s.id && sess.status !== "cancelled"
            ).length;
            return { ...s, totalSessions: count };
          })
        );
      }
      return updated;
    });
  };

  // ── Notes ─────────────────────────────────────────────────────────────────

  const addNote = async (studentId: string, note: Note) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notes")
      .insert({
        id: note.id,
        coach_id: user.id,
        content: note.content,
        parent_type: "student",
        parent_id: studentId,
      })
      .select()
      .single();

    if (error) { console.error("addNote error:", error); throw error; }
    const mapped = mapNote(data);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, notes: [mapped, ...s.notes] } : s
      )
    );
  };

  const updateNote = async (studentId: string, note: Note) => {
    if (!user) return;
    const { error } = await supabase
      .from("notes")
      .update({
        content: note.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", note.id)
      .eq("coach_id", user.id);

    if (error) { console.error("updateNote error:", error); throw error; }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, notes: s.notes.map((n) => (n.id === note.id ? note : n)) }
          : s
      )
    );
  };

  const deleteNote = async (studentId: string, noteId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId)
      .eq("coach_id", user.id);

    if (error) { console.error("deleteNote error:", error); throw error; }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, notes: s.notes.filter((n) => n.id !== noteId) }
          : s
      )
    );
  };

  // ── Goals ─────────────────────────────────────────────────────────────────

  const addGoal = async (studentId: string, goal: Goal) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("goals")
      .insert({
        id: goal.id,
        coach_id: user.id,
        title: goal.title,
        status: goal.status,
        progress: goal.progress,
        due_date: goal.dueDate || null,
        parent_type: "student",
        parent_id: studentId,
      })
      .select()
      .single();

    if (error) { console.error("addGoal error:", error); throw error; }
    const mapped = mapGoal(data);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, goals: [...s.goals, mapped] } : s
      )
    );
  };

  const updateGoal = async (studentId: string, goal: Goal) => {
    if (!user) return;
    const { error } = await supabase
      .from("goals")
      .update({
        title: goal.title,
        status: goal.status,
        progress: goal.progress,
        due_date: goal.dueDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goal.id)
      .eq("coach_id", user.id);

    if (error) { console.error("updateGoal error:", error); throw error; }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, goals: s.goals.map((g) => (g.id === goal.id ? goal : g)) }
          : s
      )
    );
  };

  const deleteGoal = async (studentId: string, goalId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("coach_id", user.id);

    if (error) { console.error("deleteGoal error:", error); throw error; }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, goals: s.goals.filter((g) => g.id !== goalId) }
          : s
      )
    );
  };

  // ── Drills ───────────────────────────────────────────────────────────────

  const addDrill = async (drill: Drill) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("drills")
      .insert({
        id: drill.id,
        coach_id: user.id,
        name: drill.name,
        description: drill.description,
        category: drill.category,
        tags: drill.tags,
        difficulty: drill.difficulty,
        duration: drill.duration,
        youtube_url: drill.youtubeUrl ?? null,
      })
      .select()
      .single();

    if (error) { console.error("addDrill error:", error); throw error; }
    setDrills((prev) => [mapDrill(data), ...prev]);
  };

  const updateDrill = async (drill: Drill) => {
    if (!user) return;
    const { error } = await supabase
      .from("drills")
      .update({
        name: drill.name,
        description: drill.description,
        category: drill.category,
        tags: drill.tags,
        difficulty: drill.difficulty,
        duration: drill.duration,
        youtube_url: drill.youtubeUrl ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", drill.id)
      .eq("coach_id", user.id);

    if (error) { console.error("updateDrill error:", error); throw error; }
    setDrills((prev) => prev.map((d) => (d.id === drill.id ? drill : d)));
  };

  const deleteDrill = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("drills")
      .delete()
      .eq("id", id)
      .eq("coach_id", user.id);

    if (error) { console.error("deleteDrill error:", error); throw error; }
    setDrills((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        students,
        sessions,
        drills,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        addSession,
        updateSession,
        deleteSession,
        addNote,
        updateNote,
        deleteNote,
        addGoal,
        updateGoal,
        deleteGoal,
        addDrill,
        updateDrill,
        deleteDrill,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
