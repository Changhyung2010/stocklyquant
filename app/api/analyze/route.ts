import { NextRequest, NextResponse } from "next/server";
import type { ProgressEvent } from "@/lib/types";
import { analyzeStock } from "@/lib/analyzeStock";

const encoder = new TextEncoder();

function sseEvent(controller: ReadableStreamDefaultController, event: ProgressEvent) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ticker: string = (body.ticker ?? "").toUpperCase().trim();
  const polygonKey: string = process.env.POLYGON_API_KEY || body.polygonKey || "";
  const fmpKey: string = process.env.FMP_API_KEY || body.fmpKey || "";
  const claudeKey: string = process.env.ANTHROPIC_API_KEY || body.claudeKey || "";

  if (!ticker) return NextResponse.json({ error: "Ticker required" }, { status: 400 });
  if (!polygonKey) return NextResponse.json({ error: "Polygon API key required" }, { status: 400 });
  if (!fmpKey) return NextResponse.json({ error: "FMP API key required" }, { status: 400 });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ProgressEvent) => sseEvent(controller, event);

      try {
        const result = await analyzeStock(
          ticker,
          { polygonKey, fmpKey, claudeKey },
          (stage, message) => {
            send({ stage: stage as ProgressEvent["stage"], message });
          }
        );

        send({ stage: "complete", message: "Done", result });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Analysis failed";
        send({ stage: "error", message: msg, error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
