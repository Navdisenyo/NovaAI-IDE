type WakeWordCallback = (phrase: string) => void;
type StatusCallback = (status: 'inactive' | 'listening' | 'detected' | 'unsupported' | 'permission_denied') => void;

export class WakeWordManager {
  private recognition: any = null;
  private isListening = false;
  private onDetectedCallback: WakeWordCallback | null = null;
  private onStatusCallback: StatusCallback | null = null;
  private audioCtx: AudioContext | null = null;
  private shouldRestart = true;
  private activationKeywords = [
    'hey nova',
    'hi nova',
    'nova',
    'hello nova',
    'হে নোভা',
    'হে নোভা',
    'हे नोवा',
    'हे नोवा',
  ];

  constructor(onDetected?: WakeWordCallback, onStatus?: StatusCallback) {
    if (onDetected) this.onDetectedCallback = onDetected;
    if (onStatus) this.onStatusCallback = onStatus;
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser for Wake Word.');
      this.updateStatus('unsupported');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('listening');
      };

      this.recognition.onresult = (event: any) => {
        const resultsLength = event.results.length;
        for (let i = event.resultIndex; i < resultsLength; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          // Check if transcript contains any wake phrase
          const matched = this.activationKeywords.find((kw) => transcript.includes(kw));
          if (matched) {
            console.log(`[WakeWordManager] Wake word detected: "${matched}"`);
            this.playWakeSound();
            this.updateStatus('detected');
            if (this.onDetectedCallback) {
              this.onDetectedCallback(matched);
            }
            break;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          console.warn('[WakeWordManager] Microphone permission denied');
          this.updateStatus('permission_denied');
          this.isListening = false;
          this.shouldRestart = false;
        } else if (event.error !== 'no-speech') {
          console.log('[WakeWordManager] Speech error:', event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.shouldRestart) {
          // Restart immediately to keep always-on listening active
          try {
            this.recognition.start();
          } catch (e) {
            // ignore rapid restart error
          }
        } else {
          this.updateStatus('inactive');
        }
      };
    } catch (err) {
      console.error('[WakeWordManager] Failed to initialize SpeechRecognition:', err);
      this.updateStatus('unsupported');
    }
  }

  public isSupported(): boolean {
    return Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  public startListening(): boolean {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) return false;
    }

    this.shouldRestart = true;
    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.log('[WakeWordManager] Start ignored or already running');
      return true;
    }
  }

  public stopListening(): void {
    this.shouldRestart = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // ignore
      }
    }
    this.isListening = false;
    this.updateStatus('inactive');
  }

  public setCallbacks(onDetected: WakeWordCallback, onStatus?: StatusCallback): void {
    this.onDetectedCallback = onDetected;
    if (onStatus) this.onStatusCallback = onStatus;
  }

  private updateStatus(status: 'inactive' | 'listening' | 'detected' | 'unsupported' | 'permission_denied') {
    if (this.onStatusCallback) {
      this.onStatusCallback(status);
    }
  }

  /**
   * Synthesize futuristic NOVA activation chime using Web Audio
   */
  public playWakeSound(): void {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Note 1 (E5 - 659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // Ramp to A5
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Note 2 (C#6 - 1108Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1108.73, now + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.25); // Ramp to E6
      gain2.gain.setValueAtTime(0, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio chime playback failed:', e);
    }
  }
}
