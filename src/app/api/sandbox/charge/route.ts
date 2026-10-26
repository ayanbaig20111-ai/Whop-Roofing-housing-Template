import { planByKey } from "@/config/company";
import { createLocalInvoice, recordPaymentMethod } from "@/lib/invoices";

export const dynamic = "force-dynamic";

/**
 * Sandbox charge — completes the end-to-end money flow in environments
 * without live Whop credentials: records the payment method (card on file for
 * deposits) and a PAID invoice, exactly mirroring what Whop webhooks would
 * produce in production.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      planKey?: string;
      method?: string;
      last4?: string;
      customer?: { name?: string; email?: string };
      saveCard?: boolean;
    };

    const plan = planByKey((body.planKey ?? "inspection") as "inspection" | "deposit" | "storm");
    const customerName = (body.customer?.name ?? "Walk-in buyer").slice(0, 120);
    const email = (body.customer?.email ?? "").slice(0, 160);
    const method = (body.method ?? "card").slice(0, 40);
    const saveCard = Boolean(body.saveCard && plan.saveCard);

    let paymentMethodId: number | null = null;
    if (saveCard) {
      const pm = await recordPaymentMethod({
        customerName,
        email,
        brand: method === "apple_pay" || method === "google_pay" ? "wallet" : "card",
        last4: (body.last4 ?? "4242").slice(-4),
        source: "sandbox",
        setupIntentId: "sint_sandbox_" + Date.now().toString(36),
      });
      paymentMethodId = pm.id;
    }

    const invoice = await createLocalInvoice({
      customerName,
      email,
      planLabel: plan.name,
      amountCents: Math.round(plan.priceUsd * 100),
      collectionMethod: "checkout",
      status: "paid",
      paymentMethodId,
      note: `Sandbox ${method} charge`,
    });

    return Response.json({ ok: true, receipt: invoice.number, paymentMethodId });
  } catch (e) {
    console.error("[sandbox/charge]", e);
    return Response.json({ ok: false, error: "sandbox_charge_failed" }, { status: 500 });
  }
}
