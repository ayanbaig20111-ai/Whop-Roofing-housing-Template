import { company } from "@/config/company";
import { usd } from "@/lib/money";
import { Reveal } from "@/components/Reveal";

export function Financing() {
  const f = company.financing;

  return (
    <section id="financing" className="roofline-bottom relative bg-ink-2 pb-28 pt-20 text-cream sm:pt-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* sticky rail */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="overline-label text-accent">Financing callout</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl">
              {f.headline}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-steel-2">{f.body}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {f.providers.map((p) => (
                <span
                  key={p}
                  className="border-2 border-cream/25 bg-ink px-4 py-2 font-display text-lg font-bold tracking-wide"
                >
                  {p}
                </span>
              ))}
              <span className="flex items-center border-2 border-dashed border-cream/25 px-4 py-2 text-sm text-steel-2">
                + 100 more at checkout
              </span>
            </div>

            <div className="mt-6 border-l-4 border-accent bg-ink p-4">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-accent">
                How it works
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-steel-2">
                Financing options are served by Whop automatically at checkout for approved
                merchants — the buyer picks a plan in the same screen as card, Apple Pay and
                Google Pay. No separate application.
              </p>
            </div>
          </Reveal>
        </div>

        {/* plan table */}
        <div>
          <Reveal delay={80}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel-2">
              Example · {usd(f.exampleTotal)} {f.exampleLabel.toLowerCase()}
            </p>
          </Reveal>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {f.plans.map((p, i) => (
              <Reveal key={p.months} delay={i * 90} as="div">
                <div className="group border-2 border-cream/15 bg-ink p-5 transition-all hover:border-accent hover:bg-ink-3">
                  <div className="flex items-baseline justify-between">
                    <p className="font-display text-5xl font-extrabold tabular-nums">
                      {usd(p.monthly)}
                      <span className="text-lg font-semibold text-steel-2">/mo</span>
                    </p>
                    <p className="font-display text-sm font-bold uppercase tracking-widest text-cream/60">
                      {p.months} mo
                    </p>
                  </div>
                  <div className="mt-3 h-1 w-full bg-cream/10">
                    <div
                      className="h-1 bg-accent transition-all duration-500 group-hover:w-full"
                      style={{ width: `${100 - p.months * 1.5}%` }}
                    />
                  </div>
                  {p.note && (
                    <p className="mt-3 inline-block border border-accent/60 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-accent">
                      {p.note}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} as="div" className="mt-6">
            <ul className="grid gap-2 sm:grid-cols-2">
              {f.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 border border-cream/10 bg-ink p-3 text-sm text-steel-2">
                  <svg viewBox="0 0 12 12" className="mt-0.5 h-3 w-3 shrink-0 text-accent" fill="currentColor" aria-hidden="true">
                    <path d="M1 6.2 4.4 9.6 11 2.6l-1.5-1.4L4.4 6.7 2.5 4.8z" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
            <a href="#pricing" className="btn-press btn-accent mt-6 px-6 py-3 text-sm">
              Start with the $149 inspection
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
