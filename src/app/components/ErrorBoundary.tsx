import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "Something went wrong" };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-gray-900 mb-2" style={{ fontSize: "18px", fontWeight: 700 }}>
              Something went wrong
            </h2>
            <p className="text-gray-500 mb-6" style={{ fontSize: "13px" }}>
              {this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors mx-auto"
              style={{ fontSize: "14px" }}
            >
              <RefreshCw className="w-4 h-4" /> Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route-level error element (used by react-router errorElement)
export function RouteError() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-gray-900 mb-2" style={{ fontSize: "18px", fontWeight: 700 }}>Page Error</h2>
      <p className="text-gray-500 mb-4" style={{ fontSize: "13px" }}>This page ran into a problem.</p>
      <button
        onClick={() => window.history.back()}
        className="text-indigo-600 hover:underline"
        style={{ fontSize: "14px" }}
      >
        ← Go back
      </button>
    </div>
  );
}
