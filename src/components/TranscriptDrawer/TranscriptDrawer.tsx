import React, { useRef, useEffect } from 'react';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Sparkles,
  Bot,
  User,
  Wrench,
} from 'lucide-react';
import { ChatMessage } from '../../types';

interface TranscriptDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  interimTranscript: string;
  outputTranscript: string;
  onClearMessages: () => void;
}

export const TranscriptDrawer: React.FC<TranscriptDrawerProps> = ({
  isOpen,
  onToggle,
  messages,
  interimTranscript,
  outputTranscript,
  onClearMessages,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript, outputTranscript, isOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 z-20">
      {/* Drawer Toggle Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-t-2xl bg-[#090e1a]/90 border-t border-x border-cyan-950/40 backdrop-blur-xl">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Real-Time Transcript & Conversation History</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-400">
            {messages.length}
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {isOpen && messages.length > 0 && (
          <button
            onClick={onClearMessages}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear transcript history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Expanded Transcript Body */}
      {isOpen && (
        <div className="bg-[#070b16]/95 border-b border-x border-cyan-950/40 rounded-b-2xl p-4 backdrop-blur-2xl shadow-2xl">
          <div
            ref={scrollRef}
            className="max-h-72 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin scrollbar-thumb-cyan-900/30"
          >
            {messages.length === 0 && !interimTranscript && !outputTranscript ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                No spoken turns yet. Say "Hey NOVA" or press the central microphone to speak.
              </div>
            ) : null}

            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-sm leading-relaxed ${
                    isAssistant ? 'items-start' : 'items-start justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 text-cyan-300 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 border text-xs sm:text-sm ${
                      isAssistant
                        ? 'bg-[#0f172a]/80 border-cyan-900/40 text-slate-200'
                        : 'bg-cyan-950/50 border-cyan-500/30 text-cyan-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-mono text-slate-400">
                      <span className="font-semibold text-cyan-400">
                        {isAssistant ? 'NOVA AI' : 'You'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          onClick={() => copyToClipboard(msg.text)}
                          className="hover:text-cyan-300"
                          title="Copy text"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Tool Call Tag if executed */}
                    {msg.toolCall && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                        <Wrench className="w-3 h-3 shrink-0" />
                        <span>Executed: {msg.toolCall.name}</span>
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-300 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Live streaming user interim speech */}
            {interimTranscript && (
              <div className="flex justify-end gap-3 text-sm">
                <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-cyan-950/30 border border-cyan-400/20 text-cyan-300 text-xs italic animate-pulse">
                  <div className="text-[10px] font-mono text-cyan-400 mb-0.5">Listening...</div>
                  {interimTranscript}
                </div>
              </div>
            )}

            {/* Live streaming NOVA response speech */}
            {outputTranscript && (
              <div className="flex justify-start gap-3 text-sm">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 text-cyan-300 mt-0.5 animate-spin">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-[#0f172a]/90 border border-cyan-500/40 text-slate-100 text-xs sm:text-sm">
                  <div className="text-[10px] font-mono text-cyan-400 mb-0.5">NOVA Speaking...</div>
                  {outputTranscript}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
