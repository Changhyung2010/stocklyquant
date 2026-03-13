"use client";
import type { ClaudeAnalysis } from "@/lib/types";
import { Brain, TrendingUp, AlertTriangle, Info } from "lucide-react";

interface Props {
  analysis: ClaudeAnalysis;
}

const RATING_COLORS: Record<string, string> = {
  strong_buy: "text-emerald-400",
  buy: "text-green-400",
  neutral: "text-yellow-400",
  sell: "text-orange-400",
  strong_sell: "text-red-400",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-green-900/50 text-green-300 border-green-700",
  medium: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  low: "bg-red-900/50 text-red-300 border-red-700",
};

function FactorBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AIAnalysis({ analysis }: Props) {
  const ratingDisplay = analysis.prediction.rating
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const ratingColor = RATING_COLORS[analysis.prediction.rating] ?? "text-gray-300";
  const confClass = CONFIDENCE_COLORS[analysis.prediction.confidence] ?? "";
  const returnPct = analysis.prediction.expectedAnnualReturnPct;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-purple-400" />
          <span className="text-sm font-semibold text-purple-300">Claude AI Analysis</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">AI Rating</p>
            <p className={`text-lg font-bold ${ratingColor}`}>{ratingDisplay}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Expected Return</p>
            <p className={`text-lg font-bold ${returnPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {returnPct >= 0 ? "+" : ""}{returnPct.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">AI Score</p>
            <p className="text-lg font-bold text-white">{analysis.adjustedQuantScore.toFixed(0)}</p>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <span className={`text-xs border rounded-full px-2 py-0.5 ${confClass}`}>
            {analysis.prediction.confidence} confidence
          </span>
          <span className="text-xs border border-gray-600 rounded-full px-2 py-0.5 text-gray-400">
            {analysis.prediction.investmentHorizon}-term horizon
          </span>
        </div>
      </div>

      {/* Factor Importance */}
      <div className="bg-gray-800/60 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-200 mb-4">Factor Importance</h4>
        <div className="space-y-3">
          <FactorBar label="Market (β₁)" value={analysis.factorImportance.market} />
          <FactorBar label="Size SMB (β₂)" value={analysis.factorImportance.smb} />
          <FactorBar label="Value HML (β₃)" value={analysis.factorImportance.hml} />
          <FactorBar label="Profitability RMW" value={analysis.factorImportance.rmw} />
          <FactorBar label="Investment CMA" value={analysis.factorImportance.cma} />
        </div>
      </div>

      {/* Score Weights */}
      <div className="bg-gray-800/60 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-200 mb-4">AI-Optimized Score Weights</h4>
        <div className="space-y-3">
          <FactorBar label="Momentum" value={analysis.scoreWeights.momentum} />
          <FactorBar label="Value" value={analysis.scoreWeights.value} />
          <FactorBar label="Quality" value={analysis.scoreWeights.quality} />
          <FactorBar label="Size" value={analysis.scoreWeights.size} />
          <FactorBar label="Volatility" value={analysis.scoreWeights.volatility} />
        </div>
      </div>

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div className="bg-gray-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-gray-200">Key Insights</h4>
          </div>
          <ul className="space-y-2">
            {analysis.insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {analysis.keyRisks.length > 0 && (
        <div className="bg-gray-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-orange-400" />
            <h4 className="text-sm font-semibold text-gray-200">Key Risks</h4>
          </div>
          <ul className="space-y-2">
            {analysis.keyRisks.map((risk, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-orange-400 mt-0.5 shrink-0">▲</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formula note */}
      {analysis.formulaNote && (
        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <div className="flex gap-2 items-start">
            <Info size={14} className="text-gray-500 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400">{analysis.formulaNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
