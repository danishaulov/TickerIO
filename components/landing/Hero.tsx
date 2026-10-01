"use client";

import { Activity } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { TickerSearch } from "@/components/TickerSearch";
import { LivePulse } from "@/components/ui/LivePulse";
import { fadeUp, staggerContainer } from "@/lib/motion";

/** Landing hero — an orchestrated staggered entrance: logo → badge → headline
 *  → subtitle → search arrive in sequence for a premium first impression. */
export function Hero() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="flex flex-col items-center pt-12 text-center sm:pt-16"
      variants={staggerContainer(0.1, 0.05)}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      <motion.div variants={fadeUp} className="mb-6 flex items-center gap-2.5">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            boxShadow: "0 8px 24px -8px var(--accent-glow)",
          }}
        >
          <Activity size={20} strokeWidth={2.5} color="white" />
        </span>
        <span className="font-display text-2xl font-bold tracking-tight">
          Ticker<span style={{ color: "var(--accent)" }}>IO</span>
        </span>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
        style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--fg-muted)" }}
      >
        <LivePulse color="var(--up)" />
        נתונים בזמן אמת · Yahoo · CoinDesk · FXStreet · Forex Factory
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="font-display max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-7xl"
      >
        כל האמת על השוק,
        <br />
        <span className="text-gradient">במרחק טיקר אחד.</span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mt-7 max-w-xl text-balance text-lg leading-relaxed text-[var(--fg-muted)]"
      >
        הקלידו סימול וקבלו תמונה מלאה בזמן אמת — גרפים של TradingView, ביצועים
        מעוגנים, סנטימנט מבוסס בינה מלאכותית ונטיית מגמה. עמוד אחד, ללא רענון.
      </motion.p>

      <motion.div variants={fadeUp} className="mt-10 w-full max-w-xl">
        <TickerSearch size="lg" />
      </motion.div>
    </motion.div>
  );
}
