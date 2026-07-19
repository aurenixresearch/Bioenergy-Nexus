import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  User, 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar, 
  Award, 
  Sparkles, 
  BookOpen, 
  Download, 
  Eye, 
  Link2, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowLeft, 
  Trash2, 
  Camera, 
  ExternalLink, 
  RefreshCw, 
  Star,
  Activity,
  Briefcase,
  GraduationCap,
  Globe,
  Share2,
  FileText,
  Github,
  Linkedin,
  Clock,
  Heart,
  ChevronRight,
  ShieldCheck,
  Percent,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResearchPaper } from '../types';
import { getCustomPapers, getUserProfile, createUserProfile } from '../services/db';
import NetworkPanel from './dashboard/NetworkPanel';

interface ProfilePageProps {
  user: FirebaseUser;
  onNavigateToView: (view: any) => void;
  theme?: 'light' | 'dark';
}

export default function ProfilePage({ user, onNavigateToView, theme }: ProfilePageProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'publications' | 'projects' | 'achievements'>('overview');
  const [myPublications, setMyPublications] = useState<ResearchPaper[]>([]);
  
  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  
  // Local success/error alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlertMsg({ type: 'error', text: 'Please select an image file only.' });
      setTimeout(() => setAlertMsg(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        if (profileData) {
          const updated = {
            ...profileData,
            profilePicture: compressedBase64,
            updatedAt: new Date().toISOString()
          };
          setLoading(true);
          try {
            await createUserProfile(user.uid, updated);
            setProfileData(updated);
            setEditForm(JSON.parse(JSON.stringify(updated)));
            setAlertMsg({ type: 'success', text: 'Profile picture updated successfully.' });
            setTimeout(() => setAlertMsg(null), 4000);
          } catch (err) {
            console.error('Error saving profile picture:', err);
            setAlertMsg({ type: 'error', text: 'Failed to update profile picture.' });
            setTimeout(() => setAlertMsg(null), 4000);
          } finally {
            setLoading(false);
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const ALL_INTERESTS_OPTIONS = [
    'Solar Energy', 'Wind Energy', 'Hydropower', 'Bioenergy', 'Energy Storage', 
    'Smart Grid', 'Climate Change', 'Circular Economy', 'Sustainable Development', 
    'Hydrogen', 'Nuclear Energy', 'Carbon Capture', 'Artificial Intelligence', 
    'Energy Policy', 'Environmental Engineering', 'Battery Technology', 'Materials Science'
  ];

  const USER_ROLES = [
    'Student', 'Researcher', 'Lecturer', 'Institution', 'Industry Professional', 'Government', 'NGO'
  ];

  // Fetch the user's profile and uploaded custom publications
  const fetchProfileAndData = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setProfileData(profile);
        setEditForm(JSON.parse(JSON.stringify(profile))); // deep copy
      } else {
        // Fallback or new profile auto-creation
        const defaultProfile = {
          fullName: user.displayName || 'Google Scholar',
          username: user.email ? user.email.split('@')[0] : 'scholar_user',
          email: user.email || '',
          role: 'Researcher',
          professionalTitle: 'Senior Bioenergy Analyst',
          country: 'Nigeria',
          institution: 'University of Lagos',
          department: 'Chemical Engineering',
          phone: '',
          timezone: 'UTC+1 (WAT)',
          profilePicture: user.photoURL || 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq',
          coverBanner: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=1200&auto=format&fit=crop',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          isVerified: true,
          verified: true,
          bio: 'Dedicated to studying anaerobic digestion and thermochemical bioenergy pathways for sub-Saharan agricultural waste streams. Focused on rural micro-grid implementations and organic municipal solid waste conversion.',
          areasOfExpertise: 'Thermochemical Conversion, Anaerobic Digestion, Kinetic Modeling, Rural Off-Grid Design',
          careerObjectives: 'To establish localized bioenergy pilot systems across west Africa and secure institutional funding for regional waste-to-energy conversion benchmarks.',
          skills: ['MATLAB', 'Python', 'Machine Learning', 'GIS', 'CFD Simulation', 'Renewable Energy Design'],
          researchInterests: ['Bioenergy', 'Waste-to-Energy', 'Energy Storage', 'Climate Change'],
          education: [
            {
              institution: 'University of Lagos',
              degree: 'Ph.D.',
              fieldOfStudy: 'Chemical Engineering',
              startYear: '2020',
              endYear: '2024',
              currentlyStudying: 'No'
            }
          ],
          workExperience: [
            {
              organization: 'Aurenix Research Lab',
              position: 'Lead Analyst',
              startDate: '2022-06',
              endDate: 'Present',
              description: 'Supervised municipal solid waste audits and biogas composition analysis for Lagos metropolitan districts.'
            }
          ],
          portfolioLinks: {
            website: 'https://aurenix-research.org',
            orcid: '0000-0002-1825-0097',
            googleScholar: '',
            github: '',
            linkedin: '',
            researchgate: ''
          },
          achievements: [
            { title: 'West African Circularity Grant', type: 'Grant', issuer: 'Eco-Innovation Fund', year: '2023' },
            { title: 'Best Research Paper Award', type: 'Award', issuer: 'African Energy Forum', year: '2022' }
          ],
          innovationProjects: [
            {
              id: 'proj-1',
              title: 'Murtala Muhammed Airport Biodigester Pilot',
              status: 'Active',
              fundingStatus: 'Funded',
              progress: 85,
              trl: 7,
              team: 'Dr. Samuel Adebayo, Engr. Chidi Okafor',
              lastUpdated: '2026-07-10'
            }
          ],
          collaborationHistory: {
            activeCollaborations: 1,
            completedCollaborations: 2,
            partnerOrganizations: ['UNILAG', 'Eco-Innovation Fund'],
            currentOpportunities: ['Sub-Saharan Biogas Commercialization Alliance']
          },
          stats: {
            researchPapers: 1,
            innovationProjects: 1,
            followers: 12,
            following: 8,
            downloads: 45,
            views: 182,
            citations: 2,
            collaborationScore: 88,
            aiMatchScore: 92,
            fundingReceived: '$120,000',
            laboratoryCollaborations: 2
          },
          settings: {
            security: { twoFactorEnabled: false },
            notifications: { email: true, push: false, inApp: true },
            privacy: { visibility: 'Public', email: true, phone: false },
            collaborationPreferences: { lookingFor: ['Funding', 'Laboratory Access'], availability: 'Open to Collaborate' },
            aiMatchPreferences: { countries: ['Nigeria'], researchAreas: ['Bioenergy'], trl: [6, 7, 8], fundingRange: '$100k - $250k', collaborationType: ['R&D'], languages: ['English'] },
            researchPreferences: { defaultVisibility: 'Public', citationStyle: 'IEEE', defaultLanguage: 'English' },
            appearance: { mode: 'light', fontSize: 'Medium' },
            connectedAccounts: { googleConnected: true }
          }
        };

        await createUserProfile(user.uid, defaultProfile as any);
        setProfileData(defaultProfile);
        setEditForm(JSON.parse(JSON.stringify(defaultProfile)));
      }

      // Fetch user's papers
      const customP = await getCustomPapers();
      const userPapers = customP.filter(p => p.userId === user.uid || p.userEmail === user.email);
      setMyPublications(userPapers);
    } catch (err) {
      console.error('Error fetching profile system:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndData();
  }, [user]);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!profileData) return 0;
    let score = 0;
    const items = [
      { name: 'Photo', check: !!profileData.profilePicture },
      { name: 'Cover', check: !!profileData.coverBanner },
      { name: 'Bio', check: !!profileData.bio },
      { name: 'Interests', check: profileData.researchInterests?.length > 0 },
      { name: 'Education', check: profileData.education?.length > 0 },
      { name: 'Work', check: profileData.workExperience?.length > 0 },
      { name: 'Links', check: Object.values(profileData.portfolioLinks || {}).some(v => !!v) },
      { name: 'Skills', check: profileData.skills?.length > 0 },
      { name: 'Achievements', check: profileData.achievements?.length > 0 },
      { name: 'Projects', check: profileData.innovationProjects?.length > 0 }
    ];

    const completed = items.filter(item => item.check).length;
    return Math.round((completed / items.length) * 100);
  };

  const getCompletionChecklist = () => {
    if (!profileData) return [];
    return [
      { id: 'photo', label: 'Circular Profile Picture', check: !!profileData.profilePicture },
      { id: 'cover', label: 'Cover Banner Graphic', check: !!profileData.coverBanner },
      { id: 'bio', label: 'Professional Bio Statement', check: !!profileData.bio },
      { id: 'interests', label: 'Research Fields Selected', check: profileData.researchInterests?.length > 0 },
      { id: 'edu', label: 'Academic Credentials', check: profileData.education?.length > 0 },
      { id: 'work', label: 'Industry Work History', check: profileData.workExperience?.length > 0 },
      { id: 'links', label: 'ORCID / Scholar Identifiers', check: Object.values(profileData.portfolioLinks || {}).some(v => !!v) },
      { id: 'skills', label: 'Verified Technical Skills', check: profileData.skills?.length > 0 }
    ];
  };

  // Profile Save handler
  const handleSaveProfile = async (updatedData: any) => {
    setLoading(true);
    try {
      await createUserProfile(user.uid, updatedData);
      setProfileData(updatedData);
      setEditForm(JSON.parse(JSON.stringify(updatedData)));
      setIsEditModalOpen(false);
      setAlertMsg({ type: 'success', text: 'Professional research profile successfully saved.' });
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      console.error('Error saving profile changes:', err);
      setAlertMsg({ type: 'error', text: 'Failed to update. Verify your internet connection.' });
      setTimeout(() => setAlertMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterestInForm = (interest: string) => {
    const current = editForm.researchInterests || [];
    if (current.includes(interest)) {
      setEditForm({ ...editForm, researchInterests: current.filter((i: string) => i !== interest) });
    } else {
      setEditForm({ ...editForm, researchInterests: [...current, interest] });
    }
  };

  const addSkillInForm = (skillText: string) => {
    if (!skillText.trim()) return;
    const current = editForm.skills || [];
    if (!current.includes(skillText.trim())) {
      setEditForm({ ...editForm, skills: [...current, skillText.trim()] });
    }
  };

  const removeSkillInForm = (skillText: string) => {
    const current = editForm.skills || [];
    setEditForm({ ...editForm, skills: current.filter((s: string) => s !== skillText) });
  };

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/profile/${profileData?.username || user.uid}`;
    navigator.clipboard.writeText(shareUrl);
    setAlertMsg({ type: 'success', text: 'Public profile link copied to clipboard!' });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  if (loading && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4" id="profile_loading_state">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">Loading portfolio metrics...</p>
      </div>
    );
  }

  const completionPercent = calculateCompletion();
  const completionChecklist = getCompletionChecklist();

  return (
    <div className="bg-slate-50 dark:bg-slate-50 text-slate-800 dark:text-slate-800 min-h-screen text-left" id="public_profile_view">
      
      {/* Alert Notification */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-50 dark:border-emerald-200 dark:text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-50 dark:border-rose-200 dark:text-rose-800'
            }`}
            id="profile_alert_box"
          >
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
            <span className="text-xs font-semibold">{alertMsg.text}</span>
            <button onClick={() => setAlertMsg(null)} className="ml-2 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Header Cover Banner Block */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden" id="profile_cover_banner_wrapper">
        <img 
          src={profileData?.coverBanner || 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=1200&auto=format&fit=crop'} 
          alt="Research Cover Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
        
        {/* Back navigation */}
        <button 
          onClick={() => onNavigateToView('dashboard')}
          className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 dark:bg-black/40 dark:hover:bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-2 backdrop-blur-md cursor-pointer transition-all"
          id="profile_back_btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hub
        </button>
      </div>
 
      {/* Primary Layout Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-20 relative z-10">
        
        {/* Profile Card Intro Grid */}
        <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8">
          
          {/* Left Avatar & Identity info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="relative group/avatar">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-white overflow-hidden shadow-lg bg-emerald-50">
                <img 
                  src={profileData?.profilePicture || 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq'} 
                  alt={profileData?.fullName || 'Academic Contributor'} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="profile_avatar_file_input"
              />
              <button 
                onClick={handleAvatarChangeClick}
                className="absolute bottom-1 right-1 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 shadow-md cursor-pointer transition-transform duration-200 group-hover/avatar:scale-110"
                title="Change Photo"
                id="profile_avatar_change_btn"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
 
            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-slate-900">
                  {profileData?.fullName}
                </h1>
                {profileData?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-700 bg-emerald-50 dark:bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-200/50 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Scholar
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-100 text-slate-600 dark:text-slate-600">
                  {profileData?.role}
                </span>
              </div>
 
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-600">
                {profileData?.professionalTitle}
              </p>
 
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {profileData?.institution} • <span className="italic">{profileData?.department}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profileData?.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {profileData?.memberSince}
                </span>
              </div>
            </div>
          </div>
 
          {/* Right quick actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm shadow-emerald-900/10"
              id="profile_edit_trigger_btn"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
            <button 
              onClick={handleShareProfile}
              className="px-3.5 py-2.5 bg-white dark:bg-white hover:bg-slate-50 dark:hover:bg-slate-50 text-slate-700 dark:text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-200"
              title="Copy Profile URL"
              id="profile_share_btn"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigateToView('settings')}
              className="px-3.5 py-2.5 bg-white dark:bg-white hover:bg-slate-50 dark:hover:bg-slate-50 text-slate-700 dark:text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-200"
              title="Aurenix System Preferences"
              id="profile_settings_nav_btn"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
 
        </div>
 
        {/* Outer 2-Column Bento Deck Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Deck Sidebar) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Completion Percentage Panel */}
            <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 shadow-sm text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono">
                  Completion Level
                </h3>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-600 font-mono">
                  {completionPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
              </div>

              {/* Incremental Task List */}
              <div className="space-y-3">
                {completionChecklist.map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${task.check ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-700'}`}>
                      {task.label}
                    </span>
                    {task.check ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-300" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3.5 bg-black border border-emerald-900 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  <strong className="text-white">Verification Boost:</strong> Reaching 100% completions unlocks priority indexing in our decentralized AI matching engine.
                </p>
              </div>
            </div>

            {/* Research Identifiers Card */}
            <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 shadow-sm text-left">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono mb-4">
                Research Portfolios
              </h3>
              <div className="space-y-3">
                {profileData?.portfolioLinks?.orcid ? (
                  <a 
                     href={`https://orcid.org/${profileData.portfolioLinks.orcid}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-100 border border-slate-100 dark:border-slate-100 rounded-xl text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4.5 h-4.5 text-green-600" />
                      <span className="font-extrabold text-slate-700 dark:text-slate-700">ORCID iD</span>
                    </div>
                    <span className="font-mono text-slate-500 hover:text-emerald-600">{profileData.portfolioLinks.orcid}</span>
                  </a>
                ) : null}

                {profileData?.portfolioLinks?.googleScholar ? (
                  <a 
                     href={profileData.portfolioLinks.googleScholar} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-100 border border-slate-100 dark:border-slate-100 rounded-xl text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4.5 h-4.5 text-blue-500" />
                      <span className="font-extrabold text-slate-700 dark:text-slate-700">Google Scholar</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ) : null}

                {profileData?.portfolioLinks?.github ? (
                  <a 
                     href={profileData.portfolioLinks.github} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-100 border border-slate-100 dark:border-slate-100 rounded-xl text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Github className="w-4.5 h-4.5 text-slate-700 dark:text-slate-700" />
                      <span className="font-extrabold text-slate-700 dark:text-slate-700">GitHub</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ) : null}

                {profileData?.portfolioLinks?.linkedin ? (
                  <a 
                     href={profileData.portfolioLinks.linkedin} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-100 border border-slate-100 dark:border-slate-100 rounded-xl text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Linkedin className="w-4.5 h-4.5 text-blue-600" />
                      <span className="font-extrabold text-slate-700 dark:text-slate-700">LinkedIn</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ) : null}

                {profileData?.portfolioLinks?.website ? (
                  <a 
                     href={profileData.portfolioLinks.website} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-100 border border-slate-100 dark:border-slate-100 rounded-xl text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4.5 h-4.5 text-emerald-600" />
                      <span className="font-extrabold text-slate-700 dark:text-slate-700">Personal Website</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ) : null}

                {!profileData?.portfolioLinks?.orcid && !profileData?.portfolioLinks?.googleScholar && !profileData?.portfolioLinks?.github && !profileData?.portfolioLinks?.linkedin && !profileData?.portfolioLinks?.website && (
                  <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs font-mono">
                    No portfolios linked yet. Click Edit.
                  </div>
                )}
              </div>
            </div>

            {/* Scientific Stats Bento Box */}
            <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 shadow-sm text-left">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono mb-4">
                Research Metrics
              </h3>
              
              <div className="grid grid-cols-2 gap-3.5 bg-black p-3.5 rounded-2xl">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <div className="text-slate-400 text-[10px] font-mono font-bold uppercase">Citations</div>
                  <div className="text-lg font-bold text-white mt-0.5">{profileData?.stats?.citations || 0}</div>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <div className="text-slate-400 text-[10px] font-mono font-bold uppercase">Downloads</div>
                  <div className="text-lg font-bold text-white mt-0.5">{profileData?.stats?.downloads || 0}</div>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <div className="text-slate-400 text-[10px] font-mono font-bold uppercase">Profile Views</div>
                  <div className="text-lg font-bold text-white mt-0.5">{profileData?.stats?.views || 0}</div>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <div className="text-slate-400 text-[10px] font-mono font-bold uppercase">AI Match Score</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{profileData?.stats?.aiMatchScore || 85}%</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-100/50 dark:border-emerald-100/50 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Collaboration Index</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-800">{profileData?.stats?.collaborationScore || 80}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Funding Secured</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-800">{profileData?.stats?.fundingReceived || '$0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Lab Affiliations</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-800">{profileData?.stats?.laboratoryCollaborations || 0} Labs</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Deck Main Tabs Container) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Tab select bar */}
            <div className="flex border-b border-slate-200 dark:border-slate-200 overflow-x-auto whitespace-nowrap gap-6" id="profile_tab_selector">
              {[
                { id: 'overview', label: 'Overview & Bio', icon: User },
                { id: 'publications', label: `My Publications (${myPublications.length})`, icon: BookOpen },
                { id: 'projects', label: 'Projects & Alliances', icon: Activity },
                { id: 'achievements', label: 'Achievements', icon: Award }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isTabActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                      isTabActive 
                        ? 'border-emerald-600 text-emerald-750 dark:text-emerald-750 font-extrabold' 
                        : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-900'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB PANELS CONTAINER */}
            <div>
              <AnimatePresence mode="wait">
                
                {/* 1. OVERVIEW TAB PANEL */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="tab-overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-8 text-left"
                  >
                    {/* About Section */}
                    <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono mb-4">
                        Professional Biography
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-600 leading-relaxed">
                        {profileData?.bio || 'No bio provided. Click Edit Profile to add your research mission.'}
                      </p>
                      
                      {profileData?.careerObjectives && (
                        <div className="mt-6 pt-5 border-t border-emerald-100/50 dark:border-emerald-100/50">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider mb-2">
                            Career Objectives & Vision
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-600 italic leading-relaxed">
                            "{profileData?.careerObjectives}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Skills & Fields Multi-grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Skills Card */}
                      <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono mb-4">
                          Technical Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {profileData?.skills?.map((skill: string, index: number) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-slate-100/80 dark:bg-slate-100/80 text-slate-700 dark:text-slate-700 rounded-lg text-xs font-semibold border border-slate-200/50"
                            >
                              {skill}
                            </span>
                          ))}
                          {(!profileData?.skills || profileData?.skills.length === 0) && (
                            <div className="text-slate-400 text-xs py-2">No technical skills saved.</div>
                          )}
                        </div>
                      </div>

                      {/* Research Interests Card */}
                      <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono mb-4">
                          Research Fields
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {profileData?.researchInterests?.map((interest: string, index: number) => (
                            <span 
                              key={index}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                                index === 0 
                                  ? 'bg-black text-white border-black dark:bg-black dark:text-white dark:border-black' 
                                  : 'bg-emerald-50/60 dark:bg-emerald-50/60 text-emerald-850 dark:text-emerald-850 border-emerald-200/40 dark:border-emerald-200/40'
                              }`}
                            >
                              {interest}
                            </span>
                          ))}
                          {(!profileData?.researchInterests || profileData?.researchInterests.length === 0) && (
                            <div className="text-slate-400 text-xs py-2">No research areas selected.</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timelines: Work & Education */}
                    <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Work History */}
                        <div className="space-y-6">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                            <Briefcase className="w-4.5 h-4.5 text-emerald-600" />
                            Work History
                          </h3>

                          <div className="relative border-l border-slate-200 dark:border-slate-200 pl-4 ml-2.5 space-y-6 text-left">
                            {profileData?.workExperience?.map((work: any, index: number) => (
                              <div key={index} className="relative">
                                {/* Timeline marker */}
                                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white dark:border-white" />
                                
                                <div className="space-y-1">
                                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-900">
                                    {work.position}
                                  </h4>
                                  <p className="text-xs text-emerald-600 dark:text-emerald-600 font-bold">
                                    {work.organization}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {work.startDate} — {work.endDate}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed pt-1.5">
                                    {work.description}
                                  </p>
                                </div>
                              </div>
                            ))}

                            {(!profileData?.workExperience || profileData.workExperience.length === 0) && (
                              <div className="text-slate-400 text-xs italic">No experience entries logged.</div>
                            )}
                          </div>
                        </div>

                        {/* Education history */}
                        <div className="space-y-6">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                            <GraduationCap className="w-4.5 h-4.5 text-emerald-600" />
                            Academic Credentials
                          </h3>

                          <div className="relative border-l border-slate-200 dark:border-slate-200 pl-4 ml-2.5 space-y-6 text-left">
                            {profileData?.education?.map((edu: any, index: number) => (
                              <div key={index} className="relative">
                                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white dark:border-white" />
                                
                                <div className="space-y-1">
                                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-900">
                                    {edu.degree} in {edu.fieldOfStudy}
                                  </h4>
                                  <p className="text-xs text-emerald-600 dark:text-emerald-600 font-bold">
                                    {edu.institution}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    Class of {edu.endYear} ({edu.startYear} — {edu.endYear})
                                  </p>
                                </div>
                              </div>
                            ))}

                            {(!profileData?.education || profileData.education.length === 0) && (
                              <div className="text-slate-400 text-xs italic">No education entries logged.</div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Followers & Network Panel */}
                    <NetworkPanel 
                      userId={user.uid} 
                      onNavigateToView={onNavigateToView} 
                    />

                  </motion.div>
                )}

                {/* 2. PUBLICATIONS TAB PANEL */}
                {activeTab === 'publications' && (
                  <motion.div
                    key="tab-publications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono">
                        Member Authored Papers
                      </h2>
                      <button 
                        onClick={() => onNavigateToView('research')}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-100 text-slate-700 dark:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-200 border border-slate-200/50 dark:border-slate-200/50 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Upload New Study
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myPublications.map((paper) => (
                        <div 
                          key={paper.id}
                          className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
                        >
                          <div className="space-y-4">
                            <span className="inline-block px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-50 text-emerald-800 dark:text-emerald-800 rounded-full text-[9px] font-bold uppercase font-mono tracking-wider" style={{ color: '#047857' }}>
                              {paper.category}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-900 leading-snug">
                              {paper.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-500 line-clamp-3 leading-relaxed">
                              {paper.abstract}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <div className="flex gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {paper.viewsCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="w-3.5 h-3.5" />
                                {paper.downloadsCount || 0}
                              </span>
                            </div>
                            <span>Year: {paper.publishedYear}</span>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <a 
                              href={paper.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-700 rounded-xl text-[11px] font-bold text-center flex items-center justify-center gap-1.5 transition-all border border-emerald-100/60"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Read Study
                            </a>
                            <a 
                              href={paper.downloadUrl}
                              download
                              className="p-2 bg-slate-100 dark:bg-slate-100 text-slate-600 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-200 rounded-xl transition-all"
                              title="Download PDF Archive"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}

                      {myPublications.length === 0 && (
                        <div className="col-span-2 text-center py-12 bg-white dark:bg-white rounded-3xl border border-slate-200 dark:border-slate-200 flex flex-col items-center justify-center space-y-3">
                          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-300" />
                          <p className="text-slate-400 dark:text-slate-500 text-xs font-mono">
                            You have not submitted any custom studies to the repository yet.
                          </p>
                          <button 
                            onClick={() => onNavigateToView('research')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                          >
                            Submit Study
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. PROJECTS & ALLIANCES TAB PANEL */}
                {activeTab === 'projects' && (
                  <motion.div
                    key="tab-projects"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-8 text-left"
                  >
                    {/* Active Innovation Projects */}
                    <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono mb-6">
                        Active Innovation Projects
                      </h2>

                      <div className="space-y-6">
                        {profileData?.innovationProjects?.map((proj: any) => (
                          <div 
                            key={proj.id} 
                            className="p-5 bg-slate-50 dark:bg-slate-50 rounded-2xl border border-slate-200/60 dark:border-slate-200/60 space-y-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2.5">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-900 leading-tight">
                                {proj.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono tracking-wider ${
                                  proj.status === 'Active' 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-100 dark:text-emerald-800' 
                                    : 'bg-slate-150 text-slate-600 dark:bg-slate-150 dark:text-slate-600'
                                }`}>
                                  {proj.status}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-100 dark:text-blue-850 text-blue-800 rounded-full text-[9px] font-bold uppercase font-mono tracking-wider">
                                  {proj.fundingStatus}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                                <span>Progress Milestone</span>
                                <span>{proj.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-200 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-2.5 border-t border-slate-200/50 dark:border-slate-200/50 text-xs font-medium text-slate-500 dark:text-slate-500">
                              <div>
                                <span className="text-slate-400">Technology Readiness Level:</span> <strong className="text-slate-800 dark:text-slate-800">TRL {proj.trl}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400">Last Synced:</span> <strong className="text-slate-800 dark:text-slate-800">{proj.lastUpdated}</strong>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-slate-400">Team Collaborators:</span> <strong className="text-slate-800 dark:text-slate-800">{proj.team}</strong>
                              </div>
                            </div>
                          </div>
                        ))}

                        {(!profileData?.innovationProjects || profileData.innovationProjects.length === 0) && (
                          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-mono">
                            No Innovation Projects recorded. Click Edit Profile.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Collaboration Statistics */}
                    <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono mb-4">
                        Consortium Network
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-600 font-medium leading-relaxed">
                        <div className="space-y-2">
                          <h4 className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">Affiliated Organizations:</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {profileData?.collaborationHistory?.partnerOrganizations?.map((org: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-100 rounded text-slate-800 dark:text-slate-800 font-bold border border-slate-200/60">
                                {org}
                              </span>
                            )) || <span className="text-slate-400">No organizations linked.</span>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">Active Proposals:</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {profileData?.collaborationHistory?.currentOpportunities?.map((opp: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-50 rounded text-emerald-850 dark:text-emerald-850 border border-emerald-200/50 dark:border-emerald-200/50 font-bold">
                                {opp}
                              </span>
                            )) || <span className="text-slate-400">No active opportunities.</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. ACHIEVEMENTS TAB PANEL */}
                {activeTab === 'achievements' && (
                  <motion.div
                    key="tab-achievements"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="bg-white dark:bg-white border border-emerald-100 dark:border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-900 uppercase tracking-wider font-mono mb-6">
                        Honors, Grants & Certifications
                      </h2>

                      <div className="space-y-4">
                        {profileData?.achievements?.map((ach: any, index: number) => (
                          <div 
                            key={index}
                            className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-50 rounded-2xl border border-slate-200/60 dark:border-slate-200/60 hover:border-emerald-600/25 transition-all"
                          >
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-50 rounded-xl text-emerald-700 dark:text-emerald-700 border border-emerald-100">
                              <Award className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-900 leading-tight">
                                  {ach.title}
                                </h3>
                                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-50 border border-emerald-200/40 dark:border-emerald-200/40 text-emerald-850 dark:text-emerald-850 rounded-md text-[9px] font-mono font-bold uppercase">
                                  {ach.type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                                Issued by {ach.issuer} • <span className="font-mono text-[10px]">{ach.year}</span>
                              </p>
                            </div>
                          </div>
                        ))}

                        {(!profileData?.achievements || profileData.achievements.length === 0) && (
                          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-mono">
                            No achievements logged. Click Edit Profile.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

      {/* -------------------- EDIT PROFILE MODAL -------------------- */}
      <AnimatePresence>
        {isEditModalOpen && editForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="edit_profile_modal">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-3xl bg-white dark:bg-[#040706] rounded-3xl shadow-2xl border dark:border-slate-800 overflow-hidden text-left"
              >
                {/* Header */}
                <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                      Edit Public Portfolio
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure your details to maximize researcher match index.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields (Scrollable area) */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProfile(editForm);
                  }}
                  className="p-6 max-h-[70vh] overflow-y-auto space-y-6 custom-scrollbar"
                >
                  
                  {/* Basic section */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      Basic Credentials
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Full Name</label>
                        <input 
                          type="text"
                          required
                          value={editForm.fullName || ''}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Professional Title</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Lead Process Analyst"
                          value={editForm.professionalTitle || ''}
                          onChange={(e) => setEditForm({ ...editForm, professionalTitle: e.target.value })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Scholar Role</label>
                        <select 
                          value={editForm.role || 'Researcher'}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        >
                          {USER_ROLES.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Country</label>
                        <input 
                          type="text"
                          required
                          value={editForm.country || ''}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Institution</label>
                        <input 
                          type="text"
                          required
                          value={editForm.institution || ''}
                          onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Department</label>
                        <input 
                          type="text"
                          required
                          value={editForm.department || ''}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Avatar Image URL</label>
                        <input 
                          type="text"
                          value={editForm.profilePicture || ''}
                          onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Cover Banner Image URL</label>
                        <input 
                          type="text"
                          value={editForm.coverBanner || ''}
                          onChange={(e) => setEditForm({ ...editForm, coverBanner: e.target.value })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* About Section in form */}
                  <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      About & Objectives
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Professional Bio</label>
                      <textarea 
                        rows={3}
                        required
                        value={editForm.bio || ''}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Career Objectives & Vision</label>
                      <textarea 
                        rows={2}
                        value={editForm.careerObjectives || ''}
                        onChange={(e) => setEditForm({ ...editForm, careerObjectives: e.target.value })}
                        className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Research Fields (Multi select) */}
                  <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      Selected Research Fields
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {ALL_INTERESTS_OPTIONS.map((interest) => {
                        const isSelected = (editForm.researchInterests || []).includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleInterestInForm(interest)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                              isSelected 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills Editor */}
                  <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      Technical Skills (Tags)
                    </h4>
                    <div className="flex flex-wrap gap-2 border dark:border-slate-800 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950">
                      {editForm.skills?.map((skill: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border dark:border-emerald-500/10 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => removeSkillInForm(skill)}
                            className="hover:text-rose-600 ml-1 font-extrabold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      
                      <input 
                        type="text"
                        placeholder="Type skill & press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkillInForm(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="bg-transparent border-none text-xs text-slate-800 dark:text-white outline-none min-w-[150px] px-2"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Type a technical skill and press Enter to append.</span>
                  </div>

                  {/* Portfolios URL list */}
                  <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      Portfolio Links
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">ORCID ID</label>
                        <input 
                          type="text"
                          placeholder="0000-0002-1825-0097"
                          value={editForm.portfolioLinks?.orcid || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            portfolioLinks: { ...editForm.portfolioLinks, orcid: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Personal Website</label>
                        <input 
                          type="text"
                          placeholder="https://aurenix-research.org"
                          value={editForm.portfolioLinks?.website || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            portfolioLinks: { ...editForm.portfolioLinks, website: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Google Scholar Profile URL</label>
                        <input 
                          type="text"
                          placeholder="https://scholar.google.com..."
                          value={editForm.portfolioLinks?.googleScholar || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            portfolioLinks: { ...editForm.portfolioLinks, googleScholar: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">GitHub Profile URL</label>
                        <input 
                          type="text"
                          placeholder="https://github.com..."
                          value={editForm.portfolioLinks?.github || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            portfolioLinks: { ...editForm.portfolioLinks, github: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 border dark:border-slate-800 rounded-xl text-xs dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-6 border-t dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/20 dark:bg-slate-900/10">
                    <button 
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/10"
                    >
                      Save Changes
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
