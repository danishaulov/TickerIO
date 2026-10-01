"use client";

import Link from "next/link";
import { Trophy, Star, Scale, SlidersHorizontal, ArrowUpRight, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/motion";

const CARDS: { href: string; icon: LucideIcon; title: string; desc: string; tint: string }[] = [
  {
    href: "/markets",
    icon: Trophy,
    title: "מובילים",
    desc: "התנועות הבולטות בסקטורים, בקריפטו ובסחורות.",
    tint: "var(--accent)",
  },
  {
    href: "/watchlist",
    icon: Star,
    title: "רשימת מעקב",
    desc: "הסימולים שלכם בזמן אמת — גרפים זעירים, עדכונים והתראות מחיר.",
    tint: "var(--accent-3)",
  },
  {
    href: "/compare",
    icon: Scale,
    title: "השוואה",
    desc: "השוואת ביצועים מנורמלת, זה לצד זה.",
    tint: "var(--accent-2)",
  },
  {
    href: "/screen",
    icon: SlidersHorizontal,
    title: "סקרינר",
    desc: "מצאו מניות לפי רווחיות, צמיחה והערכת שווי.",
    tint: "var(--warn)",
  },
];

/** Quick-access launchers on the landing page — straight into the app's
 *  destination pages without typing a ticker first. */
export function QuickAccess() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4"
      variants={staggerContainer(0.08, 0.1)}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      {CARDS.map((c) => (
        <motion.div key={c.href} variants={fadeUp}>
          <Link href={c.href} className="panel panel-hover group flex items-center gap-4 p-5">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
              style={{ background: `color-mix(in oklab, ${c.tint} 16%, transparent)`, color: c.tint }}
            >
              <c.icon size={22} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-lg font-bold">{c.title}</h3>
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: "var(--fg-dim)" }}
                />
              </div>
              <p className="mt-0.5 text-sm leading-snug text-[var(--fg-muted)]">{c.desc}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
