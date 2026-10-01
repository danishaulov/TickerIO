import { NextRequest, NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { searchSymbols } from "@/lib/providers/search";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json({ hits: [] });
  try {
    const { value } = await cached(`search:${q.toLowerCase()}`, 300, () => searchSymbols(q));
    return NextResponse.json({ hits: value });
  } catch {
    return NextResponse.json({ error: "החיפוש אינו זמין כרגע. נסו שוב בעוד רגע." }, { status: 503 });
  }
}
