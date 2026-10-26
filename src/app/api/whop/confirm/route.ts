import { planByKey } from "@/config/company";
import { whopEnv, whopConfigured } from "@/config/whop";
import { whopClient } from "@/lib/whop/client";
import { createLocalInvoice, recordPaymentMethod } from "@/lib/invoices";

export const dynamic = "force-dynamic";

interface ConfirmResult {
  id: string;
  substatus?: string | null;
  status?: string | null;
  metadata?: Record<string, string | null> | null;
  payment_method?: unknown;
  [k: string]: unknown;
}

/**
 * Server-side confirmation of a confirmation token minted by the Payment
 * Elements (deposit plan, setupFutureUsage: "off_session"). Whop charges the
 * payment and — because the buyer attested save consent — vaults the card as
 * a stored payment method (card on file) for the final-balance invoice.
 */
export async function POST(req: Request) {
  if (!whopConfigured()) {
    return Response.json({ ok: false, error: "Whop is not configured." }, { status: 503 });
  }
  try {
    const body = (await req.json()) as { confirmationToken?: string; planKey?: string };
    const token = (body.confirmationToken ?? "").trim();
    if (!token.startsWith("ctok_") && !token.startsWith("ct_")) {
      return Response.json({ ok: false, error: "invalid_token" }, { status: 400 });
    }
    const plan = planByKey((body.planKey ?? "deposit") as "inspection" | "deposit" | "storm");

    const createPayment = whopClient().payments.create as unknown as (
      r: unknown,
    ) => Promise<ConfirmResult>;
    const payment = await createPayment({
      confirmation_token: token,
      account_id: whopEnv.accountId,
      metadata: { plan_slug: plan.slug, source: "roofing-template:deposit" },
    });

    const succeeded = payment.substatus === "succeeded" || payment.status === "succeeded";
    const pending = !succeeded && !payment.substatus?.startsWith("failed") && payment.substatus !== "canceled";

    let receipt = "";
    let savedCard = false;
    if (succeeded) {
      const invoice = await createLocalInvoice({
        customerName: "Online buyer",
        email: "",
        planLabel: plan.name,
        amountCents: Math.round(plan.priceUsd * 100),
        collectionMethod: "checkout",
        status: "paid",
        whopInvoiceId: payment.id,
      });
      receipt = invoice.number;

      if (plan.saveCard) {
        savedCard = true;
        const pm = payment.payment_method as Record<string, unknown> | string | null;
        await recordPaymentMethod({
          customerName: "Online buyer",
          email: "",
          brand: typeof pm === "object" && pm && typeof pm.brand === "string" ? pm.brand : "card",
          last4: typeof pm === "object" && pm && typeof pm.last4 === "string" ? pm.last4 : "••••",
          source: "whop",
          whopPaymentMethodId:
            typeof pm === "string"
              ? pm
              : typeof pm === "object" && pm && typeof pm.id === "string"
                ? pm.id
                : null,
        });
      }
    }

    if (pending) {
      return Response.json({ ok: true, pending: true, receipt: "", whopPaymentId: payment.id });
    }
    if (!succeeded) {
      return Response.json({ ok: false, error: "Payment was declined or canceled." }, { status: 402 });
    }

    return Response.json({ ok: true, receipt, savedCard, whopPaymentId: payment.id });
  } catch (e) {
    console.error("[whop/confirm]", e);
    return Response.json({ ok: false, error: "confirm_failed" }, { status: 500 });
  }
}
