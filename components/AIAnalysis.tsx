"use client";
import type { ClaudeAnalysis } from "@/lib/types";
import { Brain, BarChart2, Scale, Info, Zap } from "lucide-react";

interface Props {
  analysis: ClaudeAnalysis;
}

const FORMULA_STYLES: Record<string, string> = {
  CAPM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FF3:  "bg-teal-500/10 text-teal-400 border-teal-500/20",
  FF5:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  APT:  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  SVJ:  "bg-red-500/10 text-red-400 border-red-500/20",
  "Factor-Kelly": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "GARCH-BS": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Tail-CVaR": "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const RISK_STYLES: Record<string, string> = {
  CVaR:   "bg-red-500/10 text-red-400 border-red-500/20",
  VaR:    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Sharpe: "bg-green-500/10 text-green-400 border-green-500/20",
  GARCH:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

function WeightBar({ label, value, color = "bg-primary" }: { label: string; value: number; color?: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1.5">
        <span className="text-text-secondary">{label}</span>
        <span className="text-white">{pct}%</span>
      </div>
      <div className="h-2 bg-surface-highlight rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}

export default function AIAnalysis({ analysis }: Props) {
  const formulaClass = FORMULA_STYLES[analysis.selectedFormula] ?? "bg-surface-highlight text-text-secondary border-border";
  const riskClass    = RISK_STYLES[analysis.riskMetric]         ?? "bg-surface-highlight text-text-secondary border-border";

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Research Summary */}
      {analysis.researchSummary && (
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
            <Brain size={120} />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Brain size={20} className="text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-white">Analysis Summary</h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm md:text-base border-l-2 border-secondary/30 pl-4">
            {analysis.researchSummary}
          </p>
        </div>
      )}

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formula Selection */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-surface/60 to-surface-highlight/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Zap size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white">Model Selection</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
              <span className="text-sm text-text-secondary">Primary Model</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${formulaClass}`}>
                {analysis.selectedFormula}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
              <span className="text-sm text-text-secondary">Risk Metric</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${riskClass}`}>
                {analysis.riskMetric}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
              <span className="text-sm text-text-secondary">AI-Adjusted Score</span>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {analysis.aiAdjustedScore.toFixed(0)}
              </span>
            </div>
            
            <p className="text-xs text-text-secondary/60 mt-2 font-medium italic">
              "{analysis.recommendedFormula}"
            </p>
          </div>
        </div>

        {/* Rationale */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-warning/10 rounded-xl">
              <Info size={20} className="text-warning" />
            </div>
            <h3 className="text-lg font-bold text-white">Strategic Rationale</h3>
          </div>
          {analysis.rationale ? (
             <p className="text-text-secondary text-sm leading-relaxed flex-1">
               {analysis.rationale}
             </p>
          ) : (
            <p className="text-text-secondary/50 text-sm italic">No detailed rationale provided.</p>
          )}
        </div>
      </div>

      {/* Weights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Weights */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Scale size={20} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Optimized Weights</h3>
          </div>
          <div className="space-y-4">
            <WeightBar label="Momentum"   value={analysis.scoreWeights.momentum}   color="bg-blue-500" />
            <WeightBar label="Value"      value={analysis.scoreWeights.value}      color="bg-teal-500" />
            <WeightBar label="Quality"    value={analysis.scoreWeights.quality}    color="bg-purple-500" />
            <WeightBar label="Size"       value={analysis.scoreWeights.size}       color="bg-orange-500" />
            <WeightBar label="Volatility" value={analysis.scoreWeights.volatility} color="bg-rose-500" />
          </div>
        </div>

        {/* Factor Emphasis */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <BarChart2 size={20} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Factor Beta Sensitivity</h3>
          </div>
          <div className="space-y-4">
            <WeightBar label="Market (β₁)"          value={analysis.ffFactorEmphasis.market} color="bg-blue-500" />
            <WeightBar label="Size SMB (β₂)"        value={analysis.ffFactorEmphasis.smb}    color="bg-teal-500" />
            <WeightBar label="Value HML (β₃)"       value={analysis.ffFactorEmphasis.hml}    color="bg-yellow-500" />
            <WeightBar label="Profitability RMW (β₄)" value={analysis.ffFactorEmphasis.rmw} color="bg-purple-500" />
            <WeightBar label="Investment CMA (β₅)"  value={analysis.ffFactorEmphasis.cma}   color="bg-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
