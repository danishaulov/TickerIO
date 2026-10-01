import { resolveSymbol } from "@/lib/markets/symbol";

export const WATCHLIST_LIMIT = 24;
export const COMPARE_LIMIT = 6;

/** Use provider identities so BTC and BTC-USD cannot be saved twice. */
export function normalizeSymbol(raw: string): string {
  const input = raw.trim().toUpperCase();
  if (!input || input.length > 40 || !/^[A-Z0-9^=./-]+$/.test(input)) return "";
  return resolveSymbol(input).symbol;
}

export function normalizeSymbols(symbols: string[], limit = WATCHLIST_LIMIT): string[] {
  return Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean))).slice(0, limit);
}

export function parseCompareSymbols(raw: string | null): string[] {
  return raw === null ? ["AAPL", "MSFT", "NVDA"] : normalizeSymbols(raw.split(","), COMPARE_LIMIT);
}
