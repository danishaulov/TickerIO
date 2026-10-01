"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeSymbol, normalizeSymbols, WATCHLIST_LIMIT } from "@/lib/symbol-list";

interface WatchlistState {
  symbols: string[];
  add: (symbol: string) => boolean;
  addMany: (symbols: string[]) => number;
  remove: (symbol: string) => void;
  toggle: (symbol: string) => void;
  has: (symbol: string) => boolean;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: [],
      add: (raw) => {
        const symbol = normalizeSymbol(raw);
        const { symbols } = get();
        if (!symbol || symbols.includes(symbol) || symbols.length >= WATCHLIST_LIMIT) return false;
        set({ symbols: [symbol, ...symbols] });
        return true;
      },
      addMany: (raw) => {
        const { symbols } = get();
        const additions = normalizeSymbols(raw).filter((s) => !symbols.includes(s))
          .slice(0, WATCHLIST_LIMIT - symbols.length);
        if (additions.length) set({ symbols: [...additions, ...symbols] });
        return additions.length;
      },
      remove: (symbol) => set((s) => ({ symbols: s.symbols.filter((x) => x !== normalizeSymbol(symbol)) })),
      toggle: (symbol) => {
        if (get().has(symbol)) get().remove(symbol);
        else get().add(symbol);
      },
      has: (symbol) => get().symbols.includes(normalizeSymbol(symbol)),
    }),
    {
      name: "tickerio-watchlist",
      version: 1,
      migrate: (persisted) => ({ symbols: normalizeSymbols((persisted as { symbols?: string[] })?.symbols ?? []) }),
      partialize: (state) => ({ symbols: state.symbols }),
    },
  ),
);
