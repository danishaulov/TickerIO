import type { MetadataRoute } from "next";

const BASE = "https://ticker-io.vercel.app";

/** A few popular tickers plus the landing page. */
const POPULAR = ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "BTC", "ETH", "SOL", "EURUSD"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...["markets", "screen", "compare"].map((page) => ({
      url: `${BASE}/${page}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8,
    })),
    ...POPULAR.map((s) => ({
      url: `${BASE}/${s}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
  ];
}
