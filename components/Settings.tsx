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

  // Fields shown only when env vars are NOT handling them
  const dataFields: Array<{
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
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold text-white mb-1">Settings</h2>
      <p className="text-sm text-gray-400 mb-6">
        Your API keys are stored locally in your browser and never sent to our servers except when proxied to the external APIs.
      </p>

      {/* Env-var notice — shown instead of Polygon/FMP fields */}
      {envKeysSet ? (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={16} />
            <p className="text-sm font-medium">Polygon &amp; FMP keys are set via environment variables.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-5">
          {dataFields.map((f) => (
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
      )}

      {/* Claude key — always shown, it's always user-provided */}
      <div className="bg-gray-800/60 rounded-xl p-5 border border-purple-800/40">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-200">
            Anthropic Claude API Key
            <span className="ml-2 text-xs text-purple-400 font-normal">optional · enables AI analysis</span>
          </label>
          <a
            href="https://console.anthropic.com/account/keys"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
          >
            Get key at Anthropic
            <ExternalLink size={12} />
          </a>
        </div>
        <div className="relative">
          <input
            type={show.claude ? "text" : "password"}
            value={local.claude}
            onChange={(e) => setLocal((p) => ({ ...p, claude: e.target.value }))}
            placeholder="sk-ant-..."
            className="w-full bg-gray-900 text-gray-100 rounded-lg px-4 py-2.5 pr-10 text-sm border border-purple-800/60 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={() => setShow((p) => ({ ...p, claude: !p.claude }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {show.claude ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          When provided, Claude AI will run factor importance analysis, predict expected returns, and generate investment insights alongside the quant model.
        </p>
      </div>

      <button
        onClick={save}
        className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {saved ? "Saved!" : "Save API Keys"}
      </button>
    </div>
  );
}
