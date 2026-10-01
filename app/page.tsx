import { MarketOverview } from "@/components/MarketOverview";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { QuickAccess } from "@/components/landing/QuickAccess";
import { MoversStrip } from "@/components/landing/MoversStrip";
import { FeatureGrid } from "@/components/landing/FeatureGrid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader showSearch={false} />

      <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center px-4 sm:px-6">
        {/* Hero */}
        <Hero />

        {/* Jump straight into the app */}
        <div className="mt-10 w-full">
          <QuickAccess />
        </div>

        {/* Live market overview */}
        <div className="mt-12 w-full">
          <MarketOverview />
        </div>

        {/* What's moving right now — biggest gainers/losers, one click to the boards */}
        <div className="mt-12 w-full">
          <MoversStrip />
        </div>

        {/* Features */}
        <div className="mt-24 w-full">
          <FeatureGrid />
        </div>
      </div>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--fg-dim)]">
        נתונים: Yahoo Finance · CoinDesk · FXStreet · Alternative.me · Forex Factory · TradingView.
        לצורכי ניתוח בלבד, אינו ייעוץ השקעות.
      </footer>
    </main>
  );
}
