import React, { useState, useEffect } from 'react';
import { Search, Trash2, Download, BookOpen, AlertCircle, CheckCircle2, Bookmark, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ResearchPaper } from '../types';
import { RESEARCH_PAPERS } from '../data';
import { unsavePaper, getSavedPaperIds, getCustomPapers } from '../services/db';
import { motion } from 'motion/react';
import ResearchDetail from './ResearchDetail';

interface SavedStudiesPageProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  savedPaperIds: string[];
  setSavedPaperIds: React.Dispatch<React.SetStateAction<string[]>>;
  onGoToResearch: () => void;
}

export default function SavedStudiesPage({
  user,
  onSignIn,
  savedPaperIds,
  setSavedPaperIds,
  onGoToResearch
}: SavedStudiesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [allPapers, setAllPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const categories = ['All', 'Bioenergy Technology', 'Waste-to-Energy', 'Environmental Sustainability', 'Climate & Energy Policy'];

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSavedAndCustom = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const customP = await getCustomPapers();
      const combined = [...RESEARCH_PAPERS, ...customP];
      // Filter combined papers to match saved ids
      const saved = combined.filter(paper => savedPaperIds.includes(paper.id));
      setAllPapers(saved);
    } catch (err) {
      console.error('Error fetching bookmarked studies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAndCustom();
  }, [user, savedPaperIds]);

  const handleUnsave = async (paperId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      await unsavePaper(user.uid, paperId);
      setSavedPaperIds(prev => prev.filter(id => id !== paperId));
      showNotification('Study bookmark removed successfully.', 'success');
      if (selectedPaper?.id === paperId) {
        setSelectedPaper(null);
      }
    } catch (err) {
      console.error('Error removing study:', err);
      showNotification('Could not remove bookmark. Please try again.', 'error');
    }
  };

  const handleDownload = async (paper: ResearchPaper) => {
    showNotification(`Preparing and downloading report: "${paper.title}"...`, 'success');
    try {
      const { generateResearchPDF } = await import('../utils/pdfGenerator');
      await generateResearchPDF(paper);
    } catch (err) {
      console.error('Error generating PDF:', err);
      showNotification('Failed to generate PDF. Please try again.', 'error');
    }
  };

  // Filter papers
  const filteredPapers = allPapers.filter((paper) => {
    const query = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !query ||
      (paper?.title || '').toLowerCase().includes(query) ||
      (paper?.abstract || '').toLowerCase().includes(query) ||
      (paper?.author || '').toLowerCase().includes(query);
    
    const matchesCategory = selectedCategory === 'All' || paper?.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (selectedPaper) {
    return (
      <ResearchDetail
        paper={selectedPaper}
        onBack={() => {
          setSelectedPaper(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isSaved={savedPaperIds.includes(selectedPaper.id)}
        onSaveToggle={() => handleUnsave(selectedPaper.id)}
        onDownload={handleDownload}
        user={user}
        onSignIn={onSignIn}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 text-left" id="saved_studies_page_wrapper">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
          notification.type === 'success' 
            ? 'bg-emerald-950 text-emerald-100' 
            : 'bg-red-950 text-red-100'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden py-10 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl"></div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs">
            <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
            Personal Library
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-slate-900">
            My <span className="text-emerald-600">Saved Studies</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed">
            Review your bookmarked research papers, read key process chemical conclusions, and document localized operational laboratory notes directly inside each study.
          </p>
        </div>
      </div>

      <div className="w-full px-3 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        
        {/* Search and Filters */}
        <div className="bg-white p-3.5 sm:p-6 rounded-2xl shadow-xs border border-slate-100 mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search saved studies by title, author, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-slate-800 placeholder-slate-400 outline-none text-xs sm:text-sm transition-all font-sans"
              id="saved_research_search_input"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                id={`saved_cat_filter_${(cat || '').toLowerCase().replace(/\s+/g, '_')}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Papers Listing Grid */}
        {loading ? (
          <div className="py-16 sm:py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Synchronizing saved library...</p>
          </div>
        ) : filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch" id="saved_papers_grid">
            {filteredPapers.map((paper) => (
              <motion.div
                key={paper.id}
                whileHover={{ y: -4 }}
                onClick={() => {
                  window.history.pushState(null, '', `/research/${paper.id}`);
                  window.dispatchEvent(new Event('popstate'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-100 transition-all duration-300 cursor-pointer text-left relative"
              >
                <div className="space-y-3 sm:space-y-4">
                  {/* Category & Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
                      {paper.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {paper.publishedYear}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      By {paper.author}
                    </p>
                  </div>

                  {/* Abstract preview */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {paper.abstract}
                  </p>
                </div>

                {/* Footer Controls Row */}
                <div className="mt-5 pt-3.5 sm:mt-6 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-600 flex items-center gap-1 group-hover:underline">
                    Analyze & Log Notes <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(paper);
                      }}
                      className="w-9 h-9 sm:w-8 sm:h-8 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors border-0 shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                      title="Download Study"
                    >
                      <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleUnsave(paper.id, e)}
                      className="w-9 h-9 sm:w-8 sm:h-8 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors border-0 shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-20 text-center border border-slate-200/50 max-w-xl mx-auto space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Bookmark className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {searchTerm || selectedCategory !== 'All' ? 'No matching saved studies' : 'Your saved library is empty'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try modifying your search text or selection filter to locate your saved research papers.'
                  : 'Start exploring our rich bioenergy research database. Bookmark any research papers to compile them here for rapid scientific analysis.'}
              </p>
            </div>
            {!searchTerm && selectedCategory === 'All' && (
              <button
                onClick={onGoToResearch}
                className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl font-semibold shadow-md transition-all cursor-pointer text-xs sm:text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Go to Research Hub
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
