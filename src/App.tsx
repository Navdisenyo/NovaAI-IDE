import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  Sparkles,
  Volume2,
  Radio,
  Menu,
  Shield,
  Layers,
} from 'lucide-react';
import { SystemState, NavigationTab, ChatMessage, UserPreferences } from './types';
import { getGeminiApiKeyHeader } from './utils/api';
import { seedInitialLocalData, db } from './services/db';
import { AudioEngine } from './services/AudioEngine';
import { WakeWordManager } from './services/WakeWordManager';
import { AssistantOrb } from './components/AssistantOrb/AssistantOrb';
import { VoiceControls } from './components/VoiceControls/VoiceControls';
import { Sidebar } from './components/Navigation/Sidebar';
import { TranscriptDrawer } from './components/TranscriptDrawer/TranscriptDrawer';
import { ResearchPanel } from './components/ToolPanels/ResearchPanel';
import { ImageStudioPanel } from './components/ToolPanels/ImageStudioPanel';
import { YouTubePanel } from './components/ToolPanels/YouTubePanel';
import { FileAnalysisPanel } from './components/ToolPanels/FileAnalysisPanel';
import { WebsiteBuilderPanel } from './components/ToolPanels/WebsiteBuilderPanel';
import { ProductivityPanel } from './components/ToolPanels/ProductivityPanel';
import { BusinessCodingPanel } from './components/ToolPanels/BusinessCodingPanel';
import { PrivacyCenterPanel } from './components/ToolPanels/PrivacyCenterPanel';
import { SettingsPanel } from './components/ToolPanels/SettingsPanel';
import { ConfirmationModal } from './components/ConfirmationModal/ConfirmationModal';

