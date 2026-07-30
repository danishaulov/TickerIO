"use client";

import { useRouter } from "next/navigation";
import { Search, TrendingUp } from "lucide-react";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSearch } from "@/lib/hooks";
import { scaleIn, SPRING } from "@/lib/motion";
import type { SearchHit } from "@/lib/api";

const SUGGESTIONS = ["AAPL", "NVDA", "TSLA", "BTC", "ETH", "SOL"];

export function TickerSearch({
  size = "lg",
  autoFocus = false,
}: {
  size?: "lg" | "sm";
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data } = useSearch(value);
  const hits: SearchHit[] = value.trim().length >= 1 ? data?.hits ?? [] : [];
  const big = size === "lg";

  function go(symbol: string) {
    const clean = symbol.trim().toUpperCase();
    if (!clean) return;
    setOpen(false);
    setValue("");
    router.push(`/${encodeURIComponent(clean)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || hits.length === 0) {
      if (e.key === "Enter") go(value);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(hits[active]?.symbol ?? value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(hits[active]?.symbol ?? value);
        }}
        className="relative w-full"
      >
        <Search
          size={big ? 22 : 18}
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2"
          style={{ color: "var(--fg-dim)" }}
        />
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          placeholder="חיפוש טיקר — AAPL, BTC, ETH…"
          spellCheck={false}
          autoComplete="off"
          className={`w-full rounded-2xl border bg-[var(--panel)] font-medium text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-dim)] focus:border-[var(--accent)] ${
            big ? "py-4 ps-12 pe-28 text-lg" : "py-2.5 ps-11 pe-20 text-sm"
          }`}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={SPRING.snappy}
          // Vertical centering is handled by motion's `y: "-50%"` below so it
          // survives the whileHover/whileTap scale animation. Don't add Tailwind's
          // `-translate-y-1/2` here — in Tailwind v4 that sets the CSS `translate`
          // property, which composes with motion's `transform` and doubles to
          // -100% (the button pops out the top of the bar).
          className={`absolute end-2 top-1/2 rounded-xl bg-[var(--accent)] font-semibold text-white transition-opacity hover:opacity-90 ${
            big ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-xs"
          }`}
          style={{ y: "-50%" }}
        >
          נתח
        </motion.button>
      </form>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {open && hits.length > 0 && (
          <motion.ul
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            // `.panel` sets `position: relative` in globals.css, and as an
            // unlayered rule it beats Tailwind's `absolute` utility — which left
            // the dropdown in normal flow, expanding the vertically-centered
            // header slot and shoving the input off the top of the viewport.
            // Pin the positioning inline (inline styles win over any class) so
            // the list always floats directly below the input.
            style={{
              transformOrigin: "top",
              position: "absolute",
              top: "100%",
              insetInlineStart: 0,
              insetInlineEnd: 0,
            }}
            className="panel z-50 mt-2 w-full overflow-hidden p-1.5"
            onMouseDown={(e) => e.preventDefault()}
          >
            {hits.map((hit, i) => (
              <li key={`${hit.symbol}-${i}`}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(hit.symbol)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors"
                  style={{ background: i === active ? "var(--panel-2)" : "transparent" }}
                >
                  <TrendingUp size={15} style={{ color: "var(--accent)" }} />
                  <span className="font-semibold">{hit.symbol}</span>
                  <span className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--fg-muted)" }}>
                    {hit.name}
                  </span>
                  <span className="shrink-0 text-xs" style={{ color: "var(--fg-dim)" }}>
                    {hit.type}
                    {hit.exchange ? ` · ${hit.exchange}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {big && !open && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs" style={{ color: "var(--fg-dim)" }}>
            נסה
          </span>
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              onClick={() => go(s)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING.snappy}
              className="rounded-lg border px-2.5 py-1 text-xs font-semibold text-[var(--fg-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--fg)]"
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
