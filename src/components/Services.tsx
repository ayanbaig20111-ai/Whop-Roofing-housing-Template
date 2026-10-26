"use client";

import { useEffect, useRef } from "react";
import { company, type Service } from "@/config/company";
import { Reveal } from "@/components/Reveal";
import { track } from "@/lib/whop/track";

function ServiceCard({ service, large = false }: { service: Service; large?: boolean }) {
  const fired = useRef(false);

  useEffect(() => {
    const el = document.getElementById(`service-${service.id}`);
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fired.current) {
          fired.current = true;
          track("service_viewed", { service_id: service.id, service: service.name });
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [service]);

  const cta =
    service.id === "roof-inspection"
      ? { href: "/checkout/roof-inspection-149", label: "Book & pay online" }
      : { href: "#estimate", label: "Request an estimate" };

  return (
    <article
      id={`service-${service.id}`}
      data-service={service.id}
      onClick={() => track("service_viewed", { service_id: service.id, service: service.name, via: "click" })}
      className={`group relative flex flex-col border-2 border-ink bg-cream transition-shadow lift ${
        large ? "md:col-span-2" : ""
      }`}
    >
      <div className="img-zoom relative border-b-2 border-ink">
        <img
          src={service.image}
          alt={service.name}
          className={`w-full object-cover ${large ? "aspect-[21/10]" : "aspect-[16/10]"}`}
        />
        {service.badge && (
          <span className="absolute left-3 top-3 border-2 border-ink bg-accent px-2 py-1 font-display text-[11px] font-bold uppercase tracking-widest text-cream shadow-hard-sm">
            {service.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              {service.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-steel">{service.tagline}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-2/90">{service.description}</p>

        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {service.includes.map((inc) => (
            <li key={inc} className="flex items-start gap-2 text-[13px] leading-snug">
              <svg viewBox="0 0 12 12" className="mt-0.5 h-3 w-3 shrink-0 text-accent-deep" fill="currentColor" aria-hidden="true">
                <path d="M1 6.2 4.4 9.6 11 2.6l-1.5-1.4L4.4 6.7 2.5 4.8z" />
              </svg>
              {inc}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line pt-4">
          <p className="font-display text-lg font-bold uppercase tracking-wide text-ink">
            {service.priceLabel}
          </p>
          <a
            href={cta.href}
            onClick={(e) => e.stopPropagation()}
            className="btn-press btn-ink px-4 py-2 text-xs"
          >
            {cta.label}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function Services() {
  const [featured, ...rest] = company.services;

  return (
    <section id="services" className="relative bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="overline-label text-accent-deep">What we do</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              Three ways we get on
              <br className="hidden sm:block" /> your roof
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-steel">
            Every job starts with a written scope and a written price. If it's not in the
            paperwork, we don't bill it.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="md:col-span-2" as="div">
            <ServiceCard service={featured} large />
          </Reveal>
          {rest.map((s, i) => (
            <Reveal key={s.id} delay={i * 90} as="div">
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
