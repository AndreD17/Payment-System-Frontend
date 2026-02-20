import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { FiCheckCircle, FiLoader, FiExternalLink, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { api } from "../api";

type Receipt = {
  status?: string | null;
  invoiceStatus?: string | null;

  subscriptionId?: number | string | null;
  stripeSubscriptionId?: string | null;

  stripeInvoiceId?: string | null;
  paymentIntentId?: string | null;
  chargeId?: string | null;

  hostedInvoiceUrl?: string | null;

  amountPaid?: number | null; // cents
  amountDue?: number | null; // cents
  currency?: string | null;

  currentPeriodEnd?: string | number | null; // ISO string or ms/seconds
  periodEnd?: string | number | null; // fallback
};

function formatMoney(cents: number | null | undefined, currency?: string | null) {
  if (typeof cents !== "number") return "—";
  const cur = (currency || "usd").toUpperCase();
  const value = cents / 100;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
    }).format(value);
  } catch {
    // fallback if currency code isn't supported by Intl in some env
    return `${value.toFixed(2)} ${cur}`;
  }
}

function toDateString(input: any) {
  if (!input) return "—";

  // If your backend sends timestamptz string, new Date(iso) is fine
  // If it sends seconds, convert
  if (typeof input === "number") {
    // heuristics: seconds vs ms
    const ms = input < 10_000_000_000 ? input * 1000 : input;
    return new Date(ms).toLocaleString();
  }

  const d = new Date(String(input));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function badge(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s.includes("paid") || s.includes("succeed") || s === "active") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }
  if (s.includes("incomplete") || s.includes("open") || s.includes("pending")) {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  if (s.includes("fail") || s.includes("void") || s.includes("unpaid")) {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }
  return "border-white/10 bg-white/5 text-white/80";
}

export default function Success() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const sessionId = params.get("session_id");

  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchReceipt() {
    if (!sessionId) {
      setError("Missing session id");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.get(`/api/public/receipt/${sessionId}`);
      setReceipt(res.data);
    } catch (e: any) {
      setReceipt(null);
      setError(e?.response?.data?.error || "Payment confirmation still processing. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const normalized = useMemo(() => {
    const r = receipt || {};
    const status = r.status ?? r.invoiceStatus ?? "paid";
    const periodEnd = r.currentPeriodEnd ?? r.periodEnd ?? null;

    return {
      status,
      subscriptionId: r.subscriptionId ?? "—",
      periodEnd,
      amountPaid: r.amountPaid ?? null,
      amountDue: r.amountDue ?? null,
      currency: r.currency ?? "usd",
      hostedInvoiceUrl: r.hostedInvoiceUrl ?? null,
      stripeInvoiceId: r.stripeInvoiceId ?? null,
      paymentIntentId: r.paymentIntentId ?? null,
      chargeId: r.chargeId ?? null,
    };
  }, [receipt]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-300/15 border border-emerald-300/25 flex items-center justify-center">
              {loading ? (
                <FiLoader className="animate-spin text-emerald-200" />
              ) : (
                <FiCheckCircle className="text-emerald-200" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Payment Receipt</h2>
              <p className="text-sm text-white/60">
                {loading ? "Confirming payment…" : "Your transaction has been recorded."}
              </p>
            </div>
          </div>

          <div
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-extrabold ${badge(normalized.status)}`}
            title="Current payment status"
          >
            {(normalized.status || "paid").toString().toUpperCase()}
          </div>
        </div>

        {/* Body */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
          {loading ? (
            <div className="flex items-center gap-3 text-white/80">
              <FiLoader className="animate-spin" />
              <span>Fetching receipt details…</span>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                {error}
              </div>

              <button
                onClick={fetchReceipt}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold border border-amber-300/25 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15"
              >
                <FiRefreshCw /> Try again
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Totals */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white/60">Amount Paid</p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {formatMoney(normalized.amountPaid, normalized.currency)}
                  </p>
                  {typeof normalized.amountDue === "number" && normalized.amountDue !== normalized.amountPaid ? (
                    <p className="mt-1 text-xs text-white/60">
                      Amount due: {formatMoney(normalized.amountDue, normalized.currency)}
                    </p>
                  ) : null}
                </div>

                <div className="text-sm text-white/70 space-y-1">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-white/60">Subscription ID</span>
                    <span className="font-bold">{normalized.subscriptionId}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-white/60">Valid until</span>
                    <span className="font-bold">{toDateString(normalized.periodEnd)}</span>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-bold text-white/60">Invoice</p>
                  <p className="mt-1 font-mono text-xs break-all">{normalized.stripeInvoiceId || "—"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-bold text-white/60">Payment Intent</p>
                  <p className="mt-1 font-mono text-xs break-all">{normalized.paymentIntentId || "—"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                  <p className="text-xs font-bold text-white/60">Charge</p>
                  <p className="mt-1 font-mono text-xs break-all">{normalized.chargeId || "—"}</p>
                </div>
              </div>

              {/* Invoice link */}
              {normalized.hostedInvoiceUrl ? (
                <a
                  href={normalized.hostedInvoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold border border-emerald-300/25 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/15"
                >
                  View invoice <FiExternalLink />
                </a>
              ) : (
                <div className="text-xs text-white/50">
                  Invoice link is not available yet. If you refresh in a few seconds it may appear.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-xs text-white/40">
          Keep this receipt for your records.
        </div>
      </motion.div>
    </Layout>
  );
}