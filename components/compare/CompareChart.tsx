"use client";

import { useEffect, useRef, useState } from "react";
import { formatPercent } from "@/lib/format";
import type { NormalizedSeries } from "@/lib/finance/comparison";

const dateLabel = (t: number) => new Date(t).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "2-digit", timeZone: "UTC" });

export function CompareChart({ series, height = 320 }: { series: NormalizedSeries[]; height?: number }) {
  const [cursor, setCursor] = useState<number | null>(null);
  const [width, setWidth] = useState(920);
  const chartRef = useRef<HTMLDivElement>(null);
  const hasData = series.length > 0;
  useEffect(() => {
    if (!chartRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, [hasData]);
  const chartHeight = width < 500 ? 240 : height;
  const left = 48;
  const right = 12;
  const top = 18;
  const bottom = 30;
  if (!series.length) return <div className="grid min-h-64 place-items-center text-center text-sm text-[var(--fg-muted)]">אין מספיק תאריכים משותפים להצגת ההשוואה.</div>;

  const times = [...new Set(series.flatMap((s) => s.points.map((p) => p.t)))].sort((a, b) => a - b);
  const start = times[0];
  const end = times[times.length - 1];
  const values = series.flatMap((s) => s.points.map((p) => p.value));
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 0);
  const padding = (rawMax - rawMin || 2) * .1;
  const min = rawMin - padding;
  const max = rawMax + padding;
  const x = (t: number) => left + (t - start) / (end - start || 1) * (width - left - right);
  const y = (value: number) => top + (1 - (value - min) / (max - min)) * (chartHeight - top - bottom);
  const index = cursor == null ? times.length - 1 : Math.min(cursor, times.length - 1);
  const date = times[index];
  const current = series.map((s) => ({ ...s, point: s.points.findLast((p) => p.t <= date)! }));

  return <div>
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
      <span className="text-[var(--fg-muted)]">{dateLabel(date)}</span>
      {current.map((s) => <span key={s.symbol} dir="ltr" className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
        <span className="font-semibold">{s.symbol}</span>
        <span className="font-mono-num" style={{ color: s.point.value >= 0 ? "var(--up)" : "var(--down)" }}>{formatPercent(s.point.value)}</span>
      </span>)}
    </div>
    <div dir="ltr" ref={chartRef} className="relative touch-pan-y"
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, ((e.clientX - box.left) / box.width * width - left) / (width - left - right)));
        const t = start + ratio * (end - start);
        const nearest = times.findIndex((time) => time >= t);
        setCursor(nearest < 0 ? times.length - 1 : nearest);
      }}
      onPointerLeave={() => setCursor(null)}>
      <svg width="100%" viewBox={`0 0 ${width} ${chartHeight}`} role="img" aria-label="השוואת שינוי באחוזים לפי תאריך; פרטי התוצאות מופיעים במקרא ובטבלה">
        {[0, 1, 2, 3, 4].map((i) => {
          const value = min + i / 4 * (max - min);
          return <g key={i}><line x1={left} y1={y(value)} x2={width - right} y2={y(value)} stroke="var(--border)" /><text x={left - 8} y={y(value) + 4} fontSize={11} textAnchor="end" fill="var(--fg-muted)">{value.toFixed(1)}%</text></g>;
        })}
        <line x1={left} y1={y(0)} x2={width - right} y2={y(0)} stroke="var(--border-strong)" strokeDasharray="4 4" />
        {[start, end].map((t, i) => <text key={i} x={x(t)} y={chartHeight - 5} fontSize={11} textAnchor={i === 0 ? "start" : "end"} fill="var(--fg-muted)">{dateLabel(t)}</text>)}
        {series.map((s) => <path key={s.symbol} d={s.points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ")} fill="none" stroke={s.color} strokeWidth={2.25} strokeLinejoin="round" />)}
        {cursor != null && <>
          <line x1={x(date)} y1={top} x2={x(date)} y2={chartHeight - bottom} stroke="var(--fg-dim)" strokeDasharray="3 4" />
          {current.map((s) => <circle key={s.symbol} cx={x(s.point.t)} cy={y(s.point.value)} r={4} fill={s.color} stroke="var(--panel)" strokeWidth={2} />)}
        </>}
      </svg>
      <input type="range" min={0} max={times.length - 1} value={index} onChange={(e) => setCursor(Number(e.target.value))} aria-label="תאריך להשוואה בגרף" aria-valuetext={dateLabel(date)} className="mt-3 w-full accent-[var(--accent)]" />
    </div>
    <p className="mt-1 text-[11px] text-[var(--fg-muted)]">הזיזו את הסמן או את המחוון לבדיקת תאריך. ביום ללא מסחר, המקרא מציג את הסגירה הזמינה האחרונה.</p>
  </div>;
}
