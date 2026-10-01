"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { fetchQuote } from "@/lib/api";
import { formatPrice, formatPercent, direction } from "@/lib/format";
import { normalizeSymbol } from "@/lib/symbol-list";

const TAPE = [
  "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META",
  "BTC", "ETH", "SOL", "^GSPC", "EURUSD",
];

function Item({ symbol, duplicate }: { symbol: string; duplicate: boolean }) {
  const key = normalizeSymbol(symbol);
  const { data } = useQueries({
    queries: [{ queryKey: ["quote", key], queryFn: () => fetchQuote(key), refetchInterval: 30_000 }],
  })[0];

  const dir = data ? direction(data.changePct) : "flat";
  const color = dir === "up" ? "var(--up)" : dir === "down" ? "var(--down)" : "var(--fg-muted)";

  return (
    <Link
      tabIndex={duplicate ? -1 : undefined}
      href={`/${encodeURIComponent(data?.symbol ?? symbol)}`}
      className="flex shrink-0 items-center gap-2 px-4 py-2 transition-opacity hover:opacity-100"
      style={{ opacity: data ? 1 : 0.4 }}
    >
      <span className="text-xs font-semibold">{data?.display ?? symbol}</span>
      {data && (
        <>
          <span className="font-mono-num text-xs" style={{ color: "var(--fg-muted)" }}>
            {formatPrice(data.price, data.currency)}
          </span>
          <span className="font-mono-num text-xs font-semibold" style={{ color }}>
            {formatPercent(data.changePct)}
          </span>
        </>
      )}
    </Link>
  );
}

/** Continuously scrolling live quote tape. Pauses on hover. */
export function TickerTape() {
  return (
    <div dir="ltr" className="marquee border-y border-[var(--border)] bg-[var(--tape-bg)]">
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
            {TAPE.map((s) => (
              <div key={`${dup}-${s}`} className="flex items-center">
                <Item symbol={s} duplicate={dup === 1} />
                <span className="h-3 w-px" style={{ background: "var(--border)" }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
