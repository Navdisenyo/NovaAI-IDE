import React, { useState } from 'react';
import {
  Code2,
  Briefcase,
  Sparkles,
  Copy,
  RefreshCw,
  Check,
  Terminal,
  TrendingUp,
} from 'lucide-react';
import { getGeminiApiKeyHeader } from '../../utils/api';

export const BusinessCodingPanel: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'business' | 'coding'>('business');

  // Business state
  const [bizTaskType, setBizTaskType] = useState('Marketing Strategy & Campaign');
  const [bizTopic, setBizTopic] = useState('AI Voice Assistant for Remote Professionals');
  const [bizDetails, setBizDetails] = useState('Focus on high productivity, privacy, hands-free operation, and sleek UX.');
  const [bizLoading, setBizLoading] = useState(false);
  const [bizOutput, setBizOutput] = useState<string | null>(null);

  // Coding state
  const [codeLanguage, setCodeLanguage] = useState('TypeScript / React');
  const [codeTask, setCodeTask] = useState('Implement a real-time AudioWorklet node for 16kHz PCM streaming');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const handleGenerateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizTopic.trim() || bizLoading) return;

    try {
      setBizLoading(true);
      const res = await fetch('/api/business/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGeminiApiKeyHeader(),
        },
        body: JSON.stringify({
          taskType: bizTaskType,
          topic: bizTopic,
          details: bizDetails,
        }),
      });
      const data = await res.json();
      setBizOutput(data.output || 'No output generated.');
    } catch (err) {
      console.error('Business assist error:', err);
    } finally {
      setBizLoading(false);
    }
  };

  const handleGenerateCoding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeTask.trim() || codeLoading) return;

    try {
      setCodeLoading(true);
      const res = await fetch('/api/coding/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGeminiApiKeyHeader(),
        },
        body: JSON.stringify({
          language: codeLanguage,
          task: codeTask,
          codeSnippet,
        }),
      });
      const data = await res.json();
      setCodeOutput(data.codeOutput || 'No code generated.');
    } catch (err) {
      console.error('Coding assist error:', err);
    } finally {
      setCodeLoading(false);
    }
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            {activeMode === 'business' ? (
              <Briefcase className="w-6 h-6 text-amber-400" />
            ) : (
              <Code2 className="w-6 h-6 text-cyan-400" />
            )}
            Executive Business & Engineering Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Produce market intelligence, financial projections, software architecture, and verified source code.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex p-1 rounded-xl bg-[#090e1c] border border-cyan-900/30">
          <button
            onClick={() => setActiveMode('business')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeMode === 'business'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Business & Marketing</span>
          </button>
          <button
            onClick={() => setActiveMode('coding')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              activeMode === 'coding'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Code Engineering</span>
          </button>
        </div>
      </div>

      {activeMode === 'business' ? (
        /* BUSINESS SUITE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleGenerateBusiness}
            className="bg-[#090e1c]/80 border border-amber-900/30 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Business Strategy Config
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Artifact Type
              </label>
              <select
                value={bizTaskType}
                onChange={(e) => setBizTaskType(e.target.value)}
                className="w-full bg-black/40 border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Marketing Strategy & Campaign">Marketing Strategy & Campaign</option>
                <option value="Executive Business Plan">Executive Business Plan</option>
                <option value="Competitor & Market Research">Competitor & Market Research</option>
                <option value="High-Converting Ad Copy">High-Converting Ad Copy</option>
                <option value="Client Proposal & Quotation">Client Proposal & Quotation</option>
                <option value="Customer Persona & Journey">Customer Persona & Journey</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Product / Venture Topic
              </label>
              <input
                type="text"
                value={bizTopic}
                onChange={(e) => setBizTopic(e.target.value)}
                placeholder="Product, company, or venture name..."
                className="w-full bg-black/40 border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Key Objectives & Differentiators
              </label>
              <textarea
                rows={4}
                value={bizDetails}
                onChange={(e) => setBizDetails(e.target.value)}
                placeholder="Target demographic, price point, core advantages..."
                className="w-full bg-black/40 border border-amber-900/40 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={bizLoading || !bizTopic.trim()}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-medium text-xs font-mono flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              {bizLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{bizLoading ? 'Synthesizing Strategy...' : 'Generate Business Artifact'}</span>
            </button>
          </form>

          {/* Business Output */}
          <div className="lg:col-span-2">
            <div className="bg-[#090e1c]/80 border border-amber-900/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                  <h4 className="text-xs font-mono text-amber-300 font-semibold uppercase tracking-wider">
                    {bizTaskType} Output
                  </h4>
                  {bizOutput && (
                    <button
                      onClick={() => copyText(bizOutput)}
                      className="flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {bizOutput ? (
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-950">
                    {bizOutput}
                  </div>
                ) : (
                  <div className="py-24 text-center text-slate-500 text-sm space-y-2">
                    <Briefcase className="w-10 h-10 mx-auto text-slate-600" />
                    <p>Enter details on the left to produce complete go-to-market strategies and proposals.</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500">
                NOVA Executive Business Engine
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CODING SUITE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleGenerateCoding}
            className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Code Architecture Config
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Language / Framework
              </label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="TypeScript / React">TypeScript / React</option>
                <option value="Next.js App Router">Next.js App Router</option>
                <option value="Node.js / Express">Node.js / Express</option>
                <option value="Python / FastAPI">Python / FastAPI</option>
                <option value="PostgreSQL / SQL">PostgreSQL / SQL</option>
                <option value="Tailwind CSS">Tailwind CSS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Engineering Task
              </label>
              <input
                type="text"
                value={codeTask}
                onChange={(e) => setCodeTask(e.target.value)}
                placeholder="What code or architecture do you need?"
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Existing Code / Context (Optional)
              </label>
              <textarea
                rows={4}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Paste code snippet to refactor or debug..."
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={codeLoading || !codeTask.trim()}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-medium text-xs font-mono flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20"
            >
              {codeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              <span>{codeLoading ? 'Compiling Code...' : 'Generate Code & Review'}</span>
            </button>
          </form>

          {/* Coding Output */}
          <div className="lg:col-span-2">
            <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                  <h4 className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                    {codeLanguage} Code Solution
                  </h4>
                  {codeOutput && (
                    <button
                      onClick={() => copyText(codeOutput)}
                      className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  )}
                </div>

                {codeOutput ? (
                  <div className="bg-[#05070e] rounded-xl p-4 border border-cyan-950 overflow-x-auto">
                    <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {codeOutput}
                    </pre>
                  </div>
                ) : (
                  <div className="py-24 text-center text-slate-500 text-sm space-y-2">
                    <Code2 className="w-10 h-10 mx-auto text-slate-600" />
                    <p>Enter an engineering task on the left to generate clean, modular code with explanations.</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500">
                NOVA Principal Software Architect
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
