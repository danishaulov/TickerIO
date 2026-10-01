import type { QuoteResponse } from "@/lib/api";

export function shouldTriggerAlert(
  alert: { op: "above" | "below"; price: number },
  quote: QuoteResponse | undefined,
  now: number,
): boolean {
  if (!quote || quote.stale || !Number.isFinite(quote.price) || quote.price <= 0 || !Number.isFinite(alert.price) || alert.price <= 0) return false;
  const timestamp = Date.parse(quote.asOf);
  // A cached fallback or yesterday's close must never fire a fresh price alert.
  if (!Number.isFinite(timestamp) || now - timestamp > 300_000 || timestamp > now + 60_000) return false;
  return alert.op === "above" ? quote.price >= alert.price : quote.price <= alert.price;
}
