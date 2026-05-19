import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  TrendingUp,
  Settings,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Bell,
  Search,
  LogOut,
  MessageSquare,
  Dumbbell,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Players", path: "/students" },
  { icon: CalendarDays, label: "Sessions", path: "/sessions" },
  { icon: Dumbbell, label: "Drills", path: "/drills" },
  { icon: TrendingUp, label: "Progress", path: "/progress" },
  { icon: MessageSquare, label: "Messages", path: "/chat" },
];

const caiItems = [
  { icon: Sparkles, label: "Chat w Cai", path: "/kai" },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate("/sign-in");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontWeight: 700, fontSize: "15px" }}>Coach AIQ</p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>Coach's helping space.</p>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-gray-400 uppercase tracking-wider" style={{ fontSize: "10px", fontWeight: 600 }}>
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}
                />
                <span style={{ fontSize: "14px", fontWeight: active ? 600 : 500 }}>{item.label}</span>
                {active && (
                  <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />
                )}
              </button>
            );
          })}

          {/* CAI section */}
          <div className="pt-4">
            <p className="px-3 mb-2 text-gray-400 uppercase tracking-wider" style={{ fontSize: "10px", fontWeight: 600 }}>
              CAI
            </p>
            {caiItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  <span style={{ fontSize: "14px", fontWeight: active ? 600 : 500 }}>{item.label}</span>
                  {active && (
                    <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4">
            <p className="px-3 mb-2 text-gray-400 uppercase tracking-wider" style={{ fontSize: "10px", fontWeight: 600 }}>
              Account
            </p>
            <button
              onClick={() => { navigate("/settings"); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive("/settings")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Settings className={`w-5 h-5 flex-shrink-0 ${isActive("/settings") ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`} />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Settings</span>
            </button>
          </div>
        </nav>

        {/* Coach profile */}
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white" style={{ fontSize: "13px", fontWeight: 700 }}>
                  {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "LE"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{user?.name || "Coach"}</p>
              <p className="text-gray-400 truncate" style={{ fontSize: "11px" }}>{user?.email || ""}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players, sessions..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              style={{ fontSize: "14px" }}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white" style={{ fontSize: "12px", fontWeight: 700 }}>
                  {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "LE"}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}