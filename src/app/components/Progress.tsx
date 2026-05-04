import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const AVATAR_COLORS = [
  /* Keeping the color theme purple
  "from-indigo-400 to-purple-500",
  "from-blue-400 to-cyan-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",*/
  "from-violet-400 to-indigo-500",
];

const GOAL_STATUS_COLORS = {
  "completed": "#10b981",
  "in-progress": "#6366f1",
  "not-started": "#d1d5db",
};

export function Progress() {
  const navigate = useNavigate();
  const { students, sessions } = useApp();

  const activeStudents = students.filter((s) => s.status === "active");

  const allGoals = students.flatMap((s) => s.goals);
  const completedGoals = allGoals.filter((g) => g.status === "completed");
  const inProgressGoals = allGoals.filter((g) => g.status === "in-progress");
  const notStartedGoals = allGoals.filter((g) => g.status === "not-started");

  const goalStatusData = [
    { name: "Completed", value: completedGoals.length, fill: "#10b981" },
    { name: "In Progress", value: inProgressGoals.length, fill: "#6366f1" },
    { name: "Not Started", value: notStartedGoals.length, fill: "#e5e7eb" },
  ];

  const completionRate = allGoals.length > 0
    ? Math.round((completedGoals.length / allGoals.length) * 100)
    : 0;

  const studentProgressData = activeStudents.map((s) => {
    const avg = s.goals.length > 0
      ? Math.round(s.goals.reduce((acc, g) => acc + g.progress, 0) / s.goals.length)
      : 0;
    return {
      name: s.name.split(" ")[0],
      progress: avg,
      sessions: s.totalSessions,
    };
  });

  const getAvatarColor = (id: string) =>
    AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-gray-900">Progress Overview</h1>
        <p className="text-gray-500 mt-0.5" style={{ fontSize: "14px" }}>
          Track player progress and goal completion across all programs.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Goals", value: allGoals.length, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Completed", value: completedGoals.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "In Progress", value: inProgressGoals.length, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-gray-900" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</p>
              <p className="text-gray-500 mt-0.5" style={{ fontSize: "12px", fontWeight: 500 }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Goal breakdown donut */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-full mb-2">
            <h3 className="text-gray-900">Goal Breakdown</h3>
            <p className="text-gray-400" style={{ fontSize: "12px" }}>Distribution by status</p>
          </div>
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="50%" outerRadius="90%" data={goalStatusData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} />
                <Tooltip
                  contentStyle={{ border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#111827" }}>{completionRate}%</p>
                <p style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 500 }}>done</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            {goalStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-gray-600" style={{ fontSize: "12px" }}>{item.name}</span>
                </div>
                <span className="text-gray-900" style={{ fontSize: "12px", fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Player progress bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h3 className="text-gray-900">Player Goal Progress</h3>
            <p className="text-gray-400" style={{ fontSize: "12px" }}>Average goal completion per player</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={studentProgressData} margin={{ bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }}
                formatter={(value) => [`${value}%`, "Progress"]}
              />
              <Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-player progress cards */}
      <div>
        <h2 className="text-gray-900 mb-4">Individual Progress</h2>
        <div className="space-y-3">
          {students
            .filter((s) => s.status === "active" && s.goals.length > 0)
            .sort((a, b) => {
              const avgA = a.goals.reduce((acc, g) => acc + g.progress, 0) / a.goals.length;
              const avgB = b.goals.reduce((acc, g) => acc + g.progress, 0) / b.goals.length;
              return avgB - avgA;
            })
            .map((student) => {
              const avgProgress = Math.round(
                student.goals.reduce((acc, g) => acc + g.progress, 0) / student.goals.length
              );
              const completedCount = student.goals.filter((g) => g.status === "completed").length;
              const studentSessions = sessions.filter((s) => s.studentId === student.id && s.status === "completed").length;

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(student.id)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white" style={{ fontSize: "14px", fontWeight: 700 }}>{student.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-gray-900" style={{ fontSize: "14px", fontWeight: 600 }}>{student.name}</p>
                          <p className="text-gray-400" style={{ fontSize: "12px" }}>{student.program}</p>
                        </div>
                        <div className="text-right flex-shrink-0 mr-2">
                          <p className="text-gray-900" style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1 }}>{avgProgress}%</p>
                          <p className="text-gray-400" style={{ fontSize: "11px" }}>avg progress</p>
                        </div>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${avgProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-gray-500" style={{ fontSize: "11px" }}>{completedCount}/{student.goals.length} goals done</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500" style={{ fontSize: "11px" }}>{studentSessions} sessions</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                  </div>

                  {/* Goal pills */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {student.goals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: GOAL_STATUS_COLORS[goal.status] }}
                        />
                        <span className="text-gray-600 truncate max-w-[160px]" style={{ fontSize: "11px" }}>{goal.title}</span>
                        <span className="text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>{goal.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
