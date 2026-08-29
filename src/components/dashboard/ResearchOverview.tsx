import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { ResearchPaper } from '../../types';
import { RESEARCH_PAPERS } from '../../data';
import { 
  FileText, 
  UploadCloud, 
  Clock, 
  FileEdit, 
  Hourglass, 
  Eye, 
  Tag, 
  Calendar,
  Loader2,
  Search,
  BookOpen,
  Bookmark,
  Download,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  Layers,
  Building2,
  User as UserIcon,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { 
  getCustomPapers, 
  getLocalCustomPapers, 
  isDemoModeActive, 
  deleteCustomPaper, 
  savePaper, 
  unsavePaper, 
  getSavedPaperIds 
} from '../../services/db';
import ProfileCompletionModal from '../ProfileCompletionModal';
import { checkProfileCompleteness, ProfileCompletenessResult } from '../../utils/profileValidation';

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
  // Tab view inside Research Hub
  const [activeTab, setActiveTab] = useState<'all_research' | 'my_publications' | 'drafts' | 'pending'>('all_research');
  
  // Data lists
  const [allNetworkPapers, setAllNetworkPapers] = useState<ResearchPaper[]>([]);
  const [myUploadedResearch, setMyUploadedResearch] = useState<ResearchPaper[]>([]);
  const [draftResearch, setDraftResearch] = useState<ResearchPaper[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<ResearchPaper[]>([]);
  const [savedPaperIds, setSavedPaperIds] = useState<string[]>([]);
  
  // Search & Filter state for Research Hub
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileValidation, setProfileValidation] = useState<ProfileCompletenessResult | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Load saved papers for current user
  useEffect(() => {
    if (!user) return;
    getSavedPaperIds(user.uid).then(ids => setSavedPaperIds(ids)).catch(() => {});
  }, [user]);

  // Load and listen to all custom papers in real-time
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const processAllPapers = (customPapersList: ResearchPaper[]) => {
      // 1. All Network / Community Published Papers (Curated + Public Custom Uploads by all users & orgs)
      const publicCustom = customPapersList.filter(
        (p) =>
          p.visibility !== 'Private Draft' &&
          p.status !== 'Draft' &&
          p.status !== 'Under Review' &&
          p.status !== 'Pending' &&
          p.status !== 'In Review' &&
          !(p as any).isDraft
      );

      // Merge standard repository papers with public custom uploaded research
      const combinedMap = new Map<string, ResearchPaper>();
      for (const p of RESEARCH_PAPERS) {
        if (p && p.id) combinedMap.set(p.id, p);
      }
      for (const p of publicCustom) {
        if (p && p.id) combinedMap.set(p.id, p);
      }
      const combinedAll = Array.from(combinedMap.values()).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : (a.publishedYear ? parseInt(String(a.publishedYear)) * 10000 : 0);
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : (b.publishedYear ? parseInt(String(b.publishedYear)) * 10000 : 0);
        return dateB - dateA;
      });

      // 2. My Uploaded Publications (owned by active user)
      const myPapers = customPapersList.filter(
        (p) => (p.userId === user.uid || (user.email && p.userEmail === user.email)) &&
               p.visibility !== 'Private Draft' &&
               p.status !== 'Draft' &&
               p.status !== 'Under Review' &&
               p.status !== 'Pending' &&
               p.status !== 'In Review' &&
               !(p as any).isDraft
      ).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      // 3. Draft Research (owned by active user)
      const drafts = customPapersList.filter(
        (p) => (p.userId === user.uid || (user.email && p.userEmail === user.email)) &&
               (p.visibility === 'Private Draft' || p.status === 'Draft' || (p as any).isDraft === true)
      ).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      // 4. Pending Submissions (owned by active user)
      const pending = customPapersList.filter(
        (p) => (p.userId === user.uid || (user.email && p.userEmail === user.email)) &&
               (p.status === 'Under Review' || p.status === 'Pending' || p.status === 'In Review')
      ).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setAllNetworkPapers(combinedAll);
      setMyUploadedResearch(myPapers);
      setDraftResearch(drafts);
      setPendingSubmissions(pending);
      setLoading(false);
    };

    if (isDemoModeActive(user.uid) || !auth.currentUser) {
      // Local fallback
      const loadLocal = () => {
        const local = getLocalCustomPapers();
        processAllPapers(local);
      };
      loadLocal();
      const interval = setInterval(loadLocal, 2500);
      return () => clearInterval(interval);
    }

    // Direct real-time Firebase listener on custom_papers collection
    let unsub: (() => void) | null = null;
    try {
      unsub = onSnapshot(
        collection(db, 'custom_papers'),
        (snapshot) => {
          const customPapersList: ResearchPaper[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            customPapersList.push({
              id: docSnap.id,
              isCustom: true,
              ...data
            } as ResearchPaper);
          });
          processAllPapers(customPapersList);
        },
        (_error) => {
          const local = getLocalCustomPapers();
          processAllPapers(local);
        }
      );
    } catch (_error) {
      const local = getLocalCustomPapers();
      processAllPapers(local);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  const handleViewPaper = (paperId?: string) => {
    if (onNavigateToView) {
      onNavigateToView('research', paperId);
    } else {
      window.location.hash = paperId ? `#/research/${paperId}` : '#/research';
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

  // Toggle Bookmark / Save
  const handleToggleSave = async (paperId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    const isAlreadySaved = savedPaperIds.includes(paperId);
    if (isAlreadySaved) {
      setSavedPaperIds(prev => prev.filter(id => id !== paperId));
      try {
        await unsavePaper(user.uid, paperId);
        showFeedback('Study removed from bookmarks.', 'success');
      } catch {
        setSavedPaperIds(prev => [...prev, paperId]);
      }
    } else {
      setSavedPaperIds(prev => [...prev, paperId]);
      try {
        await savePaper(user.uid, paperId);
        showFeedback('Study saved to your profile!', 'success');
      } catch {
        setSavedPaperIds(prev => prev.filter(id => id !== paperId));
      }
    }
  };

  // Download PDF
  const handleDownloadPDF = async (paper: ResearchPaper, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showFeedback(`Preparing PDF download: "${paper.title}"...`, 'success');
    try {
      const { generateResearchPDF } = await import('../../utils/pdfGenerator');
      await generateResearchPDF(paper);
    } catch (err) {
      console.error('Error generating PDF:', err);
      showFeedback('Could not generate PDF download.', 'error');
    }
  };

  // Confirm and Execute Delete (strictly for author only)
  const handleDeletePaper = async (paper: ResearchPaper, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isOwner = Boolean(
      paper.isCustom &&
      user &&
      (paper.userId === user.uid || (user.email && paper.userEmail === user.email))
    );

    if (!isOwner) {
      showFeedback('Unauthorized: Only the researcher who published this study can delete it.', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${paper.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteCustomPaper(paper.id, user.uid, user.email || undefined);
      showFeedback('Research publication permanently deleted.', 'success');
      setMyUploadedResearch(prev => prev.filter(p => p.id !== paper.id));
      setAllNetworkPapers(prev => prev.filter(p => p.id !== paper.id));
    } catch (err) {
      console.error('Error deleting research paper:', err);
      showFeedback('Failed to delete research paper.', 'error');
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

  const categories = ['All', 'Bioenergy Technology', 'Waste-to-Energy', 'Environmental Sustainability', 'Climate & Energy Policy'];

  // Filtered network papers for Research Hub view
  const filteredNetworkPapers = allNetworkPapers.filter((paper) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (paper?.title || '').toLowerCase().includes(query) ||
      (paper?.abstract || '').toLowerCase().includes(query) ||
      (paper?.author || '').toLowerCase().includes(query) ||
      (paper?.institution || '').toLowerCase().includes(query) ||
      (Array.isArray(paper?.keywords) && paper.keywords.some((k: string) => k.toLowerCase().includes(query))) ||
      (Array.isArray(paper?.tags) && paper.tags.some((t: string) => t.toLowerCase().includes(query)));

    const matchesCategory = selectedCategory === 'All' || paper?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 font-sans text-left my-6" id="research_overview_section">
      {/* Toast feedback */}
      {feedbackMsg && (
        <div 
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-md border ${
            feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-700 ml-2">×</button>
        </div>
      )}

      {/* Main Header with Top Level Actions */}
      <div className="bg-white dark:bg-[#06140c] rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-emerald-900/30 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-[#008744]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                Research Hub & Publications
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium pl-9">
              Access published research, peer-reviewed feasibility studies, and manage your authored scientific contributions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pl-9 sm:pl-0">
            <button
              onClick={() => {
                if (onNavigateToView) {
                  onNavigateToView('research');
                } else {
                  window.location.hash = '#/research';
                }
              }}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Repository</span>
            </button>
            <button
              onClick={handleUploadClick}
              className="px-4 py-2 bg-[#008744] hover:bg-[#00733a] text-white text-xs font-extrabold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer border-0"
              id="dashboard_upload_research_btn"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Research</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'all_research', label: 'All Published Research', count: allNetworkPapers.length, icon: Layers },
            { id: 'my_publications', label: 'My Publications', count: myUploadedResearch.length, icon: UploadCloud },
            { id: 'drafts', label: 'Drafts', count: draftResearch.length, icon: FileEdit },
            { id: 'pending', label: 'Under Review', count: pendingSubmissions.length, icon: Hourglass }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ALL PUBLISHED RESEARCH (RESEARCH HUB REPOSITORY) */}
      {/* ======================================================== */}
      {activeTab === 'all_research' && (
        <div className="space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="bg-white dark:bg-[#06140c] rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search research studies by title, author, keyword, or institution..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Research Papers Grid */}
          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading research repository publications...</p>
            </div>
          ) : filteredNetworkPapers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredNetworkPapers.map((paper) => {
                const isSaved = savedPaperIds.includes(paper.id);
                const isOwner = Boolean(
                  paper.isCustom &&
                  user &&
                  (paper.userId === user.uid || (user.email && paper.userEmail === user.email))
                );

                return (
                  <div
                    key={paper.id}
                    className="bg-white dark:bg-[#06140c] rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges & Ownership Indicator */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-[#008744] border border-emerald-100">
                          {paper.category || 'Bioenergy Research'}
                        </span>
                        
                        {isOwner ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <UserIcon className="w-2.5 h-2.5" />
                            Your Upload
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatDate(paper.createdAt || paper.publishedYear)}
                          </span>
                        )}
                      </div>

                      {/* Paper Title */}
                      <h4
                        onClick={() => handleViewPaper(paper.id)}
                        className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2"
                      >
                        {paper.title}
                      </h4>

                      {/* Author & Institution */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold truncate">
                          {paper.author || (paper.coAuthors && paper.coAuthors.length > 0 ? paper.coAuthors[0].name : 'Aurenix Research Scholar')}
                        </span>
                      </div>
                      {paper.institution && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{paper.institution}</span>
                        </div>
                      )}

                      {/* Abstract Preview */}
                      {paper.abstract && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {paper.abstract}
                        </p>
                      )}

                      {/* Keywords */}
                      {Array.isArray(paper.keywords) && paper.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {paper.keywords.slice(0, 3).map((kw: string) => (
                            <span key={kw} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/20 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleSave(paper.id, e)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            isSaved ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={isSaved ? 'Remove Bookmark' : 'Bookmark Study'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-600' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleDownloadPDF(paper, e)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Author-only Delete action badge */}
                        {isOwner && (
                          <button
                            onClick={(e) => handleDeletePaper(paper, e)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs transition-colors cursor-pointer"
                            title="Delete your published research"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewPaper(paper.id)}
                        className="px-3.5 py-1.5 bg-[#008744] hover:bg-[#00733a] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer border-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Study</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3 flex flex-col items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-300 stroke-[1.5]" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No matching research studies found</h4>
                <p className="text-xs text-slate-500">Try adjusting your search keywords or category filters.</p>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MY PUBLICATIONS (OWNED BY CURRENT USER)           */}
      {/* ======================================================== */}
      {activeTab === 'my_publications' && (
        <div className="space-y-4">
          {myUploadedResearch.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {myUploadedResearch.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-100 text-emerald-800">
                        {paper.status || 'Published'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDate(paper.createdAt || paper.publishedYear)}
                      </span>
                    </div>

                    <h4
                      onClick={() => handleViewPaper(paper.id)}
                      className="text-sm font-bold text-slate-900 leading-snug hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2"
                    >
                      {paper.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{paper.category || 'Bioenergy Technology'}</span>
                    </div>

                    {paper.abstract && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {paper.abstract}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleDeletePaper(paper, e)}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Delete this publication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleViewPaper(paper.id)}
                      className="px-3.5 py-1.5 bg-[#008744] hover:bg-[#00733a] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer border-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-4 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#008744] flex items-center justify-center">
                <UploadCloud className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">You have not published any research yet</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Contribute your feasibility studies, technical reports, and peer-reviewed bioenergy models to the global network.
                </p>
              </div>
              <button
                onClick={handleUploadClick}
                className="px-5 py-2.5 bg-[#008744] hover:bg-[#00733a] text-white text-xs font-extrabold rounded-xl transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer border-0"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload First Research</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DRAFT RESEARCH (INCOMPLETE USER UPLOADS)         */}
      {/* ======================================================== */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          {draftResearch.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {draftResearch.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white rounded-2xl p-5 border border-amber-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-amber-100 text-amber-800">
                        Incomplete Draft
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Edited {formatDate((draft as any).updatedAt || draft.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {draft.title || 'Untitled Draft'}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Ready to finish submission</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => handleDeletePaper(draft, e)}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onUploadResearch) {
                          onUploadResearch(draft);
                        } else {
                          handleViewPaper(draft.id);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer border-0"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Continue Editing</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3 flex flex-col items-center justify-center">
              <FileEdit className="w-10 h-10 text-slate-300 stroke-[1.5]" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No draft research in progress</h4>
                <p className="text-xs text-slate-500">Whenever you start an upload, your in-progress drafts will appear here.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PENDING SUBMISSIONS                              */}
      {/* ======================================================== */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {pendingSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-5 border border-blue-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-blue-100 text-blue-800">
                        {sub.status || 'Under Review'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Submitted {formatDate(sub.createdAt)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {sub.title}
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Our scientific editorial board is reviewing your manuscript. You will receive an alert once peer verification completes.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleViewPaper(sub.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer border-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Submission</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3 flex flex-col items-center justify-center">
              <Hourglass className="w-10 h-10 text-slate-300 stroke-[1.5]" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No pending submissions</h4>
                <p className="text-xs text-slate-500">You have no research manuscripts currently undergoing peer audit.</p>
              </div>
            </div>
          )}
        </div>
      )}

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
