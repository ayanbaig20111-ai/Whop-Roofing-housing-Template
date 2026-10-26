"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  LIVE Whop Elements checkout.
//
//  · Card tab (non-deposit plans): <Checkout><CheckoutElement/> — the element
//    mints its own checkout session from a server-created checkout
//    configuration (ch_) and completes the payment in-page.
//  · Card tab (deposit plan): <Payments setupFutureUsage="off_session">
//    with <PaymentElement> + <BrandingElement> + a pay button that calls
//    createConfirmationToken() and confirms server-side — the payment
//    vaults the card (card on file) so the final balance can be invoiced.
//  · Express tab: <Checkout><ExpressCheckoutElement/> — one-press
//    Apple Pay / Google Pay.
//  No custom card forms: every card field is a Whop-hosted frame.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { loadWhop } from "@whop/elements";
import {
  WhopElements,
  Checkout,
  CheckoutElement,
  ExpressCheckoutElement,
  Payments,
  PaymentElement,
  BrandingElement,
  usePayments,
} from "@whop/elements-react";
import type { Plan } from "@/config/company";
import { track } from "@/lib/whop/track";
import { usd } from "@/lib/money";

interface Props {
  plan: Plan;
  planId: string; // plan_ id from the environment
  accountId: string; // biz_ id — required by the Payments handle
  environment: "production" | "sandbox";
}

type DoneInfo = { receipt: string; whopPaymentId?: string; savedCard?: boolean };

function PayButton({
  plan,
  busy,
  disabled,
  onClick,
}: {
  plan: Plan;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="btn-press btn-accent w-full px-5 py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy
        ? "Processing…"
        : `${usd(plan.priceUsd)}${plan.saveCard ? " · save card & pay" : " · pay now"}`}
    </button>
  );
}

