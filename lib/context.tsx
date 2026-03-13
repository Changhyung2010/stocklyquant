"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { QuantAnalysis, WatchlistItem } from "./types";

interface ApiKeys {
  polygon: string;
  fmp: string;
  claude: string;
}

interface AppContextValue {
  apiKeys: ApiKeys;
  setApiKeys: (keys: ApiKeys) => void;
  watchlist: WatchlistItem[];
  addToWatchlist: (ticker: string, score?: number, price?: number) => void;
  removeFromWatchlist: (ticker: string) => void;
  currentAnalysis: QuantAnalysis | null;
  setCurrentAnalysis: (a: QuantAnalysis | null) => void;
  activeTab: "search" | "watchlist" | "market" | "settings";
  setActiveTab: (t: "search" | "watchlist" | "market" | "settings") => void;
  envKeysSet: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, envKeysSet }: { children: React.ReactNode; envKeysSet: boolean }) {
  const [apiKeys, setApiKeysState] = useState<ApiKeys>({ polygon: "", fmp: "", claude: "" });
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<QuantAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<AppContextValue["activeTab"]>("search");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sq_api_keys");
      if (stored) setApiKeysState(JSON.parse(stored));
      const wl = localStorage.getItem("sq_watchlist");
      if (wl) setWatchlist(JSON.parse(wl));
    } catch {
      // ignore
    }
  }, []);

  const setApiKeys = useCallback((keys: ApiKeys) => {
    setApiKeysState(keys);
    localStorage.setItem("sq_api_keys", JSON.stringify(keys));
  }, []);

  const addToWatchlist = useCallback((ticker: string, score?: number, price?: number) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.ticker === ticker)) return prev;
      const item: WatchlistItem = {
        id: crypto.randomUUID(),
        ticker,
        addedDate: new Date().toISOString(),
        lastQuantScore: score,
        lastPrice: price,
      };
      const next = [...prev, item];
      localStorage.setItem("sq_watchlist", JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    setWatchlist((prev) => {
      const next = prev.filter((w) => w.ticker !== ticker);
      localStorage.setItem("sq_watchlist", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        apiKeys,
        setApiKeys,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        currentAnalysis,
        setCurrentAnalysis,
        activeTab,
        setActiveTab,
        envKeysSet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
