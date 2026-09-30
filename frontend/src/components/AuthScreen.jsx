import { useState } from "react";
import { login, register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password);
      signIn(result);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-display text-3xl tracking-tight">ResumeIQ</p>
          <p className="mt-2 text-sm text-parchment/60">
            Compare your resume to the role before you apply.
          </p>
        </div>

        <div className="paper-shadow rounded-sm bg-parchment p-8">
          <div className="mb-6 flex gap-6 border-b border-parchment-text/10 pb-4 text-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`font-medium transition-colors ${
                isLogin ? "text-parchment-text" : "text-parchment-text/40 hover:text-parchment-text/70"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`font-medium transition-colors ${
                !isLogin ? "text-parchment-text" : "text-parchment-text/40 hover:text-parchment-text/70"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-parchment-text/60 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-parchment-text/15 bg-white/40 px-3 py-2 text-sm text-parchment-text outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-parchment-text/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-parchment-text/15 bg-white/40 px-3 py-2 text-sm text-parchment-text outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
                placeholder="At least 8 characters"
              />
            </div>

            {error && (
              <p className="text-sm text-clay-light bg-clay-bg/50 border border-clay/30 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-brass py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brass-light disabled:opacity-60"
            >
              {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
