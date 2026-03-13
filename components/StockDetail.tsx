"use client";
import { useState } from "react";
import { 
  BookmarkPlus, BookmarkCheck, TrendingUp, Activity, DollarSign, 
  BarChart2, AlertCircle, Shield, Calculator, Zap, ArrowUpRight, ArrowDownRight, Brain
} from "lucide-react";
import type { QuantAnalysis } from "@/lib/types";
import { PriceChart, PredictionChart, QuantPredictionChart } from "./Charts";
import AIAnalysis from "./AIAnalysis";
import { useApp } from "@/lib/context";
import { marketCapFormatted } from "@/lib/quantCalculator";

interface Props {
  analysis: QuantAnalysis;
}

const SCORE_CONFIG: Record<string, { gradient: string; text: string; icon: any }> = {
  "Strong Buy": { gradient: "from-emerald-500 to-green-400", text: "text-emerald-400", icon: TrendingUp },
  Buy: { gradient: "from-green-500 to-teal-400", text: "text-green-400", icon: ArrowUpRight },
  Neutral: { gradient: "from-yellow-500 to-amber-400", text: "text-yellow-400", icon: Activity },
  Sell: { gradient: "from-orange-500 to-amber-500", text: "text-orange-400", icon: ArrowDownRight },
  "Strong Sell": { gradient: "from-red-500 to-rose-500", text: "text-red-400", icon: AlertCircle },
};

