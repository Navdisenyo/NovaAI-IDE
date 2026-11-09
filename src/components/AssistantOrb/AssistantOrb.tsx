import React, { useEffect, useRef } from 'react';
import { SystemState } from '../../types';

interface AssistantOrbProps {
  state: SystemState;
  audioVolume: number; // 0.0 to 1.0 (mic or speaker)
  onClick: () => void;
  wakeWordDetected?: boolean;
}

export const AssistantOrb: React.FC<AssistantOrbProps> = ({
  state,
  audioVolume,
  onClick,
  wakeWordDetected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Set high-DPI resolution
    const dpr = window.devicePixelRatio || 1;
    const size = 340;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;

      // Determine state colors & dynamics
      let coreColor = '#38bdf8'; // Cyan
      let outerColor = '#0284c7';
      let accentColor = '#818cf8'; // Indigo
      let speedMultiplier = 1.0;
      let pulseAmp = 1.0;

      if (state === 'idle') {
        speedMultiplier = 0.6;
        pulseAmp = 0.8;
      } else if (state === 'wake_detected' || wakeWordDetected) {
        coreColor = '#67e8f9';
        outerColor = '#38bdf8';
        accentColor = '#ffffff';
        speedMultiplier = 2.5;
        pulseAmp = 1.6;
      } else if (state === 'listening') {
        coreColor = '#06b6d4';
        outerColor = '#0284c7';
        accentColor = '#38bdf8';
        speedMultiplier = 1.2 + audioVolume * 2;
        pulseAmp = 1.0 + audioVolume * 2.5;
      } else if (state === 'thinking') {
        coreColor = '#a855f7';
        outerColor = '#6366f1';
        accentColor = '#ec4899';
        speedMultiplier = 2.0;
        pulseAmp = 1.2;
      } else if (state === 'speaking') {
        coreColor = '#38bdf8';
        outerColor = '#0ea5e9';
        accentColor = '#a5f3fc';
        speedMultiplier = 1.8 + audioVolume * 1.5;
        pulseAmp = 1.2 + audioVolume * 2.2;
      } else if (state === 'executing') {
        coreColor = '#10b981';
        outerColor = '#059669';
        accentColor = '#34d399';
        speedMultiplier = 1.5;
      } else if (state === 'waiting_approval') {
        coreColor = '#f59e0b';
        outerColor = '#d97706';
        accentColor = '#fde68a';
        speedMultiplier = 0.8;
      } else if (state === 'error') {
        coreColor = '#ef4444';
        outerColor = '#b91c1c';
        accentColor = '#fca5a5';
        speedMultiplier = 0.7;
      }

      const baseRadius = 75 * pulseAmp;

      // 1. Ambient outer aura
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.4,
        centerX,
        centerY,
        baseRadius * 1.8
      );
      auraGradient.addColorStop(0, `${coreColor}44`);
      auraGradient.addColorStop(0.6, `${outerColor}18`);
      auraGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = auraGradient;
      ctx.fill();

      // 2. Rotating orbital particles and rings
      const rings = 4;
      for (let r = 0; r < rings; r++) {
        const ringRadius = baseRadius * (0.8 + r * 0.28);
        const rotationSpeed = (r % 2 === 0 ? 1 : -1) * (time * speedMultiplier * (0.4 + r * 0.15));

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationSpeed);

        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${outerColor}${r === 1 ? '40' : '22'}`;
        ctx.lineWidth = 1.5;
        if (state === 'executing' || state === 'connecting') {
          ctx.setLineDash([12 + r * 6, 10 + r * 4]);
        }
        ctx.stroke();

        // Orbital nodes
        const nodesCount = 3 + r;
        for (let n = 0; n < nodesCount; n++) {
          const angle = (n * (Math.PI * 2)) / nodesCount;
          const nx = Math.cos(angle) * ringRadius;
          const ny = Math.sin(angle) * ringRadius;

          ctx.beginPath();
          ctx.arc(nx, ny, 2.5 + (r === 0 ? 1.5 : 0), 0, Math.PI * 2);
          ctx.fillStyle = n === 0 ? accentColor : `${coreColor}88`;
          ctx.fill();
        }

        ctx.restore();
      }

      // 3. Fluid Waveform Core (Morphing Organic Blob)
      const points = 32;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Harmonic noise simulation
        const noise =
          Math.sin(angle * 4 + time * speedMultiplier * 2) * 6 * pulseAmp +
          Math.cos(angle * 6 - time * speedMultiplier * 1.5) * 4 * pulseAmp +
          Math.sin(angle * 2 + time * speedMultiplier) * (audioVolume * 24);

        const r = baseRadius * 0.82 + noise;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Dynamic inner gradient
      const innerGradient = ctx.createRadialGradient(
        centerX - baseRadius * 0.2,
        centerY - baseRadius * 0.2,
        baseRadius * 0.1,
        centerX,
        centerY,
        baseRadius * 0.95
      );
      innerGradient.addColorStop(0, '#ffffff');
      innerGradient.addColorStop(0.3, coreColor);
      innerGradient.addColorStop(0.7, outerColor);
      innerGradient.addColorStop(1, `${accentColor}33`);

      ctx.fillStyle = innerGradient;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 24 * pulseAmp;
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // 4. Central Bright Pupil / Heartbeat core
      const pulseSize = 18 + Math.sin(time * speedMultiplier * 3) * 4 + audioVolume * 12;
      const corePupilGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
      corePupilGrad.addColorStop(0, '#ffffff');
      corePupilGrad.addColorStop(0.5, `${accentColor}cc`);
      corePupilGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = corePupilGrad;
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, audioVolume, wakeWordDetected]);

  // Status badges
  const stateLabels: Record<SystemState, { label: string; color: string }> = {
    idle: { label: 'Ready • "Hey NOVA"', color: 'text-cyan-400/80 border-cyan-500/20 bg-cyan-950/30' },
    wake_detected: { label: 'Wake Word Detected!', color: 'text-white border-cyan-400 bg-cyan-500/30 animate-pulse' },
    connecting: { label: 'Connecting to Neural Core...', color: 'text-indigo-300 border-indigo-500/30 bg-indigo-950/40' },
    listening: { label: 'Listening to your voice...', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40' },
    thinking: { label: 'Thinking & Reasoning...', color: 'text-purple-300 border-purple-500/40 bg-purple-950/40' },
    speaking: { label: 'NOVA is Speaking (Click to Interrupt)', color: 'text-sky-300 border-sky-400/40 bg-sky-950/40' },
    executing: { label: 'Executing Tool & Action...', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40' },
    waiting_approval: { label: 'Action Requires Confirmation', color: 'text-amber-300 border-amber-500/40 bg-amber-950/40' },
    error: { label: 'System Notice', color: 'text-rose-400 border-rose-500/40 bg-rose-950/40' },
  };

  const currentLabel = stateLabels[state] || stateLabels.idle;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Clickable Orb container */}
      <div
        onClick={onClick}
        className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 group"
        title={state === 'listening' ? 'Click to pause listening' : 'Click to talk with NOVA'}
      >
        {/* Soft Background glow backplate */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none" />

        <canvas
          ref={canvasRef}
          style={{ width: 340, height: 340 }}
          className="relative z-10 drop-shadow-[0_0_40px_rgba(56,189,248,0.25)]"
        />

        {/* Center Hover Icon / Prompt Hint */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-black/70 border border-cyan-500/30 text-cyan-300 backdrop-blur-md shadow-lg">
            {state === 'listening' ? 'Tap to Pause' : state === 'speaking' ? 'Tap to Interrupt' : 'Tap to Speak'}
          </span>
        </div>
      </div>

      {/* Futuristic Status Badge below Orb */}
      <div className="mt-4 flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium tracking-wide backdrop-blur-md transition-all duration-300 ${currentLabel.color}`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                state === 'listening'
                  ? 'bg-cyan-400'
                  : state === 'speaking'
                  ? 'bg-sky-400'
                  : state === 'thinking'
                  ? 'bg-purple-400'
                  : 'bg-cyan-500'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                state === 'listening'
                  ? 'bg-cyan-400'
                  : state === 'speaking'
                  ? 'bg-sky-400'
                  : state === 'thinking'
                  ? 'bg-purple-400'
                  : 'bg-cyan-500'
              }`}
            />
          </span>
          {currentLabel.label}
        </div>
      </div>
    </div>
  );
};
