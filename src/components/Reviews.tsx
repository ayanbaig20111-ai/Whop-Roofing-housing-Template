import { company } from "@/config/company";
import { Reveal } from "@/components/Reveal";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5 text-accent" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i < n ? "" : "opacity-25"}`} fill="currentColor" aria-hidden="true">
          <path d="M10 1.5 12.6 7l6 .6-4.5 4 1.3 5.9L10 14.4l-5.4 3.1L5.9 11.6 1.4 7.6l6-.6z" />
        </svg>
      ))}
    </span>
  );
}

export function Reviews() {
  const s = company.reviewSummary;

  return (
    <section id="reviews" className="bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
          {/* summary */}
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <p className="overline-label text-accent-deep">Word on the street</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              4.9 stars,
              <br /> earned shingle
              <br /> by shingle
            </h2>
            <div className="mt-6 inline-block border-2 border-ink bg-cream p-5 shadow-hard">
              <p className="font-display text-6xl font-extrabold tabular-nums">{s.rating}</p>
              <div className="mt-1"><Stars n={5} /></div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-steel">
                {s.count} {s.source} reviews · verified projects
              </p>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-steel">
              We publish every review we get — including the ones where weather delayed a
              project. The work stands either way.
            </p>
          </Reveal>

          {/* cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {company.reviews.map((r, i) => (
              <Reveal
                key={r.name}
                delay={(i % 2) * 90}
                as="div"
                className={i === 0 ? "sm:col-span-2" : ""}
              >
                <figure
                  className={`lift flex h-full flex-col border-2 border-ink bg-cream p-5 ${
                    i === 0 ? "bg-ink text-cream" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Stars n={r.stars} />
                    <span
                      className={`text-[11px] font-medium uppercase tracking-wider ${
                        i === 0 ? "text-steel-2" : "text-steel"
                      }`}
                    >
                      {r.when}
                    </span>
                  </div>
                  <blockquote
                    className={`mt-3 flex-1 text-[15px] leading-relaxed ${
                      i === 0 ? "text-cream/90" : "text-ink-2"
                    }`}
                  >
                    “{r.text}”
                  </blockquote>
                  <figcaption className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className={`font-display text-base font-bold uppercase tracking-wide ${i === 0 ? "text-cream" : "text-ink"}`}>
                      {r.name}
                      <span className={`ml-2 text-xs font-semibold ${i === 0 ? "text-steel-2" : "text-steel"}`}>
                        {r.area}
                      </span>
                    </span>
                    <span className="hidden font-mono text-[10px] uppercase tracking-wider text-steel-2 sm:block">
                      {r.project}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
