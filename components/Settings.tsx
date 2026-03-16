"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ExternalLink, CheckCircle, Save, Key, Shield } from "lucide-react";
import { useApp } from "@/lib/context";

function ApiKeyField({
  label, value, show, link, linkLabel, placeholder,
  onChange, onToggle, accent = false,
}: {
  label: string; value: string; show: boolean; link: string; linkLabel: string;
  placeholder: string; onChange: (v: string) => void; onToggle: () => void; accent?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <a
          href={link} target="_blank" rel="noreferrer"
          className={`flex items-center gap-1 text-xs font-medium hover:underline ${accent ? "text-violet-400" : "text-cyan-400"}`}
        >
          Get Key <ExternalLink size={10} />
        </a>
      </div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 text-slate-50 rounded-lg px-3 py-2.5 pr-10 text-sm
            focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
            placeholder:text-slate-600 transition-colors"
        />
        <button
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { apiKeys, setApiKeys, envKeysSet } = useApp();
  const [local, setLocal] = useState({ polygon: apiKeys.polygon || "", fmp: apiKeys.fmp || "", claude: apiKeys.claude || "" });
  const [show, setShow] = useState({ polygon: false, fmp: false, claude: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocal({ polygon: apiKeys.polygon || "", fmp: apiKeys.fmp || "", claude: apiKeys.claude || "" });
  }, [apiKeys]);

  function save() {
    setApiKeys(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">API Configuration</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your data provider keys.</p>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-lg p-4">
        <Shield size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-400 leading-relaxed">
          Keys are stored <span className="font-semibold text-slate-200">locally in your browser</span> and never sent to our servers —
          only proxied directly to Polygon.io, FMP, and Anthropic.
        </p>
      </div>

      {/* Market data keys */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="w-1 h-5 bg-cyan-500 rounded-full" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Market Data Providers</h3>
        </div>

        {envKeysSet ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Polygon.io &amp; FMP keys configured via environment variables.
            </span>
          </div>
        ) : (
          <>
            <ApiKeyField
              label="Polygon.io API Key"
              value={local.polygon}
              show={show.polygon}
              link="https://polygon.io/dashboard/api-keys"
              linkLabel="Get Key"
              placeholder="Enter Polygon key..."
              onChange={(v) => setLocal(p => ({ ...p, polygon: v }))}
              onToggle={() => setShow(p => ({ ...p, polygon: !p.polygon }))}
            />
            <ApiKeyField
              label="Financial Modeling Prep API Key"
              value={local.fmp}
              show={show.fmp}
              link="https://financialmodelingprep.com/developer/docs"
              linkLabel="Get Key"
              placeholder="Enter FMP key..."
              onChange={(v) => setLocal(p => ({ ...p, fmp: v }))}
              onToggle={() => setShow(p => ({ ...p, fmp: !p.fmp }))}
            />
          </>
        )}
      </div>

      {/* AI key */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="w-1 h-5 bg-violet-500 rounded-full" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">AI Enhancement</h3>
          <span className="ml-auto text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Optional</span>
        </div>
        <ApiKeyField
          label="Anthropic Claude API Key"
          value={local.claude}
          show={show.claude}
          link="https://console.anthropic.com/account/keys"
          linkLabel="Get Key"
          placeholder="sk-ant-..."
          onChange={(v) => setLocal(p => ({ ...p, claude: v }))}
          onToggle={() => setShow(p => ({ ...p, claude: !p.claude }))}
          accent
        />
        <p className="text-xs text-slate-500">
          Enables qualitative research summaries, factor weighting recommendations, and risk narratives.
        </p>
      </div>

      <button
        onClick={save}
        className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          saved
            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
        }`}
      >
        {saved ? <CheckCircle size={16} /> : <Save size={16} />}
        {saved ? "Saved!" : "Save Configuration"}
      </button>
    </div>
  );
}
