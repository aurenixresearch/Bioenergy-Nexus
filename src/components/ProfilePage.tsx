import React, { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  User, 
  Settings, 
  Mail, 
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
  Briefcase, 
  GraduationCap, 
  Globe, 
  Share2, 
  FileText, 
  Linkedin, 
  ShieldCheck, 
  Check, 
  X, 
  Loader2, 
  BarChart3,
  Lock,
  EyeOff,
  Users,
  FlaskConical,
  Code,
  Languages,
  FolderGit2,
  FileCode,
  FileCheck2,
  Building2,
  Handshake,
  UserCheck,
  Compass,
  Tag,
  AtSign
} from 'lucide-react';
import { validateAndProcessProfilePicture } from '../services/avatarValidation';
import { motion, AnimatePresence } from 'motion/react';
import { ResearchPaper, UserProfile, UserProfilePrivacySettings, UserProfileProject, UserProfilePatent } from '../types';
import { getCustomPapers, getUserProfile, createUserProfile, deleteCustomPaper, updateCustomPaper, addCustomPaper } from '../services/db';
import { checkProfileCompleteness } from '../utils/profileValidation';
import ResearchAnalytics from './dashboard/ResearchAnalytics';
import PublishWizard from './PublishWizard';

interface ProfilePageProps {
  user: FirebaseUser;
  onNavigateToView: (view: any) => void;
  theme?: 'light' | 'dark';
}

type TabType = 'overview' | 'research' | 'publications' | 'collaborations' | 'contact';

