"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Route transition. `template.tsx` remounts on every navigation, so each page
 * arrives with a soft fade instead of a hard cut — an app-like feel across
 * landing → dashboard → compare → markets. Reduced-motion → instant.
 *
 * IMPORTANT: this wrapper is an ancestor of the sticky <SiteHeader>. We animate
 * OPACITY ONLY and never a transform. A `transform` (even the resting
 * `translateY(0)` Framer leaves behind, or a mid-animation `translateY(8px)`)
 * turns this div into the containing block for `position: sticky`, which detaches
 * the header from the viewport — the search bar scrolls up and off-screen. Opacity
 * creates no containing block, so the header keeps pinning to the viewport. The
 * per-widget `Reveal` components still supply the vertical "rise" on the content.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.base, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
