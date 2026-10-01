"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TickerSearch } from "./TickerSearch";
import { CommandHint } from "./CommandHint";
import { TickerTape } from "./TickerTape";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "בית" },
  { href: "/markets", label: "מובילים" },
  { href: "/screen", label: "סקרינר" },
  { href: "/watchlist", label: "רשימת מעקב" },
  { href: "/compare", label: "השוואה" },
  { href: "/alerts", label: "התראות" },
];

export function SiteHeader({ showSearch = true }: { showSearch?: boolean }) {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--site-header-height", `${header.getBoundingClientRect().height}px`);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-[1400px] items-center gap-3 border-b border-[var(--border)] px-4 sm:px-6">
        <Link href="/" aria-label="TickerIO — דף הבית" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)]">
            <Activity size={18} strokeWidth={2.5} color="white" />
          </span>
          <span dir="ltr" className="font-display text-lg font-bold tracking-tight">Ticker<span className="text-[var(--accent)]">IO</span></span>
        </Link>
        {showSearch && <div className="mx-auto hidden min-w-0 flex-1 md:block xl:max-w-[380px]"><TickerSearch key={pathname} size="sm" /></div>}
        <div className="ms-auto flex items-center gap-3">
          <nav aria-label="ניווט ראשי" className="hidden items-center gap-4 text-sm xl:flex">
            {NAV.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 py-5 transition-colors hover:text-[var(--fg)] ${pathname === item.href ? "border-[var(--accent)] font-semibold text-[var(--accent)]" : "border-transparent text-[var(--fg-muted)]"}`}>
              {item.label}
            </Link>)}
          </nav>
          <span className="hidden sm:block"><CommandHint /></span>
          <ThemeToggle />
          <button ref={menuRef} onClick={() => setMenuPath(open ? null : pathname)} aria-expanded={open} aria-controls="mobile-navigation"
            aria-label={open ? "סגור תפריט" : "פתח תפריט"} className="grid h-11 w-11 place-items-center rounded-lg border xl:hidden">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {showSearch && <div className="px-4 py-3 md:hidden"><TickerSearch key={pathname} size="sm" /></div>}
      {open && <div id="mobile-navigation" className="border-b px-4 py-3 xl:hidden" onKeyDown={(e) => { if (e.key === "Escape") { setMenuPath(null); menuRef.current?.focus(); } }}>
        <nav aria-label="ניווט במובייל" className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          {NAV.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuPath(null)}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm ${pathname === item.href ? "bg-[var(--panel-2)] text-[var(--accent)]" : "text-[var(--fg-muted)]"}`}>
            {item.href === "/alerts" && <Bell size={15} />}{item.label}
          </Link>)}
        </nav>
      </div>}
      <div className="hidden sm:block"><TickerTape /></div>
    </header>
  );
}
