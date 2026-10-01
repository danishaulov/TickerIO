import { NextRequest } from "next/server";
import { quote } from "@/lib/market";
import { normalizeSymbol } from "@/lib/symbol-list";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Bound each SSE connection and release every timer on disconnect. */
export async function GET(req: NextRequest) {
  const symbol = normalizeSymbol(req.nextUrl.searchParams.get("symbol") ?? "");
  if (!symbol) return new Response("valid symbol required", { status: 400 });
  const encoder = new TextEncoder();
  let stop = () => {};

  const stream = new ReadableStream({
    start(controller) {
      let stopped = false;
      let busy = false;
      stop = () => {
        if (stopped) return;
        stopped = true;
        clearInterval(interval);
        clearTimeout(deadline);
        req.signal.removeEventListener("abort", stop);
        try { controller.close(); } catch { /* already closed */ }
      };
      const tick = async () => {
        if (stopped || busy) return;
        busy = true;
        try {
          const { value, stale } = await quote(symbol);
          if (!stopped) {
            controller.enqueue(encoder.encode(`event: price\ndata: ${JSON.stringify({
              symbol: value.symbol, price: value.price, change: value.change,
              changePct: value.changePct, asOf: value.asOf, stale,
            })}\n\n`));
          }
        } catch { /* polling is the client fallback */ }
        finally { busy = false; }
      };
      const deadline = setTimeout(stop, 45_000);
      const interval = setInterval(() => void tick(), 5000);
      req.signal.addEventListener("abort", stop, { once: true });
      if (req.signal.aborted) { stop(); return; }
      controller.enqueue(encoder.encode("retry: 2000\n\n"));
      void tick();
    },
    cancel() { stop(); },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
