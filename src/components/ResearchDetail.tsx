import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bookmark, Download, Share2, Clipboard, Check, Sparkles, Send, 
  Trash, Edit3, Award, Info, BookOpen, Layers, BarChart3, MessageSquare, 
  CheckCircle2, AlertCircle, Users, Link2, FileText, Plus, Shield, RefreshCw, Eye,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResearchPaper, ResearchContribution, ResearchComment, ResearchVersion } from '../types';
import { updateCustomPaper } from '../services/db';
import { User as FirebaseUser } from 'firebase/auth';

interface ResearchDetailProps {
  paper: ResearchPaper;
  onBack: () => void;
  isSaved: boolean;
  onSaveToggle: () => void;
  onDownload: (paper: ResearchPaper) => void;
  user: FirebaseUser | null;
  onSignIn: () => void;
}

export default function ResearchDetail({
  paper,
  onBack,
  isSaved,
  onSaveToggle,
  onDownload,
  user,
  onSignIn
}: ResearchDetailProps) {
  // Counts & view triggers
  const [viewsCount, setViewsCount] = useState(paper.viewsCount || Math.floor(180 + Math.random() * 120));
  const [downloadsCount, setDownloadsCount] = useState(paper.downloadsCount || Math.floor(40 + Math.random() * 40));
  const [bookmarksCount, setBookmarksCount] = useState(paper.bookmarksCount || Math.floor(15 + Math.random() * 20));

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

  // Track if current user is owner (or enable always in demo mode to allow full workflow testing)
  const isOwner = paper.isCustom && (paper.userId === user?.uid || localStorage.getItem('nexus_demo_mode') === 'true');

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
  const [comments, setComments] = useState<ResearchComment[]>(paper.comments || [
    {
      id: 'comment-1',
      userId: 'scholar-1',
      userEmail: 'adebayo@unilag.edu.ng',
      userName: 'Dr. Samuel Adebayo',
      content: 'Remarkably rigorous chemical parameters for the anaerobic mesophilic reactors. Our UNILAG research team verified the co-digestion carbon-to-nitrogen ratios in local conditions and achieved matching volatile acid stabilities.',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    }
  ]);

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

  // Auto-increment views count on mount
  useEffect(() => {
    const incViews = viewsCount + 1;
    setViewsCount(incViews);
    if (paper.isCustom) {
      updateCustomPaper(paper.id, { viewsCount: incViews });
    }
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

  const handleDownloadClick = () => {
    const newDownloads = downloadsCount + 1;
    setDownloadsCount(newDownloads);
    onDownload(paper);
    if (paper.isCustom) {
      updateCustomPaper(paper.id, { downloadsCount: newDownloads });
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
    <div className="bg-slate-50 min-h-screen py-12 text-left" id="research_detail_page">
      
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Deep link Deep navigation bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <motion.button
            onClick={onBack}
            whileHover={{ x: -3 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:text-emerald-800 rounded-xl shadow-xs text-sm font-semibold cursor-pointer border border-slate-200"
            id="detail_back_to_repository"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 shrink-0" />
            Back to Repository
          </motion.button>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Save Button */}
            <motion.button
              onClick={handleBookmarkClick}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border shadow-xs ${
                isSaved
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
              {isSaved ? 'Bookmarked' : 'Bookmark Study'}
            </motion.button>

            {/* Share Button */}
            <motion.button
              onClick={handleShareClick}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              {shared ? 'Link Copied!' : 'Share'}
            </motion.button>

            {/* Download PDF */}
            <motion.button
              onClick={handleDownloadClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl text-xs font-extrabold shadow-md cursor-pointer border-0"
            >
              <Download className="w-4 h-4" />
              Download PDF ({downloadsCount})
            </motion.button>
          </div>
        </div>

        {/* Dynamic Multi-version Hero Card resembling Google Scholar / IEEE Xplore */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-lg flex flex-col md:flex-row items-stretch">
          
          {/* Cover Art Visual */}
          <div className="md:w-1/4 bg-emerald-950 p-8 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(#065f46_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl" />
            
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-2 py-1 border border-emerald-900/60 rounded-md">
                INDEX CLASSIFICATION
              </span>
              <div className="w-full aspect-3/4 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-inner">
                <FileText className="w-8 h-8 text-emerald-500" />
                <div className="space-y-1">
                  <div className="h-1 w-1/3 bg-emerald-700 rounded" />
                  <div className="h-1 w-2/3 bg-slate-700 rounded" />
                  <p className="text-[9px] font-mono font-bold text-slate-500 mt-2">BNE-JOURNAL-{paper.publishedYear}</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 space-y-2">
              <p className="text-[10px] font-mono text-emerald-400 font-extrabold">DOI ID:</p>
              <p className="text-[9px] font-mono text-slate-500 font-bold tracking-tight select-all">{paper.doi || '10.5281/zenodo.4729104'}</p>
            </div>
          </div>

          {/* Academic Meta-information Block */}
          <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Layers className="w-48 h-48 text-emerald-500" />
            </div>

            <div className="space-y-6 relative z-10">
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

              <div className="space-y-3">
                <h1 className="text-xl sm:text-3xl font-display font-extrabold text-white leading-tight tracking-tight">
                  {currentVersionData.title}
                </h1>
                {currentVersionData.subtitle && (
                  <p className="text-xs sm:text-sm font-semibold text-emerald-400/80 font-sans">{currentVersionData.subtitle}</p>
                )}
              </div>

              {/* Author & Affiliation Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-4 border-t border-slate-800">
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
            <div className="flex items-center gap-6 pt-6 border-t border-slate-800/60 mt-6 overflow-x-auto">
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
                <div className="flex-grow flex justify-end gap-2 shrink-0">
                  {/* Create Version Button */}
                  <button
                    onClick={() => setShowVersionForm(!showVersionForm)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer border-0"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* Main Tab Content Column */}
          <div className="lg:col-span-8 space-y-6">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + '_' + selectedVersionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-100"
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
                          {paper.objectives || 'Identify stoichiometric process variables in tropical digesters to maximize net methane purity.'}
                        </p>
                      </div>

                      {/* Problem Statement */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Problem Statement</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
                          {paper.problemStatement || 'Decentralized energy grids in Sub-Saharan Africa lack verified feedstock loading matrices, leading to anaerobic digester acidification.'}
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
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{paper.materialsUsed || 'Acclimated mesophilic dairy bacteria inoculum, GC-TCD chromatographs.'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Data Collection Method</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{paper.dataCollectionMethod || 'Gas chromatography, process carbon telemetry logging.'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Study Area</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{paper.studyArea || 'Lagos mainland suburbs, Nigeria.'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Duration</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{paper.durationOfResearch || '12 months (2024 - 2025).'}</p>
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
                      Empirical Data & Chemical Process Simulation
                    </h3>

                    {/* Gorgeous custom SVG interactive yield chart instead of Recharts */}
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">Methane Concentration (%) over Anaerobic digestion Timeline (Days):</p>
                      
                      <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase">TROPICAL ANAEROBIC REACTION GRAPH</span>
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[9px] font-bold rounded">Simulation Active</span>
                        </div>

                        {/* Interactive SVG simulation plot */}
                        <div className="relative h-44 w-full flex items-end justify-between px-6 pt-4">
                          {/* Grid horizontal lines */}
                          <div className="absolute inset-x-0 top-1/4 border-t border-slate-800/50" />
                          <div className="absolute inset-x-0 top-2/4 border-t border-slate-800/50" />
                          <div className="absolute inset-x-0 top-3/4 border-t border-slate-800/50" />

                          {/* Render columns representing methane purity */}
                          {[
                            { day: 'Day 1', val: 12, label: '12%' },
                            { day: 'Day 5', val: 35, label: '35%' },
                            { day: 'Day 10', val: 58, label: '58%' },
                            { day: 'Day 15', val: 62, label: '62%' },
                            { day: 'Day 20', val: 63, label: '63%' }
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

                    <div className="p-4 bg-emerald-50/50 text-emerald-950 border border-emerald-100 rounded-2xl text-xs space-y-1">
                      <p className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Chemical Equilibrium reached:
                      </p>
                      <p className="leading-relaxed text-slate-700 font-sans">
                        Methane yield stabilized at 62.4% following a mesophilic acclimation lag phase of 12 days, exhibiting stable anaerobic buffering under Organic Loading Rates of 3.2 kg VS/m³/day.
                      </p>
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
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          {paper.discussion || 'Co-digesting poultry litter and fruit wastes optimized the Carbon-to-Nitrogen ratios. This offsets nitrogen accumulation, preventing ammonia inhibition within the methanogenic phase.'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Conclusion</h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                          {currentVersionData.conclusion || 'Modular 250 kW bioenergy grids represent a financially lucrative, decentralized replacement for diesel electricity, lowering localized waste logistics overheads by 45%.'}
                        </p>
                      </div>
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

                {/* 6. DATASETS TAB */}
                {activeTab === 'datasets' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Link2 className="w-5 h-5 text-emerald-600" />
                      Scholarly Dataset Tables
                    </h3>

                    <p className="text-xs text-slate-500">The empirical feedstock audits utilized to seed biochemical turbine yield modeling:</p>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                      <table className="w-full text-xs text-slate-700 text-left">
                        <thead className="bg-slate-100 font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Feedstock Type</th>
                            <th className="p-3">Carbon (C)</th>
                            <th className="p-3">Nitrogen (N)</th>
                            <th className="p-3">Methane Yield</th>
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
                      {/* Primary authors */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-extrabold uppercase rounded">Principal</span>
                            <span className="text-sm font-extrabold text-slate-900">{paper.leadResearcher || paper.author}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">
                            {paper.institution || 'Aurenix Research Research Associate'} • {paper.department || 'Process Chemistry'}
                          </p>
                        </div>
                        {paper.orcid && (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                            ORCID: {paper.orcid}
                          </span>
                        )}
                      </div>

                      {/* Co Authors */}
                      {paper.coAuthors && paper.coAuthors.map((co, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded">Co-author</span>
                              <span className="text-sm font-extrabold text-slate-900">{co.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1">
                              {co.institution || 'Aurenix Research Affiliation'} • {co.department || 'Mechanical Engineering'}
                            </p>
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
    </div>
  );
}
