import { describe, it, expect } from "vitest";
import { rankHits, type RankCandidate } from "./search";

const amdPool: RankCandidate[] = [
  { symbol: "AUDAMD=X", name: "AUD/AMD", type: "Currency", exchange: "CCY", quoteType: "CURRENCY" },
  { symbol: "GBPAMD=X", name: "GBP/AMD", type: "Currency", exchange: "CCY", quoteType: "CURRENCY" },
  { symbol: "RUBAMD=X", name: "RUB/AMD", type: "Currency", exchange: "CCY", quoteType: "CURRENCY" },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc.", type: "Equity", exchange: "NASDAQ", quoteType: "EQUITY" },
  { symbol: "AMD.NE", name: "Advanced Micro Devices CDR", type: "Equity", exchange: "NEO", quoteType: "EQUITY" },
];

const aaplPool: RankCandidate[] = [
  { symbol: "AAPL19.BK", name: "AAPL19_DR", type: "Equity", exchange: "SET", quoteType: "EQUITY" },
  { symbol: "AAPL.BA", name: "Apple Inc CEDEAR", type: "Equity", exchange: "BUE", quoteType: "EQUITY" },
  { symbol: "AAPL", name: "Apple Inc.", type: "Equity", exchange: "NASDAQ", quoteType: "EQUITY" },
];

describe("rankHits", () => {
  it("puts the real equity above currency crosses", () => {
    expect(rankHits("amd", amdPool)[0].symbol).toBe("AMD");
  });

  it("puts the primary listing above foreign/secondary listings", () => {
    expect(rankHits("aapl", aaplPool)[0].symbol).toBe("AAPL");
  });

  it("keeps currency crosses relevant when the query looks like forex", () => {
    const pool: RankCandidate[] = [
      { symbol: "EURUSD=X", name: "EUR/USD", type: "Currency", exchange: "CCY", quoteType: "CURRENCY" },
      { symbol: "EURUSDT", name: "EUR/USDT", type: "Cryptocurrency", exchange: "CCC", quoteType: "CRYPTOCURRENCY" },
    ];
    expect(rankHits("EUR/USD", pool)[0].symbol).toBe("EURUSD=X");
  });

  it("respects the limit", () => {
    expect(rankHits("amd", amdPool, 2)).toHaveLength(2);
  });

  it("prefers an exact symbol match over a mere prefix", () => {
    const pool: RankCandidate[] = [
      { symbol: "METAL", name: "Some Metal Co", type: "Equity", exchange: "NYSE", quoteType: "EQUITY" },
      { symbol: "META", name: "Meta Platforms, Inc.", type: "Equity", exchange: "NASDAQ", quoteType: "EQUITY" },
    ];
    expect(rankHits("meta", pool)[0].symbol).toBe("META");
  });
});
