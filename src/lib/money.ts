export function usd(amountUsd: number, opts: { cents?: boolean } = {}): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(amountUsd);
}

export function usdCents(cents: number): string {
  return usd(cents / 100, { cents: true });
}

export function toCents(amountUsd: number): number {
  return Math.round(amountUsd * 100);
}
