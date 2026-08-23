import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { ResearchPaper } from '../../types';
import { 
  FileText, 
  UploadCloud, 
  Clock, 
  FileEdit, 
  Hourglass, 
  Eye, 
  Tag, 
  Calendar,
  Loader2 
} from 'lucide-react';
import ProfileCompletionModal from '../ProfileCompletionModal';
import { checkProfileCompleteness, ProfileCompletenessResult } from '../../utils/profileValidation';
import { getUserProfile } from '../../services/db';

interface ResearchOverviewProps {
  user: FirebaseUser;
  onNavigateToView?: (view: any, paperId?: string) => void;
  onUploadResearch?: (draft?: any) => void;
  userProfile?: any;
}

export default function ResearchOverview({
  user,
  onNavigateToView,
  onUploadResearch,
  userProfile
}: ResearchOverviewProps) {
  const [uploadedResearch, setUploadedResearch] = useState<ResearchPaper[]>([]);
  const [draftResearch, setDraftResearch] = useState<ResearchPaper[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileValidation, setProfileValidation] = useState<ProfileCompletenessResult | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Direct real-time Firebase listener on custom_papers for authenticated user data
    const unsub = onSnapshot(
      collection(db, 'custom_papers'),
      (snapshot) => {
        const userPapers: ResearchPaper[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter strictly for documents belonging to the authenticated user
          if (data.userId === user.uid || (user.email && data.userEmail === user.email)) {
            userPapers.push({
              id: docSnap.id,
              isCustom: true,
              ...data
            } as ResearchPaper);
          }
        });

        // 1. Recently Uploaded Research:
        // Filter out drafts and pending submissions
        const uploaded = userPapers.filter(
          (p) =>
            p.visibility !== 'Private Draft' &&
            p.status !== 'Draft' &&
            p.status !== 'Under Review' &&
            p.status !== 'Pending' &&
            p.status !== 'In Review'
        );
        // Sort newest to oldest
        uploaded.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        // 2. Draft Research:
        const drafts = userPapers.filter(
          (p) => p.visibility === 'Private Draft' || p.status === 'Draft' || (p as any).isDraft === true
        );
        drafts.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        // 3. Pending Submissions:
        const pending = userPapers.filter(
          (p) => p.status === 'Under Review' || p.status === 'Pending' || p.status === 'In Review'
        );
        pending.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setUploadedResearch(uploaded);
        setDraftResearch(drafts);
        setPendingSubmissions(pending);
        setLoading(false);
      },
      (error) => {
        console.warn('Firebase research overview query error:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const handleViewPaper = (paperId?: string) => {
    if (onNavigateToView) {
      onNavigateToView('research', paperId);
    }
  };

  const handleUploadClick = () => {
    if (onUploadResearch) {
      onUploadResearch();
    } else if (onNavigateToView) {
      onNavigateToView('research');
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('open-publish-wizard'));
        }
      }, 60);
    }
  };

  const formatDate = (dateStr?: string | number) => {
    if (!dateStr) return 'N/A';
    if (typeof dateStr === 'number') return dateStr.toString();
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return String(dateStr);
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="space-y-4 font-sans text-left my-6" id="research_overview_section">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Research Overview</span>
        </h3>
      </div>

      {/* Responsive Grid: Desktop (3 columns side-by-side), Tablet (2 columns), Mobile (Stacked vertically) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* CARD 1: Recently Uploaded Research */}
        <div 
          className="bg-white dark:bg-[#06140c] dark:border-emerald-900/40 rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-2xs flex flex-col justify-between transition-all"
          style={{ backgroundColor: '#ffffff', boxShadow: 'none' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/30">
              <h4 
                className="text-sm font-bold flex items-center gap-2"
                style={{ color: '#0c1b00' }}
              >
                <UploadCloud className="w-4 h-4 text-[#008744]" />
                Recently Uploaded Research
              </h4>
              {uploadedResearch.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#008744] dark:text-emerald-400 font-extrabold text-[10px] rounded-full border border-emerald-100 dark:border-emerald-800/40">
                  {uploadedResearch.length} {uploadedResearch.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>

            {uploadedResearch.length > 0 ? (
              <div className="space-y-3">
                {uploadedResearch.slice(0, 3).map((paper) => (
                  <div
                    key={paper.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-emerald-900/20 space-y-2 hover:border-emerald-200 dark:hover:border-emerald-700/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {paper.title}
                      </h5>
                      <span className="shrink-0 px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                        {paper.status || 'Published'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="inline-flex items-center gap-1 truncate max-w-[130px]">
                        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{paper.category || 'Bioenergy Research'}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatDate(paper.createdAt || paper.publishedYear)}</span>
                      </span>
                    </div>

                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleViewPaper(paper.id)}
                        className="px-3 py-1 bg-[#008744] hover:bg-[#00733a] text-white text-[11px] font-bold rounded-lg transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer border-0"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-6 text-center space-y-3 flex flex-col items-center justify-center">
                {/* Empty-state illustration */}
                <div 
                  className="w-16 h-16 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-[#008744] dark:text-emerald-400 shadow-2xs"
                  style={{ backgroundColor: '#170000' }}
                >
                  <UploadCloud className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p 
                    className="text-xs font-bold whitespace-nowrap"
                    style={{ color: '#0c1b00' }}
                  >
                    No research has been published yet.
                  </p>
                </div>
                <button
                  onClick={handleUploadClick}
                  className="mt-2 px-4 py-2 bg-[#008744] hover:bg-[#00733a] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer border-0"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Research</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: Draft Research */}
        <div 
          className="bg-white dark:bg-[#06140c] dark:border-emerald-900/40 rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-2xs flex flex-col justify-between transition-all"
          style={{ backgroundColor: '#ffffff', boxShadow: 'none' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/30">
              <h4 
                className="text-sm font-bold flex items-center gap-2"
                style={{ color: '#0c1b00' }}
              >
                <FileEdit className="w-4 h-4 text-amber-500" />
                Draft Research
              </h4>
              {draftResearch.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-extrabold text-[10px] rounded-full border border-amber-200 dark:border-amber-800/40">
                  {draftResearch.length} {draftResearch.length === 1 ? 'draft' : 'drafts'}
                </span>
              )}
            </div>

            {draftResearch.length > 0 ? (
              <div className="space-y-3">
                {draftResearch.slice(0, 3).map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-emerald-900/20 space-y-2 hover:border-amber-200 dark:hover:border-amber-700/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {draft.title}
                      </h5>
                      <span className="shrink-0 px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {(draft as any).completionStatus || draft.status || 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Last edited {formatDate((draft as any).updatedAt || draft.createdAt)}</span>
                      </span>
                    </div>

                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => {
                          if (onUploadResearch) {
                            onUploadResearch(draft);
                          } else {
                            handleViewPaper(draft.id);
                          }
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer border-0"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>Continue editing</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[160px]">
                <div 
                  className="w-12 h-12 rounded-xl border border-slate-200 dark:border-emerald-900/30 flex items-center justify-center text-slate-400 dark:text-slate-500"
                  style={{ backgroundColor: '#170000' }}
                >
                  <FileEdit className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p 
                  className="text-xs font-bold"
                  style={{ color: '#0c1b00' }}
                >
                  No draft research is available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: Pending Submissions */}
        <div 
          className="bg-white dark:bg-[#06140c] dark:border-emerald-900/40 rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-2xs flex flex-col justify-between transition-all"
          style={{ backgroundColor: '#ffffff', boxShadow: 'none' }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/30">
              <h4 
                className="text-sm font-bold flex items-center gap-2"
                style={{ color: '#0c1b00' }}
              >
                <Hourglass className="w-4 h-4 text-blue-500" />
                Pending Submissions
              </h4>
              {pendingSubmissions.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-extrabold text-[10px] rounded-full border border-blue-200 dark:border-blue-800/40">
                  {pendingSubmissions.length} {pendingSubmissions.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            {pendingSubmissions.length > 0 ? (
              <div className="space-y-3">
                {pendingSubmissions.slice(0, 3).map((submission) => (
                  <div
                    key={submission.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-emerald-900/20 space-y-2 hover:border-blue-200 dark:hover:border-blue-700/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {submission.title}
                      </h5>
                      <span className="shrink-0 px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        {submission.status || 'Under Review'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Submitted {formatDate(submission.createdAt)}</span>
                      </span>
                    </div>

                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleViewPaper(submission.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer border-0"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View submission</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[160px]">
                <div 
                  className="w-12 h-12 rounded-xl border border-slate-200 dark:border-emerald-900/30 flex items-center justify-center text-slate-400 dark:text-slate-500"
                  style={{ backgroundColor: '#170000' }}
                >
                  <Hourglass className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p 
                  className="text-xs font-bold"
                  style={{ color: '#0c1b00' }}
                >
                  You have no pending submissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onNavigateToProfile={() => {
          setShowProfileModal(false);
          if (onNavigateToView) {
            onNavigateToView('profile');
          } else {
            window.location.hash = '#/profile';
          }
        }}
        missingFields={profileValidation?.missingFields || []}
        completionPercent={profileValidation?.completionPercent || 0}
      />
    </div>
  );
}
