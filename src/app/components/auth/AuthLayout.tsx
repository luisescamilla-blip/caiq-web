import { Outlet } from "react-router";
import { Sparkles } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Coach AIQ changed how I manage my players. I just tell him what to do and that's it!",
    author: "Mike R.",
    role: "MLS Next Coach",
    initials: "MR",
    color: "from-pink-400 to-rose-500",
  },
  {
    quote: "I've doubled my client retention since tracking goals and progress in Coach AIQ.",
    author: "Daniel K.",
    role: "PGA Golf Coach",
    initials: "DK",
    color: "from-indigo-400 to-purple-500",
  },
  {
    quote: "The session scheduling and notes feature saves me hours every single week.",
    author: "Priya M.",
    role: "Soccer Coach",
    initials: "PM",
    color: "from-emerald-400 to-teal-500",
  },
];

const STATS = [
  { value: "2,400+", label: "Coaches" },
  { value: "18k+", label: "Students" },
  { value: "94%", label: "Satisfaction" },
];

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 -right-20 w-64 h-64 bg-purple-500/20 rounded-full" />
          <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative flex flex-col h-full px-10 xl:px-16 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>Coach AIQ</span>
          </div>

          {/* Hero text */}
          <div className="mt-auto mb-8">
            <h1 className="text-white" style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              Your new assistant.<br />So you can just... &nbsp;  coach.
            </h1>
            <p className="text-indigo-200 mt-4" style={{ fontSize: "16px", lineHeight: 1.7, maxWidth: "400px" }}>
              Manage students, track goals, schedule sessions, and measure progress — all done with the help of AI.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-white" style={{ fontSize: "24px", fontWeight: 800 }}>{stat.value}</p>
                  <p className="text-indigo-300" style={{ fontSize: "12px", fontWeight: 500 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4 pb-2">
            <p className="text-indigo-300 uppercase tracking-wider" style={{ fontSize: "11px", fontWeight: 600 }}>
              Trusted by coaches worldwide
            </p>
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
              >
                <p className="text-white/90" style={{ fontSize: "13px", lineHeight: 1.6 }}>"{t.quote}"</p>
                <div className="flex items-center gap-2.5 mt-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white" style={{ fontSize: "10px", fontWeight: 700 }}>{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-white" style={{ fontSize: "12px", fontWeight: 600 }}>{t.author}</p>
                    <p className="text-indigo-300" style={{ fontSize: "11px" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 px-6 pt-6">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-900" style={{ fontSize: "16px", fontWeight: 700 }}>CoachSpace</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
