import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Bookmark, 
  Check, 
  Trash2, 
  Lightbulb, 
  Award, 
  Atom, 
  Globe, 
  Compass, 
  Building2,
  X,
  Plus
} from 'lucide-react';

interface Recommendation {
  id: string;
  category: 'Funding' | 'Alliance' | 'Researcher' | 'University' | 'Laboratory' | 'Industry' | 'Challenge';
  title: string;
  source: string;
  compatibility: number; // percentage
  description: string;
  actionLabel: string;
  meta: string;
}

interface AIRecommendationsProps {
  userProfile: any;
  onApplyAction: (rec: Recommendation) => void;
  onSaveAction: (rec: Recommendation) => void;
}

export default function AIRecommendations({
  userProfile,
  onApplyAction,
  onSaveAction,
}: AIRecommendationsProps) {
  // Generate recommendations dynamically based on user profile
  const userInterests = userProfile?.researchInterests || ['Solar Energy', 'Bioenergy', 'Energy Storage'];
  const userCountry = userProfile?.country || 'Nigeria';
  const userAffiliation = userProfile?.institution || 'University of Ibadan';

  // Seed raw database of matching items
  const database: Recommendation[] = [
    {
      id: 'rec_1',
      category: 'Funding',
      title: 'Sub-Saharan Agri-Tech Solar-Bio Hybridization Grant',
      source: 'African Development Bank & UNEP',
      compatibility: 96,
      description: `Funding of up to $75,000 to scale physical circular validation prototypes from TRL-4 up to TRL-6. Focuses heavily on agro-processors in ${userCountry}.`,
      actionLabel: 'Apply for Grant',
      meta: 'Budget: $75,000 USD • Closes in 12 days'
    },
    {
      id: 'rec_2',
      category: 'Alliance',
      title: 'West African Sustainable Energy Storage Syndicate',
      source: 'ECOWAS Center for Renewable Energy (ECREEE)',
      compatibility: 91,
      description: `Collaborative multi-state research syndicate linking academic researchers from ${userAffiliation} with industrial battery storage manufacturers.`,
      actionLabel: 'Join Syndicate',
      meta: '8 Core Institutional Members active'
    },
    {
      id: 'rec_3',
      category: 'Researcher',
      title: 'Dr. Yusuf Bello, Assoc. Prof. of Biomass Systems',
      source: 'Ahmadu Bello University',
      compatibility: 88,
      description: `Highly cited pioneer in biochemical methane extraction and multi-stage anaerobic digestion filters. Matches your expertise in ${userInterests[1] || 'Bioenergy'}.`,
      actionLabel: 'Invite Lead',
      meta: '18 Publications • 3 Shared Connections'
    },
    {
      id: 'rec_4',
      category: 'Laboratory',
      title: 'Industrial Organic Recycled Polymer Processing Center',
      source: 'Council for Scientific and Industrial Research (CSIR)',
      compatibility: 85,
      description: 'Advanced testing infrastructure for evaluating chemical purity and thermal parameters of agro-waste biocomposites.',
      actionLabel: 'Request Lab',
      meta: 'Located in Pretoria • Fully Funded Access for West African Scholars'
    },
    {
      id: 'rec_5',
      category: 'Industry',
      title: 'NexaPower Agritech Grid Co.',
      source: 'NexaPower Industries Ltd',
      compatibility: 89,
      description: `Seeking an academic research lead to write regulatory policy briefs and validate localized battery storage microgrid load algorithms.`,
      actionLabel: 'Partner Up',
      meta: 'Active commercial pipeline'
    },
    {
      id: 'rec_6',
      category: 'Challenge',
      title: 'Zero-Waste Agricultural Feasibility Hackathon',
      source: 'Safaricom Climate Fund',
      compatibility: 84,
      description: `A 48-hour commercialization challenge with a $15,000 seed prize. Build or adapt localized TRL-3 bio-refinery calculators.`,
      actionLabel: 'Enter Challenge',
      meta: 'First prize: $15,000 USD + Mentorship'
    }
  ];

  // Adjust scores dynamically based on matching interests
  const recommendations = database.map(rec => {
    let score = rec.compatibility;
    // Boost score if user interests match recommendation text or category
    userInterests.forEach(interest => {
      if (rec.title.toLowerCase().includes(interest.toLowerCase()) || 
          rec.description.toLowerCase().includes(interest.toLowerCase())) {
        score = Math.min(99, score + 4);
      }
    });
    return { ...rec, compatibility: score };
  }).sort((a, b) => b.compatibility - a.compatibility);

  const [items, setItems] = useState<Recommendation[]>(recommendations);
  const [selectedDetails, setSelectedDetails] = useState<Recommendation | null>(null);

  const handleDismiss = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="w-full space-y-6" id="ai_recommendations_section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100/60 dark:border-slate-800 pb-4 w-full" style={{ maxWidth: '1040px' }}>
        <div>
          <h3 className="text-lg font-display font-extrabold flex items-center gap-2" style={{ color: '#4b4b4b' }}>
            <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
            Aurenix Intelligent AI Matches
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium mt-0.5">
            Personalized, real-time targets derived from your active publications, regional focus, and TRL project data.
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" style={{ maxWidth: '1049px' }}>
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -3 }}
                className="w-full bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group"
              >
                {/* Score Indicator Ring */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    {item.compatibility}% Match
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Category */}
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {item.category} MATCH
                  </span>

                  {/* Title */}
                  <div className="space-y-1 pr-14">
                    <h4 className="text-sm font-bold leading-snug line-clamp-2" style={{ color: '#47474e' }}>
                      {item.title}
                    </h4>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-sans font-medium">
                      Source: {item.source}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Meta tag */}
                  <div className="text-[10px] font-sans font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80">
                    {item.meta}
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onApplyAction(item)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer border-0 shadow-sm whitespace-nowrap"
                  >
                    {item.actionLabel}
                  </button>
                  <button
                    onClick={() => onSaveAction(item)}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer border-0"
                    title="Bookmark Recommendation"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDismiss(item.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition cursor-pointer border-0"
                    title="Dismiss"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-3">
          <Lightbulb className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-slate-700">All Recommendations Reviewed</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mx-auto">
              Check back later as Aurenix analyzes more publications and circular technology projects in Africa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
