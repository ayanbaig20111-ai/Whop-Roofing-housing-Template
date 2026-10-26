import { db } from "@/db";
import { leads } from "@/db/schema";
import { whopClient, whopServerReady } from "@/lib/whop/client";
import { whopEnv } from "@/config/whop";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Estimate form → lead.
 * 1. Always records the lead locally (so the flow works in any environment).
 * 2. When WHOP_API_KEY + WHOP_ACCOUNT_ID are set, creates the same lead on
 *    the Whop account via the Leads API (POST /api/v1/leads) — quote requests
 *    then land under the account's Leads, with all details in metadata.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      zip?: string;
      service?: string;
      roofSqFt?: string;
      details?: string;
      source?: string;
    };

    const name = (body.name ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const email = (body.email ?? "").trim();
    if (!name || (!phone && !email)) {
      return Response.json(
        { ok: false, error: "name and a phone or email are required" },
        { status: 400 },
      );
    }

    const [lead] = await db
      .insert(leads)
      .values({
        name,
        phone,
        email,
        zip: (body.zip ?? "").trim(),
        service: (body.service ?? "").trim(),
        details: (body.details ?? "").trim().slice(0, 2000),
        roofSquareFeet: parseSqFt(body.roofSqFt),
        source: (body.source ?? "website").slice(0, 80),
      })
      .returning({ id: leads.id });

    const ref = `EST-${String(lead.id).padStart(4, "0")}`;

    let whopLeadId: string | undefined;
    if (whopServerReady()) {
      try {
        const created = await whopClient().leads.create({
          account_id: whopEnv.accountId,
          product_id: whopEnv.leadProductId || null,
          referrer: "roofing-template:estimate-form",
          metadata: {
            ref,
            name,
            phone,
            email,
            zip: body.zip ?? "",
            service: body.service ?? "",
            roof_sq_ft: body.roofSqFt ?? "",
            message: (body.details ?? "").slice(0, 500),
            source: body.source ?? "website",
          },
        });
        whopLeadId = created.id;
        await db
          .update(leads)
          .set({ whopLeadId })
          .where(eq(leads.id, lead.id));
      } catch (e) {
        console.error("[estimate] Whop lead creation failed:", e);
      }
    }

    return Response.json({ ok: true, ref, leadId: lead.id, whopLeadId });
  } catch (e) {
    console.error("[estimate]", e);
    return Response.json({ ok: false, error: "Could not record your request." }, { status: 500 });
  }
}

function parseSqFt(v?: string): number | null {
  if (!v) return null;
  if (v.startsWith("Under")) return 1400;
  if (v.startsWith("1,500")) return 1850;
  if (v.startsWith("2,200")) return 2600;
  return 3200;
}
