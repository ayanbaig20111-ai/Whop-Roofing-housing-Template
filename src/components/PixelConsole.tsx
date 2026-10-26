"use client";

import { useEffect, useState } from "react";
import { track, type TrackProps } from "@/lib/whop/track";

interface LogEntry {
  event: string;
  props: TrackProps;
  at: number;
  live: boolean;
}

/**
 * Floating "Whop Pixel" console — proves tracking is wired.
 * On a live Whop Website deployment, `window.whop` forwards to the real pixel
 * (badges show LIVE). In preview it relays to /api/pixel for the dashboard.
 * Also fires `page_view` once so the required baseline event is verifiable.
 */
export function PixelConsole() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    const seed = window.__whopEventLog ?? [];
    setEntries([...seed].reverse());
    if (!fired) {
      setFired(true);
      track("page_view", { path: window.location.pathname });
    }
    const onTrack = (e: Event) => {
      const detail = (e as CustomEvent).detail as { event: string; props: TrackProps; live: boolean };
      setEntries((prev) =>
        [{ ...detail, at: Date.now() }, ...prev].slice(0, 40),
      );
    };
    window.addEventListener("whop:track", onTrack);
    return () => window.removeEventListener("whop:track", onTrack);
  }, [fired]);

  const liveCount = entries.filter((e) => e.live).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[95] flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-3.5 py-2 font-display text-xs font-bold uppercase tracking-widest text-cream shadow-[3px_3px_0_0_rgba(14,24,38,0.35)] transition-transform hover:-translate-y-0.5"
        aria-label="Toggle Whop pixel event console"
      >
        <span className="pulse-dot relative inline-block h-2 w-2 rounded-full bg-accent text-accent" />
        Whop Pixel
        <span className="rounded-full bg-accent px-1.5 text-[10px] leading-4 text-cream">
          {entries.length}
        </span>
      </button>

      {open && (
        <div className="fixed bottom-16 right-4 z-[95] w-[21rem] max-w-[calc(100vw-2rem)] rounded-md border-2 border-ink bg-cream shadow-hard">
          <div className="flex items-center justify-between border-b-2 border-ink px-3 py-2">
            <p className="font-display text-sm font-bold uppercase tracking-widest">
              Pixel events
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-steel">
              {liveCount > 0 ? "live pixel" : "sandbox relay"}
            </span>
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {entries.length === 0 && (
              <li className="px-3 py-4 text-xs text-steel">No events yet — scroll the page.</li>
            )}
            {entries.map((e, i) => (
              <li key={i} className="border-b border-line px-3 py-2 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <code className="truncate font-mono text-[11px] font-semibold text-ink">
                    {e.event}
                  </code>
                  <span
                    className={`shrink-0 rounded-full px-1.5 text-[9px] font-bold uppercase tracking-wider ${
                      e.live ? "bg-ink text-cream" : "bg-accent text-cream"
                    }`}
                  >
                    {e.live ? "live" : "relay"}
                  </span>
                </div>
                {Object.keys(e.props).length > 0 && (
                  <p className="mt-0.5 truncate font-mono text-[10px] text-steel">
                    {JSON.stringify(e.props)}
                  </p>
                )}
                <p className="text-[9px] uppercase tracking-wider text-steel-2">
                  {new Date(e.at).toLocaleTimeString()}
                </p>
              </li>
            ))}
          </ul>
          <p className="border-t-2 border-ink bg-paper-2 px-3 py-2 text-[10px] leading-snug text-steel">
            On a Whop Website deploy, <code>window.whop</code> is auto-injected and these
            events hit the real pixel dashboard.
          </p>
        </div>
      )}
    </>
  );
}
