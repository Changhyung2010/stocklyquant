/**
 * Cron job: evaluate predictions that are now 30+ days old.
 * Runs once daily at 10:30 PM UTC (after US market close).
 * Fetches actual price at the ~30-day mark and records accuracy.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchPolygonBars } from "@/lib/analyzeStock";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${cronSecret}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const polygonKey = process.env.POLYGON_API_KEY ?? "";
  if (!polygonKey) {
    return NextResponse.json({ error: "POLYGON_API_KEY not set" }, { status: 503 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const cutoff = addDays(today, -30); // predictions made 30+ days ago

  // ── Find unevaluated predictions that are due ────────────────────────────────
  const { data: pending, error: fetchError } = await supabaseAdmin
    .from("predictions")
    .select("*")
    .eq("is_evaluated", false)
    .lte("prediction_date", cutoff)
    .order("prediction_date", { ascending: true })
    .limit(20); // batch of 20 per cron run

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!pending?.length) {
    return NextResponse.json({ message: "No predictions to evaluate", evaluated: 0 });
  }

  const results: { ticker: string; evaluated: boolean; error?: string }[] = [];

  for (const pred of pending) {
    const evaluationDate = addDays(pred.prediction_date, 30);

    // Fetch a small window around the evaluation date (±5 days for holidays/weekends)
    const windowFrom = addDays(evaluationDate, -5);
    const windowTo = addDays(evaluationDate, 5);

    let actualPrice: number | null = null;

    try {
      const bars = await fetchPolygonBars(pred.ticker, windowFrom, windowTo, polygonKey);
      if (!bars.length) throw new Error("No price data in evaluation window");

      // Pick the bar closest to the target evaluation date
      const target = new Date(evaluationDate).getTime();
      bars.sort((a, b) => {
        return (
          Math.abs(new Date(a.date).getTime() - target) -
          Math.abs(new Date(b.date).getTime() - target)
        );
      });
      actualPrice = bars[0].price;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Price fetch failed";
      console.error(`[cron/evaluate] ${pred.ticker}:`, msg);
      results.push({ ticker: pred.ticker, evaluated: false, error: msg });
      continue;
    }

    // ── Calculate accuracy metrics ─────────────────────────────────────────────
    const startPrice: number = Number(pred.start_price);
    const predictedPrice: number = Number(pred.predicted_price_30d);
    const upper95: number | null = pred.predicted_upper_95 != null ? Number(pred.predicted_upper_95) : null;
    const lower95: number | null = pred.predicted_lower_95 != null ? Number(pred.predicted_lower_95) : null;

    const predictedReturn = (predictedPrice - startPrice) / startPrice;
    const actualReturn = (actualPrice - startPrice) / startPrice;

    const inCi95 =
      upper95 != null && lower95 != null
        ? actualPrice >= lower95 && actualPrice <= upper95
        : null;

    const directionCorrect =
      (actualReturn > 0 && pred.predicted_direction === "UP") ||
      (actualReturn < 0 && pred.predicted_direction === "DOWN") ||
      (actualReturn === 0); // flat is a pass

    const predictionErrorPct =
      Math.abs(predictedPrice - actualPrice) / actualPrice * 100;

    // ── Insert accuracy result ────────────────────────────────────────────────
    const { error: insertError } = await supabaseAdmin.from("accuracy_results").insert({
      prediction_id: pred.id,
      ticker: pred.ticker,
      prediction_date: pred.prediction_date,
      evaluation_date: evaluationDate,
      start_price: startPrice,
      predicted_price: predictedPrice,
      actual_price: actualPrice,
      predicted_return: predictedReturn,
      actual_return: actualReturn,
      in_ci_95: inCi95,
      direction_correct: directionCorrect,
      prediction_error_pct: predictionErrorPct,
      quant_score: pred.quant_score,
      formula_used: pred.formula_used,
    });

    if (insertError) {
      console.error(`[cron/evaluate] Insert error for ${pred.ticker}:`, insertError);
      results.push({ ticker: pred.ticker, evaluated: false, error: insertError.message });
      continue;
    }

    // Mark prediction as evaluated
    await supabaseAdmin
      .from("predictions")
      .update({ is_evaluated: true })
      .eq("id", pred.id);

    results.push({ ticker: pred.ticker, evaluated: true });
  }

  const evaluated = results.filter((r) => r.evaluated).length;
  return NextResponse.json({ evaluated, total: pending.length, results });
}
