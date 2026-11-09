import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Radio,
  Send,
  Sparkles,
} from 'lucide-react';
import { SystemState } from '../../types';

interface VoiceControlsProps {
  systemState: SystemState;
  isListening: boolean;
  isMuted: boolean;
  wakeWordActive: boolean;
  wakeWordSupported: boolean;
  masterVolume: number;
  onToggleMic: () => void;
  onToggleMute: () => void;
  onToggleWakeWord: () => void;
  onInterrupt: () => void;
  onVolumeChange: (val: number) => void;
  onSendTextMessage: (text: string) => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  systemState,
  isListening,
  isMuted,
  wakeWordActive,
  wakeWordSupported,
  masterVolume,
  onToggleMic,
  onToggleMute,
  onToggleWakeWord,
  onInterrupt,
  onVolumeChange,
  onSendTextMessage,
}) => {
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onSendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  const isSpeaking = systemState === 'speaking';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 px-4 select-none">
      {/* Primary Voice Action Bar */}
      <div className="flex items-center justify-center gap-3 p-2 rounded-2xl bg-[#0a0f1d]/80 border border-cyan-900/30 backdrop-blur-xl shadow-2xl shadow-cyan-950/30">
        {/* Mute Mic Button */}
        <button
          onClick={onToggleMute}
          className={`p-3 rounded-xl transition-all duration-200 border ${
            isMuted
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-400 hover:bg-rose-900/50'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Central Main Mic Activate / Stop Button */}
        <button
          onClick={onToggleMic}
          className={`relative group px-6 py-3.5 rounded-xl font-medium tracking-wide flex items-center gap-2.5 transition-all duration-300 border shadow-lg ${
            isListening
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-500/20'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/30 text-white hover:brightness-110 shadow-cyan-500/25'
          }`}
        >
          {isListening ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
              <span className="text-sm font-semibold">Listening (Tap to Pause)</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">Start Voice Session</span>
            </>
          )}
        </button>

        {/* Interrupt Button (Highlighted when speaking) */}
        <button
          onClick={onInterrupt}
          disabled={!isSpeaking && systemState !== 'listening'}
          className={`p-3 rounded-xl transition-all duration-200 border flex items-center gap-1.5 ${
            isSpeaking
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30 animate-pulse'
              : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
          }`}
          title="Interrupt NOVA and stop speech playback"
        >
          <Square className="w-4 h-4 fill-current" />
          <span className="text-xs font-mono hidden sm:inline">Interrupt</span>
        </button>

        {/* Wake-Word Toggle Switch */}
        <button
          onClick={onToggleWakeWord}
          className={`px-3 py-2 rounded-xl text-xs font-mono tracking-wider transition-all duration-200 border flex items-center gap-1.5 ${
            wakeWordActive
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
          title={
            wakeWordSupported
              ? 'Toggle hands-free "Hey NOVA" wake-word activation'
              : 'Wake-word detection not supported in this browser'
          }
        >
          <Radio className={`w-3.5 h-3.5 ${wakeWordActive ? 'text-cyan-400 animate-pulse' : ''}`} />
          <span className="hidden sm:inline">"Hey NOVA"</span>
          <span
            className={`w-2 h-2 rounded-full ${
              wakeWordActive ? 'bg-cyan-400' : 'bg-slate-600'
            }`}
          />
        </button>
      </div>

      {/* Auxiliary controls: Volume slider & text prompt toggle */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
        {/* Volume control */}
        <div className="flex items-center gap-2">
          {masterVolume === 0 ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title={`Volume: ${Math.round(masterVolume * 100)}%`}
          />
          <span className="font-mono text-[11px] text-slate-500">{Math.round(masterVolume * 100)}%</span>
        </div>

        {/* Text fallback input toggle */}
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showTextInput ? 'Hide Text Input' : 'Type Spoken Command'}</span>
        </button>
      </div>

      {/* Optional Spoken / Typed Command Box */}
      {showTextInput && (
        <form onSubmit={handleSubmitText} className="w-full flex items-center gap-2 mt-1">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your instruction or question for NOVA..."
            className="flex-1 bg-[#0d1424] border border-cyan-900/40 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
