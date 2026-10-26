"use client";

import { useEffect, useState } from "react";
import { company } from "@/config/company";

const NAV = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "How it works" },
  { href: "#area", label: "Service area" },
  { href: "#financing", label: "Financing" },
  { href: "#reviews", label: "Reviews" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function RoofMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="6" fill="#f2591d" />
      <path d="M8 20 L20 8 L32 20" fill="none" stroke="#faf8f3" strokeWidth="3.4" strokeLinecap="square" />
      <path d="M13 19.5 V30 H27 V19.5" fill="none" stroke="#faf8f3" strokeWidth="3.4" />
      <path d="M17.5 30 V23 H22.5 V30" fill="none" stroke="#0e1826" strokeWidth="2.6" />
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* utility bar */}
      <div className="bg-ink text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-[11px] tracking-wide sm:px-6">
          <p className="hidden items-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {company.license}
          </p>
          <p className="text-cream/70">
            {company.hours} · <span className="text-cream">24/7 storm line</span>
          </p>
          <a href={company.phoneHref} className="flex items-center gap-1.5 font-semibold hover:text-accent">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
              <path d="M3.7 1.2c.5-.5 1.3-.4 1.7.2l1.2 1.9c.3.5.2 1.1-.2 1.5l-.8.7c.6 1.3 1.7 2.4 3 3l.7-.8c.4-.4 1-.5 1.5-.2l1.9 1.2c.6.4.7 1.2.2 1.7l-.9.9c-.5.5-1.3.7-2 .4-2-.8-3.8-2.2-5.2-4-.8-1-1.5-2.2-2-3.4-.3-.7 0-1.5.5-2l.6-.9z" />
            </svg>
            {company.phone}
          </a>
        </div>
      </div>

      {/* main nav */}
      <div
        className={`border-b-2 border-ink bg-paper transition-shadow ${
          scrolled ? "shadow-[0_4px_0_0_rgba(14,24,38,0.12)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/" className="group flex items-center gap-2.5">
            <RoofMark className="h-9 w-9 transition-transform group-hover:-rotate-6" />
            <span className="leading-none">
              <span className="block font-display text-xl font-800 font-bold uppercase tracking-wide">
                {company.shortName}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-steel">
                Roofing Co.
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="font-display text-sm font-semibold uppercase tracking-wider text-ink-2 transition-colors hover:text-accent"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/checkout/roof-inspection-149"
              className="btn-press btn-accent hidden px-4 py-2 text-sm md:inline-flex"
            >
              Book inspection
              <span className="rounded-sm bg-ink px-1.5 py-0.5 text-[11px] text-cream">$149</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center border-2 border-ink lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <div className="space-y-1.5">
                <span className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
                <span className={`block h-0.5 w-5 bg-ink ${open ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t-2 border-ink bg-paper px-4 pb-4 lg:hidden" aria-label="Mobile">
            <ul className="divide-y divide-line">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block py-2.5 font-display text-base font-semibold uppercase tracking-wider"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="/checkout/roof-inspection-149"
              onClick={() => setOpen(false)}
              className="btn-press btn-accent mt-3 flex w-full px-4 py-2.5 text-sm"
            >
              Book inspection — $149
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
