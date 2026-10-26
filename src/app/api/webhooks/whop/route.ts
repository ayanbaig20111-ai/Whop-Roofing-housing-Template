import { unwrapWebhook } from "@whop/sdk/helpers";
import { whopEnv } from "@/config/whop";
import { findInvoiceByNumber, markInvoice } from "@/lib/invoices";

export const dynamic = "force-dynamic";

interface WhopEvent {
  id: string;
  type: string;
  data: Record<string, unknown> & { id?: string; metadata?: Record<string, string | null> | null };
}

/**
 * Whop webhook receiver. Point the account's webhook at this URL
 * (events: payment.succeeded, payment.failed, setup_intent.succeeded).
 * Signature is verified with WHOP_WEBHOOK_SECRET before anything happens —
 * fulfillment (flipping the local order paid) runs here, not from the
 * browser callback.
 */
export async function POST(req: Request) {
  const secret = whopEnv.webhookSecret;
  if (!secret) {
    return Response.json(
      { ok: false, error: "webhook secret not configured — set WHOP_WEBHOOK_SECRET" },
      { status: 501 },
    );
  }

  const raw = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let event: WhopEvent;
  try {
    event = unwrapWebhook<WhopEvent>(raw, { headers, key: secret });
  } catch {
    return Response.json({ ok: false, error: "bad signature" }, { status: 401 });
  }

  if (event.type === "payment.succeeded" || event.type === "payment.failed") {
    const orderId =
      typeof event.data?.metadata?.order_id === "string" ? event.data.metadata.order_id : null;
    if (orderId) {
      const invoice = await findInvoiceByNumber(orderId);
      if (invoice) {
        await markInvoice(
          invoice.number,
          event.type === "payment.succeeded" ? { status: "paid" } : { status: "failed" },
        );
      }
    }
    console.log(`[webhook] ${event.type} ${event.data?.id ?? ""} order=${orderId ?? "-"}`);
  } else if (event.type === "setup_intent.succeeded") {
    console.log(`[webhook] setup_intent.succeeded ${event.data?.id ?? ""} — card on file confirmed`);
  }

  return Response.json({ received: true });
}
