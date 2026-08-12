import React from 'react';
import { 
  Building, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileText,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { OrgVerificationStatus, PublisherVerificationLevel } from '../../types';

interface VerificationStatusCardProps {
  status?: OrgVerificationStatus;
  orgType?: string;
  orgName?: string;
  notes?: string;
  submittedAt?: string;
  publisherLevel?: PublisherVerificationLevel;
  onStartVerification: () => void;
  isCompact?: boolean;
}

export default function VerificationStatusCard({
  status = 'not_started',
  orgType,
  orgName,
  notes,
  submittedAt,
  publisherLevel,
  onStartVerification,
  isCompact = false
}: VerificationStatusCardProps) {

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Organization</span>
          </div>
        );
      case 'under_review':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Under Review</span>
          </div>
        );
      case 'action_required':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Action Required</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Verification Incomplete</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Building className="w-3.5 h-3.5" />
            <span>Not Started</span>
          </div>
        );
    }
  };

  const formattedDate = submittedAt ? new Date(submittedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : null;

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all ${
      status === 'verified'
        ? 'bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-950/80 border-emerald-500/30'
        : status === 'action_required'
        ? 'bg-gradient-to-br from-orange-950/20 via-slate-900/60 to-slate-950/80 border-orange-500/30'
        : status === 'rejected'
        ? 'bg-gradient-to-br from-rose-950/20 via-slate-900/60 to-slate-950/80 border-rose-500/30'
        : status === 'under_review'
        ? 'bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950/80 border-amber-500/30'
        : 'bg-gradient-to-br from-blue-950/20 via-slate-900/60 to-slate-950/80 border-blue-500/20'
    } p-5 sm:p-6 shadow-xl`}>

      {/* Decorative top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        status === 'verified' ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
        : status === 'action_required' ? 'bg-gradient-to-r from-orange-500 to-amber-400'
        : status === 'rejected' ? 'bg-gradient-to-r from-rose-500 to-red-400'
        : status === 'under_review' ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
      }`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              status === 'verified' ? 'bg-emerald-500/10 text-emerald-400'
              : status === 'action_required' ? 'bg-orange-500/10 text-orange-400'
              : status === 'rejected' ? 'bg-rose-500/10 text-rose-400'
              : status === 'under_review' ? 'bg-amber-500/10 text-amber-400'
              : 'bg-blue-500/10 text-blue-400'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                  Organization Verification Status
                </h3>
                {getStatusBadge()}
              </div>
              {orgName && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {orgName} {orgType ? `• ${orgType.replace('_', ' ').toUpperCase()}` : ''}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            {status === 'verified' && 'Your organization identity has been verified. You can publish alliance opportunities, sponsor research, and offer laboratory/equipment support.'}
            {status === 'under_review' && 'Your verification application has been submitted and is under review by our team. Standard review takes 24-48 hours.'}
            {status === 'action_required' && 'Additional details or document verification is required to complete your organization verification application.'}
            {status === 'rejected' && 'Your organization verification application could not be approved based on the submitted details.'}
            {status === 'not_started' && 'Complete your organization verification to publish alliances, submit funding opportunities, or offer research infrastructure support.'}
          </p>

          {/* Additional details for Publisher verification levels */}
          {orgType === 'publisher' && publisherLevel && (
            <div className="mt-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Publisher Tier Level: <strong className="text-amber-300 capitalize">{publisherLevel.replace(/_/g, ' ')}</strong></span>
            </div>
          )}

          {/* Admin notes display */}
          {notes && (status === 'action_required' || status === 'rejected') && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <span className="text-orange-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Review Feedback / Notes:
              </span>
              <p className="text-slate-300 italic">{notes}</p>
            </div>
          )}

          {formattedDate && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submitted on: {formattedDate}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="sm:self-center flex-shrink-0">
          {status !== 'verified' && (
            <button
              onClick={onStartVerification}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                status === 'action_required' || status === 'rejected'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-950/40'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
              }`}
            >
              <span>
                {status === 'not_started' ? 'Complete Verification' : status === 'action_required' ? 'Update Verification' : status === 'rejected' ? 'Resubmit Verification' : 'View Application'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
