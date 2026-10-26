"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  SANDBOX checkout — a faithful simulation of the Whop Elements surface
//  (ExpressCheckoutElement, PaymentElement, BrandingElement) used when the
//  template runs without live Whop credentials. Completes end-to-end:
//  charge → card on file (deposit) → invoice in the owner dashboard.
//
//  With WHOP_* env vars set, this component is never mounted — the real
//  Whop Elements take its place. No custom card data ever reaches the server
//  in live mode (Whop-hosted frames only); here, last4 + brand are simulated.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import type { Plan } from "@/config/company";
import { track } from "@/lib/whop/track";
import { usd } from "@/lib/money";

type Method = "card" | "apple_pay" | "google_pay" | "klarna" | "splitit" | "afterpay";

const FINANCING: { id: Method; label: string; detail: string }[] = [
  { id: "klarna", label: "Klarna", detail: "4 interest-free" },
  { id: "splitit", label: "Splitit", detail: "up to 12 mo" },
  { id: "afterpay", label: "Afterpay", detail: "pay in 4" },
];

function WhopBranding() {
  return (
    <div className="flex items-center justify-center gap-2 pt-1">
      <span className="text-[11px] uppercase tracking-wider text-steel">Powered by</span>
      <span className="font-display text-base font-extrabold tracking-tight text-ink">
        whop<span className="text-accent">.</span>
      </span>
      <a
        href="https://whop.com"
        target="_blank"
        rel="noreferrer"
        className="text-[10px] uppercase tracking-wider text-steel underline hover:text-accent-deep"
      >
        Terms & Privacy
      </a>
    </div>
  );
}

