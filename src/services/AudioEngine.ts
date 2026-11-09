/**
 * Real-Time Voice Audio Engine for NOVA AI
 * - Input: 16kHz 16-bit PCM Little Endian
 * - Output: 24kHz 16-bit PCM Little Endian (Gemini Live standard)
 * - Gapless audio chunk scheduling
 * - Instant user interruption handling
 * - Real-time Voice Activity Detection (VAD)
 */

export class AudioEngine {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;

  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onAudioChunkCallback: ((base64Pcm: string) => void) | null = null;
  private onVolumeChangeCallback: ((volume: number) => void) | null = null;

  private isRecording = false;
  private isMuted = false;
  private masterVolume = 1.0;

  constructor(
    onAudioChunk?: (base64Pcm: string) => void,
    onVolumeChange?: (volume: number) => void
  ) {
    if (onAudioChunk) this.onAudioChunkCallback = onAudioChunk;
    if (onVolumeChange) this.onVolumeChangeCallback = onVolumeChange;
  }

  /**
   * Initialize and request microphone capture at 16kHz
   */
  public async startMicrophone(): Promise<boolean> {
    try {
      if (this.isRecording) return true;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });

      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micSource = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.inputAudioCtx.createAnalyser();
      this.analyser.fftSize = 256;

      // 4096 buffer size gives ~256ms chunk latency at 16kHz
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isRecording || this.isMuted) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Calculate RMS for Voice Activity / Visualizer
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sum += inputChannelData[i] * inputChannelData[i];
        }
        const rms = Math.sqrt(sum / inputChannelData.length);
        if (this.onVolumeChangeCallback) {
          this.onVolumeChangeCallback(Math.min(1, rms * 5));
        }

        // Convert Float32Array [-1.0, 1.0] to 16-bit PCM Little Endian
        const base64 = this.pcmFloat32ToBase64(inputChannelData);
        if (this.onAudioChunkCallback && base64) {
          this.onAudioChunkCallback(base64);
        }
      };

      this.micSource.connect(this.analyser);
      this.micSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioCtx.destination);

      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('[AudioEngine] Microphone access failed:', err);
      return false;
    }
  }

  /**
   * Stop microphone capture
   */
  public stopMicrophone(): void {
    this.isRecording = false;

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }

    if (this.onVolumeChangeCallback) {
      this.onVolumeChangeCallback(0);
    }
  }

  /**
   * Initialize output audio context for 24kHz model output
   */
  private getOutputContext(): AudioContext {
    if (!this.outputAudioCtx || this.outputAudioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioCtx = new AudioContextClass({ sampleRate: 24000 });
    }
    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume();
    }
    return this.outputAudioCtx;
  }

  /**
   * Schedule 24kHz raw PCM chunk for gapless playback
   */
  public play24kPcmChunk(base64Pcm: string): void {
    try {
      const ctx = this.getOutputContext();
      const rawBytes = this.base64ToUint8Array(base64Pcm);
      const float32Samples = this.pcm16ToFloat32(rawBytes);

      const buffer = ctx.createBuffer(1, float32Samples.length, 24000);
      buffer.getChannelData(0).set(float32Samples);

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = this.masterVolume;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Gapless scheduling
      const currentTime = ctx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.warn('[AudioEngine] Playback error:', err);
    }
  }

  /**
   * Instant interruption: stops all active audio chunks immediately and flushes queue
   */
  public stopAllPlayback(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    }
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }
  }

  /**
   * Set master playback volume (0 to 1)
   */
  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Toggle mute microphone
   */
  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Fallback: Browser Web Speech Synthesis for high-fidelity spoken response
   */
  public speakFallback(text: string, voiceName = 'Aoede'): Promise<void> {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;

      // Find best female English / regional voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('victoria') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('kavya') ||
            v.name.toLowerCase().includes('google uk english female')) &&
          v.lang.startsWith('en')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  public stopFallbackSpeech(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // --- Helper Conversion Functions ---

  private pcmFloat32ToBase64(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private pcm16ToFloat32(uint8Array: Uint8Array): Float32Array {
    const dataView = new DataView(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);
    const sampleCount = uint8Array.byteLength / 2;
    const float32Array = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const int16 = dataView.getInt16(i * 2, true); // Little endian
      float32Array[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
    }
    return float32Array;
  }
}
