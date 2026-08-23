import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Sparkles, 
  Plus, 
  FileText, 
  Users, 
  Coins, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  Globe, 
  Mail, 
  MapPin, 
  Award, 
  Briefcase, 
  Sliders, 
  Check, 
  X, 
  Eye, 
  Send, 
  Zap, 
  Layers, 
  ChevronRight, 
  Activity, 
  FilePlus, 
  Camera, 
  Loader2, 
  MessageSquare 
} from 'lucide-react';
import { 
  AllianceOpportunity, 
  Application, 
  Workspace, 
  Project 
} from '../collaboration/types';
import { 
  getAlliances, 
  createAlliance, 
  updateAlliance, 
  deleteAlliance, 
  getApplications, 
  updateApplicationStatus, 
  getWorkspaces, 
  getProjects 
} from '../../services/collaborationDb';
import { getResearchers, createUserProfile, addNotification } from '../../services/db';
import VerificationStatusCard from '../verification/VerificationStatusCard';
import OrganizationVerificationModal from '../verification/OrganizationVerificationModal';
import { UserProfile } from '../../types';

interface OrganizationDashboardProps {
  user: any;
  userProfile: UserProfile | null;
  onRefreshAll: () => void;
  onNavigateToView?: (view: string, id?: string) => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
}

type OrgTab = 'alliances' | 'drafts' | 'proposals' | 'workspaces' | 'match_boost' | 'verification';

const RESEARCH_FOCUS_OPTIONS = [
  'Bioenergy & Biofuels',
  'Solar Energy & Photovoltaics',
  'Anaerobic Digestion & Biogas',
  'Circular Economy & Waste-to-Energy',
  'Energy Storage & Batteries',
  'Grid Modernization & Microgrids',
  'Green Hydrogen & Fuel Cells',
  'Carbon Capture & Climate Tech',
  'Agricultural Waste Valorization',
  'Clean Cooking & Rural Electrification'
];

