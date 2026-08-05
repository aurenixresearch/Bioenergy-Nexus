import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, X, UserCheck, AlertTriangle } from 'lucide-react';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile: () => void;
  missingFields: string[];
  completionPercent: number;
}

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  onNavigateToProfile,
  missingFields,
  completionPercent
}: ProfileCompletionModalProps) {
  if (!isOpen) return null;

  const requiredFields = [
    { name: 'Full Name', key: 'Full Name' },
    { name: 'Role / Designation', key: 'Role / Designation' },
    { name: 'Institution / Affiliation', key: 'Institution / Affiliation' },
    { name: 'Country / Location', key: 'Country / Location' },
    { name: 'Professional Bio', key: 'Professional Bio' },
    { name: 'Research Interests', key: 'Research Interests' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left"
          id="profile_completion_required_modal"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>

          {/* Header Icon & Title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shrink-0 border border-amber-200">
              <ShieldAlert className="w-7 h-7 text-amber-700" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-md text-xs font-bold uppercase tracking-wider border border-amber-200/80">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Action Required
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight">
                Profile Completion Required
              </h3>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            To ensure academic rigor and author accountability across the Aurenix Research Repository, you must complete your user profile before submitting or uploading research papers.
          </p>

          {/* Progress Bar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Profile Completion Status
              </span>
              <span className="text-emerald-700 font-mono text-sm font-extrabold">
                {completionPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(completionPercent, 5)}%` }}
              />
            </div>
          </div>

          {/* Missing Required Fields Checklist */}
          <div className="space-y-2.5 mb-7">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Missing Required Profile Information:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {requiredFields.map((field) => {
                const isMissing = missingFields.includes(field.key);
                return (
                  <div
                    key={field.key}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-2.5 rounded-xl border ${
                      isMissing
                        ? 'bg-amber-50/90 text-amber-950 border-amber-200/90'
                        : 'bg-emerald-50/90 text-emerald-950 border-emerald-200/90'
                    }`}
                  >
                    {isMissing ? (
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="truncate">{field.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateToProfile();
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
              id="go_to_complete_profile_btn"
            >
              <span>Complete Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

