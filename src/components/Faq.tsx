import { company } from "@/config/company";
import { Reveal } from "@/components/Reveal";

export function Faq() {
  return (
    <section id="faq" className="bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="mb-10 text-center">
          <p className="overline-label text-accent-deep">Straight answers</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Asked on every job site
          </h2>
        </Reveal>

        <div className="space-y-3">
          {company.faq.map((item, i) => (
            <Reveal key={item.q} delay={i * 60} as="div">
              <details className="group border-2 border-ink bg-cream open:shadow-hard">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-lg font-bold uppercase tracking-wide [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink text-lg transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="border-t-2 border-line px-5 py-4 text-sm leading-relaxed text-ink-2">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
