import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiInfo, FiMail, FiShield, FiZap } from "react-icons/fi";
import Layout from "../components/Layout";
import { api, getAccessToken } from "../api";

type Plan = {
  id: number;
  name: string;
  amount_cents: number;
  currency: string;
  interval: "month" | "year";
  popular?: boolean;
};

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}

export default function Pricing() {
  const [email, setEmail] = useState("test@example.com");
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [billing, setBilling] = useState<"month" | "year">("month");

  const nav = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!getAccessToken();

  const plansAll = useMemo<Plan[]>(
    () => [
      { id: 1, name: "Pro", amount_cents: 1000, currency: "usd", interval: "month", popular: true },
      { id: 2, name: "Pro", amount_cents: 9000, currency: "usd", interval: "year" },
    ],
    []
  );

  const plans = plansAll.filter((p) => p.interval === billing);
  const selectedPlan = plans[0];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function subscribe(planId: number) {
    // ✅ Require login before checkout
    const token = getAccessToken();
    if (!token) {
      alert("Please login to continue checkout.");
      nav("/", { replace: true, state: { from: location.pathname } });
      return;
    }

    setError("");
    setLoading(planId);

    try {
      // ✅ If backend uses req.auth.email, you DON'T need to send userEmail anymore.
      // But keeping it here won't hurt if backend ignores it.
      const res = await api.post("/api/subscriptions/checkout", {
        planId,
        userEmail: email,
      });

      // depending on your backend response naming:
      const url = (res.data.checkoutUrl || res.data.url) as string | undefined;
      if (!url) throw new Error("No checkout URL returned from server");

      window.location.href = url;
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-3xl border border-white/10 bg-white/4 backdrop-blur-xl p-6 sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Choose your plan</h1>
              <p className="mt-2 text-sm sm:text-base text-white/65 leading-relaxed">
                Checkout is PCI-safe via <b className="text-white">Stripe</b>. We confirm payment with{" "}
                <b className="text-white">webhooks</b>, then fulfill through an{" "}
                <b className="text-white">Outbox Worker</b> (idempotent & retry-safe).
              </p>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/4 p-1">
            <button
              onClick={() => setBilling("month")}
              className={cx(
                "rounded-xl px-4 py-2 text-sm font-extrabold transition",
                billing === "month" ? "bg-white text-black" : "text-white/75 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("year")}
              className={cx(
                "rounded-xl px-4 py-2 text-sm font-extrabold transition",
                billing === "year" ? "bg-white text-black" : "text-white/75 hover:text-white"
              )}
            >
              Yearly
            </button>
          </div>

          {/* Plan cards */}
          <div className="mt-5 grid gap-4">
            {plans.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="relative rounded-3xl border border-white/12 bg-white/5 backdrop-blur-xl p-6 overflow-hidden"
              >
                <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                {p.popular ? (
                  <div className="absolute right-6 top-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold text-black">
                    <FiZap /> Most popular
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold">{p.name}</div>
                    <div className="mt-1 text-sm text-white/60">For production-ready billing, webhooks & workers.</div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold">{formatMoney(p.amount_cents, p.currency)}</div>
                    <div className="text-sm text-white/55">per {p.interval}</div>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-white/75">
                  {["Recurring billing", "Webhook-confirmed activation", "Email receipts via worker", "Idempotent fulfillment"].map(
                    (f) => (
                      <li key={f} className="flex items-start gap-2">
                        <FiCheckCircle className="mt-0.5 text-white/55" />
                        <span>{f}</span>
                      </li>
                    )
                  )}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Email */}
          <div className="mt-6">
            <label className="text-xs font-bold text-white/70">Email</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 focus-within:ring-2 focus-within:ring-white/15">
              <FiMail className="text-white/55" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/30"
              />
            </div>
            {!emailValid ? (
              <p className="mt-2 text-xs text-rose-300">Please enter a valid email address.</p>
            ) : (
              <p className="mt-2 text-xs text-white/50">Receipts will be sent to this email after webhook confirmation.</p>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
              <div className="text-xs text-white/55">Security</div>
              <div className="mt-1 text-sm font-extrabold inline-flex items-center gap-2">
                <FiShield /> PCI-safe
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
              <div className="text-xs text-white/55">Reliability</div>
              <div className="mt-1 text-sm font-extrabold inline-flex items-center gap-2">
                <FiInfo /> Webhook confirmed
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
              <div className="text-xs text-white/55">Ops</div>
              <div className="mt-1 text-sm font-extrabold inline-flex items-center gap-2">
                <FiZap /> Worker + retries
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="lg:sticky lg:top-24"
        >
          <div className="rounded-3xl border border-white/10 bg-white/4 backdrop-blur-xl p-6">
            <div className="text-sm font-extrabold text-white/85">Order summary</div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/4 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold">Pro ({billing === "month" ? "Monthly" : "Yearly"})</div>
                  <div className="mt-1 text-xs text-white/60">Billed per {billing}</div>
                </div>
                <div className="text-sm font-extrabold">
                  {selectedPlan ? formatMoney(selectedPlan.amount_cents, selectedPlan.currency) : "--"}
                </div>
              </div>

              <div className="mt-3 border-t border-white/10 pt-3 flex items-center justify-between">
                <div className="text-xs text-white/60">Total due today</div>
                <div className="text-base font-extrabold">
                  {selectedPlan ? formatMoney(selectedPlan.amount_cents, selectedPlan.currency) : "--"}
                </div>
              </div>
            </div>

            <button
              onClick={() => selectedPlan && subscribe(selectedPlan.id)}
              disabled={!emailValid || !selectedPlan || loading === selectedPlan?.id}
              className={cx(
                "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-extrabold transition",
                "bg-white text-black hover:bg-white/90",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {loading === selectedPlan?.id
                ? "Redirecting to Stripe..."
                : isLoggedIn
                  ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      Continue to checkout <FiArrowRight />
                    </span>
                  )
                  : (
                    <span className="inline-flex items-center justify-center gap-2">
                      Login to continue <FiArrowRight />
                    </span>
                  )}
            </button>

            <div className="mt-4 text-xs text-white/55 leading-relaxed">
              By continuing, you agree to our billing terms. Payments are processed securely by Stripe.
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/3 p-4 text-sm text-white/65">
            Tip: after payment, check Mailhog at <b className="text-white">http://localhost:8025</b> (if enabled).
          </div>
        </motion.aside>
      </div>
    </Layout>
  );
}