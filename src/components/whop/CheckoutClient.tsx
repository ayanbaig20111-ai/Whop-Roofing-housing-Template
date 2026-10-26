"use client";

import { useEffect } from "react";
import type { Plan } from "@/config/company";
import type { WhopRuntime } from "@/config/whop";
import { track } from "@/lib/whop/track";
import { LiveCheckout } from "./LiveCheckout";
import { SandboxCheckout } from "./SandboxCheckout";

/**
 * Picks the live Whop Elements checkout when a plan_ id is configured,
 * otherwise the sandbox simulation. Fires the checkout tracking events:
 * checkout_started for every plan, deposit_started for the deposit plan.
 */
export function CheckoutClient({
  plan,
  runtime,
  accountId,
}: {
  plan: Plan;
  runtime: WhopRuntime;
  accountId: string;
}) {
  useEffect(() => {
    track("checkout_started", {
      plan: plan.key,
      amount_usd: plan.priceUsd,
      mode: runtime.planReady ? "live" : "sandbox",
    });
    if (plan.key === "deposit") {
      track("deposit_started", {
        amount_usd: plan.priceUsd,
        card_on_file: true,
      });
    }
  }, [plan.key, plan.priceUsd, runtime.planReady]);

  return runtime.planReady ? (
    <LiveCheckout
      plan={plan}
      planId={runtime.planId}
      accountId={accountId}
      environment={runtime.sandbox ? "sandbox" : "production"}
    />
  ) : (
    <SandboxCheckout plan={plan} />
  );
}
