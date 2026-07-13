import React, { useState, useEffect } from 'react';
import { Search, Save, Trash2, Download, Plus, BookOpen, AlertCircle, CheckCircle2, FileText, Sparkles, X, Check } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ResearchPaper } from '../types';
import { RESEARCH_PAPERS } from '../data';
import { savePaper, unsavePaper, addCustomPaper, getCustomPapers } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';
import ResearchDetail from './ResearchDetail';
import PublishWizard from './PublishWizard';

interface ResearchSectionProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  savedPaperIds: string[];
  setSavedPaperIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ResearchSection({ 
  user, 
  onSignIn, 
  savedPaperIds, 
  setSavedPaperIds 
}: ResearchSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customPapers, setCustomPapers] = useState<ResearchPaper[]>([]);
  const [allPapers, setAllPapers] = useState<ResearchPaper[]>(RESEARCH_PAPERS);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [animatingPaperIds, setAnimatingPaperIds] = useState<string[]>([]);
  
  // PublishWizard open state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load custom papers from Firestore on startup
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
  }, []);

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
  const handlePublishWizardSubmit = async (paperData: Omit<ResearchPaper, 'id'>) => {
    if (!user) return;
    try {
      const docId = await addCustomPaper(paperData, user.uid, user.email || '');
      
      const createdPaper: ResearchPaper = {
        id: docId,
        ...paperData,
        isCustom: true,
      };

      setCustomPapers(prev => [...prev, createdPaper]);
      setIsModalOpen(false);
      showNotification('Research entry contributed successfully to Nexus Repository!', 'success');
    } catch (err) {
      console.error('Error adding custom paper:', err);
      showNotification('Could not submit paper. Please try again.', 'error');
      throw err;
    }
  };

  // Simulated download
  const handleDownload = (title: string) => {
    showNotification(`Downloading study: "${title}"... (Simulated)`, 'success');
  };

  const categories = ['All', 'Bioenergy Technology', 'Waste-to-Energy', 'Environmental Sustainability', 'Climate & Energy Policy'];

  // Filter papers
  const filteredPapers = allPapers.filter((paper) => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || paper.category === selectedCategory;
    
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
              Nexus Research Repository
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Access peer-reviewed studies, technical feasibility templates, and policy briefs. Securely bookmark materials to your user profile for streamlined retrieval.
            </p>
          </div>

          <motion.button
            onClick={() => user ? setIsModalOpen(true) : onSignIn()}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-150 shrink-0 cursor-pointer text-sm"
            id="contribute_research_btn"
          >
            <Plus className="w-4 h-4" />
            Publish a Research
          </motion.button>
        </div>

        {/* Search and Filters panel */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search studies by title, author, abstract keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-slate-800 placeholder-slate-400 outline-none text-sm transition-all font-sans"
              id="research_search_input"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                id={`category_filter_${cat.toLowerCase().replace(/\s+/g, '_')}`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Papers Listing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" id="papers_grid">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => {
              const isSaved = savedPaperIds.includes(paper.id);
              const isAnimating = animatingPaperIds.includes(paper.id);
              return (
                <motion.div 
                  key={paper.id}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group"
                  id={`paper_card_${paper.id}`}
                >
                  {/* Category Accent Indicator */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600"></div>

                  <div 
                    onClick={() => {
                      window.location.hash = `#/research/${paper.id}`;
                      setSelectedPaper(paper);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="space-y-4 text-left cursor-pointer group/details flex-grow"
                    title="Click to view full research details & findings"
                  >
                    {/* Category Label and Saved badge */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                        {paper.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{paper.publishedYear}</span>
                        {paper.isCustom && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">
                            Member Added
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-display font-extrabold text-slate-900 group-hover/details:text-emerald-700 transition-colors">
                      {paper.title}
                    </h3>

                    {/* Author */}
                    <p className="text-xs font-mono text-slate-500 font-medium">
                      Author: {paper.author}
                    </p>

                    {/* Abstract */}
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 font-sans group-hover/details:text-slate-800 transition-colors">
                      {paper.abstract}
                    </p>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover/details:underline pt-1">
                      Read full research & findings →
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                    <motion.button
                      onClick={() => handleDownload(paper.title)}
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors focus:outline-none cursor-pointer"
                      id={`download_btn_${paper.id}`}
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      Download PDF
                    </motion.button>

                    <motion.button
                      onClick={() => handleSaveToggle(paper.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`inline-flex items-center justify-center min-w-[105px] h-8.5 gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer border-0 ${
                        isAnimating
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200/50'
                          : isSaved
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isSaved ? 'Remove Bookmark' : 'Bookmark to Profile'}
                      id={`bookmark_btn_${paper.id}`}
                    >
                      <AnimatePresence mode="wait">
                        {isAnimating ? (
                          <motion.span
                            key="checkmark-icon"
                            initial={{ scale: 0, rotate: -20, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                            className="inline-flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isSaved ? 'Saved' : 'Removed'}</span>
                          </motion.span>
                        ) : (
                          <motion.span
                            key="normal-icon"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="inline-flex items-center gap-1.5"
                          >
                            {isSaved ? <Trash2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                            <span>{isSaved ? 'Remove' : 'Save Study'}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="lg:col-span-2 py-16 bg-white rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-4 shadow-sm">
              <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">No matching studies found</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  We couldn't find any documents matching your criteria. Try altering your keyword filter or categories.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal: PublishWizard Multi-step publish form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" id="contribute_modal">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
              <PublishWizard
                onClose={() => setIsModalOpen(false)}
                onSubmit={handlePublishWizardSubmit}
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
