import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../lib/supabase";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Check } from "lucide-react";

const PROGRAMS = [
  "Life Coaching",
  "Career Development",
  "Executive Coaching",
  "Health & Wellness",
  "Mindfulness",
  "Leadership",
  "Business Strategy",
  "Other",
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-amber-400", "bg-emerald-400"];
  const labels = ["Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${i < strength ? colors[strength - 1] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <div key={c.label} className={`flex items-center gap-1 ${c.ok ? "text-emerald-600" : "text-gray-400"}`}>
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${c.ok ? "bg-emerald-100" : "bg-gray-100"}`}>
                {c.ok && <Check className="w-2 h-2" />}
              </div>
              <span style={{ fontSize: "10px" }}>{c.label}</span>
            </div>
          ))}
        </div>
        {strength > 0 && (
          <span className={`${strength === 3 ? "text-emerald-600" : strength === 2 ? "text-amber-600" : "text-red-500"}`} style={{ fontSize: "11px", fontWeight: 600 }}>
            {labels[strength - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    program: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.agreeToTerms) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signUp(form.name, form.email, form.password);
      navigate("/");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-gray-900" style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Start coaching with AI help
        </h1>
        <p className="text-gray-500 mt-1.5" style={{ fontSize: "15px" }}>
          Create your free Coach AIQ account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-gray-700 mb-1.5" style={{ fontSize: "14px" }}>Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith"
              autoComplete="name"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder-gray-300"
              style={{ fontSize: "14px" }}
            />
          </div>
        </div>

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

        {/* Coaching specialty */}
        {/* Not Needed }
        <div>
          <label className="block text-gray-700 mb-1.5" style={{ fontSize: "14px" }}>
            Coaching specialty <span className="text-gray-400" style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <select
            value={form.program}
            onChange={(e) => setForm({ ...form, program: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all appearance-none cursor-pointer text-gray-600"
            style={{ fontSize: "14px" }}
          >
            <option value="">Select your specialty...</option>
            {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {*/}

        {/* Password */}
        <div>
          <label className="block text-gray-700 mb-1.5" style={{ fontSize: "14px" }}>Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a strong password"
              autoComplete="new-password"
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
          <PasswordStrength password={form.password} />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setForm({ ...form, agreeToTerms: !form.agreeToTerms })}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              form.agreeToTerms ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
            }`}
          >
            {form.agreeToTerms && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <p className="text-gray-500" style={{ fontSize: "13px", lineHeight: 1.6 }}>
            I agree to CoachSpace's{" "}
            <span className="text-indigo-600 cursor-pointer hover:text-indigo-700">Terms of Service</span>
            {" "}and{" "}
            <span className="text-indigo-600 cursor-pointer hover:text-indigo-700">Privacy Policy</span>
          </p>
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
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl transition-colors shadow-sm shadow-indigo-200"
          style={{ fontSize: "15px" }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
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
        Sign up with Google
      </button>

      {/* Sign in link */}
      <p className="text-center text-gray-500 mt-6" style={{ fontSize: "14px" }}>
        Already have an account?{" "}
        <Link to="/sign-in" className="text-indigo-600 hover:text-indigo-700 transition-colors" style={{ fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
