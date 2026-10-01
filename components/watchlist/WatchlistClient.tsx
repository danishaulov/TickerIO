"use client";

import Link from "next/link";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Star, X, Plus, RefreshCw, Download, Scale, Search, LayoutGrid, List, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { fetchQuote, fetchCandles } from "@/lib/api";
import { formatPrice, formatPercent, direction } from "@/lib/format";
import { useWatchlist } from "@/store/useWatchlist";
import { useHydrated } from "@/lib/use-hydrated";
import { WATCHLIST_LIMIT, COMPARE_LIMIT } from "@/lib/symbol-list";
import { resolveSymbol } from "@/lib/markets/symbol";
import { assetClassHe } from "@/lib/i18n/he";
import { downloadCsv } from "@/lib/export";
import { Sparkline } from "@/components/widgets/Sparkline";
import { Skeleton } from "@/components/ui/Skeleton";
import { SymbolAutocomplete } from "@/components/SymbolAutocomplete";
import { AlertButton } from "@/components/AlertButton";

const POPULAR = ["AAPL", "NVDA", "TSLA", "BTC", "ETH", "SOL", "EURUSD"];

export function WatchlistClient() {
  const symbols = useWatchlist((s) => s.symbols);
  const remove = useWatchlist((s) => s.remove);
  const add = useWatchlist((s) => s.add);
  const addMany = useWatchlist((s) => s.addMany);
  const mounted = useHydrated();
  const [filter, setFilter] = useState("");
  const [asset, setAsset] = useState("all");
  const [sort, setSort] = useState("saved");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [bulk, setBulk] = useState("");
  const [message, setMessage] = useState("");
  const [removed, setRemoved] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const full = symbols.length >= WATCHLIST_LIMIT;

  const quotes = useQueries({
    queries: symbols.map((s) => ({ queryKey: ["quote", s], queryFn: () => fetchQuote(s), refetchInterval: 30_000, enabled: mounted })),
  });
  const candles = useQueries({
    queries: symbols.map((s) => ({ queryKey: ["candles", s, "1d", "5m"], queryFn: () => fetchCandles(s, "1d", "5m"), refetchInterval: 60_000, enabled: mounted })),
  });
  const rows = symbols.map((symbol, i) => ({ symbol, quote: quotes[i], candle: candles[i], i }));
  const loaded = rows.filter((r) => r.quote.data);
  const up = loaded.filter((r) => r.quote.data!.changePct > 0).length;
  const down = loaded.filter((r) => r.quote.data!.changePct < 0).length;
  const picks = selected.filter((s) => symbols.includes(s));
  const visible = rows.filter(({ symbol, quote }) => {
    const text = `${symbol} ${quote.data?.name ?? ""} ${quote.data?.display ?? ""}`.toLowerCase();
    return text.includes(filter.toLowerCase().trim()) && (asset === "all" || (quote.data?.assetClass ?? resolveSymbol(symbol).assetClass) === asset);
  }).sort((a, b) => {
    if (sort === "name") return a.symbol.localeCompare(b.symbol);
    if (sort === "gainers" || sort === "losers") {
      const aVal = a.quote.data?.changePct;
      const bVal = b.quote.data?.changePct;
      if (aVal == null) return bVal == null ? a.i - b.i : 1;
      if (bVal == null) return -1;
      return sort === "gainers" ? bVal - aVal : aVal - bVal;
    }
    return a.i - b.i;
  });

  function addSymbol(symbol: string) {
    setMessage(add(symbol) ? `${resolveSymbol(symbol).display} נוסף לרשימת המעקב` : full ? "הרשימה מלאה. הסירו סמל כדי להוסיף חדש." : "הסמל כבר ברשימה או אינו תקין.");
  }
  function removeSymbol(symbol: string) {
    remove(symbol);
    setSelected((s) => s.filter((x) => x !== symbol));
    setRemoved(symbol);
    setMessage(`${resolveSymbol(symbol).display} הוסר מהרשימה`);
  }
  function select(symbol: string) {
    setSelected((current) => current.includes(symbol) ? current.filter((s) => s !== symbol) : current.length < COMPARE_LIMIT ? [...current, symbol] : current);
  }
  async function refresh() {
    setRefreshing(true);
    await Promise.allSettled([...quotes.map((q) => q.refetch()), ...candles.map((c) => c.refetch())]);
    setRefreshing(false);
  }
  function exportQuotes() {
    downloadCsv("tickerio-watchlist.csv", [
      ["Symbol", "Name", "Asset class", "Currency", "Price", "Change", "Change %", "Quote time", "Status"],
      ...rows.map(({ symbol, quote }) => {
        const q = quote.data;
        return [symbol, q?.name, q?.assetClass, q?.currency, q?.price, q?.change, q?.changePct, q?.asOf, q ? q.stale || quote.isError ? "Delayed" : "Available" : "Unavailable"];
      }),
    ]);
  }

  if (!mounted) return <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6"><Skeleton className="h-8 w-40" /></main>;

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Star size={24} className="text-[var(--warn)]" fill="var(--warn)" />
            <h1 className="font-display text-3xl font-extrabold">רשימת המעקב שלי</h1>
          </div>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">כל הסמלים שמעניינים אותך. במקום אחד.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/alerts" className="control">התראות מחיר</Link>
          <button onClick={exportQuotes} disabled={!symbols.length} className="control inline-flex items-center gap-2"><Download size={15} /> ייצוא CSV</button>
          <button onClick={refresh} disabled={!symbols.length || refreshing} className="control inline-flex items-center gap-2">
            <RefreshCw size={15} className={refreshing ? "animate-spin motion-reduce:animate-none" : ""} />{refreshing ? "מעדכן…" : "רענון"}
          </button>
        </div>
      </div>

      {symbols.length > 0 && <section aria-label="סיכום רשימת המעקב" className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border bg-[var(--panel)] px-5 py-4">
        <div><p className="text-xs text-[var(--fg-muted)]">במעקב</p><p className="mt-1 font-mono-num text-2xl font-semibold">{symbols.length}<span className="text-sm text-[var(--fg-dim)]"> / {WATCHLIST_LIMIT}</span></p></div>
        <div><p className="text-xs text-[var(--fg-muted)]">בעלייה</p><p className="mt-1 flex items-center gap-1 font-mono-num text-2xl text-[var(--up)]"><ArrowUpRight size={19} />{up}</p></div>
        <div><p className="text-xs text-[var(--fg-muted)]">בירידה</p><p className="mt-1 flex items-center gap-1 font-mono-num text-2xl text-[var(--down)]"><ArrowDownRight size={19} />{down}</p></div>
        <p className="ms-auto max-w-xs text-xs leading-relaxed text-[var(--fg-muted)]">שינוי מול הסגירה הקודמת · עדכון כל 30 שניות<br />{loaded.length} מתוך {symbols.length} מחירים זמינים. ייתכנו נתונים מושהים.</p>
      </section>}

      <section aria-label="הוספת סמלים" className="mb-5 flex flex-wrap items-center gap-3">
        <SymbolAutocomplete onSelect={addSymbol} disabled={full} placeholder={full ? "הרשימה מלאה (24 סמלים)" : "הוספת סמל — חפשו חברה, מניה או מטבע"} className="w-full sm:max-w-md" />
        <details className="relative">
          <summary className="control cursor-pointer">הוספה מרובה</summary>
          <div className="panel absolute start-0 z-30 mt-2 w-[min(320px,85vw)] p-4">
            <label htmlFor="bulk-symbols" className="text-sm font-semibold">רשימת סמלים</label>
            <p className="mt-1 text-xs text-[var(--fg-muted)]">הפרידו בפסיק או בשורה חדשה. סמלים קיימים ידולגו.</p>
            <textarea id="bulk-symbols" dir="ltr" value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="AAPL, MSFT, BTC" className="control mt-3 min-h-24 w-full resize-y" />
            <button className="control control-primary mt-2 w-full" disabled={!bulk.trim() || full} onClick={() => {
              const count = addMany(bulk.split(/[,;\s]+/));
              setBulk("");
              setMessage(`נוספו ${count} סמלים. סמלים כפולים או מעל מגבלת 24 לא נוספו.`);
            }}>הוסף לרשימה</button>
          </div>
        </details>
      </section>

      {message && <div role="status" className="mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm">
        <span>{message}</span>
        {removed && <button className="font-semibold text-[var(--accent)]" onClick={() => {
          if (add(removed) || useWatchlist.getState().has(removed)) {
            setRemoved(null);
            setMessage("הסמל הוחזר לרשימה");
          } else {
            setMessage("הרשימה מלאה. הסירו סמל כדי לבטל את ההסרה.");
          }
        }}>ביטול ההסרה</button>}
        <button className="ms-auto p-1" aria-label="סגור הודעה" onClick={() => { setMessage(""); setRemoved(null); }}><X size={16} /></button>
      </div>}

      {!symbols.length ? <section className="panel px-6 py-12 text-center">
        <Star size={36} className="mx-auto mb-4 text-[var(--warn)]" />
        <h2 className="font-display text-2xl font-bold">השוק שלך מתחיל כאן</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--fg-muted)]">הוסיפו סמלים בחיפוש למעלה, או בחרו כמה להתחלה. הרשימה נשמרת בדפדפן הזה.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">{POPULAR.map((s) => <button key={s} onClick={() => addSymbol(s)} className="control inline-flex items-center gap-2"><Plus size={14} /><span dir="ltr">{s}</span></button>)}</div>
      </section> : <>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-40 flex-1 sm:max-w-xs">
            <Search size={15} className="absolute start-3 top-3 text-[var(--fg-dim)]" />
            <input aria-label="סינון רשימת המעקב" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="סינון לפי סמל או שם…" className="control w-full ps-9" />
          </div>
          <select aria-label="סוג נכס" value={asset} onChange={(e) => setAsset(e.target.value)} className="control">
            <option value="all">כל הנכסים</option><option value="equity">מניות</option><option value="crypto">קריפטו</option><option value="forex">מט״ח</option><option value="index">מדדים</option>
          </select>
          <select aria-label="מיון רשימת המעקב" value={sort} onChange={(e) => setSort(e.target.value)} className="control">
            <option value="saved">סדר ההוספה</option><option value="gainers">עליות תחילה</option><option value="losers">ירידות תחילה</option><option value="name">לפי סמל</option>
          </select>
          <div className="ms-auto flex gap-1">
            <button className="control" onClick={() => setView("cards")} aria-label="תצוגת כרטיסים" aria-pressed={view === "cards"}><LayoutGrid size={17} /></button>
            <button className="control" onClick={() => setView("list")} aria-label="תצוגת רשימה" aria-pressed={view === "list"}><List size={17} /></button>
          </div>
        </div>
        {picks.length > 0 && <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--accent)] bg-[var(--panel)] px-4 py-3">
          <Scale size={17} className="text-[var(--accent)]" /><span className="text-sm">{picks.length} נבחרו להשוואה (עד {COMPARE_LIMIT})</span>
          {picks.length >= 2 && <Link className="control control-primary ms-auto" href={`/compare?${new URLSearchParams({ symbols: picks.join(",") })}`}>השווה נבחרים</Link>}
          <button className="text-xs text-[var(--fg-muted)]" onClick={() => setSelected([])}>נקה בחירה</button>
        </div>}
        {visible.length === 0 && <div className="panel p-8 text-center"><p>אין סמלים שמתאימים לסינון.</p><button className="control mt-3" onClick={() => { setFilter(""); setAsset("all"); }}>נקה סינון</button></div>}
        <div className={view === "cards" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-2"}>
          {visible.map(({ symbol, quote: result, candle }) => {
            const q = result.data;
            const spark = candle.data?.candles.map((c) => c.c) ?? [];
            const tone = q ? direction(q.changePct) : "flat";
            const color = tone === "up" ? "var(--up)" : tone === "down" ? "var(--down)" : "var(--fg-muted)";
            const checked = picks.includes(symbol);
            return <article key={symbol} className={`panel p-4 ${view === "list" ? "flex flex-wrap items-center gap-4" : ""}`} style={checked ? { borderColor: "var(--accent)" } : undefined}>
              <div className={`flex items-center gap-2 ${view === "list" ? "w-full sm:w-auto" : "mb-3"}`}>
                <input type="checkbox" checked={checked} disabled={!checked && picks.length >= COMPARE_LIMIT} onChange={() => select(symbol)} aria-label={`בחר ${symbol} להשוואה`} className="h-4 w-4 accent-[var(--accent)]" />
                <Link href={`/${encodeURIComponent(symbol)}`} dir="ltr" className="font-display text-lg font-bold hover:text-[var(--accent)]">{q?.display ?? resolveSymbol(symbol).display}</Link>
                <span className="ms-auto rounded-md bg-[var(--panel-2)] px-2 py-1 text-[10px] text-[var(--fg-muted)]">{assetClassHe(q?.assetClass ?? resolveSymbol(symbol).assetClass)}</span>
                <button onClick={() => removeSymbol(symbol)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-[var(--panel-2)]" aria-label={`הסר ${symbol}`}><X size={15} /></button>
              </div>
              {q ? <>
                <div className={view === "list" ? "min-w-0 flex-1" : ""}>
                  <p className="truncate text-xs text-[var(--fg-muted)]">{q.name}</p>
                  <Link href={`/${encodeURIComponent(symbol)}`} className="mt-2 block font-mono-num text-2xl font-semibold">{formatPrice(q.price, q.currency)}</Link>
                  <div className="mt-1 flex items-center gap-1" style={{ color }}>
                    {tone === "up" ? <ArrowUpRight size={14} /> : tone === "down" ? <ArrowDownRight size={14} /> : null}
                    <span className="font-mono-num text-sm font-semibold">{formatPercent(q.changePct)}</span>
                    <span className="ms-1 text-[10px] text-[var(--fg-dim)]">מול סגירה</span>
                  </div>
                </div>
                <div className={`flex items-center justify-between gap-3 ${view === "cards" ? "mt-4 border-t pt-3" : "ms-auto"}`}>
                  {spark.length > 1 ? <span dir="ltr"><Sparkline data={spark} up={tone !== "down"} width={110} height={32} /></span> : <span className="text-[10px] text-[var(--fg-dim)]">גרף לא זמין</span>}
                  <AlertButton symbol={symbol} price={q.price} currency={q.currency} />
                </div>
                {(q.stale || result.isError) && <p className="mt-2 text-xs text-[var(--warn)]">נתון מושהה · עדכון נכשל</p>}
              </> : result.isPending ? <div role="status" aria-label={`טוען ${symbol}`} className="min-w-32 flex-1"><Skeleton className="h-7 w-28" /><Skeleton className="mt-2 h-4 w-20" /></div> : <div className="flex-1">
                <p className="text-sm text-[var(--fg-muted)]">המחיר אינו זמין כרגע.</p>
                <button onClick={() => result.refetch()} disabled={result.isFetching} className="mt-2 text-xs font-semibold text-[var(--accent)]">{result.isFetching ? "מנסה…" : "נסה שוב"}</button>
              </div>}
            </article>;
          })}
        </div>
      </>}
      <p className="mt-8 text-center text-xs leading-relaxed text-[var(--fg-dim)]">הרשימה נשמרת מקומית בדפדפן · Yahoo Finance · לצורכי ניתוח בלבד.</p>
    </main>
  );
}
