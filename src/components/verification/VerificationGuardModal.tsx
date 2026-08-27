import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, ShieldCheck, ArrowRight, Lock, Building2, CheckCircle } from 'lucide-react';

interface VerificationGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteVerification: () => void;
  actionTitle?: string;
  orgName?: string;
  orgType?: string;
}

export default function VerificationGuardModal({
  isOpen,
  onClose,
  onCompleteVerification,
  actionTitle = 'Create Alliance Opportunity',
  orgName,
  orgType
}: VerificationGuardModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-left space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header icon and Title */}
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Institutional Verification Required
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
                Verify Your Organization First
              </h3>
            </div>
          </div>

          {/* Organization Pill if provided */}
          {(orgName || orgType) && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold truncate">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{orgName || 'Organization Account'}</span>
              </div>
              {orgType && (
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full font-mono text-[10px] font-bold uppercase shrink-0">
                  {orgType}
                </span>
              )}
            </div>
          )}

          {/* Body message */}
          <div className="space-y-3.5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            <p>
              All organization accounts (universities, laboratories, companies, NGOs, investors, and government bodies) must complete institutional verification before they can create research alliances or view the alliance creation form.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Prevents unauthorized or fraudulent alliance calls</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Authenticates grant funding & lab resource commitments</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Ensures trusted collaboration between African researchers & partners</span>
              </div>
            </div>

            {actionTitle && (
              <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 mt-2">
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Restricted action: <strong>{actionTitle}</strong></span>
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
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Organization Now</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors text-center cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