export function SandboxCheckout({ plan }: { plan: Plan }) {
  const [tab, setTab] = useState<"card" | "express">("card");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saveCard, setSaveCard] = useState(plan.saveCard);
  const [busy, setBusy] = useState<Method | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ receipt: string; method: Method; last4: string; savedCard: boolean } | null>(null);

  const digits = number.replace(/\D/g, "");
  const cardValid =
    digits.length >= 15 &&
    /^\d{2}\/\d{2}$/.test(exp) &&
    cvc.length >= 3 &&
    name.trim().length > 1;

  async function complete(method: Method, last4: string) {
    setBusy(method);
    setError("");
    await new Promise((r) => setTimeout(r, 1300)); // simulate Whop processing
    try {
      const res = await fetch("/api/sandbox/charge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          planKey: plan.key,
          method,
          last4,
          customer: { name: name.trim() || "Walk-in buyer", email },
          saveCard: plan.saveCard ? saveCard : false,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; receipt?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Sandbox charge failed.");
      setDone({ receipt: data.receipt ?? "", method, last4, savedCard: plan.saveCard && saveCard });
      track("checkout_completed", { plan: plan.key, via: "sandbox", method, receipt: data.receipt });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sandbox charge failed.");
      setBusy(null);
    }
  }

  if (done) {
    return (
      <div className="border-2 border-ink bg-cream p-6 shadow-hard">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-accent text-lg text-cream">✓</span>
          <div>
            <p className="font-display text-2xl font-extrabold uppercase">Payment confirmed</p>
            <p className="text-xs text-steel">
              Sandbox receipt {done.receipt} · {usd(plan.priceUsd)} via{" "}
              {done.method.replace("_", " ")} ·••• {done.last4}
            </p>
          </div>
        </div>
        {done.savedCard && (
          <p className="mt-4 border-l-4 border-accent bg-paper-2 p-3 text-xs leading-relaxed">
            <strong>Card on file saved.</strong> In production this is a Whop setup intent —
            the final balance will be billed to this card at completion, or you can pay by
            secure link.
          </p>
        )}
        <div className="mt-4 border-2 border-line bg-paper-2 p-3 text-xs leading-relaxed text-ink-2">
          <strong>What happens next:</strong> a confirmation email goes out, the job lands in
          your owner dashboard, and (for deposits) the final-balance invoice is one click away.
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <a href="/dashboard" className="btn-press btn-ink px-4 py-3 text-xs">
            View in dashboard
          </a>
          <a href="/" className="btn-press btn-cream px-4 py-3 text-xs">
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 border-2 border-dashed border-accent bg-accent/10 px-3 py-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink">
          Sandbox mode — Whop Elements simulation. Set WHOP_* env vars to go live.
        </p>
      </div>

      {/* mode tabs */}
      <div className="mb-4 grid grid-cols-2 border-2 border-ink">
        {(
          [
            { id: "card", label: "Card" },
            { id: "express", label: "Express" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 font-display text-sm font-bold uppercase tracking-wider transition-colors ${
              tab === t.id ? "bg-ink text-cream" : "bg-cream text-ink hover:bg-paper-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-3 border-2 border-accent-deep bg-accent/10 p-3 text-sm">
          {error}
        </p>
      )}

      {tab === "express" ? (
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void complete("apple_pay", "4242")}
            className="flex h-12 w-full items-center justify-center gap-2 border-2 border-ink bg-ink text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M11.6 8.6c0-1.5 1.2-2.2 1.3-2.3-.7-1-1.8-1.1-2.2-1.1-1-.1-1.9.5-2.3.5-.5 0-1.2-.5-2-.5-1 0-2 .6-2.5 1.6-1.1 2-.3 5 .8 6.6.5.8 1.2 1.7 2 1.6.8 0 1.1-.5 2-.5s1.2.5 2 .5c.9 0 1.4-.8 2-1.6.3-.5.6-1 .8-1.6-.1 0-1.9-.7-1.9-2.7zM10 4c.4-.6.7-1.3.6-2.1-.6 0-1.4.4-1.9 1-.4.5-.7 1.2-.6 2 .7.1 1.4-.3 1.9-.9z" />
            </svg>
            <span className="font-display text-lg font-semibold tracking-wide">Pay</span>
            {busy === "apple_pay" && <span className="text-xs uppercase">processing…</span>}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void complete("google_pay", "4242")}
            className="flex h-12 w-full items-center justify-center gap-2 border-2 border-ink bg-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.4 24 12 24z" />
              <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.1z" />
              <path fill="#EA4335" d="M12 4.7c1.8 0 3.3.6 4.6 1.8L20 3.1C18 1.2 15.2 0 12 0 7.4 0 3.3 2.7 1.3 6.6l4 3.1c.9-2.9 3.6-5 6.7-5z" />
            </svg>
            <span className="font-display text-lg font-semibold tracking-wide">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span> Pay
            </span>
            {busy === "google_pay" && <span className="text-xs uppercase">processing…</span>}
          </button>
          <p className="pt-1 text-center text-[11px] uppercase tracking-wider text-steel">
            One press — the wallet collects whatever Whop needs
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-2 border-ink bg-cream p-3">
            <label className="block">
              <span className="mb-1 block font-display text-[11px] font-bold uppercase tracking-widest text-steel">
                Card number
              </span>
              <input
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={number}
                onChange={(e) =>
                  setNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
                  )
                }
                className="w-full border-2 border-line bg-paper px-3 py-2.5 font-mono text-sm outline-none focus:border-accent"
              />
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block font-display text-[11px] font-bold uppercase tracking-widest text-steel">
                  Expiry
                </span>
                <input
                  placeholder="12/28"
                  value={exp}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                  }}
                  className="w-full border-2 border-line bg-paper px-3 py-2.5 font-mono text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-display text-[11px] font-bold uppercase tracking-widest text-steel">
                  Security code
                </span>
                <input
                  inputMode="numeric"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full border-2 border-line bg-paper px-3 py-2.5 font-mono text-sm outline-none focus:border-accent"
                />
              </label>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-steel-2">
              Test card: 4242 4242 4242 4242 · any future expiry
            </p>
          </div>

          <div className="grid gap-2">
            <input
              placeholder="Name on card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
            <input
              type="email"
              placeholder="you@example.com (for your receipt)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          {plan.saveCard && (
            <label className="flex cursor-pointer items-start gap-3 border-2 border-ink bg-paper-2 p-3">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#f2591d]"
              />
              <span className="text-xs leading-relaxed">
                <strong>Save my card for the final balance</strong> (card on file via Whop).
                You can also pay the final invoice by secure link — your choice at billing
                time.
              </span>
            </label>
          )}

          <button
            type="button"
            disabled={!cardValid || busy !== null}
            onClick={() => void complete("card", digits.slice(-4) || "4242")}
            className="btn-press btn-accent w-full px-5 py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "card" ? "Processing…" : `Pay ${usd(plan.priceUsd)}`}
          </button>
        </div>
      )}

      {/* financing rail — surfaces automatically with Whop for approved buyers */}
      <div className="mt-5 border-t-2 border-line pt-4">
        <p className="mb-2 text-center text-[11px] uppercase tracking-wider text-steel">
          or split it with
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FINANCING.map((f) => (
            <button
              key={f.id}
              type="button"
              disabled={busy !== null}
              onClick={() => void complete(f.id, "0000")}
              className="border-2 border-ink bg-cream px-2 py-2.5 text-center transition-all hover:-translate-y-0.5 hover:bg-paper-2 disabled:opacity-60"
            >
              <span className="block font-display text-base font-bold uppercase tracking-wide">{f.label}</span>
              <span className="block text-[10px] uppercase tracking-wider text-steel">{f.detail}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t-2 border-line">
        <WhopBranding />
      </div>
    </div>
  );
}
