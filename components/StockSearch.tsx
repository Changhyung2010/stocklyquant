"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, AlertCircle, X, ArrowRight, Zap } from "lucide-react";
import type { StockSearchResult, QuantAnalysis, ProgressEvent } from "@/lib/types";
import { useApp } from "@/lib/context";
import StockDetail from "./StockDetail";

interface SearchInputProps {
  large?: boolean;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  suggestions: StockSearchResult[];
  setSuggestions: React.Dispatch<React.SetStateAction<StockSearchResult[]>>;
  loadingSuggestions: boolean;
  hasKeys: boolean | string;
  analyzing: boolean;
  analyze: (ticker: string) => void;
  setCurrentAnalysis: (a: QuantAnalysis | null) => void;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

function SearchInput({
  large = false,
  wrapperRef,
  query,
  setQuery,
  suggestions,
  setSuggestions,
  loadingSuggestions,
  hasKeys,
  analyzing,
  analyze,
  setCurrentAnalysis,
  setError,
}: SearchInputProps) {
  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-20">
      <div className={`relative flex items-center transition-all duration-300 ${large ? "scale-100" : "scale-95"}`}>
        <Search
          className={`absolute left-4 text-text-secondary pointer-events-none transition-colors ${
            large ? "w-6 h-6" : "w-5 h-5"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && analyze(query.trim())}
          placeholder="Search ticker (e.g., AAPL, NVDA)..."
          className={`w-full bg-surface-highlight/40 backdrop-blur-xl text-text-primary rounded-2xl border border-white/10 focus:border-primary/50 focus:bg-surface-highlight/60 focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-text-secondary/50 ${
            large ? "pl-14 pr-12 py-5 text-lg shadow-2xl shadow-black/50" : "pl-12 pr-10 py-3 text-sm shadow-lg"
          }`}
          disabled={!hasKeys || analyzing}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); setCurrentAnalysis(null); setError(""); }}
            className="absolute right-4 text-text-secondary hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl z-50 animate-fade-in">
          {loadingSuggestions ? (
            <div className="p-4 flex justify-center">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : (
            suggestions.slice(0, 6).map((s) => (
              <button
                key={s.ticker}
                onClick={() => analyze(s.ticker)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors text-left border-b border-border/50 last:border-0 group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-12 font-bold text-white bg-surface-highlight/50 px-2 py-1 rounded-md text-center text-sm group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    {s.ticker}
                  </span>
                  <span className="text-text-secondary text-sm truncate max-w-[200px]">{s.name}</span>
                </div>
                <span className="text-xs text-text-secondary/50 uppercase font-medium tracking-wider bg-surface-highlight/30 px-2 py-0.5 rounded">
                  {s.exchange}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const STAGES = [
  "Fetching Stock Data...",
  "Claude Researching...",
  "Selecting Best Formula...",
  "Calculating...",
  "Generating Report...",
];

export default function StockSearch() {
  const { apiKeys, setCurrentAnalysis, currentAnalysis, setActiveTab, envKeysSet } = useApp();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Fetching Stock Data...");
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Listen for watchlist → analyze events
  useEffect(() => {
    function handler(e: Event) {
      const { ticker } = (e as CustomEvent).detail as { ticker: string };
      analyze(ticker);
    }
    window.addEventListener("sq:fill-ticker", handler);
    return () => window.removeEventListener("sq:fill-ticker", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKeys, envKeysSet]);

  const hasKeys = envKeysSet || (apiKeys.polygon && apiKeys.fmp);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 1) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!hasKeys) return;
      setLoadingSuggestions(true);
      try {
        const keyParam = envKeysSet ? "" : `&key=${encodeURIComponent(apiKeys.polygon)}`;
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}${keyParam}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
      } catch {
        // ignore
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, hasKeys, apiKeys.polygon, envKeysSet]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function analyze(ticker: string) {
    if (!ticker.trim()) return;
    setSuggestions([]);
    setQuery(ticker);
    setError("");
    setAnalyzing(true);
    setLoadingStage("Fetching Stock Data...");
    setCurrentAnalysis(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ticker,
          polygonKey: apiKeys.polygon,
          fmpKey: apiKeys.fmp,
          claudeKey: apiKeys.claude || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        // Non-streaming error
        const data = await res.json().catch(() => ({ error: "Analysis failed" }));
        setError(data.error ?? "Analysis failed");
        setAnalyzing(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const chunk of parts) {
          const line = chunk.replace(/^data: /, "").trim();
          if (!line) continue;

          let event: ProgressEvent;
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }

          switch (event.stage) {
            case "fetching": setLoadingStage("Fetching Stock Data..."); break;
            case "researching": setLoadingStage("Claude Researching..."); break;
            case "selecting": setLoadingStage("Selecting Best Formula..."); break;
            case "calculating": setLoadingStage("Calculating..."); break;
            case "reporting": setLoadingStage("Generating Report..."); break;
            case "complete":
              if (event.result) setCurrentAnalysis(event.result as QuantAnalysis);
              setAnalyzing(false);
              break;
            case "error":
              setError(event.error ?? "Analysis failed");
              setAnalyzing(false);
              break;
          }
        }
      }
    } catch {
      setError("Network error. Please try again.");
      setAnalyzing(false);
    }
  }

  // ─── Shared props for SearchInput ──────────────────────────────────────────
  const searchInputProps = {
    wrapperRef,
    query,
    setQuery,
    suggestions,
    setSuggestions,
    loadingSuggestions,
    hasKeys,
    analyzing,
    analyze,
    setCurrentAnalysis,
    setError,
  };

  // ─── Render: Hero / Loading / Content ──────────────────────────────────────
  
  // 1. Hero State (No analysis, no loading)
  if (!analyzing && !currentAnalysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-3xl w-full text-center space-y-8 relative z-10 -mt-20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-wider mb-2">
              <Zap size={12} fill="currentColor" /> v2.0 Quant Engine Live
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
              Quant <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Alpha</span> Search
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
              Institutional-grade analysis powered by Fama-French 5-factor models, GBM simulations, and AI-driven macro risk assessment.
            </p>
          </div>

          <div className="w-full max-w-xl mx-auto">
            <SearchInput large {...searchInputProps} />
          </div>

          {!hasKeys && (
            <div className="max-w-md mx-auto flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-xl p-4 text-left">
              <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-warning">API Configuration Required</p>
                <p className="text-xs text-warning/80">
                  To access real-time market data, please configure your Polygon and FMP keys in{" "}
                  <button onClick={() => setActiveTab("settings")} className="underline hover:text-white">Settings</button>.
                </p>
              </div>
            </div>
          )}

          <div className="pt-8">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">Trending Tickers</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["NVDA", "TSLA", "AAPL", "AMD", "PLTR", "MSFT"].map((t) => (
                <button
                  key={t}
                  onClick={() => analyze(t)}
                  disabled={!hasKeys}
                  className="group px-4 py-2 bg-surface/50 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-sm font-medium text-text-secondary hover:text-primary transition-all duration-200"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (analyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-surface/30 backdrop-blur-sm animate-fade-in">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-surface-highlight rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={24} className="text-primary animate-pulse" fill="currentColor" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{loadingStage}</h3>
            <p className="text-text-secondary text-sm">
              Processing thousands of data points...
            </p>
          </div>

          <div className="w-full bg-surface-highlight rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
              style={{ width: `${(Math.max(STAGES.indexOf(loadingStage), 0) / (STAGES.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 text-left bg-surface/50 p-4 rounded-xl border border-border/50">
             {STAGES.map((stage, idx) => {
               const isActive = stage === loadingStage;
               const isDone = STAGES.indexOf(loadingStage) > idx;
               return (
                 <div key={stage} className={`flex items-center gap-3 text-sm transition-colors ${isActive ? "text-primary font-medium" : isDone ? "text-success/80" : "text-text-secondary/40"}`}>
                   <div className={`w-2 h-2 rounded-full ${isActive ? "bg-primary animate-pulse" : isDone ? "bg-success" : "bg-border"}`} />
                   {stage}
                   {isDone && <ArrowRight size={12} className="ml-auto" />}
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    );
  }

  // 3. Results State
  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Persistent Header */}
      <div className="sticky top-0 z-30 bg-background/40 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-6 shadow-xl">
        <div className="flex-1 max-w-xl">
          <SearchInput {...searchInputProps} />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-danger text-xs font-bold bg-danger/10 px-4 py-2 rounded-xl border border-danger/20 animate-fade-in">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        {currentAnalysis && (
          <div className="pb-12">
            <StockDetail analysis={currentAnalysis} />
          </div>
        )}
      </div>
    </div>
  );
}
