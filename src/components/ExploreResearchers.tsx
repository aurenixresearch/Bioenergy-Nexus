import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  BadgeCheck,
  MapPin, 
  Eye, 
  Award, 
  FileText, 
  ArrowLeft, 
  Globe, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  RefreshCw, 
  UserPlus, 
  UserCheck, 
  Sparkles, 
  TrendingUp, 
  Download, 
  ArrowRight, 
  Heart, 
  Share2, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  FileCheck,
  Map,
  BadgeAlert,
  SlidersHorizontal,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Researcher, Publication } from '../types';
import { 
  getResearchers, 
  getPublications, 
  followResearcher, 
  incrementResearcherMetric, 
  incrementPublicationMetric,
  isIndividualResearcherRole
} from '../services/db';
import { checkMessagingEligibility } from '../services/messagingDb';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq';

interface ExploreResearchersProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  selectedResearcherId?: string | null;
  onSelectResearcherId?: (id: string | null) => void;
  onNavigateToMessages?: (targetUserId: string) => void;
  onNavigateToProfile?: () => void;
}

export default function ExploreResearchers({ 
  user, 
  onSignIn,
  selectedResearcherId: propSelectedResearcherId,
  onSelectResearcherId,
  onNavigateToMessages,
  onNavigateToProfile
}: ExploreResearchersProps) {
  // Data State
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedInterest, setSelectedInterest] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'joined' | 'published' | 'citations' | 'views'>('joined');
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Active View State: list or profile ID (synced with props or falls back to local state)
  const [localSelectedResearcherId, setLocalSelectedResearcherId] = useState<string | null>(null);
  const selectedResearcherId = propSelectedResearcherId !== undefined ? propSelectedResearcherId : localSelectedResearcherId;
  const setSelectedResearcherId = (id: string | null) => {
    if (onSelectResearcherId) {
      onSelectResearcherId(id);
    } else {
      setLocalSelectedResearcherId(id);
    }
  };

  // Active Region Filter for "Around Africa" tab
  const [activeRegion, setActiveRegion] = useState<'All' | 'West' | 'East' | 'North' | 'Southern' | 'Central'>('All');

  // Load Initial Data
  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [resData, pubData] = await Promise.all([
        getResearchers(),
        getPublications()
      ]);
      setResearchers(resData);
      setPublications(pubData);
    } catch (err) {
      console.error('Error loading researchers data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdated = () => {
      loadData(true);
    };
    window.addEventListener('researchers-updated', handleUpdated);
    window.addEventListener('user-profile-updated', handleUpdated);
    return () => {
      window.removeEventListener('researchers-updated', handleUpdated);
      window.removeEventListener('user-profile-updated', handleUpdated);
    };
  }, []);

  // Sync / Refresh handler
  const handleRefresh = () => {
    loadData(true);
  };

  // Strict subset of verified individual researchers (excluding organizations, industry entities, NGOs, funders)
  const validResearchers = useMemo(() => {
    return researchers.filter(r => isIndividualResearcherRole(r.role, r));
  }, [researchers]);

  // Helper lists derived from current dataset
  const uniqueCountries = useMemo(() => {
    const countries = validResearchers.map(r => r.country);
    return ['All', ...Array.from(new Set(countries))].sort();
  }, [validResearchers]);

  const uniqueInterests = useMemo(() => {
    const interests = validResearchers.flatMap(r => r.researchInterests);
    return ['All', ...Array.from(new Set(interests))].sort();
  }, [validResearchers]);

  // Map Countries to African Regions
  const getRegionForCountry = (country: string): 'West' | 'East' | 'North' | 'Southern' | 'Central' | 'Other' => {
    const west = ['Nigeria', 'Senegal', 'Ghana', 'Mali', 'Ivory Coast', 'Liberia', 'Sierra Leone', 'Gambia', 'Guinea'];
    const east = ['Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Somalia', 'Eritrea', 'Djibouti', 'South Sudan'];
    const north = ['Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan'];
    const southern = ['South Africa', 'Zimbabwe', 'Zambia', 'Mozambique', 'Namibia', 'Botswana', 'Angola', 'Malawi', 'Lesotho', 'Eswatini'];
    const central = ['Cameroon', 'Congo', 'DR Congo', 'Gabon', 'Chad', 'Central African Republic', 'Equatorial Guinea'];

    if (west.includes(country)) return 'West';
    if (east.includes(country)) return 'East';
    if (north.includes(country)) return 'North';
    if (southern.includes(country)) return 'Southern';
    if (central.includes(country)) return 'Central';
    return 'Other';
  };

  // Role Badge Icon mapper
  const getRoleIcon = (role?: string) => {
    const r = (role || '').toLowerCase();
    if (r.includes('student') || r.includes('candidate') || r.includes('postdoc') || r.includes('graduate')) return GraduationCap;
    if (r.includes('professor') || r.includes('lecturer') || r.includes('faculty') || r.includes('dean') || r.includes('chair')) return Award;
    if (r.includes('scholar') || r.includes('fellow') || r.includes('independent')) return BookOpen;
    return BookOpen;
  };

  // Message Notice State
  const [messageNotice, setMessageNotice] = useState<string | null>(null);

  // Message Handler
  const handleMessageResearcher = async (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessageNotice(null);

    if (!user) {
      onSignIn();
      return;
    }

    if (user.uid === targetId) {
      setMessageNotice("You cannot message yourself.");
      return;
    }

    const eligibility = await checkMessagingEligibility(user.uid, targetId);
    if (eligibility.eligible) {
      if (onNavigateToMessages) {
        onNavigateToMessages(targetId);
      }
    } else {
      setMessageNotice(eligibility.reason || "Private messaging requires a mutual follow connection or an approved collaboration application.");
    }
  };

  // Follow Researcher Handler
  const handleFollowToggle = async (researcherId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onSignIn();
      return;
    }

    try {
      const isFollowingNow = await followResearcher(user.uid, researcherId);
      // Increment views on follow action for visual premium feedback
      await incrementResearcherMetric(researcherId, 'views');
      
      // Update local state smoothly
      setResearchers(prev => prev.map(r => {
        if (r.id === researcherId) {
          let followers = [...r.followers];
          if (isFollowingNow) {
            if (!followers.includes(user.uid)) followers.push(user.uid);
          } else {
            followers = followers.filter(id => id !== user.uid);
          }
          return { ...r, followers, views: r.views + 1 };
        }
        return r;
      }));
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  // View Researcher Detail Action
  const handleViewProfile = async (id: string) => {
    setSelectedResearcherId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      await incrementResearcherMetric(id, 'views');
      setResearchers(prev => prev.map(r => r.id === id ? { ...r, views: r.views + 1 } : r));
    } catch (err) {
      console.error('Error tracking profile view:', err);
    }
  };

  // Filter & Search Logic (Strictly restricted to individual researchers, professors, and scholars)
  const filteredResearchers = useMemo(() => {
    return validResearchers.filter(r => {
      // Search Box matching
      const query = (searchQuery || '').toLowerCase().trim();
      const matchesSearch = !query || 
        (r.fullName || '').toLowerCase().includes(query) ||
        (r.institution || '').toLowerCase().includes(query) ||
        (r.country || '').toLowerCase().includes(query) ||
        (r.researchInterests || []).some(i => (i || '').toLowerCase().includes(query));

      // Role Filter (Individual categories)
      const userRoleLower = (r.role || '').toLowerCase();
      const matchesRole = selectedRole === 'All' || 
        (selectedRole === 'Researchers' && (userRoleLower.includes('researcher') || userRoleLower.includes('scientist') || userRoleLower.includes('investigator') || userRoleLower.includes('fellow') || userRoleLower.includes('specialist'))) ||
        (selectedRole === 'Professors' && (userRoleLower.includes('professor') || userRoleLower.includes('chair') || userRoleLower.includes('dean'))) ||
        (selectedRole === 'Lecturers' && (userRoleLower.includes('lecturer') || userRoleLower.includes('faculty') || userRoleLower.includes('instructor') || userRoleLower.includes('academic'))) ||
        (selectedRole === 'Students & Postdocs' && (userRoleLower.includes('student') || userRoleLower.includes('phd') || userRoleLower.includes('postdoc') || userRoleLower.includes('candidate') || userRoleLower.includes('graduate'))) ||
        (selectedRole === 'Independent Scholars' && (userRoleLower.includes('scholar') || userRoleLower.includes('independent') || userRoleLower.includes('individual') || userRoleLower.includes('consultant')));

      // Country Filter
      const matchesCountry = selectedCountry === 'All' || r.country === selectedCountry;

      // Interest Filter
      const matchesInterest = selectedInterest === 'All' || r.researchInterests.includes(selectedInterest);

      // Verified check
      const matchesVerified = !onlyVerified || r.verified;

      // Region Filter (Around Africa tab)
      const matchesRegion = activeRegion === 'All' || getRegionForCountry(r.country) === activeRegion;

      return matchesSearch && matchesRole && matchesCountry && matchesInterest && matchesVerified && matchesRegion;
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'published') return b.publicationCount - a.publicationCount;
      if (sortBy === 'citations') return b.citations - a.citations;
      if (sortBy === 'views') return b.views - a.views;
      // Default / recently joined
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [validResearchers, searchQuery, selectedRole, selectedCountry, selectedInterest, sortBy, onlyVerified, activeRegion]);

  // Selected Researcher Object for Profile View
  const selectedResearcher = useMemo(() => {
    if (!selectedResearcherId) return null;
    return validResearchers.find(r => r.id === selectedResearcherId) || null;
  }, [validResearchers, selectedResearcherId]);

  // Publications for selected researcher
  const selectedPublications = useMemo(() => {
    if (!selectedResearcherId) return [];
    return publications.filter(p => p.researcherId === selectedResearcherId);
  }, [publications, selectedResearcherId]);

  // Recommended researchers ("You may also like")
  const recommendedResearchers = useMemo(() => {
    if (!selectedResearcher) return [];
    return validResearchers
      .filter(r => r.id !== selectedResearcher.id)
      .map(r => {
        // Calculate overlap score
        const interestOverlap = r.researchInterests.filter(i => selectedResearcher.researchInterests.includes(i)).length;
        const sameCountry = r.country === selectedResearcher.country ? 2 : 0;
        const sameRole = r.role === selectedResearcher.role ? 1 : 0;
        return { researcher: r, score: interestOverlap + sameCountry + sameRole };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.researcher);
  }, [validResearchers, selectedResearcher]);

  // Handles downloading/viewing mock publication with metric increment
  const handleDownloadPublication = async (pubId: string, pdfUrl: string) => {
    try {
      await incrementPublicationMetric(pubId, 'downloads');
      setPublications(prev => prev.map(p => p.id === pubId ? { ...p, downloads: p.downloads + 1 } : p));
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Error tracking download metric:', err);
    }
  };

  const handleViewPublication = async (pubId: string) => {
    try {
      await incrementPublicationMetric(pubId, 'views');
      setPublications(prev => prev.map(p => p.id === pubId ? { ...p, views: p.views + 1 } : p));
    } catch (err) {
      console.error('Error tracking paper view metric:', err);
    }
  };

  // Top Authors (Highest Publications)
  const topAuthors = useMemo(() => {
    return [...validResearchers].sort((a, b) => b.publicationCount - a.publicationCount).slice(0, 3);
  }, [validResearchers]);

  // Recently Joined (Newest first, horizontal list)
  const recentlyJoined = useMemo(() => {
    return [...validResearchers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [validResearchers]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800" id="explore_researchers_root">
      
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-slate-100 relative overflow-hidden py-16 text-left" id="explore_header">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20"></div>
        <div className="absolute -top-40 -left-4 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-4 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            African Energy Experts Hub
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-slate-900 leading-none">
            Explore <span className="text-emerald-600">Researchers</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-3xl leading-relaxed">
            Discover African researchers, professors, scientists, scholars, and postgraduate students advancing sustainable bioenergy and clean tech innovation. Connect directly with individual academic minds driving energy transition.
          </p>
        </div>
      </div>

      <div className="w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Render Single Researcher Profile View if Selected */}
        <AnimatePresence mode="wait">
          {selectedResearcher ? (
            <motion.div
              key="profile-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 text-left"
              id="researcher_profile_container"
            >
              {/* Back Button */}
              <button 
                onClick={() => setSelectedResearcherId(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                id="back_to_explorers_list"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Exploration Hub
              </button>

              {/* Profile Card Header */}
              <div className="bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <TrendingUp className="w-40 h-40 text-emerald-900" />
                </div>

                {/* Left Side: Avatar */}
                <div className="shrink-0">
                  <img 
                    src={selectedResearcher.profilePhoto || DEFAULT_AVATAR} 
                    alt={selectedResearcher.fullName} 
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                    className="w-28 h-28 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-md"
                  />
                </div>

                {/* Middle: Details */}
                <div className="flex-grow space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                      {React.createElement(getRoleIcon(selectedResearcher.role), { className: "w-3 h-3" })}
                      {selectedResearcher.role}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/50 text-slate-600 text-[10px] font-mono rounded-lg flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {selectedResearcher.country}
                    </span>
                    {user && user.uid === selectedResearcher.id && (
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-md shadow-xs">
                        You
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 flex-wrap">
                    <span>{selectedResearcher.fullName}</span>
                    {selectedResearcher.verified && (
                      <span title="Verified Expert" className="inline-flex items-center">
                        <BadgeCheck className="w-6 h-6 text-white fill-emerald-600 shrink-0" />
                      </span>
                    )}
                  </h2>

                  <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    {selectedResearcher.institution}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedResearcher.researchInterests.map((interest, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-[10px] font-semibold rounded-md transition-colors">
                        #{interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Side: Follow / Connect / Message actions */}
                <div className="w-full md:w-auto flex flex-col gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  {user && user.uid === selectedResearcher.id ? (
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                      <div className="w-full md:w-52 py-3 px-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs">
                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Your Public Profile (Active)</span>
                      </div>
                      {onNavigateToProfile && (
                        <button
                          onClick={onNavigateToProfile}
                          className="w-full md:w-52 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 text-emerald-400 shrink-0" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                      <button
                        onClick={(e) => handleFollowToggle(selectedResearcher.id, e)}
                        className={`w-full md:w-52 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          user && selectedResearcher.followers.includes(user.uid)
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                        }`}
                      >
                        {user && selectedResearcher.followers.includes(user.uid) ? (
                          <>
                            <UserCheck className="w-4 h-4 shrink-0" />
                            Following Scientist
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 shrink-0" />
                            Follow Scientist
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => handleMessageResearcher(selectedResearcher.id, e)}
                        className="w-full md:w-52 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
                        title="Send Private Message"
                      >
                        <MessageSquare className="w-4 h-4 shrink-0 text-emerald-400" />
                        Message Scholar
                      </button>
                    </div>
                  )}

                  {/* Messaging Restriction Alert Notice */}
                  {messageNotice && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[10px] text-amber-900 leading-snug max-w-xs mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                      <span>{messageNotice}</span>
                    </div>
                  )}

                  <div className="text-center text-[10px] font-mono text-slate-400 mt-1">
                    {selectedResearcher.followers.length} Followers • Joined {new Date(selectedResearcher.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>

              {/* Two-Column Details Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col (1/3): Biography, Stats, Contacts */}
                <div className="space-y-6 lg:col-span-1">
                  
                  {/* Stats Box */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Scientist Metrics</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-50 border border-slate-100/50 rounded-2xl text-center">
                        <span className="block text-xl font-display font-black text-slate-900">{selectedResearcher.publicationCount}</span>
                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Publications</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-100/50 rounded-2xl text-center">
                        <span className="block text-xl font-display font-black text-slate-900">{selectedResearcher.citations}</span>
                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Citations</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-100/50 rounded-2xl text-center">
                        <span className="block text-xl font-display font-black text-slate-900">{selectedResearcher.views}</span>
                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Profile Views</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-100/50 rounded-2xl text-center">
                        <span className="block text-xl font-display font-black text-slate-900">{selectedResearcher.downloads}</span>
                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">PDF Downloads</span>
                      </div>
                    </div>
                  </div>

                  {/* External Profiles and Contact */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Scholarly Identity</h3>
                    
                    <div className="space-y-2">
                      {selectedResearcher.email && (
                        <a 
                          href={`mailto:${selectedResearcher.email}`}
                          className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-800 border border-transparent hover:border-emerald-100 transition-all cursor-pointer"
                        >
                          <Mail className="w-4.5 h-4.5 text-slate-400 group-hover:text-emerald-600" />
                          <span className="truncate">{selectedResearcher.email}</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-40 shrink-0" />
                        </a>
                      )}
                      
                      {selectedResearcher.linkedin && (
                        <a 
                          href={selectedResearcher.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
                        >
                          <Linkedin className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                          <span>Professional LinkedIn</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-40 shrink-0" />
                        </a>
                      )}

                      {selectedResearcher.googleScholar && (
                        <a 
                          href={selectedResearcher.googleScholar}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
                        >
                          <Award className="w-4.5 h-4.5 text-yellow-600 shrink-0" />
                          <span>Google Scholar citations</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-40 shrink-0" />
                        </a>
                      )}

                      {selectedResearcher.orcid && (
                        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-500">
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded">ORCID</span>
                          <span className="font-mono text-[11px] truncate">{selectedResearcher.orcid}</span>
                        </div>
                      )}

                      {selectedResearcher.website && (
                        <a 
                          href={selectedResearcher.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
                        >
                          <Globe className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                          <span>University Directory</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-40 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Qualifications & Academic Background */}
                  {selectedResearcher.qualifications && selectedResearcher.qualifications.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Academic Background</h3>
                      <div className="space-y-3">
                        {selectedResearcher.qualifications.map((q, idx) => (
                          <div key={idx} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed items-start">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{q}</span>
                          </div>
                        ))}
                        {selectedResearcher.experienceYears && (
                          <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{selectedResearcher.experienceYears} Years Active Research</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Col (2/3): Biography Narrative & Publications List */}
                <div className="space-y-6 lg:col-span-2">
                  
                  {/* Biography Detailed Text */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">Biography Narrative</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                      {selectedResearcher.bio}
                    </p>
                  </div>

                  {/* Publications Feed */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-display font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Published Research Papers ({selectedPublications.length})
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        Verified Peer-Review
                      </span>
                    </div>

                    {selectedPublications.length === 0 ? (
                      <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400 space-y-2">
                        <BadgeAlert className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No direct publications listed in our repository yet.</p>
                        <p className="text-[10px] text-slate-400">Check external Scholar indices for other publications.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedPublications.map((pub) => (
                          <div 
                            key={pub.id} 
                            className="bg-white border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-sm rounded-3xl p-5 sm:p-6 text-left transition-all relative overflow-hidden"
                          >
                            <div className="space-y-3.5">
                              {/* Metadata line */}
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-400">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {pub.category}
                                </span>
                                <span>•</span>
                                <span>Published {new Date(pub.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                              </div>

                              {/* Title */}
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                {pub.title}
                              </h4>

                              {/* Abstract */}
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {pub.abstract}
                              </p>

                              {/* Keywords */}
                              <div className="flex flex-wrap gap-1">
                                {pub.keywords.map((kw, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-slate-50 border border-slate-150 text-slate-400 text-[9px] font-semibold rounded">
                                    {kw}
                                  </span>
                                ))}
                              </div>

                              {/* Footer Actions / Stats */}
                              <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-3">
                                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    {pub.views} Views
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Download className="w-3.5 h-3.5" />
                                    {pub.downloads} Downloads
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                                    {pub.citations} Citations
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewPublication(pub.id)}
                                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
                                  >
                                    Inspect Abstract
                                  </button>
                                  <button
                                    onClick={() => handleDownloadPublication(pub.id, pub.pdfUrl)}
                                    className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" />
                                    Get PDF Document
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommendation: "You may also like" */}
                  {recommendedResearchers.length > 0 && (
                    <div className="space-y-4 pt-4">
                      <h3 className="text-sm font-display font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        You may also like (Related Researchers)
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendedResearchers.map((rec) => (
                          <div 
                            key={rec.id}
                            onClick={() => handleViewProfile(rec.id)}
                            className="bg-white border border-slate-100 hover:border-emerald-500/30 rounded-2xl p-4 text-center cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 relative"
                          >
                            <img 
                              src={rec.profilePhoto} 
                              alt={rec.fullName} 
                              className="w-14 h-14 rounded-full mx-auto object-cover border border-slate-200 shadow-sm mb-3"
                            />
                            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1 px-1">
                              <span className="truncate">{rec.fullName}</span>
                              {rec.verified && (
                                <span title="Verified Expert">
                                  <BadgeCheck className="w-3.5 h-3.5 text-white fill-emerald-600 shrink-0" />
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-emerald-700 font-mono font-semibold truncate mb-1">{rec.role}</p>
                            <p className="text-[9px] text-slate-400 truncate flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-300" />
                              {rec.country}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          ) : (
            
            // --- MAIN DISCOVERY PAGE HUB ---
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-10"
              id="explorers_dashboard"
            >
              {/* User Profile Status Banner */}
              {user && (
                <div>
                  {validResearchers.some(r => r.id === user.uid) ? (
                    <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xs shrink-0">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-950">Your Public Profile is Live</h3>
                            <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 text-[9px] font-black uppercase tracking-wider rounded-full">Visible to all users</span>
                          </div>
                          <p className="text-[11px] text-emerald-800/90 mt-0.5">Other scholars, universities, and partners can explore your research papers, follow you, and send messages.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        <button
                          onClick={() => handleViewProfile(user.uid)}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Your Card</span>
                        </button>
                        {onNavigateToProfile && (
                          <button
                            onClick={onNavigateToProfile}
                            className="px-3.5 py-2 bg-white hover:bg-emerald-100/50 text-emerald-900 border border-emerald-300/80 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Edit Profile
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-extrabold text-amber-950">Want to appear on this Researchers Hub?</h3>
                          <p className="text-[11px] text-amber-800/90 mt-0.5">Complete your public profile (photo, bio, institution, country, and interests) so other researchers across Africa can discover your work.</p>
                        </div>
                      </div>
                      {onNavigateToProfile && (
                        <button
                          onClick={onNavigateToProfile}
                          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-extrabold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
                        >
                          <span>Complete Profile Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Top Row: Search & Filters Bar */}
              <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 shadow-xs sm:shadow-sm space-y-3.5 sm:space-y-4 text-left" id="search_and_filters_box">
                
                {/* Search Bar Row */}
                <div className="flex flex-row gap-2 sm:gap-3 items-center">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search researchers by name, institution, country, or interest..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 sm:pl-12 pr-8 sm:pr-12 py-2.5 sm:py-3.5 bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-500 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold focus:ring-1 focus:ring-emerald-500/20 transition-all focus:outline-none placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] sm:text-xs font-bold font-mono px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>

                  {/* Refresh Indicator */}
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl sm:rounded-2xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 shrink-0"
                    title="Refresh database"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>

                {/* Filter Grid */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                      Filter Specialists by Category / Role
                    </h3>
                    
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 select-none cursor-pointer bg-slate-50/80 sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-xl border sm:border-0 border-slate-200/60 w-fit">
                      <input 
                        type="checkbox" 
                        checked={onlyVerified}
                        onChange={(e) => setOnlyVerified(e.target.checked)}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 bg-slate-50 border-slate-300 rounded focus:ring-emerald-500/20 cursor-pointer"
                      />
                      <span>Verified Experts Only</span>
                    </label>
                  </div>

                  {/* Role Selection Chips - Touch scrollable on mobile */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none sm:flex-wrap">
                    {['All', 'Researchers', 'Professors', 'Lecturers', 'Students & Postdocs', 'Independent Scholars'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedRole === role
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  {/* Multi Dropdowns (Country & Interest & Sorting) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* Country Filter */}
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Country Origin</span>
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full py-2 px-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
                      >
                        <option value="All">All African Countries</option>
                        {uniqueCountries.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Research Interest Filter */}
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Primary Interest</span>
                      <select
                        value={selectedInterest}
                        onChange={(e) => setSelectedInterest(e.target.value)}
                        className="w-full py-2 px-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
                      >
                        <option value="All">All Research Interests</option>
                        {uniqueInterests.filter(i => i !== 'All').map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Sorting Metrics</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full py-2 px-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
                      >
                        <option value="joined">Recently Joined Scientists</option>
                        <option value="published">Most Published Research</option>
                        <option value="citations">Top Cited Scholars</option>
                        <option value="views">Most Profile Views</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>

              {/* Loader / Skeleton State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-200 rounded-2xl shrink-0"></div>
                        <div className="flex-grow space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between gap-2">
                        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                
                // --- SUB-SECTIONS IF NO ACTIVE FILTERS (PERSONALIZED DISCOVERY) ---
                <>
                  {!searchQuery && selectedRole === 'All' && selectedCountry === 'All' && selectedInterest === 'All' && !onlyVerified && (
                    <div className="space-y-10" id="personalized_sections">
                      
                      {/* Section 1: Recently Joined Scientists */}
                      <div className="space-y-3.5 sm:space-y-4 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-950 flex items-center gap-2">
                            <TrendingUp className="text-emerald-600 w-4.5 h-4.5 sm:w-5 sm:h-5" />
                            Recently Joined Scientists
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                          {recentlyJoined.map((res) => (
                            <motion.div 
                              whileHover={{ y: -4 }}
                              onClick={() => handleViewProfile(res.id)}
                              key={res.id}
                              className="bg-white border border-slate-100 hover:border-emerald-500/20 shadow-xs hover:shadow-sm rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-center flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden"
                            >
                              <div className="space-y-2 sm:space-y-3">
                                {/* Profile image */}
                                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto">
                                  <img 
                                    src={res.profilePhoto || DEFAULT_AVATAR} 
                                    alt={res.fullName} 
                                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-slate-200 shadow-xs"
                                  />
                                </div>

                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-black text-slate-900 flex items-center justify-center gap-1 px-1 sm:px-2 flex-wrap">
                                    <span className="truncate">{res.fullName}</span>
                                    {res.verified && (
                                      <span title="Verified Expert" className="inline-flex items-center">
                                        <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-emerald-600 shrink-0" />
                                      </span>
                                    )}
                                    {user && user.uid === res.id && (
                                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[8px] font-black uppercase rounded">You</span>
                                    )}
                                  </h4>
                                  <p className="text-[10px] text-emerald-700 font-mono font-bold truncate">{res.role}</p>
                                  <p className="text-[9px] text-slate-400 font-semibold truncate flex items-center justify-center gap-0.5">
                                    <MapPin className="w-3 h-3 text-slate-300" />
                                    {res.country}
                                  </p>
                                </div>

                                <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-2 leading-normal h-7 sm:h-8 hidden xs:block">
                                  {res.bio}
                                </p>
                              </div>

                              <div className="pt-2.5 sm:pt-3.5 mt-2.5 sm:mt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                                <span>{res.publicationCount} Papers</span>
                                <span className="text-emerald-700 hover:underline flex items-center gap-0.5 font-bold">
                                  Profile <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Section 2: Top Citations & Publications (Scholarly Leaders) */}
                      <div className="space-y-3.5 sm:space-y-4 text-left">
                        <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-950 flex items-center gap-2">
                          <Award className="text-emerald-600 w-4.5 h-4.5 sm:w-5 sm:h-5" />
                          Featured Scholarly Leaders
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {topAuthors.map((res) => (
                            <div 
                              key={res.id}
                              onClick={() => handleViewProfile(res.id)}
                              className="bg-white border border-slate-150 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left group relative overflow-hidden"
                            >
                              <div className="space-y-3 sm:space-y-4">
                                <div className="flex gap-3 sm:gap-4 items-center">
                                  <img 
                                    src={res.profilePhoto || DEFAULT_AVATAR} 
                                    alt={res.fullName} 
                                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border border-slate-200 shrink-0"
                                  />
                                  <div className="min-w-0 flex-grow">
                                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1 flex-wrap">
                                      <span className="truncate">{res.fullName}</span>
                                      {res.verified && (
                                        <span title="Verified Expert" className="inline-flex items-center">
                                          <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-emerald-600 shrink-0" />
                                        </span>
                                      )}
                                      {user && user.uid === res.id && (
                                        <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[8px] font-black uppercase rounded">You</span>
                                      )}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 truncate font-semibold">{res.institution}</p>
                                    <span className="inline-block mt-0.5 sm:mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[8px] font-bold uppercase rounded">
                                      {res.role}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                                  {res.bio}
                                </p>

                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-2 border-y border-slate-50 text-center">
                                  <div>
                                    <span className="block text-xs font-bold font-mono text-slate-900">{res.publicationCount}</span>
                                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Papers</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs font-bold font-mono text-slate-900">{res.citations}</span>
                                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Citations</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs font-bold font-mono text-slate-900">{res.followers.length}</span>
                                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Followers</span>
                                  </div>
                                </div>
                              </div>

                              <button 
                                className="mt-3 sm:mt-4 flex items-center gap-1 text-[11px] font-black text-emerald-700 group-hover:gap-2 transition-all"
                              >
                                Review Publications & Bio &rarr;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: Around Africa Regional Sorting Hub */}
                      <div className="space-y-3 sm:space-y-4 text-left" id="around_africa_section">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 border-b border-slate-200 pb-3">
                          <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-950 flex items-center gap-2">
                            <Map className="text-emerald-600 w-4.5 h-4.5 sm:w-5 sm:h-5" />
                            Around Africa: Regional Explorer
                          </h3>
                          
                          {/* Region Tabs - Touch Scrollable on Mobile */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap max-w-full bg-slate-200/50 p-1 rounded-xl w-full sm:w-fit">
                            {(['All', 'West', 'East', 'North', 'Southern', 'Central'] as const).map((reg) => (
                              <button
                                key={reg}
                                onClick={() => setActiveRegion(reg)}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-[10px] font-bold sm:font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  activeRegion === reg
                                    ? 'bg-white text-emerald-800 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-950'
                                }`}
                              >
                                {reg}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Count statement */}
                        <p className="text-xs text-slate-400 font-semibold italic">
                          Showing {filteredResearchers.length} experts based in {activeRegion === 'All' ? 'various parts of the African continent' : `the ${activeRegion} African region`}.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* Primary Filtered Grid of Scholar cards */}
                  <div className="space-y-4 text-left">
                    {/* Grid Title if filter active */}
                    {(searchQuery || selectedRole !== 'All' || selectedCountry !== 'All' || selectedInterest !== 'All' || onlyVerified || activeRegion !== 'All') && (
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-base font-display font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                          <SlidersHorizontal className="w-4.5 h-4.5 text-emerald-600" />
                          Filtered Search Results ({filteredResearchers.length} scientists found)
                        </h3>
                        
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedRole('All');
                            setSelectedCountry('All');
                            setSelectedInterest('All');
                            setOnlyVerified(false);
                            setActiveRegion('All');
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    )}

                    {filteredResearchers.length === 0 ? (
                      <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-500 space-y-4">
                        <BadgeAlert className="w-12 h-12 mx-auto text-slate-300" />
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-slate-800">No matching researchers found</p>
                          <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Try broadening your search keywords, clearing role filter tags, or switching regions in the Around Africa panel.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedRole('All');
                            setSelectedCountry('All');
                            setSelectedInterest('All');
                            setOnlyVerified(false);
                            setActiveRegion('All');
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl transition-all border border-slate-200 shadow-xs cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResearchers.map((res) => (
                          <motion.div 
                            whileHover={{ y: -6, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)' }}
                            key={res.id}
                            className="bg-white border border-slate-100/80 hover:border-emerald-500/30 rounded-3xl p-6 text-left transition-all relative overflow-hidden flex flex-col justify-between group cursor-pointer"
                            onClick={() => handleViewProfile(res.id)}
                          >
                            {/* Decorative Corner Watermark */}
                            <div className="absolute top-0 right-0 p-6 opacity-3 pointer-events-none text-emerald-900 group-hover:opacity-6 transition-opacity">
                              {React.createElement(getRoleIcon(res.role), { className: "w-28 h-28" })}
                            </div>

                            <div className="space-y-4.5 relative z-10">
                              {/* Header: Photo and Badges */}
                              <div className="flex gap-4 items-start">
                                <div className="shrink-0">
                                  <img 
                                    src={res.profilePhoto || DEFAULT_AVATAR} 
                                    alt={res.fullName} 
                                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                                  />
                                </div>

                                <div className="min-w-0 flex-grow space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[8px] font-extrabold uppercase rounded border border-emerald-100 tracking-wider">
                                      {res.role}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-mono rounded">
                                      {res.country}
                                    </span>
                                    {user && user.uid === res.id && (
                                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[8px] font-black uppercase rounded">
                                        You
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                                    <span className="truncate">{res.fullName}</span>
                                    {res.verified && (
                                      <span title="Verified Expert" className="inline-flex items-center">
                                        <BadgeCheck className="w-4.5 h-4.5 text-white fill-emerald-600 shrink-0" />
                                      </span>
                                    )}
                                  </h4>
                                </div>
                              </div>

                              {/* Institution */}
                              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{res.institution}</span>
                              </p>

                              {/* Bio excerpt */}
                              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                {res.bio}
                              </p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1">
                                {res.researchInterests.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded">
                                    #{tag}
                                  </span>
                                ))}
                                {res.researchInterests.length > 3 && (
                                  <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded">
                                    +{res.researchInterests.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Footer: Stats & Button */}
                            <div className="pt-4.5 mt-4.5 border-t border-slate-100 flex items-center justify-between gap-3 relative z-10">
                              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                                <span className="flex items-center gap-0.5">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  {res.publicationCount} Papers
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Award className="w-3.5 h-3.5 text-slate-400" />
                                  {res.citations} Citations
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleFollowToggle(res.id, e)}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                    user && res.followers.includes(user.uid)
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-800 hover:bg-slate-100'
                                  }`}
                                  title={user && res.followers.includes(user.uid) ? "Unfollow Scientist" : "Follow Scientist"}
                                >
                                  {user && res.followers.includes(user.uid) ? (
                                    <UserCheck className="w-4 h-4 shrink-0" />
                                  ) : (
                                    <UserPlus className="w-4 h-4 shrink-0" />
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => handleViewProfile(res.id)}
                                  className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                                >
                                  View profile
                                </button>
                              </div>
                            </div>

                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                </>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
