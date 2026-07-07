import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api, setAccessToken, clearAccessToken, getAccessToken } from "../api";

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

type ApiAlert = {
  type?: "error" | "info" | "success";
  title?: string;
  message?: string;
  field?: "email" | "password" | "username";
};

export default function Home() {
  const nav = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(!!getAccessToken());

  const redirectTo = useMemo(() => {
    const from = (location.state as any)?.from;
    return typeof from === "string" && from.startsWith("/") ? from : "/pricing";
  }, [location.state]);

  function resetNotices() {
    setError("");
    setMsg("");
  }

  function readServerAlert(e: any): ApiAlert | null {
    const a = e?.response?.data?.alert;
    if (a && typeof a === "object") return a as ApiAlert;
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    resetNotices();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "signup") {
      if (!username) {
        setError("Username is required for signup.");
        return;
      }
      if (username.length < 3 || username.length > 20) {
        setError("Username must be between 3 and 20 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError("Username can only contain letters, numbers, and underscore.");
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = mode === "login" ? { email, password } : { username, email, password };

      const res = await api.post(endpoint, payload);

      const token = res.data?.accessToken as string | undefined;
      if (!token) throw new Error("No access token returned from server.");

      setAccessToken(token);

      setLoggedIn(true);
      const serverAlert: ApiAlert | undefined = res.data?.alert;
      setMsg(
        serverAlert?.message ||
          (mode === "login" ? "Logged in successfully." : "Account created successfully.")
      );

      nav(redirectTo, { replace: true });
    } catch (e: any) {
      const status = e?.response?.status as number | undefined;
      const serverMsg = e?.response?.data?.message;
      const alert = readServerAlert(e);

      if (alert?.message) {
        setError(alert.message);
        if (mode === "login" && status === 404) setMode("signup");
        return;
      }

      if (mode === "login" && status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (mode === "signup" && status === 409) {
        setError(serverMsg || "Account already exists or username already taken.");
      } else {
        setError(serverMsg || e?.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    resetNotices();
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
              onClick={() => {
                setMode("login");
                resetNotices();
              }}
              className={cx(
                "rounded-xl px-4 py-2 text-sm font-extrabold transition",
                mode === "login" ? "bg-white text-black" : "text-white/75 hover:text-white"
              )}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                resetNotices();
              }}
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
            {/* ✅ SIGNUP ORDER: Username -> Email -> Password */}
            {mode === "signup" ? (
              <div>
                <label className="text-xs font-bold text-white/70">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                  placeholder="e.g. andred17"
                  disabled={loading || loggedIn}
                  autoComplete="username"
                />
                <p className="mt-2 text-xs text-white/50">
                  Letters, numbers, underscore. 3–20 chars.
                </p>
              </div>
            ) : null}

            <div>
              <label className="text-xs font-bold text-white/70">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                placeholder="you@example.com"
                disabled={loading || loggedIn}
                autoComplete="email"
              />
            </div>

            <div>
              <div className="relative">
   <label className="text-xs font-bold text-white/70">Password</label>
        <input
          value={password}
          type={showPassword ? "text" : "password"}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-sm text-white outline-none"
          placeholder="••••••••"
          disabled={loading || loggedIn}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9 text-white/60 hover:text-white text-sm"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
     {mode === "login" && (
      <div className="mt-2 text-right">
        <button
          type="button"
          onClick={() => nav("/forgot-password")}
          className="text-xs text-white/60 hover:text-white underline"
        >
          Forgot password?
        </button>
      </div>
      )}  </div>
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
                disabled={loading || !email || !password || (mode === "signup" && !username)}
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