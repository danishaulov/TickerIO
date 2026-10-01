"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeSymbol } from "@/lib/symbol-list";

export interface PriceAlert {
  id: string;
  symbol: string;
  op: "above" | "below";
  price: number;
  currency?: string;
  createdAt: number;
}
export interface TriggeredAlert extends PriceAlert {
  triggeredAt: number;
  actualPrice: number;
}
interface AlertsState {
  alerts: PriceAlert[];
  history: TriggeredAlert[];
  add: (symbol: string, op: PriceAlert["op"], price: number, currency?: string) => boolean;
  remove: (id: string) => void;
  dismissHistory: (id: string) => void;
  trigger: (id: string, actualPrice: number) => TriggeredAlert | undefined;
  forSymbol: (symbol: string) => PriceAlert[];
}

export const useAlerts = create<AlertsState>()(
  persist(
    (set, get) => ({
      alerts: [],
      history: [],
      add: (raw, op, price, currency = "USD") => {
        const symbol = normalizeSymbol(raw);
        if (!symbol || !Number.isFinite(price) || price <= 0 || get().alerts.length >= 50) return false;
        if (get().alerts.some((a) => a.symbol === symbol && a.op === op && a.price === price)) return false;
        set((s) => ({
          alerts: [{ id: crypto.randomUUID(), symbol, op, price, currency, createdAt: Date.now() }, ...s.alerts],
        }));
        return true;
      },
      remove: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      dismissHistory: (id) => set((s) => ({ history: s.history.filter((a) => a.id !== id) })),
      // Atomically remove and record, so Strict Mode / repeated ticks cannot fire twice.
      trigger: (id, actualPrice) => {
        const alert = get().alerts.find((a) => a.id === id);
        if (!alert || !Number.isFinite(actualPrice) || actualPrice <= 0) return;
        const triggered = { ...alert, actualPrice, triggeredAt: Date.now() };
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id), history: [triggered, ...s.history].slice(0, 100) }));
        return triggered;
      },
      forSymbol: (symbol) => get().alerts.filter((a) => a.symbol === normalizeSymbol(symbol)),
    }),
    {
      name: "tickerio-alerts",
      version: 1,
      migrate: (raw) => {
        const state = raw as { alerts?: PriceAlert[]; history?: TriggeredAlert[] };
        return {
          alerts: (state.alerts ?? []).map((a) => ({ ...a, symbol: normalizeSymbol(a.symbol) }))
            .filter((a) => a.symbol && Number.isFinite(a.price) && a.price > 0 && (a.op === "above" || a.op === "below")).slice(0, 50),
          history: state.history ?? [],
        };
      },
      partialize: (s) => ({ alerts: s.alerts, history: s.history }),
    },
  ),
);
