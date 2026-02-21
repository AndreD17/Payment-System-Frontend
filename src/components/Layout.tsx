import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowUpRight, FiCreditCard, FiLock, FiRefreshCw } from "react-icons/fi";

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

function NavLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={cx(
        "rounded-lg px-3 py-2 text-sm font-semibold transition",
        active ? "bg-white/8 text-white" : "text-white/70 hover:text-white hover:bg-white/6"
      )}
    >
      {label}
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-48 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-52 -right-40 h-[720px] w-[720px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      {/* top bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070B14]/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                <FiCreditCard />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold tracking-tight">Payment System</div>
                <div className="truncate text-xs text-white/60">
                  Subscriptions • Webhooks • Outbox Worker • Idempotency
                </div>
              </div>
            </div>

            <div className="mt-3 hidden sm:flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
                <FiRefreshCw /> Webhooks
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
                <FiLock /> PCI-safe
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
                <FiArrowUpRight />
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/pricing" label="Pricing" />
            <NavLink to="/admin/refund" label="Admin" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-10 text-xs text-white/50">
        Built by Damilare Samuel • Stripe Checkout + Webhooks + Postgres
      </footer>
    </div>
  );
}
