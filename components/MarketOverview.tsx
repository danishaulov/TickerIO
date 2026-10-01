"use client";

import { useHydrated } from "@/lib/use-hydrated";
import { motion } from "motion/react";
import { MiniTicker } from "./MiniTicker";
import { useWatchlist } from "@/store/useWatchlist";
import { fadeUp, staggerContainer } from "@/lib/motion";

const BELLWETHERS: { symbol: string; label: string }[] = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "Nasdaq" },
  { symbol: "^DJI", label: "Dow" },
  { symbol: "BTC", label: "Bitcoin" },
  { symbol: "ETH", label: "Ethereum" },
  { symbol: "EURUSD", label: "EUR/USD" },
];

export function MarketOverview() {
  const symbols = useWatchlist((s) => s.symbols);
  const mounted = useHydrated();

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          השווקים עכשיו
        </h2>
        <span className="text-[11px]" style={{ color: "var(--fg-dim)" }}>
          בזמן אמת · Yahoo Finance
        </span>
      </div>
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="show"
      >
        {BELLWETHERS.map((b) => (
          <motion.div key={b.symbol} variants={fadeUp}>
            <MiniTicker symbol={b.symbol} label={b.label} />
          </motion.div>
        ))}
      </motion.div>

      {mounted && symbols.length > 0 && (
        <>
          <div className="mb-3 mt-8 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              רשימת המעקב שלכם
            </h2>
          </div>
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
            variants={staggerContainer(0.05)}
            initial="hidden"
            animate="show"
          >
            {symbols.map((s) => (
              <motion.div key={s} variants={fadeUp}>
                <MiniTicker symbol={s} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
