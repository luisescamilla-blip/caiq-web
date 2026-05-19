import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import { Session, SessionStatus } from "../data/mockData";
import {
  Plus,
  Search,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Trash2,
  Edit,
} from "lucide-react";

const STATUS_STYLES: Record<SessionStatus, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const TOPICS = [
  "Goal Setting",
  "Career Planning",
  "Interview Preparation",
  "Leadership Development",
  "Work-Life Balance",
  "Mindfulness & Wellness",
  "Business Strategy",
  "Personal Branding",
  "Salary Negotiation",
  "Team Dynamics",
  "Delegation & Trust",
  "Other",
];

function generateId() {
  return "sess" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function Sessions() {
  const navigate = useNavigate();
  const { students, sessions, addSession, updateSession, deleteSession } = useApp();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<SessionStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 4, 1)); // May 2026

  const [form, setForm] = useState({
    studentId: "",
    date: "",
    time: "10:00",
    duration: 60,
    topic: "Training Session",
    status: "upcoming" as SessionStatus,
    notes: "",
  });

  const filtered = sessions.filter((s) => {
    const student = students.find((st) => st.id === s.studentId);
    const q = search.toLowerCase();
    const matchesSearch = !q || s.topic.toLowerCase().includes(q) || student?.name.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.date + "T" + a.time).getTime();
    const dateB = new Date(b.date + "T" + b.time).getTime();
    return dateB - dateA;
  });

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? "Unknown";
  const getStudentAvatar = (id: string) => students.find((s) => s.id === id)?.avatar ?? "??";

  const formatDate = (dateStr: string, time?: string) =>
    new Date(dateStr + (time ? `T${time}` : "T00:00:00")).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  const openModal = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      setForm({
        studentId: session.studentId,
        date: session.date,
        time: session.time,
        duration: session.duration,
        topic: session.topic,
        status: session.status,
        notes: session.notes ?? "",
      });
    } else {
      setEditingSession(null);
      setForm({ studentId: students[0]?.id ?? "", date: "", time: "10:00", duration: 60, topic: "Training Session", status: "upcoming", notes: "" });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.studentId || !form.date) return;
    try {
      if (editingSession) {
        await updateSession({ ...editingSession, ...form });
      } else {
        await addSession({ id: generateId(), ...form });
      }
      setModalOpen(false);
    } catch (err) {
      console.error('handleSave error:', err);
      alert('Failed to save session. Please try again.');
    }
  };

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);

  const getSessionsForDay = (day: number) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return sessions.filter((s) => s.date === dateStr);
  };

  const upcomingCount = sessions.filter((s) => s.status === "upcoming").length;
  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const cancelledCount = sessions.filter((s) => s.status === "cancelled").length;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Sessions</h1>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "14px" }}>
            {sessions.length} total · {upcomingCount} upcoming
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200"
          style={{ fontSize: "14px" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Schedule Session</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Upcoming", value: upcomingCount, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Cancelled", value: cancelledCount, icon: XCircle, color: "text-gray-500", bg: "bg-gray-100" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-gray-900" style={{ fontSize: "20px", fontWeight: 700 }}>{stat.value}</p>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions or players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
            style={{ fontSize: "14px" }}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as SessionStatus | "all")}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
            style={{ fontSize: "13px" }}
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              style={{ fontSize: "12px" }}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === "calendar" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              style={{ fontSize: "12px" }}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* List view */}
      {viewMode === "list" && (
        <div className="space-y-2">
          {sorted.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>No sessions found</p>
            </div>
          ) : (
            sorted.map((session) => (
              <div key={session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-indigo-200 transition-colors group cursor-pointer" onClick={() => navigate(`/sessions/${session.id}`)}>
                <div
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => navigate(`/sessions/${session.id}`)}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: "12px", fontWeight: 700 }}>{getStudentAvatar(session.studentId)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>{getStudentName(session.studentId)}</p>
                    <p className="text-gray-500 truncate" style={{ fontSize: "13px" }}>{session.topic}</p>
                    {session.notes && <p className="text-gray-400 truncate" style={{ fontSize: "12px" }}>{session.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>
                      {formatDate(session.date)}
                    </p>
                    <p className="text-gray-400 flex items-center gap-1 justify-end" style={{ fontSize: "12px" }}>
                      <Clock className="w-3 h-3" /> {session.time} · {session.duration}m
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg ${STATUS_STYLES[session.status]}`} style={{ fontSize: "11px", fontWeight: 600, textTransform: "capitalize" }}>
                    {session.status}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openModal(session); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(session.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Calendar view */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button
              onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-gray-900">{MONTHS[calendarMonth]} {calendarYear}</h3>
            <button
              onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-center text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 border-b border-r border-gray-50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const daySessions = getSessionsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth && new Date().getFullYear() === calendarYear;
              return (
                <div key={day} className={`h-20 border-b border-r border-gray-50 p-1.5 ${isToday ? "bg-indigo-50" : "hover:bg-gray-50"} transition-colors`}>
                  <p className={`text-right mb-1 ${isToday ? "text-indigo-600 font-bold" : "text-gray-500"}`} style={{ fontSize: "12px" }}>
                    {day}
                  </p>
                  <div className="space-y-0.5 overflow-hidden">
                    {daySessions.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className={`px-1 py-0.5 rounded truncate cursor-pointer ${
                          s.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                          s.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                        }`}
                        style={{ fontSize: "10px" }}
                        onClick={() => navigate(`/students/${s.studentId}`)}
                      >
                        {s.time} {getStudentName(s.studentId).split(" ")[0]}
                      </div>
                    ))}
                    {daySessions.length > 2 && (
                      <p className="text-gray-400" style={{ fontSize: "10px" }}>+{daySessions.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-gray-900">{editingSession ? "Edit Session" : "Schedule Session"}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Player *</label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
                  style={{ fontSize: "14px" }}
                >
                  <option value="">Select a player...</option>
                  {students.filter((s) => s.status !== "inactive").map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Session Name *</label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  onBlur={(e) => { if (!e.target.value.trim()) setForm((f) => ({ ...f, topic: "Training Session" })); }}
                  placeholder="e.g. Training Session, Strength Work..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  style={{ fontSize: "14px" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                    style={{ fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Duration (min)</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
                    style={{ fontSize: "14px" }}
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as SessionStatus })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all appearance-none cursor-pointer"
                    style={{ fontSize: "14px" }}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1" style={{ fontSize: "13px" }}>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Session notes or agenda..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  style={{ fontSize: "14px" }}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors" style={{ fontSize: "14px" }}>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.studentId || !form.date}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
                  style={{ fontSize: "14px" }}
                >
                  {editingSession ? "Save Changes" : "Schedule Session"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-900 text-center mb-2">Delete Session?</h3>
            <p className="text-gray-500 text-center mb-5" style={{ fontSize: "14px" }}>This session will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors" style={{ fontSize: "14px" }}>Cancel</button>
              <button onClick={() => { deleteSession(confirmDelete); setConfirmDelete(null); }} className="flex-1 px-4 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors" style={{ fontSize: "14px" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
