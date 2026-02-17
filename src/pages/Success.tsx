import Layout from "../components/Layout";
import { FiCheckCircle, FiArrowUpRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Success() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-2xl rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-black">
            <FiCheckCircle />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold">Payment successful ✅</h2>
            <p className="mt-2 text-sm sm:text-base text-white/75 leading-relaxed">
              Stripe redirected you back here. Your backend will confirm the payment via webhook and fulfill the
              subscription in the worker.
            </p>
            <p className="mt-3 text-sm text-white/70">
              <b className="text-white">Session ID:</b> {sessionId || "N/A"}
            </p>

            <a
              href="/"
              className="mt-4 inline-flex items-center gap-2 font-extrabold text-white hover:opacity-90"
            >
              Go back to Pricing <FiArrowUpRight />
            </a>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
