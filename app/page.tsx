"use client";
import { useEffect } from "react";
import { Search, Bookmark, BarChart2, Settings as SettingsIcon, TrendingUp, FlaskConical } from "lucide-react";
import { useApp } from "@/lib/context";
import StockSearch from "@/components/StockSearch";
import Watchlist from "@/components/Watchlist";
import MarketDashboard from "@/components/MarketDashboard";
import Settings from "@/components/Settings";
import AccuracyDashboard from "@/components/AccuracyDashboard";

type Tab = "search" | "watchlist" | "market" | "settings" | "accuracy";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "search", label: "Analysis", icon: Search },
  { id: "watchlist", label: "Watchlist", icon: Bookmark },
  { id: "market", label: "Market", icon: BarChart2 },
  { id: "accuracy", label: "Accuracy", icon: FlaskConical },
];

export default function HomePage() {
  const { activeTab, setActiveTab, watchlist } = useApp();

  // Listen for analyze events from Watchlist component
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as { ticker: string };
      setActiveTab("search");
      // We delay slightly so search tab mounts first
      timeoutId = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("sq:fill-ticker", { detail: { ticker: detail.ticker } })
        );
      }, 50);
    }
    window.addEventListener("sq:analyze", handler);
    return () => {
      window.removeEventListener("sq:analyze", handler);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [setActiveTab]);

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden selection:bg-primary/20">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-20 lg:w-64 flex flex-col border-r border-border bg-surface/50 backdrop-blur-xl shrink-0 transition-all duration-300 z-50">
        {/* Brand */}
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <TrendingUp size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight text-white">
            StocklyQuant
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 p-3 mt-4">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative group flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`hidden lg:block text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                  {label}
                </span>
                
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                )}

                {/* Watchlist Count Badge */}
                {id === "watchlist" && watchlist.length > 0 && (
                  <span className={`absolute top-2 right-2 lg:top-1/2 lg:-translate-y-1/2 lg:right-4 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-background ${
                    isActive ? "bg-primary text-white" : "bg-surface-highlight text-text-secondary"
                  }`}>
                    {watchlist.length > 9 ? "9+" : watchlist.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Settings */}
        <div className="p-3 border-t border-border/50">
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-colors ${
              activeTab === "settings"
                ? "bg-surface-highlight text-white"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <SettingsIcon size={22} strokeWidth={activeTab === "settings" ? 2.5 : 2} />
            <span className="hidden lg:block text-sm font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-surface-highlight/10">
        {/* Ambient Glow Effects */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Content Container - No overflow here, let children handle it */}
        <div className="h-full relative z-10">
          <div className="max-w-7xl mx-auto h-full overflow-hidden">
            {activeTab === "search" && <StockSearch />}
            {activeTab === "watchlist" && <div className="h-full overflow-y-auto px-6 py-8"><Watchlist /></div>}
            {activeTab === "market" && <div className="h-full overflow-y-auto px-6 py-8"><MarketDashboard /></div>}
            {activeTab === "settings" && <div className="h-full overflow-y-auto px-6 py-8"><Settings /></div>}
            {activeTab === "accuracy" && <div className="h-full overflow-y-auto px-6 py-8"><AccuracyDashboard /></div>}
          </div>
        </div>
      </main>
    </div>
  );
}
