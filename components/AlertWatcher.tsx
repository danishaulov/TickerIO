"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { fetchQuote } from "@/lib/api";
import { useAlerts, type TriggeredAlert } from "@/store/useAlerts";
import { shouldTriggerAlert } from "@/lib/finance/alerts";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";

function notify(alert: TriggeredAlert) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(`TickerIO · ${alert.symbol}`, {
      body: `המחיר ${alert.op === "above" ? "עלה מעל" : "ירד מתחת"} ${formatPrice(alert.price, alert.currency)}. מחיר נוכחי: ${formatPrice(alert.actualPrice, alert.currency)}.`,
      tag: alert.id,
    });
  } catch {
    // Notification constructors are unsupported on some mobile browsers.
    // The persistent history and in-app notice still receive the alert.
  }
}

export function AlertWatcher() {
  const alerts = useAlerts((s) => s.alerts);
  const history = useAlerts((s) => s.history);
  const [notice, setNotice] = useState<TriggeredAlert | null>(null);
  const mounted = useHydrated();
  const symbols = Array.from(new Set(alerts.map((a) => a.symbol)));
  const results = useQueries({
    queries: symbols.map((s) => ({
      queryKey: ["quote", s], queryFn: () => fetchQuote(s), refetchInterval: 20_000, enabled: mounted,
    })),
  });

  useEffect(() => {
    function onAlert(event: Event) { setNotice((event as CustomEvent<TriggeredAlert>).detail); }
    window.addEventListener("tickerio-price-alert", onAlert);
    return () => window.removeEventListener("tickerio-price-alert", onAlert);
  }, []);

  useEffect(() => {
    const now = Date.now();
    alerts.forEach((alert) => {
      const result = results[symbols.indexOf(alert.symbol)];
      if (result?.isError || !shouldTriggerAlert(alert, result?.data, now)) return;
      const triggered = useAlerts.getState().trigger(alert.id, result.data!.price);
      if (triggered) {
        notify(triggered);
        window.dispatchEvent(new CustomEvent("tickerio-price-alert", { detail: triggered }));
      }
    });
  }, [alerts, results, symbols]);

  if (!notice) return null;
  return <aside role="status" aria-live="polite" className="panel fixed bottom-4 start-4 end-4 z-[90] flex items-start gap-3 p-4 sm:end-auto sm:w-96">
    <BellRing size={21} className="shrink-0 text-[var(--warn)]" />
    <div className="min-w-0 flex-1">
      <p className="font-semibold"><bdi>{notice.symbol}</bdi> הגיע למחיר היעד</p>
      <p className="mt-1 text-sm text-[var(--fg-muted)]"><span className="font-mono-num">{formatPrice(notice.actualPrice, notice.currency)}</span></p>
      <Link onClick={() => setNotice(null)} href="/alerts" className="mt-2 inline-block text-xs font-semibold text-[var(--accent)]">הצג היסטוריית התראות ({history.length})</Link>
    </div>
    <button onClick={() => setNotice(null)} aria-label="סגור התראה" className="p-1"><X size={16} /></button>
  </aside>;
}
