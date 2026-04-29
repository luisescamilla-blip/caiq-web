import { useParams, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Target,
  CheckCircle2,
  Circle,
} from "lucide-react";

const SESSION_STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessions, students } = useApp();

  const session = sessions.find((s) => s.id === id);
  const student = session ? students.find((st) => st.id === session.studentId) : null;

  if (!session || !student) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Session not found.</p>
        <button onClick={() => navigate("/sessions")} className="text-indigo-600 mt-2">
          Back to Sessions
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string, time?: string) =>
    new Date(dateStr + (time ? `T${time}` : "")).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

  const goalProgress = student.goals.length > 0
    ? Math.round(student.goals.reduce((acc, g) => acc + g.progress, 0) / student.goals.length)
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate("/sessions")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        style={{ fontSize: "14px" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sessions
      </button>

      {/* Header card */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-gray-900">{session.topic}</h1>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full ${SESSION_STATUS_STYLES[session.status]}`}
                style={{ fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}
              >
                {session.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "13px" }}>
                <User className="w-4 h-4" />
                <button
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  {student.name}
                </button>
              </span>
              <span className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "13px" }}>
                <Calendar className="w-4 h-4" />
                {formatDate(session.date, session.time)}
              </span>
              <span className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "13px" }}>
                <Clock className="w-4 h-4" />
                {session.time} · {session.duration} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Session Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="text-gray-900">Session Notes</h3>
          </div>
          {session.notes ? (
            <p className="text-gray-700" style={{ fontSize: "14px", lineHeight: 1.7 }}>
              {session.notes}
            </p>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400" style={{ fontSize: "13px" }}>No notes for this session yet</p>
            </div>
          )}
        </div>

        {/* Student Goals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              <h3 className="text-gray-900">Student Goals</h3>
            </div>
            <span className="text-gray-400" style={{ fontSize: "12px" }}>{goalProgress}% avg progress</span>
          </div>
          {student.goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400" style={{ fontSize: "13px" }}>No goals set</p>
            </div>
          ) : (
            <div className="space-y-3">
              {student.goals.map((goal) => (
                <div key={goal.id} className="flex items-start gap-3">
                  {goal.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : goal.status === "in-progress" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`${goal.status === "completed" ? "line-through text-gray-400" : "text-gray-700"}`}
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      {goal.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-400 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="text-gray-400 flex-shrink-0" style={{ fontSize: "11px" }}>
                        {goal.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student quick info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white" style={{ fontSize: "13px", fontWeight: 700 }}>{student.avatar}</span>
            </div>
            <div>
              <p className="text-gray-900" style={{ fontSize: "15px", fontWeight: 700 }}>{student.name}</p>
              <p className="text-gray-400" style={{ fontSize: "13px" }}>{student.program} · {student.totalSessions} total sessions</p>
            </div>
            <button
              onClick={() => navigate(`/students/${student.id}`)}
              className="ml-auto text-indigo-600 hover:text-indigo-700 transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              View full profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
