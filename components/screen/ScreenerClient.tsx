"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, Download, RefreshCw, Search } from "lucide-react";
import { useScreener } from "@/lib/hooks";
import type { ScreenerRow } from "@/lib/api";
import { downloadCsv } from "@/lib/export";
import { WatchStar } from "@/components/WatchStar";
import { Skeleton } from "@/components/ui/Skeleton";

type Key = keyof Omit<ScreenerRow, "symbol">;
const COLS: { key: Key; label: string; pct?: boolean }[] = [
  { key: "composite", label: "ציון כולל" }, { key: "profitability", label: "רווחיות" },
  { key: "valuation", label: "שווי" }, { key: "cashFlow", label: "תזרים" },
  { key: "pe", label: "P/E" }, { key: "netMarginPct", label: "מרווח", pct: true },
  { key: "revenueGrowthPct", label: "צמיחה", pct: true }, { key: "dividendYieldPct", label: "דיבידנד", pct: true },
];
const FILTERS = [
  { key: "all", label: "כל המניות" }, { key: "quality", label: "איכות גבוהה" },
  { key: "growth", label: "צמיחה חיובית" }, { key: "dividend", label: "משלמות דיבידנד" },
];
function scoreColor(s: number | null): string {
  return s == null ? "var(--fg-dim)" : s >= 65 ? "var(--up)" : s >= 50 ? "var(--warn)" : "var(--down)";
}

