import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Trash2, Download, BookOpen, Quote, FileText, 
  CheckCircle2, Lightbulb, Clipboard, Check, Sparkles, Send, Trash, Edit3, Award, Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { ResearchPaper } from '../types';
import { getDetailedResearch, DetailedResearch } from '../researchDetailsData';

interface ResearchDetailProps {
  paper: ResearchPaper;
  onBack: () => void;
  isSaved: boolean;
  onSaveToggle: () => void;
  onDownload: (title: string) => void;
}

export default function ResearchDetail({
  paper,
  onBack,
  isSaved,
  onSaveToggle,
  onDownload
}: ResearchDetailProps) {
  const details: DetailedResearch = getDetailedResearch(paper);
  
  // Local states
  const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'Harvard'>('APA');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'reading' | 'notes'>('reading');
  
  // Lab notes state
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`nexus_paper_notes_${paper.id}`);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error parsing notes from local storage:', e);
      }
    }
  }, [paper.id]);

  // Save notes to localStorage
  const saveNotesToStorage = (updatedNotes: string[]) => {
    localStorage.setItem(`nexus_paper_notes_${paper.id}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const updated = [newNote.trim(), ...notes];
    saveNotesToStorage(updated);
    setNewNote('');
  };

  const handleDeleteNote = (indexToDelete: number) => {
    const updated = notes.filter((_, idx) => idx !== indexToDelete);
    saveNotesToStorage(updated);
  };

  // Citation generator based on format selection
  const getFormattedCitation = () => {
    const year = details.publishedYear;
    const author = details.author;
    const title = details.title;
    
    if (citationFormat === 'APA') {
      return `${author}. (${year}). ${title}. Bioenergy Nexus Scientific Repository.`;
    } else if (citationFormat === 'MLA') {
      return `${author}. "${title}." Bioenergy Nexus Scientific Repository, ${year}.`;
    } else {
      return `${author} ${year}, ${title}, Bioenergy Nexus Scientific Repository, Lagos, Nigeria.`;
    }
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(getFormattedCitation());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 text-left" id="research_detail_page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <motion.button
            onClick={onBack}
            whileHover={{ x: -3 }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-slate-700 hover:text-emerald-800 rounded-xl shadow-sm text-sm font-semibold cursor-pointer border border-slate-200"
            id="detail_back_to_repository"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 shrink-0" />
            Back to Repository
          </motion.button>

          <div className="flex items-center gap-2.5">
            <motion.button
              onClick={() => onSaveToggle()}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border shadow-sm ${
                isSaved
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              id="detail_bookmark_btn"
            >
              {isSaved ? <Trash2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? 'Remove Bookmark' : 'Bookmark Study'}
            </motion.button>

            <motion.button
              onClick={() => onDownload(details.title)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl text-sm font-semibold shadow-md cursor-pointer border-0"
              id="detail_download_pdf_btn"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>
          </div>
        </div>

        {/* Paper Header / Hero block */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-xl border border-emerald-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold font-mono">
              <span className="px-3 py-1 bg-emerald-800/80 backdrop-blur-sm text-emerald-300 rounded-full uppercase tracking-wider">
                {details.category}
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-slate-300">
                Published {details.publishedYear}
              </span>
              {paper.isCustom && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Verified Contribution
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-black leading-tight max-w-4xl tracking-tight">
              {details.title}
            </h1>

            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-200">
                {details.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-200">Principal Author: {details.author}</p>
                <p className="text-xs text-slate-400">Bioenergy Nexus Research Associate & Academic Partners</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'reading'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Technical Report & Findings
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" />
              Laboratory Notes ({notes.length})
            </span>
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'reading' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Core content of research paper */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Introduction & Abstract summary */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4 border border-slate-100">
                <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                  Executive Abstract & Introduction
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-sans bg-slate-50 p-4 rounded-xl italic">
                  "{details.abstract}"
                </p>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-sans">
                  {details.introduction}
                </p>
              </div>

              {/* Technical Methodology */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4 border border-slate-100">
                <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                  Engineering & Technical Methodology
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The study followed a multi-stage empirical pipeline to ensure maximum reliability and scalability under practical conditions:
                </p>
                <ol className="space-y-3.5">
                  {details.methodology.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm text-slate-700 leading-relaxed font-sans">
                      <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Key Results and Findings */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4 border border-slate-100">
                <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  Key Research Findings & Data Output
                </h3>
                <div className="space-y-3">
                  {details.findings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50/30 rounded-xl">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                      <p className="text-sm text-slate-700 leading-relaxed font-sans">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Recommendations */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4 border border-slate-100">
                <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                  Recommendations & Scalability Guidelines
                </h3>
                <ul className="space-y-3">
                  {details.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                      <p className="text-sm text-slate-700 leading-relaxed font-sans">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right Column: Metrics, Citations, implementation call-to-actions */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quantifiable metrics grid */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
                  Scientific Metrics
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {details.metrics.map((metric, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 space-y-1 bg-slate-50">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                        {metric.label}
                      </span>
                      <span className="text-lg font-display font-extrabold text-slate-950 block">
                        {metric.value}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block">
                        {metric.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citation Generator Widget */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Academic Citation
                  </h4>
                  <Quote className="w-4 h-4 text-emerald-600" />
                </div>
                
                {/* Select standard */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
                  {(['APA', 'MLA', 'Harvard'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setCitationFormat(format)}
                      className={`flex-1 py-1 rounded transition-colors cursor-pointer border-0 ${
                        citationFormat === format 
                          ? 'bg-white text-emerald-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>

                {/* Citation block */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                  <p className="text-xs text-slate-600 leading-relaxed select-all font-mono text-left">
                    {getFormattedCitation()}
                  </p>
                </div>

                <motion.button
                  onClick={handleCopyCitation}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer"
                  id="copy_citation_btn"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  {copied ? 'Citation Copied!' : 'Copy Citation to Clipboard'}
                </motion.button>
              </div>

              {/* Consultation / Realization banner */}
              <div className="bg-emerald-950 text-white p-6 rounded-3xl space-y-4 shadow-md relative overflow-hidden border border-emerald-900/50">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-800/20 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Feasibility Integration</span>
                </div>
                <h4 className="text-base font-display font-black leading-snug">
                  Implement this study in your organisation?
                </h4>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  The Bioenergy Nexus advisory team provides bespoke chemical feasibility modeling, waste-to-energy system design, and certified professional training.
                </p>
                <div className="pt-2">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <span className="text-[10.5px] text-emerald-100/90 leading-relaxed text-left">
                      Go to the <strong>Advisory Services</strong> tab on the homepage navigation to submit a custom engineering review request.
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Notes / Lab Notebook Tab */
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                Your Laboratory Notebook & Research Journal
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add review comments, laboratory test details, mathematical formulas, or personal operational logs for this paper. These logs are saved locally on your device for rapid scientific retrieval.
              </p>
            </div>

            {/* Note submission form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your research notes, formulas, or implementation parameters..."
                rows={4}
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm outline-none focus:border-emerald-500 focus:bg-white resize-none"
              />
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors border-0 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Note Entry
                </motion.button>
              </div>
            </form>

            {/* Notes collection list */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                Journal Entries ({notes.length})
              </h4>
              
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((noteText, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-50 rounded-2xl flex justify-between gap-4 border border-slate-100 group hover:border-slate-200 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            ENTRY #{notes.length - index}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {noteText}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteNote(index)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer self-start border-0 shrink-0"
                        title="Delete note"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                  <FileText className="w-8 h-8" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-700">Journal empty</h5>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Start writing above to create your first structural log for this research paper.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
