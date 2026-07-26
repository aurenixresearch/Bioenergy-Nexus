import React, { useState, useMemo } from 'react';
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
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const TESTIMONIAL_FAQS: TestimonialFAQ[] = [
  {
    id: 't-1',
    category: 'chemistry',
    categoryLabel: 'FEEDSTOCK & CHEMISTRY',
    categoryIcon: FlaskConical,
    faqQuestion: 'How reliable are anaerobic digestion yields with variable organic waste in tropical climates?',
    quote: 'We used to suffer unpredictable methane output due to seasonal humidity and feedstock moisture swings in Lagos. Aurenix’s biochemical characterization and moisture-tuned loading algorithms stabilized our biomethane production at 94% efficiency year-round. Their verified datasets saved us over 18 months of trial and error.',
    authorName: 'Dr. Samuel Adebayo',
    authorTitle: 'Process Chemistry Specialist',
    institution: 'University of Lagos (UNILAG)',
    location: 'Lagos, Nigeria',
    initials: 'SA',
    verifiedMetricHighlight: '94.2%',
    verifiedMetricLabel: 'Methane Yield Stability Achieved',
    rating: 5,
  },
  {
    id: 't-2',
    category: 'roi',
    categoryLabel: 'ROI & FEASIBILITY',
    categoryIcon: TrendingUp,
    faqQuestion: 'What is the typical ROI and capital payback period for commercial waste-to-energy projects in West Africa?',
    quote: 'Institutional investors always question capital payback in emerging markets. Aurenix’s bankable feasibility study accurately projected our 3.2-year IRR and levelized cost of energy (LCOE) for a 2MW poultry-waste biogas facility. Financial institutions approved our $4.5M debt financing based directly on their empirical audit.',
    authorName: 'Engr. Chidi Okafor',
    authorTitle: 'Clean Tech Plant Operations Consultant',
    institution: 'Pan-African Energy Infrastructure Fund',
    location: 'Abuja, Nigeria',
    initials: 'CO',
    verifiedMetricHighlight: '$4.5M',
    verifiedMetricLabel: 'Debt Financing Approved',
    rating: 5,
  },
  {
    id: 't-3',
    category: 'regulatory',
    categoryLabel: 'REGULATORY & NDCS',
    categoryIcon: ShieldCheck,
    faqQuestion: 'How do Aurenix feasibility reports align with national environmental regulations and NDCs?',
    quote: 'Navigating national emission reduction targets (NDCs) and EIA compliance often delays projects for years. Aurenix provided rigorous carbon-accounting frameworks and EPA-compliant leachate control protocols that streamlined our regulatory clearance in under 60 days.',
    authorName: 'Dr. Kweku Mensah',
    authorTitle: 'Senior Climate Policy Advisor',
    institution: 'ECOWAS Energy & Climate Directorate',
    location: 'Accra, Ghana',
    initials: 'KM',
    verifiedMetricHighlight: '60-Day',
    verifiedMetricLabel: 'Fast-Track EIA Clearance',
    rating: 5,
  },
  {
    id: 't-4',
    category: 'scaling',
    categoryLabel: 'SCALING & TECHNOLOGY',
    categoryIcon: Building2,
    faqQuestion: 'Can lab-scale biodigester results be reliably scaled to megawatt-capacity industrial plants?',
    quote: 'Scaling up from lab-scale 50L batch digesters to 5,000m³ continuous CSTR reactors usually risks thermal degradation. Aurenix’s computational fluid dynamics modeling and custom inoculum balance made our 1.5MW airport waste pilot scaling seamless without digester acidification.',
    authorName: 'Chief Engr. Tariq Hassan',
    authorTitle: 'VP of Engineering',
    institution: 'GreenGrid Solutions West Africa',
    location: 'Port Harcourt, Nigeria',
    initials: 'TH',
    verifiedMetricHighlight: '1.5 MW',
    verifiedMetricLabel: 'Plant Scaled Zero Downtime',
    rating: 5,
  },
  {
    id: 't-5',
    category: 'training',
    categoryLabel: 'CAPACITY & TRAINING',
    categoryIcon: GraduationCap,
    faqQuestion: 'Does Aurenix provide hands-on technical training for site engineers or just static PDF reports?',
    quote: 'Most consultancies hand over a PDF report and walk away. Aurenix spent 3 weeks on-site training our 14 facility technicians on gas chromatography, pH buffer balance, and safety monitoring. Our operational uptime has stayed above 98% for two straight years.',
    authorName: 'Fatima Alao',
    authorTitle: 'Director of Plant Operations',
    institution: 'West African Circularity Cooperative',
    location: 'Ibadan, Nigeria',
    initials: 'FA',
    verifiedMetricHighlight: '98.5%',
    verifiedMetricLabel: 'Plant Uptime Maintained',
    rating: 5,
  },
  {
    id: 't-6',
    category: 'chemistry',
    categoryLabel: 'FEEDSTOCK & CHEMISTRY',
    categoryIcon: Award,
    faqQuestion: 'How accurate is Aurenix’s chemical composition analysis for agro-industrial waste streams?',
    quote: 'Their proximate and ultimate analysis reports on cassava peel and abattoir effluent are among the most precise in the Sub-Saharan region. We rely on their open-access research papers as benchmark reference data for our postgraduate renewable energy programs.',
    authorName: 'Prof. Elizabeth Nwachukwu',
    authorTitle: 'Head of Chemical Engineering Dept.',
    institution: 'African Institute for Sustainable Sciences',
    location: 'Enugu, Nigeria',
    initials: 'EN',
    verifiedMetricHighlight: '100%',
    verifiedMetricLabel: 'Peer-Reviewed Reference Benchmark',
    rating: 5,
  }
];

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

  const filteredTestimonials = useMemo(() => {
    return TESTIMONIAL_FAQS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesQuery =
        item.faqQuestion.toLowerCase().includes(query) ||
        item.quote.toLowerCase().includes(query) ||
        item.authorName.toLowerCase().includes(query) ||
        item.institution.toLowerCase().includes(query) ||
        item.verifiedMetricLabel.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const activeMobileIndex = useMemo(() => {
    if (filteredTestimonials.length === 0) return 0;
    return Math.min(mobileIndex, Math.max(0, filteredTestimonials.length - 1));
  }, [mobileIndex, filteredTestimonials]);

  const handleNextMobile = () => {
    if (filteredTestimonials.length === 0) return;
    setMobileIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const handlePrevMobile = () => {
    if (filteredTestimonials.length === 0) return;
    setMobileIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  return (
    <section className="py-20 bg-white dark:bg-white border-t border-slate-100 dark:border-slate-200 text-left relative" id="endorsements">
      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-white text-emerald-800 dark:text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs border border-emerald-200">
            <Quote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-600" />
            Empirical Testimonials & Field FAQs
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-slate-900 tracking-tight">
            Answering Key Industry Questions Through Verified Field Results
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Discover how university researchers, project developers, and clean energy managers rely on Aurenix empirical research to derisk bioenergy infrastructure.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="max-w-4xl mx-auto mb-12 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search testimonials by question, keyword (e.g. ROI, yield, UNILAG, cassava)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setMobileIndex(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white border border-slate-200/80 dark:border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setMobileIndex(0);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setMobileIndex(0);
                }}
                className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-white hover:bg-slate-50 dark:hover:bg-slate-50 text-slate-600 dark:text-slate-600 hover:text-slate-900 border border-slate-200/60 dark:border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Container */}
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-white rounded-2xl border border-slate-200/60 dark:border-slate-200 p-8 space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-700">No matching testimonials found</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">Try adjusting your search query or switching categories.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setMobileIndex(0);
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-700 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                      className="bg-white dark:bg-white rounded-[28px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden"
                    >
                      {/* Top Lanyard Badge Clip */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 border border-slate-300 rounded-md shadow-xs flex items-center justify-center z-20 pointer-events-none">
                        <div className="w-5 h-1 bg-slate-400 rounded-full" />
                      </div>

                      <div className="space-y-5 pt-1">
                        {/* Top Row: Category Pill Badge & 5-Star Score */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white text-[#046c4e] dark:text-[#046c4e] border border-emerald-200 rounded-xl text-[11px] font-extrabold uppercase tracking-wider">
                            <CategoryIcon className="w-3.5 h-3.5 text-[#046c4e] dark:text-[#046c4e] shrink-0" />
                            <span>{item.categoryLabel}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-0.5">
                              {[...Array(item.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[11px] font-extrabold text-[#046c4e] dark:text-[#046c4e] mt-0.5">5.0/5</span>
                          </div>
                        </div>

                        {/* FAQ Box */}
                        <div className="bg-white dark:bg-white border border-emerald-200/80 dark:border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#134e38] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                              ?
                            </div>
                            <span className="text-[11px] font-mono font-extrabold text-[#134e38] dark:text-[#134e38] uppercase tracking-wider">
                              FAQ ADDRESSED:
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-900 leading-snug">
                            {item.faqQuestion}
                          </h3>
                        </div>

                        {/* Authentic Quote Box */}
                        <div className="flex items-start gap-3 pt-1">
                          <div className="w-1 bg-[#059669] rounded-full shrink-0 self-stretch min-h-[60px]" />
                          <div className="space-y-1">
                            <span className="text-emerald-300 font-serif text-4xl leading-none select-none block -mb-2">“</span>
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-800 italic leading-relaxed font-sans">
                              "{item.quote}"
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        {/* Verified Metric Bar with Upward Sparkline */}
                        <div className="bg-white dark:bg-white border border-emerald-200/80 dark:border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between relative overflow-hidden">
                          <div className="flex items-center gap-2.5 z-10">
                            <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4 h-4 text-[#046c4e] dark:text-[#046c4e]" />
                            </div>
                            <div className="text-xs sm:text-sm">
                              <span className="font-extrabold text-[#046c4e] dark:text-[#046c4e] mr-1.5">{item.verifiedMetricHighlight}</span>
                              <span className="font-medium text-slate-800 dark:text-slate-800">{item.verifiedMetricLabel}</span>
                            </div>
                          </div>

                          {/* Sparkline curve */}
                          <svg className="w-24 h-8 text-emerald-500 overflow-visible shrink-0 opacity-80 z-0" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 26 Q 20 23, 35 18 T 65 14 T 85 8 T 98 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                            <circle cx="98" cy="4" r="3.5" fill="currentColor" />
                            <path d="M0 26 Q 20 23, 35 18 T 65 14 T 85 8 T 98 4 L 98 30 L 0 30 Z" fill="url(#sparkline-gradient-2)" opacity="0.25" />
                            <defs>
                              <linearGradient id="sparkline-gradient-2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>

                        {/* Divider line */}
                        <div className="border-t border-slate-100 dark:border-slate-200" />

                        {/* Author Details */}
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-[#0d4f37] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs">
                            {item.initials}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-900 truncate">
                              {item.authorName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-500 font-medium truncate">
                              {item.authorTitle}
                            </p>
                            <p className="text-[11px] font-bold text-[#046c4e] dark:text-[#046c4e] truncate">
                              {item.institution} • {item.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Mobile Stacked Card Deck Swiper */}
            <div className="block md:hidden space-y-6 pt-2 pb-4">
              <div className="relative min-h-[520px] w-full flex items-center justify-center">
                {filteredTestimonials.map((item, idx) => {
                  const total = filteredTestimonials.length;
                  let offset = (idx - activeMobileIndex + total) % total;
                  
                  // Only render top 3 cards in the stack
                  if (offset > 2 && offset < total - 1) return null;

                  const isTop = offset === 0;
                  const isBehind1 = offset === 1;
                  const isBehind2 = offset === 2;

                  const CategoryIcon = item.categoryIcon;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      drag={isTop ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, { offset: dragOffset, velocity }) => {
                        if (!isTop) return;
                        if (dragOffset.x < -60 || velocity.x < -200) {
                          handleNextMobile();
                        } else if (dragOffset.x > 60 || velocity.x > 200) {
                          handlePrevMobile();
                        }
                      }}
                      initial={false}
                      animate={{
                        scale: isTop ? 1 : isBehind1 ? 0.94 : isBehind2 ? 0.88 : 0.82,
                        y: isTop ? 0 : isBehind1 ? 14 : isBehind2 ? 28 : 42,
                        zIndex: total - offset,
                        opacity: isTop ? 1 : isBehind1 ? 0.85 : isBehind2 ? 0.5 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 24
                      }}
                      className={`absolute inset-x-0 mx-auto max-w-[340px] bg-white dark:bg-white rounded-[28px] p-6 border border-slate-200/90 dark:border-slate-200 shadow-xl flex flex-col justify-between space-y-5 cursor-grab active:cursor-grabbing select-none ${
                        !isTop ? 'pointer-events-none' : ''
                      }`}
                    >
                      {/* Top Lanyard Badge Clip */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 border border-slate-300 rounded-md shadow-xs flex items-center justify-center z-30 pointer-events-none">
                        <div className="w-5 h-1 bg-slate-400 rounded-full" />
                      </div>

                      <div className="space-y-4 pt-1">
                        {/* Top Row: Category Pill Badge & 5-Star Score */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-white text-[#046c4e] dark:text-[#046c4e] border border-emerald-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider">
                            <CategoryIcon className="w-3 h-3 text-[#046c4e] dark:text-[#046c4e] shrink-0" />
                            <span className="truncate max-w-[140px]">{item.categoryLabel}</span>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            <div className="flex items-center gap-0.5">
                              {[...Array(item.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] font-extrabold text-[#046c4e] dark:text-[#046c4e] mt-0.5">5.0/5</span>
                          </div>
                        </div>

                        {/* FAQ Box */}
                        <div className="bg-white dark:bg-white border border-emerald-200/80 dark:border-emerald-200/80 rounded-2xl p-3.5 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#134e38] text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs">
                              ?
                            </div>
                            <span className="text-[10px] font-mono font-extrabold text-[#134e38] dark:text-[#134e38] uppercase tracking-wider">
                              FAQ ADDRESSED:
                            </span>
                          </div>
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-900 leading-snug">
                            {item.faqQuestion}
                          </h3>
                        </div>

                        {/* Authentic Quote Box */}
                        <div className="flex items-start gap-2.5 pt-0.5">
                          <div className="w-1 bg-[#059669] rounded-full shrink-0 self-stretch min-h-[50px]" />
                          <div className="space-y-0.5">
                            <span className="text-emerald-300 font-serif text-3xl leading-none select-none block -mb-2">“</span>
                            <p className="text-xs text-slate-800 dark:text-slate-800 italic leading-relaxed font-sans line-clamp-4">
                              "{item.quote}"
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        {/* Verified Metric Bar */}
                        <div className="bg-white dark:bg-white border border-emerald-200/80 dark:border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#046c4e] dark:text-[#046c4e]" />
                            </div>
                            <div className="text-[11px]">
                              <span className="font-extrabold text-[#046c4e] dark:text-[#046c4e] mr-1">{item.verifiedMetricHighlight}</span>
                              <span className="font-medium text-slate-800 dark:text-slate-800">{item.verifiedMetricLabel}</span>
                            </div>
                          </div>
                        </div>

                        {/* Author Details */}
                        <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-200">
                          <div className="w-9 h-9 rounded-full bg-[#0d4f37] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                            {item.initials}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-900 truncate">
                              {item.authorName}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium truncate">
                              {item.authorTitle}
                            </p>
                            <p className="text-[10px] font-bold text-[#046c4e] dark:text-[#046c4e] truncate">
                              {item.institution} • {item.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile Navigation & Swipe Controls */}
              <div className="flex items-center justify-between px-4 max-w-sm mx-auto pt-2">
                <button
                  onClick={handlePrevMobile}
                  className="p-3 rounded-full bg-white dark:bg-white border border-slate-200/90 text-slate-700 shadow-xs active:scale-95 transition-transform cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>

                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-700">
                    {activeMobileIndex + 1} of {filteredTestimonials.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {filteredTestimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setMobileIndex(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          i === activeMobileIndex ? 'w-5 bg-emerald-800' : 'w-1.5 bg-slate-300'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextMobile}
                  className="p-3 rounded-full bg-white dark:bg-white border border-slate-200/90 text-slate-700 shadow-xs active:scale-95 transition-transform cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
