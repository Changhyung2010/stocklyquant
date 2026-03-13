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

  // Load from localStorage on mount (hydration safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sq_api_keys");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setApiKeysState({
            polygon: parsed.polygon || "",
            fmp: parsed.fmp || "",
            claude: parsed.claude || "",
          });
        }
      }
      const wl = localStorage.getItem("sq_watchlist");
      if (wl) {
        const parsed = JSON.parse(wl);
        if (Array.isArray(parsed)) {
          setWatchlist(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  const setApiKeys = useCallback((keys: ApiKeys) => {
    setApiKeysState(keys);
    try {
      localStorage.setItem("sq_api_keys", JSON.stringify(keys));
    } catch (e) {
      console.error("Failed to save api keys:", e);
    }
  }, []);

  const addToWatchlist = useCallback((ticker: string, score?: number, price?: number) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.ticker === ticker)) return prev;
      
      // Fallback for randomUUID if not in secure context or old browser
      const id = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15);

      const item: WatchlistItem = {
        id,
        ticker,
        addedDate: new Date().toISOString(),
        lastQuantScore: score,
        lastPrice: price,
      };
      const next = [...prev, item];
      try {
        localStorage.setItem("sq_watchlist", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save watchlist:", e);
      }
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
