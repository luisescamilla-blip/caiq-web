import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Goal, GoalStatus, Note } from "../data/mockData";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  FileText,
  CalendarDays,
  X,
  Check,
  ChevronDown,
  Dumbbell,
  Image,
  MessageCircle,
} from "lucide-react";

const SESSION_STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  "not-started": "bg-gray-100 text-gray-500",
};

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  "in-progress": "In Progress",
  completed: "Completed",
  "not-started": "Not Started",
};

const AVATAR_COLORS = [
  "from-violet-400 to-indigo-500",
];

function generateId() {
  return crypto.randomUUID();
}

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { students, sessions, addNote, updateNote, deleteNote, addGoal, updateGoal, deleteGoal } = useApp();

  const session = sessions.find((s) => s.id === id);
  const student = session ? students.find((st) => st.id === session.studentId) : null;

  const [activeTab, setActiveTab] = useState<"overview" | "drills" | "goals" | "notes" | "media" | "chats">("overview");

  // Note modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");

  // Goal modal state
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState({ title: "", status: "not-started" as GoalStatus, progress: 0, dueDate: "" });

  if (!session || !student) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Session not found.</p>
        <button onClick={() => navigate("/sessions")} className="text-indigo-600 mt-2">Back to sessions</button>
      </div>
    );
  }

  const studentSessions = sessions.filter((s) => s.studentId === student.id);
  const avatarColor = AVATAR_COLORS[student.id.charCodeAt(student.id.length - 1) % AVATAR_COLORS.length];
  const upcomingSessions = studentSessions.filter((s) => s.status === "upcoming");
  const avgGoalProgress = student.goals.length > 0
    ? Math.round(student.goals.reduce((acc, g) => acc + g.progress, 0) / student.goals.length)
    : 0;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Note handlers
  const openNoteModal = (note?: Note) => {
    if (note) { setEditingNote(note); setNoteContent(note.content); }
    else { setEditingNote(null); setNoteContent(""); }
    setNoteModalOpen(true);
  };
  const saveNote = () => {
    if (!noteContent.trim()) return;
    if (editingNote) {
      updateNote(student.id, { ...editingNote, content: noteContent });
    } else {
      addNote(student.id, {
        id: generateId(),
        date: new Date().toISOString().split("T")[0],
        content: noteContent,
      });
    }
    setNoteModalOpen(false);
    setNoteContent("");
    setEditingNote(null);
  };

  // Goal handlers
  const openGoalModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({ title: goal.title, status: goal.status, progress: goal.progress, dueDate: goal.dueDate });
    } else {
      setEditingGoal(null);
      setGoalForm({ title: "", status: "not-started", progress: 0, dueDate: "" });
    }
    setGoalModalOpen(true);
  };
  const saveGoal = () => {
    if (!goalForm.title.trim()) return;
    if (editingGoal) {
      updateGoal(student.id, { ...editingGoal, ...goalForm });
    } else {
      addGoal(student.id, { id: generateId(), ...goalForm });
    }
    setGoalModalOpen(false);
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "drills", label: `Drills (${studentSessions.length})` },
    { key: "goals", label: `Goals (${student.goals.length})` },
    { key: "notes", label: `Notes (${student.notes.length})` },
    { key: "media", label: "Photos & Videos" },
    { key: "chats", label: "Chats" },
  ] as const;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate("/sessions")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        style={{ fontSize: "14px" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sessions
      </button>

      {/* Session header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
        <div className="h-24 lg:h-20" />
        <div className="px-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-8 mb-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center border-4 border-white shadow-lg flex-shrink-0`}>
              <span className="text-white" style={{ fontSize: "22px", fontWeight: 800 }}>{student.avatar}</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-gray-900">{session.topic}</h1>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full ${SESSION_STATUS_STYLES[session.status]}`} style={{ fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>
                  {session.status}
                </span>
              </div>
              <p className="text-gray-500 mt-0.5" style={{ fontSize: "14px" }}>
                {student.name} · {student.program}
              </p>
            </div>
          </div>

          {/* Session info */}
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-2 text-gray-500" style={{ fontSize: "13px" }}>
              <Calendar className="w-4 h-4" /> {formatDate(session.date)}
            </span>
            <span className="flex items-center gap-2 text-gray-500" style={{ fontSize: "13px" }}>
              <Clock className="w-4 h-4" /> {session.time} · {session.duration} min
            </span>
            {session.notes && (
              <span className="flex items-center gap-2 text-gray-500" style={{ fontSize: "13px" }}>
                <FileText className="w-4 h-4" /> {session.notes}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Drills", value: student.totalSessions, icon: Dumbbell, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Photos & Videos", value: 0, icon: Image, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Goals Progress", value: `${avgGoalProgress}%`, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Notes", value: student.notes.length, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-gray-900" style={{ fontSize: "20px", fontWeight: 700 }}>{stat.value}</p>
              <p className="text-gray-400" style={{ fontSize: "11px", fontWeight: 500 }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              style={{ fontSize: "14px", fontWeight: activeTab === tab.key ? 600 : 500 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Goals summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Goals Overview</h3>
              <button onClick={() => { openGoalModal(); setActiveTab("goals"); }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors" style={{ fontSize: "13px" }}>
                <Plus className="w-3.5 h-3.5" /> Add Goal
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-500" style={{ fontSize: "13px" }}>Overall Progress</p>
                <p className="text-gray-900" style={{ fontSize: "13px", fontWeight: 700 }}>{avgGoalProgress}%</p>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${avgGoalProgress}%` }}
                />
              </div>
            </div>
            <div className="space-y-3">
              {student.goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="flex items-center gap-3">
                  {goal.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : goal.status === "in-progress" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`truncate ${goal.status === "completed" ? "line-through text-gray-400" : "text-gray-700"}`} style={{ fontSize: "13px" }}>
                      {goal.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Recent Notes</h3>
              <button onClick={() => openNoteModal()} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors" style={{ fontSize: "13px" }}>
                <Plus className="w-3.5 h-3.5" /> Add Note
              </button>
            </div>
            {student.notes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400" style={{ fontSize: "13px" }}>No notes yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {student.notes.slice(0, 2).map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 mb-1" style={{ fontSize: "11px" }}>{formatDate(note.date)}</p>
                    <p className="text-gray-700 line-clamp-3" style={{ fontSize: "13px", lineHeight: 1.6 }}>{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session history */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
            <h3 className="text-gray-900 mb-4">Session History</h3>
            {studentSessions.length === 0 ? (
              <p className="text-gray-400 text-center py-6" style={{ fontSize: "13px" }}>No sessions yet</p>
            ) : (
              <div className="space-y-2">
                {studentSessions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 4)
                  .map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer ${s.id === session.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-gray-50"}`}
                      onClick={() => navigate(`/sessions/${s.id}`)}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        s.status === "completed" ? "bg-emerald-400" :
                        s.status === "upcoming" ? "bg-blue-400" : "bg-gray-300"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: s.id === session.id ? 700 : 600 }}>{s.topic}</p>
                        {s.notes && <p className="text-gray-400 truncate" style={{ fontSize: "12px" }}>{s.notes}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gray-600" style={{ fontSize: "12px" }}>{formatDate(s.date)}</p>
                        <p className="text-gray-400" style={{ fontSize: "11px" }}>{s.time} · {s.duration}m</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "drills" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">Drills</h3>
            <button
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl transition-colors"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-4 h-4" /> Add Drill
            </button>
          </div>
          {studentSessions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Dumbbell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>No drills recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentSessions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full ${
                            s.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            s.status === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                          }`} style={{ fontSize: "11px", fontWeight: 600, textTransform: "capitalize" }}>
                            {s.status}
                          </span>
                          <span className="text-gray-400 flex items-center gap-1" style={{ fontSize: "11px" }}>
                            <Calendar className="w-3 h-3" /> {formatDate(s.date)}
                          </span>
                        </div>
                        <p className="text-gray-800" style={{ fontSize: "14px", fontWeight: 500 }}>{s.topic}</p>
                        {s.notes && <p className="text-gray-500 mt-1" style={{ fontSize: "13px", lineHeight: 1.6 }}>{s.notes}</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "media" && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Image className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500" style={{ fontSize: "15px", fontWeight: 600 }}>Photos & Videos</p>
          <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>Media uploads coming soon</p>
        </div>
      )}

      {activeTab === "chats" && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500" style={{ fontSize: "15px", fontWeight: 600 }}>Chats</p>
          <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>Session chats coming soon</p>
        </div>
      )}

      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">Goals & Milestones</h3>
            <button
              onClick={() => openGoalModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl transition-colors"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </div>
          {student.goals.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Target className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>No goals set yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {student.goals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full ${GOAL_STATUS_STYLES[goal.status]}`} style={{ fontSize: "11px", fontWeight: 600 }}>
                          {GOAL_STATUS_LABELS[goal.status]}
                        </span>
                        {goal.dueDate && (
                          <span className="text-gray-400 flex items-center gap-1" style={{ fontSize: "11px" }}>
                            <Calendar className="w-3 h-3" /> Due {formatDate(goal.dueDate)}
                          </span>
                        )}
                      </div>
                      <p className={`mb-3 ${goal.status === "completed" ? "line-through text-gray-400" : "text-gray-800"}`} style={{ fontSize: "14px", fontWeight: 500 }}>
                        {goal.title}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${goal.status === "completed" ? "bg-emerald-500" : "bg-indigo-500"}`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 700 }}>{goal.progress}%</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openGoalModal(goal)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteGoal(student.id, goal.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">Session Notes</h3>
            <button
              onClick={() => openNoteModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl transition-colors"
              style={{ fontSize: "13px" }}
            >
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>
          {student.notes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>No notes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {student.notes.map((note) => (
                <div key={note.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-indigo-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>
                        {formatDate(note.date)}
                      </p>
                      <p className="text-gray-700" style={{ fontSize: "14px", lineHeight: 1.7 }}>{note.content}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openNoteModal(note)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteNote(student.id, note.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNoteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">{editingNote ? "Edit Note" : "Add Note"}</h3>
              <button onClick={() => setNoteModalOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your session notes here..."
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none transition-all"
              style={{ fontSize: "14px" }}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setNoteModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={saveNote} disabled={!noteContent.trim()} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setGoalModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">{editingGoal ? "Edit Goal" : "Add Goal"}</h3>
              <button onClick={() => setGoalModalOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Goal Title *</label>
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="e.g. Land a senior role at a top company"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Status</label>
                  <select
                    value={goalForm.status}
                    onChange={(e) => setGoalForm({ ...goalForm, status: e.target.value as GoalStatus })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
                    style={{ fontSize: "13px" }}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Due Date</label>
                  <input
                    type="date"
                    value={goalForm.dueDate}
                    onChange={(e) => setGoalForm({ ...goalForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Progress: {goalForm.progress}%</label>
                <input
                  type="range" min={0} max={100} step={5}
                  value={goalForm.progress}
                  onChange={(e) => setGoalForm({ ...goalForm, progress: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setGoalModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={saveGoal} disabled={!goalForm.title.trim()} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
