import React, { useState, useEffect } from 'react';
import { 
  Search, Save, Trash2, Download, Plus, BookOpen, AlertCircle, CheckCircle2, 
  FileText, Sparkles, X, Check, Bookmark, Calendar, Globe, Layers, Eye, 
  Quote, ArrowRight, ArrowLeft, FlaskConical, BadgeCheck, ChevronRight, User as UserIcon 
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ResearchPaper } from '../types';
import { RESEARCH_PAPERS } from '../data';
import { savePaper, unsavePaper, addCustomPaper, updateCustomPaper, getCustomPapers, getUserProfile } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';
import ResearchDetail from './ResearchDetail';
import PublishWizard from './PublishWizard';
import ProfileCompletionModal from './ProfileCompletionModal';
import { checkProfileCompleteness, ProfileCompletenessResult } from '../utils/profileValidation';
import { triggerFirstResearchConfetti } from '../utils/confetti';

type PaperMeta = {
  image: string;
  tags: string[];
  pubDate: string;
  journal: string;
  location: string;
  trl: string;
  pages: string;
  authorName: string;
  authorPhoto: string;
  institution: string;
  reads: number;
  downloads: number;
  citations: number;
};

const getPaperMeta = (paper: ResearchPaper) => {
  const defaults: Record<string, PaperMeta> = {
    'paper-1': {
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      tags: ['Biogas', 'Waste-to-Energy', 'Renewable Energy', '+2'],
      pubDate: 'May 20, 2024',
      journal: 'Journal of Renewable Energy Research',
      location: 'Nigeria',
      trl: 'TRL 4',
      pages: '12',
      authorName: 'Dr. Emmanuel Okafor',
      authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      institution: 'University of Lagos, Nigeria',
      reads: 245,
      downloads: 32,
      citations: 8
    },
    'paper-2': {
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=800',
      tags: ['Biomass Policy', 'Decarbonization', 'Thermal Conversion', '+3'],
      pubDate: 'Nov 14, 2023',
      journal: 'IEA Sustainable Energy Report',
      location: 'West Africa',
      trl: 'TRL 6',
      pages: '28',
      authorName: 'Aurenix Policy Group',
      authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      institution: 'Aurenix Research Institute',
      reads: 512,
      downloads: 94,
      citations: 24
    },
    'paper-3': {
      image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800',
      tags: ['Bioenergy', 'Clean Microgrids', 'Rural Electrification', '+2'],
      pubDate: 'Jan 10, 2025',
      journal: 'African Sustainability & Policy',
      location: 'Sub-Saharan Africa',
      trl: 'TRL 5',
      pages: '18',
      authorName: 'Filani Olalekan Theophilus',
      authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      institution: 'Bioenergy Nexus Research',
      reads: 830,
      downloads: 142,
      citations: 31
    },
    'paper-4': {
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
      tags: ['Waste-to-Energy', 'MSW Incineration', 'Lagos Metropole', '+1'],
      pubDate: 'Aug 05, 2024',
      journal: 'Urban Energy & Waste Systems',
      location: 'Lagos, Nigeria',
      trl: 'TRL 7',
      pages: '22',
      authorName: 'Filani Olalekan Theophilus & Partners',
      authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      institution: 'Lagos State Renewable Directorate',
      reads: 620,
      downloads: 88,
      citations: 19
    },
    'paper-5': {
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
      tags: ['Biofuels', 'ECOWAS Policy', 'Decarbonization', '+2'],
      pubDate: 'Feb 18, 2025',
      journal: 'Journal of ECOWAS Energy Development',
      location: 'West Africa',
      trl: 'TRL 5',
      pages: '16',
      authorName: 'Aurenix Policy Group',
      authorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      institution: 'ECOWAS Renewable Energy Center',
      reads: 410,
      downloads: 53,
      citations: 12
    }
  };

  const extra: Partial<PaperMeta> = defaults[paper.id] || {};

  const rawCover = paper.uploads?.coverImage;
  const isValidCover = rawCover && (
    rawCover.startsWith('data:') || 
    rawCover.startsWith('http://') || 
    rawCover.startsWith('https://') || 
    rawCover.startsWith('blob:') || 
    rawCover.startsWith('/')
  );

  return {
    image: isValidCover ? rawCover : (extra.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'),
    tags: paper.tags && paper.tags.length > 0 ? paper.tags : (extra.tags || [paper.category, 'Renewable Energy', 'Bioenergy']),
    pubDate: extra.pubDate || (paper.publishedYear ? `Published ${paper.publishedYear}` : 'Recent'),
    journal: extra.journal || (paper.institution ? `${paper.institution} Journal` : 'Journal of Renewable Energy Research'),
    location: paper.country || extra.location || 'Nigeria',
    trl: extra.trl || 'TRL 4',
    pages: extra.pages || '12',
    authorName: paper.author || extra.authorName || 'Research Fellow',
    authorPhoto: extra.authorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    institution: paper.institution || extra.institution || 'Bioenergy Research Institute',
    reads: paper.viewsCount ?? extra.reads ?? 0,
    downloads: paper.downloadsCount ?? extra.downloads ?? 0,
    citations: extra.citations ?? 0
  };
};

interface ResearchSectionProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  savedPaperIds: string[];
  setSavedPaperIds: React.Dispatch<React.SetStateAction<string[]>>;
  userProfile?: any;
  onNavigateToProfile?: () => void;
}

