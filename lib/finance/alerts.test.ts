import { describe, expect, it } from "vitest";
import { shouldTriggerAlert } from "./alerts";
import type { QuoteResponse } from "@/lib/api";

const now = Date.parse("2026-01-01T12:00:00Z");
const quote = { price: 100, asOf: new Date(now).toISOString() } as QuoteResponse;

describe("price alert eligibility", () => {
  it("fires at or beyond a threshold in either direction", () => {
    expect(shouldTriggerAlert({ op: "above", price: 100 }, quote, now)).toBe(true);
    expect(shouldTriggerAlert({ op: "below", price: 100 }, quote, now)).toBe(true);
    expect(shouldTriggerAlert({ op: "above", price: 101 }, quote, now)).toBe(false);
    expect(shouldTriggerAlert({ op: "below", price: 99 }, quote, now)).toBe(false);
  });
  it("rejects provider fallback data and old closes", () => {
    expect(shouldTriggerAlert({ op: "above", price: 50 }, { ...quote, stale: true }, now)).toBe(false);
    expect(shouldTriggerAlert({ op: "above", price: 50 }, { ...quote, asOf: new Date(now - 300_001).toISOString() }, now)).toBe(false);
  });
  it("rejects missing data, invalid timestamps and impossible prices", () => {
    for (const data of [undefined, { ...quote, price: NaN }, { ...quote, price: 0 }, { ...quote, asOf: "bad" }, { ...quote, asOf: new Date(now + 120_000).toISOString() }]) {
      expect(shouldTriggerAlert({ op: "above", price: 50 }, data, now)).toBe(false);
    }
    expect(shouldTriggerAlert({ op: "above", price: NaN }, quote, now)).toBe(false);
  });
});
