import { planByKey } from "@/config/company";
import { whopEnv, whopConfigured } from "@/config/whop";
import { whopClient } from "@/lib/whop/client";
import { createLocalInvoice } from "@/lib/invoices";

export const dynamic = "force-dynamic";

/**
 * Mints a Whop checkout configuration (ch_) for a plan. The server owns the
 * plan id and the order number (metadata.order_id), so the browser can never
 * assert an amount. The CheckoutElement / ExpressCheckoutElement then open a
 * checkout session from this configuration.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { planKey?: string };
    const plan = planByKey((body.planKey ?? "inspection") as "inspection" | "deposit" | "storm");
    const planId = whopEnv.planIds[plan.key] || whopConfigured() && process.env[plan.envPlanId];
    if (!whopConfigured()) {
      return Response.json({ ok: false, error: "Whop is not configured on this environment." }, { status: 503 });
    }
    if (!planId) {
      return Response.json({ ok: false, error: `Missing ${plan.envPlanId} for plan ${plan.key}.` }, { status: 503 });
    }

    // Local order of record first, so the payment maps back to a sale.
    const order = await createLocalInvoice({
      customerName: "Online buyer",
      email: "",
      planLabel: plan.name,
      amountCents: Math.round(plan.priceUsd * 100),
      collectionMethod: "checkout",
      status: "draft",
      note: "Awaiting payment via Whop Elements",
    });

    const created = await whopClient().checkoutConfigurations.create({
      account_id: whopEnv.accountId,
      plan_id: planId,
      mode: "payment",
      currency: "usd",
      metadata: {
        order_id: order.number,
        plan_slug: plan.slug,
        source: "roofing-template",
      },
    });

    return Response.json({ ok: true, checkoutId: created.id, orderId: order.number });
  } catch (e) {
    console.error("[whop/checkout]", e);
    const msg = e instanceof Error ? e.message : "Could not start checkout.";
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
