import { useState } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiRefreshCw, FiLock, FiLogOut } from "react-icons/fi";
import Layout from "../components/Layout";
import { api, setAccessToken, clearAccessToken } from "../api";

export default function AdminRefund() {
  const [email, setEmail] = useState("Damilaresam96@gmail.com");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  async function login() {
    setError("");
    setAuthLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      setAccessToken(res.data.accessToken);
      setLoggedIn(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    setError("");
    setAuthLoading(true);
    try {
      // refresh_token cookie will be sent because api has withCredentials: true
      await api.post("/api/auth/logout");

      // clear client token
      clearAccessToken();

      // reset UI state
      setLoggedIn(false);
      setPassword("");
      setPaymentIntentId("");
      setAmount("");
      setResult(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Logout failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function refund() {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const payload: any = { paymentIntentId };
      if (amount) payload.amount = Number(amount);

      const res = await api.post("/api/admin/refund", payload);
      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Refund failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold tracking-tight">Admin Refund</h2>

          {loggedIn ? (
            <button
              onClick={logout}
              disabled={authLoading}
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition border border-sky-300/25 bg-sky-300/10 text-sky-100 hover:bg-sky-300/15 disabled:opacity-60"
              title="Logout"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <FiLogOut />
                {authLoading ? "Logging out..." : "Logout"}
              </span>
            </button>
          ) : null}
        </div>

        {!loggedIn ? (
          <div className="mt-5 grid gap-3">
            <div>
              <label className="text-xs font-bold text-white/70">Admin Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70">Password</label>
              <input
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200 flex gap-2">
                <FiAlertTriangle className="mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              onClick={login}
              disabled={authLoading || !email || !password}
              className="w-full rounded-xl px-4 py-3 text-sm font-extrabold transition border border-emerald-300/25 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/15 disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <FiLock />
                {authLoading ? "Logging in..." : "Login"}
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            <div>
              <label className="text-xs font-bold text-white/70">PaymentIntent ID</label>
              <input
                value={paymentIntentId}
                onChange={(e) => setPaymentIntentId(e.target.value)}
                placeholder="pi_..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70">Amount (cents) optional</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="leave empty for full refund"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200 flex gap-2">
                <FiAlertTriangle className="mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              onClick={refund}
              disabled={loading || !paymentIntentId}
              className="w-full rounded-xl px-4 py-3 text-sm font-extrabold transition border border-amber-300/25 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <FiRefreshCw />
                {loading ? "Processing refund..." : "Refund"}
              </span>
            </button>

            {result ? (
              <pre className="rounded-xl border border-white/10 bg-black/25 p-4 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : null}
          </div>
        )}
      </motion.div>
    </Layout>
  );
}