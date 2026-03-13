"use client";
import { Trash2, TrendingUp, Calendar, ArrowRight, Plus } from "lucide-react";
import { useApp } from "@/lib/context";

const SCORE_COLOR = (score?: number) => {
  if (score === undefined) return "text-text-secondary";
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-warning";
  return "text-danger";
};

export default function Watchlist() {
  const { watchlist, removeFromWatchlist, setActiveTab } = useApp();

  function analyze(ticker: string) {
    // Dispatch custom event to switch tab and load ticker
    window.dispatchEvent(new CustomEvent("sq:analyze", { detail: { ticker } }));
  }

  if (watchlist.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-surface-highlight/50 border border-border flex items-center justify-center mb-6 shadow-xl">
          <TrendingUp size={32} className="text-text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Your Watchlist is Empty</h2>
        <p className="text-text-secondary max-w-sm mx-auto mb-8 leading-relaxed">
          Start tracking high-potential stocks by searching for a ticker and clicking the bookmark icon.
        </p>
        <button
          onClick={() => setActiveTab("search")}
          className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-background font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={3} />
          Find Stocks
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-slide-up">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Watchlist</h1>
          <p className="text-text-secondary mt-1">Tracking {watchlist.length} asset{watchlist.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setActiveTab("search")}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {watchlist.map((item) => (
          <div
            key={item.id}
            className="group relative glass-panel rounded-2xl p-5 hover:bg-surface-highlight/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-surface-highlight border border-border flex items-center justify-center font-bold text-lg text-white group-hover:border-primary/30 group-hover:text-primary transition-colors">
                {item.ticker.slice(0, 2)}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.ticker); }}
                className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div onClick={() => analyze(item.ticker)} className="cursor-pointer space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{item.ticker}</h3>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                  <Calendar size={12} />
                  <span>Added {new Date(item.addedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wider mb-0.5">Last Price</p>
                  <p className="text-lg font-bold text-white tabular-nums">
                    {item.lastPrice ? `$${item.lastPrice.toFixed(2)}` : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary uppercase tracking-wider mb-0.5">Quant Score</p>
                  <p className={`text-lg font-black ${SCORE_COLOR(item.lastQuantScore)}`}>
                    {item.lastQuantScore ? item.lastQuantScore.toFixed(0) : "—"}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={20} className="text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
