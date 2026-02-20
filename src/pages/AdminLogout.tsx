import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { api, clearAccessToken } from "../api";
import { motion } from "framer-motion";

export default function AdminLogout() {
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function logout() {
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/logout");

      clearAccessToken();
      nav("/", { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.message || "Logout failed");
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
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/4 p-6"
      >
        <h2 className="text-xl font-extrabold">Admin Logout</h2>

        <div className="mt-5 grid gap-3">
          {error ? <div className="text-sm text-rose-300">{error}</div> : null}

          <button
            onClick={logout}
            disabled={loading}
            className="rounded-xl px-4 py-3 text-sm font-extrabold border border-emerald-300/25 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/15 disabled:opacity-60"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </motion.div>
    </Layout>
  );
}