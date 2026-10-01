/** Yahoo Finance symbol search — powers autocomplete + the command palette. */

import { z } from "zod";
import { fetchJson } from "@/lib/cache";

const schema = z.object({
  quotes: z
    .array(
      z
        .object({
          symbol: z.string().optional(),
          shortname: z.string().optional(),
          longname: z.string().optional(),
          quoteType: z.string().optional(),
          exchDisp: z.string().optional(),
          typeDisp: z.string().optional(),
        })
        .passthrough(),
    )
    .optional()
    .default([]),
});

export interface SearchHit {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

/** A ranking candidate: a SearchHit plus the raw quoteType used for scoring. */
export interface RankCandidate extends SearchHit {
  quoteType: string;
}

const TYPE_WEIGHT: Record<string, number> = {
  EQUITY: 80,
  ETF: 62,
  INDEX: 58,
  MUTUALFUND: 40,
  CRYPTOCURRENCY: 50,
  CURRENCY: 4,
};

/** True when the query itself reads like a forex pair, so currency crosses are wanted. */
function looksLikeForex(query: string): boolean {
  const q = query.toUpperCase();
  return q.includes("/") || q.endsWith("=X") || /^[A-Z]{6}$/.test(q.replace(/[^A-Z]/g, ""));
}

/**
 * Score and sort raw Yahoo hits so the ticker the user meant lands first.
 * Yahoo's own order buries the primary listing under currency crosses
 * (AUDAMD=X ahead of AMD) and foreign suffixed listings (AAPL19.BK ahead of
 * AAPL); this pure function corrects that. Higher score = more relevant.
 */
export function rankHits(query: string, candidates: RankCandidate[], limit = 7): SearchHit[] {
  const q = query.trim().toUpperCase();
  const compact = q.replace(/[^A-Z0-9]/g, "");
  const forexQuery = looksLikeForex(q);

  const scored = candidates.map((c, i) => {
    const sym = c.symbol.toUpperCase();
    const symBase = sym.split(/[.\-=]/)[0]; // strip exchange/pair suffix: AAPL.BA -> AAPL
    const name = c.name.toUpperCase();
    let score = TYPE_WEIGHT[c.quoteType] ?? 20;

    if (sym === q || symBase === compact) score += 1000; // exact ticker
    else if (sym.startsWith(q) || symBase.startsWith(compact)) score += 320; // prefix
    else if (sym.includes(compact)) score += 60;

    if (name.startsWith(q)) score += 120;
    else if (name.includes(q)) score += 40;

    // Demote noise unless it matches what was actually typed.
    if ((c.quoteType === "CURRENCY" || sym.endsWith("=X")) && !forexQuery) score -= 120;
    if (/[.]/.test(sym) && symBase !== compact) score -= 45; // foreign/secondary listing
    score -= Math.min(sym.length, 12); // gently prefer shorter, cleaner symbols

    return { hit: { symbol: c.symbol, name: c.name, type: c.type, exchange: c.exchange }, score, i };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.i - b.i) // stable: keep Yahoo order on ties
    .slice(0, limit)
    .map((s) => s.hit);
}

export async function searchSymbols(query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    q,
  )}&quotesCount=14&newsCount=0&enableFuzzyQuery=false`;
  const raw = await fetchJson<unknown>(url);
  const parsed = schema.parse(raw);

  const candidates: RankCandidate[] = parsed.quotes
    .filter(
      (x) =>
        x.symbol &&
        (x.quoteType === "EQUITY" ||
          x.quoteType === "CRYPTOCURRENCY" ||
          x.quoteType === "CURRENCY" ||
          x.quoteType === "INDEX" ||
          x.quoteType === "ETF"),
    )
    .map((x) => ({
      symbol: x.symbol!,
      name: x.longname ?? x.shortname ?? x.symbol!,
      type: x.typeDisp ?? x.quoteType ?? "",
      exchange: x.exchDisp ?? "",
      quoteType: x.quoteType ?? "",
    }));

  return rankHits(q, candidates);
}