/** Deposit card tab: PaymentElement + BrandingElement + server-side confirm. */
function DepositCardForm({
  plan,
  onDone,
  onError,
}: {
  plan: Plan;
  onDone: (d: DoneInfo) => void;
  onError: (msg: string) => void;
}) {
  const payments = usePayments();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!payments) {
      onError("Payment module is still loading — try again in a second.");
      return;
    }
    setBusy(true);
    try {
      const { confirmationToken } = await payments.createConfirmationToken({});
      const res = await fetch("/api/whop/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmationToken, planKey: plan.key }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; receipt?: string; whopPaymentId?: string; savedCard?: boolean };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "The payment could not be confirmed.");
      onDone({ receipt: data.receipt ?? "", whopPaymentId: data.whopPaymentId, savedCard: data.savedCard });
    } catch (e) {
      onError(e instanceof Error ? e.message : "Payment failed — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="border-2 border-ink bg-cream p-3">
        <PaymentElement onChange={(e) => setReady(Boolean((e as { complete?: boolean }).complete))} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-steel">
          Card stored via Whop setup · final balance billed at completion
        </p>
        <BrandingElement />
      </div>
      <PayButton plan={plan} busy={busy} disabled={!ready} onClick={() => void pay()} />
    </div>
  );
}

/** Express / one-plan card tab: full Whop checkout element. */
function CheckoutSurface({
  plan,
  configId,
  variant,
  onPayment,
}: {
  plan: Plan;
  configId: string;
  variant: "card" | "express";
  onPayment: (paymentId: string) => void;
}) {
  return (
    <Checkout
      checkoutConfiguration={configId}
      metadata={{ plan_slug: plan.slug, source: "whop-template" }}
      onComplete={(c) => {
        if (c.result === "payment") onPayment(c.paymentId);
      }}
    >
      {variant === "express" ? <ExpressCheckoutElement /> : <CheckoutElement />}
    </Checkout>
  );
}

export function LiveCheckout({ plan, planId, accountId, environment }: Props) {
  const [tab, setTab] = useState<"card" | "express">("card");
  const [configId, setConfigId] = useState<string | null>(null);
  const [configError, setConfigError] = useState("");
  const [sdkError, setSdkError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<DoneInfo | null>(null);
  const [sdk] = useState(() => loadWhop());

  // Server mints a checkout configuration (ch_) carrying our order metadata.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/whop/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ planKey: plan.key }),
        });
        const data = (await res.json()) as { checkoutId?: string; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.checkoutId) throw new Error(data.error ?? "Could not start checkout.");
        setConfigId(data.checkoutId);
      } catch (e) {
        if (!cancelled) setConfigError(e instanceof Error ? e.message : "Checkout unavailable.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plan.key]);

  async function handlePaymentId(paymentId: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/whop/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentId, planKey: plan.key }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; receipt?: string; whopPaymentId?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Payment not confirmed yet.");
      setDone({ receipt: data.receipt ?? "", whopPaymentId: data.whopPaymentId, savedCard: plan.saveCard });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not confirm the payment.");
      setBusy(false);
    }
  }

  if (done) {
    track("checkout_completed", { plan: plan.key, via: "live", payment: done.whopPaymentId ?? null });
    return (
      <div className="border-2 border-ink bg-cream p-6 shadow-hard">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-accent text-cream">✓</span>
          <div>
            <p className="font-display text-2xl font-extrabold uppercase">Payment confirmed</p>
            <p className="text-xs text-steel">
              Receipt {done.receipt || "—"} · {done.whopPaymentId ? `Whop payment ${done.whopPaymentId}` : "processed by Whop"}
            </p>
          </div>
        </div>
        {done.savedCard && (
          <p className="mt-4 border-l-4 border-accent bg-paper-2 p-3 text-xs leading-relaxed">
            Your card is now stored on file with Whop. The final balance will be billed the
            day your project passes city inspection — or you can pay by secure link instead.
          </p>
        )}
        <p className="mt-4 text-sm text-ink-2">
          A confirmation email is on its way. Need to change anything? Call{" "}
          <a className="font-semibold text-accent-deep underline" href="tel:+15125550147">(512) 555-0147</a>.
        </p>
        <a href="/" className="btn-press btn-ink mt-5 w-full px-5 py-3 text-sm">
          Back to home
        </a>
      </div>
    );
  }

  const usePaymentsHandle = tab === "card" && plan.saveCard;
  const needsConfig = !usePaymentsHandle;

  return (
    <div>
      {/* mode tabs */}
      <div className="mb-4 grid grid-cols-2 border-2 border-ink">
        {(
          [
            { id: "card", label: "Card" },
            { id: "express", label: "Apple Pay · Google Pay" },
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

      {sdkError ? (
        <div className="border-2 border-ink bg-cream p-5 text-sm">
          <p className="font-semibold">The Whop Elements script could not load ({sdkError}).</p>
          <p className="mt-1 text-xs text-steel">
            Check that your network allows cdn.whop.com, or retry the page.
          </p>
        </div>
      ) : (
        <WhopElements
          elements={sdk}
          environment={environment}
          appearance={{ theme: { appearance: "light", accentColor: "orange", grayColor: "slate" } }}
          onLoadError={(e) => setSdkError(e.message)}
        >
          {usePaymentsHandle ? (
            <Payments plan={planId} accountId={accountId} setupFutureUsage="off_session">
              <DepositCardForm
                plan={plan}
                onDone={(d) => {
                  setBusy(false);
                  setDone(d);
                }}
                onError={(m) => {
                  setBusy(false);
                  setError(m);
                }}
              />
            </Payments>
          ) : needsConfig ? (
            configError ? (
              <div className="border-2 border-ink bg-cream p-5 text-sm">
                <p className="font-semibold">{configError}</p>
                <p className="mt-1 text-xs text-steel">
                  Check WHOP_API_KEY / WHOP_ACCOUNT_ID and the plan id for this product.
                </p>
              </div>
            ) : configId ? (
              <CheckoutSurface
                plan={plan}
                configId={configId}
                variant={tab === "express" ? "express" : "card"}
                onPayment={(id) => void handlePaymentId(id)}
              />
            ) : (
              <div className="space-y-2 border-2 border-ink bg-cream p-5">
                <div className="h-4 w-3/4 animate-pulse bg-paper-2" />
                <div className="h-4 w-1/2 animate-pulse bg-paper-2" />
                <p className="pt-2 text-xs uppercase tracking-wider text-steel">
                  Starting your Whop checkout…
                </p>
              </div>
            )
          ) : null}
        </WhopElements>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-steel">
        <svg viewBox="0 0 14 14" className="h-3 w-3" fill="currentColor" aria-hidden="true">
          <path d="M7 1 3 3v4c0 2.6 1.7 4.5 4 6 2.3-1.5 4-3.4 4-6V3L7 1zm0 2.2 2 1.1v2.9c0 1.5-.8 2.8-2 3.9-1.2-1.1-2-2.4-2-3.9V4.3l2-1.1z" />
        </svg>
        Secured by Whop · financing shown automatically at checkout
      </p>
    </div>
  );
}
