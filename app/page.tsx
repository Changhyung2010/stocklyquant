"use client";
import { useEffect } from "react";
import { Search, Bookmark, BarChart2, Settings as SettingsIcon, TrendingUp } from "lucide-react";
import { useApp } from "@/lib/context";
import StockSearch from "@/components/StockSearch";
import Watchlist from "@/components/Watchlist";
import MarketDashboard from "@/components/MarketDashboard";
import Settings from "@/components/Settings";

type Tab = "search" | "watchlist" | "market" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "search", label: "Analyze", icon: Search },
  { id: "watchlist", label: "Watchlist", icon: Bookmark },
  { id: "market", label: "Market", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function HomePage() {
  const { activeTab, setActiveTab, watchlist } = useApp();

  // Listen for analyze events from Watchlist component
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as { ticker: string };
      setActiveTab("search");
      // We delay slightly so search tab mounts first
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("sq:fill-ticker", { detail: { ticker: detail.ticker } })
        );
      }, 50);
    }
    window.addEventListener("sq:analyze", handler);
    return () => window.removeEventListener("sq:analyze", handler);
  }, [setActiveTab]);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 sm:w-20 flex flex-col items-center py-5 bg-gray-900 border-r border-gray-800 shrink-0">
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
          <TrendingUp size={18} className="text-white" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 w-full px-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex flex-col items-center gap-1 py-3 px-1 rounded-xl text-xs transition-colors ${
                activeTab === id
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon size={20} />
              <span className="hidden sm:block">{label}</span>
              {id === "watchlist" && watchlist.length > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {watchlist.length > 9 ? "9+" : watchlist.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "search" && <StockSearch />}
        {activeTab === "watchlist" && <Watchlist />}
        {activeTab === "market" && <MarketDashboard />}
        {activeTab === "settings" && <Settings />}
      </main>
    </div>
  );
}
