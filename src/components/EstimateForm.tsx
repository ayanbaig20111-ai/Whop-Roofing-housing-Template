"use client";

import { useState } from "react";
import { company } from "@/config/company";
import { track } from "@/lib/whop/track";
import { Reveal } from "@/components/Reveal";

type State =
  | { name: "idle" }
  | { name: "sending" }
  | { name: "done"; ref: string }
  | { name: "error"; message: string };

/**
 * "Request an Estimate" — wired to the Whop Leads API.
 * Submissions POST to /api/estimate, which records the lead locally and, when
 * WHOP_API_KEY is configured, creates a lead on the Whop account (visible under
 * the account's Leads). Fires the `estimate_requested` pixel event on success.
 */
export function EstimateForm() {
  const [state, setState] = useState<State>({ name: "idle" });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    zip: "",
    service: company.services[0].name,
    roofSqFt: "",
    details: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      setState({ name: "error", message: "We need your name and a phone number or email to reach you." });
      return;
    }
    setState({ name: "sending" });
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, source: "website:estimate-form" }),
      });
      const data = (await res.json()) as { ok?: boolean; ref?: string; error?: string; whopLeadId?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong");

      track("estimate_requested", {
        service: form.service,
        zip: form.zip,
        lead_ref: data.ref,
        whop_lead: Boolean(data.whopLeadId),
      });
      setState({ name: "done", ref: data.ref ?? `EST-${Date.now().toString(36).toUpperCase()}` });
    } catch (err) {
      setState({ name: "error", message: err instanceof Error ? err.message : "Could not submit — please call us instead." });
    }
  }

  const inputCls =
    "w-full border-2 border-ink bg-cream px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-steel-2 focus:border-accent";
  const labelCls = "mb-1 block font-display text-xs font-bold uppercase tracking-widest text-cream/80";

  return (
    <section id="estimate" className="relative bg-ink py-20 text-cream sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="overline-label text-accent">Request an estimate</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Tell us about the roof.
            <br />
            We'll call within one business hour.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-steel-2">
            Estimate requests land directly in our quote queue — and on our Whop account as a
            lead. A project manager (not a call center) returns every request.
          </p>

          <dl className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <dt className="w-24 shrink-0 font-display text-xs font-bold uppercase tracking-widest text-steel-2">Office</dt>
              <dd><a href={company.phoneHref} className="font-semibold hover:text-accent">{company.phone}</a></dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="w-24 shrink-0 font-display text-xs font-bold uppercase tracking-widest text-steel-2">Storm line 24/7</dt>
              <dd><a href="tel:+15125550199" className="font-semibold text-accent">{company.emergencyPhone}</a></dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="w-24 shrink-0 font-display text-xs font-bold uppercase tracking-widest text-steel-2">Email</dt>
              <dd><a href={`mailto:${company.email}`} className="font-semibold hover:text-accent">{company.email}</a></dd>
            </div>
            <div className="flex items-center gap-4">
              <dt className="w-24 shrink-0 font-display text-xs font-bold uppercase tracking-widest text-steel-2">Shop</dt>
              <dd className="text-steel-2">{company.address}</dd>
            </div>
          </dl>

          <div className="mt-8 border-2 border-cream/15 bg-ink-2 p-4 text-xs leading-relaxed text-steel-2">
            <strong className="text-cream">Prefer to start online?</strong> Book the $149
            complete inspection now — it's credited toward any replacement you book.
            <br />
            <a href="/checkout/roof-inspection-149" className="mt-2 inline-block font-display text-sm font-bold uppercase tracking-widest text-accent hover:underline">
              Book inspection →
            </a>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="border-2 border-cream/20 bg-ink-2 p-6 shadow-[8px_8px_0_0_var(--color-accent)] sm:p-8">
            {state.name === "done" ? (
              <div className="flex h-full flex-col items-start justify-center py-8">
                <span className="border-2 border-accent bg-accent/15 px-3 py-1.5 font-display text-sm font-bold uppercase tracking-widest text-accent">
                  Request received
                </span>
                <h3 className="mt-5 font-display text-3xl font-extrabold uppercase">
                  You're in the queue, {form.name.split(" ")[0]}.
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-steel-2">
                  Reference <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-xs text-accent">{state.ref}</code>{" "}
                  — a project manager will call within one business hour. This request was
                  recorded as a lead on our Whop account and in our CRM.
                </p>
                <a href="/" className="btn-press btn-ghost-dark mt-7 px-5 py-2.5 text-xs">
                  Back to home
                </a>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="est-name" className={labelCls}>Full name *</label>
                  <input id="est-name" className={inputCls} placeholder="Jordan Reyes" value={form.name} onChange={set("name")} />
                </div>
                <div>
                  <label htmlFor="est-phone" className={labelCls}>Phone *</label>
                  <input id="est-phone" type="tel" className={inputCls} placeholder="(512) 555-0100" value={form.phone} onChange={set("phone")} />
                </div>
                <div>
                  <label htmlFor="est-email" className={labelCls}>Email</label>
                  <input id="est-email" type="email" className={inputCls} placeholder="you@example.com" value={form.email} onChange={set("email")} />
                </div>
                <div>
                  <label htmlFor="est-zip" className={labelCls}>ZIP code</label>
                  <input id="est-zip" inputMode="numeric" className={inputCls} placeholder="78745" value={form.zip} onChange={set("zip")} />
                </div>
                <div>
                  <label htmlFor="est-service" className={labelCls}>What do you need?</label>
                  <select id="est-service" className={inputCls} value={form.service} onChange={set("service")}>
                    {company.services.map((s) => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                    <option>Not sure — help me figure it out</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="est-sqft" className={labelCls}>Roof size (approx.)</label>
                  <select id="est-sqft" className={inputCls} value={form.roofSqFt} onChange={set("roofSqFt")}>
                    <option value="">—</option>
                    <option>Under 1,500 sq ft</option>
                    <option>1,500–2,200 sq ft</option>
                    <option>2,200–3,000 sq ft</option>
                    <option>3,000+ sq ft</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="est-details" className={labelCls}>Anything we should know?</label>
                  <textarea id="est-details" rows={3} className={inputCls} placeholder="Leak in the upstairs bedroom after last week's hail…" value={form.details} onChange={set("details")} />
                </div>

                {state.name === "error" && (
                  <p role="alert" className="border-2 border-accent bg-accent/10 p-3 text-sm text-cream sm:col-span-2">
                    {state.message}
                  </p>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={state.name === "sending"}
                    className="btn-press btn-accent w-full px-6 py-4 text-base disabled:opacity-60"
                  >
                    {state.name === "sending" ? "Sending…" : "Request my estimate"}
                  </button>
                  <p className="mt-3 text-center text-[11px] uppercase tracking-wider text-steel-2">
                    No spam, no robocalls. One human callback within the business day.
                  </p>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
