import { company } from "@/config/company";
import { Reveal } from "@/components/Reveal";

/**
 * The money flow: inspection fee → deposit (card on file) → build → final invoice.
 * This is the spine of the template and mirrors what happens on Whop.
 */
export function ProcessFlow() {
  return (
    <section id="process" className="roofline-bottom relative bg-ink pb-28 pt-20 text-cream sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mb-12">
          <p className="overline-label text-accent">How the money moves</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Deposit → job → final invoice. No surprises at the end.
          </h2>
        </Reveal>

        <ol className="grid gap-px overflow-hidden border-2 border-cream/15 bg-cream/15 sm:grid-cols-2 lg:grid-cols-4">
          {company.process.map((p, i) => (
            <Reveal key={p.step} delay={i * 110} as="li" className="relative bg-ink p-6 sm:p-7">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-3 right-2 font-display text-[6.5rem] font-extrabold leading-none text-cream/[0.06]"
              >
                {p.step}
              </span>
              <span className="inline-flex border-2 border-accent px-2 py-0.5 font-display text-sm font-bold uppercase tracking-widest text-accent">
                Step {p.step}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-steel-2">{p.body}</p>
              <p className="mt-5 border-t border-cream/10 pt-3 font-mono text-[11px] uppercase tracking-wider text-accent">
                {p.meta}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={200} className="mt-8 flex flex-wrap items-center justify-between gap-4 border-2 border-cream/15 bg-ink-2 p-5">
          <p className="text-sm text-steel-2">
            <strong className="text-cream">Everything above runs on Whop</strong> — fees,
            deposits and final-balance invoices are real Whop payments, with financing (Klarna,
            Splitit, Afterpay) surfacing automatically at checkout.
          </p>
          <a href="#pricing" className="btn-press btn-accent px-5 py-2.5 text-sm">
            See the plans
          </a>
        </Reveal>
      </div>
    </section>
  );
}
