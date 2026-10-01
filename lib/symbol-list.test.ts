import { describe, expect, it } from "vitest";
import { normalizeSymbols, normalizeSymbol, parseCompareSymbols } from "./symbol-list";

describe("symbol identity and comparison URLs", () => {
  it("unifies aliases, casing and provider symbols", () => {
    expect(normalizeSymbols(["btc", " BTC-USD ", "eur/usd", "EURUSD=X", "SPX", "^GSPC"])).toEqual(["BTC-USD", "EURUSD=X", "^GSPC"]);
  });
  it("rejects empty, oversized and malformed symbols", () => {
    for (const symbol of ["", " ", "a".repeat(41), "<script>", "A&B", "AAPL MSFT"]) expect(normalizeSymbol(symbol)).toBe("");
  });
  it("retains a deliberately empty comparison instead of resetting to defaults", () => {
    expect(parseCompareSymbols(null)).toEqual(["AAPL", "MSFT", "NVDA"]);
    expect(parseCompareSymbols("")).toEqual([]);
  });
  it("deduplicates before applying the six-symbol comparison limit", () => {
    expect(parseCompareSymbols("aapl,AAPL,BTC,BTC-USD,MSFT,NVDA,TSLA,AMZN,GOOGL")).toEqual(["AAPL", "BTC-USD", "MSFT", "NVDA", "TSLA", "AMZN"]);
  });
});
