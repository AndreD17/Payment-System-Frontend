import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api, setAccessToken } from "../api";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("youxyzexample.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      setAccessToken(res.data.accessToken);
      nav("/admin/refund");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6"
      >
        <h2 className="text-xl font-extrabold">Admin Login</h2>

        <div className="mt-5 grid gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            placeholder="admin email"
          />
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            placeholder="password"
          />

          {error ? <div className="text-sm text-rose-300">{error}</div> : null}

          <button
            onClick={login}
            disabled={loading || !email || !password}
            className="rounded-xl px-4 py-3 text-sm font-extrabold border border-emerald-300/25 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/15 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </motion.div>
    </Layout>
  );
}