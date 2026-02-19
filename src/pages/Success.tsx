import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { FiCheckCircle, FiLoader, FiExternalLink } from "react-icons/fi";
import { motion } from "framer-motion";
import  axios from "axios";

export default function Success() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session id");
      setLoading(false);
      return;
    }

    const fetchReceipt = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/subscriptions/receipt/${sessionId}`
        );
        setReceipt(res.data);
      } catch (err: any) {
        setError("Payment confirmation still processing. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [sessionId]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6"
      >
        {loading && (
          <div className="flex items-center gap-3">
            <FiLoader className="animate-spin text-emerald-400" />
            <p>Confirming payment...</p>
          </div>
        )}

        {!loading && error && (
          <p className="text-red-400">{error}</p>
        )}

        {!loading && receipt && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-400 text-black">
                <FiCheckCircle />
              </div>
              <h2 className="text-xl font-bold">
                Payment Successful 🎉
              </h2>
            </div>

            <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
              <p><b>Status:</b> {receipt.status}</p>
              <p><b>Subscription ID:</b> {receipt.subscriptionId}</p>
              <p><b>Stripe Subscription:</b> {receipt.stripeSubscriptionId}</p>
              <p><b>Invoice ID:</b> {receipt.stripeInvoiceId}</p>
              <p><b>Payment Intent:</b> {receipt.paymentIntentId}</p>
              <p>
                <b>Valid Until:</b>{" "}
                {receipt.currentPeriodEnd
                  ? new Date(receipt.currentPeriodEnd).toLocaleString()
                  : "—"}
              </p>
            </div>

            {receipt.stripeInvoiceId && (
              <a
                href={`https://dashboard.stripe.com/test/invoices/${receipt.stripeInvoiceId}`}
                target="_blank"
                className="inline-flex items-center gap-2 font-bold text-emerald-400"
              >
                View Invoice <FiExternalLink />
              </a>
            )}
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
