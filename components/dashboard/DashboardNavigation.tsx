import Link from "next/link";
import { ChartNoAxesCombined, Newspaper, SlidersHorizontal, Building2, Scale, ArrowLeftRight } from "lucide-react";

const SECTIONS = [
  { id: "chart", label: "גרף", icon: ChartNoAxesCombined },
  { id: "fundamentals", label: "ניתוח פונדמנטלי", icon: Scale },
  { id: "market-data", label: "נתונים ומגמות", icon: SlidersHorizontal },
  { id: "news", label: "חדשות", icon: Newspaper },
  { id: "profile", label: "אודות החברה", icon: Building2 },
];

export function DashboardNavigation({ symbol, isEquity }: { symbol: string; isEquity: boolean }) {
  return <div className="my-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
    <nav aria-label="ניווט בדוח" className="flex max-w-full flex-wrap gap-1">
      {SECTIONS.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:bg-[var(--panel-2)] hover:text-[var(--fg)]">
        <Icon size={15} aria-hidden="true" />{id === "profile" && !isEquity ? "אודות הנכס" : label}
      </a>)}
    </nav>
    <Link className="control inline-flex items-center gap-2 text-xs" href={`/compare?symbols=${encodeURIComponent(symbol)}`}>
      <ArrowLeftRight size={15} aria-hidden="true" />השוואה לנכסים אחרים
    </Link>
  </div>;
}
