import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  CalendarDays,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Activity,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, sessions } = useApp();

  const firstName = user?.name?.split(" ")[0] ?? "Coach";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const activeStudents = students.filter((s) => s.status === "active").length;
  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const now = new Date();
  const completedThisMonth = sessions.filter(
    (s) => s.status === "completed" &&
      new Date(s.date).getMonth() === now.getMonth() &&
      new Date(s.date).getFullYear() === now.getFullYear()
  ).length;
  const totalGoals = students.reduce((acc, s) => acc + s.goals.length, 0);
  const completedGoals = students.reduce(
    (acc, s) => acc + s.goals.filter((g) => g.status === "completed").length, 0
  );

  const recentSessions = sessions
    .filter((s) => s.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const nextSessions = [...upcomingSessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? "Unknown";
  const getStudentAvatar = (id: string) => students.find((s) => s.id === id)?.avatar ?? "??";

  const formatDate = (dateStr: string, time?: string) => {
    const date = new Date(dateStr + (time ? `T${time}` : "T00:00:00"));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Build session trend from real data — last 6 months
  const sessionTrendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = MONTHS[d.getMonth()];
    const count = sessions.filter(
      (s) => s.status === "completed" &&
        new Date(s.date).getMonth() === d.getMonth() &&
        new Date(s.date).getFullYear() === d.getFullYear()
    ).length;
    return { month, sessions: count };
  });

  // Build program data from real students
  const programMap: Record<string, number> = {};
  students.forEach((s) => {
    if (s.program) programMap[s.program] = (programMap[s.program] ?? 0) + 1;
  });
  const programData = Object.entries(programMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({ name, students: count }));

  const hasData = students.length > 0 || sessions.length > 0;

  const statsCards = [
    { label: "Active Players", value: activeStudents, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", sub: `${students.length} total` },
    { label: "Upcoming Sessions", value: upcomingSessions.length, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50", sub: "Scheduled" },
    { label: "Sessions This Month", value: completedThisMonth, icon: Activity, color: "text-purple-600", bg: "bg-purple-50", sub: MONTHS[now.getMonth()] },
    { label: "Goals Completed", value: totalGoals > 0 ? `${completedGoals}/${totalGoals}` : "—", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", sub: totalGoals > 0 ? `${Math.round((completedGoals / totalGoals) * 100)}% rate` : "No goals yet" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">{greeting}, {firstName}!</h1>
        <p className="text-gray-500 mt-0.5" style={{ fontSize: "14px" }}>
          {hasData ? "Here's what's happening with your players today." : "Welcome to Coach AIQ. Add your first player to get started."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-gray-500" style={{ fontSize: "12px", fontWeight: 500 }}>{stat.label}</p>
              <p className="text-gray-900 mt-0.5" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</p>
              <p className="text-gray-400 mt-1" style={{ fontSize: "11px", fontWeight: 500 }}>{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Session Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Session Activity</h3>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>Completed sessions per month</p>
            </div>
          </div>
          {sessionTrendData.every((d) => d.sessions === 0) ? (
            <div className="flex flex-col items-center justify-center h-44 text-center">
              <TrendingUp className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-gray-400" style={{ fontSize: "13px" }}>No session data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={sessionTrendData}>
                <defs>
                  <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2.5} fill="url(#sessionGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Programs breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h3 className="text-gray-900">Programs</h3>
            <p className="text-gray-400" style={{ fontSize: "12px" }}>Players per program</p>
          </div>
          {programData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-center">
              <BarChart2 className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-gray-400" style={{ fontSize: "13px" }}>No program data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={programData} layout="vertical" margin={{ left: -10 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} width={110} />
                <Tooltip contentStyle={{ border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                <Bar dataKey="students" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Upcoming Sessions</h3>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>Scheduled appointments</p>
            </div>
            <button onClick={() => navigate("/sessions")} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {nextSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-gray-400" style={{ fontSize: "13px" }}>No upcoming sessions</p>
              <button onClick={() => navigate("/sessions")} className="mt-2 text-indigo-600 hover:underline" style={{ fontSize: "12px" }}>Schedule one →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {nextSessions.map((session) => (
                <div key={session.id} onClick={() => navigate(`/sessions/${session.id}`)} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{getStudentAvatar(session.studentId)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{getStudentName(session.studentId)}</p>
                    <p className="text-gray-500 truncate" style={{ fontSize: "12px" }}>{session.topic}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-indigo-600" style={{ fontSize: "12px", fontWeight: 600 }}>{formatDate(session.date, session.time)}</p>
                    <p className="text-gray-400" style={{ fontSize: "11px" }}>{session.time} · {session.duration}m</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Player Spotlight */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Player Spotlight</h3>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>Most active players</p>
            </div>
            <button onClick={() => navigate("/students")} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
              All players <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {students.filter((s) => s.status === "active").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-gray-400" style={{ fontSize: "13px" }}>No active players yet</p>
              <button onClick={() => navigate("/students")} className="mt-2 text-indigo-600 hover:underline" style={{ fontSize: "12px" }}>Add a player →</button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {students
                  .filter((s) => s.status === "active")
                  .sort((a, b) => b.totalSessions - a.totalSessions)
                  .slice(0, 4)
                  .map((student, idx) => {
                    const avgGoalProgress = student.goals.length > 0
                      ? Math.round(student.goals.reduce((acc, g) => acc + g.progress, 0) / student.goals.length)
                      : 0;
                    return (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/students/${student.id}`)}>
                        <div className="w-5 h-5 flex items-center justify-center">
                          {idx === 0 ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : <span className="text-gray-400" style={{ fontSize: "12px", fontWeight: 600 }}>#{idx + 1}</span>}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{student.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{student.name}</p>
                          <p className="text-gray-400" style={{ fontSize: "11px" }}>{student.program}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${avgGoalProgress}%` }} />
                            </div>
                            <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 600 }}>{avgGoalProgress}%</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 justify-end">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400" style={{ fontSize: "11px" }}>{student.totalSessions} sessions</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {recentSessions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-500 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>RECENTLY COMPLETED</p>
                  <div className="space-y-2">
                    {recentSessions.slice(0, 2).map((session) => (
                      <div key={session.id} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-700 truncate" style={{ fontSize: "12px" }}>
                          <span style={{ fontWeight: 600 }}>{getStudentName(session.studentId)}</span>
                          {" – "}{session.topic}
                        </span>
                        <span className="text-gray-400 ml-auto flex-shrink-0" style={{ fontSize: "11px" }}>{formatDate(session.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