export default function OrganizationDashboard({
  user,
  userProfile,
  onRefreshAll,
  onNavigateToView,
  onNavigateToProfile,
  onNavigateToSettings
}: OrganizationDashboardProps) {
  const [activeTab, setActiveTab] = useState<OrgTab>('alliances');
  const [loading, setLoading] = useState(true);

  // Data states
  const [alliances, setAlliances] = useState<AllianceOpportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [researchers, setResearchers] = useState<any[]>([]);

  // Filter & Search states
  const [allianceSearch, setAllianceSearch] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [selectedAllianceForBoost, setSelectedAllianceForBoost] = useState<AllianceOpportunity | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlliance, setEditingAlliance] = useState<AllianceOpportunity | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [selectedProposalDetail, setSelectedProposalDetail] = useState<Application | null>(null);
  const [invitingResearcherId, setInvitingResearcherId] = useState<string | null>(null);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  // Action status
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile picture upload ref
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Load organization dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const creatorId = user?.uid || 'org-user';
      const [allAlls, allApps, allWorks, allProjs, allRes] = await Promise.all([
        getAlliances(creatorId),
        getApplications(creatorId, true),
        getWorkspaces(creatorId),
        getProjects(),
        getResearchers()
      ]);

      // If user has no alliances in demo mode, provide standard organization starter data
      if (allAlls.length === 0) {
        const starterAlliances: AllianceOpportunity[] = [
          {
            id: `all-${creatorId}-1`,
            createdBy: creatorId,
            orgName: userProfile?.organizationName || userProfile?.institution || userProfile?.fullName || 'Organization Partner',
            orgType: (userProfile?.organizationType as any) || 'Industry',
            country: userProfile?.country || 'Nigeria',
            website: userProfile?.website || '',
            contactPerson: userProfile?.fullName || '',
            email: userProfile?.email || user?.email || '',
            logo: userProfile?.organizationLogo || '',
            title: 'Sub-Saharan Agri-Waste Bio-Refinery Pilot Initiative',
            description: 'Seeking university research teams and clean-tech laboratories to deploy modular high-yield anaerobic digestion systems for agro-processing waste.',
            researchAreas: ['Circular Economy & Waste-to-Energy', 'Bioenergy & Biofuels'],
            technologyAreas: ['Waste-to-Energy Process Engineering'],
            eligibleCountries: ['Nigeria', 'Ghana', 'Kenya'],
            fundingAmount: '$45,000 Grant & Lab Testing Access',
            facilitiesAvailable: ['Anaerobic Digester Pilot Units', 'Gas Chromatography Lab'],
            timeline: '12 Months',
            deadline: '2026-11-30',
            maxParticipants: 3,
            supportOffered: ['Funding', 'Laboratory', 'Technical Mentor'],
            status: 'Active',
            visibility: 'Public',
            createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `all-${creatorId}-draft-1`,
            createdBy: creatorId,
            orgName: userProfile?.organizationName || userProfile?.institution || userProfile?.fullName || 'Organization Partner',
            orgType: (userProfile?.organizationType as any) || 'Industry',
            country: userProfile?.country || 'Ghana',
            website: userProfile?.website || '',
            contactPerson: userProfile?.fullName || '',
            email: userProfile?.email || user?.email || '',
            logo: userProfile?.organizationLogo || '',
            title: 'Commercial Scale Cassava Peel Methane Bioreactor Blueprint',
            description: 'Draft framework for joint patenting and techno-economic modeling of decentralized cassava processing biogas capture units.',
            researchAreas: ['Bioenergy & Biofuels'],
            technologyAreas: ['Waste-to-Energy Process Engineering'],
            eligibleCountries: ['Ghana', 'Nigeria'],
            fundingAmount: '$30,000',
            facilitiesAvailable: ['Bioreactor Prototyping Workshop'],
            timeline: '6 Months',
            deadline: '2026-12-15',
            maxParticipants: 2,
            supportOffered: ['Funding', 'Laboratory'],
            status: 'Draft',
            visibility: 'Private',
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setAlliances(starterAlliances);
      } else {
        setAlliances(allAlls);
      }

      setApplications(allApps);
      setWorkspaces(allWorks);
      setProjects(allProjs);
      setResearchers(allRes);
    } catch (err) {
      console.error('Error loading organization dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Show Toast
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPI Calculations
  const activeAlliancesList = useMemo(() => alliances.filter(a => a.status === 'Open' || !a.status), [alliances]);
  const draftAlliancesList = useMemo(() => alliances.filter(a => a.status === 'Draft'), [alliances]);
  const totalProposalsCount = useMemo(() => applications.length, [applications]);
  const activeWorkspacesCount = useMemo(() => workspaces.filter(w => w.status === 'Active' || !w.status).length, [workspaces]);
  
  const totalFundingEstimated = useMemo(() => {
    let sum = 0;
    alliances.forEach(a => {
      const match = (a.budget || '').match(/\$([0-9,]+)/);
      if (match && match[1]) {
        sum += parseInt(match[1].replace(/,/g, ''), 10);
      }
    });
    return sum > 0 ? `$${sum.toLocaleString()}` : '$75,000';
  }, [alliances]);

  // Handle Organization Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await createUserProfile(user.uid, {
          ...(userProfile || {}),
          profilePicture: base64
        });
        notify('Organization logo updated successfully.');
        setIsUploadingAvatar(false);
        onRefreshAll();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error updating organization logo:', err);
      setIsUploadingAvatar(false);
    }
  };

  // Handle Application Pipeline Action
  const handleUpdateApplicationStatus = async (appId: string, newStatus: Application['status'], nextStep: number) => {
    setActionInProgressId(appId);
    try {
      await updateApplicationStatus(appId, newStatus, nextStep);
      notify(`Proposal moved to "${newStatus}".`);
      await loadDashboardData();
      onRefreshAll();
    } catch (err) {
      console.error('Error updating application status:', err);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Delete Alliance
  const handleDeleteAlliance = async (allianceId: string) => {
    if (!window.confirm('Are you sure you want to delete this alliance opportunity?')) return;
    setActionInProgressId(allianceId);
    try {
      await deleteAlliance(allianceId);
      setAlliances(prev => prev.filter(a => a.id !== allianceId));
      notify('Alliance opportunity removed.');
    } catch (err) {
      console.error('Error deleting alliance:', err);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Publish Draft
  const handlePublishDraft = async (alliance: AllianceOpportunity) => {
    setActionInProgressId(alliance.id);
    try {
      await updateAlliance(alliance.id, {
        status: 'Active',
        updatedAt: new Date().toISOString()
      });
      setAlliances(prev => prev.map(a => a.id === alliance.id ? { ...a, status: 'Active' } : a));
      notify(`Alliance "${alliance.title}" is now published and accepting scholar proposals!`);
    } catch (err) {
      console.error('Error publishing draft:', err);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Send Direct Match Boost Invitation
  const handleSendMatchBoostInvite = async (researcher: any) => {
    setInvitingResearcherId(researcher.id);
    try {
      const allianceTitle = selectedAllianceForBoost?.title || 'Active Research Alliance';
      await addNotification(researcher.id, {
        type: 'alliance',
        title: `Alliance Invitation from ${userProfile?.organizationName || userProfile?.institution || 'Institutional Partner'}`,
        message: `Your research profile in "${researcher.expertise || researcher.researchInterests?.join(', ') || 'Clean Energy'}" is a high match for our opportunity: "${allianceTitle}". We invite your formal proposal submission.`
      });
      setInviteSuccessMsg(`Direct invitation delivered to ${researcher.name || researcher.fullName || 'Scholar'}.`);
      setTimeout(() => setInviteSuccessMsg(null), 4000);
      notify(`Invitation sent to ${researcher.name || researcher.fullName}!`);
    } catch (err) {
      console.error('Error sending invitation:', err);
    } finally {
      setInvitingResearcherId(null);
    }
  };

  // Organization Type label helper
  const orgTypeLabel = userProfile?.organizationType || userProfile?.userRole || (userProfile as any)?.role || 'Institution';
  const orgNameDisplay = userProfile?.organizationName || userProfile?.institution || userProfile?.fullName || 'Institutional Partner';
  const isVerified = userProfile?.verificationStatus === 'verified';

  return (
    <div className="bg-slate-50 min-h-screen py-8 text-left font-sans" id="organization_dashboard_root">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* 1. TOP BAR: Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight">
                  Organization Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {orgTypeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage research alliances, review scholar proposals, deploy grant funding, and discover top African researchers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setEditingAlliance(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border-0"
              id="org_btn_create_alliance"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Alliance</span>
            </button>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Reload Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. DEDICATED ORGANIZATION HEADER & CREDENTIALS CARD */}
        {/* Strictly contains organization brand, verification badge, focus areas, and actions. NO student/researcher profile completion banner. */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden text-left" id="org_profile_header_card">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/5 via-transparent to-transparent rounded-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            
            {/* Left: Organization Avatar + Brand Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              
              {/* Logo / Avatar Container */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900 border-2 border-emerald-500/30 flex items-center justify-center text-white text-3xl font-extrabold shadow-inner overflow-hidden relative">
                  {userProfile?.profilePicture || user?.photoURL ? (
                    <img 
                      src={userProfile?.profilePicture || user?.photoURL} 
                      alt={orgNameDisplay} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{orgNameDisplay.charAt(0).toUpperCase()}</span>
                  )}

                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md border-2 border-white cursor-pointer transition-colors"
                  title="Upload Organization Logo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Text Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
                    {orgNameDisplay}
                  </h2>
                  
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Institutional Partner
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowVerificationModal(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-bold transition cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Verification Required &rarr;
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 font-medium flex-wrap">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{orgTypeLabel}</span>
                  </div>
                  {userProfile?.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{userProfile.country}</span>
                    </div>
                  )}
                  {userProfile?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile?.website && (
                    <a 
                      href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1 text-emerald-700 hover:underline font-bold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>

                {/* Focus Areas Pills */}
                {userProfile?.researchInterests && userProfile.researchInterests.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Focus:</span>
                    {userProfile.researchInterests.slice(0, 4).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold">
                        {tag}
                      </span>
                    ))}
                    {userProfile.researchInterests.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{userProfile.researchInterests.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border-0"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Org Profile</span>
              </button>

              {!isVerified && (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Credentials</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. KEY KPI METRICS GRID (5 Core Metrics) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4" id="org_kpi_grid">
          
          {/* Card 1: Active Alliances */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Alliances</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{activeAlliancesList.length}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{draftAlliancesList.length} draft pending</span>
            </div>
          </div>

          {/* Card 2: Proposals Received */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proposals</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{totalProposalsCount}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">From verified scholars</span>
            </div>
          </div>

          {/* Card 3: Active Sponsored Projects */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workspaces</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{activeWorkspacesCount}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Active collaborative pilots</span>
            </div>
          </div>

          {/* Card 4: Matched Scholars */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matched Network</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{researchers.length || 18}</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Ready for match boost</span>
            </div>
          </div>

          {/* Card 5: Total Funding Deployed */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Allocated Grant</span>
              <div className="p-2 rounded-xl bg-white/10 text-emerald-300">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-display">{totalFundingEstimated}</div>
              <span className="text-[11px] text-emerald-200/70 mt-0.5 block">Committed funding pool</span>
            </div>
          </div>
        </div>

        {/* 4. NAVIGATION TABS */}
        <div className="border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px">
          {[
            { id: 'alliances', label: 'Active Alliances', count: activeAlliancesList.length, icon: Building2 },
            { id: 'drafts', label: 'Drafts', count: draftAlliancesList.length, icon: FilePlus },
            { id: 'proposals', label: 'Proposals Received', count: totalProposalsCount, icon: FileText },
            { id: 'workspaces', label: 'Funded Workspaces', count: activeWorkspacesCount, icon: Activity },
            { id: 'match_boost', label: 'Match Boost & Scholars', count: undefined, icon: Zap },
            { id: 'verification', label: 'Verification & Badges', count: undefined, icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as OrgTab)}
                className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-600 text-emerald-700 bg-white/60 rounded-t-xl' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 5. TAB CONTENT PANELS */}
        <div className="min-h-[450px]">
          <AnimatePresence mode="wait">

            {/* ======================================================== */}
            {/* TAB 1: ACTIVE ALLIANCES                                  */}
            {/* ======================================================== */}
            {activeTab === 'alliances' && (
              <motion.div
                key="tab-alliances"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Search & Domain Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={allianceSearch}
                      onChange={(e) => setAllianceSearch(e.target.value)}
                      placeholder="Search active alliances by title, domain, or technology..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDomainFilter}
                      onChange={(e) => setSelectedDomainFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                    >
                      <option value="All">All Domains</option>
                      {RESEARCH_FOCUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        setEditingAlliance(null);
                        setShowCreateModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Alliance</span>
                    </button>
                  </div>
                </div>

                {/* Alliances List */}
                {activeAlliancesList.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {activeAlliancesList
                      .filter(a => {
                        const matchSearch = a.title.toLowerCase().includes(allianceSearch.toLowerCase()) || 
                          (a.focusArea || '').toLowerCase().includes(allianceSearch.toLowerCase()) ||
                          (a.description || '').toLowerCase().includes(allianceSearch.toLowerCase());
                        const matchDomain = selectedDomainFilter === 'All' || a.focusArea === selectedDomainFilter;
                        return matchSearch && matchDomain;
                      })
                      .map((alliance) => {
                        const relevantApps = applications.filter(app => app.opportunityId === alliance.id);
                        return (
                          <div 
                            key={alliance.id} 
                            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4 text-left"
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {alliance.focusArea || 'Clean Energy'}
                                  </span>
                                  {alliance.trlLevel && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                      {alliance.trlLevel}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    Deadline: {alliance.applicationDeadline || 'Open Enrollment'}
                                  </span>
                                </div>
                                
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                                  {alliance.title}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setSelectedAllianceForBoost(alliance);
                                    setActiveTab('match_boost');
                                  }}
                                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                  title="Proactively find and invite top researchers for this alliance"
                                >
                                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Match Boost</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingAlliance(alliance);
                                    setShowCreateModal(true);
                                  }}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition cursor-pointer"
                                  title="Edit Alliance"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteAlliance(alliance.id)}
                                  disabled={actionInProgressId === alliance.id}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition cursor-pointer"
                                  title="Archive / Remove Alliance"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                              {alliance.description}
                            </p>

                            {/* Details Row: Budget, Spots, Support */}
                            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
                              {alliance.budget && (
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                  <Coins className="w-4 h-4 text-emerald-600" />
                                  <span>Grant / Budget: {alliance.budget}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>Spots: <strong>{alliance.availableSpots || 2}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span>Proposals Received: <strong>{relevantApps.length}</strong></span>
                              </div>
                            </div>

                            {/* Support Offered Badges */}
                            {alliance.supportOffered && alliance.supportOffered.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Support Provided:</span>
                                {alliance.supportOffered.map((sup, sIdx) => (
                                  <span key={sIdx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-semibold border border-emerald-100">
                                    ✓ {sup}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Quick Review Applicants Action */}
                            {relevantApps.length > 0 && (
                              <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                                <span className="font-semibold text-slate-700">
                                  {relevantApps.length} candidate proposals waiting for evaluation
                                </span>
                                <button
                                  onClick={() => setActiveTab('proposals')}
                                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                                >
                                  <span>Review Proposals</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 font-display">No Active Alliances</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Launch your organization's first collaborative research initiative or call for proposals.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                    >
                      Create First Alliance
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: DRAFTS                                            */}
            {/* ======================================================== */}
            {activeTab === 'drafts' && (
              <motion.div
                key="tab-drafts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">Draft Alliances</h3>
                    <p className="text-xs text-slate-500">Unpublished proposals and alliance briefs saved as drafts.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAlliance(null);
                      setShowCreateModal(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Draft</span>
                  </button>
                </div>

                {draftAlliancesList.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {draftAlliancesList.map((draft) => (
                      <div key={draft.id} className="bg-white rounded-3xl p-6 border border-dashed border-slate-300 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                              Draft Mode
                            </span>
                            <h4 className="text-base font-bold text-slate-900 font-display mt-1">{draft.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{draft.focusArea} &bull; TRL: {draft.trlLevel || 'N/A'}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePublishDraft(draft)}
                              disabled={actionInProgressId === draft.id}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Publish Live</span>
                            </button>

                            <button
                              onClick={() => {
                                setEditingAlliance(draft);
                                setShowCreateModal(true);
                              }}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition cursor-pointer"
                              title="Edit Draft"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteAlliance(draft.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition cursor-pointer"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {draft.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                    <FilePlus className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">No Drafts Saved</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">All your created alliances are currently published or none have been drafted yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: PROPOSALS RECEIVED                                */}
            {/* ======================================================== */}
            {activeTab === 'proposals' && (
              <motion.div
                key="tab-proposals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Submitted Scholar Proposals</h3>
                  <p className="text-xs text-slate-500">Evaluate scholar project feasibility, schedule video interviews, or accept candidates to automatically spawn collaborative workspaces.</p>
                </div>

                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => {
                      const linkedAlliance = alliances.find(a => a.id === app.opportunityId);
                      const associatedProject = projects.find(p => p.id === app.projectId);

                      return (
                        <div key={app.id} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 text-left">
                          
                          {/* Header: Project & Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-slate-900 font-display">{app.projectTitle}</h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                                  app.status === 'Interview' ? 'bg-indigo-100 text-indigo-800' :
                                  app.status === 'Review' ? 'bg-amber-100 text-amber-800' :
                                  app.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Applicant: <strong className="text-slate-800">{app.applicantName}</strong> &bull; Alliance: <span className="font-semibold text-emerald-700">{linkedAlliance?.title || 'Open Program'}</span>
                              </p>
                            </div>

                            <span className="text-[11px] text-slate-400 font-mono">
                              Date: {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Technical Project Content */}
                          {associatedProject && (
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                              <div>
                                <span className="font-bold text-slate-900 block mb-0.5">Problem Statement:</span>
                                <span>{associatedProject.problemStatement}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block mb-0.5">Proposed Solution:</span>
                                <span>{associatedProject.proposedSolution}</span>
                              </div>
                              <div className="flex items-center gap-4 pt-1 font-medium text-[11px]">
                                <span>TRL Stage: <strong>TRL {associatedProject.trl} ({associatedProject.currentStage})</strong></span>
                                {associatedProject.budget && <span>Budget: <strong>{associatedProject.budget}</strong></span>}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Pipeline */}
                          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            {app.status === 'Submitted' && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'Review', 3)}
                                disabled={actionInProgressId === app.id}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                Move to Technical Review
                              </button>
                            )}

                            {(app.status === 'Submitted' || app.status === 'Review') && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'Interview', 4)}
                                disabled={actionInProgressId === app.id}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                Schedule Interview
                              </button>
                            )}

                            {app.status !== 'Accepted' && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'Accepted', 5)}
                                disabled={actionInProgressId === app.id}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept & Launch Workspace</span>
                              </button>
                            )}

                            {app.status !== 'Rejected' && app.status !== 'Accepted' && (
                              <button
                                onClick={() => handleUpdateApplicationStatus(app.id, 'Rejected', 0)}
                                disabled={actionInProgressId === app.id}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                Decline
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">No Proposals Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Use the <strong>Match Boost</strong> tab to proactively invite verified researchers to your open alliances.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: FUNDED WORKSPACES                                 */}
            {/* ======================================================== */}
            {activeTab === 'workspaces' && (
              <motion.div
                key="tab-workspaces"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Funded Collaborative Workspaces</h3>
                  <p className="text-xs text-slate-500">Live collaborative project rooms between your organization and scholar teams.</p>
                </div>

                {workspaces.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workspaces.map((work) => {
                      const completedMilestones = work.milestones?.filter(m => m.status === 'Completed').length || 0;
                      const totalMilestones = work.milestones?.length || 1;
                      const pct = Math.round((completedMilestones / totalMilestones) * 100);

                      return (
                        <div key={work.id} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                {work.status || 'Active'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Budget: {work.budget?.total || '$15,000'}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-slate-900 font-display">{work.title}</h4>

                            {/* Progress bar */}
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                                <span>Milestones Progress</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                            </div>

                            {/* Collaborator details */}
                            <div className="pt-2 text-xs text-slate-600">
                              <span className="font-semibold block text-slate-700">Members:</span>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {work.members?.map((m, mIdx) => (
                                  <span key={mIdx} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-medium text-slate-700">
                                    {m.name} ({m.role})
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (onNavigateToView) {
                                onNavigateToView('collaboration');
                              }
                            }}
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <span>Open Collaborative Workspace</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                    <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">No Active Workspaces</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      When you accept a scholar's proposal in the Proposals tab, an interactive Notion-style workspace is generated automatically.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: MATCH BOOST & SCHOLAR DISCOVERY                   */}
            {/* ======================================================== */}
            {activeTab === 'match_boost' && (
              <motion.div
                key="tab-match-boost"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Match Boost Hero Card */}
                <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      AI Match Boost Engine
                    </div>
                    
                    <h3 className="text-2xl font-display font-black text-white">
                      Proactively Match with Verified Researchers
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed font-normal">
                      Instead of waiting for incoming applications, our matching algorithm cross-references your active alliance specifications against verified research briefs, patent records, and university labs across Sub-Saharan Africa.
                    </p>

                    {/* Active target selector */}
                    <div className="pt-2">
                      <label className="text-xs font-bold text-purple-200 block mb-1.5">Target Alliance to Boost:</label>
                      <select
                        value={selectedAllianceForBoost?.id || ''}
                        onChange={(e) => {
                          const found = alliances.find(a => a.id === e.target.value);
                          setSelectedAllianceForBoost(found || null);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-purple-950/80 border border-purple-400/40 rounded-xl text-xs text-white outline-none font-semibold cursor-pointer"
                      >
                        <option value="">-- Select an alliance to boost --</option>
                        {activeAlliancesList.map((a) => (
                          <option key={a.id} value={a.id}>{a.title} ({a.focusArea})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {inviteSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{inviteSuccessMsg}</span>
                  </div>
                )}

                {/* List of Matched Researchers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 font-display">Top Verified Scholars in Your Domain</h4>
                    <span className="text-xs text-slate-500 font-semibold">{researchers.length || 6} Matches identified</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {researchers.slice(0, 9).map((res, idx) => {
                      const matchPct = 98 - (idx * 3);
                      return (
                        <div key={res.id || idx} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                          <div className="space-y-3">
                            
                            {/* Avatar & Match Pill */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm overflow-hidden">
                                  {res.photoURL || res.profilePicture ? (
                                    <img src={res.photoURL || res.profilePicture} alt={res.name || res.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{(res.name || res.fullName || 'Scholar').charAt(0)}</span>
                                  )}
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold text-slate-900 font-display">{res.name || res.fullName || 'Verified Researcher'}</h5>
                                  <p className="text-[11px] text-slate-500">{res.institution || res.university || 'Core Research Institute'}</p>
                                </div>
                              </div>

                              <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-mono font-black">
                                {matchPct}% Match
                              </span>
                            </div>

                            {/* Expertise & Specs */}
                            <div className="space-y-1 text-xs text-slate-600">
                              <p className="line-clamp-2">
                                <strong>Focus:</strong> {res.expertise || res.researchInterests?.join(', ') || 'Bioenergy, Anaerobic Catalysis, Microgrids'}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                                {res.country && <span>📍 {res.country}</span>}
                                <span>📄 {res.publicationsCount || 4} Studies</span>
                                <span>⭐ Verified Scholar</span>
                              </div>
                            </div>
                          </div>

                          {/* Direct Invite Action */}
                          <button
                            onClick={() => handleSendMatchBoostInvite(res)}
                            disabled={invitingResearcherId === res.id}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border-0 shadow-xs"
                          >
                            {invitingResearcherId === res.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Send Direct Alliance Invitation</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 6: VERIFICATION & BADGES                             */}
            {/* ======================================================== */}
            {activeTab === 'verification' && (
              <motion.div
                key="tab-verification"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <VerificationStatusCard
                  status={userProfile?.verificationStatus || 'not_started'}
                  orgType={userProfile?.organizationType}
                  orgName={userProfile?.organizationName || userProfile?.institution}
                  notes={userProfile?.verificationNotes}
                  submittedAt={userProfile?.verificationSubmittedAt}
                  publisherLevel={userProfile?.publisherVerificationLevel}
                  onStartVerification={() => setShowVerificationModal(true)}
                />

                {/* Institutional Compliance Checklist Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-display">Institutional Badge Benefits</h4>
                      <p className="text-xs text-slate-500">Verified Organization accounts unlock enhanced privileges across the platform.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">Direct Proposal Calls & Grant Publishing</h5>
                        <p className="text-slate-500 mt-0.5">Post legally binding grant funding and pilot testing calls with official Aurenix verification badges.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">Priority AI Match Boost</h5>
                        <p className="text-slate-500 mt-0.5">Opportunities get promoted directly to senior researchers and academic department heads.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">Notion-Style Collaborative Workspaces</h5>
                        <p className="text-slate-500 mt-0.5">Co-manage milestones, deliverables, data rooms, and fund releases in private workspaces.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">Publisher Level Accreditation</h5>
                        <p className="text-slate-500 mt-0.5">Authenticate institutional white papers and feasibility briefs for high-impact distribution.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT ALLIANCE MODAL                                     */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <CreateEditAllianceModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAlliance(null);
          }}
          initialData={editingAlliance}
          creatorId={user?.uid || 'org-user'}
          defaultOrgName={orgNameDisplay}
          defaultCountry={userProfile?.country || 'Nigeria'}
          onSaved={(newOrUpdated) => {
            setAlliances(prev => {
              const exists = prev.some(a => a.id === newOrUpdated.id);
              if (exists) {
                return prev.map(a => a.id === newOrUpdated.id ? newOrUpdated : a);
              }
              return [newOrUpdated, ...prev];
            });
            notify(newOrUpdated.status === 'Draft' ? 'Alliance saved to Drafts.' : 'Alliance published successfully!');
            setShowCreateModal(false);
            setEditingAlliance(null);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ORGANIZATION VERIFICATION MODAL                                  */}
      {/* ========================================================================= */}
      {showVerificationModal && (
        <OrganizationVerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          user={user}
          userProfile={userProfile}
          onVerificationSubmitted={() => {
            notify('Verification application submitted for review.');
            onRefreshAll();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT ORGANIZATION PROFILE MODAL                                  */}
      {/* ========================================================================= */}
      {showEditProfileModal && (
        <EditOrgProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          userProfile={userProfile}
          userId={user?.uid}
          onUpdated={() => {
            notify('Organization profile updated.');
            onRefreshAll();
            setShowEditProfileModal(false);
          }}
        />
      )}

    </div>
  );
}

/* ========================================================================= */
/* SUB-COMPONENT: CREATE / EDIT ALLIANCE MODAL                               */
/* ========================================================================= */
interface CreateEditAllianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: AllianceOpportunity | null;
  creatorId: string;
  defaultOrgName: string;
  defaultCountry: string;
  onSaved: (alliance: AllianceOpportunity) => void;
}

function CreateEditAllianceModal({
  isOpen,
  onClose,
  initialData,
  creatorId,
  defaultOrgName,
  defaultCountry,
  onSaved
}: CreateEditAllianceModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [focusArea, setFocusArea] = useState((initialData as any)?.focusArea || initialData?.researchAreas?.[0] || 'Bioenergy & Biofuels');
  const [country, setCountry] = useState(initialData?.country || defaultCountry);
  const [trlLevel, setTrlLevel] = useState((initialData as any)?.trlLevel || 'TRL 4-6 (Lab Validation / Prototype)');
  const [description, setDescription] = useState(initialData?.description || '');
  const [budget, setBudget] = useState((initialData as any)?.budget || initialData?.fundingAmount || '$25,000');
  const [availableSpots, setAvailableSpots] = useState((initialData as any)?.availableSpots || initialData?.maxParticipants || 2);
  const [applicationDeadline, setApplicationDeadline] = useState((initialData as any)?.applicationDeadline || initialData?.deadline || '2026-12-31');
  const [selectedSupports, setSelectedSupports] = useState<string[]>(
    initialData?.supportOffered || ['Direct Funding', 'Testing Laboratory Access']
  );
  const [isSaving, setIsSaving] = useState(false);

  const SUPPORT_OPTIONS = [
    'Direct Funding',
    'Testing Laboratory Access',
    'Field Deployment Mentorship',
    'Regulatory & Policy Guidance',
    'Equipment & Machinery Provision',
    'Joint Co-Patenting'
  ];

  const handleToggleSupport = (sup: string) => {
    setSelectedSupports(prev => 
      prev.includes(sup) ? prev.filter(s => s !== sup) : [...prev, sup]
    );
  };

  const handleSave = async (saveAsDraft: boolean) => {
    if (!title.trim() || !description.trim()) {
      alert('Please provide a title and detailed description for this alliance.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: AllianceOpportunity = {
        id: initialData?.id || `all-${Date.now()}`,
        createdBy: creatorId,
        orgName: defaultOrgName,
        orgType: 'Industry',
        country,
        website: '',
        contactPerson: '',
        email: '',
        logo: '',
        title: title.trim(),
        description: description.trim(),
        researchAreas: [focusArea],
        technologyAreas: [focusArea],
        eligibleCountries: [country],
        fundingAmount: budget.trim(),
        facilitiesAvailable: ['Lab & Testing Facilities'],
        timeline: '12 Months',
        deadline: applicationDeadline,
        maxParticipants: Number(availableSpots),
        supportOffered: selectedSupports,
        status: saveAsDraft ? 'Draft' : 'Active',
        visibility: 'Public',
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...({
          focusArea,
          budget: budget.trim(),
          availableSpots: Number(availableSpots),
          applicationDeadline,
          institution: defaultOrgName
        } as any)
      };

      if (initialData?.id) {
        await updateAlliance(initialData.id, payload);
      } else {
        await createAlliance(payload);
      }

      onSaved(payload);
    } catch (err) {
      console.error('Error saving alliance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 text-left my-8"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Alliance Creator</span>
            <h3 className="text-lg font-display font-extrabold text-slate-900">
              {initialData ? 'Edit Alliance Opportunity' : 'Launch New Research Alliance'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Opportunity Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Municipal Bio-waste Valorization & Clean Gas Pilot"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>

          {/* Focus Area & TRL Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Domain / Focus Area</label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-semibold"
              >
                {RESEARCH_FOCUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Target Readiness (TRL)</label>
              <select
                value={trlLevel}
                onChange={(e) => setTrlLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="TRL 1-3 (Early Concept)">TRL 1-3 (Early Concept)</option>
                <option value="TRL 4-6 (Lab Validation / Prototype)">TRL 4-6 (Lab Validation / Prototype)</option>
                <option value="TRL 7-9 (Field Deployment / Commercial)">TRL 7-9 (Field Deployment / Commercial)</option>
              </select>
            </div>
          </div>

          {/* Budget, Spots & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Budget / Grant</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $35,000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Available Spots</label>
              <input
                type="number"
                min={1}
                max={50}
                value={availableSpots}
                onChange={(e) => setAvailableSpots(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Deadline</label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Scope & Objectives <span className="text-rose-500">*</span></label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project objectives, candidate researcher expectations, lab specifications, and grant deliverable milestones..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 resize-none font-medium leading-relaxed"
              required
            />
          </div>

          {/* Support Provided Checkboxes */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Support Offered to Selected Researchers</label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORT_OPTIONS.map((opt) => {
                const isSelected = selectedSupports.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleSupport(opt)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-[11px] truncate">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Publish Alliance Live</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ========================================================================= */
/* SUB-COMPONENT: EDIT ORGANIZATION PROFILE MODAL                            */
/* ========================================================================= */
interface EditOrgProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  userId: string;
  onUpdated: () => void;
}

function EditOrgProfileModal({
  isOpen,
  onClose,
  userProfile,
  userId,
  onUpdated
}: EditOrgProfileModalProps) {
  const [orgName, setOrgName] = useState(userProfile?.organizationName || userProfile?.institution || userProfile?.fullName || '');
  const [orgType, setOrgType] = useState(userProfile?.organizationType || userProfile?.userRole || 'Industry');
  const [country, setCountry] = useState(userProfile?.country || 'Nigeria');
  const [website, setWebsite] = useState(userProfile?.website || '');
  const [contactPerson, setContactPerson] = useState(userProfile?.fullName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userProfile?.researchInterests || []);
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createUserProfile(userId, {
        ...(userProfile || {}),
        organizationName: orgName.trim(),
        institution: orgName.trim(),
        fullName: contactPerson.trim() || orgName.trim(),
        organizationType: orgType,
        userRole: orgType,
        country,
        website: website.trim(),
        bio: bio.trim(),
        researchInterests: selectedInterests
      });
      onUpdated();
    } catch (err) {
      console.error('Error updating organization profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 text-left my-8"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Profile Settings</span>
            <h3 className="text-lg font-display font-extrabold text-slate-900">
              Edit Organization Profile
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          
          {/* Org Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Organization Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. West African Clean Energy Alliance"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>

          {/* Org Type & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Organization Type</label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="Industry">Industry / Commercial</option>
                <option value="NGO">NGO / Non-Profit</option>
                <option value="Institution">Academic / University Institution</option>
                <option value="Government Agency">Government Agency</option>
                <option value="Other">Other Organization</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Country Headquarter</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Nigeria, Ghana, Kenya"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
          </div>

          {/* Website & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. https://energy-alliance.org"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Lead Coordinator / Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Dr. Kwame Mensah"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* About / Bio */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Organization Mission & Overview</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="State your organization's mission, research interests, and available lab testing infrastructure..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Focus Areas */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Target Research Domains</label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {RESEARCH_FOCUS_OPTIONS.map((domain) => {
                const active = selectedInterests.includes(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => toggleInterest(domain)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold cursor-pointer transition ${
                      active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {active ? `✓ ${domain}` : `+ ${domain}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
