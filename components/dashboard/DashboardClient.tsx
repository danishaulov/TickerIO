"use client";

import { useEffect, type ReactNode } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  useCalendar,
  useCandles,
  useFundamentals,
  useNews,
  useOverview,
  usePeers,
  useProfile,
  useQuote,
  usePriceStream,
} from "@/lib/hooks";
import { useBias } from "@/store/useBias";
import { useWidgetOrder, reconcileOrder, DEFAULT_ORDER } from "@/store/useWidgetOrder";
import { UI } from "@/lib/i18n/he";
import { Reveal } from "@/components/ui/Reveal";
import { SortableWidget } from "./SortableWidget";
import { DashboardNavigation } from "./DashboardNavigation";
import { PriceHeader } from "@/components/widgets/PriceHeader";
import { ChartPanel } from "@/components/widgets/ChartPanel";
import { TimeframePanel } from "@/components/widgets/TimeframePanel";
import { FearGreedGauge } from "@/components/widgets/FearGreedGauge";
import { TrendBiasIndicator } from "@/components/widgets/TrendBiasIndicator";
import { FundamentalAnalysis } from "@/components/widgets/FundamentalAnalysis";
import { PeerComparison } from "@/components/widgets/PeerComparison";
import { AssetProfileCard } from "@/components/widgets/AssetProfile";
import { NewsFeed } from "@/components/widgets/NewsFeed";
import { EconomicCalendar } from "@/components/widgets/EconomicCalendar";
import { KeyStats } from "@/components/widgets/KeyStats";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardClient({ symbol }: { symbol: string }) {
  const quoteQ = useQuote(symbol);
  const candlesQ = useCandles(symbol);
  const overviewQ = useOverview(symbol);
  const newsQ = useNews(symbol);
  const fundQ = useFundamentals(symbol);
  const profileQ = useProfile(symbol);
  const calQ = useCalendar();
  const isEquity = quoteQ.data?.assetClass === "equity";
  const peersQ = usePeers(symbol, isEquity);

  // Live price ticks via SSE → patches the quote cache in place.
  usePriceStream(symbol);

  const quote = quoteQ.data;
  const spark = candlesQ.data?.candles.map((c) => c.c) ?? [];
  const bias = overviewQ.data?.trendBias.bias ?? 0;

  // Tint the global living background to this symbol's bias; reset on leave.
  const setBias = useBias((s) => s.setBias);
  useEffect(() => {
    setBias(bias);
    return () => setBias(0);
  }, [bias, setBias]);

  // Reorderable right-rail widgets (persisted). Default order pre-mount to avoid
  // hydration mismatch, then switch to the user's saved order.
  const storedOrder = useWidgetOrder((s) => s.order);
  const setOrder = useWidgetOrder((s) => s.setOrder);
  const mounted = useHydrated();
  const order = mounted ? reconcileOrder(storedOrder) : [...DEFAULT_ORDER];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = order.indexOf(String(active.id));
      const to = order.indexOf(String(over.id));
      if (from !== -1 && to !== -1) setOrder(arrayMove(order, from, to));
    }
  }

  const ov = overviewQ.data;
  const widgetNodes: Record<string, ReactNode> = {
    performance: <TimeframePanel rows={ov?.timeframes.rows} currency={ov?.timeframes.currency} loading={overviewQ.isLoading} />,
    keystats: <KeyStats quote={quote} loading={quoteQ.isLoading} />,
    feargreed: <FearGreedGauge score={ov?.sentiment.score} source={ov?.sentiment.source} loading={overviewQ.isLoading} />,
    trendbias: (
      <TrendBiasIndicator
        bias={ov?.trendBias.bias}
        technical={ov?.trendBias.technical}
        sentiment={ov?.trendBias.sentiment}
        label={ov?.trendBias.label}
        loading={overviewQ.isLoading}
      />
    ),
    calendar: <EconomicCalendar events={calQ.data?.events} source={calQ.data?.source} loading={calQ.isLoading} />,
  };

  return (
    <main id="main-content" className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6">
      <Reveal>
        <PriceHeader
          quote={quote}
          spark={spark}
          loading={quoteQ.isLoading}
          error={quoteQ.error instanceof Error ? quoteQ.error.message : null}
        />
      </Reveal>

      <DashboardNavigation symbol={symbol} isEquity={isEquity} />

      {!quote && quoteQ.isError ? <section className="panel py-12 text-center">
        <p className="text-sm text-[var(--fg-muted)]">אפשר לנסות לטעון שוב, או לבחור טיקר אחר בחיפוש למעלה.</p>
        <button className="control control-primary mt-4" disabled={quoteQ.isFetching} onClick={() => quoteQ.refetch()}>{quoteQ.isFetching ? "טוען…" : "נסה שוב"}</button>
      </section> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_372px]">
        {/* Left — chart, AI, news */}
        <div className="flex min-w-0 flex-col gap-5">
          <section id="chart" aria-label="גרף מחיר" className="dashboard-section min-w-0">
            {quote ? (
              <ChartPanel symbol={quote.symbol} display={quote.display} assetClass={quote.assetClass} />
            ) : (
              <Skeleton className="h-[440px] w-full rounded-2xl sm:h-[620px]" />
            )}
          </section>
          <section id="profile" aria-label="אודות הנכס" className="dashboard-section">
            <AssetProfileCard data={profileQ.data} display={quote?.display ?? symbol} loading={profileQ.isLoading} />
          </section>
          <section id="fundamentals" aria-label="ניתוח פונדמנטלי" className="dashboard-section">
            <FundamentalAnalysis data={fundQ.data} loading={fundQ.isLoading} />
          </section>
          {isEquity && (
            <Reveal delay={0.12}>
              <PeerComparison data={peersQ.data} loading={peersQ.isLoading} />
            </Reveal>
          )}
          <section id="news" aria-label="חדשות" className="dashboard-section">
            <NewsFeed
              symbol={symbol}
              items={newsQ.data?.items}
              sources={newsQ.data?.sources}
              loading={newsQ.isLoading}
            />
          </section>
        </div>

        {/* Right — reorderable widget rail */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <aside id="market-data" aria-label="נתונים ומגמות" className="dashboard-section flex min-w-0 flex-col gap-5">
              {order.map((id) => (
                <SortableWidget key={id} id={id}>
                  {widgetNodes[id]}
                </SortableWidget>
              ))}
              <p className="text-center text-[11px]" style={{ color: "var(--fg-dim)" }}>
                סידור הכרטיסים: גררו את הידית, או בחרו בה והשתמשו ברווח ובחצים.
              </p>
            </aside>
          </SortableContext>
        </DndContext>
      </div>}

      <p className="mt-8 text-center text-xs" style={{ color: "var(--fg-dim)" }}>
        {UI.dataFooter}
      </p>
    </main>
  );
}
