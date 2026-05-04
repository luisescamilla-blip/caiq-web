import { createBrowserRouter } from "react-router";
import { AuthLayout } from "./components/auth/AuthLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SignIn } from "./components/auth/SignIn";
import { SignUp } from "./components/auth/SignUp";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Students } from "./components/Students";
import { StudentDetail } from "./components/StudentDetail";
import { Sessions } from "./components/Sessions";
import { SessionDetail } from "./components/SessionDetail";
import { Progress } from "./components/Progress";
import { Settings } from "./components/Settings";
import { Chat } from "./components/Chat";
import { CaiChat } from "./components/CaiChat";
import { Drills } from "./components/Drills";
import { DrillDetail } from "./components/DrillDetail";
import { RouteError } from "./components/ErrorBoundary";

export const router = createBrowserRouter([
  // Auth routes
  {
    Component: AuthLayout,
    children: [
      { path: "/sign-in", Component: SignIn },
      { path: "/sign-up", Component: SignUp },
      { path: "/forgot-password", Component: ForgotPassword },
    ],
  },
  // Protected app routes
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: Layout,
        ErrorBoundary: RouteError,
        children: [
          { index: true, Component: Dashboard, ErrorBoundary: RouteError },
          { path: "students", Component: Students, ErrorBoundary: RouteError },
          { path: "students/:id", Component: StudentDetail, ErrorBoundary: RouteError },
          { path: "sessions", Component: Sessions, ErrorBoundary: RouteError },
          { path: "sessions/:id", Component: SessionDetail, ErrorBoundary: RouteError },
          { path: "progress", Component: Progress, ErrorBoundary: RouteError },
          { path: "settings", Component: Settings, ErrorBoundary: RouteError },
          { path: "chat", Component: Chat, ErrorBoundary: RouteError },
          { path: "kai", Component: CaiChat, ErrorBoundary: RouteError },
          { path: "drills", Component: Drills, ErrorBoundary: RouteError },
          { path: "drills/:id", Component: DrillDetail, ErrorBoundary: RouteError },
        ],
      },
    ],
  },
]);