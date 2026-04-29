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
import { Progress } from "./components/Progress";
import { Settings } from "./components/Settings";
import { Chat } from "./components/Chat";

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
        children: [
          { index: true, Component: Dashboard },
          { path: "students", Component: Students },
          { path: "students/:id", Component: StudentDetail },
          { path: "sessions", Component: Sessions },
          { path: "progress", Component: Progress },
          { path: "settings", Component: Settings },
          { path: "chat", Component: Chat },
        ],
      },
    ],
  },
]);