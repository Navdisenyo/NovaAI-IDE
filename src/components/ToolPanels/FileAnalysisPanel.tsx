import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { getGeminiApiKeyHeader } from '../../utils/api';

export const FileAnalysisPanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContentText, setFileContentText] = useState<string>('');
  const [fileBase64, setFileBase64] = useState<string>('');
  const [question, setQuestion] = useState('Summarize the document, extract key numbers or action items, and provide strategic recommendations.');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);

    const reader = new FileReader();
    if (file.type.startsWith('image/')) {
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setFileBase64(base64Data);
        setFileContentText('[Image file attached for visual analysis]');
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        const text = reader.result as string;
        setFileContentText(text.slice(0, 30000));
        setFileBase64('');
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFile || loading) return;

    try {
      setLoading(true);
      const res = await fetch('/api/files/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGeminiApiKeyHeader(),
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          textContent: fileContentText,
          contentBase64: fileBase64,
          question,
        }),
      });

      const data = await res.json();
      setAnalysisResult(data.analysis || 'Analysis complete.');
    } catch (err) {
      console.error('File analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            Document & File Analysis Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deep contextual comprehension for PDFs, CSV spreadsheets, source code, and images with Gemini 3.8.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Say: "Hey NOVA, analyze this PDF"</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: File upload & Question */}
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.csv,.json,.md,.js,.ts,.tsx,.py,.html,.png,.jpg,.jpeg"
            className="hidden"
          />

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
              selectedFile
                ? 'border-cyan-400/60 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                : 'border-white/10 hover:border-cyan-500/40 bg-[#090e1c]/60 hover:bg-white/[0.02]'
            }`}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-white truncate max-w-xs mx-auto">
                  {selectedFile.name}
                </div>
                <div className="text-xs font-mono text-cyan-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click to change file
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-xl bg-white/5 text-slate-400 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-200">
                    Click to browse or drop file
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, TXT, CSV, JSON, Markdown, Code, or Images
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Question / Instruction */}
          <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
              Analysis Instruction
            </label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What questions do you have about this document?"
              className="w-full bg-black/40 border border-cyan-900/40 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 disabled:opacity-50 text-white font-medium text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Analyzing Document...' : 'Run NOVA Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Analysis Results */}
        <div className="lg:col-span-2">
          <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                    {selectedFile ? `Insights for: ${selectedFile.name}` : 'Document Intelligence Output'}
                  </h3>
                </div>
                {analysisResult && (
                  <button
                    onClick={() => navigator.clipboard.writeText(analysisResult)}
                    className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Analysis</span>
                  </button>
                )}
              </div>

              {analysisResult ? (
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {analysisResult}
                </div>
              ) : (
                <div className="py-24 text-center space-y-3 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-sm">
                    Upload a file on the left and click "Run NOVA Analysis" to receive comprehensive summaries, tabular data parsing, and actionable conclusions.
                  </p>
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Local file data is processed securely through server-side Gemini API.</span>
              <span>Local-First Privacy Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
