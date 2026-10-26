"use client";

import { useEffect, useRef, useState } from "react";
import { company } from "@/config/company";

function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        if (reduced) {
          setDisplay(value);
          return;
        }
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(value * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const fmt = (n: number, d: number) => (d > 0 ? n.toFixed(d) : Math.round(n).toLocaleString());

export function Hero() {
  return (
    <section className="roofline-bottom relative overflow-hidden bg-ink pb-24 pt-14 text-cream sm:pt-20">
      {/* faint roof-shingle texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 46px, #faf8f3 46px 48px), repeating-linear-gradient(0deg, transparent 0 22px, #faf8f3 22px 23px)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* copy */}
        <div>
          <p className="overline-label flex items-center gap-2 text-accent">
            <span className="h-px w-8 bg-accent" />
            {company.hero.overline}
          </p>
          <h1 className="mt-4 font-display font-extrabold uppercase leading-[0.95] tracking-tight text-cream">
            <span className="line-mask text-5xl sm:text-7xl lg:text-[5.2rem]">
              <span>{company.hero.titleA}</span>
            </span>
            <span className="line-mask text-5xl text-accent sm:text-7xl lg:text-[5.2rem]">
              <span style={{ ["--line-delay" as never]: "140ms" }}>{company.hero.titleB}</span>
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-steel-2 sm:text-lg">
            {company.hero.sub}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="/checkout/roof-inspection-149" className="btn-press btn-accent px-6 py-3.5 text-base">
              Book inspection — $149
            </a>
            <a href="#estimate" className="btn-press btn-ghost-dark px-6 py-3.5 text-base">
              Get a free estimate
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-cream/15 pt-6 sm:grid-cols-4">
            {company.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-bold text-cream">
                  {s.prefix}
                  <CountUp value={s.value} decimals={s.decimals ?? 0} />
                  {s.suffix}
                </dd>
                <dd className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-steel-2">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* imagery */}
        <div className="relative">
          <div className="img-zoom relative border-2 border-cream/20 shadow-[10px_10px_0_0_rgba(242,89,29,0.9)]">
            <div className="overflow-hidden">
              <img
                src={company.hero.image}
                alt="Newly installed dark shingle roof on a two-story home in Central Texas"
                className="kenburns aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          {/* floating storm-response card */}
          <div className="absolute -bottom-6 -left-4 border-2 border-ink bg-cream px-4 py-3 shadow-hard sm:-left-8">
            <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-ink">
              <span className="pulse-dot relative inline-block h-2.5 w-2.5 rounded-full bg-accent text-accent" />
              Storm crew standing by
            </p>
            <p className="mt-0.5 text-xs text-steel">
              On your roof in <strong className="text-ink">under 90 min</strong> · 24/7 ·{" "}
              <a className="font-semibold text-accent-deep underline" href="tel:+15125550199">
                {company.emergencyPhone}
              </a>
            </p>
          </div>

          {/* warranty stamp */}
          <div className="absolute -right-3 -top-5 rotate-6 border-2 border-ink bg-accent px-3 py-2 shadow-hard-sm sm:-right-5">
            <p className="font-display text-2xl font-extrabold leading-none text-cream">25-YR</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cream/90">
              workmanship
            </p>
          </div>
        </div>
      </div>

      {/* trust ticker */}
      <div className="hazard absolute bottom-[44px] left-0 right-0 h-1.5" aria-hidden="true" />
      <div className="marquee relative border-t-2 border-cream/10 bg-ink-2/70 py-2.5" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {company.trustTicker.map((t) => (
                <span
                  key={`${dup}-${t}`}
                  className="flex items-center gap-3 px-5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-cream/80"
                >
                  {t}
                  <span className="text-accent">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
