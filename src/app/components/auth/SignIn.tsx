import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
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
    } catch {
      setError("Invalid email or password. Please try again.");
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
              tabindex="-1"
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

      <br></br>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400" style={{ fontSize: "12px" }}>or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Back to sign in */}
        <Link
          to="/sign-in"
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
          style={{ fontSize: "14px" }}
        >
          <Link className="w-4 h-4" /> Sign in with Google
        </Link>
      
    </div>
  );
}
