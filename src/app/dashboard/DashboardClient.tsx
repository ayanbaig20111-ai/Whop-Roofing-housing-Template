"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  new: "border-accent bg-accent/10 text-accent-deep",
  contacted: "border-ink bg-paper-2 text-ink",
  quoted: "border-ink bg-ink text-cream",
  won: "border-ink bg-accent text-cream",
  lost: "border-line bg-paper-2 text-steel-2",
};

export function LeadStatusSelect({ id, value }: { id: number; value: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await fetch("/api/leads/status", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id, status: e.target.value }),
          });
          router.refresh();
        })
      }
      className={`cursor-pointer border-2 px-2 py-1 font-mono text-[11px] font-bold uppercase outline-none disabled:opacity-50 ${STATUS_STYLES[value] ?? STATUS_STYLES.new}`}
    >
      {Object.keys(STATUS_STYLES).map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export function BillFinalBalance({
  paymentMethodId,
  customerName,
  email,
  amountUsd,
}: {
  paymentMethodId: number;
  customerName: string;
  email: string;
  amountUsd: number;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function bill(method: "card_on_file" | "manual") {
    setState("busy");
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          paymentMethodId,
          collectionMethod: method,
          customerName,
          email,
          amountUsd,
          label: "Final balance — roof replacement",
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) throw new Error();
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="font-mono text-[11px] font-bold uppercase text-ink">✓ final balance invoiced</span>
    );
  }

  return (
    <span className="inline-flex gap-1.5">
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => void bill("card_on_file")}
        className="border-2 border-ink bg-accent px-2.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {state === "busy" ? "…" : "Charge card"}
      </button>
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => void bill("manual")}
        className="border-2 border-ink bg-cream px-2.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        Pay link
      </button>
      {state === "error" && (
        <span className="self-center text-[10px] font-bold uppercase text-red-700">failed</span>
      )}
    </span>
  );
}
