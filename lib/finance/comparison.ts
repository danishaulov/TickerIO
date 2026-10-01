import type { Candle } from "@/lib/types";

const DAY = 86_400_000;
export interface ComparisonInput { symbol: string; color: string; candles: Candle[] }
export interface ComparisonPoint { t: number; value: number; close: number }
export interface NormalizedSeries { symbol: string; color: string; points: ComparisonPoint[] }

/** Daily closes share a UTC calendar axis, including weekends for 24/7 assets.
 * Rebase all series on the first shared date and end on the last shared date.
 * Never stretch a stock's 252 observations across a crypto's 365 observations. */
export function normalizeComparison(input: ComparisonInput[]): NormalizedSeries[] {
  const series = input.map((s) => {
    const days = new Map<number, Candle>();
    [...s.candles].sort((a, b) => a.t - b.t).forEach((c) => {
      if (Number.isFinite(c.t) && Number.isFinite(c.c) && c.c > 0) {
        days.set(Math.floor(c.t / DAY) * DAY, c);
      }
    });
    return { ...s, days };
  }).filter((s) => s.days.size > 1);
  if (!series.length) return [];
  const shared = [...series[0].days.keys()].filter((t) => series.every((s) => s.days.has(t))).sort((a, b) => a - b);
  if (shared.length < 2) return [];
  const start = shared[0];
  const end = shared[shared.length - 1];
  return series.map((s) => {
    const base = s.days.get(start)!.c;
    return {
      symbol: s.symbol,
      color: s.color,
      points: [...s.days.entries()].filter(([t]) => t >= start && t <= end)
        .sort(([a], [b]) => a - b)
        .map(([t, c]) => ({ t, close: c.c, value: (c.c / base - 1) * 100 })),
    };
  });
}
