import { db } from "@/db";
import { invoices, paymentMethods } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";

/** Human-readable invoice number: INV-0007 */
export async function nextInvoiceNumber(): Promise<string> {
  const rows = await db.select({ c: count() }).from(invoices);
  const row = rows[0];
  return `INV-${String((row?.c ?? 0) + 1).padStart(4, "0")}`;
}

export interface NewInvoice {
  customerName: string;
  email: string;
  planLabel: string;
  amountCents: number;
  collectionMethod: "checkout" | "card_on_file" | "manual";
  status: "draft" | "sent" | "paid" | "failed" | "void";
  paymentMethodId?: number | null;
  whopInvoiceId?: string | null;
  note?: string | null;
}

export async function createLocalInvoice(inv: NewInvoice) {
  const number = await nextInvoiceNumber();
  const [row] = await db
    .insert(invoices)
    .values({
      number,
      customerName: inv.customerName,
      email: inv.email,
      planLabel: inv.planLabel,
      amountCents: inv.amountCents,
      status: inv.status,
      collectionMethod: inv.collectionMethod,
      paymentMethodId: inv.paymentMethodId ?? null,
      whopInvoiceId: inv.whopInvoiceId ?? null,
      note: inv.note ?? null,
      paidAt: inv.status === "paid" ? new Date() : null,
    })
    .returning({ id: invoices.id, number: invoices.number });
  return row;
}

export async function recordPaymentMethod(args: {
  customerName: string;
  email: string;
  brand: string;
  last4: string;
  source: "whop" | "sandbox";
  whopPaymentMethodId?: string | null;
  setupIntentId?: string | null;
}) {
  const [pm] = await db
    .insert(paymentMethods)
    .values({
      customerName: args.customerName,
      email: args.email,
      brand: args.brand,
      last4: args.last4,
      source: args.source,
      whopPaymentMethodId: args.whopPaymentMethodId ?? null,
      setupIntentId: args.setupIntentId ?? null,
    })
    .returning({ id: paymentMethods.id });
  return pm;
}

export async function findInvoiceByNumber(number: string) {
  const [row] = await db.select().from(invoices).where(eq(invoices.number, number));
  return row ?? null;
}

export async function markInvoice(number: string, patch: { status: "paid" | "failed"; whopInvoiceId?: string | null }) {
  await db
    .update(invoices)
    .set({
      status: patch.status,
      paidAt: patch.status === "paid" ? new Date() : null,
      ...(patch.whopInvoiceId ? { whopInvoiceId: patch.whopInvoiceId } : {}),
    })
    .where(eq(invoices.number, number));
}

export async function latestPaymentMethodFor(email: string) {
  if (!email) return null;
  const [pm] = await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.email, email), eq(paymentMethods.status, "active")))
    .orderBy(paymentMethods.id)
    .limit(1);
  return pm ?? null;
}
