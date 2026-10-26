import { whopClient, whopServerReady } from "@/lib/whop/client";
import { findInvoiceByNumber, markInvoice, recordPaymentMethod } from "@/lib/invoices";

export const dynamic = "force-dynamic";

/**
 * Server-side confirmation for payments completed inside the CheckoutElement /
 * ExpressCheckoutElement: fetches the payment by pay_ id, checks `substatus`
 * (succeeded only ever appears on substatus), then flips the local order to
 * paid. 202 = payment is real but not readable yet — the client polls.
 */
export async function POST(req: Request) {
  if (!whopServerReady()) {
    return Response.json({ ok: false, error: "Whop is not configured." }, { status: 503 });
  }
  try {
    const body = (await req.json()) as { paymentId?: string };
    if (!body.paymentId?.startsWith("pay_")) {
      return Response.json({ ok: false, error: "missing_payment" }, { status: 400 });
    }

    let payment: {
      id: string;
      substatus?: string | null;
      status?: string | null;
      metadata?: Record<string, string | null> | null;
      payment_method?: unknown;
    };
    try {
      payment = (await whopClient().payments.retrieve({ id: body.paymentId })) as never;
    } catch {
      return Response.json({ ok: false, pending: true, error: "not_readable_yet" }, { status: 202 });
    }

    if (payment.substatus === "failed" || payment.substatus === "canceled") {
      return Response.json({ ok: false, error: "payment_failed" }, { status: 400 });
    }
    if (payment.substatus !== "succeeded") {
      return Response.json({ ok: false, pending: true, error: "not_paid_yet" }, { status: 202 });
    }

    const orderId = payment.metadata?.order_id ?? null;
    let receipt = body.paymentId;
    if (orderId) {
      const invoice = await findInvoiceByNumber(orderId);
      if (invoice) {
        await markInvoice(invoice.number, { status: "paid", whopInvoiceId: payment.id });
        receipt = invoice.number;
        if (invoice.customerName && String(invoice.customerName) !== "Online buyer") {
          // deposit paid with a known customer → keep card on file
          await recordPaymentMethod({
            customerName: invoice.customerName,
            email: invoice.email,
            brand: "card",
            last4: "••••",
            source: "whop",
            whopPaymentMethodId: extractPmId(payment.payment_method),
          });
        }
      }
    }

    return Response.json({ ok: true, receipt, whopPaymentId: payment.id });
  } catch (e) {
    console.error("[whop/verify]", e);
    return Response.json({ ok: false, error: "verification_failed" }, { status: 500 });
  }
}

function extractPmId(pm: unknown): string | null {
  if (typeof pm === "string") return pm.startsWith("pmt_") || pm.startsWith("payt_") ? pm : null;
  if (pm && typeof pm === "object") {
    const o = pm as Record<string, unknown>;
    if (typeof o.id === "string") return o.id;
  }
  return null;
}
