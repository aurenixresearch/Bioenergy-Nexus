import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Coins, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  HeartOff, 
  X, 
  AlertCircle, 
  ChevronRight, 
  Building, 
  Layers 
} from 'lucide-react';
import { AllianceOpportunity, Project } from './types';
import { getAlliances, getProjects, submitApplication } from '../../services/collaborationDb';
import { RESEARCH_AREAS, INITIAL_MATCH_SCORES, SUPPORT_OPTIONS, COUNTRIES } from './mockData';

interface MarketplaceProps {
  user: any;
  onSignIn: () => void;
  onSuccess: (msg: string) => void;
}

function AllianceCardItem({ 
  alliance, 
  match, 
  isSaved, 
  onSaveToggle, 
  onApply 
}: { 
  key?: React.Key;
  alliance: AllianceOpportunity; 
  match: any; 
  isSaved: boolean; 
  onSaveToggle: (e: React.MouseEvent) => void; 
  onApply: () => void; 
}) {
  const [imgError, setImgError] = useState(false);

  const orgName = alliance.orgName || (alliance as any).organization || 'Research Alliance Partner';
  const orgType = alliance.orgType || 'University / Industry';
  const title = alliance.title || 'Bioenergy Research Collaboration Opportunity';
  const description = alliance.description || 'Joint initiative seeking research proposals for sustainable energy, waste valorization, and decarbonization technologies.';
  const country = alliance.country || 'International';
  const fundingAmount = alliance.fundingAmount || 'Grant Funded';
  const researchAreas = alliance.researchAreas && alliance.researchAreas.length > 0 ? alliance.researchAreas : ['Bioenergy', 'Clean Technology'];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between relative group text-left"
    >
      <div className="space-y-4">
        {/* Header Logo & Save Button */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#012a24] border border-emerald-900/40 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {alliance.logo && !imgError ? (
                <img 
                  src={alliance.logo} 
                  alt={orgName} 
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Building className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#000000] leading-snug truncate transition-colors">
                {orgName}
              </h4>
              <span className="inline-block text-[9.5px] font-mono font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md mt-0.5 uppercase tracking-wider">
                {orgType}
              </span>
            </div>
          </div>
          
          <button
            onClick={onSaveToggle}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-full cursor-pointer transition-all border border-slate-200 shrink-0"
            title={isSaved ? "Saved" : "Save Alliance"}
          >
            {isSaved ? <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" /> : <Heart className="w-4 h-4" />}
          </button>
        </div>

        {/* AI Match Banner */}
        {match && (
          <div className="p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-950">
                <span>AI Strategic Match:</span>
                <span className="text-emerald-900 bg-emerald-200 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold">{match.score}%</span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5 leading-snug">
                {match.matchReasons?.[0] || 'High strategic alignment with research goals.'}
              </p>
            </div>
          </div>
        )}

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-[#17553f] font-display hover:text-emerald-800 transition-colors duration-200 leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#272727] leading-relaxed font-normal">
            {description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {researchAreas.map((area, i) => (
            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-semibold border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Info and Trigger Button */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3.5">
        <div className="flex items-center justify-between text-xs text-slate-700 gap-2">
          <span className="flex items-center gap-1.5 text-[#7b7b7b] text-xs font-semibold truncate">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            {country}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
            <Coins className="w-4 h-4 text-emerald-600" />
            {fundingAmount}
          </span>
        </div>
        
        <button
          onClick={onApply}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          Apply and Upload Research Proposal
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Marketplace({ user, onSignIn, onSuccess }: MarketplaceProps) {
  const [alliances, setAlliances] = useState<AllianceOpportunity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResearchArea, setSelectedResearchArea] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedSupport, setSelectedSupport] = useState('All');
  const [selectedOrgType, setSelectedOrgType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Interaction States
  const [savedAllianceIds, setSavedAllianceIds] = useState<string[]>([]);
  const [selectedAlliance, setSelectedAlliance] = useState<AllianceOpportunity | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      const alls = await getAlliances();
      setAlliances(alls);
      if (user) {
        const projs = await getProjects(user.uid);
        setProjects(projs);
      }
    }
    loadData();
    
    // Load bookmarks
    const bookmarked = localStorage.getItem(`saved_alliances_${user?.uid || 'guest'}`);
    if (bookmarked) setSavedAllianceIds(JSON.parse(bookmarked));
  }, [user]);

  const handleSaveToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (savedAllianceIds.includes(id)) {
      updated = savedAllianceIds.filter(item => item !== id);
    } else {
      updated = [...savedAllianceIds, id];
    }
    setSavedAllianceIds(updated);
    localStorage.setItem(`saved_alliances_${user?.uid || 'guest'}`, JSON.stringify(updated));
    onSuccess(savedAllianceIds.includes(id) ? 'Opportunity removed from bookmarks.' : 'Opportunity bookmarked successfully!');
  };

  const handleApplyClick = (alliance: AllianceOpportunity) => {
    if (!user) {
      onSignIn();
      return;
    }
    setSelectedAlliance(alliance);
    setErrorMsg('');
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setErrorMsg('Please select one of your published projects to submit for this alliance.');
      return;
    }
    if (!selectedAlliance) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const matchedProject = projects.find(p => p.id === selectedProjectId);
      await submitApplication({
        projectId: selectedProjectId,
        opportunityId: selectedAlliance.id,
        applicantId: user.uid,
        applicantName: user.displayName || 'Lead Scholar',
        projectTitle: matchedProject?.title || 'Joint Study',
        status: 'Submitted',
        timelineStep: 1
      });

      onSuccess(`Successfully applied to alliance: ${selectedAlliance.title}!`);
      setSelectedAlliance(null);
      setSelectedProjectId('');
    } catch (err) {
      setErrorMsg('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Automated Match Scoring calculator (based on researchArea alignment)
  const getMatchDetails = (alliance: AllianceOpportunity) => {
    if (!projects || projects.length === 0 || !alliance) return null;
    
    // Check if we have precalculated scores
    const precalculated = INITIAL_MATCH_SCORES.find(
      s => s.opportunityId === alliance.id && projects.some(p => p.id === s.projectId)
    );
    if (precalculated) return precalculated;

    const resAreas = alliance.researchAreas || [];
    const techAreas = alliance.technologyAreas || [];
    const countries = alliance.eligibleCountries || [];

    // Dynamically calculate matching score
    const bestMatch = projects.map(p => {
      let score = 50; // base score
      const reasons: string[] = [];
      
      if ((resAreas.length > 0 && p.researchArea === resAreas[0]) || resAreas.includes(p.researchArea)) {
        score += 30;
        reasons.push('High research area alignment');
      }
      if (techAreas.includes(p.technologyArea)) {
        score += 15;
        reasons.push('Technology core match');
      }
      if (countries.includes(p.country)) {
        score += 10;
        reasons.push('Country eligibility verified');
      }
      
      score = Math.min(score, 99);
      return { score, projectId: p.id, matchReasons: reasons };
    }).sort((a, b) => b.score - a.score)[0];

    if (bestMatch && bestMatch.score > 60) {
      return {
        score: bestMatch.score,
        projectId: bestMatch.projectId,
        matchReasons: bestMatch.matchReasons.length > 0 ? bestMatch.matchReasons : ['General alignment in bio-energy and circular processes']
      };
    }
    return null;
  };

  const filteredAlliances = alliances.filter(all => {
    const query = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !query || 
                          (all?.title || '').toLowerCase().includes(query) || 
                          (all?.orgName || '').toLowerCase().includes(query) ||
                          (all?.description || '').toLowerCase().includes(query);
    
    const matchesResearch = selectedResearchArea === 'All' || (all?.researchAreas || []).includes(selectedResearchArea);
    const matchesCountry = selectedCountry === 'All' || (all?.eligibleCountries || []).includes(selectedCountry);
    const matchesSupport = selectedSupport === 'All' || (all?.supportOffered || []).includes(selectedSupport);
    const matchesOrgType = selectedOrgType === 'All' || all?.orgType === selectedOrgType;

    return matchesSearch && matchesResearch && matchesCountry && matchesSupport && matchesOrgType;
  });

  return (
    <div className="space-y-8 text-left" id="alliance_marketplace_section">
      
      {/* Search Header and Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-grow max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alliances, grants, universities, investors..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showFilters || selectedCountry !== 'All' || selectedResearchArea !== 'All' || selectedSupport !== 'All' || selectedOrgType !== 'All'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {showFilters ? 'Active' : ''}
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white p-5 rounded-3xl border border-slate-200/60"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600">Research Focus Area</label>
                <select
                  value={selectedResearchArea}
                  onChange={(e) => setSelectedResearchArea(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                >
                  <option value="All">All Areas</option>
                  {RESEARCH_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600">Eligible Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                >
                  <option value="All">All Countries</option>
                  {COUNTRIES.map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600">Support Offered</label>
                <select
                  value={selectedSupport}
                  onChange={(e) => setSelectedSupport(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                >
                  <option value="All">All Offerings</option>
                  {SUPPORT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600">Stakeholder Type</label>
                <select
                  value={selectedOrgType}
                  onChange={(e) => setSelectedOrgType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="University">Universities</option>
                  <option value="Industry">Industry Partnerships</option>
                  <option value="Government">Government / Regulators</option>
                  <option value="NGO">NGOs / Civil Cooperatives</option>
                  <option value="Investor">Venture Capital / Angel Investors</option>
                  <option value="International Organization">International Funds (UN, World Bank)</option>
                </select>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alliance Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlliances.map((alliance) => {
          const match = getMatchDetails(alliance);
          const isSaved = savedAllianceIds.includes(alliance.id);
          
          return (
            <AllianceCardItem
              key={alliance.id}
              alliance={alliance}
              match={match}
              isSaved={isSaved}
              onSaveToggle={(e) => handleSaveToggle(alliance.id, e)}
              onApply={() => {
                window.history.pushState(null, '', `/alliances/${alliance.id}`);
                window.dispatchEvent(new Event('popstate'));
              }}
            />
          );
        })}
      </div>

      {/* FAST SUBMIT APPLICATION MODAL */}
      <AnimatePresence>
        {selectedAlliance && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedAlliance(null)}
                className="absolute top-6 right-6 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">Fast-Track Application</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 font-display">
                  Submit Research Proposal
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are applying to the alliance: <strong className="text-slate-700">{selectedAlliance.title}</strong> by <span className="text-slate-700 font-semibold">{selectedAlliance.orgName}</span>.
                </p>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Select active project from your profile</label>
                    {projects.length > 0 ? (
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition bg-white"
                      >
                        <option value="">-- Choose project --</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <p className="text-xs text-slate-500">You do not have any published projects to apply with.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAlliance(null);
                            const btn = document.getElementById('btn_publish_collab_project');
                            if (btn) btn.click();
                          }}
                          className="mt-2.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        >
                          + Create a Project first
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedAlliance(null)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || projects.length === 0}
                      className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? 'Submitting...' : 'Apply Now'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
