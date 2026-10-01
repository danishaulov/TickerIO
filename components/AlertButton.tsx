"use client";

import { Bell, Check, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useAlerts } from "@/store/useAlerts";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { normalizeSymbol } from "@/lib/symbol-list";

export function AlertButton({ symbol, price, currency = "USD" }: { symbol: string; price: number; currency?: string }) {
  const add = useAlerts((s) => s.add);
  const remove = useAlerts((s) => s.remove);
  const all = useAlerts((s) => s.alerts);
  const [open, setOpen] = useState(false);
  const [op, setOp] = useState<"above" | "below">("above");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const mounted = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function outside(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    function escape(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const mine = mounted ? all.filter((a) => a.symbol === normalizeSymbol(symbol)) : [];
  const valid = value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) > 0;

  function toggle() {
    if (!open) {
      setValue(Number.isFinite(price) && price > 0 ? String(+(price * 1.05).toFixed(price >= 1 ? 2 : 6)) : "");
      setOp("above");
      setMessage("");
    }
    setOpen(!open);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) { setMessage("הזינו מחיר חיובי ותקין."); return; }
    const added = add(symbol, op, Number(value), currency);
    setMessage(added ? "ההתראה נשמרה. נעדכן כשהמחיר יגיע ליעד." : "ההתראה כבר קיימת או שהגעתם למגבלת 50 התראות.");
    if (added) setValue("");
  }

  return <div className="relative" ref={ref}>
    <button onClick={toggle} className="relative grid h-9 w-9 place-items-center rounded-lg border hover:border-[var(--border-strong)]"
      title="התראות מחיר" aria-label={`התראות מחיר עבור ${symbol}`} aria-expanded={open} aria-controls={id}>
      <Bell size={17} className={mine.length ? "text-[var(--accent)]" : "text-[var(--fg-muted)]"} />
      {mine.length > 0 && <span className="absolute -end-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">{mine.length}</span>}
    </button>
    {open && <div id={id} role="dialog" aria-label={`התראת מחיר עבור ${symbol}`} className="panel absolute end-0 z-50 mt-2 w-[min(288px,85vw)] p-4">
      <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">התראה עבור <bdi>{symbol}</bdi></p><button onClick={() => setOpen(false)} aria-label="סגור הגדרת התראה"><X size={15} /></button></div>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex gap-1 rounded-lg border p-1">
          {(["above", "below"] as const).map((o) => <button key={o} type="button" onClick={() => setOp(o)} aria-pressed={op === o} className={`flex-1 rounded-md py-2 text-xs font-semibold ${op === o ? "bg-[var(--panel-2)] text-[var(--fg)]" : "text-[var(--fg-muted)]"}`}>{o === "above" ? "מעל המחיר" : "מתחת למחיר"}</button>)}
        </div>
        <label htmlFor={`${id}-price`} className="block text-xs text-[var(--fg-muted)]">מחיר יעד ({currency})</label>
        <input id={`${id}-price`} autoFocus value={value} onChange={(e) => { setValue(e.target.value); setMessage(""); }} inputMode="decimal" dir="ltr" placeholder="0.00" className="control font-mono-num w-full" />
        <button type="submit" disabled={!valid} className="control control-primary w-full">שמור התראה</button>
      </form>
      {message && <p role="status" className="mt-3 flex gap-2 text-xs text-[var(--fg-muted)]"><Check size={14} className="shrink-0" />{message}</p>}
      {mine.length > 0 && <ul className="mt-3 space-y-2 border-t pt-3">{mine.map((a) => <li key={a.id} className="flex items-center justify-between text-xs">
        <span>{a.op === "above" ? "מעל" : "מתחת"} <span className="font-mono-num">{formatPrice(a.price, a.currency ?? currency)}</span></span>
        <button onClick={() => remove(a.id)} aria-label={`הסר התראה ${a.price}`} className="p-1"><X size={14} /></button>
      </li>)}</ul>}
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--fg-muted)]">התראות פועלות כשהאתר פתוח ונתון עדכני זמין. התראות שהופעלו נשמרות בהיסטוריה.</p>
    </div>}
  </div>;
}