function MetricCard({ label, value, sub, highlight = false, trend }: { label: string; value: string; sub?: string; highlight?: boolean, trend?: "up" | "down" }) {
  return (
    <div className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
      highlight 
        ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5" 
        : "bg-surface-highlight/20 border-white/5 hover:bg-surface-highlight/40 hover:border-white/10"
    }`}>
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-70 group-hover:opacity-100 transition-opacity">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-xl font-bold tracking-tight tabular-nums ${highlight ? "text-primary" : "text-text-primary"}`}>
          {value}
        </p>
        {trend && (
          <span className={`text-[10px] font-bold ${trend === "up" ? "text-success" : "text-danger"}`}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] font-medium text-text-secondary/50 mt-1 leading-tight">{sub}</p>}
      
      {/* Subtle hover glow */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${highlight ? "bg-primary" : "bg-white"}`} />
    </div>
  );
}

function SectionHeader({ icon: Icon, label, gradient = false, sub }: { icon: React.ElementType; label: string; gradient?: boolean; sub?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${gradient ? "bg-primary/10 ring-1 ring-primary/20" : "bg-surface-highlight border border-white/5"}`}>
          <Icon size={18} className={gradient ? "text-primary" : "text-text-secondary"} />
        </div>
        <div>
          <h3 className={`text-sm font-black uppercase tracking-widest ${gradient ? "bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary" : "text-text-secondary"}`}>
            {label}
          </h3>
          {sub && <p className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-tighter">{sub}</p>}
        </div>
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
  
  if (!analysis) return null;

  const inWatchlist = watchlist?.some((w) => w.ticker === analysis.ticker);
  const config = SCORE_CONFIG[analysis.quantScoreLabel] ?? SCORE_CONFIG["Neutral"];
  const { famaFrench: ff, momentum: mom, volatility: vol, valueMetrics: val, profile } = analysis;
  const change = profile?.changes ?? 0;
  const changePositive = change >= 0;

  function toggleWatchlist() {
    if (inWatchlist) {
      removeFromWatchlist(analysis.ticker);
    } else {
      addToWatchlist(analysis.ticker, analysis.quantScore, profile?.price);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-slide-up">
      {/* ─── Top Header Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticker Info */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{analysis.ticker}</h1>
            {profile?.exchange && (
              <span className="px-2.5 py-1 rounded-md bg-surface-highlight border border-border text-xs font-bold text-text-secondary">
                {profile.exchange}
              </span>
            )}
            <button
              onClick={toggleWatchlist}
              className={`ml-auto lg:ml-4 p-2 rounded-full transition-all ${
                inWatchlist 
                  ? "bg-primary/20 text-primary hover:bg-primary/30" 
                  : "bg-surface-highlight text-text-secondary hover:text-white"
              }`}
            >
              {inWatchlist ? <BookmarkCheck size={20} /> : <BookmarkPlus size={20} />}
            </button>
          </div>
          
          <div className="flex flex-wrap items-baseline gap-4">
            <h2 className="text-xl text-text-secondary font-medium truncate max-w-md">
              {profile?.companyName ?? "Unknown Company"}
            </h2>
            {profile?.sector && (
              <span className="text-sm text-text-secondary/60 font-medium px-2 border-l border-border">
                {profile.sector}
              </span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-4">
            {profile?.price !== undefined && (
              <span className="text-4xl font-bold text-text-primary tabular-nums">
                ${profile.price.toFixed(2)}
              </span>
            )}
            {change !== undefined && (
              <span className={`text-lg font-semibold flex items-center gap-1 ${changePositive ? "text-success" : "text-danger"}`}>
                {changePositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                {Math.abs(change).toFixed(2)} ({profile?.price ? Math.abs((change / (profile.price - change)) * 100).toFixed(2) : 0}%)
              </span>
            )}
          </div>
        </div>

        {/* Quant Score Card */}
        <div className="lg:col-span-4 relative group">
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20 blur-xl rounded-3xl group-hover:opacity-30 transition-opacity`} />
          <div className="relative h-full bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <config.icon size={120} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Quant Confidence</span>
                {analysis.claudeAnalysis && (
                  <span className="text-[10px] font-bold bg-secondary/20 text-secondary px-2 py-0.5 rounded-full border border-secondary/20">
                    AI Adjusted
                  </span>
                )}
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                  {(analysis.quantScore || 0).toFixed(0)}
                </span>
                <span className="text-lg font-bold text-text-secondary mb-1.5">/ 100</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-surface-highlight rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-1000 ease-out`} 
                  style={{ width: `${analysis.quantScore || 0}%` }}
                />
              </div>
              <p className={`text-right font-bold ${config.text} uppercase tracking-widest text-sm`}>
                {analysis.quantScoreLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Charts Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Price Chart */}
        <div className="xl:col-span-8 glass-panel rounded-3xl p-6 min-h-[400px]">
          <SectionHeader icon={BarChart2} label="Price Action (1Y)" sub="Historical Trend" />
          <div className="mt-4">
            <PriceChart data={analysis.priceHistory} />
          </div>
        </div>

        {/* Prediction / Quant Chart */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           {/* Prioritize Quant Path if available, else GBM */}
           {analysis.quantPricePath ? (
             <div className="glass-panel rounded-3xl p-6 flex-1">
               <SectionHeader icon={Zap} label="Quant Projection" gradient sub="Composite Factor Analysis" />
               <QuantPredictionChart path={analysis.quantPricePath} />
             </div>
           ) : analysis.pricePrediction ? (
             <div className="glass-panel rounded-3xl p-6 flex-1">
               <SectionHeader icon={TrendingUp} label="Scenario Forecast" sub="GBM Monte-Carlo" />
               <PredictionChart prediction={analysis.pricePrediction} />
             </div>
           ) : null}
        </div>
      </div>

      {/* ─── Tabs & Details ───────────────────────────────────────────────── */}
      <div className="flex gap-4 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("quant")}
          className={`px-4 py-2 text-sm font-bold transition-colors relative ${
            activeTab === "quant" ? "text-primary" : "text-text-secondary hover:text-white"
          }`}
        >
          Quantitative Data
          {activeTab === "quant" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
        </button>
        {analysis.claudeAnalysis && (
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 text-sm font-bold transition-colors relative flex items-center gap-2 ${
              activeTab === "ai" ? "text-secondary" : "text-text-secondary hover:text-white"
            }`}
          >
            <Brain size={14} /> AI Analysis
            {activeTab === "ai" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
          </button>
        )}
      </div>

      {activeTab === "ai" && analysis.claudeAnalysis && (
        <div className="animate-fade-in">
          <AIAnalysis analysis={analysis.claudeAnalysis} />
        </div>
      )}

      {activeTab === "quant" && (
        <div className="space-y-6 animate-fade-in">
          {/* Fama-French & Value Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Factor Exposure */}
            {ff && (
              <div className="glass-panel rounded-3xl p-6">
                <SectionHeader icon={BarChart2} label="Factor Exposure" sub="Fama-French 5-Factor Model" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricCard label="Market β" value={fmt(ff.betas.marketBeta, 2)} sub="Systematic Risk" highlight trend={ff.betas.marketBeta > 1.2 ? "up" : ff.betas.marketBeta < 0.8 ? "down" : undefined} />
                  <MetricCard label="Size (SMB)" value={fmt(ff.betas.smbBeta, 2)} sub="Small Cap Tilt" />
                  <MetricCard label="Value (HML)" value={fmt(ff.betas.hmlBeta, 2)} sub="Value Premium" />
                  <MetricCard label="Profit (RMW)" value={fmt(ff.rmwBeta, 2)} sub="Quality Factor" />
                  <MetricCard label="Inv (CMA)" value={fmt(ff.cmaBeta, 2)} sub="Investment Factor" />
                  <MetricCard label="Alpha (α)" value={`${(ff.betas.alpha * 100).toFixed(2)}%`} sub="Excess Return" highlight trend={ff.betas.alpha > 0 ? "up" : "down"} />
                </div>
              </div>
            )}

            {/* Fundamentals */}
            {val && (
              <div className="glass-panel rounded-3xl p-6">
                <SectionHeader icon={DollarSign} label="Fundamentals" sub="Valuation & Quality Metrics" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MetricCard label="P/E Ratio" value={fmt(val.peRatio, 1)} sub="Earnings Multiple" />
                  <MetricCard label="P/B Ratio" value={fmt(val.pbRatio, 2)} sub="Book Multiple" />
                  <MetricCard label="ROE" value={pct(val.roe)} sub="Return on Equity" highlight trend={val.roe && val.roe > 0.15 ? "up" : undefined} />
                  <MetricCard label="Debt/Eq" value={fmt(val.debtToEquity, 2)} sub="Leverage Ratio" />
                  <MetricCard label="Div Yield" value={pct(val.dividendYield)} sub="Annual Yield" />
                  <MetricCard label="Signal" value={val.valueSignal} sub="Investment Style" />
                </div>
              </div>
            )}
          </div>

          {/* Risk & Momentum Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Metrics */}
            <div className="glass-panel rounded-3xl p-6">
              <SectionHeader icon={Shield} label="Risk Analysis" sub="Volatility & Tail Risk" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {vol && <MetricCard label="Sharpe" value={fmt(vol.sharpeRatio)} sub="Risk-Adj. Return" highlight trend={vol.sharpeRatio > 1 ? "up" : undefined} />}
                 {analysis.riskMetrics && (
                   <>
                     <MetricCard label="VaR (95%)" value={pct(analysis.riskMetrics.var95)} sub="Max Daily Loss" />
                     <MetricCard label="CVaR (95%)" value={pct(analysis.riskMetrics.cvar95)} sub="Expected Tail Loss" />
                     <MetricCard label="GARCH Vol" value={pct(analysis.riskMetrics.garchVol)} sub="Dynamic Vol" />
                   </>
                 )}
                 {vol && <MetricCard label="Ann. Vol" value={pct(vol.annualizedVolatility)} sub="Yearly Sigma" />}
                 {vol && <MetricCard label="Risk Level" value={vol.riskLevel} sub="Categorization" />}
              </div>
            </div>

            {/* Momentum & Sizing */}
            <div className="glass-panel rounded-3xl p-6">
              <SectionHeader icon={Activity} label="Momentum & Sizing" sub="Trend Analysis & Allocation" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mom && (
                  <>
                     <MetricCard label="12M Mom" value={pct(mom.momentum12M - 1)} sub="Yearly Trend" highlight trend={mom.momentum12M > 1 ? "up" : "down"} />
                     <MetricCard label="3M Mom" value={pct(mom.momentum3M - 1)} sub="Quarterly Trend" trend={mom.momentum3M > 1 ? "up" : "down"} />
                     <MetricCard label="Signal" value={mom.signal} sub="Trend Status" />
                  </>
                )}
                {analysis.kelly && (
                  <>
                     <MetricCard label="Kelly (Half)" value={`${(analysis.kelly.halfKelly * 100).toFixed(1)}%`} sub="Optimized Stake" highlight />
                     <MetricCard label="Kelly (Full)" value={`${(analysis.kelly.fullKelly * 100).toFixed(1)}%`} sub="Max Theoretical" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center pt-8 pb-4 opacity-50">
         <p className="text-[10px] uppercase tracking-widest text-text-secondary">
           Analyzed {new Date(analysis.analyzedAt).toLocaleString()} · Data via Polygon.io & FMP
         </p>
      </div>
    </div>
  );
}