export function ScreenerClient() {
  const query = useScreener();
  const [sortKey, setSortKey] = useState<Key>("composite");
  const [ascending, setAscending] = useState(false);
  const [minComposite, setMinComposite] = useState(0);
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState("all");
  const rows = useMemo(() => (query.data?.rows ?? [])
    .filter((r) => r.symbol.toLowerCase().includes(search.trim().toLowerCase()) && (r.composite ?? 0) >= minComposite)
    .filter((r) => preset === "quality" ? (r.composite ?? 0) >= 65 : preset === "growth" ? (r.revenueGrowthPct ?? 0) > 0 : preset === "dividend" ? (r.dividendYieldPct ?? 0) > 0 : true)
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return bv == null ? a.symbol.localeCompare(b.symbol) : 1;
      if (bv == null) return -1;
      return (ascending ? av - bv : bv - av) || a.symbol.localeCompare(b.symbol);
    }), [query.data, sortKey, ascending, minComposite, search, preset]);

  function sort(key: Key) {
    if (key === sortKey) setAscending(!ascending);
    else { setSortKey(key); setAscending(key === "pe"); }
  }
  function reset() { setSearch(""); setPreset("all"); setMinComposite(0); }
  return <main className="mx-auto w-full max-w-[1300px] px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-display text-3xl font-extrabold">סקרינר פונדמנטלי</h1><p className="mt-2 text-sm text-[var(--fg-muted)]">מצאו את המניות שמתאימות למחקר שלכם. סננו, מיינו והוסיפו למעקב.</p></div>
      <div className="flex gap-2">
        <button disabled={!rows.length} className="control inline-flex items-center gap-2" onClick={() => downloadCsv("tickerio-screener.csv", [["Symbol", ...COLS.map((c) => c.key)], ...rows.map((r) => [r.symbol, ...COLS.map((c) => r[c.key])])])}><Download size={15} />ייצוא CSV</button>
        <button onClick={() => query.refetch()} disabled={query.isFetching} aria-label="רענן סקרינר" className="control"><RefreshCw size={16} className={query.isFetching ? "animate-spin motion-reduce:animate-none" : ""} /></button>
      </div>
    </div>
    <div role="group" aria-label="מסננים מהירים" className="mt-6 flex flex-wrap gap-2">{FILTERS.map((p) => <button key={p.key} onClick={() => setPreset(p.key)} aria-pressed={preset === p.key} className={`control ${preset === p.key ? "control-primary" : ""}`}>{p.label}</button>)}</div>
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <div className="relative w-full sm:w-56"><Search size={15} className="absolute start-3 top-3 text-[var(--fg-dim)]" /><input aria-label="סינון סקרינר לפי סמל" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש לפי סמל…" className="control w-full ps-9" /></div>
      <label htmlFor="minimum-score" className="text-sm text-[var(--fg-muted)]">ציון כולל מינימלי</label>
      <input id="minimum-score" type="range" min={0} max={90} step={5} value={minComposite} onChange={(e) => setMinComposite(Number(e.target.value))} className="w-36 accent-[var(--accent)]" />
      <output htmlFor="minimum-score" className="font-mono-num text-sm font-semibold">{minComposite}</output>
      <span className="ms-auto text-xs text-[var(--fg-muted)]">{rows.length} מתוך {query.data?.rows.length ?? 0} מניות</span>
    </div>
    {query.isError && <div role="alert" className="mt-5 rounded-lg border p-4 text-sm text-[var(--warn)]">לא ניתן לעדכן את הסקרינר כרגע. {query.data ? "מוצגים הנתונים האחרונים הזמינים." : "נסו לרענן בעוד רגע."}<button onClick={() => query.refetch()} disabled={query.isFetching} className="ms-3 font-semibold underline">נסה שוב</button></div>}
    <section className="panel mt-5 overflow-hidden">
      {query.isPending ? <div className="space-y-2 p-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        : !rows.length ? <div className="p-12 text-center"><p className="text-[var(--fg-muted)]">{query.isError ? "נתוני הסקרינר אינם זמינים." : "אין מניות שמתאימות לסינון."}</p>{!query.isError && <button className="control mt-4" onClick={reset}>נקה סינון</button>}</div>
        : <div className="overflow-x-auto"><table className="w-full">
          <caption className="sr-only">ציונים ונתונים פונדמנטליים למניות. לחיצה חוזרת על כותרת משנה את כיוון המיון.</caption>
          <thead><tr className="border-b bg-[var(--panel-2)] text-xs text-[var(--fg-muted)]">
            <th scope="col" className="px-4 py-3 text-start font-medium">מניה</th>
            {COLS.map((c) => <th scope="col" key={c.key} aria-sort={sortKey === c.key ? ascending ? "ascending" : "descending" : "none"} className="px-3 py-3 font-medium">
              <button onClick={() => sort(c.key)} className="mx-auto inline-flex items-center gap-1 whitespace-nowrap hover:text-[var(--fg)]" style={{ color: sortKey === c.key ? "var(--accent)" : undefined }}>{c.label}<ArrowUpDown size={12} />{sortKey === c.key && <span aria-hidden="true">{ascending ? "↑" : "↓"}</span>}</button>
            </th>)}
            <th scope="col" className="px-3 py-3 font-medium">מעקב</th>
          </tr></thead>
          <tbody>{rows.map((r) => <tr key={r.symbol} className="border-b last:border-0 hover:bg-[var(--panel-2)]">
            <th scope="row" className="px-4 py-3 text-start"><Link dir="ltr" href={`/${encodeURIComponent(r.symbol)}`} className="font-semibold text-[var(--accent)] hover:underline">{r.symbol}</Link></th>
            {COLS.map((c) => {
              const v = r[c.key];
              const score = ["composite", "profitability", "valuation", "cashFlow"].includes(c.key);
              const color = score ? scoreColor(v) : c.pct && v != null && c.key !== "dividendYieldPct" ? v >= 0 ? "var(--up)" : "var(--down)" : "var(--fg)";
              return <td key={c.key} className="px-3 py-3 text-center"><span className="font-mono-num text-sm" style={{ color, fontWeight: score ? 600 : 400 }}>{v == null ? "—" : c.pct ? `${v > 0 && c.key !== "dividendYieldPct" ? "+" : ""}${v}%` : v}</span></td>;
            })}
            <td className="px-3 py-2"><WatchStar symbol={r.symbol} /></td>
          </tr>)}</tbody>
        </table></div>}
    </section>
    <p className="mt-5 text-center text-xs leading-relaxed text-[var(--fg-muted)]">איכות גבוהה: ציון כולל של 65 ומעלה · נתון חסר מוצג כ־״—״ · Yahoo Finance · ניתוח, לא ייעוץ השקעות.</p>
  </main>;
}
