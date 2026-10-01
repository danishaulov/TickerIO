# TickerIO

Hebrew market research workspace for equities, crypto, indices and foreign exchange. Built with Next.js 16, React 19, TypeScript, TanStack Query and Zustand.

## Run locally

Requires Node.js 20.9+ and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Public market data works without API keys. For optional AI summaries, copy `.env.example` to `.env.local` and supply a supported server-side AI key. Keep credentials out of source control.

## Features

- Symbol dashboards: price, TradingView chart, anchored period performance, fundamental analysis, news, sentiment and peer comparisons.
- Market discovery: sector, crypto and commodity rankings.
- Watchlist: up to 24 symbols; company/symbol search, asset filters, sorting, card/list views, bulk entry, CSV export, undo removal and comparison selection.
- Comparison: up to six assets with shared baseline dates, an actual calendar axis, date scrubber, presets, shareable period/symbol URLs and CSV export.
- Fundamental screener: quality, growth and dividend filters, minimum score, symbol search, ascending/descending sorting, watchlist controls and CSV export.
- Price alerts: 50 active thresholds, in-app notices, optional desktop notifications and 100 entries of persistent trigger history.
- Hebrew RTL layouts, mobile navigation, dark/light themes and keyboard search with Ctrl/Cmd+K.

Watchlists and alerts are saved only in the current browser. Migrating older saved lists normalizes aliases without discarding entries. Full watchlists reject new additions instead of evicting older symbols.

## Data behavior

- Quotes use Yahoo Finance and may be delayed. Polling runs while the app is open; SSE augments dashboard quote updates.
- Price alerts require a non-stale quote timestamp within five minutes. They do not run after the site closes and are not guaranteed trade execution alerts.
- Comparison series use daily closes. All available assets rebase to 0% on their first shared UTC calendar date and end on their last shared date. Weekend crypto points retain their actual positions. A missing close is never invented.
- Chart returns are price returns without dividend adjustments. Day/week/month/YTD columns use the app's anchored period calculations and can differ from changes versus the previous close.
- Missing data is displayed explicitly. CSV comparison cells are blank on days without an observation; exports include raw numeric values and neutralize spreadsheet formulas in text fields.
- Optional AI providers fall back to available deterministic analysis when credentials or providers are unavailable.

## Validation

```sh
npm run test
npm run lint
npx tsc --noEmit
npm run build
```

Regression tests cover financial calculations, calendar alignment, symbol identities, persistence migration, list capacity, alert eligibility/history and CSV escaping.

### Browser smoke checks

1. Add `AAPL, BTC, BTC-USD` using bulk entry: only two assets should be saved.
2. Select both assets, open comparison, change the period and reload the copied link.
3. Use the chart date slider with Home/End; both returns start at 0%.
4. Remove every comparison symbol: the page should stay empty rather than restore defaults.
5. Create a price alert from a watchlist card. Manage it on `/alerts` and check trigger history.
6. Try an unavailable symbol: a retry action should replace loading placeholders.
7. Test menu navigation, symbol search and chart readability at a 390px viewport.
8. Verify light theme, keyboard focus, Ctrl/Cmd+K focus containment and Escape dismissal.
9. Export watchlist, screener and comparison CSVs.

## Production

```sh
npm run build
npm run start
```

The existing deployment is hosted on Vercel. Local edits do not update production until deployed.

Market information is provided for research, not investment advice.
