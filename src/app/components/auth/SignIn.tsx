import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../lib/supabase";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signIn(form.email, form.password);
      navigate("/");
    } catch (err: any) {
      setError(err?.message ?? "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setForm({ email: "luis@coahaiq.com", password: "demo1234" });
    setError("");
    setLoading(true);
    try {
      await signIn("luis@coahaiq.com", "demo1234");
      navigate("/");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-gray-900" style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Welcome back
        </h1>
        <p className="text-gray-500 mt-1.5" style={{ fontSize: "15px" }}>
          Sign in to your Coach AIQ account
        </p>
      </div>

      {/* Demo banner */}
      {/* Not Needed }
      <button
        type="button"
        onClick={handleDemoLogin}
        className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200 transition-colors"
        style={{ fontSize: "14px", fontWeight: 500 }}
      >
        <span>✨</span> Try demo account — instant access
      </button>

      { Not Needed */}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-gray-700 mb-1.5" style={{ fontSize: "14px" }}>Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder-gray-300"
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5 ">
            <label className="text-gray-700" style={{ fontSize: "14px" }}>Password</label>
            <Link 
              tabIndex={-1}
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
              style={{ fontSize: "13px" }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder-gray-300"
              style={{ fontSize: "14px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              rememberMe ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
            }`}
          >
            {rememberMe && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-gray-600" style={{ fontSize: "14px" }}>Remember me</span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl" style={{ fontSize: "13px" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl transition-colors shadow-sm shadow-indigo-200 mt-2"
          style={{ fontSize: "15px" }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-gray-500 mt-6" style={{ fontSize: "14px" }}>
        Don't have an account?{" "}
        <Link to="/sign-up" className="text-indigo-600 hover:text-indigo-700 transition-colors" style={{ fontWeight: 600 }}>
          Create one free
        </Link>
      </p>

      <div className="flex items-center gap-3 mt-6 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400" style={{ fontSize: "12px" }}>or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })}
        className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 transition-colors shadow-sm"
        style={{ fontSize: "14px", fontWeight: 500 }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36.5 24 36.5c-5.2 0-9.6-3.4-11.3-8.1l-6.6 5.1C9.5 39.5 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
        Sign in with Google
      </button>
      
    </div>
  );
}
