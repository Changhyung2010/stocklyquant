"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ExternalLink, CheckCircle, Save, Key, Shield } from "lucide-react";
import { useApp } from "@/lib/context";

export default function Settings() {
  const { apiKeys, setApiKeys, envKeysSet } = useApp();
  // Initialize local state from context
  const [local, setLocal] = useState({
    polygon: apiKeys.polygon || "",
    fmp: apiKeys.fmp || "",
    claude: apiKeys.claude || "",
  });
  
  // Update local state when context changes (e.g. initial load)
  useEffect(() => {
    setLocal({
      polygon: apiKeys.polygon || "",
      fmp: apiKeys.fmp || "",
      claude: apiKeys.claude || "",
    });
  }, [apiKeys]);

  const [show, setShow] = useState({ polygon: false, fmp: false, claude: false });
  const [saved, setSaved] = useState(false);

  function save() {
    setApiKeys(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const handleChange = (key: keyof typeof local, value: string) => {
    setLocal(prev => ({ ...prev, [key]: value }));
  };

  const toggleShow = (key: keyof typeof show) => {
    setShow(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-surface-highlight rounded-xl">
          <Key size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">API Configuration</h1>
          <p className="text-text-secondary mt-1">Manage your data provider keys securely.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl mb-8">
        <div className="flex items-start gap-4 mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <Shield size={20} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary leading-relaxed">
            Your API keys are stored <strong className="text-primary">locally in your browser</strong>. 
            They are never sent to our servers, only proxied directly to the respective API providers (Polygon.io, FMP, Anthropic) to fetch data.
          </p>
        </div>

        {/* Essential Data Keys */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Market Data Providers
          </h3>

          {envKeysSet ? (
            <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl text-success">
              <CheckCircle size={20} />
              <span className="font-medium">Polygon.io and FMP keys are configured via environment variables.</span>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Polygon */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-text-primary">Polygon.io API Key</label>
                  <a href="https://polygon.io/dashboard/api-keys" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    Get Key <ExternalLink size={10} />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={show.polygon ? "text" : "password"}
                    value={local.polygon}
                    onChange={(e) => handleChange("polygon", e.target.value)}
                    placeholder="Enter Polygon key..."
                    className="w-full glass-input rounded-xl py-3 px-4 pr-12 text-sm text-white placeholder:text-text-secondary/30"
                  />
                  <button
                    onClick={() => toggleShow("polygon")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                  >
                    {show.polygon ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* FMP */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-text-primary">Financial Modeling Prep API Key</label>
                  <a href="https://financialmodelingprep.com/developer/docs" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    Get Key <ExternalLink size={10} />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={show.fmp ? "text" : "password"}
                    value={local.fmp}
                    onChange={(e) => handleChange("fmp", e.target.value)}
                    placeholder="Enter FMP key..."
                    className="w-full glass-input rounded-xl py-3 px-4 pr-12 text-sm text-white placeholder:text-text-secondary/30"
                  />
                  <button
                    onClick={() => toggleShow("fmp")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                  >
                    {show.fmp ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Key */}
        <div className="space-y-6 mt-10 pt-8 border-t border-border/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full" />
            AI Enhancement (Optional)
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-text-primary">Anthropic Claude API Key</label>
              <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-secondary hover:underline">
                Get Key <ExternalLink size={10} />
              </a>
            </div>
            <div className="relative">
              <input
                type={show.claude ? "text" : "password"}
                value={local.claude}
                onChange={(e) => handleChange("claude", e.target.value)}
                placeholder="sk-ant-..."
                className="w-full glass-input rounded-xl py-3 px-4 pr-12 text-sm text-white placeholder:text-text-secondary/30 border-secondary/20 focus:border-secondary/50 focus:ring-secondary/20"
              />
              <button
                onClick={() => toggleShow("claude")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
              >
                {show.claude ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Enables advanced qualitative analysis, factor weighting recommendations, and risk summaries.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={save}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
          saved 
            ? "bg-success text-white shadow-success/20" 
            : "bg-primary hover:bg-primary/90 text-background shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
        }`}
      >
        {saved ? <CheckCircle size={20} /> : <Save size={20} />}
        {saved ? "Settings Saved" : "Save Configuration"}
      </button>
    </div>
  );
}
