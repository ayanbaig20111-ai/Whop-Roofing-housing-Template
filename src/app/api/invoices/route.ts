import { paymentMethods } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { whopEnv, whopConfigured } from "@/config/whop";
import { whopClient } from "@/lib/whop/client";
import { createLocalInvoice } from "@/lib/invoices";

export const dynamic = "force-dynamic";

/**
 * Bill the FINAL BALANCE of a project — the last step of the money flow.
 *
 *  · collectionMethod "card_on_file": charges the stored method
 *    (Whop Invoices API with collection_method: charge_automatically when
 *    live; simulated instantly for sandbox-stored methods).
 *  · collectionMethod "manual": sends the customer a secure pay link
 *    (Whop Invoices API with collection_method: send_invoice when live).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      paymentMethodId?: number | null;
      collectionMethod?: "card_on_file" | "manual";
      customerName?: string;
      email?: string;
      amountUsd?: number;
      label?: string;
    };

    const amountUsd = Number(body.amountUsd ?? 0);
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return Response.json({ ok: false, error: "invalid_amount" }, { status: 400 });
    }
    const method = body.collectionMethod === "manual" ? "manual" : "card_on_file";
    const customerName = (body.customerName ?? "Customer").slice(0, 120);
    const email = (body.email ?? "").slice(0, 160);
    const label = (body.label ?? "Final balance").slice(0, 160);

    let pm: (typeof paymentMethods.$inferSelect) | null = null;
    if (body.paymentMethodId) {
      const [row] = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.id, body.paymentMethodId));
      pm = row ?? null;
    }

    let whopInvoiceId: string | null = null;
    let status: "sent" | "paid" = "sent";

    const live = whopConfigured();
    if (live && pm?.whopPaymentMethodId && method === "card_on_file") {
      const create = whopClient().invoices.create as unknown as (r: unknown) => Promise<{ id: string }>;
      try {
        const inv = await create({
          account_id: whopEnv.accountId,
          collection_method: "charge_automatically",
          customer_name: customerName,
          email_address: email || null,
          payment_method_id: pm.whopPaymentMethodId,
          product: { title: label },
          plan: { initial_price: amountUsd, currency: "usd" },
          line_items: [{ label, quantity: 1, unit_price: amountUsd }],
        });
        whopInvoiceId = inv.id;
      } catch (e) {
        console.error("[invoices] Whop charge failed:", e);
        return Response.json(
          { ok: false, error: "The stored card charge could not be initiated." },
          { status: 502 },
        );
      }
    } else if (live && method === "manual") {
      const create = whopClient().invoices.create as unknown as (r: unknown) => Promise<{ id: string }>;
      try {
        const inv = await create({
          account_id: whopEnv.accountId,
          collection_method: "send_invoice",
          customer_name: customerName,
          email_address: email || null,
          product: { title: label },
          plan: { initial_price: amountUsd, currency: "usd" },
          line_items: [{ label, quantity: 1, unit_price: amountUsd }],
        });
        whopInvoiceId = inv.id;
      } catch (e) {
        console.error("[invoices] Whop send_invoice failed:", e);
        return Response.json(
          { ok: false, error: "The pay link could not be sent." },
          { status: 502 },
        );
      }
    } else if (!live && pm && method === "card_on_file") {
      // Sandbox: the stored (simulated) card is charged off-session instantly.
      status = "paid";
      whopInvoiceId = "sandbox_off_session_" + Date.now().toString(36);
    }

    const invoice = await createLocalInvoice({
      customerName,
      email,
      planLabel: label,
      amountCents: Math.round(amountUsd * 100),
      collectionMethod: method === "card_on_file" ? "card_on_file" : "manual",
      status,
      paymentMethodId: pm?.id ?? null,
      whopInvoiceId,
      note:
        method === "card_on_file"
          ? "Final balance — stored card (Whop invoice)"
          : "Final balance — secure pay link",
    });

    return Response.json({ ok: true, number: invoice.number, status, whopInvoiceId });
  } catch (e) {
    console.error("[invoices]", e);
    return Response.json({ ok: false, error: "invoice_failed" }, { status: 500 });
  }
}
