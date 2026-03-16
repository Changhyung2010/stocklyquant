/**
 * Cron job: record today's prediction for the next unanalyzed test stock.
 * Runs every hour on weekdays (see vercel.json).
 * One stock per invocation to stay within Vercel function timeout limits.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { analyzeStock } from "@/lib/analyzeStock";

// Vercel automatically sets CRON_SECRET and sends it as a Bearer token.
function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false; // must be set in env
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const polygonKey = process.env.POLYGON_API_KEY ?? "";
  const fmpKey = process.env.FMP_API_KEY ?? "";
  const claudeKey = process.env.ANTHROPIC_API_KEY ?? "";

  if (!polygonKey || !fmpKey) {
    return NextResponse.json({ error: "API keys not configured" }, { status: 503 });
  }

  // ── Pick next unanalyzed stock ───────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  // Get all test stocks
  const { data: testStocks, error: stocksError } = await supabaseAdmin
    .from("test_stocks")
    .select("ticker")
    .order("ticker");

  if (stocksError || !testStocks?.length) {
    return NextResponse.json({ message: "No test stocks configured", done: false });
  }

  // Get tickers already predicted today
  const { data: doneTodayRows } = await supabaseAdmin
    .from("predictions")
    .select("ticker")
    .eq("prediction_date", today);

  const doneToday = new Set((doneTodayRows ?? []).map((r) => r.ticker));
  const pending = testStocks.map((r) => r.ticker).filter((t) => !doneToday.has(t));

  if (!pending.length) {
    return NextResponse.json({ message: "All stocks analyzed today", done: true });
  }

  const ticker = pending[0];

  // ── Run analysis ─────────────────────────────────────────────────────────────
  let analysis;
  try {
    analysis = await analyzeStock(ticker, { polygonKey, fmpKey, claudeKey });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    console.error(`[cron/record] ${ticker}:`, msg);
    return NextResponse.json({ error: msg, ticker }, { status: 500 });
  }

  // ── Extract prediction data ──────────────────────────────────────────────────
  const pred = analysis.pricePrediction;
  if (!pred) {
    return NextResponse.json({ error: "No price prediction returned", ticker }, { status: 500 });
  }

  const startPrice = pred.currentPrice;
  const predictedPrice30d = startPrice * (1 + pred.expectedReturn30d);
  const predictedUpper95 = startPrice * (1 + pred.upperBound30d);
  const predictedLower95 = startPrice * (1 + pred.lowerBound30d);

  // Bull/bear come from the last forecast point
  const forecastPoints = pred.points.filter((p) => p.expected !== undefined);
  const lastForecast = forecastPoints[forecastPoints.length - 1];
  const predictedBull = lastForecast?.bull ?? null;
  const predictedBear = lastForecast?.bear ?? null;

  const predictedDirection = pred.expectedReturn30d >= 0 ? "UP" : "DOWN";
  const formulaUsed = analysis.claudeAnalysis?.selectedFormula ?? "FF5";

  // ── Insert into Supabase ─────────────────────────────────────────────────────
  const { error: insertError } = await supabaseAdmin.from("predictions").upsert(
    {
      ticker,
      prediction_date: today,
      start_price: startPrice,
      predicted_price_30d: predictedPrice30d,
      predicted_return_30d: pred.expectedReturn30d,
      predicted_upper_95: predictedUpper95,
      predicted_lower_95: predictedLower95,
      predicted_bull: predictedBull,
      predicted_bear: predictedBear,
      predicted_direction: predictedDirection,
      quant_score: analysis.quantScore,
      formula_used: formulaUsed,
      is_evaluated: false,
    },
    { onConflict: "ticker,prediction_date" }
  );

  if (insertError) {
    console.error("[cron/record] Insert error:", insertError);
    return NextResponse.json({ error: insertError.message, ticker }, { status: 500 });
  }

  return NextResponse.json({
    done: true,
    ticker,
    quantScore: analysis.quantScore,
    predictedReturn30d: (pred.expectedReturn30d * 100).toFixed(2) + "%",
    formula: formulaUsed,
    remaining: pending.length - 1,
  });
}
