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
          className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={3} />
          Find Stocks
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Watchlist</h1>
          <p className="text-text-secondary text-sm font-medium mt-1 uppercase tracking-widest opacity-80">
            Tracking {watchlist.length} asset{watchlist.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setActiveTab("search")}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all"
        >
          <Plus size={14} strokeWidth={3} /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {watchlist.map((item) => (
          <div
            key={item.id}
            className="group relative glass-panel rounded-[1.5rem] p-6 hover:bg-surface-highlight/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:translate-y-[-4px]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-surface-highlight/50 border border-white/5 flex items-center justify-center font-black text-lg text-white group-hover:border-primary/30 group-hover:text-primary transition-colors shadow-inner">
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

            <div onClick={() => analyze(item.ticker)} className="cursor-pointer">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors tracking-tighter">{item.ticker}</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60 mt-1">
                  <Calendar size={10} />
                  <span>Added {new Date(item.addedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1 opacity-70">Last Price</p>
                  <p className="text-xl font-bold text-text-primary tracking-tight tabular-nums">
                    {item.lastPrice ? `$${item.lastPrice.toFixed(2)}` : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1 opacity-70">Quant Score</p>
                  <p className={`text-xl font-black ${SCORE_COLOR(item.lastQuantScore)} tracking-tighter`}>
                    {item.lastQuantScore ? item.lastQuantScore.toFixed(0) : "—"}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowRight size={16} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
