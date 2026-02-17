import Layout from "../components/Layout";
import { FiXCircle, FiArrowUpRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Cancel() {
  const params = new URLSearchParams(window.location.search);
  const subId = params.get("sub_id");

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-2xl rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-400 text-black">
            <FiXCircle />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold">Payment cancelled ❌</h2>
            <p className="mt-2 text-sm sm:text-base text-white/75 leading-relaxed">
              If you cancelled checkout, your subscription stays incomplete. You can try again.
            </p>
            <p className="mt-3 text-sm text-white/70">
              <b className="text-white">Local subscription ID:</b> {subId || "N/A"}
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
