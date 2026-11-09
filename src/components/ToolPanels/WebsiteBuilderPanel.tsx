import React, { useState } from 'react';
import {
  LayoutTemplate,
  Sparkles,
  Copy,
  ExternalLink,
  RefreshCw,
  Palette,
  Check,
  Globe,
} from 'lucide-react';
import { getGeminiApiKeyHeader } from '../../utils/api';

interface BriefResult {
  projectName: string;
  type: string;
  briefMarkdown: string;
  suggestedPalette: string[];
  createdAt: string;
}

export const WebsiteBuilderPanel: React.FC = () => {
  const [projectName, setProjectName] = useState('Nexus Cloud');
  const [type, setType] = useState('AI SaaS Landing Page');
  const [features, setFeatures] = useState('Futuristic dark mode, animated glassmorphism hero, live pricing calculator, customer testimonials, interactive demo.');
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<BriefResult | null>(null);
  const [copied, setCopied] = useState(false);

  const websiteTypes = [
    'AI SaaS Landing Page',
    'Modern Portfolio',
    'E-Commerce Storefront',
    'Fintech Dashboard',
    'Mobile App Landing Page',
    'Agency Showcase',
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectName.trim() || loading) return;

    try {
      setLoading(true);
      const res = await fetch('/api/website/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGeminiApiKeyHeader(),
        },
        body: JSON.stringify({
          projectName,
          type,
          features,
        }),
      });
      const data = await res.json();
      setBrief(data);
    } catch (err) {
      console.error('Website brief error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!brief) return;
    navigator.clipboard.writeText(brief.briefMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <LayoutTemplate className="w-6 h-6 text-cyan-400" />
            Website Builder & Architecture Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate production-grade project briefs, component specs, and ready-to-run prompts for Lovable and web builders.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Say: "Hey NOVA, create a landing page brief for my startup"</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Brief Configuration */}
        <div className="space-y-4">
          <form onSubmit={handleGenerate} className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Nexus Cloud, Nova Studio"
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Website Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {websiteTypes.map((t) => (
                  <option key={t} value={t} className="bg-[#0a0f1d] text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Key Features & Aesthetic Requirements
              </label>
              <textarea
                rows={4}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Target audience, dark/light theme, specific integrations, CTAs..."
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !projectName.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 disabled:opacity-50 text-white font-medium text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Synthesizing Brief...' : 'Generate Website Architecture'}</span>
            </button>
          </form>

          {/* Quick links to supported builders */}
          <div className="p-4 rounded-xl bg-[#090e1c]/40 border border-white/5 space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400">Launch In Web Builders:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <a
                href="https://lovable.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 transition-colors"
              >
                <span>Lovable.dev</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://v0.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 transition-colors"
              >
                <span>v0.dev</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Structured Brief Output */}
        <div className="lg:col-span-2">
          <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl min-h-[480px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                    {brief ? `${brief.projectName} Specification` : 'Project Blueprint & Prompt Package'}
                  </h3>
                </div>

                {brief && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Lovable Prompt'}</span>
                  </button>
                )}
              </div>

              {brief ? (
                <div className="space-y-4">
                  {/* Palette preview */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-slate-300">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Recommended Palette:</span>
                    <div className="flex gap-1.5 ml-2">
                      {brief.suggestedPalette.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-950">
                    {brief.briefMarkdown}
                  </div>
                </div>
              ) : (
                <div className="py-28 text-center space-y-3 text-slate-500">
                  <LayoutTemplate className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-sm">
                    Configure your project details on the left and click "Generate Website Architecture" to construct full design systems, page layouts, and prompt packages.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Ready for copy & paste into Lovable or AI builders.</span>
              <span>NOVA Architectural Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
