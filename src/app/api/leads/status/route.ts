import { db } from "@/db";
import { leads, leadStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const VALID = ["new", "contacted", "quoted", "won", "lost"] as const;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: number; status?: string };
    const id = Number(body.id);
    if (!Number.isInteger(id) || !body.status || !VALID.includes(body.status as (typeof VALID)[number])) {
      return Response.json({ ok: false, error: "invalid" }, { status: 400 });
    }
    await db
      .update(leads)
      .set({ status: body.status as (typeof leadStatusEnum.enumValues)[number] })
      .where(eq(leads.id, id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "update_failed" }, { status: 500 });
  }
}
