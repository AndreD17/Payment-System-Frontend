import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api, setAccessToken, clearAccessToken, getAccessToken } from "../api";

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

export default function Home() {
  const nav = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loggedIn = !!getAccessToken();

  // ✅ where to go after login/signup
  const redirectTo = useMemo(() => {
    const from = (location.state as any)?.from;
    return typeof from === "string" && from.startsWith("/") ? from : "/pricing";
  }, [location.state]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await api.post(endpoint, { email, password });

      const token = res.data?.accessToken as string | undefined;
      if (!token) throw new Error("No access token returned from server.");

      setAccessToken(token);
      setMsg(mode === "login" ? "Logged in successfully." : "Account created successfully.");

      // ✅ go back to where user came from (e.g. /pricing)
      nav(redirectTo, { replace: true });
    } catch (e: any) {
      const status = e?.response?.status;
      const serverMsg = e?.response?.data?.message;

      // ✅ If user doesn't exist / invalid login
      // Depending on your backend, this might be 401 or 404.
      if (mode === "login" && (status === 401 || status === 404)) {
        setError("Account not found (or wrong password). If you’re new here, please sign up.");
        // optional: auto-switch to signup to make flow smoother
        setMode("signup");
      } else {
        setError(serverMsg || e?.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setError("");
    setMsg("");
    setLoading(true);

    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAccessToken();
      setMsg("Logged out.");
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-3xl border border-white/10 bg-white/4 p-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Home</h1>
          <p className="mt-2 text-sm text-white/65">
            Login or signup to continue. After authentication, you’ll be redirected to{" "}
            <b className="text-white">{redirectTo}</b>.
          </p>

          {/* Mode toggle */}
          <div className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/4 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cx(
                "rounded-xl px-4 py-2 text-sm font-extrabold transition",
                mode === "login" ? "bg-white text-black" : "text-white/75 hover:text-white"
              )}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cx(
                "rounded-xl px-4 py-2 text-sm font-extrabold transition",
                mode === "signup" ? "bg-white text-black" : "text-white/75 hover:text-white"
              )}
            >
              Signup
            </button>
          </div>

          {/* Logged-in banner */}
          {loggedIn ? (
            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              You’re already logged in.
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => nav("/pricing")}
                  className="rounded-xl px-4 py-2 text-sm font-extrabold border border-white/10 bg-white text-black hover:bg-white/90"
                >
                  Go to Pricing
                </button>
                <button
                  type="button"
                  onClick={logout}
                  disabled={loading}
                  className="rounded-xl px-4 py-2 text-sm font-extrabold border border-white/10 bg-white/10 text-white hover:bg-white/15 disabled:opacity-60"
                >
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={submit} className="mt-5 grid gap-3">
            <div>
              <label className="text-xs font-bold text-white/70">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                placeholder="you@example.com"
                disabled={loading || loggedIn}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70">Password</label>
              <input
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                placeholder="••••••••"
                disabled={loading || loggedIn}
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            {msg ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                {msg}
              </div>
            ) : null}

            {!loggedIn ? (
              <button
                disabled={loading || !email || !password}
                className="w-full rounded-xl px-4 py-3 text-sm font-extrabold border border-white/10 bg-white text-black hover:bg-white/90 disabled:opacity-60"
              >
                {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
              </button>
            ) : null}
          </form>
        </div>
      </div>
    </Layout>
  );
}