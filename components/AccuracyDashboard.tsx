"use client";
import { useEffect, useState, useRef } from "react";
import {
  FlaskConical,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccuracySummary {
  totalPredictions: number;
  evaluated: number;
  pending: number;
  directionalAccuracy: number;
  ciCoverageRate: number;
  meanAbsoluteErrorPct: number;
}

interface FormulaRow {
  formula: string;
  count: number;
  directionalAccuracy: number;
  mape: number;
}

interface TickerRow {
  ticker: string;
  count: number;
  directionalAccuracy: number;
  mape: number;
  avgQuantScore: number;
}

interface RecentResult {
  ticker: string;
  predictionDate: string;
  evaluationDate: string;
  startPrice: number;
  predictedPrice: number;
  actualPrice: number;
  predictedReturn: number;
  actualReturn: number;
  inCi95: boolean | null;
  directionCorrect: boolean;
  predictionErrorPct: number;
  quantScore: number;
  formulaUsed: string;
}

interface RecentPrediction {
  ticker: string;
  prediction_date: string;
  predicted_return_30d: number;
  predicted_direction: string;
  quant_score: number;
  formula_used: string;
  is_evaluated: boolean;
}

interface AccuracyData {
  summary: AccuracySummary;
  byFormula: FormulaRow[];
  byTicker: TickerRow[];
  recentPredictions: RecentPrediction[];
  recentResults: RecentResult[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(v: number, decimals = 1): string {
  return `${(v * 100).toFixed(decimals)}%`;
}

function fmtPrice(v: number): string {
  return `$${v.toFixed(2)}`;
}

function scoreColor(v: number): string {
  if (v >= 0.6) return "text-emerald-400";
  if (v >= 0.5) return "text-yellow-400";
  return "text-red-400";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccuracyDashboard() {
  const [data, setData] = useState<AccuracyData | null>(null);
  const [stocks, setStocks] = useState<{ ticker: string; added_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addInput, setAddInput] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [accRes, stocksRes] = await Promise.all([
        fetch("/api/accuracy"),
        fetch("/api/accuracy/stocks"),
      ]);

      if (!accRes.ok) {
        const j = await accRes.json();
        throw new Error(j.error ?? "Failed to load accuracy data");
      }
      if (!stocksRes.ok) {
        const j = await stocksRes.json();
        throw new Error(j.error ?? "Failed to load stocks");
      }

      const [accData, stocksData] = await Promise.all([accRes.json(), stocksRes.json()]);
      setData(accData);
      setStocks(stocksData.stocks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function addStock() {
    const ticker = addInput.trim().toUpperCase();
    if (!ticker) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/accuracy/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed to add");
      setStocks((prev) => [...prev.filter((s) => s.ticker !== ticker), { ticker, added_at: new Date().toISOString() }].sort((a, b) => a.ticker.localeCompare(b.ticker)));
      setAddInput("");
      inputRef.current?.focus();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add stock");
    } finally {
      setAddLoading(false);
    }
  }

  async function removeStock(ticker: string) {
    try {
      await fetch("/api/accuracy/stocks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      setStocks((prev) => prev.filter((s) => s.ticker !== ticker));
    } catch {
      alert("Failed to remove stock");
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-primary" />
        <span className="ml-3 text-slate-400">Loading accuracy data...</span>
      </div>
    );
  }

  // ── Error / Not configured ─────────────────────────────────────────────────
  if (error) {
    const isConfig = error.toLowerCase().includes("not configured");
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-warning" />
        </div>
        <h3 className="text-xl font-bold text-slate-50 mb-2">
          {isConfig ? "Supabase Not Configured" : "Error Loading Data"}
        </h3>
        <p className="text-slate-400 max-w-sm text-sm mb-4">{error}</p>
        {isConfig && (
          <p className="text-slate-400 max-w-sm text-xs">
            Add <code className="text-primary bg-surface px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code className="text-primary bg-surface px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
            <code className="text-primary bg-surface px-1 py-0.5 rounded">SUPABASE_SERVICE_KEY</code> to your{" "}
            environment variables to enable accuracy tracking.
          </p>
        )}
        <button
          onClick={loadAll}
          className="mt-4 px-4 py-2 rounded-lg bg-cyan-500/10 text-primary border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const s = data?.summary;

  // ── Main dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <FlaskConical size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Accuracy Testing</h1>
            <p className="text-slate-400 text-sm">
              Daily cron analyses test stocks and tracks 30-day prediction accuracy
            </p>
          </div>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-slate-400 hover:text-slate-50 hover:bg-slate-800 transition-colors text-sm"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Status notice */}
      <div className="bg-primary/5 border border-cyan-500/20 rounded-xl p-4 text-sm text-slate-400">
        <span className="text-primary font-medium">How it works: </span>
        A Vercel cron job runs hourly on weekdays, analyzing one test stock per run. After 30 days, a
        second cron job fetches the actual price and records whether the prediction was accurate.
        Results accumulate over time — the more predictions, the more meaningful the accuracy stats.
      </div>

      {/* Summary cards */}
      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="Total Predictions"
            value={s.totalPredictions.toString()}
            icon={<BarChart3 size={16} />}
            color="text-primary"
          />
          <StatCard
            label="Evaluated"
            value={s.evaluated.toString()}
            icon={<CheckCircle2 size={16} />}
            color="text-emerald-400"
          />
          <StatCard
            label="Pending (30d)"
            value={s.pending.toString()}
            icon={<Clock size={16} />}
            color="text-slate-400"
          />
          <StatCard
            label="Directional Accuracy"
            value={s.evaluated > 0 ? pct(s.directionalAccuracy) : "—"}
            sublabel="target: > 55%"
            icon={<TrendingUp size={16} />}
            color={s.evaluated > 0 ? scoreColor(s.directionalAccuracy) : "text-slate-400"}
          />
          <StatCard
            label="CI Coverage Rate"
            value={s.evaluated > 0 ? pct(s.ciCoverageRate) : "—"}
            sublabel="target: ~95%"
            icon={<CheckCircle2 size={16} />}
            color={s.evaluated > 0 ? (s.ciCoverageRate >= 0.9 ? "text-emerald-400" : "text-yellow-400") : "text-slate-400"}
          />
          <StatCard
            label="Mean Abs. Error"
            value={s.evaluated > 0 ? `${s.meanAbsoluteErrorPct.toFixed(1)}%` : "—"}
            sublabel="30d price error"
            icon={<AlertCircle size={16} />}
            color={s.evaluated > 0 ? (s.meanAbsoluteErrorPct < 5 ? "text-emerald-400" : s.meanAbsoluteErrorPct < 10 ? "text-yellow-400" : "text-red-400") : "text-slate-400"}
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formula leaderboard */}
        {(data?.byFormula?.length ?? 0) > 0 && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-slate-50 text-sm">Formula Performance</h2>
              <p className="text-slate-400 text-xs mt-0.5">Directional accuracy by Claude-selected formula</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">Formula</th>
                    <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Predictions</th>
                    <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Direction</th>
                    <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs">MAPE</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.byFormula ?? []).map((row) => (
                    <tr key={row.formula} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3 text-slate-50 font-mono text-xs">{row.formula}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{row.count}</td>
                      <td className={`px-4 py-3 text-right font-medium ${scoreColor(row.directionalAccuracy)}`}>
                        {pct(row.directionalAccuracy)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400">
                        {row.mape.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Per-ticker breakdown */}
        {(data?.byTicker?.length ?? 0) > 0 && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-slate-50 text-sm">Per-Ticker Accuracy</h2>
              <p className="text-slate-400 text-xs mt-0.5">How well each stock's predictions perform</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">Ticker</th>
                    <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Predictions</th>
                    <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Direction</th>
                    <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">MAPE</th>
                    <th className="text-right px-5 py-3 text-slate-400 font-medium text-xs">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.byTicker ?? []).map((row) => (
                    <tr key={row.ticker} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3 text-slate-50 font-semibold">{row.ticker}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{row.count}</td>
                      <td className={`px-4 py-3 text-right font-medium ${scoreColor(row.directionalAccuracy)}`}>
                        {pct(row.directionalAccuracy)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {row.mape.toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400">
                        {row.avgQuantScore.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent evaluated results */}
      {(data?.recentResults?.length ?? 0) > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-slate-50 text-sm">Recent Evaluated Predictions</h2>
            <p className="text-slate-400 text-xs mt-0.5">Latest 20 results with actual vs. predicted comparison</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">Ticker</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs">Predicted</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs">Evaluated</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Start</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Predicted</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Actual</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Error</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium text-xs">Direction</th>
                  <th className="text-center px-5 py-3 text-slate-400 font-medium text-xs">In CI</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentResults ?? []).map((r, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-slate-50 font-semibold">{r.ticker}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.predictionDate}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.evaluationDate}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{fmtPrice(r.startPrice)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{fmtPrice(r.predictedPrice)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${r.actualReturn > 0 ? "text-emerald-400" : r.actualReturn < 0 ? "text-red-400" : "text-slate-400"}`}>
                      {fmtPrice(r.actualPrice)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {r.predictionErrorPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.directionCorrect
                        ? <CheckCircle2 size={14} className="text-emerald-400 mx-auto" />
                        : <XCircle size={14} className="text-red-400 mx-auto" />}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {r.inCi95 === null
                        ? <span className="text-slate-400 text-xs">—</span>
                        : r.inCi95
                          ? <CheckCircle2 size={14} className="text-emerald-400 mx-auto" />
                          : <XCircle size={14} className="text-red-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent pending predictions */}
      {(data?.recentPredictions?.length ?? 0) > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-slate-50 text-sm">Recent Predictions</h2>
            <p className="text-slate-400 text-xs mt-0.5">Latest recorded predictions awaiting 30-day evaluation</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">Ticker</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs">Date</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">30d Return</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium text-xs">Direction</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs">Quant Score</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-medium text-xs">Formula</th>
                  <th className="text-center px-5 py-3 text-slate-400 font-medium text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentPredictions ?? []).map((p, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-slate-50 font-semibold">{p.ticker}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{p.prediction_date}</td>
                    <td className={`px-4 py-3 text-right font-medium ${Number(p.predicted_return_30d) > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {Number(p.predicted_return_30d) >= 0 ? "+" : ""}{(Number(p.predicted_return_30d) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.predicted_direction === "UP"
                        ? <TrendingUp size={14} className="text-emerald-400 mx-auto" />
                        : <TrendingDown size={14} className="text-red-400 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">{Number(p.quant_score).toFixed(0)}</td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">{p.formula_used}</td>
                    <td className="px-5 py-3 text-center">
                      {p.is_evaluated
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">Evaluated</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-primary border border-cyan-500/20">Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test stock management */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-slate-50 text-sm">Test Stock List</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Stocks tracked daily by the cron job. Add any valid US ticker.
          </p>
        </div>
        <div className="p-5 space-y-4">
          {/* Add input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={addInput}
              onChange={(e) => setAddInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && !addLoading && addStock()}
              placeholder="Add ticker (e.g. AAPL)"
              className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-slate-50 placeholder:text-slate-400 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              maxLength={10}
            />
            <button
              onClick={addStock}
              disabled={addLoading || !addInput.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 text-primary border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addLoading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>

          {/* Stock chips */}
          {stocks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stocks.map((s) => (
                <div
                  key={s.ticker}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-border text-sm text-slate-50"
                >
                  <span className="font-medium">{s.ticker}</span>
                  <button
                    onClick={() => removeStock(s.ticker)}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-1"
                    aria-label={`Remove ${s.ticker}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No test stocks configured. Add tickers above or run the Supabase SQL schema to seed the default list.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sublabel,
  icon,
  color,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className={`flex items-center gap-1.5 mb-2 ${color}`}>
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sublabel && <p className="text-slate-400 text-xs mt-0.5">{sublabel}</p>}
    </div>
  );
}
