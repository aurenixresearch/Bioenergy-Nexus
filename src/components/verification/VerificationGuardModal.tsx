import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

interface VerificationGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteVerification: () => void;
  actionTitle?: string;
}

export default function VerificationGuardModal({
  isOpen,
  onClose,
  onCompleteVerification,
  actionTitle
}: VerificationGuardModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-left space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header icon */}
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Institutional Security Notice
              </span>
              <h3 className="text-xl font-bold text-white">
                Verification required
              </h3>
            </div>
          </div>

          {/* Body message specified strictly by requirements */}
          <div className="space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed">
              Your organization profile must be verified before you can publish or initiate this type of opportunity. This helps protect researchers and organizations from fraudulent or misleading accounts.
            </p>

            {actionTitle && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Restricted action: <strong className="text-slate-200">{actionTitle}</strong></span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onCompleteVerification();
              }}
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Complete Verification</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors text-center"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
