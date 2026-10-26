import { db } from "@/db";
import { leads, invoices, paymentMethods, pixelEvents } from "@/db/schema";
import { desc } from "drizzle-orm";
import { usdCents } from "@/lib/money";
import { whopConfigured } from "@/config/whop";
import { company } from "@/config/company";
import { RoofMark } from "@/components/Header";
import { LeadStatusSelect, BillFinalBalance } from "./DashboardClient";

export const dynamic = "force-dynamic";

/**
 * Owner dashboard — the mirror of the money flow:
 * leads (estimate form) → cards on file → invoices (fee / deposit / final
 * balance) → pixel events. In a live Whop account these live under the
 * account's dashboard too; this page keeps the template self-contained.
 */
export default async function DashboardPage() {
  const [leadRows, invoiceRows, pmRows, eventRows] = await Promise.all([
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(50),
    db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(50),
    db.select().from(paymentMethods).orderBy(desc(paymentMethods.createdAt)).limit(20),
    db.select().from(pixelEvents).orderBy(desc(pixelEvents.at)).limit(30),
  ]);

  const collected = invoiceRows.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountCents, 0);
  const outstanding = invoiceRows.filter((i) => i.status === "sent").reduce((s, i) => s + i.amountCents, 0);
  const newLeads = leadRows.filter((l) => l.status === "new").length;
  const live = whopConfigured();

  return (
    <main className="min-h-screen bg-paper-2">
      <header className="border-b-2 border-ink bg-ink">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <RoofMark className="h-9 w-9" />
            <div>
              <p className="font-display text-xl font-bold uppercase tracking-wide text-cream">
                {company.shortName} · Owner dashboard
              </p>
              <p className="text-[11px] uppercase tracking-wider text-steel-2">
                Deposit → job → final invoice, in one view
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`border-2 px-2.5 py-1 font-display text-xs font-bold uppercase tracking-widest ${
                live ? "border-accent text-accent" : "border-cream/30 text-steel-2"
              }`}
            >
              {live ? "Live Whop" : "Sandbox data"}
            </span>
            <a
              href="/"
              className="font-display text-xs font-bold uppercase tracking-widest text-steel-2 hover:text-accent"
            >
              ← Public site
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* stat strip */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "New leads", value: String(newLeads), sub: `${leadRows.length} total in CRM` },
            { label: "Collected", value: usdCents(collected), sub: "paid invoices" },
            { label: "Outstanding", value: usdCents(outstanding), sub: "awaiting payment" },
            { label: "Cards on file", value: String(pmRows.length), sub: "stored via Whop setup" },
          ].map((s) => (
            <div key={s.label} className="border-2 border-ink bg-cream p-4">
              <p className="overline-label text-steel">{s.label}</p>
              <p className="mt-1 font-display text-4xl font-extrabold tabular-nums">{s.value}</p>
              <p className="mt-1 text-xs text-steel">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* leads */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">
            Estimate requests <span className="text-accent-deep">· leads</span>
          </h2>
          <p className="mt-1 text-sm text-steel">
            From the "Request an Estimate" form — mirrored to the Whop account's leads when
            live credentials are set.
          </p>
          <div className="mt-4 overflow-x-auto border-2 border-ink bg-cream">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-ink bg-paper-2 text-[11px] uppercase tracking-wider text-steel">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">ZIP</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Whop</th>
                </tr>
              </thead>
              <tbody>
                {leadRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-steel">
                      No leads yet — submit the estimate form on the homepage.
                    </td>
                  </tr>
                )}
                {leadRows.map((l) => (
                  <tr key={l.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-semibold">{l.name}</td>
                    <td className="px-4 py-3 text-steel">
                      {l.phone || l.email}
                      {l.phone && l.email ? " · " + l.email : ""}
                    </td>
                    <td className="px-4 py-3">{l.service}</td>
                    <td className="px-4 py-3 tabular-nums">{l.zip || "—"}</td>
                    <td className="px-4 py-3 text-steel">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <LeadStatusSelect id={l.id} value={l.status} />
                    </td>
                    <td className="px-4 py-3">
                      {l.whopLeadId ? (
                        <code className="font-mono text-[11px] text-accent-deep">{l.whopLeadId}</code>
                      ) : (
                        <span className="text-xs text-steel-2">local only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* invoices */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">
            Invoices <span className="text-accent-deep">· the money flow</span>
          </h2>
          <p className="mt-1 text-sm text-steel">
            Inspection fees, deposits and final balances. "Charge stored card" bills the
            card-on-file; "Send pay link" emails a secure invoice instead.
          </p>
          <div className="mt-4 overflow-x-auto border-2 border-ink bg-cream">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-ink bg-paper-2 text-[11px] uppercase tracking-wider text-steel">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoiceRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-steel">
                      No invoices yet — complete a checkout (any plan) to see the flow.
                    </td>
                  </tr>
                )}
                {invoiceRows.map((inv) => (
                  <tr key={inv.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono text-xs font-bold">{inv.number}</td>
                    <td className="px-4 py-3">{inv.customerName}</td>
                    <td className="px-4 py-3">{inv.planLabel}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{usdCents(inv.amountCents)}</td>
                    <td className="px-4 py-3 text-steel">{inv.collectionMethod.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.planLabel.toLowerCase().includes("deposit") && inv.status === "paid" && inv.paymentMethodId ? (
                        <BillFinalBalance
                          paymentMethodId={inv.paymentMethodId}
                          customerName={inv.customerName}
                          email={inv.email}
                          amountUsd={13500}
                        />
                      ) : inv.status === "draft" ? (
                        <span className="text-xs text-steel-2">awaiting payment</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* cards on file */}
          <section>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">
              Cards on file
            </h2>
            <div className="mt-4 border-2 border-ink bg-cream">
              {pmRows.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-steel">
                  None yet — pay a deposit to store a card (setup intent).
                </p>
              )}
              <ul className="divide-y divide-line">
                {pmRows.map((pm) => (
                  <li key={pm.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{pm.customerName}</p>
                      <p className="text-xs text-steel">
                        {pm.brand === "wallet" ? "Apple/Google Pay" : pm.brand} · last4 {pm.last4} ·{" "}
                        {pm.email || "no email"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase ${
                        pm.source === "whop" ? "border-ink bg-ink text-cream" : "border-accent bg-accent/10 text-accent-deep"
                      }`}
                    >
                      {pm.source}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* pixel events */}
          <section>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">
              Pixel events <span className="text-accent-deep">· whop.track</span>
            </h2>
            <div className="mt-4 border-2 border-ink bg-ink">
              {eventRows.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-steel-2">
                  No events yet — browse the site, view a service, start a checkout.
                </p>
              )}
              <ul className="max-h-80 divide-y divide-cream/10 overflow-y-auto">
                {eventRows.map((e) => (
                  <li key={e.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <code className="font-mono text-xs font-bold text-accent">{e.event}</code>
                      <p className="truncate font-mono text-[10px] text-steel-2">{e.props}</p>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-wider text-steel-2">
                      {new Date(e.at).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "border-ink bg-ink text-cream",
    sent: "border-accent bg-accent/10 text-accent-deep",
    draft: "border-steel-2 bg-paper-2 text-steel",
    failed: "border-red-700 bg-red-100 text-red-800",
    void: "border-line bg-paper-2 text-steel-2",
  };
  return (
    <span className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  );
}
