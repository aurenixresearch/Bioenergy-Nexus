import React, { useState, useMemo, useEffect } from 'react';
import {
  Quote,
  Star,
  Search,
  HelpCircle,
  ShieldCheck,
  GraduationCap,
  Building2,
  FlaskConical,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Zap,
  Flame,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApprovedTestimonials } from '../services/db';
import TestimonialModal from './TestimonialModal';

export interface TestimonialFAQ {
  id: string;
  category: 'roi' | 'chemistry' | 'regulatory' | 'scaling' | 'training';
  categoryLabel: string;
  categoryIcon: LucideIcon;
  faqQuestion: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  institution: string;
  location: string;
  initials: string;
  verifiedMetricHighlight: string;
  verifiedMetricLabel: string;
  rating: number;
}

const TESTIMONIAL_FAQS: TestimonialFAQ[] = [];

const CATEGORIES = [
  { id: 'all', label: 'All Endorsements & FAQs' },
  { id: 'chemistry', label: 'Feedstock & Chemistry' },
  { id: 'roi', label: 'ROI & Feasibility' },
  { id: 'regulatory', label: 'Regulatory & NDCs' },
  { id: 'scaling', label: 'Scaling & Tech' },
  { id: 'training', label: 'Capacity & Training' },
];

export default function TestimonialsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileIndex, setMobileIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState<boolean>(false);
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);

  useEffect(() => {
    getApprovedTestimonials().then(data => {
      setDbTestimonials(data);
    }).catch(err => {
      console.warn('Could not load approved testimonials:', err);
    });
  }, []);

  // Background Q&A Similarity Engine
  const filteredTestimonials = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return TESTIMONIAL_FAQS.filter((item) => 
        selectedCategory === 'all' || item.category === selectedCategory
      );
    }

    // Tokenize user query into terms
    const stopWords = new Set(['what', 'is', 'the', 'for', 'how', 'does', 'can', 'in', 'a', 'of', 'to', 'and', 'do', 'we', 'aurenix', 'you', 'your', 'my', 'about', 'with', 'are', 'be', 'from', 'on', 'or', 'at', 'by', 'an', 'as', 'it', 'if', 'this', 'that', 'there']);
    const queryTerms = query
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 1 && !stopWords.has(t));

    // Topic Synonym Mapping
    const topicSynonyms: Record<string, string[]> = {
      roi: ['roi', 'payback', 'cost', 'irr', 'money', 'capital', 'financial', 'lcoe', 'profit', 'return', 'investment', 'debt', 'bank', 'bankable', 'price', 'expensive', 'dollar', 'spend', 'expenditure', 'savings'],
      yield: ['yield', 'methane', 'weather', 'temperature', 'tropical', 'humidity', 'moisture', 'efficiency', 'biochemical', 'digestion', 'gas', 'production', 'output', 'stability', 'clogging', 'vfa', 'acidification'],
      regulatory: ['eia', 'regulation', 'regulatory', 'permit', 'ndc', 'compliance', 'epa', 'clearance', 'government', 'directorate', 'policy', 'legal', 'approval', 'law', 'carbon', 'credit', 'grant', 'offset', 'itmo'],
      scaling: ['scale', 'scaling', 'megawatt', 'mw', 'plant', 'cstr', 'industrial', 'capacity', 'reactor', 'pilot', 'lab', 'downtime', 'degradation', 'airport'],
      training: ['train', 'training', 'technician', 'staff', 'operator', 'skill', 'hands-on', 'learn', 'uptime', 'support', 'facility', 'chromatography', 'onsite'],
      feedstock: ['cassava', 'agro', 'waste', 'feedstock', 'abattoir', 'peel', 'effluent', 'chemical', 'accuracy', 'research', 'paper', 'poultry', 'manure', 'organic', 'sludge', 'fertilizer', 'digestate', 'food', 'blood']
    };

    const scoredList = TESTIMONIAL_FAQS.map((item) => {
      let score = 0;
      const itemQuestion = item.faqQuestion.toLowerCase();
      const itemQuote = item.quote.toLowerCase();
      const itemCategory = item.categoryLabel.toLowerCase();
      const itemAuthor = `${item.authorName} ${item.authorTitle} ${item.institution} ${item.location}`.toLowerCase();
      const itemMetric = `${item.verifiedMetricHighlight} ${item.verifiedMetricLabel}`.toLowerCase();

      // Direct full string inclusion
      if (itemQuestion.includes(query)) score += 40;
      if (itemQuote.includes(query)) score += 25;

      // Word matching
      queryTerms.forEach((term) => {
        if (itemQuestion.includes(term)) score += 15;
        if (itemQuote.includes(term)) score += 8;
        if (itemCategory.includes(term)) score += 10;
        if (itemMetric.includes(term)) score += 6;
        if (itemAuthor.includes(term)) score += 5;

        // Synonym checks
        Object.entries(topicSynonyms).forEach(([topicKey, synonyms]) => {
          if (synonyms.includes(term)) {
            if (item.category === topicKey || itemQuestion.includes(topicKey) || itemQuote.includes(topicKey)) {
              score += 12;
            }
          }
        });
      });

      return { item, score };
    });

    // Filter scored list
    let validMatches = scoredList.filter(s => s.score > 0);

    // Fallback substring check if query terms yielded no score
    if (validMatches.length === 0 && query.length > 0) {
      validMatches = scoredList.filter(s => {
        const full = `${s.item.faqQuestion} ${s.item.quote} ${s.item.authorName} ${s.item.institution}`.toLowerCase();
        return queryTerms.some(t => full.includes(t));
      });
    }

    // Filter by selected category if applicable
    if (selectedCategory !== 'all') {
      validMatches = validMatches.filter(s => s.item.category === selectedCategory);
    }

    // Sort descending by score
    validMatches.sort((a, b) => b.score - a.score);

    return validMatches.map(s => s.item);
  }, [selectedCategory, searchQuery]);

  const activeMobileIndex = useMemo(() => {
    if (filteredTestimonials.length === 0) return 0;
    return Math.min(mobileIndex, Math.max(0, filteredTestimonials.length - 1));
  }, [mobileIndex, filteredTestimonials]);

  // Auto-advance cards gently every 6.5s
  useEffect(() => {
    if (filteredTestimonials.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [filteredTestimonials.length, isPaused]);

  const handleNextMobile = () => {
    if (filteredTestimonials.length === 0) return;
    setMobileIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const handlePrevMobile = () => {
    if (filteredTestimonials.length === 0) return;
    setMobileIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  return (
    <section className="py-20 bg-white dark:bg-white text-left relative" id="endorsements">
      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs border border-emerald-200 dark:border-emerald-800">
            <Quote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Empirical Testimonials & Field FAQs
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#208d2c] dark:text-[#208d2c] tracking-tight">
            Answering Key Industry Questions Through Verified Field Results
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#3e3e3e] dark:text-[#bababa] leading-relaxed max-w-2xl mx-auto px-2 sm:px-0">
            Discover how university researchers, project developers, and clean energy managers rely on Aurenix empirical research to derisk bioenergy infrastructure.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsTestimonialModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Submit Your Testimonial</span>
            </button>
          </div>
        </div>

        {/* Category Filter Controls */}
        <div className="max-w-4xl mx-auto mb-10">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto pt-1 pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setMobileIndex(0);
                  const container = document.getElementById('testimonials-cards-container') || document.getElementById('endorsements');
                  if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Container */}
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-8 sm:p-10 space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">No testimonials have been published yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Be the first researcher, institution, or industry partner to share your field experiences.</p>
            </div>
            <button
              onClick={() => setIsTestimonialModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              Share Your Feedback
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Grid Layout (lg screen and above) */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredTestimonials.map((item) => {
                  const CategoryIcon = item.categoryIcon;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md dark:shadow-slate-950/50 transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden text-left"
                    >
                      <div className="space-y-5 pt-1">
                        {/* Top Row: Category Pill Badge & 5-Star Score */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/60 text-[#046c4e] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl text-[11px] font-extrabold uppercase tracking-wider">
                            <CategoryIcon className="w-3.5 h-3.5 text-[#046c4e] dark:text-emerald-400 shrink-0" />
                            <span>{item.categoryLabel}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-0.5">
                              {[...Array(item.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs font-extrabold text-[#046c4e] dark:text-emerald-400 mt-0.5">5.0 / 5.0 Rating</span>
                          </div>
                        </div>

                        {/* FAQ Box */}
                        <div className="bg-slate-50/80 dark:bg-slate-950/80 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                              ?
                            </div>
                            <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                              Common Industry FAQ
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            "{item.faqQuestion}"
                          </p>
                        </div>

                        {/* Empirical Answer / Quote */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Empirical Field Answer & Result
                          </span>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            "{item.quote}"
                          </p>
                        </div>
                      </div>

                      {/* Author & Verified Metric Footer */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                        {/* Highlight Pill */}
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {item.verifiedMetricLabel}
                            </span>
                          </div>
                          <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0 shadow-xs">
                            {item.verifiedMetricHighlight}
                          </span>
                        </div>

                        {/* Author Meta */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {item.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {item.authorName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                              {item.authorTitle} • {item.institution}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                              {item.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Mobile/Tablet Stacked Interactive Cards Deck */}
            <div className="block lg:hidden space-y-6">
              <div 
                id="testimonials-cards-container"
                className="relative min-h-[500px] flex items-center justify-center py-4"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                <AnimatePresence mode="sync">
                  {filteredTestimonials.map((item, idx) => {
                    const total = filteredTestimonials.length;
                    let offset = (idx - activeMobileIndex + total) % total;
                    
                    if (offset > 2 && offset < total - 1) return null;

                    const isTop = offset === 0;
                    const isBehind1 = offset === 1;
                    const isBehind2 = offset === 2;
                    const isBehind3 = offset === total - 1;

                    let rotate = 0;
                    let x = 0;
                    let y = 0;
                    let scale = 1;
                    let opacity = 1;
                    let zIndex = 10 - offset;

                    if (isTop) {
                      rotate = 0;
                      x = 0;
                      y = 0;
                      scale = 1;
                      opacity = 1;
                      zIndex = 20;
                    } else if (isBehind1) {
                      rotate = 0;
                      x = 0;
                      y = 8;
                      scale = 0.97;
                      opacity = 0.92;
                      zIndex = 15;
                    } else if (isBehind2) {
                      rotate = 0;
                      x = 0;
                      y = 16;
                      scale = 0.94;
                      opacity = 0.75;
                      zIndex = 10;
                    } else if (isBehind3) {
                      rotate = 0;
                      x = 0;
                      y = 10;
                      scale = 0.9;
                      opacity = 0;
                      zIndex = 5;
                    }

                    const CategoryIcon = item.categoryIcon;

                    return (
                      <motion.div
                        key={item.id}
                        style={{ zIndex }}
                        drag={isTop ? 'x' : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={(_, info) => {
                          if (!isTop) return;
                          if (info.offset.x > 80) {
                            handlePrevMobile();
                          } else if (info.offset.x < -80) {
                            handleNextMobile();
                          }
                        }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{
                          rotate,
                          x,
                          y,
                          scale,
                          opacity,
                        }}
                        exit={{
                          x: -200,
                          opacity: 0,
                          rotate: -12,
                          scale: 0.85,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 24,
                          mass: 0.8,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileDrag={{ scale: 1.02 }}
                        className={`absolute inset-x-0 mx-auto w-full max-w-[340px] sm:max-w-[480px] md:max-w-[580px] bg-white rounded-[28px] p-5 sm:p-7 border border-slate-200 shadow-xl flex flex-col justify-between space-y-4 sm:space-y-5 cursor-grab active:cursor-grabbing select-none text-left ${
                          !isTop ? 'pointer-events-none' : ''
                        }`}
                      >
                        <div className="space-y-3 sm:space-y-4 pt-1">
                          {/* Top Row: Category Pill Badge & 5-Star Score */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 text-[#046c4e] border border-emerald-200 rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
                              <CategoryIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#046c4e] shrink-0" />
                              <span>{item.categoryLabel}</span>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <div className="flex items-center gap-0.5">
                                {[...Array(item.rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <span className="text-[10px] sm:text-xs font-extrabold text-[#046c4e] mt-0.5">5.0/5</span>
                            </div>
                          </div>

                          {/* FAQ Box */}
                          <div className="bg-slate-50 border border-emerald-200 rounded-2xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 shadow-xs">
                                ?
                              </div>
                              <span className="text-[10px] sm:text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                                FAQ
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              "{item.faqQuestion}"
                            </p>
                          </div>

                          {/* Empirical Answer / Quote */}
                          <div className="space-y-1 sm:space-y-1.5">
                            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                              Field Answer
                            </span>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal line-clamp-4 sm:line-clamp-6">
                              "{item.quote}"
                            </p>
                          </div>
                        </div>

                        {/* Author & Verified Metric Footer */}
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          {/* Highlight Pill */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
                            <span className="text-[11px] sm:text-xs font-medium text-slate-700 truncate">
                              {item.verifiedMetricLabel}
                            </span>
                            <span className="text-[11px] sm:text-xs font-black text-emerald-800 bg-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-emerald-200 shrink-0 shadow-xs">
                              {item.verifiedMetricHighlight}
                            </span>
                          </div>

                          {/* Author Meta */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                              {item.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {item.authorName}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium truncate">
                                {item.authorTitle} • {item.institution}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Centered Navigation Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    handlePrevMobile();
                    document.getElementById('endorsements')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  aria-label="Previous Testimonial"
                  className="p-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {filteredTestimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMobileIndex(i);
                        document.getElementById('endorsements')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      aria-label={`Go to testimonial ${i + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === activeMobileIndex ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    handleNextMobile();
                    document.getElementById('endorsements')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  aria-label="Next Testimonial"
                  className="p-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <TestimonialModal
        isOpen={isTestimonialModalOpen}
        onClose={() => setIsTestimonialModalOpen(false)}
        userId="public_visitor"
      />
    </section>
  );
}

