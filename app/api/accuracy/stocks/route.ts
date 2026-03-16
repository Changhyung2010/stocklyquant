/**
 * GET  /api/accuracy/stocks  – list all test stocks
 * POST /api/accuracy/stocks  – add a ticker { ticker: "AAPL" }
 * DELETE /api/accuracy/stocks – remove a ticker { ticker: "AAPL" }
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// US equity tickers: 1–6 uppercase letters, optional dot suffix (e.g. BRK.A)
const TICKER_RE = /^[A-Z]{1,6}(\.[A-Z]{1,2})?$/;

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("test_stocks")
    .select("ticker, added_at")
    .order("ticker");

  if (error) {
    console.error("[accuracy/stocks] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
  }
  return NextResponse.json({ stocks: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const ticker = (body.ticker ?? "").toUpperCase().trim();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });
  if (!TICKER_RE.test(ticker)) return NextResponse.json({ error: "Invalid ticker format" }, { status: 400 });

  const { error } = await supabase
    .from("test_stocks")
    .upsert({ ticker }, { onConflict: "ticker" });

  if (error) {
    console.error("[accuracy/stocks] POST error:", error);
    return NextResponse.json({ error: "Failed to add stock" }, { status: 500 });
  }
  return NextResponse.json({ added: ticker });
}

export async function DELETE(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const ticker = (body.ticker ?? "").toUpperCase().trim();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });
  if (!TICKER_RE.test(ticker)) return NextResponse.json({ error: "Invalid ticker format" }, { status: 400 });

  const { error } = await supabase
    .from("test_stocks")
    .delete()
    .eq("ticker", ticker);

  if (error) {
    console.error("[accuracy/stocks] DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove stock" }, { status: 500 });
  }
  return NextResponse.json({ removed: ticker });
}
