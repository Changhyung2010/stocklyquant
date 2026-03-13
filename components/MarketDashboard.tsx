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
    <div className="p-6 max-w-7xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Global Markets</h1>
          <p className="text-text-secondary mt-1 flex items-center gap-2">
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
          className="p-2.5 bg-surface-highlight hover:bg-surface-highlight/80 rounded-xl text-text-secondary hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-danger">
          <Activity size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading && indices.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-panel h-32 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {indices.map((idx) => {
          const isPos = idx.changePct >= 0;
          const info = INDEX_INFO[idx.ticker] ?? { name: idx.ticker, icon: Activity };
          const IconComp = info.icon;
          
          return (
            <div
              key={idx.ticker}
              className="group relative glass-panel rounded-2xl p-5 hover:bg-surface-highlight/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-highlight group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <IconComp size={18} className="text-text-secondary group-hover:text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-none">{idx.ticker}</h3>
                    <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider mt-1">{info.name}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <p className="text-2xl font-bold text-white tabular-nums tracking-tight">
                  ${idx.price.toFixed(2)}
                </p>
                <div className={`flex items-center gap-1.5 text-sm font-semibold mt-1 ${isPos ? "text-success" : "text-danger"}`}>
                  {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>
                    {isPos ? "+" : ""}{idx.change.toFixed(2)} ({isPos ? "+" : ""}{idx.changePct.toFixed(2)}%)
                  </span>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none ${isPos ? "bg-success" : "bg-danger"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
