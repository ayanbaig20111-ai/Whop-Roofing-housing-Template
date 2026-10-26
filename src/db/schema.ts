// ─────────────────────────────────────────────────────────────────────────────
//  Database schema — local mirror of the Whop money flow:
//  leads (estimate form) → payment methods (card on file) → invoices
//  (inspection / deposit / final balance) + pixel event log.
// ─────────────────────────────────────────────────────────────────────────────
import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "failed",
  "void",
]);

export const paymentMethodStatusEnum = pgEnum("payment_method_status", [
  "active",
  "revoked",
]);

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  zip: text("zip").notNull().default(""),
  service: text("service").notNull().default(""),
  roofSquareFeet: integer("roof_square_feet"),
  details: text("details").notNull().default(""),
  source: text("source").notNull().default("website"),
  estimatedValueUsd: integer("estimated_value_usd"),
  status: leadStatusEnum("status").notNull().default("new"),
  whopLeadId: text("whop_lead_id"),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull().default(""),
  brand: text("brand").notNull().default("card"),
  last4: text("last4").notNull().default("4242"),
  status: paymentMethodStatusEnum("status").notNull().default("active"),
  /** whop | sandbox */
  source: text("source").notNull().default("sandbox"),
  whopPaymentMethodId: text("whop_payment_method_id"),
  setupIntentId: text("setup_intent_id"),
});

export const invoices = pgTable(
  "invoices",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    number: text("number").notNull(),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull().default(""),
    planLabel: text("plan_label").notNull(),
    amountCents: integer("amount_cents").notNull(),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    /** checkout | card_on_file | manual */
    collectionMethod: text("collection_method").notNull().default("manual"),
    paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
    whopInvoiceId: text("whop_invoice_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    note: text("note"),
  },
  (t) => [index("invoices_status_idx").on(t.status)],
);

export const pixelEvents = pgTable(
  "pixel_events",
  {
    id: serial("id").primaryKey(),
    at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
    event: text("event").notNull(),
    props: text("props").notNull().default("{}"),
  },
  (t) => [index("pixel_events_at_idx").on(t.at)],
);
