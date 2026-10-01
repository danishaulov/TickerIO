"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, BellRing, Clock, RotateCcw, X } from "lucide-react";
import { useAlerts } from "@/store/useAlerts";
import { useHydrated } from "@/lib/use-hydrated";
import { formatPrice } from "@/lib/format";
import { resolveSymbol } from "@/lib/markets/symbol";
import { Skeleton } from "@/components/ui/Skeleton";

function dateLabel(timestamp: number) {
  return new Date(timestamp).toLocaleString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function AlertsClient() {
  const { alerts, history, add, remove, dismissHistory } = useAlerts();
  const mounted = useHydrated();
  const [tab, setTab] = useState<"active" | "history">("active");
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [message, setMessage] = useState("");
  const available = mounted && typeof Notification !== "undefined";
  const currentPermission = available ? permission ?? Notification.permission : null;

  async function enableNotifications() {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setMessage(result === "granted" ? "התראות שולחן העבודה הופעלו." : "התראות בתוך האתר וההיסטוריה ימשיכו לפעול.");
    } catch { setMessage("הדפדפן אינו תומך בהתראות שולחן עבודה. ההיסטוריה באתר תמשיך לפעול."); }
  }

  if (!mounted) return <main className="mx-auto w-full max-w-[1000px] px-4 py-8"><Skeleton className="h-8 w-48" /></main>;
  return <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-display flex items-center gap-3 text-3xl font-extrabold"><Bell className="text-[var(--accent)]" size={25} />התראות מחיר</h1><p className="mt-2 text-sm text-[var(--fg-muted)]">בחרו מחיר יעד. תפסו את הרגע.</p></div>
      <Link href="/watchlist" className="control">לרשימת המעקב</Link>
    </div>
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-[var(--panel)] p-4">
      <BellRing className="text-[var(--warn)]" size={20} />
      <div className="min-w-[200px] flex-1"><p className="text-sm font-semibold">{currentPermission === "granted" ? "התראות שולחן העבודה פעילות" : "ההתראות וההיסטוריה זמינות בתוך האתר"}</p><p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">המעקב פועל כל עוד TickerIO פתוח, עם מחירים עדכניים. כל התראה מופעלת פעם אחת.</p></div>
      {available && currentPermission === "default" && <button onClick={enableNotifications} className="control w-full sm:w-auto">הפעל התראות שולחן עבודה</button>}
      {currentPermission === "denied" && <p className="text-xs text-[var(--fg-muted)]">התראות שולחן עבודה חסומות בהגדרות הדפדפן.</p>}
    </div>
    {message && <p role="status" className="mt-4 text-sm text-[var(--accent)]">{message}</p>}
    <div role="tablist" aria-label="סוג התראות" className="mt-7 flex gap-2 border-b pb-3">
      <button id="active-tab" role="tab" aria-selected={tab === "active"} aria-controls="alert-panel" onClick={() => setTab("active")} className={`control ${tab === "active" ? "control-primary" : ""}`}>פעילות ({alerts.length})</button>
      <button id="history-tab" role="tab" aria-selected={tab === "history"} aria-controls="alert-panel" onClick={() => setTab("history")} className={`control ${tab === "history" ? "control-primary" : ""}`}>היסטוריה ({history.length})</button>
    </div>
    <section id="alert-panel" role="tabpanel" aria-labelledby={tab === "active" ? "active-tab" : "history-tab"} className="mt-4 space-y-3">
      {tab === "active" && alerts.map((a) => <article key={a.id} className="panel flex flex-wrap items-center gap-4 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--panel-2)]"><Bell size={18} className="text-[var(--accent)]" /></span>
        <div className="min-w-0 flex-1"><Link dir="ltr" href={`/${encodeURIComponent(a.symbol)}`} className="font-display text-lg font-bold hover:text-[var(--accent)]">{resolveSymbol(a.symbol).display}</Link><p className="mt-1 text-sm text-[var(--fg-muted)]">{a.op === "above" ? "מחיר מעל" : "מחיר מתחת"} <span className="font-mono-num text-[var(--fg)]">{formatPrice(a.price, a.currency)}</span></p></div>
        <span className="flex items-center gap-1 text-xs text-[var(--fg-muted)]"><Clock size={12} />{dateLabel(a.createdAt)}</span>
        <button onClick={() => remove(a.id)} aria-label={`הסר התראה עבור ${a.symbol} במחיר ${a.price}`} className="control"><X size={15} /></button>
      </article>)}
      {tab === "history" && history.map((a) => <article key={a.id} className="panel flex flex-wrap items-center gap-4 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--up-soft)]"><BellRing size={18} className="text-[var(--up)]" /></span>
        <div className="min-w-0 flex-1"><Link dir="ltr" href={`/${encodeURIComponent(a.symbol)}`} className="font-display text-lg font-bold hover:text-[var(--accent)]">{resolveSymbol(a.symbol).display}</Link><p className="mt-1 text-sm text-[var(--fg-muted)]">{a.op === "above" ? "עלה מעל" : "ירד מתחת"} <span className="font-mono-num">{formatPrice(a.price, a.currency)}</span></p><p className="mt-1 text-xs text-[var(--fg-muted)]">מחיר בהפעלה: <span className="font-mono-num text-[var(--fg)]">{formatPrice(a.actualPrice, a.currency)}</span> · {dateLabel(a.triggeredAt)}</p></div>
        <button className="control inline-flex items-center gap-2" onClick={() => setMessage(add(a.symbol, a.op, a.price, a.currency) ? "ההתראה הוגדרה מחדש." : "ההתראה כבר פעילה או שהרשימה מלאה.")}><RotateCcw size={14} />הגדר מחדש</button>
        <button className="control" onClick={() => dismissHistory(a.id)} aria-label={`הסר מההיסטוריה ${a.symbol}`}><X size={15} /></button>
      </article>)}
      {(tab === "active" ? alerts.length === 0 : history.length === 0) && <div className="panel px-6 py-14 text-center">
        <Bell size={34} className="mx-auto mb-4 text-[var(--fg-dim)]" />
        <h2 className="font-display text-xl font-bold">{tab === "active" ? "אין התראות פעילות" : "כאן יופיעו ההתראות שהופעלו"}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--fg-muted)]">{tab === "active" ? "לחצו על הפעמון ליד המחיר בעמוד של סמל או ברשימת המעקב, ובחרו מחיר יעד." : "כשמחיר מגיע ליעד, ההתראה נשמרת כאן גם ללא התראות שולחן עבודה."}</p>
        <Link href="/watchlist" className="control mt-5 inline-block">פתח רשימת מעקב</Link>
      </div>}
    </section>
    <p className="mt-8 text-center text-xs text-[var(--fg-dim)]">נשמר בדפדפן הזה · עד 50 התראות פעילות ו־100 אירועים בהיסטוריה.</p>
  </main>;
}
