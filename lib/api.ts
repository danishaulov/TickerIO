/** Typed client-side fetchers for the internal API routes. */

import type {
  AssetProfile,
  Candle,
  CalendarEvent,
  MiniQuote,
  NewsItem,
  Quote,
  TimeframeRow,
  TrendBiasResult,
} from "@/lib/types";

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(75_000) });
  const json = await res.json().catch(() => {
    throw new Error("השרת לא החזיר נתונים תקינים. נסו שוב בעוד רגע.");
  });
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Request failed: ${res.status}`);
  return json as T;
}

export type QuoteResponse = Quote & { stale?: boolean };

export const fetchQuote = (symbol: string) =>
  get<QuoteResponse>(`/api/quote?symbol=${encodeURIComponent(symbol)}`);

export interface BatchQuotesResponse {
  quotes: MiniQuote[];
  stale?: boolean;
  asOf?: string;
}
/** Fetch many lightweight quotes at once — powers the Leaders board. */
export const fetchBatchQuotes = (symbols: string[]) =>
  get<BatchQuotesResponse>(`/api/batch-quotes?symbols=${encodeURIComponent(symbols.join(","))}`);

export const fetchCandles = (symbol: string, range = "1d", interval = "5m") =>
  get<{ candles: Candle[]; interval: string; source: string; asOf: string }>(
    `/api/candles?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`,
  );

export const fetchTimeframes = (symbol: string) =>
  get<{ rows: TimeframeRow[]; currency: string; tz: string; source: string; asOf: string }>(
    `/api/timeframes?symbol=${encodeURIComponent(symbol)}`,
  );

export interface SentimentResponse {
  score: number;
  label: string;
  breakdown: { momentum: number; strength: number; volatility: number };
  source: string;
  asOf: string;
}
export const fetchSentiment = (symbol: string) =>
  get<SentimentResponse>(`/api/sentiment?symbol=${encodeURIComponent(symbol)}`);

export const fetchTrendBias = (symbol: string) =>
  get<TrendBiasResult & { source: string; asOf: string }>(
    `/api/trend-bias?symbol=${encodeURIComponent(symbol)}`,
  );

export const fetchNews = (symbol: string) =>
  get<{ items: NewsItem[]; sources: string[]; asOf: string }>(
    `/api/news?symbol=${encodeURIComponent(symbol)}`,
  );

export interface ArticleSummaryResponse {
  summary: string;
  generatedBy: string;
}
/** Lazy per-article context summary (POST — the article excerpt can be long). */
export async function fetchArticleSummary(
  symbol: string,
  item: { headline: string; url: string; description?: string },
): Promise<ArticleSummaryResponse> {
  const res = await fetch("/api/article-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      symbol,
      headline: item.headline,
      url: item.url,
      description: item.description ?? "",
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Request failed: ${res.status}`);
  return json as ArticleSummaryResponse;
}

export type AssetProfileResponse = AssetProfile & { stale?: boolean };
export const fetchProfile = (symbol: string) =>
  get<AssetProfileResponse>(`/api/profile?symbol=${encodeURIComponent(symbol)}`);

// ---- Fundamental analysis (Hebrew) ----
export type FundBand = "excellent" | "good" | "fair" | "weak" | "poor";

export interface FundMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  /** Optional tint for signed values (growth/upside). */
  tone?: "up" | "down";
}

export interface FundPillar {
  key: string;
  title: string;
  score: number | null;
  band: FundBand | null;
  bandWord: string | null;
  verdict: string;
  metrics: FundMetric[];
  notes: string[];
}

export interface FundTrends {
  marginPoints: { year: number; netMarginPct: number | null }[];
  revenueCagrPct: number | null;
  earningsCagrPct: number | null;
  marginDirection: "expanding" | "stable" | "contracting" | null;
}

export interface FundFairValue {
  fairValueText: string;
  upsidePct: number | null;
  impliedGrowthPct: number | null;
  growthPct: number;
  discountRatePct: number;
}

export interface FundEarnings {
  nextDateText: string | null;
  daysUntil: number | null;
  isEstimate: boolean;
  /** Recent quarterly EPS surprises as percentages (signed). */
  surprisesPct: number[];
}

export interface FundamentalsResponse {
  symbol: string;
  display: string;
  /** True for crypto/forex/index — no company financials, market+news read only. */
  degraded: boolean;
  composite: number | null;
  compositeBand: FundBand | null;
  compositeWord: string | null;
  overview: string;
  /** Scannable one-line bottom-line bullets (the TL;DR). Always present, may be empty. */
  keyTakeaways: string[];
  /** Concrete positives grounded in the numbers (green). */
  strengths: string[];
  /** Concrete risks / watch-points grounded in the numbers (red/amber). */
  risks: string[];
  pillars: FundPillar[];
  marketRead: FundMetric[];
  trends: FundTrends | null;
  fairValue: FundFairValue | null;
  earnings: FundEarnings | null;
  news: { lean: "Bullish" | "Bearish" | "Neutral"; label: string; text: string };
  generatedBy: string;
  asOf: string;
}

export const fetchFundamentals = (symbol: string) =>
  get<FundamentalsResponse>(`/api/fundamentals?symbol=${encodeURIComponent(symbol)}`);

// ---- Peer / sector comparison ----
export interface PeerRow {
  symbol: string;
  display: string;
  composite: number | null;
  pePct: string | null; // formatted P/E
  netMarginPct: number | null;
  revenueGrowthPct: number | null;
  isTarget: boolean;
}

export interface PeersResponse {
  symbol: string;
  sector: string | null;
  /** The target's percentile (0-100) among peers on the composite score. */
  compositePercentile: number | null;
  rows: PeerRow[];
}

export const fetchPeers = (symbol: string) =>
  get<PeersResponse>(`/api/peers?symbol=${encodeURIComponent(symbol)}`);

// ---- Fundamental screener ----
export interface ScreenerRow {
  symbol: string;
  composite: number | null;
  profitability: number | null;
  valuation: number | null;
  cashFlow: number | null;
  pe: number | null;
  netMarginPct: number | null;
  revenueGrowthPct: number | null;
  dividendYieldPct: number | null;
}

export interface ScreenerResponse {
  rows: ScreenerRow[];
  asOf: string;
}

export const fetchScreener = () => get<ScreenerResponse>(`/api/screener`);

// ---- Consolidated dashboard overview (timeframes + sentiment + trend-bias) ----
export interface OverviewResponse {
  timeframes: { rows: TimeframeRow[]; currency: string; tz: string; source: string };
  sentiment: Omit<SentimentResponse, "asOf">;
  trendBias: TrendBiasResult & { source: string };
  asOf: string;
}

export const fetchOverview = (symbol: string) =>
  get<OverviewResponse>(`/api/overview?symbol=${encodeURIComponent(symbol)}`);

export const fetchCalendar = () =>
  get<{ events: CalendarEvent[]; source: string; asOf: string }>(`/api/calendar`);

export interface SearchHit {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}
export const fetchSearch = (q: string) =>
  get<{ hits: SearchHit[] }>(`/api/search?q=${encodeURIComponent(q)}`);
