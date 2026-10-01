"use client";

import { useRouter } from "next/navigation";
import { useRecents } from "@/store/useRecents";
import { SymbolSearchField } from "./SymbolSearchField";
import { normalizeSymbols } from "@/lib/symbol-list";

const SUGGESTIONS = ["AAPL", "NVDA", "TSLA", "BTC", "ETH", "SOL"];

export function TickerSearch({ size = "lg", autoFocus = false }: { size?: "lg" | "sm"; autoFocus?: boolean }) {
  const router = useRouter();
  const pushRecent = useRecents((state) => state.push);
  const recents = useRecents((state) => state.recents);
  const symbols = normalizeSymbols(recents.length ? recents : SUGGESTIONS, 6);

  function go(symbol: string) {
    pushRecent(symbol);
    router.push(`/${encodeURIComponent(symbol)}`);
  }

  return <div className="w-full">
    <SymbolSearchField onSelect={go} label="חיפוש טיקר לניתוח" placeholder="חיפוש חברה או סימול…" size={size}
      autoFocus={autoFocus} submitLabel="פתח"
      suggestions={symbols.map((symbol) => ({ symbol, name: "", type: recents.length ? "נפתח לאחרונה" : "פופולרי", exchange: "" }))}
      suggestionsLabel={recents.length ? "הטיקרים האחרונים שלך" : "טיקרים פופולריים"} />
    {size === "lg" && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-[var(--fg-muted)]">גישה מהירה</span>
      {SUGGESTIONS.map((symbol) => <button key={symbol} onClick={() => go(symbol)}
        className="min-h-9 rounded-lg border px-3 py-1 text-xs font-semibold text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]">{symbol}</button>)}
    </div>}
  </div>;
}
