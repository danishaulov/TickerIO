"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE, SPRING } from "@/lib/motion";

type Theme = "dark" | "light";
const themeSnapshot = (): Theme => document.documentElement.dataset.theme === "light" ? "light" : "dark";
const serverTheme = (): Theme => "dark";
function subscribeTheme(callback: () => void) {
  window.addEventListener("tickerio-theme-change", callback);
  return () => window.removeEventListener("tickerio-theme-change", callback);
}

/** Toggles the "Daylight" light theme. Initial theme is applied pre-paint by an
 *  inline script in the layout, so there's no flash. The icon swaps with a
 *  spin/scale crossfade. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, themeSnapshot, serverTheme);
  const reduce = useReducedMotion();

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    if (next === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    window.dispatchEvent(new Event("tickerio-theme-change"));
    try {
      localStorage.setItem("tickerio-theme", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.button
      onClick={toggle}
      whileHover={reduce ? undefined : { scale: 1.08 }}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={SPRING.snappy}
      className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border transition-colors hover:border-[var(--border-strong)]"
      style={{ borderColor: "var(--border)" }}
      title={theme === "dark" ? "עבור למצב בהיר" : "עבור למצב כהה"}
      aria-label="החלפת ערכת נושא"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={reduce ? false : { rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="grid place-items-center"
        >
          {theme === "dark" ? (
            <Sun size={16} style={{ color: "var(--fg-muted)" }} />
          ) : (
            <Moon size={16} style={{ color: "var(--fg-muted)" }} />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
