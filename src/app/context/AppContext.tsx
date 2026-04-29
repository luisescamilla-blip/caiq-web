import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Student,
  Session,
  initialStudents,
  initialSessions,
  Note,
  Goal,
} from "../data/mockData";

interface AppContextType {
  students: Student[];
  sessions: Session[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addSession: (session: Session) => void;
  updateSession: (session: Session) => void;
  deleteSession: (id: string) => void;
  addNote: (studentId: string, note: Note) => void;
  updateNote: (studentId: string, note: Note) => void;
  deleteNote: (studentId: string, noteId: string) => void;
  updateGoal: (studentId: string, goal: Goal) => void;
  addGoal: (studentId: string, goal: Goal) => void;
  deleteGoal: (studentId: string, goalId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  const addStudent = (student: Student) => {
    setStudents((prev) => [student, ...prev]);
  };

  const updateStudent = (student: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setSessions((prev) => prev.filter((s) => s.studentId !== id));
  };

  const addSession = (session: Session) => {
    setSessions((prev) => [session, ...prev]);
  };

  const updateSession = (session: Session) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? session : s))
    );
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const addNote = (studentId: string, note: Note) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, notes: [note, ...s.notes] } : s
      )
    );
  };

  const updateNote = (studentId: string, note: Note) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, notes: s.notes.map((n) => (n.id === note.id ? note : n)) }
          : s
      )
    );
  };

  const deleteNote = (studentId: string, noteId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, notes: s.notes.filter((n) => n.id !== noteId) }
          : s
      )
    );
  };

  const addGoal = (studentId: string, goal: Goal) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, goals: [...s.goals, goal] } : s
      )
    );
  };

  const updateGoal = (studentId: string, goal: Goal) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, goals: s.goals.map((g) => (g.id === goal.id ? goal : g)) }
          : s
      )
    );
  };

  const deleteGoal = (studentId: string, goalId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, goals: s.goals.filter((g) => g.id !== goalId) }
          : s
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        students,
        sessions,
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
