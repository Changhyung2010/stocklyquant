"use client";
import type { ClaudeAnalysis } from "@/lib/types";
import { Brain, BarChart2, Scale, Info, Zap } from "lucide-react";

interface Props { analysis: ClaudeAnalysis; }

const FORMULA_STYLES: Record<string, string> = {
  CAPM:           "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FF3:            "bg-teal-500/10 text-teal-400 border-teal-500/20",
  FF5:            "bg-purple-500/10 text-purple-400 border-purple-500/20",
  APT:            "bg-orange-500/10 text-orange-400 border-orange-500/20",
  SVJ:            "bg-red-500/10 text-red-400 border-red-500/20",
  "Factor-Kelly": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "GARCH-BS":     "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Tail-CVaR":    "bg-rose-500/10 text-rose-400 border-rose-500/20",
};
const RISK_STYLES: Record<string, string> = {
  CVaR:   "bg-red-500/10 text-red-400 border-red-500/20",
  VaR:    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Sharpe: "bg-green-500/10 text-green-400 border-green-500/20",
  GARCH:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

function WeightBar({ label, value, color = "bg-cyan-500" }: { label: string; value: number; color?: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-slate-300 font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AIAnalysis({ analysis }: Props) {
  const formulaClass = FORMULA_STYLES[analysis.selectedFormula] ?? "bg-slate-800 text-slate-400 border-slate-700";
  const riskClass    = RISK_STYLES[analysis.riskMetric]         ?? "bg-slate-800 text-slate-400 border-slate-700";

  const scoreWeights = analysis.scoreWeights || { momentum: 0, value: 0, quality: 0, size: 0, volatility: 0 };
  const ffFactorEmphasis = analysis.ffFactorEmphasis || { market: 0, smb: 0, hml: 0, rmw: 0, cma: 0 };

  return (
    <div className="space-y-5">
      {/* Research Summary */}
      {analysis.researchSummary && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-md bg-violet-500/10 border border-violet-500/20">
              <Brain size={15} className="text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">AI Research Summary</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-violet-500/30 pl-4">
            {analysis.researchSummary}
          </p>
        </div>
      )}

      {/* Model + Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700">
              <Zap size={15} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Model Selection</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-500">Primary Model</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${formulaClass}`}>
                {analysis.selectedFormula}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-500">Risk Metric</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${riskClass}`}>
                {analysis.riskMetric}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <span className="text-xs text-slate-500">AI Score</span>
              <span className="text-base font-black text-violet-400 tabular-nums">
                {(analysis.aiAdjustedScore || 0).toFixed(0)}
              </span>
            </div>
            {analysis.recommendedFormula && (
              <p className="text-xs text-slate-500 italic">"{analysis.recommendedFormula}"</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700">
              <Info size={15} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Strategic Rationale</h3>
          </div>
          {analysis.rationale
            ? <p className="text-slate-400 text-sm leading-relaxed">{analysis.rationale}</p>
            : <p className="text-slate-600 text-sm italic">No rationale provided.</p>
          }
        </div>
      </div>

      {/* Weights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700">
              <Scale size={15} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Score Weights</h3>
          </div>
          <div className="space-y-3">
            <WeightBar label="Momentum"   value={scoreWeights.momentum}   color="bg-blue-500" />
            <WeightBar label="Value"      value={scoreWeights.value}      color="bg-teal-500" />
            <WeightBar label="Quality"    value={scoreWeights.quality}    color="bg-purple-500" />
            <WeightBar label="Size"       value={scoreWeights.size}       color="bg-orange-500" />
            <WeightBar label="Volatility" value={scoreWeights.volatility} color="bg-rose-500" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700">
              <BarChart2 size={15} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Factor Sensitivity</h3>
          </div>
          <div className="space-y-3">
            <WeightBar label="Market (β₁)"            value={ffFactorEmphasis.market} color="bg-blue-500" />
            <WeightBar label="Size SMB (β₂)"          value={ffFactorEmphasis.smb}    color="bg-teal-500" />
            <WeightBar label="Value HML (β₃)"         value={ffFactorEmphasis.hml}    color="bg-yellow-500" />
            <WeightBar label="Profitability RMW (β₄)" value={ffFactorEmphasis.rmw}    color="bg-purple-500" />
            <WeightBar label="Investment CMA (β₅)"    value={ffFactorEmphasis.cma}    color="bg-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