const getInitialPreferences = (): UserPreferences => {
  const defaults: UserPreferences = {
    voiceName: 'Aoede',
    language: 'auto',
    speakingRate: 1.0,
    volume: 1.0,
    wakeWordEnabled: true,
    pushToTalk: false,
    noiseSuppression: true,
    clientEncryption: false,
  };
  try {
    const saved = localStorage.getItem('nova_user_preferences');
    if (saved) {
      return { ...defaults, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to parse preferences from localStorage:', e);
  }
  return defaults;
};

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('voice');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // System and Audio States
  const [systemState, setSystemState] = useState<SystemState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0); // 0.0 - 1.0 (for orb visualizer)
  const [wakeWordActive, setWakeWordActive] = useState(true);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [wakeWordSupported, setWakeWordSupported] = useState(true);

  // Transcripts & Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [outputTranscript, setOutputTranscript] = useState('');
  const [transcriptDrawerOpen, setTranscriptDrawerOpen] = useState(true);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    service: string;
    details: string;
    impact: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    service: '',
    details: '',
    impact: '',
    onConfirm: () => {},
  });

  // User Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(getInitialPreferences);

  // Engine references
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const wakeWordManagerRef = useRef<WakeWordManager | null>(null);
  const liveWsRef = useRef<WebSocket | null>(null);

  // Initialize DB and engines on mount
  useEffect(() => {
    seedInitialLocalData().catch(console.error);

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.warn);
    }

    // Online / Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize Audio Engine
    audioEngineRef.current = new AudioEngine(
      (base64Pcm) => {
        // Microphone audio chunk (16kHz PCM)
        if (liveWsRef.current && liveWsRef.current.readyState === WebSocket.OPEN) {
          liveWsRef.current.send(
            JSON.stringify({
              type: 'audio',
              audio: base64Pcm,
            })
          );
        }
      },
      (vol) => {
        setAudioVolume(vol);
      }
    );

    // Initialize Wake Word Manager
    wakeWordManagerRef.current = new WakeWordManager(
      (matchedPhrase) => {
        console.log('[App] Wake Word Triggered:', matchedPhrase);
        setWakeWordDetected(true);
        setSystemState('wake_detected');

        setTimeout(() => {
          setWakeWordDetected(false);
          startVoiceSession();
        }, 600);
      },
      (status) => {
        if (status === 'unsupported' || status === 'permission_denied') {
          setWakeWordSupported(false);
          setWakeWordActive(false);
        }
      }
    );

    setWakeWordSupported(wakeWordManagerRef.current.isSupported());

    if (preferences.wakeWordEnabled && wakeWordManagerRef.current.isSupported()) {
      wakeWordManagerRef.current.startListening();
      setWakeWordActive(true);
    }

    // Connect to WebSocket Live API
    connectLiveWebSocket();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      audioEngineRef.current?.stopMicrophone();
      wakeWordManagerRef.current?.stopListening();
      if (liveWsRef.current) liveWsRef.current.close();
    };
  }, []);

  // Connect WebSocket to backend /api/live
  const connectLiveWebSocket = (customApiKey?: string) => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const activeKey = customApiKey !== undefined ? customApiKey : (preferences.geminiApiKey || '');
      const keyParam = activeKey ? `?apiKey=${encodeURIComponent(activeKey)}` : '';
      const wsUrl = `${protocol}//${window.location.host}/api/live${keyParam}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[App WebSocket] Connected to /api/live');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'audio' && data.audio) {
            setSystemState('speaking');
            audioEngineRef.current?.play24kPcmChunk(data.audio);
          } else if (data.type === 'inputTranscript') {
            setInterimTranscript('');
            addOrUpdateTurn('user', data.text);
            setSystemState('thinking');
          } else if (data.type === 'outputTranscript') {
            setOutputTranscript(data.text);
            addOrUpdateTurn('assistant', data.text);
          } else if (data.type === 'interrupted') {
            console.log('[App] Server signaled interruption');
            handleInterrupt();
          } else if (data.type === 'turnComplete') {
            setOutputTranscript('');
            setSystemState(isListening ? 'listening' : 'idle');
          } else if (data.type === 'toolCall') {
            setSystemState('executing');
          } else if (data.type === 'toolResult') {
            // Tool finished
            setTimeout(() => {
              if (systemState === 'executing') setSystemState('speaking');
            }, 500);
          }
        } catch (err) {
          console.error('[WebSocket] Parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Live error, conversational fallback active:', err);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Connection closed. Auto-reconnecting in 3s...');
        setTimeout(() => {
          if (navigator.onLine) connectLiveWebSocket();
        }, 3000);
      };

      liveWsRef.current = ws;
    } catch (e) {
      console.warn('WebSocket connection init failed:', e);
    }
  };

  const addOrUpdateTurn = (role: 'user' | 'assistant', text: string) => {
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      role,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    db.conversations.add(newMsg).catch(console.warn);
  };

  // Start Voice Session (Microphone Capture)
  const startVoiceSession = async () => {
    if (!audioEngineRef.current) return;
    setSystemState('connecting');

    const success = await audioEngineRef.current.startMicrophone();
    if (success) {
      setIsListening(true);
      setSystemState('listening');
    } else {
      setSystemState('error');
      setTimeout(() => setSystemState('idle'), 3000);
    }
  };

  // Stop / Pause Voice Session
  const stopVoiceSession = () => {
    if (!audioEngineRef.current) return;
    audioEngineRef.current.stopMicrophone();
    setIsListening(false);
    setSystemState('idle');
  };

  const toggleMic = () => {
    if (isListening) {
      stopVoiceSession();
    } else {
      startVoiceSession();
    }
  };

  const toggleMute = () => {
    if (!audioEngineRef.current) return;
    const nextMuted = !isMuted;
    audioEngineRef.current.setMute(nextMuted);
    setIsMuted(nextMuted);
  };

  const updatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('nova_user_preferences', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save preferences to localStorage:', e);
      }
      if (updated.geminiApiKey !== undefined && updated.geminiApiKey !== prev.geminiApiKey) {
        if (liveWsRef.current) {
          liveWsRef.current.close();
        }
        connectLiveWebSocket(next.geminiApiKey);
      }
      return next;
    });
  };

  const toggleWakeWord = () => {
    if (!wakeWordManagerRef.current) return;
    if (wakeWordActive) {
      wakeWordManagerRef.current.stopListening();
      setWakeWordActive(false);
      updatePreferences({ wakeWordEnabled: false });
    } else {
      const ok = wakeWordManagerRef.current.startListening();
      if (ok) {
        setWakeWordActive(true);
        updatePreferences({ wakeWordEnabled: true });
      }
    }
  };

  const handleInterrupt = () => {
    console.log('[App] Interrupted');
    audioEngineRef.current?.stopAllPlayback();
    audioEngineRef.current?.stopFallbackSpeech();
    setOutputTranscript('');
    setSystemState(isListening ? 'listening' : 'idle');

    if (liveWsRef.current && liveWsRef.current.readyState === WebSocket.OPEN) {
      liveWsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
  };

  const handleVolumeChange = (val: number) => {
    audioEngineRef.current?.setVolume(val);
    updatePreferences({ volume: val });
  };

  // Spoken / Typed text message sender (with tool execution support)
  const handleSendTextMessage = async (text: string) => {
    addOrUpdateTurn('user', text);
    setSystemState('thinking');

    // If WebSocket is open and connected to Gemini Live, send through stream
    if (liveWsRef.current && liveWsRef.current.readyState === WebSocket.OPEN) {
      liveWsRef.current.send(JSON.stringify({ type: 'text', text }));
    } else {
      // Fallback: Send to /api/converse with custom API key header if configured
      try {
        const res = await fetch('/api/converse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getGeminiApiKeyHeader(),
          },
          body: JSON.stringify({
            message: text,
            userPreferences: preferences,
          }),
        });

        const data = await res.json();
        const responseText = data.text || 'Understood.';

        addOrUpdateTurn('assistant', responseText);
        setSystemState('speaking');

        // Play spoken response via speech synthesis fallback
        await audioEngineRef.current?.speakFallback(responseText, preferences.voiceName);
        setSystemState(isListening ? 'listening' : 'idle');
      } catch (err) {
        console.error('Converse error:', err);
        setSystemState('error');
        setTimeout(() => setSystemState(isListening ? 'listening' : 'idle'), 3000);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.warn);
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.warn);
      }
      setIsFullscreen(false);
    }
  };

  // Spacebar Push-to-Talk & Escape Interruption Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        handleInterrupt();
      } else if (e.code === 'Space' && preferences.pushToTalk && !isListening) {
        e.preventDefault();
        startVoiceSession();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space' && preferences.pushToTalk && isListening) {
        e.preventDefault();
        stopVoiceSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, preferences.pushToTalk]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#03060d] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        systemState={systemState}
        wakeWordActive={wakeWordActive}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-14 border-b border-white/5 bg-[#050914]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase hidden sm:inline">
                MODE:
              </span>
              <span className="text-xs font-mono text-slate-300 font-medium">
                {currentTab.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Quick Status Badges & Controls */}
          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Network / Offline Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
            </div>

            {/* Neural Audio Engine Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px]">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Voice: {preferences.voiceName} (24kHz PCM)</span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative flex flex-col justify-between">
          {currentTab === 'voice' && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[520px] max-w-4xl mx-auto w-full space-y-6">
              {/* Centered Futuristic AI Orb */}
              <AssistantOrb
                state={systemState}
                audioVolume={audioVolume}
                onClick={toggleMic}
                wakeWordDetected={wakeWordDetected}
              />

              {/* Voice Controls: Mic, Interrupt, Mute, Volume */}
              <VoiceControls
                systemState={systemState}
                isListening={isListening}
                isMuted={isMuted}
                wakeWordActive={wakeWordActive}
                wakeWordSupported={wakeWordSupported}
                masterVolume={preferences.volume}
                onToggleMic={toggleMic}
                onToggleMute={toggleMute}
                onToggleWakeWord={toggleWakeWord}
                onInterrupt={handleInterrupt}
                onVolumeChange={handleVolumeChange}
                onSendTextMessage={handleSendTextMessage}
              />

              {/* Quick Spoken Action Pills (English, Bengali, Hindi) */}
              <div className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-2 pt-2">
                {[
                  "What's the weather today?",
                  'Generate a futuristic wallpaper',
                  'Search latest AI news',
                  'Create landing page brief',
                  'আজকে আমার জন্য একটি কবিতা বলো',
                  'आज की ताजा खबरें क्या हैं?',
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendTextMessage(promptText)}
                    className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-950/20 text-slate-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>

              {/* Real-time Spoken Transcript Drawer */}
              <TranscriptDrawer
                isOpen={transcriptDrawerOpen}
                onToggle={() => setTranscriptDrawerOpen(!transcriptDrawerOpen)}
                messages={messages}
                interimTranscript={interimTranscript}
                outputTranscript={outputTranscript}
                onClearMessages={() => {
                  setMessages([]);
                  db.conversations.clear().catch(console.warn);
                }}
              />
            </div>
          )}

          {currentTab === 'research' && <ResearchPanel />}
          {currentTab === 'image_studio' && <ImageStudioPanel />}
          {currentTab === 'youtube' && <YouTubePanel />}
          {currentTab === 'files' && <FileAnalysisPanel />}
          {currentTab === 'website_builder' && <WebsiteBuilderPanel />}
          {currentTab === 'productivity' && <ProductivityPanel />}
          {currentTab === 'business_coding' && <BusinessCodingPanel />}
          {currentTab === 'privacy' && <PrivacyCenterPanel />}
          {currentTab === 'settings' && (
            <SettingsPanel
              preferences={preferences}
              onUpdatePreferences={updatePreferences}
              wakeWordSupported={wakeWordSupported}
            />
          )}
        </main>
      </div>

      {/* Level 2 Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        actionTitle={confirmModal.title}
        service={confirmModal.service}
        details={confirmModal.details}
        impact={confirmModal.impact}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal((m) => ({ ...m, isOpen: false }));
        }}
        onCancel={() => setConfirmModal((m) => ({ ...m, isOpen: false }))}
      />
    </div>
  );
}

export default App;