export default function ResearchSection({ 
  user, 
  onSignIn, 
  savedPaperIds, 
  setSavedPaperIds,
  userProfile,
  onNavigateToProfile
}: ResearchSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customPapers, setCustomPapers] = useState<ResearchPaper[]>([]);
  const [allPapers, setAllPapers] = useState<ResearchPaper[]>(RESEARCH_PAPERS);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [animatingPaperIds, setAnimatingPaperIds] = useState<string[]>([]);
  
  // PublishWizard open state & profile validation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDraftData, setEditingDraftData] = useState<Partial<ResearchPaper> | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileValidationResult, setProfileValidationResult] = useState<ProfileCompletenessResult | null>(null);

  // Open upload wizard seamlessly
  const handleOpenPublishWizard = async (initialPaper?: Partial<ResearchPaper>) => {
    if (!user) {
      onSignIn();
      return;
    }

    if (initialPaper) {
      setEditingDraftData(initialPaper);
    } else {
      setEditingDraftData(null);
    }

    setIsModalOpen(true);
  };

  // Load custom papers from Firestore on startup & sync with events
  useEffect(() => {
    async function loadPapers() {
      try {
        const papersFromDb = await getCustomPapers();
        setCustomPapers(papersFromDb);
      } catch (err) {
        console.error('Error loading custom papers:', err);
      }
    }
    loadPapers();

    const handlePapersUpdated = () => {
      loadPapers();
    };

    const handleOpenWizardEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      handleOpenPublishWizard(customEvent.detail?.draftData);
    };

    window.addEventListener('custom-papers-updated', handlePapersUpdated);
    window.addEventListener('research-updated', handlePapersUpdated);
    window.addEventListener('open-publish-wizard', handleOpenWizardEvent as EventListener);

    return () => {
      window.removeEventListener('custom-papers-updated', handlePapersUpdated);
      window.removeEventListener('research-updated', handlePapersUpdated);
      window.removeEventListener('open-publish-wizard', handleOpenWizardEvent as EventListener);
    };
  }, [user, userProfile]);

  // Merge static papers with custom ones
  useEffect(() => {
    setAllPapers([...RESEARCH_PAPERS, ...customPapers]);
  }, [customPapers]);

  // Deep-link location hash check for /research/{researchId} routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/research/')) {
        const paperId = hash.replace('#/research/', '');
        const found = allPapers.find(p => p.id === paperId);
        if (found) {
          setSelectedPaper(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setSelectedPaper(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Trigger initially once papers are loaded
    if (allPapers.length > 0) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allPapers]);

  // Handle Save/Unsave
  const handleSaveToggle = async (paperId: string) => {
    if (!user) {
      onSignIn();
      return;
    }

    const isAlreadySaved = savedPaperIds.includes(paperId);
    
    // Add to animating list to show the checkmark feedback
    setAnimatingPaperIds(prev => [...prev, paperId]);
    setTimeout(() => {
      setAnimatingPaperIds(prev => prev.filter(id => id !== paperId));
    }, 1500);

    // Optimistically update local state immediately
    if (isAlreadySaved) {
      setSavedPaperIds(prev => prev.filter(id => id !== paperId));
    } else {
      setSavedPaperIds(prev => [...prev, paperId]);
    }

    try {
      if (isAlreadySaved) {
        await unsavePaper(user.uid, paperId);
        showNotification('Study removed from your saved list.', 'success');
      } else {
        await savePaper(user.uid, paperId);
        showNotification('Study saved to your profile!', 'success');
      }
    } catch (err) {
      console.error('Error saving paper:', err);
      // Revert the optimistic update on failure
      if (isAlreadySaved) {
        setSavedPaperIds(prev => [...prev, paperId]);
      } else {
        setSavedPaperIds(prev => prev.filter(id => id !== paperId));
      }
      showNotification('Could not update saved studies. Please try again.', 'error');
    }
  };

  // Helper to show brief in-app notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle Publish Wizard Submit
  const handlePublishWizardSubmit = async (paperData: Omit<ResearchPaper, 'id'>, draftPaperId?: string | null) => {
    if (!user) return;
    try {
      const targetDraftId = draftPaperId || editingDraftData?.id;
      // Check if this is the user's first published research upload
      const existingPublished = customPapers.filter(p => !p.isDraft && p.id !== targetDraftId);
      const isFirstUpload = existingPublished.length === 0;

      let docId = targetDraftId;
      if (targetDraftId) {
        // Direct update to existing draft converts it into published paper cleanly
        await updateCustomPaper(targetDraftId, {
          ...paperData,
          isDraft: false,
          status: paperData.status === 'Draft' ? 'Published' : paperData.status,
          visibility: paperData.visibility === 'Private Draft' ? 'Public' : paperData.visibility
        });
      } else {
        docId = await addCustomPaper(paperData, user.uid, user.email || '');
      }

      const createdPaper: ResearchPaper = {
        id: docId!,
        ...paperData,
        isDraft: false,
        isCustom: true,
      };

      setCustomPapers(prev => {
        const filtered = prev.filter(p => p.id !== targetDraftId && p.id !== docId);
        return [...filtered, createdPaper];
      });

      setEditingDraftData(null);
      setIsModalOpen(false);

      if (isFirstUpload) {
        triggerFirstResearchConfetti();
        showNotification('🎉 Congratulations! You uploaded your first research study to the Aurenix Repository!', 'success');
      } else {
        showNotification('Research entry contributed successfully to Aurenix Repository!', 'success');
      }
    } catch (err) {
      console.error('Error submitting paper:', err);
      showNotification('Could not submit paper. Please try again.', 'error');
      throw err;
    }
  };

  // Simulated download
  const handleDownload = async (paper: ResearchPaper) => {
    showNotification(`Preparing and downloading report: "${paper.title}"...`, 'success');
    try {
      const { generateResearchPDF } = await import('../utils/pdfGenerator');
      await generateResearchPDF(paper);
    } catch (err) {
      console.error('Error generating PDF:', err);
      showNotification('Failed to generate PDF. Please try again.', 'error');
      throw err;
    }
  };

  const categories = ['All', 'Bioenergy Technology', 'Waste-to-Energy', 'Environmental Sustainability', 'Climate & Energy Policy'];

  // Filter papers: all published papers (both old and new) are completely visible to every user and visitor
  const filteredPapers = allPapers.filter((paper) => {
    // Only exclude if explicitly an unreleased draft belonging to a different author
    if (paper.isDraft === true && (!user || paper.userId !== user.uid)) {
      return false;
    }
    const query = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !query ||
      (paper?.title || '').toLowerCase().includes(query) ||
      (paper?.abstract || '').toLowerCase().includes(query) ||
      (paper?.author || '').toLowerCase().includes(query) ||
      (paper?.leadResearcher || '').toLowerCase().includes(query) ||
      (paper?.institution || '').toLowerCase().includes(query) ||
      (Array.isArray(paper?.keywords) && paper.keywords.some((k: string) => k.toLowerCase().includes(query))) ||
      (Array.isArray(paper?.tags) && paper.tags.some((t: string) => t.toLowerCase().includes(query)));
    
    const matchesCategory = selectedCategory === 'All' || paper?.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (selectedPaper) {
    return (
      <ResearchDetail
        paper={selectedPaper}
        onBack={() => {
          window.location.hash = '';
          setSelectedPaper(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isSaved={savedPaperIds.includes(selectedPaper.id)}
        onSaveToggle={() => handleSaveToggle(selectedPaper.id)}
        onDownload={handleDownload}
        user={user}
        onSignIn={onSignIn}
      />
    );
  }

  if (isModalOpen) {
    return (
      <div className="py-6 sm:py-10 px-3 sm:px-6 lg:px-8 min-h-screen text-slate-900 dark:text-slate-100 text-left relative" id="publish_wizard_full_workspace" style={{ backgroundColor: '#e7e7e7' }}>
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Top Navigation & Workspace Breadcrumb Bar */}
          <div className="flex items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 shadow-xs border-slate-200" style={{ backgroundColor: '#ffffff', borderWidth: '1px', borderRadius: '5px' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-600" />
                Back to Repository
              </button>
              <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Aurenix Scientific Portal</span>
                <span>/</span>
                <span className="text-emerald-700 font-extrabold">Peer-Review Submission</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg" style={{ backgroundColor: '#034a3e' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DOI Draft Sandbox
              </span>
            </div>
          </div>

          {/* Main Publish Wizard Container */}
          <PublishWizard
            initialData={editingDraftData || undefined}
            onClose={() => {
              setIsModalOpen(false);
              setEditingDraftData(null);
            }}
            onSubmit={handlePublishWizardSubmit}
            userProfile={userProfile}
            onNavigateToProfile={onNavigateToProfile}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-slate-50" id="research">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Toast Notification */}
        {notification && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            notification.type === 'success' 
              ? 'bg-emerald-950 text-emerald-100' 
              : 'bg-red-950 text-red-100'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/60 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              Repository
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
              Aurenix Research Repository
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Access peer-reviewed studies, technical feasibility templates, and policy briefs. Securely bookmark materials to your user profile for streamlined retrieval.
            </p>
          </div>

          <button
            onClick={() => handleOpenPublishWizard()}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-950 hover:from-emerald-800 hover:to-slate-950 text-white rounded-2xl font-extrabold shadow-md hover:shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer text-sm border border-emerald-600/30 group"
            id="contribute_research_btn"
          >
            <div className="p-1 bg-white/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Plus className="w-4 h-4 text-emerald-300 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span>Publish a Research</span>
          </button>
        </div>

        {/* Search and Filters panel */}
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-xs sm:shadow-sm mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search studies by title, author, abstract keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm transition-all font-sans"
              id="research_search_input"
            />
          </div>

          {/* Category Pills - Scrollable on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 cursor-pointer border-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                id={`category_filter_${(cat || '').toLowerCase().replace(/\s+/g, '_')}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Papers Listing Container - 2 Cards per Horizontal Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="papers_grid">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => {
              const isSaved = savedPaperIds.includes(paper.id);
              const meta = getPaperMeta(paper);

              return (
                <div 
                  key={paper.id}
                  className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between space-y-4 sm:space-y-5 relative overflow-hidden group"
                  id={`paper_card_${paper.id}`}
                >
                  <div className="space-y-3 sm:space-y-4">
                    {/* Top Row: Badge + Bookmark Button */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#ebf7f0] text-[#0f6b3e] text-xs font-extrabold uppercase tracking-wide">
                        <FlaskConical className="w-4 h-4 text-[#0f6b3e] stroke-[2.5]" />
                        RESEARCH
                      </span>

                      <button
                        onClick={() => handleSaveToggle(paper.id)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border transition-colors cursor-pointer flex items-center justify-center shadow-2xs ${
                          isSaved 
                            ? 'bg-[#ebf7f0] border-emerald-300 text-[#0f6b3e]' 
                            : 'bg-white border-slate-200/80 text-slate-700 hover:text-[#0f6b3e] hover:bg-slate-50'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Bookmark to Profile'}
                        id={`bookmark_btn_${paper.id}`}
                      >
                        <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-[#0f6b3e] text-[#0f6b3e]' : 'text-[#0f6b3e]'}`} />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => {
                        window.history.pushState(null, '', `/research/${paper.id}`);
                        window.dispatchEvent(new Event('popstate'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-snug tracking-tight hover:text-[#0f6b3e] transition-colors cursor-pointer"
                    >
                      {paper.title}
                    </h3>

                    {/* Abstract */}
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans line-clamp-3">
                      {paper.abstract}
                    </p>

                    {/* Keyword Tags */}
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {meta.tags.filter(t => !t.startsWith('+')).map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-3.5 py-1 bg-white border border-slate-200/80 rounded-xl text-[#0f6b3e] text-xs sm:text-sm font-semibold shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="border-t border-slate-100 my-0.5" />

                  {/* Bottom Metadata Row & Chevron Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-0.5">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 min-w-0">
                      {/* Date */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#ebf7f0] rounded-xl flex items-center justify-center text-[#0f6b3e] shrink-0">
                          <Calendar className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="block font-bold text-slate-900 text-sm sm:text-base truncate">{meta.pubDate}</span>
                          <span className="block text-xs text-slate-400 font-medium">Published</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#ebf7f0] rounded-xl flex items-center justify-center text-[#0f6b3e] shrink-0">
                          <Globe className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="block font-bold text-slate-900 text-sm sm:text-base truncate">{meta.location}</span>
                          <span className="block text-xs text-slate-400 font-medium">Location</span>
                        </div>
                      </div>

                      {/* Researcher / Author */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#ebf7f0] rounded-xl flex items-center justify-center text-[#0f6b3e] shrink-0">
                          <UserIcon className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="block font-bold text-slate-900 text-sm leading-tight max-w-[170px] truncate" title={paper.id === 'paper-1' ? 'Aurenix Research Research Group' : meta.authorName}>
                            {paper.id === 'paper-1' ? 'Aurenix Research Research Group' : meta.authorName}
                          </span>
                          <span className="block text-xs text-slate-400 font-medium">Researcher</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Chevron Action Button */}
                    <button
                      onClick={() => {
                        window.history.pushState(null, '', `/research/${paper.id}`);
                        window.dispatchEvent(new Event('popstate'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-slate-200/80 bg-white hover:bg-[#ebf7f0] flex items-center justify-center text-[#0f6b3e] transition-colors shadow-2xs shrink-0 cursor-pointer self-end sm:self-center"
                      title="View Details"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="lg:col-span-2 py-16 bg-white rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-4 shadow-sm">
              <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {allPapers.length === 0 ? "No research has been published yet." : "No matching studies found"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  {allPapers.length === 0 ? "Be the first scholar or institution to publish a study to the Aurenix Repository." : "We couldn't find any documents matching your criteria. Try altering your keyword filter or categories."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Completion Modal */}
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onNavigateToProfile={() => {
            setShowProfileModal(false);
            if (onNavigateToProfile) {
              onNavigateToProfile();
            } else {
              window.location.hash = '#/profile';
            }
          }}
          missingFields={profileValidationResult?.missingFields || []}
          completionPercent={profileValidationResult?.completionPercent || 0}
        />

      </div>
    </section>
  );
}
