import { notFound } from "next/navigation";
import Link from "next/link";
import { planBySlug, company } from "@/config/company";
import { whopRuntimeForPlan, whopEnv } from "@/config/whop";
import { usd } from "@/lib/money";
import { CheckoutClient } from "@/components/whop/CheckoutClient";
import { RoofMark } from "@/components/Header";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId: slug } = await params;
  const plan = planBySlug(slug);
  if (!plan) notFound();

  const runtime = whopRuntimeForPlan(plan.key, plan.envPlanId);

  return (
    <main className="min-h-screen bg-paper">
      {/* minimal checkout chrome */}
      <header className="border-b-2 border-ink bg-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <RoofMark className="h-8 w-8" />
            <span className="font-display text-lg font-bold uppercase tracking-wide text-cream">
              {company.shortName}
              <span className="ml-2 text-[10px] font-semibold tracking-[0.25em] text-steel-2">
                Secure checkout
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="font-display text-xs font-bold uppercase tracking-widest text-steel-2 hover:text-accent"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_460px] lg:gap-12 lg:py-14">
        {/* order summary */}
        <div>
          <p className="overline-label text-accent-deep">
            {plan.cadence === "deposit"
              ? "Deposit · locks price & date"
              : plan.cadence === "flat-rate"
                ? "Flat-rate service"
                : "One-time fee"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
            {plan.name}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-2/80">
            {plan.description}
          </p>

          <ul className="mt-6 space-y-2.5">
            {plan.includes.map((inc) => (
              <li key={inc} className="flex items-start gap-3 border-2 border-line bg-cream p-3 text-sm">
                <svg viewBox="0 0 12 12" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-deep" fill="currentColor" aria-hidden="true">
                  <path d="M1 6.2 4.4 9.6 11 2.6l-1.5-1.4L4.4 6.7 2.5 4.8z" />
                </svg>
                {inc}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "25-yr warranty",
                d: "Workmanship warranty on every project we complete.",
              },
              {
                t: "Local crews",
                d: "Fourth-generation Central Texas company. No subbed labor.",
              },
              {
                t: "One price",
                d: "Written before we start. The deposit is 100% credited.",
              },
            ].map((b) => (
              <div key={b.t} className="border-2 border-ink bg-cream p-4">
                <p className="font-display text-base font-bold uppercase tracking-wide">{b.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-steel">{b.d}</p>
              </div>
            ))}
          </div>

          {plan.saveCard && (
            <div className="mt-6 border-2 border-ink bg-ink p-5 text-cream">
              <p className="font-display text-base font-bold uppercase tracking-widest text-accent">
                Why we store your card
              </p>
              <p className="mt-2 text-sm leading-relaxed text-steel-2">
                Roofing is a deposit-first trade: the $500 gets your materials ordered and your
                date locked. Storing your card with Whop (a setup intent, PCI handled by Whop)
                means the final balance bills automatically the day your roof passes city
                inspection — no phone tag, no re-entering card numbers. Prefer to pay manually?
                The invoice emails you a secure link instead. Your call, either way.
              </p>
            </div>
          )}
        </div>

        {/* payment panel */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="border-2 border-ink bg-cream p-5 shadow-hard sm:p-6">
            <div className="flex items-baseline justify-between border-b-2 border-ink pb-4">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-steel">
                Total due today
              </p>
              <p className="font-display text-4xl font-extrabold tabular-nums">
                {usd(plan.priceUsd)}
              </p>
            </div>
            <div className="pt-5">
              <CheckoutClient plan={plan} runtime={runtime} accountId={whopEnv.accountId} />
            </div>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-steel">
              {company.legalName} · {company.license}
              <br />
              Questions? <a href={company.phoneHref} className="font-semibold text-accent-deep underline">{company.phone}</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
