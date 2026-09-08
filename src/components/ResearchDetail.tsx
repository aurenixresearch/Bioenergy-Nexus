import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Bookmark, Download, Share2, Clipboard, Check, Sparkles, Send, 
  Trash, Edit3, Award, Info, BookOpen, Layers, BarChart3, MessageSquare, 
  CheckCircle2, AlertCircle, Users, Link2, FileText, Plus, Shield, RefreshCw, Eye,
  Upload, FileEdit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResearchPaper, ResearchContribution, ResearchComment, ResearchVersion } from '../types';
import { updateCustomPaper, deleteCustomPaper, getUserProfile } from '../services/db';
import PublishWizard from './PublishWizard';
import ProfileCompletionModal from './ProfileCompletionModal';
import { checkProfileCompleteness, ProfileCompletenessResult } from '../utils/profileValidation';
import { User as FirebaseUser } from 'firebase/auth';

interface ResearchDetailProps {
  paper: ResearchPaper;
  onBack: () => void;
  isSaved: boolean;
  onSaveToggle: () => void;
  onDownload: (paper: ResearchPaper) => void | Promise<void>;
  user: FirebaseUser | null;
  onSignIn: () => void;
  userProfile?: any;
  onNavigateToProfile?: () => void;
}

export default function ResearchDetail({
  paper,
  onBack,
  isSaved,
  onSaveToggle,
  onDownload,
  user,
  onSignIn,
  userProfile: propUserProfile,
  onNavigateToProfile
}: ResearchDetailProps) {
  // Counts & view triggers
  const [viewsCount, setViewsCount] = useState(paper.viewsCount ?? 0);
  const [downloadsCount, setDownloadsCount] = useState(paper.downloadsCount ?? 0);
  const [bookmarksCount, setBookmarksCount] = useState(paper.bookmarksCount ?? 0);

  // Active view states
  const [activeTab, setActiveTab] = useState<'overview' | 'methodology' | 'results' | 'discussion' | 'references' | 'datasets' | 'contributors' | 'comments' | 'versions'>('overview');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('v1.0');
  
  // Dynamic displayed content depending on chosen version
  const [currentVersionData, setCurrentVersionData] = useState({
    title: paper.title,
    abstract: paper.abstract,
    subtitle: paper.subtitle || '',
    status: paper.status || 'Published',
    methodology: paper.researchMethodology || '',
    keyFindings: paper.keyFindings || '',
    conclusion: paper.conclusion || ''
  });

  // Track if current user is the owner who published this research
  const isOwner = Boolean(
    paper.isCustom &&
    user &&
    (
      paper.userId === user.uid ||
      (Boolean(user.email) && Boolean(paper.userEmail) && paper.userEmail.toLowerCase() === user.email.toLowerCase())
    )
  );

  // Load versions
  const [versions, setVersions] = useState<ResearchVersion[]>(paper.versions || [
    {
      id: 'v1.0',
      version: '1.0',
      title: paper.title,
      abstract: paper.abstract,
      publishedYear: paper.publishedYear,
      date: new Date().toISOString(),
      notes: 'Original peer-reviewed publication.'
    }
  ]);

  // Load contributions
  const [contributions, setContributions] = useState<ResearchContribution[]>(paper.contributions || []);

  // Load comments
  const [comments, setComments] = useState<ResearchComment[]>(paper.comments || []);

  // Track comments form inputs
  const [newCommentText, setNewCommentText] = useState('');

  // Contribution Submission Modal / Section
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [contributionType, setContributionType] = useState<ResearchContribution['type']>('Suggest Edit');
  const [contributionExplanation, setContributionExplanation] = useState('');
  const [contributionNotes, setContributionNotes] = useState('');
  const [contributionFileName, setContributionFileName] = useState('');

  // Version Edit Modal / Section
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [newVersionNum, setNewVersionNum] = useState('1.1');
  const [versionNotes, setVersionNotes] = useState('');
  const [updatedTitle, setUpdatedTitle] = useState(paper.title);
  const [updatedAbstract, setUpdatedAbstract] = useState(paper.abstract);
  const [updatedMethodology, setUpdatedMethodology] = useState(paper.researchMethodology || '');
  const [updatedFindings, setUpdatedFindings] = useState(paper.keyFindings || '');
  const [updatedConclusion, setUpdatedConclusion] = useState(paper.conclusion || '');

  // Notifications / Feedback
  const [citationFormat, setCitationFormat] = useState<'APA' | 'IEEE' | 'Harvard'>('APA');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [shared, setShared] = useState(false);
  const [uiFeedback, setUiFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [coverImgError, setCoverImgError] = useState(false);
  const [isEditingPaper, setIsEditingPaper] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileValidationResult, setProfileValidationResult] = useState<ProfileCompletenessResult | null>(null);

  const handleOpenEditModal = async () => {
    if (!user) {
      onSignIn();
      return;
    }
    setIsEditingPaper(true);
  };

  const handleDeleteDetailPaper = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDetailPaper = async () => {
    if (!isOwner) {
      triggerFeedback('Only the author who published this research can delete it.', 'error');
      setShowDeleteConfirm(false);
      return;
    }
    try {
      await deleteCustomPaper(paper.id, user?.uid, user?.email || undefined);
      triggerFeedback('Research paper permanently deleted.', 'success');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        onBack();
      }, 800);
    } catch (err) {
      console.error('Error deleting paper:', err);
      triggerFeedback('Failed to delete research paper.', 'error');
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveEditedDetailPaper = async (paperData: Omit<ResearchPaper, 'id'>) => {
    if (!isOwner) {
      triggerFeedback('Only the author who published this research can edit it.', 'error');
      return;
    }
    try {
      await updateCustomPaper(paper.id, paperData);
      setIsEditingPaper(false);
      triggerFeedback('Research paper updated successfully.', 'success');
      Object.assign(paper, paperData);
    } catch (err) {
      console.error('Error updating paper:', err);
      triggerFeedback('Failed to update research paper.', 'error');
    }
  };

  // Track paper.id that has been viewed to prevent infinite update loops
  const viewedPaperIdRef = useRef<string | null>(null);

  // Sync state and increment view count ONCE when paper.id changes
  useEffect(() => {
    setCoverImgError(false);
    setDownloadsCount(paper.downloadsCount ?? 0);
    setBookmarksCount(paper.bookmarksCount ?? 0);
    setVersions(paper.versions || [
      {
        id: 'v1.0',
        version: '1.0',
        title: paper.title,
        abstract: paper.abstract,
        publishedYear: paper.publishedYear,
        date: new Date().toISOString(),
        notes: 'Original published entry.'
      }
    ]);
    setContributions(paper.contributions || []);
    setComments(paper.comments || [
      {
        id: 'comment-1',
        userId: 'scholar-1',
        userEmail: 'adebayo@unilag.edu.ng',
        userName: 'Dr. Samuel Adebayo',
        content: 'Verified research methodologies and parameters for local environmental context.',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      }
    ]);
    setCurrentVersionData({
      title: paper.title,
      abstract: paper.abstract,
      subtitle: paper.subtitle || '',
      status: paper.status || 'Published',
      methodology: paper.researchMethodology || '',
      keyFindings: paper.keyFindings || '',
      conclusion: paper.conclusion || ''
    });
    setUpdatedTitle(paper.title);
    setUpdatedAbstract(paper.abstract);
    setUpdatedMethodology(paper.researchMethodology || '');
    setUpdatedFindings(paper.keyFindings || '');
    setUpdatedConclusion(paper.conclusion || '');

    setViewsCount(paper.viewsCount ?? 0);
    viewedPaperIdRef.current = paper.id;
  }, [paper.id]);

  // Handle version switching
  useEffect(() => {
    const selectedVer = versions.find(v => v.id === selectedVersionId);
    if (selectedVer) {
      setCurrentVersionData({
        title: selectedVer.title,
        abstract: selectedVer.abstract,
        subtitle: paper.subtitle || '',
        status: (selectedVer.status as any) || paper.status || 'Published',
        methodology: selectedVer.methodology || paper.researchMethodology || '',
        keyFindings: selectedVer.findings || paper.keyFindings || '',
        conclusion: selectedVer.conclusion || paper.conclusion || ''
      });
    }
  }, [selectedVersionId, versions, paper]);

  const triggerFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setUiFeedback({ msg, type });
    setTimeout(() => setUiFeedback(null), 4000);
  };

  const handleDownloadClick = async () => {
    try {
      await onDownload(paper);
      const newDownloads = downloadsCount + 1;
      setDownloadsCount(newDownloads);
      if (paper.isCustom) {
        updateCustomPaper(paper.id, { downloadsCount: newDownloads });
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleBookmarkClick = () => {
    const isAlreadySaved = isSaved;
    onSaveToggle();
    const newBookmarks = isAlreadySaved ? Math.max(0, bookmarksCount - 1) : bookmarksCount + 1;
    setBookmarksCount(newBookmarks);
    if (paper.isCustom) {
      updateCustomPaper(paper.id, { bookmarksCount: newBookmarks });
    }
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/#/research/${paper.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShared(true);
    triggerFeedback('Shareable link copied to clipboard!', 'success');
    setTimeout(() => setShared(false), 2000);
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }
    if (!newCommentText.trim()) return;

    const newComment: ResearchComment = {
      id: 'comment_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      userEmail: user.email || '',
      userName: user.displayName || 'Researcher Partner',
      content: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setNewCommentText('');
    triggerFeedback('Comment posted successfully.', 'success');

    if (paper.isCustom) {
      updateCustomPaper(paper.id, { comments: updatedComments });
    }
  };

  // Add Contribution
  const handleAddContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }
    if (!contributionExplanation.trim()) {
      triggerFeedback('Please provide a scientific explanation of your contribution.', 'error');
      return;
    }

    const newCont: ResearchContribution = {
      id: 'cont_' + Math.random().toString(36).substring(2, 9),
      userId: user.uid,
      userEmail: user.email || '',
      userName: user.displayName || 'Research Collaborator',
      type: contributionType,
      explanation: contributionExplanation.trim(),
      uploadedFiles: contributionFileName ? [{ name: contributionFileName, type: 'document', url: '#' }] : undefined,
      additionalNotes: contributionNotes.trim() || undefined,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const updatedConts = [...contributions, newCont];
    setContributions(updatedConts);
    setContributionExplanation('');
    setContributionNotes('');
    setContributionFileName('');
    setShowContributeForm(false);
    triggerFeedback('Contribution submitted to moderation queue!', 'success');

    if (paper.isCustom) {
      updateCustomPaper(paper.id, { contributions: updatedConts });
    }
  };

  // Moderate Contribution
  const handleModerateContribution = (contId: string, action: 'Accept' | 'Reject' | 'Changes Requested') => {
    let finalStatus: ResearchContribution['status'] = 'Pending';
    if (action === 'Accept') finalStatus = 'Accepted';
    if (action === 'Reject') finalStatus = 'Rejected';
    if (action === 'Changes Requested') finalStatus = 'Changes Requested';

    const updatedConts = contributions.map(c => {
      if (c.id === contId) {
        return { ...c, status: finalStatus };
      }
      return c;
    });

    setContributions(updatedConts);
    triggerFeedback(`Contribution status updated to: ${finalStatus}`, 'success');

    if (paper.isCustom) {
      updateCustomPaper(paper.id, { contributions: updatedConts });
    }
  };

  // Create Version Update
  const handleCreateVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionNotes.trim()) {
      triggerFeedback('Version updates require version description notes.', 'error');
      return;
    }

    const newVer: ResearchVersion = {
      id: 'v' + newVersionNum,
      version: newVersionNum,
      title: updatedTitle.trim(),
      abstract: updatedAbstract.trim(),
      publishedYear: new Date().getFullYear(),
      date: new Date().toISOString(),
      notes: versionNotes.trim(),
      methodology: updatedMethodology.trim() || undefined,
      findings: updatedFindings.trim() || undefined,
      conclusion: updatedConclusion.trim() || undefined,
      status: paper.status
    };

    const updatedVersions = [...versions, newVer];
    setVersions(updatedVersions);
    
    // Auto-update active paper content to this latest version!
    setCurrentVersionData({
      title: updatedTitle.trim(),
      abstract: updatedAbstract.trim(),
      subtitle: paper.subtitle || '',
      status: paper.status || 'Published',
      methodology: updatedMethodology.trim() || paper.researchMethodology || '',
      keyFindings: updatedFindings.trim() || paper.keyFindings || '',
      conclusion: updatedConclusion.trim() || paper.conclusion || ''
    });

    setSelectedVersionId(newVer.id);
    setVersionNotes('');
    setShowVersionForm(false);
    triggerFeedback(`New version ${newVersionNum} published successfully!`, 'success');

    if (paper.isCustom) {
      updateCustomPaper(paper.id, {
        title: updatedTitle.trim(),
        abstract: updatedAbstract.trim(),
        researchMethodology: updatedMethodology.trim() || undefined,
        keyFindings: updatedFindings.trim() || undefined,
        conclusion: updatedConclusion.trim() || undefined,
        versions: updatedVersions
      });
    }
  };

  // Simulated drag-and-drop supporting manual selection
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setContributionFileName(e.dataTransfer.files[0].name);
      triggerFeedback(`File attached: ${e.dataTransfer.files[0].name}`, 'success');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setContributionFileName(e.target.files[0].name);
      triggerFeedback(`File attached: ${e.target.files[0].name}`, 'success');
    }
  };

  // Auto citations
  const getFormattedCitation = () => {
    const author = paper.author;
    const year = paper.publishedYear;
    const title = currentVersionData.title;
    const doiStr = paper.doi || '10.5281/zenodo.4729104';

    if (citationFormat === 'APA') {
      return `${author}. (${year}). ${title}. Aurenix Research Scientific Repository. DOI: ${doiStr}`;
    } else if (citationFormat === 'IEEE') {
      return `[1] ${author}, "${title}," Aurenix Research Scientific Repository, ${year}. Available: ${window.location.origin}/#/research/${paper.id}. DOI: ${doiStr}.`;
    } else {
      return `${author} ${year}, '${title}', Aurenix Research Scientific Repository, DOI: ${doiStr}.`;
    }
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(getFormattedCitation());
    setCopiedCitation(true);
    triggerFeedback('Citation copied to clipboard!', 'success');
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  // Pre-seed some tabular survey datasets for high-fidelity interactive data explorer
  const dummyDatasetRows = [
    { id: 1, feedstock: 'Sorghum Silage', carbonRatio: '25.4%', nitrogenRatio: '1.2%', methaneYield: '345 l/kg', ph: '6.8' },
    { id: 2, feedstock: 'Dairy Manure Slurry', carbonRatio: '18.2%', nitrogenRatio: '1.5%', methaneYield: '180 l/kg', ph: '7.2' },
    { id: 3, feedstock: 'Lagos Market Food Waste', carbonRatio: '28.1%', nitrogenRatio: '0.9%', methaneYield: '410 l/kg', ph: '5.9' },
    { id: 4, feedstock: 'Cassava Starch Peelings', carbonRatio: '32.4%', nitrogenRatio: '0.6%', methaneYield: '495 l/kg', ph: '5.2' },
    { id: 5, feedstock: 'Poultry Litter Bedding', carbonRatio: '14.5%', nitrogenRatio: '3.1%', methaneYield: '140 l/kg', ph: '7.5' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-4 sm:py-8 lg:py-12 text-left" id="research_detail_page">
      
      {/* Toast Feedbacks */}
      <AnimatePresence>
        {uiFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
              uiFeedback.type === 'success' 
                ? 'bg-emerald-950 text-emerald-100 border-emerald-900' 
                : 'bg-red-950 text-red-100 border-red-900'
            }`}
          >
            {uiFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="text-xs font-bold font-sans">{uiFeedback.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
        
        {/* Draft Notice Banner if this paper is an incomplete draft */}
        {(paper.status === 'Draft' || paper.visibility === 'Private Draft' || (paper as any).isDraft) && (
          <div className="w-full bg-amber-50 border border-amber-200/90 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-950 shadow-xs">
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="p-2.5 bg-amber-100/80 rounded-xl text-amber-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-sm font-extrabold text-amber-950">Draft Research Entry</strong>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  This upload was saved as an incomplete draft. You can complete the wizard and publish it normally.
                </p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={handleOpenEditModal}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center justify-center gap-2"
              >
                <FileEdit className="w-4 h-4" />
                <span>Continue & Finish Upload</span>
              </button>
            )}
          </div>
        )}

        {/* Deep link Deep navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-5">
          <motion.button
            onClick={onBack}
            whileHover={{ x: -3 }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:text-emerald-800 rounded-xl shadow-xs text-sm font-semibold cursor-pointer border border-slate-200 w-full sm:w-auto"
            id="detail_back_to_repository"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 shrink-0" />
            Back to Repository
          </motion.button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* Save Button */}
            <motion.button
              onClick={handleBookmarkClick}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border shadow-xs ${
                isSaved
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
              {isSaved ? 'Bookmarked' : 'Bookmark'}
            </motion.button>

            {/* Share Button */}
            <motion.button
              onClick={handleShareClick}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              {shared ? 'Copied!' : 'Share'}
            </motion.button>

            {/* Download PDF */}
            <motion.button
              onClick={handleDownloadClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl text-xs font-extrabold shadow-md cursor-pointer border-0"
            >
              <Download className="w-4 h-4" />
              Download PDF ({downloadsCount})
            </motion.button>

            {/* Edit & Delete Buttons - strictly for the owner who published this research */}
            {isOwner && (
              <>
                <motion.button
                  onClick={handleOpenEditModal}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold cursor-pointer"
                  title="Edit Research Paper"
                >
                  <Edit3 className="w-4 h-4 text-emerald-700" />
                  Edit
                </motion.button>
                <motion.button
                  onClick={handleDeleteDetailPaper}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold cursor-pointer"
                  title="Delete Research Paper"
                >
                  <Trash className="w-4 h-4 text-rose-600" />
                  Delete
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Multi-version Hero Card resembling Google Scholar / IEEE Xplore */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-lg flex flex-col lg:flex-row items-stretch">
          
          {/* Cover Art Visual */}
          <div className="lg:w-1/4 bg-emerald-950 p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(#065f46_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl" />
            
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-2 py-1 border border-emerald-900/60 rounded-md inline-block">
                INDEX CLASSIFICATION
              </span>
              <div className="w-full aspect-3/4 max-w-[200px] sm:max-w-none mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-inner overflow-hidden relative">
                {(() => {
                  const rawCover = paper.uploads?.coverImage || (paper as any).coverImage;
                  const isValidCover = rawCover && !coverImgError && (
                    rawCover.startsWith('data:') || 
                    rawCover.startsWith('http://') || 
                    rawCover.startsWith('https://') || 
                    rawCover.startsWith('blob:') || 
                    rawCover.startsWith('/')
                  );

                  if (isValidCover) {
                    return (
                      <img
                        src={rawCover}
                        alt={paper.title}
                        className="w-full h-full object-cover rounded-2xl"
                        referrerPolicy="no-referrer"
                        onError={() => setCoverImgError(true)}
                      />
                    );
                  }

                  return (
                    <div className="p-4 sm:p-5 flex flex-col justify-between h-full w-full">
                      <FileText className="w-8 h-8 text-emerald-500" />
                      <div className="space-y-1">
                        <div className="h-1 w-1/3 bg-emerald-700 rounded" />
                        <div className="h-1 w-2/3 bg-slate-700 rounded" />
                        <p className="text-[9px] font-mono font-bold text-slate-500 mt-2 truncate">
                          {rawCover ? `FILE: ${rawCover}` : `BNE-JOURNAL-${paper.publishedYear}`}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="relative z-10 pt-4 sm:pt-6 space-y-1">
              <p className="text-[10px] font-mono text-emerald-400 font-extrabold">DOI ID:</p>
              <p className="text-[9px] font-mono text-slate-500 font-bold tracking-tight select-all break-all">{paper.doi || '10.5281/zenodo.4729104'}</p>
            </div>
          </div>

          {/* Academic Meta-information Block */}
          <div className="flex-1 p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Layers className="w-48 h-48 text-emerald-500" />
            </div>

            <div className="space-y-5 sm:space-y-6 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {paper.category}
                </span>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-[10px] font-bold font-mono">
                  VER: {selectedVersionId.replace('v', '')}
                </span>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-[10px] font-bold">
                  {currentVersionData.status}
                </span>
                {paper.isCustom && (
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-[10px] font-bold">
                    User Contribution
                  </span>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-display font-extrabold text-white leading-tight tracking-tight">
                  {currentVersionData.title}
                </h1>
                {currentVersionData.subtitle && (
                  <p className="text-xs sm:text-sm font-semibold text-emerald-400/80 font-sans">{currentVersionData.subtitle}</p>
                )}
              </div>

              {/* Author & Affiliation Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pt-4 border-t border-slate-800">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 font-bold uppercase">Lead Researcher</p>
                  <p className="text-xs text-white font-extrabold">{paper.leadResearcher || paper.author}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 font-bold uppercase">Affiliated Institution</p>
                  <p className="text-xs text-slate-300 font-bold">{paper.institution || 'Aurenix Research Network'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 font-bold uppercase">Location / Territory</p>
                  <p className="text-xs text-slate-300 font-bold">{paper.country || 'Global West Africa'}</p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Indicators Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-slate-800/60 mt-5 sm:mt-6 max-w-full w-full">
              <div className="flex items-center gap-1.5 shrink-0">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono text-slate-300"><strong>{viewsCount}</strong> views</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Download className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono text-slate-300"><strong>{downloadsCount}</strong> downloads</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Bookmark className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono text-slate-300"><strong>{bookmarksCount}</strong> bookmarks</span>
              </div>

              {isOwner && (
                <div className="flex-grow flex justify-end gap-2 shrink-0 w-full sm:w-auto">
                  {/* Create Version Button */}
                  <button
                    onClick={() => setShowVersionForm(!showVersionForm)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer border-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    Publish Update
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OWNER AND MODERATION PANEL (Inline forms) */}
        <AnimatePresence>
          {showVersionForm && isOwner && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 font-display">Create a New Version (Update Research)</h4>
                </div>
                <button 
                  onClick={() => setShowVersionForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs border-0 bg-transparent cursor-pointer font-bold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateVersionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Version Number</label>
                    <input 
                      type="text" 
                      required
                      value={newVersionNum}
                      onChange={(e) => setNewVersionNum(e.target.value)}
                      placeholder="e.g. 1.1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Version Update Title</label>
                    <input 
                      type="text" 
                      required
                      value={updatedTitle}
                      onChange={(e) => setUpdatedTitle(e.target.value)}
                      placeholder="Title of paper"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Abstract Summary Update</label>
                    <textarea 
                      rows={3}
                      required
                      value={updatedAbstract}
                      onChange={(e) => setUpdatedAbstract(e.target.value)}
                      placeholder="Revised Abstract..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Methodology Update (Optional)</label>
                    <textarea 
                      rows={3}
                      value={updatedMethodology}
                      onChange={(e) => setUpdatedMethodology(e.target.value)}
                      placeholder="Revised methodology details..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Findings Update (Optional)</label>
                    <textarea 
                      rows={3}
                      value={updatedFindings}
                      onChange={(e) => setUpdatedFindings(e.target.value)}
                      placeholder="Revised findings..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white resize-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Version Notes <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={versionNotes}
                      onChange={(e) => setVersionNotes(e.target.value)}
                      placeholder="e.g. Revised molecular loading coefficients for anaerobic digestion to align with latest empirical survey models."
                      className="w-full px-3 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-semibold outline-none focus:bg-white text-emerald-950 placeholder-emerald-800/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-md border-0 cursor-pointer"
                  >
                    Publish Version Update
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUTHOR MODERATION QUEUE FOR PENDING CONTRIBUTIONS */}
        {isOwner && contributions.some(c => c.status === 'Pending') && (
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-left space-y-4">
            <div className="flex items-center gap-2.5 border-b border-amber-200 pb-2.5">
              <Shield className="w-5 h-5 text-amber-700" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-950 font-display">Moderation Queue — Pending Study Contributions</h4>
                <p className="text-[10px] text-amber-800">Review and accept/reject submissions made by other research scientists to this study.</p>
              </div>
            </div>

            <div className="space-y-4.5">
              {contributions.filter(c => c.status === 'Pending').map((cont) => (
                <div key={cont.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-extrabold uppercase rounded">{cont.type}</span>
                        <h5 className="text-xs font-extrabold text-slate-900">{cont.userName}</h5>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{cont.userEmail}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Submitted {new Date(cont.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Moderation Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleModerateContribution(cont.id, 'Accept')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-extrabold border-0 cursor-pointer transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleModerateContribution(cont.id, 'Changes Requested')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-extrabold border-0 cursor-pointer transition-colors"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleModerateContribution(cont.id, 'Reject')}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-extrabold border-0 cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 text-slate-700 text-xs leading-relaxed font-sans border border-slate-100">
                    <p className="font-extrabold text-[10px] uppercase text-slate-400 font-mono">Explanation:</p>
                    <p>{cont.explanation}</p>
                  </div>

                  {cont.uploadedFiles && cont.uploadedFiles.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Attached File: {cont.uploadedFiles[0].name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-1 bg-white p-1 rounded-2xl shadow-xs shrink-0">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'methodology', label: 'Methodology', icon: Award },
            { id: 'results', label: 'Results & Charts', icon: BarChart3 },
            { id: 'discussion', label: 'Discussion', icon: FileText },
            { id: 'references', label: 'References', icon: Clipboard },
            { id: 'datasets', label: 'Datasets', icon: Link2 },
            { id: 'contributors', label: 'Contributors', icon: Users },
            { id: 'comments', label: 'Scholarly Reviews', icon: MessageSquare },
            { id: 'versions', label: 'Version History', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 flex items-center gap-2 shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-emerald-700 text-white shadow-xs font-extrabold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Core Screen Layout Grid split into content column and sidebar metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start text-left">
          
          {/* Main Tab Content Column */}
          <div className="lg:col-span-8 space-y-6">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + '_' + selectedVersionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100"
              >
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Executive Abstract
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed font-sans italic bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/50">
                        "{currentVersionData.abstract}"
                      </p>
                    </div>

                    {/* Rest of step-entered fields if paper is custom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      
                      {/* Objectives */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Research Objectives</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
                          {paper.objectives || `Investigate key parameters and experimental variables for ${paper.title.toLowerCase()} to optimize system performance.`}
                        </p>
                      </div>

                      {/* Problem Statement */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Problem Statement</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
                          {paper.problemStatement || `Addressing challenges in ${paper.category || 'bioenergy systems'} requires rigorous investigation of process efficiency and field metrics.`}
                        </p>
                      </div>

                      {/* Research Questions */}
                      {paper.researchQuestions && (
                        <div className="space-y-2 sm:col-span-2">
                          <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Research Questions</h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">{paper.researchQuestions}</p>
                        </div>
                      )}

                      {/* Material Metas */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Materials Used</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{paper.materialsUsed || 'Standard laboratory analytical instrumentation and experimental field samples.'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Data Collection Method</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{paper.dataCollectionMethod || 'Empirical sampling, digital telemetry logging, and analytical measurements.'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Study Area</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{paper.studyArea || (paper.country ? `${paper.institution || 'Research Center'}, ${paper.country}` : 'Global Research Network')}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Duration</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{paper.durationOfResearch || `${paper.publishedYear || '2025'} Research Cycle`}</p>
                      </div>
                    </div>

                    {paper.keywords && paper.keywords.length > 0 && (
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono uppercase mr-1">Keywords:</span>
                        {paper.keywords.map(kw => (
                          <span key={kw} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. METHODOLOGY TAB */}
                {activeTab === 'methodology' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Award className="w-5 h-5 text-emerald-600" />
                      Engineering & Technical Methodology
                    </h3>
                    
                    {currentVersionData.methodology ? (
                      <div className="text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        {currentVersionData.methodology}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-600">The chemical and mechanical experimental process was executed across the following strict sequence:</p>
                        <ol className="space-y-4">
                          {[
                            'Acclimated bacterial inoculum extracted from dairy bio-reactors, incubated at a mesophilic 37°C.',
                            'Continuous measurement of volatile fatty acids (VFAs) to prevent acidity levels from breaching safety thresholds.',
                            'Gas chromatography mapping to isolate hydrogen sulfide (H₂S) and carbon dioxide from the primary methane yield.'
                          ].map((step, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-mono font-extrabold text-xs shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. RESULTS & CHARTS TAB */}
                {activeTab === 'results' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                      Empirical Data & Findings
                    </h3>

                    {/* Key Findings Card */}
                    {(currentVersionData.keyFindings || paper.keyFindings) && (
                      <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 text-slate-800 space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Key Research Findings
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-wrap">
                          {currentVersionData.keyFindings || paper.keyFindings}
                        </p>
                      </div>
                    )}

                    {/* Simulation Graph */}
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 font-semibold">Empirical / Process Performance Simulation Plot:</p>
                      
                      <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase">PROCESS YIELD PERFORMANCE MATRIX</span>
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[9px] font-bold rounded">Active Analysis</span>
                        </div>

                        {/* Interactive SVG simulation plot */}
                        <div className="relative h-44 w-full flex items-end justify-between px-6 pt-4">
                          {/* Grid horizontal lines */}
                          <div className="absolute inset-x-0 top-1/4 border-t border-slate-800/50" />
                          <div className="absolute inset-x-0 top-2/4 border-t border-slate-800/50" />
                          <div className="absolute inset-x-0 top-3/4 border-t border-slate-800/50" />

                          {/* Render columns representing methane purity */}
                          {[
                            { day: 'Phase 1', val: 18, label: '18%' },
                            { day: 'Phase 2', val: 42, label: '42%' },
                            { day: 'Phase 3', val: 68, label: '68%' },
                            { day: 'Phase 4', val: 78, label: '78%' },
                            { day: 'Phase 5', val: 84, label: '84%' }
                          ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 w-12 z-10 group/bar">
                              <span className="text-[9px] font-mono text-emerald-300 font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 px-1 rounded-sm border border-slate-800">
                                {item.label}
                              </span>
                              <div 
                                style={{ height: `${item.val * 1.5}px` }}
                                className="w-6 rounded-t-md bg-emerald-600 group-hover/bar:bg-emerald-400 transition-all duration-200 shadow-md shadow-emerald-700/15"
                              />
                              <span className="text-[9px] font-mono text-slate-500">{item.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DISCUSSION TAB */}
                {activeTab === 'discussion' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      Scholarly Discussion & Conclusion
                    </h3>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Discussion</h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                          {paper.discussion || 'The experimental data demonstrates consistent operational stability under optimized stoichiometric ratios, reducing inhibitory volatile accumulation and maximizing throughput efficiency.'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Conclusion</h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                          {currentVersionData.conclusion || paper.conclusion || 'Modular bioenergy implementation provides a scalable, sustainable approach to regional energy transition and decentralized power grid enhancement.'}
                        </p>
                      </div>

                      {paper.recommendations && (
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Recommendations</h4>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                            {paper.recommendations}
                          </p>
                        </div>
                      )}

                      {paper.futureResearch && (
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Future Research Trajectory</h4>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                            {paper.futureResearch}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. REFERENCES TAB */}
                {activeTab === 'references' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                        <Clipboard className="w-5 h-5 text-emerald-600" />
                        APA, IEEE, & Harvard Citations
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Select Standard */}
                      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-extrabold max-w-sm">
                        {(['APA', 'IEEE', 'Harvard'] as const).map(format => (
                          <button
                            key={format}
                            onClick={() => setCitationFormat(format)}
                            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                              citationFormat === format 
                                ? 'bg-white text-emerald-800 shadow-xs font-extrabold' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {format}
                          </button>
                        ))}
                      </div>

                      {/* Reference box */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group text-left">
                        <p className="text-xs font-mono text-slate-700 leading-relaxed select-all">
                          {getFormattedCitation()}
                        </p>
                      </div>

                      <button
                        onClick={handleCopyCitation}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border-0 cursor-pointer"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        {copiedCitation ? 'Copied Citation!' : 'Copy Citation to Clipboard'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. DATASETS & FILES TAB */}
                {activeTab === 'datasets' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Link2 className="w-5 h-5 text-emerald-600" />
                      Uploaded Documents & Datasets
                    </h3>

                    {/* Show attached files from paper.uploads */}
                    {paper.uploads && (
                      <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-500">Attached Research Artifacts</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {paper.uploads.pdf && (
                            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <div>
                                  <p className="text-xs font-bold text-slate-900">Main PDF Document</p>
                                  <p className="text-[10px] text-slate-400 font-mono">PDF File</p>
                                </div>
                              </div>
                              <a
                                href={paper.uploads.pdf}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold no-underline"
                              >
                                Download PDF
                              </a>
                            </div>
                          )}

                          {paper.uploads.coverImage && (
                            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                              <img src={paper.uploads.coverImage} alt="Cover" className="w-10 h-10 object-cover rounded" />
                              <div>
                                <p className="text-xs font-bold text-slate-900">Cover Image</p>
                                <p className="text-[10px] text-slate-400 font-mono">Image Asset</p>
                              </div>
                            </div>
                          )}

                          {paper.uploads.datasets && (Array.isArray(paper.uploads.datasets) ? paper.uploads.datasets : [paper.uploads.datasets]).map((f, i) => (
                            <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-emerald-600" />
                                <p className="text-xs font-bold text-slate-900">Dataset File #{i + 1}</p>
                              </div>
                              <a href={f} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-bold hover:underline">View</a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 font-semibold">Scholarly Dataset Reference Table:</p>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                      <table className="w-full text-xs text-slate-700 text-left">
                        <thead className="bg-slate-100 font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Feedstock / Variable</th>
                            <th className="p-3">Carbon (C)</th>
                            <th className="p-3">Nitrogen (N)</th>
                            <th className="p-3">Process Yield</th>
                            <th className="p-3">Optimal pH</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {dummyDatasetRows.map(row => (
                            <tr key={row.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-extrabold text-slate-900">{row.feedstock}</td>
                              <td className="p-3 font-mono">{row.carbonRatio}</td>
                              <td className="p-3 font-mono">{row.nitrogenRatio}</td>
                              <td className="p-3 font-mono text-emerald-800 font-bold">{row.methaneYield}</td>
                              <td className="p-3 font-mono">{row.ph}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 7. CONTRIBUTORS TAB */}
                {activeTab === 'contributors' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        Verified Authors & Contributors
                      </h3>

                      {!showContributeForm && (
                        <button
                          onClick={() => user ? setShowContributeForm(true) : onSignIn()}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 border-0 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Contribute to Study
                        </button>
                      )}
                    </div>

                    {/* Show Contribution submission form if requested */}
                    {showContributeForm && (
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                            <Plus className="w-4 h-4 text-emerald-600" />
                            Submit a Study Contribution
                          </h4>
                          <button
                            onClick={() => setShowContributeForm(false)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer font-bold"
                          >
                            Cancel
                          </button>
                        </div>

                        <form onSubmit={handleAddContributionSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Contribution Type</label>
                              <select 
                                value={contributionType}
                                onChange={(e) => setContributionType(e.target.value as any)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              >
                                <option value="Suggest Edit">Suggest Edit / Typo Correction</option>
                                <option value="Add Data">Add Survey / Stoichiometric Data</option>
                                <option value="Upload Supporting Document">Upload Supporting File (PDF/Excel)</option>
                                <option value="Add Reference">Add Citation Reference</option>
                                <option value="Join as Collaborator">Join Research Team as Partner</option>
                                <option value="Peer Review">Scholarly Peer Review</option>
                                <option value="Report an Error">Report Mathematical / Process Error</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Your Affiliation / Author name</label>
                              <input 
                                type="text"
                                required
                                disabled
                                value={user?.displayName || 'Registered Scholar'}
                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 outline-none"
                              />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Scientific Explanation of Contribution <span className="text-red-500">*</span></label>
                              <textarea 
                                rows={3}
                                required
                                value={contributionExplanation}
                                onChange={(e) => setContributionExplanation(e.target.value)}
                                placeholder="State clearly the equations corrected, variables appended, or dataset files uploaded..."
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 resize-none font-sans"
                              />
                            </div>

                            {/* Drag-and-drop manual file upload element */}
                            <div className="sm:col-span-2 space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Upload Supporting File</label>
                              <div 
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-1.5"
                              >
                                <Upload className="w-5 h-5 text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-700">
                                  {contributionFileName ? contributionFileName : 'Drag Supporting document here, or click to choose'}
                                </span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  id="contribution-upload-file-input"
                                  onChange={handleFileChange} 
                                />
                                <label htmlFor="contribution-upload-file-input" className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 text-slate-600 font-bold cursor-pointer">
                                  Choose File
                                </label>
                              </div>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Additional Collaboration Notes</label>
                              <input 
                                type="text"
                                value={contributionNotes}
                                onChange={(e) => setContributionNotes(e.target.value)}
                                placeholder="e.g. Seeking permissions to integrate full bioreactor telemetry logs."
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold border-0 cursor-pointer"
                            >
                              Submit Contribution
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Authors and co-authors cards */}
                    <div className="space-y-4">
                      {/* Primary author */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-extrabold uppercase rounded">Lead Researcher</span>
                            <span className="text-sm font-extrabold text-slate-900">{paper.leadResearcher || paper.author}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold mt-1">
                            {paper.institution || 'BioEnergy Nexus Network'}{paper.department ? ` • ${paper.department}` : ''}{paper.country ? ` (${paper.country})` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {paper.orcid && (
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                              ORCID: {paper.orcid}
                            </span>
                          )}
                          {paper.googleScholar && (
                            <a href={paper.googleScholar} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-700 hover:underline font-bold">
                              Google Scholar ↗
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Co Authors */}
                      {paper.coAuthors && paper.coAuthors.map((co, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded">Co-Author</span>
                              <span className="text-sm font-extrabold text-slate-900">{co.name}</span>
                            </div>
                            <p className="text-xs text-slate-600 font-semibold mt-1">
                              {co.institution || 'Affiliated Institution'}{co.department ? ` • ${co.department}` : ''}{co.country ? ` (${co.country})` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {co.orcid && (
                              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                ORCID: {co.orcid}
                              </span>
                            )}
                            {co.scholar && (
                              <a href={co.scholar} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-700 hover:underline font-bold">
                                Scholar ↗
                              </a>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Accepted contributors */}
                      {contributions.filter(c => c.status === 'Accepted').map((cont) => (
                        <div key={cont.id} className="p-4 bg-emerald-50/20 rounded-2xl border border-emerald-100 flex items-center justify-between animate-in fade-in">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded">Contributor</span>
                              <span className="text-sm font-extrabold text-emerald-950">{cont.userName}</span>
                            </div>
                            <p className="text-[10px] text-emerald-800 mt-1">
                              Contributed: <strong>{cont.type}</strong>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. COMMENTARY & REVIEWS TAB */}
                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-display font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                      Scholarly Commentary & Reviews ({comments.length})
                    </h3>

                    <div className="space-y-5">
                      {comments.map(c => (
                        <div key={c.id} className="p-4.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                                {c.userName.charAt(0)}
                              </div>
                              <span className="text-xs font-extrabold text-slate-900">{c.userName}</span>
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">{c.userEmail}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed font-sans">{c.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Review Commentary form */}
                    <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
                      <textarea
                        rows={3}
                        required
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder={user ? "Write an academic review, parameter comment, or verification log..." : "Sign in to write an academic comment..."}
                        className="w-full p-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-xs outline-none font-sans resize-none shadow-xs"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-md border-0 cursor-pointer"
                        >
                          Post Review Entry
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 9. VERSIONS HISTORY TAB */}
                {activeTab === 'versions' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-display font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                      Version Control & Change Registry
                    </h3>

                    <p className="text-xs text-slate-500">Every study revision triggers an immutable registry entry. Switch between versions to view research diff progressions:</p>

                    <div className="space-y-4">
                      {versions.map((ver) => (
                        <div 
                          key={ver.id} 
                          onClick={() => setSelectedVersionId(ver.id)}
                          className={`p-4.5 rounded-2xl border flex items-start justify-between gap-4 cursor-pointer transition-all ${
                            selectedVersionId === ver.id 
                              ? 'bg-emerald-50/50 border-emerald-500 shadow-xs' 
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                selectedVersionId === ver.id ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                v{ver.version}
                              </span>
                              <h4 className="text-xs font-extrabold text-slate-950 leading-tight">{ver.title}</h4>
                            </div>
                            <p className="text-[10px] text-emerald-800 font-semibold">{ver.notes}</p>
                            <p className="text-[10px] text-slate-400">Published {new Date(ver.date).toLocaleDateString()}</p>
                          </div>

                          {selectedVersionId === ver.id && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded shrink-0">
                              Viewing Active
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column Sidebar: References & Practical Integration Call-to-actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Citations Widget */}
            <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Quick Citation
              </h4>

              <div className="space-y-3">
                {/* Citations standards */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-extrabold">
                  {(['APA', 'IEEE', 'Harvard'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setCitationFormat(format)}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer border-0 ${
                        citationFormat === format 
                          ? 'bg-white text-emerald-800 shadow-xs font-extrabold' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] font-mono text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-left select-all">
                  {getFormattedCitation()}
                </p>

                <button
                  onClick={handleCopyCitation}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border-0 cursor-pointer"
                >
                  <Clipboard className="w-4.5 h-4.5" />
                  {copiedCitation ? 'Citation Copied!' : 'Copy Reference'}
                </button>
              </div>
            </div>

            {/* Practical integration call-to-action */}
            <div className="bg-emerald-950 text-emerald-100 p-6 rounded-3xl space-y-4 shadow-sm border border-emerald-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-800/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest">IMPLEMENTATION</span>
              </div>

              <h4 className="text-sm font-display font-black leading-snug text-white">
                Bespoke Feasibility Advisory
              </h4>

              <p className="text-[11px] text-emerald-200/80 leading-relaxed font-sans">
                The Aurenix Research scientific team provides direct engineering consulting, waste feedstock audits, and professional training to implement sustainable reactors.
              </p>

              <div className="pt-2 border-t border-emerald-900 flex items-start gap-2 text-[10px] text-emerald-300 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>Submit an organic advisory inquiry under the <strong>Advisory Services</strong> menu.</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {isEditingPaper && (
        <div className="fixed inset-0 z-50 overflow-y-auto py-6 sm:py-10 px-3 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 text-left" id="publish_wizard_full_workspace" style={{ backgroundColor: '#e7e7e7' }}>
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            
            {/* Top Navigation & Workspace Breadcrumb Bar */}
            <div className="flex items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 shadow-xs border-slate-200" style={{ backgroundColor: '#ffffff', borderWidth: '1px', borderRadius: '5px' }}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingPaper(false)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600" />
                  Cancel Editing
                </button>
                <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Aurenix Scientific Portal</span>
                  <span>/</span>
                  <span className="text-emerald-700 font-extrabold">Edit Published Research</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg" style={{ backgroundColor: '#034a3e' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DOI Edit Sandbox
                </span>
              </div>
            </div>

            {/* Main Publish Wizard Container */}
            <PublishWizard
              initialData={paper}
              onClose={() => setIsEditingPaper(false)}
              onSubmit={handleSaveEditedDetailPaper}
              userProfile={propUserProfile}
              onNavigateToProfile={onNavigateToProfile}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Permanently Delete Research?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete this research paper? This action cannot be undone, or you can keep the research.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl text-xs transition cursor-pointer"
              >
                Keep Research
              </button>
              <button
                type="button"
                onClick={confirmDeleteDetailPaper}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Profile Completion Blocking Modal */}
      {showProfileModal && profileValidationResult && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          missingFields={profileValidationResult.missingFields}
          completionPercent={profileValidationResult.completionPercent}
          onNavigateToProfile={() => {
            setShowProfileModal(false);
            if (onNavigateToProfile) onNavigateToProfile();
            else window.location.hash = '#/profile';
          }}
        />
      )}
    </div>
  );
}
