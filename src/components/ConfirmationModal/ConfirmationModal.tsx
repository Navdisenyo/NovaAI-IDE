import React from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  actionTitle: string;
  service: string;
  details: string;
  impact: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  actionTitle,
  service,
  details,
  impact,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0a0f1e] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Level 2 Permission Required
            </h3>
            <span className="text-xs text-amber-300 font-mono">Service: {service}</span>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed">
          <div>
            <span className="text-slate-400 font-mono uppercase text-[10px] block mb-0.5">
              Action Requested
            </span>
            <div className="text-sm font-semibold text-white">{actionTitle}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-slate-400 font-mono uppercase text-[10px] block">
              Execution Details
            </span>
            <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">{details}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-semibold">Expected Impact:</span> {impact}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Reject Action</span>
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Authorize & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
