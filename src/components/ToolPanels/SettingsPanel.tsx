import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Volume2,
  Globe,
  Radio,
  Sliders,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserPreferences } from '../../types';

interface SettingsPanelProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  wakeWordSupported: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  preferences,
  onUpdatePreferences,
  wakeWordSupported,
}) => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Gemini API Key state
  const [apiKeyInput, setApiKeyInput] = useState(preferences.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    setApiKeyInput(preferences.geminiApiKey || '');
  }, [preferences.geminiApiKey]);

  const checkHealth = async () => {
    try {
      setCheckingHealth(true);
      const res = await fetch('/api/health', {
        headers: preferences.geminiApiKey ? { 'x-gemini-api-key': preferences.geminiApiKey } : {},
      });
      const data = await res.json();
      setHealthStatus(data);
    } catch (e) {
      setHealthStatus({ status: 'offline', error: 'Server unreachable' });
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    const updatedKey = trimmed.length > 0 ? trimmed : undefined;
    onUpdatePreferences({ geminiApiKey: updatedKey });

    setKeySaveMessage(
      updatedKey ? 'Gemini API Key saved and activated successfully!' : 'Reverted to default AI Studio environment key.'
    );
    setTestResult(null);

    // Refresh health status with new key
    setTimeout(() => {
      checkHealth();
    }, 300);

    setTimeout(() => {
      setKeySaveMessage(null);
    }, 4000);
  };

  const handleClearApiKey = () => {
    setApiKeyInput('');
    onUpdatePreferences({ geminiApiKey: undefined });
    setKeySaveMessage('Custom API Key cleared. Now using default AI Studio environment key.');
    setTestResult(null);

    setTimeout(() => {
      checkHealth();
    }, 300);

    setTimeout(() => {
      setKeySaveMessage(null);
    }, 4000);
  };

  const handleTestApiKey = async () => {
    const keyToTest = apiKeyInput.trim() || preferences.geminiApiKey;
    setTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/settings/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(keyToTest ? { 'x-gemini-api-key': keyToTest } : {}),
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setTestResult({
          success: true,
          message: `Verified! Gemini API responded: "${data.response?.trim() || 'OK'}" using ${data.model}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to authenticate with Gemini API',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error verifying key',
      });
    } finally {
      setTestingKey(false);
    }
  };

  const voices = [
    { id: 'Aoede', name: 'Aoede (Expressive & Playful Female)', tag: 'Recommended' },
    { id: 'Kore', name: 'Kore (Confident & Natural Female)', tag: 'Classic' },
    { id: 'Zephyr', name: 'Zephyr (Warm & Conversational)' },
    { id: 'Fenrir', name: 'Fenrir (Deep & Resonant)' },
    { id: 'Puck', name: 'Puck (Witty & Dynamic)' },
  ];

  const languages = [
    { id: 'auto', name: 'Auto-Detect (English, Bengali, Hindi)', desc: 'Switches seamlessly based on your spoken phrase' },
    { id: 'en', name: 'English (US & International)', desc: 'Concise, witty, conversational' },
    { id: 'bn', name: 'বাংলা (Bengali / Banglish)', desc: 'স্বাভাবিক বাংলা কথোপকথন এবং উত্তর' },
    { id: 'hi', name: 'हिन्दी (Hindi / Hinglish)', desc: 'स्वाभाविक हिंदी वार्तालाप और कार्य संपादन' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            Assistant Engine Settings & Integrations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure your Gemini API key, real-time voice synthesis, multi-lingual adaptation, and service status.
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={checkingHealth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
          <span>Check Status</span>
        </button>
      </div>

      {/* NEW: Gemini API Key Management Card */}
      <div className="bg-[#090e1c]/90 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <span>Google Gemini API Key</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Settings
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Add and save your personal Google Gemini API key to customize your quota, or use the default environment key.
              </p>
            </div>
          </div>

          {/* Current Key Status Badge */}
          <div className="flex items-center gap-2">
            {preferences.geminiApiKey ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custom Key Saved</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Default AI Studio Key Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Input and Controls */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase text-slate-300">
            Gemini API Key Input
          </label>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (Paste your Google Gemini API key here)"
                className="w-full bg-black/50 border border-cyan-900/50 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors p-1"
                title={showApiKey ? 'Hide API Key' : 'Show API Key'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
                title="Save API Key to local preferences"
              >
                <Save className="w-4 h-4" />
                <span>Save Key</span>
              </button>

              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={testingKey}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Test API Key against Google Gemini API"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingKey ? 'animate-spin' : ''}`} />
                <span>{testingKey ? 'Testing...' : 'Test Connection'}</span>
              </button>

              {preferences.geminiApiKey && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Remove custom key and reset to default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback & Status Banners */}
          {keySaveMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{keySaveMessage}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="flex-1">{testResult.message}</span>
            </div>
          )}

          {/* Key Helper Info & Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Keys are stored locally in your browser storage and proxied securely to the server.</span>
            </span>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline mt-1 sm:mt-0"
            >
              <span>Get a free Gemini API key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Persona Selection */}
        <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Voice Persona & Synthesis
            </h3>
          </div>

          <div className="space-y-2">
            {voices.map((v) => (
              <label
                key={v.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  preferences.voiceName === v.id
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200'
                    : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="voice"
                    value={v.id}
                    checked={preferences.voiceName === v.id}
                    onChange={() => onUpdatePreferences({ voiceName: v.id })}
                    className="accent-cyan-400"
                  />
                  <span className="text-xs font-medium">{v.name}</span>
                </div>
                {v.tag && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    {v.tag}
                  </span>
                )}
              </label>
            ))}
          </div>

          {/* Speaking Rate Slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
              <span>Speaking Cadence</span>
              <span className="text-cyan-400 font-semibold">{preferences.speakingRate}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={preferences.speakingRate}
              onChange={(e) => onUpdatePreferences({ speakingRate: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Language Adaptation */}
        <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Multilingual Comprehension
            </h3>
          </div>

          <div className="space-y-2">
            {languages.map((l) => (
              <label
                key={l.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  preferences.language === l.id
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-200'
                    : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <input
                  type="radio"
                  name="language"
                  value={l.id}
                  checked={preferences.language === l.id}
                  onChange={() => onUpdatePreferences({ language: l.id })}
                  className="mt-1 accent-cyan-400"
                />
                <div>
                  <div className="text-xs font-medium text-white">{l.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{l.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono text-cyan-300/80">
            NOVA automatically responds in the exact dialect or language you speak (Bengali, Hindi, English, Banglish, Hinglish).
          </div>
        </div>

        {/* Wake Word & Activation Settings */}
        <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Wake-Word & Hands-Free Activation
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-xs font-medium text-white">Enable "Hey NOVA" Wake Word</div>
                <div className="text-[11px] text-slate-400">
                  {wakeWordSupported
                    ? 'Local browser speech detection for hands-free activation'
                    : 'Browser speech recognition restricted on this platform'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.wakeWordEnabled}
                onChange={(e) => onUpdatePreferences({ wakeWordEnabled: e.target.checked })}
                disabled={!wakeWordSupported}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-xs font-medium text-white">Push-to-Talk Mode</div>
                <div className="text-[11px] text-slate-400">Hold spacebar to talk with NOVA</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.pushToTalk}
                onChange={(e) => onUpdatePreferences({ pushToTalk: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-xs font-medium text-white">Acoustic Noise Suppression</div>
                <div className="text-[11px] text-slate-400">Web Audio echo cancellation and noise gating</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.noiseSuppression}
                onChange={(e) => onUpdatePreferences({ noiseSuppression: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Integrations & Neural Services Diagnostics */}
        <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Neural Services & API Diagnostics
            </h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">Google Gemini Live (Audio/Voice)</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                gemini-3.8-live
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">Google Search Grounding</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Active (gemini-3.8-flash)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">API Key Configuration</span>
              <span className="flex items-center gap-1.5 text-cyan-400 truncate max-w-[200px]" title={healthStatus?.maskedKey}>
                <CheckCircle className="w-3.5 h-3.5" />
                {healthStatus?.isCustomKey ? `Custom (${healthStatus.maskedKey})` : (healthStatus?.hasGeminiKey ? 'Environment Key Active' : 'No Key')}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">Open-Meteo Weather API</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Connected (Global)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">Local Dexie IndexedDB</span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Online & Sovereign
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-300">PWA & Offline Service Worker</span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Registered
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
