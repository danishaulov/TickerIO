"use client";

import type { CalendarEvent } from "@/lib/types";
import { useEffect, useState } from "react";
import { UI, impactHe } from "@/lib/i18n/he";
import { WidgetCard } from "./WidgetCard";
import { Skeleton } from "@/components/ui/Skeleton";

function impactColor(impact: CalendarEvent["impact"]): string {
  return impact === "High" ? "var(--down)" : impact === "Medium" ? "var(--warn)" : "var(--fg-dim)";
}

function when(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("he-IL", { weekday: "short", hour: "numeric", minute: "2-digit" });
}

export function EconomicCalendar({
  events,
  source,
  loading,
}: {
  events?: CalendarEvent[];
  source?: string;
  loading: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const upcoming = (events ?? [])
    .filter((e) => new Date(e.date).getTime() >= now - 3600_000)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(0, 6);

  return (
    <WidgetCard
      title={UI.eventRisk}
      action={source ? <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>{source}</span> : null}
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--fg-dim)" }}>
          {UI.noEvents}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {upcoming.map((e, i) => (
            <li key={`${e.title}-${i}`} className="flex items-center gap-3">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: impactColor(e.impact) }}
                title={impactHe(e.impact)}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[var(--fg)]">
                  <span className="font-semibold" style={{ color: "var(--fg-muted)" }}>
                    {e.country}
                  </span>{" "}
                  {e.title}
                </p>
              </div>
              <span className="shrink-0 text-xs" style={{ color: "var(--fg-dim)" }}>
                {when(e.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11px]" style={{ color: "var(--fg-dim)" }}>
        {UI.eventHelper}
      </p>
    </WidgetCard>
  );
}
