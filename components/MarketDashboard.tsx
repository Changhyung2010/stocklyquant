"use client";
import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Activity, Globe } from "lucide-react";
import { useApp } from "@/lib/context";

interface IndexData {
  ticker: string;
  price: number;
  change: number;
  changePct: number;
}

const INDEX_INFO: Record<string, { name: string; icon: any }> = {
  SPY: { name: "S&P 500", icon: Globe },
  QQQ: { name: "Nasdaq 100", icon: Activity },
  DIA: { name: "Dow Jones", icon: TrendingUp },
  IWM: { name: "Russell 2000", icon: Globe },
  VXX: { name: "Volatility", icon: Activity },
};

export default function MarketDashboard() {
  const { apiKeys, envKeysSet } = useApp();
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const hasKeys = envKeysSet || apiKeys.polygon;

  async function load() {
    if (!hasKeys) return;
    setLoading(true);
    setError("");
    try {
      const keyParam = envKeysSet ? "" : `?key=${encodeURIComponent(apiKeys.polygon)}`;
      const res = await fetch(`/api/market${keyParam}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setIndices(data.indices ?? []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load market data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasKeys) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasKeys]);

  if (!hasKeys) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
          <Globe size={28} className="text-warning" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Market Data Unavailable</h3>
        <p className="text-text-secondary max-w-xs mx-auto text-sm">
          Please configure your Polygon API key in Settings to view real-time market indices.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Global Markets</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mt-1 flex items-center gap-2 opacity-60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Real-time Snapshot {lastUpdated && `• Updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-3 bg-surface-highlight/50 border border-white/5 hover:bg-surface-highlight hover:border-white/10 rounded-2xl text-text-secondary hover:text-white transition-all disabled:opacity-50 shadow-lg"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-danger animate-fade-in">
          <Activity size={18} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {loading && indices.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-panel h-40 rounded-[1.5rem] animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {indices.map((idx) => {
          const isPos = idx.changePct >= 0;
          const info = INDEX_INFO[idx.ticker] ?? { name: idx.ticker, icon: Activity };
          const IconComp = info.icon;
          
          return (
            <div
              key={idx.ticker}
              className="group relative glass-panel rounded-[1.5rem] p-6 hover:bg-surface-highlight/40 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-surface-highlight/50 border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                    <IconComp size={20} className="text-text-secondary group-hover:text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white leading-none tracking-tight">{idx.ticker}</h3>
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-50">{info.name}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <p className="text-3xl font-bold text-white tabular-nums tracking-tighter">
                  ${idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1.5 text-xs font-black mt-1 ${isPos ? "text-success" : "text-danger"}`}>
                  {isPos ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                  <span>
                    {isPos ? "+" : ""}{idx.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none ${isPos ? "bg-success" : "bg-danger"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
