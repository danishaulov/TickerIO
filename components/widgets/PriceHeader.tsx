"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { QuoteResponse } from "@/lib/api";
import { formatPrice, formatPercent, formatSignedPrice, direction } from "@/lib/format";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Skeleton } from "@/components/ui/Skeleton";
import { WatchStar } from "@/components/WatchStar";
import { AlertButton } from "@/components/AlertButton";
import { UI, assetClassHe, relTimeHe } from "@/lib/i18n/he";
import { Sparkline } from "./Sparkline";

export function PriceHeader({
  quote,
  spark,
  loading,
  error,
}: {
  quote?: QuoteResponse;
  spark: number[];
  loading: boolean;
  error?: string | null;
}) {
  if (loading && !quote) {
    return (
      <section className="panel p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-56" />
        <Skeleton className="mt-5 h-12 w-64" />
      </section>
    );
  }

  if (!quote) {
    return (
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">{UI.couldntLoadSymbol}</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          {error ?? UI.noData}. {UI.tryAnother}
        </p>
      </section>
    );
  }

  const dir = direction(quote.changePct);
  const up = dir !== "down";
  const color = up ? "var(--up)" : "var(--down)";
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const currency = quote.currency || "USD";

  return (
    <section className="panel p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 dir="ltr" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{quote.display}</h1>
            <span
              className="rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide text-[var(--fg-muted)]"
              style={{ borderColor: "var(--border-strong)" }}
            >
              {assetClassHe(quote.assetClass)}
            </span>
            {quote.stale || error ? (
              <span className="text-xs font-semibold" style={{ color: "var(--warn)" }}>
                {UI.delayed}
              </span>
            ) : (
              <span className="text-xs font-medium text-[var(--fg-muted)]">מחיר אחרון</span>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {quote.name}
            {quote.exchange ? ` · ${quote.exchange}` : ""}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <AnimatedNumber
              value={quote.price}
              format={(n) => formatPrice(n, currency)}
              className="font-mono-num text-3xl font-semibold leading-none sm:text-4xl"
            />
            <div dir="ltr" className="flex items-center gap-2 pb-1" style={{ color }}>
              <span className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold tabular" style={{ background: up ? "var(--up-soft)" : "var(--down-soft)" }}>
                <Icon size={14} strokeWidth={2.5} />
                {formatPercent(quote.changePct)}
              </span>
              <span className="font-mono-num text-sm">{formatSignedPrice(quote.change, currency)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--fg-dim)" }}>
            {UI.vsPrevClose} · {quote.source} · {relTimeHe(quote.asOf)}
          </p>
        </div>

        <div className="ms-auto flex min-w-0 max-w-full items-center gap-3">
          {spark.length > 1 ? (
            <span dir="ltr" className="min-w-0 w-40 sm:w-64 [&_svg]:w-full">
              <Sparkline data={spark} up={up} width={260} height={64} />
            </span>
          ) : (
            <Skeleton className="h-16 w-40 sm:w-64" />
          )}
          <AlertButton symbol={quote.symbol} price={quote.price} currency={currency} />
          <WatchStar symbol={quote.symbol} />
        </div>
      </div>
    </section>
  );
}
