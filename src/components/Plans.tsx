import { company } from "@/config/company";
import { usd } from "@/lib/money";
import { Reveal } from "@/components/Reveal";

const CADENCE_LABEL: Record<string, string> = {
  "one-time": "one-time fee",
  deposit: "deposit · 100% credited",
  "flat-rate": "flat rate · one bill",
};

export function Plans() {
  return (
    <section id="pricing" className="bg-paper-2 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mb-12 text-center">
          <p className="overline-label text-accent-deep">Real plans, real checkouts</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Pay online. Start the job.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-steel">
            Every button below is a live Whop checkout — card, Apple Pay, Google Pay, plus
            Klarna / Splitit / Afterpay for approved buyers. No account, no phone tag.
          </p>
        </Reveal>

        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {company.plans.map((p, i) => (
            <Reveal key={p.key} delay={i * 100} as="div" className="h-full">
              <div
                className={`relative flex h-full flex-col border-2 border-ink p-6 transition-transform lift ${
                  p.featured ? "bg-ink text-cream shadow-[8px_8px_0_0_var(--color-accent)]" : "bg-cream"
                }`}
              >
                {p.badge && (
                  <span
                    className={`absolute -top-3.5 left-5 border-2 border-ink px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-widest ${
                      p.featured ? "bg-accent text-cream" : "bg-cream text-ink"
                    }`}
                  >
                    {p.badge}
                  </span>
                )}

                <p className={`overline-label ${p.featured ? "text-accent" : "text-accent-deep"}`}>
                  {CADENCE_LABEL[p.cadence]}
                </p>
                <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-tight tracking-wide">
                  {p.name}
                </h3>

                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-extrabold tabular-nums">
                    {usd(p.priceUsd)}
                  </span>
                </p>
                <p className={`mt-1 text-sm font-medium ${p.featured ? "text-steel-2" : "text-steel"}`}>
                  {p.tagline}
                </p>

                <ul className="mt-5 flex-1 space-y-2">
                  {p.includes.map((inc) => (
                    <li
                      key={inc}
                      className={`flex items-start gap-2.5 text-[13px] leading-snug ${
                        p.featured ? "text-cream/85" : "text-ink-2"
                      }`}
                    >
                      <svg viewBox="0 0 12 12" className={`mt-0.5 h-3 w-3 shrink-0 ${p.featured ? "text-accent" : "text-accent-deep"}`} fill="currentColor" aria-hidden="true">
                        <path d="M1 6.2 4.4 9.6 11 2.6l-1.5-1.4L4.4 6.7 2.5 4.8z" />
                      </svg>
                      {inc}
                    </li>
                  ))}
                </ul>

                {p.saveCard && (
                  <p className={`mt-4 border-l-4 border-accent p-2.5 text-xs leading-snug ${p.featured ? "bg-ink-3 text-cream/85" : "bg-paper-2 text-ink-2"}`}>
                    <strong>Card on file:</strong> your card is stored through Whop (setup
                    intent) so the final balance bills automatically at completion — or you
                    can pay by link instead.
                  </p>
                )}

                <a
                  href={`/checkout/${p.slug}`}
                  className={`btn-press mt-6 w-full px-5 py-3.5 text-sm ${p.featured ? "btn-accent" : "btn-ink"}`}
                >
                  Checkout with Whop
                </a>
                <p className={`mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${p.featured ? "text-steel-2" : "text-steel"}`}>
                  <svg viewBox="0 0 14 14" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                    <path d="M7 1 3 3v4c0 2.6 1.7 4.5 4 6 2.3-1.5 4-3.4 4-6V3L7 1zm0 2.2 2 1.1v2.9c0 1.5-.8 2.8-2 3.9-1.2-1.1-2-2.4-2-3.9V4.3l2-1.1z" />
                  </svg>
                  Card · Apple Pay · Google Pay · Klarna · Splitit · Afterpay
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-wider text-steel">
          <span>256-bit encrypted via Whop</span>
          <span className="text-accent-deep">◆</span>
          <span>PCI handled by Whop — we never see card numbers</span>
          <span className="text-accent-deep">◆</span>
          <span>Refunds issued back through the same payment</span>
        </Reveal>
      </div>
    </section>
  );
}
