import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    setLoading(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        {/* Success illustration */}
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-gray-900" style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Check your inbox
        </h1>
        <p className="text-gray-500 mt-3" style={{ fontSize: "15px", lineHeight: 1.7 }}>
          We've sent a password reset link to{" "}
          <span className="text-gray-800" style={{ fontWeight: 600 }}>{email}</span>.
          <br />
          The link will expire in 30 minutes.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm shadow-indigo-200"
            style={{ fontSize: "14px" }}
          >
            <Mail className="w-4 h-4" /> Resend email
          </button>

          <Link
            to="/sign-in"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
            style={{ fontSize: "14px" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>

        <p className="text-gray-400 mt-6" style={{ fontSize: "12px" }}>
          Didn't receive it? Check your spam folder or{" "}
          <span
            className="text-indigo-600 cursor-pointer hover:underline"
            onClick={() => { setSent(false); setEmail(""); }}
          >
            try another email
          </span>.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        {/* Icon */}
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
          <Mail className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-gray-900" style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Forgot password?
        </h1>
        <p className="text-gray-500 mt-2" style={{ fontSize: "15px", lineHeight: 1.7 }}>
          No worries! Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-gray-700 mb-1.5" style={{ fontSize: "14px" }}>Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all placeholder-gray-300"
              style={{ fontSize: "14px" }}
            />
          </div>
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
              Send Reset Link
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Back to sign in */}
        <Link
          to="/sign-in"
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
          style={{ fontSize: "14px" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </form>

      {/* Help text */}
      <p className="text-center text-gray-400 mt-6" style={{ fontSize: "13px" }}>
        Don't have an account?{" "}
        <Link to="/sign-up" className="text-indigo-600 hover:text-indigo-700 transition-colors" style={{ fontWeight: 600 }}>
          Sign up free
        </Link>
      </p>
    </div>
  );
}
