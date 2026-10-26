import { company } from "@/config/company";
import { Reveal } from "@/components/Reveal";

export function ServiceArea() {
  const { intro, coreCities, cities, note } = company.serviceArea;

  return (
    <section id="area" className="bg-paper-2 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="overline-label text-accent-deep">Where we work</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
            {company.serviceRegion},<br /> front porch to front porch
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-2/80">{intro}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {coreCities.map((c) => (
              <span
                key={c}
                className="border-2 border-ink bg-accent px-3 py-1.5 font-display text-sm font-bold uppercase tracking-wider text-cream shadow-hard-sm"
              >
                {c} · core
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={company.phoneHref} className="btn-press btn-ink px-5 py-3 text-sm">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M3.7 1.2c.5-.5 1.3-.4 1.7.2l1.2 1.9c.3.5.2 1.1-.2 1.5l-.8.7c.6 1.3 1.7 2.4 3 3l.7-.8c.4-.4 1-.5 1.5-.2l1.9 1.2c.6.4.7 1.2.2 1.7l-.9.9c-.5.5-1.3.7-2 .4-2-.8-3.8-2.2-5.2-4-.8-1-1.5-2.2-2-3.4-.3-.7 0-1.5.5-2l.6-.9z" />
              </svg>
              {company.phone}
            </a>
            <p className="text-xs font-medium uppercase tracking-wider text-steel">{note}</p>
          </div>
        </Reveal>

        {/* coverage board */}
        <Reveal delay={120}>
          <div className="relative border-2 border-ink bg-ink p-6 shadow-[8px_8px_0_0_var(--color-accent)] sm:p-8">
            <p className="overline-label text-cream/60">Coverage map · 2026</p>
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {cities.map((c) => {
                const core = coreCities.includes(c);
                return (
                  <div
                    key={c}
                    className={`relative border-2 px-2 py-3 text-center font-display text-sm font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5 ${
                      core ? "border-accent bg-accent/15 text-cream" : "border-cream/20 bg-ink-2 text-steel-2"
                    }`}
                  >
                    {core && (
                      <span className="pulse-dot absolute right-1.5 top-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent text-accent" />
                    )}
                    {c}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-4 border-t border-cream/10 pt-4 text-[11px] uppercase tracking-wider text-steel-2">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 border-2 border-accent bg-accent/15" /> Same-week
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 border-2 border-cream/20 bg-ink-2" /> Scheduled
              </span>
              <span className="ml-auto">{cities.length} communities</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
