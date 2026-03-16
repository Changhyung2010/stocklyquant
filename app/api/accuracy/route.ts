/**
 * GET /api/accuracy
 * Returns accuracy summary statistics, per-formula and per-ticker breakdowns,
 * and the most recent predictions and evaluated results.
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // Fetch all accuracy results
  const { data: results, error: resultsError } = await supabase
    .from("accuracy_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (resultsError) {
    console.error("[accuracy] DB error:", resultsError);
    return NextResponse.json({ error: "Failed to fetch accuracy data" }, { status: 500 });
  }

  // Fetch recent predictions (last 30)
  const { data: recentPredictions } = await supabase
    .from("predictions")
    .select("ticker, prediction_date, predicted_return_30d, predicted_direction, quant_score, formula_used, is_evaluated, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  // Count totals
  const totalPredictions = (
    await supabase.from("predictions").select("id", { count: "exact", head: true })
  ).count ?? 0;

  const evaluated = results?.length ?? 0;
  const pending = totalPredictions - evaluated;

  // ── Compute summary stats ────────────────────────────────────────────────────
  let directionalAccuracy = 0;
  let ciCoverageRate = 0;
  let meanAbsoluteErrorPct = 0;

  if (results && results.length > 0) {
    const correct = results.filter((r) => r.direction_correct).length;
    directionalAccuracy = correct / results.length;

    const withCi = results.filter((r) => r.in_ci_95 !== null);
    if (withCi.length > 0) {
      ciCoverageRate = withCi.filter((r) => r.in_ci_95).length / withCi.length;
    }

    meanAbsoluteErrorPct =
      results.reduce((sum, r) => sum + Number(r.prediction_error_pct), 0) / results.length;
  }

  // ── By formula ──────────────────────────────────────────────────────────────
  const formulaMap: Record<string, { correct: number; total: number; errorSum: number }> = {};
  for (const r of results ?? []) {
    if (!formulaMap[r.formula_used]) {
      formulaMap[r.formula_used] = { correct: 0, total: 0, errorSum: 0 };
    }
    formulaMap[r.formula_used].total++;
    if (r.direction_correct) formulaMap[r.formula_used].correct++;
    formulaMap[r.formula_used].errorSum += Number(r.prediction_error_pct);
  }

  const byFormula = Object.entries(formulaMap)
    .map(([formula, data]) => ({
      formula,
      count: data.total,
      directionalAccuracy: data.total > 0 ? data.correct / data.total : 0,
      mape: data.total > 0 ? data.errorSum / data.total : 0,
    }))
    .sort((a, b) => b.directionalAccuracy - a.directionalAccuracy);

  // ── By ticker ───────────────────────────────────────────────────────────────
  const tickerMap: Record<string, { correct: number; total: number; errorSum: number; scoreSum: number }> = {};
  for (const r of results ?? []) {
    if (!tickerMap[r.ticker]) {
      tickerMap[r.ticker] = { correct: 0, total: 0, errorSum: 0, scoreSum: 0 };
    }
    tickerMap[r.ticker].total++;
    if (r.direction_correct) tickerMap[r.ticker].correct++;
    tickerMap[r.ticker].errorSum += Number(r.prediction_error_pct);
    tickerMap[r.ticker].scoreSum += Number(r.quant_score);
  }

  const byTicker = Object.entries(tickerMap)
    .map(([ticker, data]) => ({
      ticker,
      count: data.total,
      directionalAccuracy: data.total > 0 ? data.correct / data.total : 0,
      mape: data.total > 0 ? data.errorSum / data.total : 0,
      avgQuantScore: data.total > 0 ? data.scoreSum / data.total : 0,
    }))
    .sort((a, b) => b.directionalAccuracy - a.directionalAccuracy);

  // ── Recent results (last 20 evaluated) ──────────────────────────────────────
  const recentResults = (results ?? []).slice(0, 20).map((r) => ({
    ticker: r.ticker,
    predictionDate: r.prediction_date,
    evaluationDate: r.evaluation_date,
    startPrice: Number(r.start_price),
    predictedPrice: Number(r.predicted_price),
    actualPrice: Number(r.actual_price),
    predictedReturn: Number(r.predicted_return),
    actualReturn: Number(r.actual_return),
    inCi95: r.in_ci_95,
    directionCorrect: r.direction_correct,
    predictionErrorPct: Number(r.prediction_error_pct),
    quantScore: Number(r.quant_score),
    formulaUsed: r.formula_used,
  }));

  return NextResponse.json({
    summary: {
      totalPredictions,
      evaluated,
      pending,
      directionalAccuracy,
      ciCoverageRate,
      meanAbsoluteErrorPct,
    },
    byFormula,
    byTicker,
    recentPredictions: recentPredictions ?? [],
    recentResults,
  });
}
