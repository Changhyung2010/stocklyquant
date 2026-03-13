"use client";
import { useState } from "react";
import { Eye, EyeOff, ExternalLink, CheckCircle } from "lucide-react";
import { useApp } from "@/lib/context";

export default function Settings() {
  const { apiKeys, setApiKeys, envKeysSet } = useApp();
  const [local, setLocal] = useState(apiKeys);
  const [show, setShow] = useState({ polygon: false, fmp: false, claude: false });
  const [saved, setSaved] = useState(false);

  function save() {
    setApiKeys(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (envKeysSet) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-5">
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle size={20} />
            <p className="font-medium">API keys are configured via environment variables.</p>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            The server has Polygon and FMP keys set. You can start analyzing stocks immediately.
          </p>
        </div>
      </div>
    );
  }

  const fields: Array<{
    id: keyof typeof local;
    label: string;
    placeholder: string;
    link: string;
    linkLabel: string;
  }> = [
    {
      id: "polygon",
      label: "Polygon.io API Key",
      placeholder: "Enter Polygon API key",
      link: "https://polygon.io/dashboard/api-keys",
      linkLabel: "Get key at polygon.io",
    },
    {
      id: "fmp",
      label: "Financial Modeling Prep API Key",
      placeholder: "Enter FMP API key",
      link: "https://financialmodelingprep.com/developer/docs",
      linkLabel: "Get key at FMP",
    },
    {
      id: "claude",
      label: "Anthropic Claude API Key (optional)",
      placeholder: "Enter Claude API key for AI analysis",
      link: "https://console.anthropic.com/account/keys",
      linkLabel: "Get key at Anthropic",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold text-white mb-1">Settings</h2>
      <p className="text-sm text-gray-400 mb-6">
        Your API keys are stored locally in your browser and never sent to our servers except when proxied to the external APIs.
      </p>

      <div className="space-y-5">
        {fields.map((f) => (
          <div key={f.id} className="bg-gray-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-200">{f.label}</label>
              <a
                href={f.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                {f.linkLabel}
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="relative">
              <input
                type={show[f.id] ? "text" : "password"}
                value={local[f.id]}
                onChange={(e) => setLocal((p) => ({ ...p, [f.id]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-gray-900 text-gray-100 rounded-lg px-4 py-2.5 pr-10 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => setShow((p) => ({ ...p, [f.id]: !p[f.id] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {show[f.id] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {saved ? "Saved!" : "Save API Keys"}
      </button>
    </div>
  );
}
