"use client";
import { Trash2, TrendingUp, Clock } from "lucide-react";
import { useApp } from "@/lib/context";

const SCORE_COLOR = (score?: number) => {
  if (score === undefined) return "text-gray-400";
  if (score >= 65) return "text-emerald-400";
  if (score >= 45) return "text-yellow-400";
  return "text-red-400";
};

export default function Watchlist() {
  const { watchlist, removeFromWatchlist, setActiveTab, setCurrentAnalysis, apiKeys, envKeysSet } = useApp();

  async function analyzeFromWatchlist(ticker: string) {
    setActiveTab("search");
    // Trigger analysis by navigating to search tab - the main page handles the rest
    // We fire a custom event to pre-fill and trigger search
    window.dispatchEvent(new CustomEvent("sq:analyze", { detail: { ticker } }));
  }

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
          <TrendingUp size={24} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Your Watchlist is Empty</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          Search for a stock and click "Add to Watchlist" to track it here.
        </p>
        <button
          onClick={() => setActiveTab("search")}
          className="mt-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Search Stocks
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white">Watchlist</h2>
        <span className="text-xs text-gray-500">{watchlist.length} stock{watchlist.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-3">
        {watchlist.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800/60 rounded-xl p-4 flex items-center justify-between group"
          >
            <button
              onClick={() => analyzeFromWatchlist(item.ticker)}
              className="flex-1 flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center font-bold text-sm text-white shrink-0">
                {item.ticker.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{item.ticker}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={11} className="text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {new Date(item.addedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {item.lastPrice !== undefined && (
                  <p className="text-white text-sm font-medium">${item.lastPrice.toFixed(2)}</p>
                )}
                {item.lastQuantScore !== undefined && (
                  <p className={`text-xs font-semibold ${SCORE_COLOR(item.lastQuantScore)}`}>
                    Score: {item.lastQuantScore.toFixed(0)}
                  </p>
                )}
              </div>
            </button>
            <button
              onClick={() => removeFromWatchlist(item.ticker)}
              className="ml-3 p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove from watchlist"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
