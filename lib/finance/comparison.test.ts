import { describe, expect, it } from "vitest";
import { normalizeComparison } from "./comparison";
import type { Candle } from "@/lib/types";

const candle = (date: string, c: number): Candle => ({ t: Date.parse(date), c, o: c, h: c, l: c, v: 1 });
const input = (symbol: string, candles: Candle[]) => ({ symbol, color: "blue", candles });

describe("calendar-aligned comparisons", () => {
  it("keeps weekends on the real date axis when comparing stocks and crypto", () => {
    const result = normalizeComparison([
      input("STOCK", [candle("2026-01-02T14:30:00Z", 100), candle("2026-01-05T14:30:00Z", 110)]),
      input("CRYPTO", [candle("2026-01-02T00:00:00Z", 200), candle("2026-01-03T00:00:00Z", 210), candle("2026-01-04T00:00:00Z", 190), candle("2026-01-05T00:00:00Z", 220)]),
    ]);
    expect(result[0].points).toHaveLength(2);
    expect(result[1].points).toHaveLength(4);
    expect(result[0].points.at(-1)!.t).toBe(result[1].points.at(-1)!.t);
    expect(result[0].points.at(-1)!.value).toBeCloseTo(10);
    expect(result[1].points.at(-1)!.value).toBeCloseTo(10);
  });
  it("uses the same first and last available dates for different listing histories", () => {
    const result = normalizeComparison([
      input("OLD", [candle("2026-01-01", 1), candle("2026-01-02", 2), candle("2026-01-03", 4), candle("2026-01-04", 8)]),
      input("NEW", [candle("2026-01-02", 100), candle("2026-01-03", 110)]),
    ]);
    expect(result[0].points[0].close).toBe(2);
    expect(result.every((s) => s.points[0].value === 0)).toBe(true);
    expect(result[0].points.at(-1)!.close).toBe(4);
  });
  it("returns no misleading comparison if there are fewer than two shared days", () => {
    expect(normalizeComparison([
      input("A", [candle("2026-01-01", 1), candle("2026-01-02", 2)]),
      input("B", [candle("2026-01-02", 1), candle("2026-01-03", 2)]),
    ])).toEqual([]);
  });
  it("sorts, deduplicates days and rejects invalid or non-positive closes", () => {
    const result = normalizeComparison([input("A", [
      candle("2026-01-03", 30), candle("2026-01-01", 0), candle("bad", 10),
      candle("2026-01-02T00:00:00Z", 10), candle("2026-01-02T14:30:00Z", 20),
      candle("2026-01-04", NaN),
    ])]);
    expect(result[0].points.map((p) => p.close)).toEqual([20, 30]);
    expect(result[0].points.at(-1)!.value).toBeCloseTo(50);
  });
  it("omits an unavailable series without blanking available data", () => {
    const result = normalizeComparison([input("EMPTY", []), input("A", [candle("2026-01-01", 1), candle("2026-01-02", 2)])]);
    expect(result.map((s) => s.symbol)).toEqual(["A"]);
  });
});