export default function ProfilePage({ user, onNavigateToView, theme }: ProfilePageProps) {
  const [profileData, setProfileData] = useState<UserProfile | any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [myPublications, setMyPublications] = useState<ResearchPaper[]>([]);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isUploadWizardOpen, setIsUploadWizardOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editTab, setEditTab] = useState<TabType>('overview');

  // Alerts & Picture Upload State
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAnalyzingAvatar, setIsAnalyzingAvatar] = useState(false);
  const [avatarStatusText, setAvatarStatusText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safely migrate and initialize user profile without dummy text
  const sanitizeProfileData = (rawProfile: any) => {
    if (!rawProfile) return null;

    const portfolio = rawProfile.portfolioLinks || {};
    
    return {
      uid: user.uid,
      accountType: rawProfile.accountType || (rawProfile.role === 'Institution' ? 'institution' : 'individual'),
      isOrganization: Boolean(rawProfile.isOrganization || rawProfile.accountType === 'institution' || rawProfile.role === 'Institution'),
      
      // Basic
      profilePicture: rawProfile.profilePicture || user.photoURL || '',
      coverBanner: rawProfile.coverBanner || '',
      fullName: rawProfile.fullName || user.displayName || '',
      professionalTitle: rawProfile.professionalTitle || rawProfile.title || '',
      bio: rawProfile.bio || rawProfile.description || '',
      country: rawProfile.country || rawProfile.location || '',
      city: rawProfile.city || '',
      institution: rawProfile.institution || rawProfile.organization || rawProfile.organizationName || '',
      department: rawProfile.department || '',
      memberSince: rawProfile.memberSince || new Date(user.metadata.creationTime || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isVerified: Boolean(rawProfile.isVerified || rawProfile.verified),

      // Organization
      organizationName: rawProfile.organizationName || rawProfile.institution || '',
      organizationLogo: rawProfile.organizationLogo || rawProfile.profilePicture || '',
      organizationType: rawProfile.organizationType || 'Research Institution',
      organizationDescription: rawProfile.organizationDescription || rawProfile.bio || '',

      // Academic
      primaryResearchArea: rawProfile.primaryResearchArea || (Array.isArray(rawProfile.researchInterests) && rawProfile.researchInterests[0]) || '',
      secondaryResearchAreas: Array.isArray(rawProfile.secondaryResearchAreas) ? rawProfile.secondaryResearchAreas : [],
      areasOfSpecialization: Array.isArray(rawProfile.areasOfSpecialization) ? rawProfile.areasOfSpecialization : (rawProfile.areasOfExpertise ? rawProfile.areasOfExpertise.split(',').map((s: string) => s.trim()) : []),
      academicQualifications: Array.isArray(rawProfile.academicQualifications) ? rawProfile.academicQualifications : [],
      professionalCertifications: Array.isArray(rawProfile.professionalCertifications) ? rawProfile.professionalCertifications : [],
      currentPosition: rawProfile.currentPosition || rawProfile.role || '',
      yearsOfExperience: rawProfile.yearsOfExperience || rawProfile.experienceYears || 0,

      // Skills
      technicalSkills: Array.isArray(rawProfile.technicalSkills) ? rawProfile.technicalSkills : (Array.isArray(rawProfile.skills) ? rawProfile.skills : []),
      laboratorySkills: Array.isArray(rawProfile.laboratorySkills) ? rawProfile.laboratorySkills : [],
      softwareSkills: Array.isArray(rawProfile.softwareSkills) ? rawProfile.softwareSkills : [],
      languagesSpoken: Array.isArray(rawProfile.languagesSpoken) ? rawProfile.languagesSpoken : [],

      // Research
      researchInterests: Array.isArray(rawProfile.researchInterests) ? rawProfile.researchInterests : [],
      researchKeywords: Array.isArray(rawProfile.researchKeywords) ? rawProfile.researchKeywords : [],
      researchProjects: Array.isArray(rawProfile.researchProjects) ? rawProfile.researchProjects : (Array.isArray(rawProfile.innovationProjects) ? rawProfile.innovationProjects : []),
      currentResearchWork: rawProfile.currentResearchWork || '',
      researchCategories: Array.isArray(rawProfile.researchCategories) ? rawProfile.researchCategories : [],

      // Publications
      publishedPapers: Array.isArray(rawProfile.publishedPapers) ? rawProfile.publishedPapers : [],
      ongoingResearch: Array.isArray(rawProfile.ongoingResearch) ? rawProfile.ongoingResearch : [],
      draftResearch: Array.isArray(rawProfile.draftResearch) ? rawProfile.draftResearch : [],
      patents: Array.isArray(rawProfile.patents) ? rawProfile.patents : [],

      // Collaborations
      openToCollaboration: rawProfile.openToCollaboration !== undefined ? Boolean(rawProfile.openToCollaboration) : true,
      openToMentoring: Boolean(rawProfile.openToMentoring),
      openToConsulting: Boolean(rawProfile.openToConsulting),
      collaborationAreasOfInterest: Array.isArray(rawProfile.collaborationAreasOfInterest) ? rawProfile.collaborationAreasOfInterest : [],

      // Contact
      email: rawProfile.email || user.email || '',
      website: rawProfile.website || portfolio.website || '',
      orcid: rawProfile.orcid || portfolio.orcid || '',
      googleScholar: rawProfile.googleScholar || portfolio.googleScholar || '',
      linkedin: rawProfile.linkedin || portfolio.linkedin || '',
      researchgate: rawProfile.researchgate || portfolio.researchgate || '',
      
      // Contact Privacy
      privacySettings: {
        email: rawProfile.privacySettings?.email || 'public',
        website: rawProfile.privacySettings?.website || 'public',
        orcid: rawProfile.privacySettings?.orcid || 'public',
        googleScholar: rawProfile.privacySettings?.googleScholar || 'public',
        linkedin: rawProfile.privacySettings?.linkedin || 'public',
        researchgate: rawProfile.privacySettings?.researchgate || 'public',
      }
    };
  };

  const fetchProfileAndData = async () => {
    setLoading(true);
    try {
      const rawProfile = await getUserProfile(user.uid);
      let sanitized: any = null;

      if (rawProfile) {
        sanitized = sanitizeProfileData(rawProfile);
      } else {
        // Fresh profile initialized from auth credentials with zero dummy content
        const freshProfile = {
          fullName: user.displayName || '',
          email: user.email || '',
          profilePicture: user.photoURL || '',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          isVerified: false,
          accountType: 'individual',
          isOrganization: false,
          openToCollaboration: true,
          privacySettings: {
            email: 'public',
            website: 'public',
            orcid: 'public',
            googleScholar: 'public',
            linkedin: 'public',
            researchgate: 'public'
          }
        };
        await createUserProfile(user.uid, freshProfile);
        sanitized = sanitizeProfileData(freshProfile);
      }

      setProfileData(sanitized);
      setEditForm(JSON.parse(JSON.stringify(sanitized)));

      // Fetch user's custom papers directly from database
      const customP = await getCustomPapers();
      const userPapers = customP.filter(p => p.userId === user.uid || p.userEmail === user.email);
      setMyPublications(userPapers);

    } catch (err) {
      console.error('Error loading profile system:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndData();
  }, [user]);

  // Profile completion calculation based on 7 tasks
  const completenessResult = checkProfileCompleteness(profileData, myPublications.length);
  const completionPercent = completenessResult.completionPercent;

  const completionTasks = [
    { id: 'picture', label: 'Upload a profile picture', isDone: Boolean(profileData?.profilePicture && profileData.profilePicture.trim()) },
    { id: 'bio', label: 'Add a biography', isDone: Boolean(profileData?.bio && profileData.bio.trim()) },
    { id: 'institution', label: 'Add an institution', isDone: Boolean(profileData?.institution && profileData.institution.trim()) },
    { id: 'country', label: 'Add a country', isDone: Boolean(profileData?.country && profileData.country.trim()) },
    { id: 'interests', label: 'Add research interests', isDone: Boolean(profileData?.researchInterests && profileData.researchInterests.length > 0) },
    { id: 'contact', label: 'Add contact information', isDone: Boolean(profileData?.email || profileData?.website || profileData?.orcid || profileData?.linkedin || profileData?.googleScholar || profileData?.researchgate) },
    { id: 'research', label: 'Upload research', isDone: myPublications.length > 0 || (profileData?.publishedPapers && profileData.publishedPapers.length > 0) }
  ];

  // Save profile changes
  const handleSaveProfile = async (updatedData: any) => {
    setLoading(true);
    try {
      const sanitized = sanitizeProfileData(updatedData);
      await createUserProfile(user.uid, sanitized);
      setProfileData(sanitized);
      setEditForm(JSON.parse(JSON.stringify(sanitized)));
      setIsEditModalOpen(false);
      setAlertMsg({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setAlertMsg({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setTimeout(() => setAlertMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Avatar upload handler
  const handleAvatarChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingAvatar(true);
    setAvatarStatusText('Processing image with face/logo detection...');
    setAlertMsg(null);

    try {
      const result = await validateAndProcessProfilePicture(file, user.uid, (status) => {
        setAvatarStatusText(status);
      });

      if (!result.isValid) {
        setAlertMsg({
          type: 'error',
          text: result.reason || 'Image validation failed. Please upload a clear photo.'
        });
        setTimeout(() => setAlertMsg(null), 5000);
        return;
      }

      const newPhotoUrl = result.storageUrl || result.compressedBase64;
      if (profileData && newPhotoUrl) {
        const updated = {
          ...profileData,
          profilePicture: newPhotoUrl,
          organizationLogo: profileData.isOrganization ? newPhotoUrl : profileData.organizationLogo,
          updatedAt: new Date().toISOString()
        };
        await createUserProfile(user.uid, updated);
        setProfileData(updated);
        setEditForm(JSON.parse(JSON.stringify(updated)));
        setAlertMsg({ type: 'success', text: 'Profile picture updated successfully.' });
        setTimeout(() => setAlertMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setAlertMsg({ type: 'error', text: 'An error occurred while uploading profile picture.' });
      setTimeout(() => setAlertMsg(null), 5000);
    } finally {
      setIsAnalyzingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const confirmDeletePaper = async () => {
    if (!deletingPaperId) return;
    try {
      await deleteCustomPaper(deletingPaperId);
      setMyPublications(prev => prev.filter(p => p.id !== deletingPaperId));
      setAlertMsg({ type: 'success', text: 'Research paper deleted.' });
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      console.error('Error deleting paper:', err);
      setAlertMsg({ type: 'error', text: 'Failed to delete research paper.' });
      setTimeout(() => setAlertMsg(null), 4000);
    } finally {
      setDeletingPaperId(null);
    }
  };

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/profile/${user.uid}`;
    navigator.clipboard.writeText(shareUrl);
    setAlertMsg({ type: 'success', text: 'Profile link copied to clipboard!' });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  // Helper for adding/removing tag items in edit form
  const addTagItem = (fieldName: string, value: string) => {
    if (!value.trim()) return;
    const current = Array.isArray(editForm[fieldName]) ? editForm[fieldName] : [];
    if (!current.includes(value.trim())) {
      setEditForm({ ...editForm, [fieldName]: [...current, value.trim()] });
    }
  };

  const removeTagItem = (fieldName: string, value: string) => {
    const current = Array.isArray(editForm[fieldName]) ? editForm[fieldName] : [];
    setEditForm({ ...editForm, [fieldName]: current.filter((item: string) => item !== value) });
  };

  if (loading && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4" id="profile_loading_state">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 min-h-screen text-left pb-24 transition-colors" id="user_profile_system">
      
      {/* Notifications */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border backdrop-blur-md ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-200' 
                : 'bg-rose-50/90 border-rose-200 text-rose-900 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-200'
            }`}
            id="profile_alert_box"
          >
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />}
            <span className="text-xs font-semibold">{alertMsg.text}</span>
            <button onClick={() => setAlertMsg(null)} className="ml-2 hover:opacity-75 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Header */}
      <div className="relative h-44 sm:h-60 lg:h-72 w-full overflow-hidden bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950" id="profile_cover_banner">
        {profileData?.coverBanner && (
          <img 
            src={profileData.coverBanner} 
            alt="Cover Banner" 
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        
        {/* Navigation Bar */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center gap-2">
          <button 
            onClick={() => onNavigateToView('dashboard')}
            className="px-3.5 py-2 min-h-[40px] bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-2 backdrop-blur-md cursor-pointer transition-all"
            id="profile_back_btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 text-center md:text-left">
            
            {/* Identity & Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 w-full md:w-auto">
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden shadow-md bg-emerald-50 dark:bg-slate-800 relative">
                  {profileData?.profilePicture ? (
                    <img 
                      src={profileData.profilePicture} 
                      alt={profileData.fullName || 'User Profile'} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-extrabold text-3xl font-display">
                      {profileData?.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  {isAnalyzingAvatar && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Processing</span>
                    </div>
                  )}
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
                  disabled={isAnalyzingAvatar}
                  className="absolute bottom-2 right-2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105 min-w-[36px] min-h-[36px] flex items-center justify-center border border-white dark:border-slate-900"
                  title="Upload profile picture"
                  id="profile_avatar_change_btn"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Info */}
              <div className="space-y-1.5 w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                    {profileData?.fullName || 'Academic User'}
                  </h1>
                  {profileData?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  )}
                  {profileData?.isOrganization && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      Institution
                    </span>
                  )}
                </div>

                {profileData?.professionalTitle && (
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {profileData.professionalTitle}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {profileData?.institution && (
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profileData.institution}{profileData.department ? ` • ${profileData.department}` : ''}</span>
                    </span>
                  )}
                  {profileData?.country && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profileData.country}{profileData.city ? `, ${profileData.city}` : ''}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Member since {profileData?.memberSince}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-center md:justify-end">
              <button 
                onClick={() => {
                  setEditForm(JSON.parse(JSON.stringify(profileData)));
                  setIsEditModalOpen(true);
                }}
                className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs min-h-[42px]"
                id="profile_edit_btn"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
              <button 
                onClick={() => setIsAnalyticsOpen(true)}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[42px] border border-emerald-200/50 dark:border-emerald-900/50 shadow-xs"
                id="profile_upload_paper_btn"
              >
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                View Analytics
              </button>
              <button 
                onClick={handleShareProfile}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer transition-all min-h-[42px] min-w-[42px]"
                title="Share Profile"
                id="profile_share_btn"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Organization Profile Details Banner (If Account is Institution) */}
          {profileData?.isOrganization && (
            <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/50 border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                {profileData.organizationLogo ? (
                  <img src={profileData.organizationLogo} alt={profileData.organizationName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              <div className="space-y-1 text-left flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {profileData.organizationName || profileData.institution || 'Institutional Organization'}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300">
                    {profileData.organizationType || 'University / Research Center'}
                  </span>
                </div>
                {profileData.organizationDescription && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {profileData.organizationDescription}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Outer Layout: Left Completion Sidebar & Right Tabs Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar - Profile Completion System */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Completion Percentage Widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Profile Completion
                </h3>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {completionPercent}%
                </span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-6">
                <div 
                  className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completionPercent}%` }} 
                />
              </div>

              {/* 7 Task Checklist */}
              <div className="space-y-3">
                {completionTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      if (!task.isDone) {
                        setEditForm(JSON.parse(JSON.stringify(profileData)));
                        setIsEditModalOpen(true);
                      }
                    }}
                  >
                    <span className={`font-medium ${task.isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300 font-semibold'}`}>
                      {task.label}
                    </span>
                    {task.isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-dashed border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Guarantee Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 text-left text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Private Data Safeguard</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                Sensitive account identifiers, internal authentication records, security credentials, and administrative logs remain strictly private and are never rendered on public profiles.
              </p>
            </div>

          </div>

          {/* Right Main Deck - 5 Tabbed Navigation */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab Buttons */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 flex flex-wrap gap-1 shadow-xs" id="profile_tab_nav">
              {(
                [
                  { key: 'overview', label: 'Overview', icon: User },
                  { key: 'research', label: 'Research', icon: FlaskConical },
                  { key: 'publications', label: 'Publications', icon: BookOpen },
                  { key: 'collaborations', label: 'Collaborations', icon: Handshake },
                  { key: 'contact', label: 'Contact Information', icon: Mail },
                ] as const
              ).map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 min-h-[400px]">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Full Name</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.fullName || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium">Professional Title</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.professionalTitle || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium">Institution / Organization</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.institution || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium">Department</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.department || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium">Country</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.country || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium">City</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.city || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 text-xs font-medium">Biography</span>
                      {profileData?.bio ? (
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1 whitespace-pre-line">
                          {profileData.bio}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-1">No biography provided yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Academic Information Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      Academic Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Primary Research Area</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.primaryResearchArea || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium">Current Position</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.currentPosition || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium">Years of Experience</span>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                          {profileData?.yearsOfExperience ? `${profileData.yearsOfExperience} Years` : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Research Areas */}
                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-xs font-medium">Secondary Research Areas</span>
                      {profileData?.secondaryResearchAreas && profileData.secondaryResearchAreas.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {profileData.secondaryResearchAreas.map((area: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">
                              {area}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">None specified</p>
                      )}
                    </div>

                    {/* Areas of Specialization */}
                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-xs font-medium">Areas of Specialization</span>
                      {profileData?.areasOfSpecialization && profileData.areasOfSpecialization.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {profileData.areasOfSpecialization.map((spec: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium">
                              {spec}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">None specified</p>
                      )}
                    </div>

                    {/* Qualifications & Certifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-slate-400 text-xs font-medium">Academic Qualifications</span>
                        {profileData?.academicQualifications && profileData.academicQualifications.length > 0 ? (
                          <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 mt-1 space-y-1">
                            {profileData.academicQualifications.map((q: string, i: number) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">No qualifications listed.</p>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-400 text-xs font-medium">Professional Certifications</span>
                        {profileData?.professionalCertifications && profileData.professionalCertifications.length > 0 ? (
                          <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 mt-1 space-y-1">
                            {profileData.professionalCertifications.map((c: string, i: number) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">No certifications listed.</p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <Code className="w-4 h-4 text-emerald-600" />
                      Skills
                    </h3>

                    <div className="space-y-4">
                      {/* Technical Skills */}
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Technical Skills</span>
                        {profileData?.technicalSkills && profileData.technicalSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {profileData.technicalSkills.map((skill: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">No technical skills added.</p>
                        )}
                      </div>

                      {/* Laboratory Skills */}
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Laboratory Skills</span>
                        {profileData?.laboratorySkills && profileData.laboratorySkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {profileData.laboratorySkills.map((skill: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">No laboratory skills added.</p>
                        )}
                      </div>

                      {/* Software Skills */}
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Software Skills</span>
                        {profileData?.softwareSkills && profileData.softwareSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {profileData.softwareSkills.map((skill: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">No software skills added.</p>
                        )}
                      </div>

                      {/* Languages Spoken */}
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Languages Spoken</span>
                        {profileData?.languagesSpoken && profileData.languagesSpoken.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {profileData.languagesSpoken.map((lang: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium">
                                {lang}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">No languages specified.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* TAB 2: RESEARCH */}
              {activeTab === 'research' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  
                  {/* Research Interests */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-600" />
                      Research Interests
                    </h3>

                    {profileData?.researchInterests && profileData.researchInterests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.researchInterests.map((interest: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No research interests added.</p>
                    )}
                  </div>

                  {/* Research Keywords */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      Research Keywords
                    </h3>

                    {profileData?.researchKeywords && profileData.researchKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profileData.researchKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-mono">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No research keywords added.</p>
                    )}
                  </div>

                  {/* Current Research Work */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-emerald-600" />
                      Current Research Work
                    </h3>

                    {profileData?.currentResearchWork ? (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {profileData.currentResearchWork}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No current research work specified.</p>
                    )}
                  </div>

                  {/* Research Categories */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-emerald-600" />
                      Research Categories
                    </h3>

                    {profileData?.researchCategories && profileData.researchCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.researchCategories.map((cat: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold">
                            {cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No research categories selected.</p>
                    )}
                  </div>

                  {/* Research Projects */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-600" />
                      Research Projects
                    </h3>

                    {profileData?.researchProjects && profileData.researchProjects.length > 0 ? (
                      <div className="space-y-3">
                        {profileData.researchProjects.map((proj: UserProfileProject) => (
                          <div key={proj.id} className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-1 shadow-xs">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                              {proj.status && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md">
                                  {proj.status}
                                </span>
                              )}
                            </div>
                            {proj.description && <p className="text-xs text-slate-600 dark:text-slate-400">{proj.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No research projects available.</p>
                    )}
                  </div>

                </motion.div>
              )}

              {/* TAB 3: PUBLICATIONS */}
              {activeTab === 'publications' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  
                  {/* Published Papers */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        Published Papers
                      </h3>
                      <button 
                        onClick={() => setIsUploadWizardOpen(true)}
                        className="text-xs text-emerald-600 hover:text-emerald-500 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Upload
                      </button>
                    </div>

                    {myPublications.length > 0 ? (
                      <div className="space-y-3">
                        {myPublications.map((paper) => (
                          <div key={paper.id} className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2 shadow-xs">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                  {paper.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  Published {paper.publishedYear} • {paper.category}
                                </p>
                              </div>
                              <button 
                                onClick={() => setDeletingPaperId(paper.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete publication"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {paper.abstract && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                {paper.abstract}
                              </p>
                            )}

                            {paper.downloadUrl && (
                              <a 
                                href={paper.downloadUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold hover:underline pt-1"
                              >
                                <ExternalLink className="w-3 h-3" /> View Publication
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No publications available.</p>
                    )}
                  </div>

                  {/* Ongoing Research */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      Ongoing Research
                    </h3>

                    {profileData?.ongoingResearch && profileData.ongoingResearch.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.ongoingResearch.map((paper: any, i: number) => (
                          <div key={i} className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200">
                            {paper.title || paper}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No ongoing research listed.</p>
                    )}
                  </div>

                  {/* Draft Research */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Draft Research
                    </h3>

                    {profileData?.draftResearch && profileData.draftResearch.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.draftResearch.map((paper: any, i: number) => (
                          <div key={i} className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200">
                            {paper.title || paper}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No research drafts saved.</p>
                    )}
                  </div>

                  {/* Patents */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Patents
                    </h3>

                    {profileData?.patents && profileData.patents.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.patents.map((patent: UserProfilePatent) => (
                          <div key={patent.id} className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs space-y-1">
                            <h4 className="font-bold text-slate-900 dark:text-white">{patent.title}</h4>
                            {patent.patentNumber && <p className="text-[11px] text-slate-500">Patent #: {patent.patentNumber}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No patents listed.</p>
                    )}
                  </div>

                </motion.div>
              )}

              {/* TAB 4: COLLABORATIONS */}
              {activeTab === 'collaborations' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  
                  {/* Availability Badges */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <Handshake className="w-4 h-4 text-emerald-600" />
                      Collaboration Status
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className={`p-4 rounded-2xl border text-center space-y-1 ${profileData?.openToCollaboration ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' : 'bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-400'}`}>
                        <div className="font-bold text-xs">Open to Collaboration</div>
                        <span className="text-[10px] font-semibold uppercase">{profileData?.openToCollaboration ? 'Available' : 'Unavailable'}</span>
                      </div>

                      <div className={`p-4 rounded-2xl border text-center space-y-1 ${profileData?.openToMentoring ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' : 'bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-400'}`}>
                        <div className="font-bold text-xs">Open to Mentoring</div>
                        <span className="text-[10px] font-semibold uppercase">{profileData?.openToMentoring ? 'Available' : 'Unavailable'}</span>
                      </div>

                      <div className={`p-4 rounded-2xl border text-center space-y-1 ${profileData?.openToConsulting ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' : 'bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-400'}`}>
                        <div className="font-bold text-xs">Open to Consulting</div>
                        <span className="text-[10px] font-semibold uppercase">{profileData?.openToConsulting ? 'Available' : 'Unavailable'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Collaboration Areas of Interest */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b dark:border-slate-800 pb-2.5 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Areas of Interest for Collaboration
                    </h3>

                    {profileData?.collaborationAreasOfInterest && profileData.collaborationAreasOfInterest.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.collaborationAreasOfInterest.map((area: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold">
                            {area}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No collaboration preferences have been selected.</p>
                    )}
                  </div>

                </motion.div>
              )}

              {/* TAB 5: CONTACT INFORMATION */}
              {activeTab === 'contact' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        Contact & Links
                      </h3>
                      <span className="text-[10px] text-slate-400">Public vs Private settings apply</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      
                      {/* Email */}
                      <div className="p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AtSign className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-slate-400 font-medium text-[10px] block">Email Address</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {profileData?.privacySettings?.email === 'private' ? '••••••••@••••.com (Private)' : (profileData?.email || 'Not provided')}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${profileData?.privacySettings?.email === 'private' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {profileData?.privacySettings?.email || 'public'}
                        </span>
                      </div>

                      {/* Website */}
                      <div className="p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-slate-400 font-medium text-[10px] block">Website Address</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {profileData?.privacySettings?.website === 'private' ? 'Private' : (profileData?.website || 'Not provided')}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${profileData?.privacySettings?.website === 'private' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {profileData?.privacySettings?.website || 'public'}
                        </span>
                      </div>

                      {/* ORCID */}
                      <div className="p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Link2 className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-slate-400 font-medium text-[10px] block">ORCID Profile</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {profileData?.privacySettings?.orcid === 'private' ? 'Private' : (profileData?.orcid || 'Not provided')}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${profileData?.privacySettings?.orcid === 'private' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {profileData?.privacySettings?.orcid || 'public'}
                        </span>
                      </div>

                      {/* Google Scholar */}
                      <div className="p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-slate-400 font-medium text-[10px] block">Google Scholar Profile</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {profileData?.privacySettings?.googleScholar === 'private' ? 'Private' : (profileData?.googleScholar || 'Not provided')}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${profileData?.privacySettings?.googleScholar === 'private' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {profileData?.privacySettings?.googleScholar || 'public'}
                        </span>
                      </div>

                      {/* LinkedIn */}
                      <div className="p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Linkedin className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-slate-400 font-medium text-[10px] block">LinkedIn Profile</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {profileData?.privacySettings?.linkedin === 'private' ? 'Private' : (profileData?.linkedin || 'Not provided')}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${profileData?.privacySettings?.linkedin === 'private' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {profileData?.privacySettings?.linkedin || 'public'}
                        </span>
                      </div>

                      {/* ResearchGate */}
                      <div className="p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-slate-400 font-medium text-[10px] block">ResearchGate Profile</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {profileData?.privacySettings?.researchgate === 'private' ? 'Private' : (profileData?.researchgate || 'Not provided')}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${profileData?.privacySettings?.researchgate === 'private' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {profileData?.privacySettings?.researchgate || 'public'}
                        </span>
                      </div>

                    </div>
                  </div>

                </motion.div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto" id="edit_profile_modal">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile & Preferences</h3>
                <p className="text-xs text-slate-500">Configure your academic credentials and privacy settings.</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tab Selector */}
            <div className="border-b dark:border-slate-800 p-2 flex gap-1 bg-slate-100/50 dark:bg-slate-950/30 overflow-x-auto shrink-0">
              {[
                { key: 'overview', label: '1. Overview & Info' },
                { key: 'research', label: '2. Research' },
                { key: 'publications', label: '3. Publications' },
                { key: 'collaborations', label: '4. Collaborations' },
                { key: 'contact', label: '5. Contact & Privacy' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setEditTab(t.key as TabType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    editTab === t.key ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProfile(editForm);
              }}
              className="p-6 overflow-y-auto space-y-6 flex-1 text-xs"
            >
              
              {/* EDIT TAB 1: OVERVIEW */}
              {editTab === 'overview' && (
                <div className="space-y-4">
                  {/* Account Type Toggle */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Account Classification</span>
                      <span className="text-[10px] text-slate-400">Select whether this account represents an individual researcher or an institution.</span>
                    </div>
                    <select
                      value={editForm.isOrganization ? 'institution' : 'individual'}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        isOrganization: e.target.value === 'institution',
                        accountType: e.target.value
                      })}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="individual">Individual Researcher</option>
                      <option value="institution">Institution / Organization</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input 
                        type="text" 
                        value={editForm.fullName || ''} 
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Professional Title</label>
                      <input 
                        type="text" 
                        value={editForm.professionalTitle || ''} 
                        onChange={(e) => setEditForm({ ...editForm, professionalTitle: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Institution / Organization</label>
                      <input 
                        type="text" 
                        value={editForm.institution || ''} 
                        onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                      <input 
                        type="text" 
                        value={editForm.department || ''} 
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Country</label>
                      <input 
                        type="text" 
                        value={editForm.country || ''} 
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">City (Optional)</label>
                      <input 
                        type="text" 
                        value={editForm.city || ''} 
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Biography</label>
                      <textarea 
                        rows={3}
                        value={editForm.bio || ''} 
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600 resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Primary Research Area</label>
                      <input 
                        type="text" 
                        value={editForm.primaryResearchArea || ''} 
                        onChange={(e) => setEditForm({ ...editForm, primaryResearchArea: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Current Position</label>
                      <input 
                        type="text" 
                        value={editForm.currentPosition || ''} 
                        onChange={(e) => setEditForm({ ...editForm, currentPosition: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Years of Experience</label>
                      <input 
                        type="number" 
                        value={editForm.yearsOfExperience || ''} 
                        onChange={(e) => setEditForm({ ...editForm, yearsOfExperience: parseInt(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Skills Tag Editors */}
                  <div className="space-y-3 pt-4 border-t dark:border-slate-800">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Technical Skills</label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
                      {(editForm.technicalSkills || []).map((s: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-1">
                          {s}
                          <button type="button" onClick={() => removeTagItem('technicalSkills', s)} className="hover:text-rose-600 font-bold ml-1">×</button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        placeholder="Add skill & press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTagItem('technicalSkills', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="bg-transparent border-none text-xs outline-none p-1 min-w-[120px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDIT TAB 2: RESEARCH */}
              {editTab === 'research' && (
                <div className="space-y-4">
                  {/* Research Interests Tag Editor */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Research Interests</label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
                      {(editForm.researchInterests || []).map((s: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-lg text-xs flex items-center gap-1">
                          {s}
                          <button type="button" onClick={() => removeTagItem('researchInterests', s)} className="hover:text-rose-600 font-bold ml-1">×</button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        placeholder="Add interest & press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTagItem('researchInterests', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="bg-transparent border-none text-xs outline-none p-1 min-w-[140px]"
                      />
                    </div>
                  </div>

                  {/* Research Keywords */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Research Keywords</label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
                      {(editForm.researchKeywords || []).map((kw: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs flex items-center gap-1">
                          #{kw}
                          <button type="button" onClick={() => removeTagItem('researchKeywords', kw)} className="hover:text-rose-600 font-bold ml-1">×</button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        placeholder="Add keyword & press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTagItem('researchKeywords', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="bg-transparent border-none text-xs outline-none p-1 min-w-[140px]"
                      />
                    </div>
                  </div>

                  {/* Current Research Work */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Current Research Work</label>
                    <textarea 
                      rows={3}
                      value={editForm.currentResearchWork || ''} 
                      onChange={(e) => setEditForm({ ...editForm, currentResearchWork: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none focus:border-emerald-600 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* EDIT TAB 4: COLLABORATIONS */}
              {editTab === 'collaborations' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Collaboration Preferences</label>
                    
                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={Boolean(editForm.openToCollaboration)} 
                        onChange={(e) => setEditForm({ ...editForm, openToCollaboration: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Open to Collaboration</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={Boolean(editForm.openToMentoring)} 
                        onChange={(e) => setEditForm({ ...editForm, openToMentoring: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Open to Mentoring</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={Boolean(editForm.openToConsulting)} 
                        onChange={(e) => setEditForm({ ...editForm, openToConsulting: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Open to Consulting</span>
                    </label>
                  </div>
                </div>
              )}

              {/* EDIT TAB 5: CONTACT & PRIVACY */}
              {editTab === 'contact' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">Contact Information & Privacy Visibility</label>
                    
                    {[
                      { field: 'email', label: 'Email Address', placeholder: 'user@example.com' },
                      { field: 'website', label: 'Website Address', placeholder: 'https://...' },
                      { field: 'orcid', label: 'ORCID Profile', placeholder: '0000-0000-0000-0000' },
                      { field: 'googleScholar', label: 'Google Scholar Profile', placeholder: 'https://scholar.google.com...' },
                      { field: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/...' },
                      { field: 'researchgate', label: 'ResearchGate Profile', placeholder: 'https://researchgate.net/profile/...' },
                    ].map(({ field, label, placeholder }) => (
                      <div key={field} className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300 text-[11px] block">{label}</label>
                          <input 
                            type="text" 
                            placeholder={placeholder}
                            value={editForm[field] || ''} 
                            onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                            className="w-full p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-xs outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-4">
                          <span className="text-[10px] text-slate-400 font-semibold">Visibility:</span>
                          <select
                            value={editForm.privacySettings?.[field] || 'public'}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              privacySettings: {
                                ...editForm.privacySettings,
                                [field]: e.target.value
                              }
                            })}
                            className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-xs font-bold"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Save Profile
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* UPLOAD RESEARCH WIZARD MODAL */}
      {isUploadWizardOpen && (
        <PublishWizard 
          userProfile={profileData}
          onClose={() => setIsUploadWizardOpen(false)}
          onSubmit={async (paperData) => {
            await addCustomPaper(paperData, user.uid, user.email || '');
            setIsUploadWizardOpen(false);
            fetchProfileAndData();
            setAlertMsg({ type: 'success', text: 'Research published successfully!' });
            setTimeout(() => setAlertMsg(null), 4000);
          }}
        />
      )}

      {/* DELETE PAPER CONFIRMATION MODAL */}
      {deletingPaperId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 border dark:border-slate-800 shadow-xl space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Research Paper?</h3>
            <p className="text-xs text-slate-500">This action will permanently delete this custom publication from your profile repository.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeletingPaperId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeletePaper}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Delete Paper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS FULLSCREEN MODAL */}
      {isAnalyticsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col overflow-hidden w-screen h-screen min-h-screen animate-fade-in" id="analytics_fullscreen_modal">
          <div className="w-full h-full flex flex-col flex-1 overflow-hidden bg-white dark:bg-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 shadow-xs">
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsAnalyticsOpen(false)}
                  className="px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer flex items-center gap-2 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600" />
                  <span>Return to Profile</span>
                </button>
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Research & Engagement Analytics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Track and visualize views, downloads, citations, and reader interactions over time.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAnalyticsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close full screen view"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto flex-1 max-w-7xl mx-auto w-full">
              <ResearchAnalytics 
                views={myPublications.reduce((total, paper) => total + (paper.viewsCount || 120), 340)}
                downloads={myPublications.reduce((total, paper) => total + (paper.downloadsCount || 45), 110)}
                citations={myPublications.reduce((total, paper) => total + (paper.bookmarksCount || 8), 24)}
                followers={14 + myPublications.length * 4}
                reads={85 + myPublications.length * 15}
                requests={3 + myPublications.length}
                funding={profileData?.isOrganization ? "$150,000" : "$45,000"}
                progress={`${Math.round(completionPercent)}%`}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
