import { db } from "@/db";
import { pixelEvents } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Pixel event relay — mirrors whop.track events into the local event log so
 * custom events (estimate_requested, service_viewed, deposit_started, …) are
 * verifiable in the dashboard. On a live Whop Website deploy the real pixel
 * handles these; this relay is the template's verifiability hook.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { event?: string; props?: Record<string, unknown> };
    if (!body.event || typeof body.event !== "string" || body.event.length > 120) {
      return Response.json({ ok: false, error: "invalid_event" }, { status: 400 });
    }
    await db.insert(pixelEvents).values({
      event: body.event,
      props: JSON.stringify(body.props ?? {}),
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "log_failed" }, { status: 500 });
  }
}

/** Small helper used by the dashboard to prune ancient events. */
export async function GET() {
  const rows = await db
    .select()
    .from(pixelEvents)
    .orderBy(pixelEvents.at)
    .limit(200);
  return Response.json({ ok: true, count: rows.length });
}
