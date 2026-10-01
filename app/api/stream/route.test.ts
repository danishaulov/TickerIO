import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { quote } from "@/lib/market";
import { GET } from "./route";
import type { Quote } from "@/lib/types";

vi.mock("@/lib/market", () => ({ quote: vi.fn() }));
const value = { symbol: "AAPL", price: 100, change: 1, changePct: 1, asOf: "2026-01-01T12:00:00Z" } as Quote;
const request = (symbol = "AAPL", signal?: AbortSignal) => new NextRequest(`http://localhost/api/stream?symbol=${encodeURIComponent(symbol)}`, { signal });

beforeEach(() => { vi.useFakeTimers(); vi.mocked(quote).mockReset(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe("price stream lifecycle", () => {
  it("rejects malformed or missing symbols before creating timers", async () => {
    expect((await GET(request(""))).status).toBe(400);
    expect((await GET(request("<bad>"))).status).toBe(400);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("cleans up timers when a browser disconnects during an upstream request", async () => {
    let finish!: (result: { value: Quote; stale: boolean }) => void;
    vi.mocked(quote).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const response = await GET(request());
    const reader = response.body!.getReader();
    expect(new TextDecoder().decode((await reader.read()).value)).toContain("retry: 2000");
    await reader.cancel();
    expect(vi.getTimerCount()).toBe(0);
    finish({ value, stale: false });
    await Promise.resolve();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not start overlapping provider calls on slow ticks and stops at the deadline", async () => {
    vi.mocked(quote).mockImplementation(() => new Promise(() => {}));
    const response = await GET(request());
    const reader = response.body!.getReader();
    await reader.read();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(quote).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(25_000);
    expect((await reader.read()).done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("releases timers on request abort and handles already-aborted requests", async () => {
    vi.mocked(quote).mockImplementation(() => new Promise(() => {}));
    const controller = new AbortController();
    const response = await GET(request("AAPL", controller.signal));
    const reader = response.body!.getReader();
    await reader.read();
    controller.abort();
    expect((await reader.read()).done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    const closed = await GET(request("AAPL", controller.signal));
    expect((await closed.body!.getReader().read()).done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
