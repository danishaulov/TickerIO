import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: globalThis.localStorage } });
});
import { useWatchlist } from "./useWatchlist";
import { useAlerts } from "./useAlerts";

beforeEach(() => {
  useWatchlist.setState({ symbols: [] });
  useAlerts.setState({ alerts: [], history: [] });
});

describe("watchlist persistence", () => {
  it("never evicts an existing symbol when the list is full", () => {
    const original = Array.from({ length: 24 }, (_, i) => `TEST${i}`);
    useWatchlist.getState().addMany(original);
    expect(useWatchlist.getState().add("AAPL")).toBe(false);
    expect(useWatchlist.getState().symbols).toEqual(original);
  });
  it("adds aliases once, and removes or toggles through either spelling", () => {
    expect(useWatchlist.getState().add("btc")).toBe(true);
    expect(useWatchlist.getState().add("BTC-USD")).toBe(false);
    expect(useWatchlist.getState().has("BTC")).toBe(true);
    useWatchlist.getState().toggle("BTC");
    expect(useWatchlist.getState().symbols).toEqual([]);
  });
  it("merges bulk input into remaining capacity without losing existing entries", () => {
    useWatchlist.getState().addMany(Array.from({ length: 23 }, (_, i) => `TEST${i}`));
    expect(useWatchlist.getState().addMany(["AAPL", "AAPL", "MSFT"])).toBe(1);
    expect(useWatchlist.getState().symbols).toHaveLength(24);
    expect(useWatchlist.getState().has("TEST22")).toBe(true);
  });
  it("migrates older aliases without losing the saved list", async () => {
    const migrate = useWatchlist.persist.getOptions().migrate!;
    expect(await migrate({ symbols: ["BTC", "BTC-USD", "aapl"] }, 0)).toEqual({ symbols: ["BTC-USD", "AAPL"] });
  });
});

describe("alert history", () => {
  it("records a trigger once and removes the active alert atomically", () => {
    expect(useAlerts.getState().add("BTC", "above", 100, "USD")).toBe(true);
    const { id } = useAlerts.getState().alerts[0];
    expect(useAlerts.getState().trigger(id, 101)?.actualPrice).toBe(101);
    expect(useAlerts.getState().trigger(id, 102)).toBeUndefined();
    expect(useAlerts.getState().alerts).toHaveLength(0);
    expect(useAlerts.getState().history).toHaveLength(1);
  });
  it("rejects duplicate thresholds and invalid prices, and generates unique IDs", () => {
    expect(useAlerts.getState().add("AAPL", "above", NaN)).toBe(false);
    expect(useAlerts.getState().add("AAPL", "above", -1)).toBe(false);
    useAlerts.getState().add("BTC", "above", 100);
    expect(useAlerts.getState().add("BTC-USD", "above", 100)).toBe(false);
    useAlerts.getState().add("BTC", "below", 90);
    const ids = useAlerts.getState().alerts.map((a) => a.id);
    expect(new Set(ids).size).toBe(2);
  });
  it("preserves active alerts during migration", async () => {
    const migrate = useAlerts.persist.getOptions().migrate!;
    const migrated = await migrate({ alerts: [{ id: "old", symbol: "btc", op: "above", price: 100, createdAt: 1 }] }, 0);
    expect(migrated).toEqual({ alerts: [{ id: "old", symbol: "BTC-USD", op: "above", price: 100, createdAt: 1 }], history: [] });
  });
});
