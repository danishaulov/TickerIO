"use client";

import { motion } from "motion/react";
import { TrendingUp, Coins, Wallet, ShieldCheck, Newspaper, LineChart, Scale, CalendarClock, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import type { FundamentalsResponse, FundPillar, FundMetric, FundBand, FundTrends, FundFairValue, FundEarnings } from "@/lib/api";
import { UI, marginDirectionHe } from "@/lib/i18n/he";

function EarningsSection({ e }: { e: FundEarnings }) {
  return (
    <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--border)] p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
        <CalendarClock size={15} style={{ color: "var(--fg-muted)" }} /> {UI.earnings}
      </h4>
      {e.nextDateText && (
        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>{UI.nextEarnings}</span>
          <span className="text-sm font-semibold text-[var(--fg)]">{e.nextDateText}</span>
          {e.daysUntil != null && e.daysUntil >= 0 && (
            <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ color: "var(--accent)", background: "var(--panel-2)" }}>
              {UI.inDays(e.daysUntil)}{e.isEstimate ? ` ${UI.earningsEstimate}` : ""}
            </span>
          )}
        </div>
      )}
      {e.surprisesPct.length > 0 && (
        <>
          <p className="mb-1.5 text-[11px]" style={{ color: "var(--fg-dim)" }}>{UI.beatMissHistory}</p>
          <div dir="ltr" className="flex flex-wrap gap-1.5">
            {e.surprisesPct.map((s, i) => (
              <span
                key={i}
                className="font-mono-num rounded px-1.5 py-0.5 text-xs font-semibold"
                style={{ color: s >= 0 ? "var(--up)" : "var(--down)", background: "var(--panel-2)" }}
              >
                {s > 0 ? "+" : ""}{s}%
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
import { WidgetCard } from "./WidgetCard";
import { Skeleton } from "@/components/ui/Skeleton";

function bandColor(band: FundBand | null): string {
  if (band === "excellent" || band === "good") return "var(--up)";
  if (band === "fair") return "var(--warn)";
  if (band === "weak" || band === "poor") return "var(--down)";
  return "var(--fg-muted)";
}

function leanColor(lean: FundamentalsResponse["news"]["lean"]): string {
  return lean === "Bullish" ? "var(--up)" : lean === "Bearish" ? "var(--down)" : "var(--warn)";
}

const PILLAR_ICON: Record<string, typeof TrendingUp> = {
  profitability: TrendingUp,
  valuation: Coins,
  cashFlow: Wallet,
  strengthForward: ShieldCheck,
};

function GradeChip({ band, word }: { band: FundBand | null; word: string | null }) {
  if (!word) {
    return (
      <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ color: "var(--fg-dim)", background: "var(--panel-2)" }}>
        {UI.partialData}
      </span>
    );
  }
  return (
    <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ color: bandColor(band), background: "var(--panel-2)" }}>
      {word}
    </span>
  );
}

function ScoreBar({ score, band }: { score: number; band: FundBand | null }) {
  return (
    <div className="relative h-2 flex-1 rounded-full" style={{ background: "var(--panel-2)" }}>
      <motion.div
        className="absolute top-0 h-full rounded-full"
        style={{ insetInlineStart: 0, background: bandColor(band) }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function MetricRow({ m }: { m: FundMetric }) {
  const color = m.tone === "up" ? "var(--up)" : m.tone === "down" ? "var(--down)" : "var(--fg)";
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-1.5 last:border-0">
      <span className="text-sm" style={{ color: "var(--fg-muted)" }} title={m.hint || undefined}>
        {m.label}
      </span>
      <span className="font-mono-num ltr-num text-sm" style={{ color }}>
        {m.value}
      </span>
    </div>
  );
}

function PillarBlock({ p }: { p: FundPillar }) {
  const Icon = PILLAR_ICON[p.key] ?? TrendingUp;
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
          <Icon size={15} style={{ color: "var(--fg-muted)" }} /> {p.title}
        </h4>
        <GradeChip band={p.band} word={p.bandWord} />
      </div>
      {p.score != null && (
        <div className="mb-3 flex items-center gap-3">
          <ScoreBar score={p.score} band={p.band} />
          <span className="font-mono-num ltr-num text-xs" style={{ color: "var(--fg-dim)" }}>{p.score}</span>
        </div>
      )}
      <p className="mb-3 text-sm leading-relaxed text-[var(--fg)]">{p.verdict}</p>
      {p.metrics.length > 0 && <div className="space-y-0.5">{p.metrics.map((m) => <MetricRow key={m.id} m={m} />)}</div>}
      {p.notes.length > 0 && (
        <ul className="mt-3 space-y-1">
          {p.notes.map((n, i) => (
            <li key={i} className="text-[11px] leading-relaxed" style={{ color: "var(--fg-dim)" }}>• {n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CagrBadge({ label, pct }: { label: string; pct: number | null }) {
  if (pct == null) return null;
  const color = pct >= 0 ? "var(--up)" : "var(--down)";
  return (
    <div className="flex flex-col">
      <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>{label}</span>
      <span className="font-mono-num ltr-num text-sm font-semibold" style={{ color }}>
        {pct > 0 ? "+" : ""}{pct}%
      </span>
    </div>
  );
}

function TrendsSection({ trends }: { trends: FundTrends }) {
  const pts = trends.marginPoints.filter((p) => p.netMarginPct != null);
  const maxM = Math.max(1, ...pts.map((p) => Math.abs(p.netMarginPct as number)));
  const dir = marginDirectionHe(trends.marginDirection);
  return (
    <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--border)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
          <LineChart size={15} style={{ color: "var(--fg-muted)" }} /> {UI.trends}
        </h4>
        {dir && (
          <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ color: dir.color, background: "var(--panel-2)" }}>
            {dir.label}
          </span>
        )}
      </div>
      <div className="flex gap-6">
        <CagrBadge label={UI.revenueCagr} pct={trends.revenueCagrPct} />
        <CagrBadge label={UI.earningsCagr} pct={trends.earningsCagrPct} />
      </div>
      {pts.length > 0 && (
        <>
          <p className="mb-1.5 mt-3 text-[11px]" style={{ color: "var(--fg-dim)" }}>{UI.netMarginByYear}</p>
          <div dir="ltr" className="flex items-end gap-2" style={{ height: 60 }}>
            {pts.map((p) => {
              const h = Math.max(4, (Math.abs(p.netMarginPct as number) / maxM) * 52);
              const neg = (p.netMarginPct as number) < 0;
              return (
                <div key={p.year} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="font-mono-num text-[10px]" style={{ color: "var(--fg-muted)" }}>{p.netMarginPct}%</span>
                  <div className="w-full rounded-t" style={{ height: h, background: neg ? "var(--down)" : "var(--up)", opacity: 0.85 }} />
                  <span className="font-mono-num text-[10px]" style={{ color: "var(--fg-dim)" }}>{p.year}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function FairValueSection({ fv }: { fv: FundFairValue }) {
  const up = fv.upsidePct != null && fv.upsidePct >= 0;
  const upColor = fv.upsidePct == null ? "var(--fg-muted)" : up ? "var(--up)" : "var(--down)";
  return (
    <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--border)] p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
        <Scale size={15} style={{ color: "var(--fg-muted)" }} /> {UI.fairValue}
      </h4>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div className="flex flex-col">
          <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>{UI.fairValue}</span>
          <span className="font-mono-num ltr-num text-xl font-bold" style={{ color: upColor }}>{fv.fairValueText}</span>
        </div>
        {fv.upsidePct != null && (
          <div className="flex flex-col">
            <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>{UI.upsideToFair}</span>
            <span className="font-mono-num ltr-num text-sm font-semibold" style={{ color: upColor }}>
              {fv.upsidePct > 0 ? "+" : ""}{fv.upsidePct}%
            </span>
          </div>
        )}
        {fv.impliedGrowthPct != null && (
          <div className="flex flex-col">
            <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>{UI.impliedGrowth}</span>
            <span className="font-mono-num ltr-num text-sm" style={{ color: "var(--fg)" }}>{fv.impliedGrowthPct}%</span>
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--fg-dim)" }}>
        {UI.dcfAssumptions(fv.discountRatePct, fv.growthPct)}
      </p>
    </div>
  );
}

function SignalList({
  title, items, tone, Icon,
}: {
  title: string; items: string[]; tone: "up" | "down"; Icon: typeof CheckCircle2;
}) {
  const color = tone === "up" ? "var(--up)" : "var(--down)";
  return (
    <div>
      <h5 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color }}>
        <Icon size={14} /> {title}
      </h5>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[var(--fg)]">
            <Icon size={13} className="mt-0.5 shrink-0" style={{ color }} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Scannable bottom-line summary: a few takeaway bullets + a strengths/risks split.
 * The fastest way for a reader to "get" the asset before diving into the pillars.
 */
function SummarySection({
  takeaways, strengths, risks,
}: {
  takeaways: string[]; strengths: string[]; risks: string[];
}) {
  if (!takeaways.length && !strengths.length && !risks.length) return null;
  return (
    <div className="mb-5 rounded-[var(--radius-sm)] border border-[var(--border)] p-4" style={{ background: "var(--panel-2)" }}>
      {takeaways.length > 0 && (
        <>
          <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
            <Sparkles size={15} style={{ color: "var(--accent)" }} /> {UI.bottomLine}
          </h4>
          <ul className={`space-y-1.5 ${strengths.length || risks.length ? "mb-4" : ""}`}>
            {takeaways.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-[var(--fg)]">
                <span className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {(strengths.length > 0 || risks.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {strengths.length > 0 && <SignalList title={UI.strengths} items={strengths} tone="up" Icon={CheckCircle2} />}
          {risks.length > 0 && <SignalList title={UI.risks} items={risks} tone="down" Icon={AlertTriangle} />}
        </div>
      )}
    </div>
  );
}

function NewsImpact({ news }: { news: FundamentalsResponse["news"] }) {
  return (
    <div className="mt-5 rounded-[var(--radius-sm)] border border-[var(--border)] p-4" style={{ background: "var(--panel-2)" }}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
          <Newspaper size={15} style={{ color: "var(--fg-muted)" }} /> {UI.newsImpact}
        </h4>
        <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ color: leanColor(news.lean), background: "var(--panel)" }}>
          {news.label}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--fg)]">{news.text}</p>
    </div>
  );
}

function Footer({ generatedBy }: { generatedBy: string }) {
  return (
    <p className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[11px]" style={{ color: "var(--fg-dim)" }}>
      <span>{UI.aiDisclaimer} · {UI.fundamentalsViaYahoo}</span>
      <span>{UI.via(generatedBy)}</span>
    </p>
  );
}

function LoadingState() {
  return (
    <WidgetCard title={UI.fundamentalAnalysis}>
      <div className="mb-5 flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
      </div>
    </WidgetCard>
  );
}

/**
 * Hebrew fundamental analysis (CLAUDE.md §5.2, extended). Composite grade + the
 * five user-requested sections: רווחיות, הערכת שווי, תזרים מזומנים, איתנות
 * פיננסית ונתונים עתידיים, וניתוח פונדמנטלי של החדשות. All verdicts are LLM
 * narrations of deterministically-computed scores (heuristic Hebrew fallback).
 * Crypto/forex/index degrade to a market + news read.
 */
export function FundamentalAnalysis({ data, loading }: { data?: FundamentalsResponse; loading: boolean }) {
  if (loading || !data) return <LoadingState />;

  const compositeColor = bandColor(data.compositeBand);

  // Degraded (crypto / forex / index) — market read + news only.
  if (data.degraded) {
    return (
      <WidgetCard title={UI.fundamentalAnalysis}>
        <p className="mb-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>{UI.degradedNotice}</p>
        <SummarySection takeaways={data.keyTakeaways} strengths={data.strengths} risks={data.risks} />
        <p className="mb-4 text-sm leading-relaxed text-[var(--fg)]">{data.overview}</p>
        {data.marketRead.length > 0 && (
          <>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>{UI.marketRead}</h4>
            <div className="space-y-0.5">{data.marketRead.map((m) => <MetricRow key={m.id} m={m} />)}</div>
          </>
        )}
        <NewsImpact news={data.news} />
        <Footer generatedBy={data.generatedBy} />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title={UI.fundamentalAnalysis}>
      {/* Composite header */}
      <div className="mb-5 flex items-start gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
          style={{ background: "var(--panel-2)", border: `1px solid ${compositeColor}` }}
        >
          <span className="font-mono-num ltr-num text-3xl font-bold" style={{ color: compositeColor }}>
            {data.composite ?? "—"}
          </span>
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--fg-dim)" }}>{UI.overallGrade}</span>
            {data.compositeWord && (
              <span className="text-lg font-bold" style={{ color: compositeColor }}>{data.compositeWord}</span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-[var(--fg)]">{data.overview}</p>
        </div>
      </div>

      {/* Scannable bottom line + strengths / risks */}
      <SummarySection takeaways={data.keyTakeaways} strengths={data.strengths} risks={data.risks} />

      {/* Pillars 1–4 */}
      <div className="grid gap-4 xl:grid-cols-2">
        {data.pillars.map((p) => <PillarBlock key={p.key} p={p} />)}
      </div>

      {/* Multi-period trends + DCF fair value + earnings calendar */}
      {data.trends && <TrendsSection trends={data.trends} />}
      {data.fairValue && <FairValueSection fv={data.fairValue} />}
      {data.earnings && <EarningsSection e={data.earnings} />}

      {/* Section 5 — news fundamental analysis */}
      <NewsImpact news={data.news} />
      <Footer generatedBy={data.generatedBy} />
    </WidgetCard>
  );
}
