"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpLeft, CircleAlert, LoaderCircle, Search, X } from "lucide-react";
import { useSearch } from "@/lib/hooks";
import type { SearchHit } from "@/lib/api";
import { normalizeSymbol } from "@/lib/symbol-list";
import { searchPopoverPosition } from "@/lib/search-popover";

const TYPE_LABELS: Record<string, string> = {
  equity: "מניה", etf: "קרן סל", cryptocurrency: "קריפטו", currency: "מט״ח",
  index: "מדד", future: "חוזה עתידי", mutualfund: "קרן נאמנות",
};

export function SymbolSearchField({
  onSelect, label, placeholder, size = "sm", submitLabel, disabled = false,
  autoFocus = false, clearOnSelect = true, suggestions = [], suggestionsLabel = "גישה מהירה",
  className = "",
}: {
  onSelect: (symbol: string) => void;
  label: string;
  placeholder: string;
  size?: "lg" | "sm";
  submitLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  clearOnSelect?: boolean;
  suggestions?: SearchHit[];
  suggestionsLabel?: string;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<ReturnType<typeof searchPopoverPosition> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const query = value.trim();
  const search = useSearch(value);
  const hits = query ? search.data?.hits ?? [] : suggestions;
  const loading = Boolean(query) && search.isSearching;
  const failed = Boolean(query) && search.isError && !loading;
  const selected = Math.min(active, hits.length - 1);
  const expanded = open && !disabled;
  const big = size === "lg";
  const directSymbol = normalizeSymbol(value);

  useEffect(() => {
    if (!expanded) return;
    function positionResults() {
      const anchor = inputRef.current;
      if (!anchor || !anchor.getClientRects().length) { setOpen(false); return; }
      const viewport = window.visualViewport;
      setPosition(searchPopoverPosition(anchor.getBoundingClientRect(), {
        left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0,
        width: viewport?.width ?? window.innerWidth, height: viewport?.height ?? window.innerHeight,
      }));
    }
    function outside(event: PointerEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpen(false);
    }
    function focusChanged(event: FocusEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpen(false);
    }
    const frame = requestAnimationFrame(positionResults);
    const observer = new ResizeObserver(positionResults);
    if (inputRef.current) observer.observe(inputRef.current);
    window.addEventListener("resize", positionResults);
    // Capture scrolls from nested layouts as well as the document.
    window.addEventListener("scroll", positionResults, true);
    window.visualViewport?.addEventListener("resize", positionResults);
    window.visualViewport?.addEventListener("scroll", positionResults);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", focusChanged);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", positionResults);
      window.removeEventListener("scroll", positionResults, true);
      window.visualViewport?.removeEventListener("resize", positionResults);
      window.visualViewport?.removeEventListener("scroll", positionResults);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", focusChanged);
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const list = listRef.current;
    const option = list?.children[selected] as HTMLElement | undefined;
    if (!list || !option) return;
    // Scroll only the results, never the page or its sticky header.
    const top = option.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (top + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top + option.offsetHeight - list.clientHeight;
    }
  }, [selected, expanded, position?.maxHeight, hits.length]);

  function choose(symbol: string) {
    const clean = normalizeSymbol(symbol);
    if (!clean) return;
    setOpen(false);
    setActive(0);
    if (clearOnSelect) setValue("");
    onSelect(clean);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (hits.length) setActive((previous) => !expanded ? 0 : (previous + (event.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!loading) choose(expanded && hits[selected] ? hits[selected].symbol : value);
    }
  }

  return <div ref={rootRef} className={`relative w-full ${className}`}>
    <form role="search" aria-label={label} onSubmit={(event) => {
      event.preventDefault();
      if (!loading) choose(expanded && hits[selected] ? hits[selected].symbol : value);
    }} className="relative">
      <Search size={big ? 22 : 18} aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
      <input ref={inputRef} role="combobox" aria-label={label} aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined} aria-autocomplete="list"
        aria-activedescendant={expanded && hits[selected] ? `${listId}-${selected}` : undefined}
        value={value} autoFocus={autoFocus} disabled={disabled}
        onChange={(event) => { setValue(event.target.value); setOpen(true); setActive(0); }}
        onFocus={() => { if (!open) { setPosition(null); setOpen(true); } }}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown} placeholder={placeholder} spellCheck={false} autoComplete="off" autoCapitalize="characters"
        enterKeyHint="search"
        className={`search-input w-full rounded-xl border bg-[var(--panel)] ps-12 font-medium text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-muted)] disabled:opacity-50 ${big ? "min-h-16 py-4 text-lg" : "min-h-11 py-2.5 text-base sm:text-sm"} ${submitLabel ? "pe-28" : "pe-12"}`}
      />
      <div className="absolute end-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value && <button type="button" aria-label="נקה חיפוש" onMouseDown={(event) => event.preventDefault()}
          onClick={() => { setValue(""); setActive(0); setOpen(true); inputRef.current?.focus(); }}
          className="grid h-9 w-9 place-items-center rounded-lg text-[var(--fg-muted)] hover:bg-[var(--panel-2)]"><X size={16} /></button>}
        {submitLabel && <button type="submit" disabled={!query || loading || disabled}
          className="flex min-h-9 items-center justify-center rounded-lg bg-[var(--accent)] px-3 text-xs font-semibold text-white disabled:opacity-45">
          {loading ? <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-label="מחפש" /> : submitLabel}
        </button>}
      </div>
    </form>

    {expanded && position && createPortal(
      <div ref={popupRef} dir="rtl" className="search-results fixed z-[90] flex flex-col overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)] shadow-2xl"
        style={position} onKeyDown={(event) => { if (event.key === "Escape") { inputRef.current?.focus(); setOpen(false); } }}>
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-2.5 text-xs text-[var(--fg-muted)]">
          <span>{query ? "תוצאות חיפוש" : suggestionsLabel}</span>
          <span aria-live="polite">{loading ? "מחפש…" : hits.length ? `${hits.length} תוצאות` : ""}</span>
        </div>
        <ul ref={listRef} id={listId} role="listbox" aria-label="תוצאות חיפוש" aria-busy={loading}
          className="relative min-h-0 overflow-y-auto overscroll-contain p-1.5">
          {hits.map((hit, index) => <li key={`${hit.symbol}-${index}`} role="presentation">
            <button type="button" id={`${listId}-${index}`} role="option" aria-selected={index === selected} tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onPointerMove={(event) => { if (event.pointerType === "mouse" && (event.movementX || event.movementY)) setActive(index); }}
              onClick={() => choose(hit.symbol)}
              className={`flex min-h-16 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start ${index === selected ? "bg-[var(--panel-2)]" : "hover:bg-[var(--panel-2)]"}`}>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><bdi className="text-sm font-bold text-[var(--fg)]">{hit.symbol}</bdi>
                  <span className="rounded border px-1.5 py-0.5 text-[10px] text-[var(--fg-muted)]">{TYPE_LABELS[hit.type.toLowerCase()] ?? hit.type}</span>
                </span>
                {hit.name && <span dir="auto" title={hit.name} className="mt-1 block truncate text-start text-sm text-[var(--fg-muted)]">{hit.name}</span>}
              </span>
              <span className="shrink-0 text-end"><bdi className="block text-[10px] text-[var(--fg-muted)]">{hit.exchange}</bdi>
                <ArrowUpLeft size={15} className={`ms-auto mt-1 text-[var(--accent)] ${index === selected ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
              </span>
            </button>
          </li>)}
        </ul>
        {!hits.length && <div className="min-h-0 overflow-y-auto px-5 py-5 text-center" role="status">
          {loading ? <><LoaderCircle size={20} className="mx-auto mb-2 animate-spin text-[var(--accent)] motion-reduce:animate-none" /><p className="text-sm">מחפש מניות, קריפטו ומדדים…</p></>
            : <><CircleAlert size={20} className="mx-auto mb-2 text-[var(--fg-muted)]" /><p className="text-sm">{failed ? "החיפוש אינו זמין כרגע" : query ? "לא נמצאו תוצאות" : "חפשו חברה או הקלידו סימול"}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--fg-muted)]">{failed ? "אפשר לנסות שוב או להזין סימול מלא." : "נסו שם חברה באנגלית או סימול כמו AAPL."}</p>
              {failed && <button type="button" onClick={() => search.refetch()} className="control mt-3">נסה שוב</button>}
              {query && directSymbol && <button type="button" onClick={() => choose(directSymbol)} className="control mt-3 ms-2">{submitLabel ? "פתח" : "בחר"} <bdi>{directSymbol}</bdi></button>}
            </>}
        </div>}
        <div className="hidden shrink-0 items-center gap-4 border-t px-4 py-2 text-[10px] text-[var(--fg-muted)] sm:flex">
          <span><kbd>↑ ↓</kbd> לבחירה</span><span><kbd>Enter</kbd> לפתיחה</span><span className="ms-auto"><kbd>Esc</kbd> לסגירה</span>
        </div>
      </div>, document.body,
    )}
  </div>;
}
