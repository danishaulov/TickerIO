"use client";

import { useQueries } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { X, Link as LinkIcon, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { fetchCandles, fetchQuote, fetchTimeframes } from "@/lib/api";
import { formatPrice, formatPercent, direction } from "@/lib/format";
import { parseCompareSymbols, normalizeSymbols, COMPARE_LIMIT } from "@/lib/symbol-list";
import { normalizeComparison } from "@/lib/finance/comparison";
import { downloadCsv } from "@/lib/export";
import { SymbolAutocomplete } from "@/components/SymbolAutocomplete";
import { CompareChart } from "./CompareChart";
import { Skeleton } from "@/components/ui/Skeleton";

const PALETTE = ["#5b9bff", "#1fd396", "#f7b733", "#ff6b86", "#ac8aff", "#1cbec8"];
const PERIODS = [
  { key: "1M", range: "1mo" }, { key: "3M", range: "3mo" }, { key: "6M", range: "6mo" },
  { key: "YTD", range: "ytd" }, { key: "1Y", range: "1y" },
];
const PRESETS = [
  { label: "ענקיות טכנולוגיה", symbols: ["AAPL", "MSFT", "NVDA"] },
  { label: "קריפטו", symbols: ["BTC", "ETH", "SOL"] },
  { label: "מבט על השוק", symbols: ["SPY", "QQQ", "GLD", "BTC"] },
];

export function CompareClient() {
  const params = useSearchParams();
  const symbols = parseCompareSymbols(params.get("symbols"));
  const period = PERIODS.some((p) => p.key === params.get("period")) ? params.get("period")! : "1Y";
  const range = PERIODS.find((p) => p.key === period)!.range;
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  function update(nextSymbols: string[], nextPeriod = period) {
    const query = new URLSearchParams({ symbols: normalizeSymbols(nextSymbols, COMPARE_LIMIT).join(","), period: nextPeriod });
    window.history.replaceState(null, "", `/compare?${query}`);
    setMessage("");
  }
  const quoteResults = useQueries({ queries: symbols.map((s) => ({ queryKey: ["quote", s], queryFn: () => fetchQuote(s), refetchInterval: 30_000 })) });
  const tfResults = useQueries({ queries: symbols.map((s) => ({ queryKey: ["timeframes", s], queryFn: () => fetchTimeframes(s) })) });
  const candleResults = useQueries({ queries: symbols.map((s) => ({ queryKey: ["candles", s, range, "1d"], queryFn: () => fetchCandles(s, range, "1d") })) });
  const series = normalizeComparison(symbols.map((symbol, i) => ({
    symbol, color: PALETTE[i], candles: candleResults[i].data?.candles ?? [],
  })));
  const pending = candleResults.some((r) => r.isPending);
  const failed = symbols.filter((_, i) => candleResults[i].isError || (!candleResults[i].isPending && (candleResults[i].data?.candles.length ?? 0) < 2));

  async function refresh() {
    setRefreshing(true);
    await Promise.allSettled([...quoteResults, ...tfResults, ...candleResults].map((r) => r.refetch()));
    setRefreshing(false);
  }
  async function share() {
    try { await navigator.clipboard.writeText(window.location.href); setMessage("קישור ההשוואה הועתק."); }
    catch { setMessage("העתקת הקישור אינה זמינה. אפשר להעתיק את הכתובת משורת הכתובת."); }
  }
  function exportComparison() {
    const dates = [...new Set(series.flatMap((s) => s.points.map((p) => p.t)))].sort((a, b) => a - b);
    downloadCsv(`tickerio-compare-${period}.csv`, [
      ["Date (UTC)", ...series.map((s) => `${s.symbol} return %`)],
      ...dates.map((t) => [new Date(t).toISOString().slice(0, 10), ...series.map((s) => s.points.find((p) => p.t === t)?.value)]),
    ]);
  }
  function percentCell(value: number | undefined, loading: boolean) {
    if (value == null) return loading ? <Skeleton className="ms-auto h-4 w-12" /> : <span className="text-[var(--fg-dim)]">—</span>;
    return <span className="font-mono-num" style={{ color: direction(value) === "up" ? "var(--up)" : direction(value) === "down" ? "var(--down)" : "var(--fg-muted)" }}>{formatPercent(value)}</span>;
  }

  return <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-display text-3xl font-extrabold">השוואת ביצועים</h1><p className="mt-2 text-sm text-[var(--fg-muted)]">מניות, קריפטו ומדדים על אותו ציר זמן. התחלה משותפת, תמונה ברורה.</p></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={share} className="control inline-flex items-center gap-2"><LinkIcon size={15} />העתק קישור</button>
        <button onClick={exportComparison} disabled={!series.length || pending} className="control inline-flex items-center gap-2"><Download size={15} />ייצוא CSV</button>
        <button onClick={refresh} disabled={refreshing || !symbols.length} className="control" aria-label="רענן השוואה"><RefreshCw size={16} className={refreshing ? "animate-spin motion-reduce:animate-none" : ""} /></button>
      </div>
    </div>
    {message && <p role="status" className="mb-4 text-sm text-[var(--accent)]">{message}</p>}
    <div className="mb-5 flex flex-wrap items-center gap-2"><span className="me-1 text-xs text-[var(--fg-muted)]">התחלה מהירה</span>{PRESETS.map((p) => <button key={p.label} onClick={() => update(p.symbols)} className="control">{p.label}</button>)}</div>
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <SymbolAutocomplete onSelect={(s) => update([...symbols, s])} disabled={symbols.length >= COMPARE_LIMIT} placeholder={symbols.length >= COMPARE_LIMIT ? "עד 6 סמלים בהשוואה" : "הוספת סמל להשוואה…"} className="w-full sm:w-72" />
      {symbols.map((s, i) => <span key={s} className="inline-flex items-center gap-2 rounded-lg border bg-[var(--panel)] px-3 py-2 text-sm font-semibold">
        <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i] }} /><bdi>{s}</bdi>
        <button onClick={() => update(symbols.filter((x) => x !== s))} aria-label={`הסר ${s}`} className="p-1"><X size={14} /></button>
      </span>)}
      <span dir="ltr" className="font-mono-num text-xs text-[var(--fg-dim)]">{symbols.length} / {COMPARE_LIMIT}</span>
    </div>
    <section className="panel p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--fg-muted)]">תשואה מתחילת התקופה המשותפת</h2>
        <div role="group" aria-label="תקופת ההשוואה" dir="ltr" className="inline-flex gap-1 rounded-lg border p-1">
          {PERIODS.map((p) => <button key={p.key} onClick={() => update(symbols, p.key)} aria-pressed={period === p.key} className={`rounded-md px-3 py-2 text-xs font-semibold ${period === p.key ? "bg-[var(--accent)] text-white" : "text-[var(--fg-muted)]"}`}>{p.key}</button>)}
        </div>
      </div>
      {failed.length > 0 && <p role="status" className="mb-4 text-xs text-[var(--warn)]">אין נתוני גרף עבור <bdi>{failed.join(", ")}</bdi>. סמלים זמינים מוצגים. אפשר לנסות רענון.</p>}
      {symbols.length === 0 ? <div className="py-16 text-center"><p>בחרו סמלים להשוואה או התחילו מאחת הקבוצות למעלה.</p></div>
        : pending ? <Skeleton className="h-[320px] w-full" /> : <CompareChart key={symbols.join(",") + period} series={series} />}
    </section>
    {symbols.length > 0 && <section className="panel mt-5 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <caption className="sr-only">מחירים ושינויים לתקופות שונות. שינוי התקופה הוא מול תאריך הבסיס המשותף בגרף.</caption>
        <thead><tr className="border-b bg-[var(--panel-2)] text-[var(--fg-muted)]">
          <th scope="col" className="px-4 py-3 text-start font-medium">סמל</th>
          {["מחיר", "בתקופה", "יומי", "שבועי", "חודשי", "מתחילת השנה"].map((text) => <th scope="col" key={text} className="whitespace-nowrap px-4 py-3 text-end font-medium">{text}</th>)}
        </tr></thead>
        <tbody>{symbols.map((s, i) => {
          const q = quoteResults[i].data;
          const normalized = series.find((x) => x.symbol === s);
          return <tr key={s} className="border-b last:border-0">
            <th scope="row" className="px-4 py-4 text-start"><Link href={`/${encodeURIComponent(s)}`} className="flex items-center gap-2 font-semibold hover:text-[var(--accent)]"><span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i] }} /><bdi>{q?.display ?? s}</bdi></Link></th>
            <td className="px-4 py-4 text-end font-mono-num">{q ? formatPrice(q.price, q.currency) : quoteResults[i].isPending ? <Skeleton className="ms-auto h-4 w-16" /> : "—"}{q && (q.stale || quoteResults[i].isError) && <span className="mt-1 block text-[10px] text-[var(--warn)]">מושהה</span>}</td>
            <td className="px-4 py-4 text-end">{percentCell(normalized?.points.at(-1)?.value, pending)}</td>
            {["Day", "Week", "Month", "YTD"].map((label) => <td key={label} className="px-4 py-4 text-end">{percentCell(tfResults[i].data?.rows.find((r) => r.label === label)?.changePct, tfResults[i].isPending)}</td>)}
          </tr>;
        })}</tbody>
      </table></div>
    </section>}
    <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-[var(--fg-muted)]">כל הסדרות מתחילות ב־0% בתאריך המסחר הראשון המשותף ומסתיימות בתאריך האחרון המשותף. הציר מבוסס על תאריכים, כולל סופי שבוע בקריפטו. תשואת מחיר ללא התאמה לדיבידנדים; יומי ושאר הטווחים בטבלה מעוגנים לפתיחת התקופה. Yahoo Finance.</p>
  </main>;
}
