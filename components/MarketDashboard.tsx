"use client";
import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useApp } from "@/lib/context";

interface IndexData {
  ticker: string;
  price: number;
  change: number;
  changePct: number;
}

const INDEX_NAMES: Record<string, string> = {
  SPY: "S&P 500 ETF",
  QQQ: "Nasdaq 100 ETF",
  DIA: "Dow Jones ETF",
  IWM: "Russell 2000 ETF",
  VXX: "Volatility ETF",
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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white">Market Overview</h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading || !hasKeys}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!hasKeys && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 text-sm text-yellow-300">
          Add your Polygon API key in Settings to view market data.
        </div>
      )}

      {loading && indices.length === 0 && (
        <div className="grid grid-cols-1 gap-3">
          {["SPY", "QQQ", "DIA", "IWM", "VXX"].map((t) => (
            <div key={t} className="bg-gray-800/60 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-6 bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {indices.map((idx) => {
          const pos = idx.changePct >= 0;
          return (
            <div
              key={idx.ticker}
              className="bg-gray-800/60 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-white text-sm">{idx.ticker}</p>
                <p className="text-xs text-gray-400 mt-0.5">{INDEX_NAMES[idx.ticker] ?? idx.ticker}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${idx.price.toFixed(2)}</p>
                <div className={`flex items-center justify-end gap-1 text-sm font-medium ${pos ? "text-emerald-400" : "text-red-400"}`}>
                  {pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {pos ? "+" : ""}{idx.change.toFixed(2)} ({pos ? "+" : ""}{idx.changePct.toFixed(2)}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
