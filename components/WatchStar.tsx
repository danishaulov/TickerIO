"use client";

import { Star } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";
import { useWatchlist } from "@/store/useWatchlist";
import { normalizeSymbol, WATCHLIST_LIMIT } from "@/lib/symbol-list";

export function WatchStar({ symbol }: { symbol: string }) {
  const toggle = useWatchlist((s) => s.toggle);
  const symbols = useWatchlist((s) => s.symbols);
  const mounted = useHydrated();

  const active = mounted && symbols.includes(normalizeSymbol(symbol));
  const full = mounted && !active && symbols.length >= WATCHLIST_LIMIT;
  const label = full ? "רשימת המעקב מלאה — הסירו סמל כדי להוסיף" : active ? "הסר מרשימת המעקב" : "הוסף לרשימת המעקב";

  return (
    <button
      onClick={() => toggle(symbol)}
      disabled={full}
      className="grid h-9 w-9 place-items-center rounded-lg border transition-colors hover:border-[var(--border-strong)]"
      style={{ borderColor: "var(--border)" }}
      title={label}
      aria-label={label}
      aria-pressed={active}
    >
      <Star
        size={18}
        style={{ color: active ? "var(--warn)" : "var(--fg-dim)" }}
        fill={active ? "var(--warn)" : "none"}
      />
    </button>
  );
}
