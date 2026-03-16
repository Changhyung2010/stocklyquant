"use client";
import { useEffect } from "react";
import {
  Search, Bookmark, BarChart2, Settings as SettingsIcon,
  TrendingUp, FlaskConical, Zap,
} from "lucide-react";
import { useApp } from "@/lib/context";
import StockSearch from "@/components/StockSearch";
import Watchlist from "@/components/Watchlist";
import MarketDashboard from "@/components/MarketDashboard";
import Settings from "@/components/Settings";
import AccuracyDashboard from "@/components/AccuracyDashboard";

type Tab = "search" | "watchlist" | "market" | "settings" | "accuracy";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "search",    label: "Analysis",  icon: Search      },
  { id: "watchlist", label: "Watchlist", icon: Bookmark    },
  { id: "market",    label: "Market",    icon: BarChart2   },
  { id: "accuracy",  label: "Accuracy",  icon: FlaskConical},
];

export default function HomePage() {
  const { activeTab, setActiveTab, watchlist } = useApp();

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    function handler(e: Event) {
      const { ticker } = (e as CustomEvent).detail as { ticker: string };
      setActiveTab("search");
      tid = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("sq:fill-ticker", { detail: { ticker } }));
      }, 50);
    }
    window.addEventListener("sq:analyze", handler);
    return () => { window.removeEventListener("sq:analyze", handler); clearTimeout(tid); };
  }, [setActiveTab]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-16 lg:w-60 flex flex-col shrink-0 border-r border-slate-800 bg-slate-950 z-50">
        {/* Brand */}
        <div className="h-14 flex items-center px-3 lg:px-5 border-b border-slate-800 gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center shrink-0">
            <Zap size={15} className="text-slate-950" strokeWidth={2.5} />
          </div>
          <span className="hidden lg:block font-bold text-base text-slate-50 truncate">
            StocklyQuant
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-0.5 p-2 mt-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:text-slate-50 hover:bg-slate-800"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                <span className="hidden lg:block">{label}</span>

                {/* Watchlist badge */}
                {id === "watchlist" && watchlist.length > 0 && (
                  <span className="ml-auto hidden lg:flex h-5 min-w-[1.25rem] items-center justify-center rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                    {watchlist.length > 9 ? "9+" : watchlist.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings footer */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "settings"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:text-slate-50 hover:bg-slate-800"
            }`}
          >
            <SettingsIcon size={18} strokeWidth={activeTab === "settings" ? 2.5 : 2} />
            <span className="hidden lg:block">Settings</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        <div className="h-full">
          {activeTab === "search"    && <StockSearch />}
          {activeTab === "watchlist" && <div className="h-full overflow-y-auto px-6 py-6"><Watchlist /></div>}
          {activeTab === "market"    && <div className="h-full overflow-y-auto px-6 py-6"><MarketDashboard /></div>}
          {activeTab === "settings"  && <div className="h-full overflow-y-auto px-6 py-6"><Settings /></div>}
          {activeTab === "accuracy"  && <div className="h-full overflow-y-auto px-6 py-6"><AccuracyDashboard /></div>}
        </div>
      </main>
    </div>
  );
}
