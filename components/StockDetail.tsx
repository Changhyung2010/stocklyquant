"use client";
import { useState } from "react";
import {
  BookmarkPlus, BookmarkCheck, TrendingUp, Activity, DollarSign,
  BarChart2, AlertCircle, Shield, Zap, ArrowUpRight, ArrowDownRight, Brain,
} from "lucide-react";
import type { QuantAnalysis } from "@/lib/types";
import { PriceChart, PredictionChart, QuantPredictionChart } from "./Charts";
import AIAnalysis from "./AIAnalysis";
import { useApp } from "@/lib/context";
import { marketCapFormatted } from "@/lib/quantCalculator";

interface Props { analysis: QuantAnalysis; }

const SCORE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  "Strong Buy":  { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Strong Buy"  },
  "Buy":         { color: "text-green-400",   bg: "bg-green-500/10 border-green-500/20",     label: "Buy"         },
  "Neutral":     { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     label: "Neutral"     },
  "Sell":        { color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",   label: "Sell"        },
  "Strong Sell": { color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",       label: "Strong Sell" },
};

function MetricCard({ label, value, sub, highlight = false, trend }: {
  label: string; value: string; sub?: string; highlight?: boolean; trend?: "up" | "down";
}) {
  return (
    <div className={`p-4 rounded-lg border ${
      highlight ? "bg-cyan-500/5 border-cyan-500/20" : "bg-slate-900 border-slate-800"
    }`}>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className={`text-lg font-bold tabular-nums ${highlight ? "text-cyan-400" : "text-slate-100"}`}>
          {value}
        </p>
        {trend && (
          <span className={`text-xs font-bold ${trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] text-slate-500 mt-1 leading-tight">{sub}</p>}
    </div>
  );
}

function SectionTitle({ icon: Icon, label, sub }: {
  icon: React.ElementType; label: string; sub?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700">
        <Icon size={15} className="text-slate-400" />
      </div>
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{label}</h3>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function fmt(v: number | undefined, decimals = 2, suffix = "") {
  if (v === undefined || v === null || isNaN(v)) return "N/A";
  return `${v.toFixed(decimals)}${suffix}`;
}
function pct(v: number | undefined, decimals = 1) {
  if (v === undefined || v === null || isNaN(v)) return "N/A";
  return `${(v * 100).toFixed(decimals)}%`;
}

export default function StockDetail({ analysis }: Props) {
  const { addToWatchlist, removeFromWatchlist, watchlist } = useApp();
  const [activeTab, setActiveTab] = useState<"quant" | "ai">("quant");
  const [showAiScore, setShowAiScore] = useState(true);

  if (!analysis) return null;

  const inWatchlist = watchlist?.some((w) => w.ticker === analysis.ticker);
  const hasAiScore = !!analysis.claudeAnalysis?.aiAdjustedScore;
  const currentScore = (hasAiScore && showAiScore) ? analysis.claudeAnalysis!.aiAdjustedScore : analysis.quantScore;

  const config = SCORE_CONFIG[analysis.quantScoreLabel] ?? SCORE_CONFIG["Neutral"];
  const { famaFrench: ff, momentum: mom, volatility: vol, valueMetrics: val, profile } = analysis;
  const change = profile?.changes ?? 0;
  const changePositive = change >= 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Ticker + Price */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black text-slate-50 tracking-tight">{analysis.ticker}</h1>
                {profile?.exchange && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded uppercase tracking-wider">
                    {profile.exchange}
                  </span>
                )}
              </div>
              <p className="text-slate-400 font-medium">{profile?.companyName ?? "Unknown Company"}</p>
              {profile?.sector && (
                <p className="text-xs text-cyan-400 font-medium mt-1">{profile.sector}</p>
              )}
            </div>
            <button
              onClick={() => inWatchlist ? removeFromWatchlist(analysis.ticker) : addToWatchlist(analysis.ticker, analysis.quantScore, profile?.price)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                inWatchlist
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-50 hover:border-slate-600"
              }`}
            >
              {inWatchlist ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
              <span className="hidden sm:inline">{inWatchlist ? "Saved" : "Save"}</span>
            </button>
          </div>

          {/* Price Row */}
          <div className="flex items-end gap-6">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Current Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-50 tabular-nums">
                  ${profile?.price?.toFixed(2) ?? "—"}
                </span>
                <span className={`flex items-center gap-0.5 text-base font-bold ${changePositive ? "text-emerald-400" : "text-rose-400"}`}>
                  {changePositive ? <ArrowUpRight size={18} strokeWidth={2.5} /> : <ArrowDownRight size={18} strokeWidth={2.5} />}
                  {(() => {
                    const prev = (profile?.price ?? 0) - change;
                    return prev !== 0 ? Math.abs((change / prev) * 100).toFixed(2) : "0.00";
                  })()}%
                </span>
              </div>
            </div>

            {profile?.mktCap && (
              <div className="pb-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Market Cap</p>
                <p className="text-xl font-bold text-slate-200">{marketCapFormatted(profile.mktCap)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Score Card */}
        <div className={`lg:w-64 rounded-xl border p-5 ${config.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quant Score</span>
            </div>
            {hasAiScore && (
              <div className="flex bg-slate-900/80 rounded-md border border-slate-700 p-0.5">
                <button
                  onClick={() => setShowAiScore(false)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${!showAiScore ? "bg-slate-700 text-slate-50" : "text-slate-500 hover:text-slate-300"}`}
                >BASE</button>
                <button
                  onClick={() => setShowAiScore(true)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${showAiScore ? "bg-violet-500/20 text-violet-400" : "text-slate-500 hover:text-slate-300"}`}
                >AI</button>
              </div>
            )}
          </div>

          <div className="flex items-end gap-1 mb-3">
            <span className={`text-6xl font-black tabular-nums ${config.color}`}>
              {currentScore.toFixed(0)}
            </span>
            <span className="text-slate-500 text-lg mb-2">/100</span>
          </div>

          <div className="w-full bg-slate-800/50 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                analysis.quantScoreLabel === "Strong Buy"  ? "bg-emerald-500" :
                analysis.quantScoreLabel === "Buy"         ? "bg-green-500"   :
                analysis.quantScoreLabel === "Neutral"     ? "bg-amber-500"   :
                analysis.quantScoreLabel === "Sell"        ? "bg-orange-500"  : "bg-rose-500"
              }`}
              style={{ width: `${currentScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold uppercase tracking-wider ${config.color}`}>
              {analysis.quantScoreLabel}
            </span>
            {hasAiScore && (
              <span className={`text-xs font-bold ${
                analysis.claudeAnalysis!.aiAdjustedScore >= analysis.quantScore ? "text-emerald-400" : "text-rose-400"
              }`}>
                {analysis.claudeAnalysis!.aiAdjustedScore >= analysis.quantScore ? "+" : ""}
                {(analysis.claudeAnalysis!.aiAdjustedScore - analysis.quantScore).toFixed(0)} AI adj
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <SectionTitle icon={BarChart2} label="Price Action" sub="12-Month History" />
          <PriceChart data={analysis.priceHistory} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          {analysis.quantPricePath ? (
            <>
              <SectionTitle icon={Zap} label="Quant Projection" sub="Composite Factor Analysis" />
              <QuantPredictionChart path={analysis.quantPricePath} />
            </>
          ) : analysis.pricePrediction ? (
            <>
              <SectionTitle icon={TrendingUp} label="Scenario Forecast" sub="GBM Monte-Carlo" />
              <PredictionChart prediction={analysis.pricePrediction} />
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No forecast available</div>
          )}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("quant")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors relative ${
            activeTab === "quant" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Quantitative Data
          {activeTab === "quant" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
        </button>
        {analysis.claudeAnalysis && (
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors relative ${
              activeTab === "ai" ? "text-violet-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Brain size={13} /> AI Research
            {activeTab === "ai" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
          </button>
        )}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      {activeTab === "ai" && analysis.claudeAnalysis && (
        <AIAnalysis analysis={analysis.claudeAnalysis} />
      )}

      {activeTab === "quant" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {ff && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <SectionTitle icon={BarChart2} label="Factor Exposure" sub="Fama-French 5-Factor Model" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricCard label="Market β"    value={fmt(ff.betas.marketBeta)}  sub="Systematic Risk"   highlight trend={ff.betas.marketBeta > 1.2 ? "up" : ff.betas.marketBeta < 0.8 ? "down" : undefined} />
                  <MetricCard label="Size (SMB)"  value={fmt(ff.betas.smbBeta)}     sub="Small Cap Tilt" />
                  <MetricCard label="Value (HML)" value={fmt(ff.betas.hmlBeta)}     sub="Value Premium" />
                  <MetricCard label="Profit (RMW)"value={fmt(ff.rmwBeta)}           sub="Quality Factor" />
                  <MetricCard label="Inv (CMA)"   value={fmt(ff.cmaBeta)}           sub="Investment Factor" />
                  <MetricCard label="Alpha (α)"   value={`${(ff.betas.alpha * 100).toFixed(2)}%`} sub="Excess Return" highlight trend={ff.betas.alpha > 0 ? "up" : "down"} />
                </div>
              </div>
            )}
            {val && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <SectionTitle icon={DollarSign} label="Fundamentals" sub="Valuation & Quality Metrics" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricCard label="P/E Ratio"  value={fmt(val.peRatio, 1)}          sub="Earnings Multiple" />
                  <MetricCard label="P/B Ratio"  value={fmt(val.pbRatio, 2)}          sub="Book Multiple" />
                  <MetricCard label="ROE"        value={pct(val.roe)}                  sub="Return on Equity" highlight trend={val.roe && val.roe > 0.15 ? "up" : undefined} />
                  <MetricCard label="Debt/Eq"    value={fmt(val.debtToEquity, 2)}      sub="Leverage Ratio" />
                  <MetricCard label="Div Yield"  value={pct(val.dividendYield)}        sub="Annual Yield" />
                  <MetricCard label="Signal"     value={val.valueSignal}               sub="Investment Style" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <SectionTitle icon={Shield} label="Risk Analysis" sub="Volatility & Tail Risk" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vol && <MetricCard label="Sharpe"    value={fmt(vol.sharpeRatio)}              sub="Risk-Adj. Return" highlight trend={vol.sharpeRatio > 1 ? "up" : undefined} />}
                {analysis.riskMetrics && <>
                  <MetricCard label="VaR (95%)"  value={pct(analysis.riskMetrics.var95)}   sub="Max Daily Loss" />
                  <MetricCard label="CVaR (95%)" value={pct(analysis.riskMetrics.cvar95)}  sub="Expected Tail Loss" />
                  <MetricCard label="GARCH Vol"  value={pct(analysis.riskMetrics.garchVol)} sub="Dynamic Vol" />
                </>}
                {vol && <MetricCard label="Ann. Vol"  value={pct(vol.annualizedVolatility)} sub="Yearly Sigma" />}
                {vol && <MetricCard label="Risk Level" value={vol.riskLevel}                sub="Categorization" />}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <SectionTitle icon={Activity} label="Momentum & Sizing" sub="Trend Analysis & Allocation" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mom && <>
                  <MetricCard label="12M Mom"  value={pct(mom.momentum12M - 1)} sub="Yearly Trend"    highlight trend={mom.momentum12M > 1 ? "up" : "down"} />
                  <MetricCard label="3M Mom"   value={pct(mom.momentum3M - 1)}  sub="Quarterly Trend" trend={mom.momentum3M > 1 ? "up" : "down"} />
                  <MetricCard label="Signal"   value={mom.signal}               sub="Trend Status" />
                </>}
                {analysis.kelly && <>
                  <MetricCard label="Kelly ½"  value={`${(analysis.kelly.halfKelly * 100).toFixed(1)}%`} sub="Optimized Stake" highlight />
                  <MetricCard label="Kelly F"  value={`${(analysis.kelly.fullKelly * 100).toFixed(1)}%`} sub="Max Theoretical" />
                </>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center pt-6 pb-4 border-t border-slate-800/50">
        <p className="text-[10px] uppercase font-medium tracking-widest text-slate-600">
          Analyzed {new Date(analysis.analyzedAt).toLocaleString()} · Engine v2.1
        </p>
      </div>
    </div>
  );
}
