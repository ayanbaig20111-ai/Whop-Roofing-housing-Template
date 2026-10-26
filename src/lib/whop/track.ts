// ─────────────────────────────────────────────────────────────────────────────
//  whop.track wrapper.
//
//  On a site deployed to Whop Websites (whop.site / your whop.app route),
//  Whop injects the pixel into every HTML page and `window.whop` exists
//  before app code runs — calls below forward straight to the live pixel.
//
//  Everywhere else (local preview, custom domains) the call is buffered and
//  relayed to /api/pixel so events remain verifiable in the dashboard, and a
//  "Whop Pixel" console in the corner shows every event as it fires.
// ─────────────────────────────────────────────────────────────────────────────

export type TrackProps = Record<string, unknown>;

interface WhopPixel {
  track: (event: string, props?: TrackProps) => void;
}

declare global {
  interface Window {
    whop?: WhopPixel;
    __whopEventLog?: { event: string; props: TrackProps; at: number; live: boolean }[];
  }
}

export function track(event: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;

  const live = typeof window.whop?.track === "function";
  if (live) {
    try {
      window.whop!.track(event, props);
    } catch {
      /* never let analytics break the page */
    }
  }

  // Buffer locally for the on-page pixel console (verifiability in any env).
  const log = (window.__whopEventLog = window.__whopEventLog ?? []);
  log.push({ event, props, at: Date.now(), live });
  if (log.length > 60) log.shift();
  window.dispatchEvent(new CustomEvent("whop:track", { detail: { event, props, live } }));

  // Relay to the server-side event log (dashboard → "Pixel events").
  void fetch("/api/pixel", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, props }),
  }).catch(() => {});
}
