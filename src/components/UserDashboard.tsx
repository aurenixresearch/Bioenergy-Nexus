import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Bookmark, 
  FileText, 
  Users, 
  ArrowLeft, 
  Trash2, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  LayoutDashboard, 
  Calendar, 
  Mail, 
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  Lock,
  Unlock,
  Check,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { ConsultationInquiry, PartnershipSubmission, ResearchPaper } from '../types';
import { RESEARCH_PAPERS } from '../data';
import { 
  getSavedPaperIds, 
  unsavePaper, 
  getCustomPapers, 
  getUserProfile, 
  applyForVerification, 
  approveVerification 
} from '../services/db';
import { motion } from 'motion/react';

interface UserDashboardProps {
  user: FirebaseUser;
  onBackToLanding: () => void;
  activeInquiries: ConsultationInquiry[];
  activePartnerships: PartnershipSubmission[];
  onRefreshAll: () => Promise<void>;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  setSavedPaperIds?: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function UserDashboard({
  user,
  onBackToLanding,
  activeInquiries,
  activePartnerships,
  onRefreshAll,
  onNavigateToProfile,
  onNavigateToSettings,
  setSavedPaperIds
}: UserDashboardProps) {
  const [savedPapers, setSavedPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [myUploadedPapers, setMyUploadedPapers] = useState<ResearchPaper[]>([]);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [showAppForm, setShowAppForm] = useState(false);
  
  // Application form fields
  const [institution, setInstitution] = useState('');
  const [orcid, setOrcid] = useState('');
  const [googleScholar, setGoogleScholar] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const ALL_INTERESTS = [
    'Solar Energy',
    'Wind Energy',
    'Smart Grid',
    'Hydropower',
    'Bioenergy',
    'Energy Storage',
    'Climate Change',
    'Energy Policy'
  ];

  const fetchSavedAndCustom = async () => {
    setLoading(true);
    try {
      // Refresh parent firestore metrics
      await onRefreshAll();
      
      const savedIds = await getSavedPaperIds(user.uid);
      const customP = await getCustomPapers();
      const combined = [...RESEARCH_PAPERS, ...customP];
      
      // Filter combined papers to match saved ids
      const saved = combined.filter(paper => savedIds.includes(paper.id));
      setSavedPapers(saved);

      // Fetch user profile from Firestore/local storage
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      // Filter custom papers by current user
      const uploaded = customP.filter(p => p.userId === user.uid || p.userEmail === user.email);
      setMyUploadedPapers(uploaded);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAndCustom();
  }, [user]);

  // Set default values from profile once loaded
  useEffect(() => {
    if (userProfile) {
      setInstitution(userProfile.institution || '');
      setSelectedInterests(userProfile.researchInterests || []);
    }
  }, [userProfile]);

  const handleRemoveBookmark = async (paperId: string) => {
    try {
      await unsavePaper(user.uid, paperId);
      // Update local state
      setSavedPapers(prev => prev.filter(p => p.id !== paperId));
      if (setSavedPaperIds) {
        setSavedPaperIds(prev => prev.filter(id => id !== paperId));
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const handleDownload = (title: string) => {
    console.log(`Downloading study: "${title}"... (Simulated)`);
  };

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!institution.trim() || !bio.trim()) {
      setErrorMessage('Please fill out all required fields (Institution and Statement of Research).');
      return;
    }

    setIsSubmittingApp(true);
    try {
      const details = {
        institution,
        orcid: orcid.trim(),
        googleScholar: googleScholar.trim(),
        bio,
        researchInterests: selectedInterests.length > 0 ? selectedInterests : ['Bioenergy'],
      };
      await applyForVerification(user.uid, myUploadedPapers.length, details);
      setSuccessMessage('Your application for Scholar Verification has been submitted successfully.');
      setShowAppForm(false);
      await fetchSavedAndCustom();
    } catch (err) {
      console.error('Error applying for verification:', err);
      setErrorMessage('An error occurred while submitting your application.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleSimulateApproval = async () => {
    if (!userProfile) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmittingApp(true);

    try {
      await approveVerification(user.uid, userProfile);
      setSuccessMessage('Congratulations! Your Scholar Verification Application has been approved. Your verified badge is now active.');
      await fetchSavedAndCustom();
    } catch (err) {
      console.error('Error simulating approval:', err);
      setErrorMessage('An error occurred during approval simulation.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10" id="user_dashboard">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8 font-bold">
        
        {/* Navigation Bar Refresh button */}
        <div className="flex items-center justify-end">
          <motion.button
            onClick={fetchSavedAndCustom}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl shadow-xs transition-colors cursor-pointer border border-slate-200/60 text-xs font-semibold"
            id="refresh_dashboard_btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Reloading...' : 'Reload Dashboard'}</span>
          </motion.button>
        </div>

        {/* Dashboard Profile Hero */}
        <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden text-center sm:text-left shadow-lg">
          {/* Background overlay */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-800/20 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User avatar'} 
                className="w-20 h-20 rounded-full object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 bg-emerald-800 rounded-full flex items-center justify-center text-emerald-300 text-3xl font-bold shadow-lg">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-850 rounded-md text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Active Aurenix Member
                </span>
                {userProfile?.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                    <Award className="w-3 h-3" />
                    Verified Researcher
                  </span>
                )}
                {userProfile?.verificationStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 rounded-md text-[10px] font-bold uppercase tracking-wider text-white">
                    <Clock className="w-3 h-3 animate-pulse" />
                    Pending Verification
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight flex items-center gap-2">
                Welcome back, {userProfile?.fullName || user.displayName || 'Researcher'}
                {userProfile?.verificationStatus === 'verified' && (
                  <CheckCircle2 className="w-6 h-6 text-blue-400 fill-blue-950 stroke-[2.5]" title="Verified Scholar Badge" />
                )}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-emerald-200/90 font-sans mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {userProfile?.email || user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'July 2026'}
                </span>
              </div>

              {/* High-fidelity Profile & Settings quick links */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4">
                {onNavigateToProfile && (
                  <button
                    onClick={onNavigateToProfile}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-2 backdrop-blur-md cursor-pointer transition-all"
                  >
                    View Public Portfolio
                  </button>
                )}
                {onNavigateToSettings && (
                  <button
                    onClick={onNavigateToSettings}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/10 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    Configure Preferences
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 shrink-0 relative z-10 font-mono text-xs text-emerald-300">
            <div className="px-4 py-3 bg-white/5 rounded-xl text-center min-w-[70px]">
              <span className="block text-2xl font-bold text-white">{savedPapers.length}</span>
              <span>Saved Papers</span>
            </div>
            <div className="px-4 py-3 bg-white/5 rounded-xl text-center min-w-[70px]">
              <span className="block text-2xl font-bold text-white">{activeInquiries.length}</span>
              <span>Inquiries</span>
            </div>
            <div className="px-4 py-3 bg-white/5 rounded-xl text-center min-w-[70px] border border-white/5 bg-emerald-900/10">
              <span className="block text-2xl font-bold text-white">{myUploadedPapers.length}</span>
              <span>Uploaded Papers</span>
            </div>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Saved papers library - Left */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-display font-extrabold text-slate-900">
                    Your Bookmarked Studies ({savedPapers.length})
                  </h3>
                </div>
              </div>

              {savedPapers.length > 0 ? (
                <div className="space-y-4" id="dashboard_saved_papers">
                  {savedPapers.map((paper) => (
                    <motion.div 
                      key={paper.id} 
                      whileHover={{ y: -3 }}
                      className="p-5 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">{paper.category}</span>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">{paper.title}</h4>
                        <p className="text-xs text-slate-500">Author: {paper.author} • {paper.publishedYear}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <motion.button
                          onClick={() => handleDownload(paper.title)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-600 transition-colors cursor-pointer border-0 shadow-sm"
                          title="Download Study"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleRemoveBookmark(paper.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition-colors cursor-pointer border-0 shadow-sm"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Bookmark className="w-10 h-10 text-slate-300" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">No bookmarked studies</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Navigate back to the Aurenix Research Repository on the main page to find and bookmark studies.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Scholar Verification & Badge Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md space-y-6" id="scholar_verification_section">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-display font-extrabold text-slate-900">
                    Scholar Verification & Badge
                  </h3>
                </div>
              </div>

              {/* Status and Notifications */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between gap-2">
                  <span>{errorMessage}</span>
                  <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between gap-2">
                  <span>{successMessage}</span>
                  <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 1. Verified Scholar State */}
              {userProfile?.verificationStatus === 'verified' && (
                <div className="space-y-6 text-left">
                  <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-200 p-5 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-blue-500 text-white rounded-xl shadow-md shrink-0">
                      <Award className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        Your Profile is Verified
                        <Check className="w-4 h-4 text-emerald-600 font-extrabold" />
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Congratulations! Your academic background and research outputs have been verified by the Aurenix Research board. The certified researcher badge is active on your publications and profile.
                      </p>
                    </div>
                  </div>

                  {/* Credentials details list */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Verified Scholar Credentials</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-600">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Institutional Affiliation</span>
                        <span className="font-semibold text-slate-800">{userProfile.verificationDetails?.institution || userProfile.institution || 'Aurenix Research Network'}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">ORCID Identifier</span>
                        <span className="font-semibold text-slate-800">{userProfile.verificationDetails?.orcid || 'Not provided'}</span>
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase font-bold">Google Scholar Profile</span>
                        {userProfile.verificationDetails?.googleScholar ? (
                          <a href={userProfile.verificationDetails.googleScholar} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                            {userProfile.verificationDetails.googleScholar}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500 font-medium">Not provided</span>
                        )}
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase font-bold font-bold">Research Statement / Focus Area</span>
                        <p className="italic text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                          "{userProfile.verificationDetails?.bio || 'Verified scientific author and contributor.'}"
                        </p>
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase font-bold font-bold">Verified Expertise Topics</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(userProfile.verificationDetails?.researchInterests || userProfile.researchInterests || ['Bioenergy']).map((interest: string) => (
                            <span key={interest} className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200/50 rounded-full text-[10px] font-medium">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Pending Verification State */}
              {userProfile?.verificationStatus === 'pending' && (
                <div className="space-y-6 text-left">
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0">
                      <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900">Application Under Active Audit</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Thank you for applying. Your background profile and custom contributions are currently being audited against our peer-review quality standards. Verification checks typically complete within 2-3 business days.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                    <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Submitted Credentials Preview</span>
                    <ul className="text-xs space-y-1 font-sans text-slate-600">
                      <li><strong>Institution:</strong> {userProfile.verificationDetails?.institution}</li>
                      <li><strong>ORCID iD:</strong> {userProfile.verificationDetails?.orcid || 'N/A'}</li>
                      <li><strong>Scholar Profile:</strong> {userProfile.verificationDetails?.googleScholar || 'N/A'}</li>
                    </ul>
                  </div>

                  {/* Sandbox Admin Approval Panel */}
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Sandbox Developer Admin Tool
                    </h5>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      You are in sandbox/preview mode. You can instantly bypass the review delay and approve this application to see the "Verified" badge live!
                    </p>
                    <motion.button
                      onClick={handleSimulateApproval}
                      disabled={isSubmittingApp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-0 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isSubmittingApp ? 'Approving...' : 'Approve Application Now'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* 3. Not Applied Yet State */}
              {(!userProfile?.verificationStatus || userProfile?.verificationStatus === 'none') && (
                <div className="space-y-6 text-left">
                  {/* Explanation card */}
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Award className="w-4.5 h-4.5 text-emerald-600" />
                        Scholar Verification
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Establish academic trust in the Aurenix Research network. Verified scholars earn a distinct verification checkmark badge, highlight their researcher profile, and gain authorized indexing across African circular economy channels.
                      </p>
                    </div>
                  </div>

                  {/* Requirements Progress checklist */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Requirements Check</h5>
                    
                    {/* Requirement 1: 3 custom uploads */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${myUploadedPapers.length >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {myUploadedPapers.length >= 3 ? (
                            <Check className="w-4 h-4 font-extrabold" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold text-slate-800">Upload 3 or More Research Studies</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Contribute academic journals, feasibility reports, or regulatory briefs to the repo.
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700 shrink-0">
                        {myUploadedPapers.length}/3 Uploaded
                      </span>
                    </div>

                    {/* Requirement 2: Submit Details */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-slate-100 text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold text-slate-800">Provide Scholar Association Details</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Specify academic institution, professional bio, areas of expertise, and ORCID iD.
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-400 shrink-0">
                        {myUploadedPapers.length >= 3 ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>

                  {/* Locked vs. Unlocked Action Buttons */}
                  {myUploadedPapers.length < 3 ? (
                    <div className="space-y-4">
                      {/* Progress visual bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Verification Progress</span>
                          <span>{Math.round((myUploadedPapers.length / 3) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-500" 
                            style={{ width: `${Math.min((myUploadedPapers.length / 3) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                        <p>
                          Please upload at least <strong>{3 - myUploadedPapers.length} more study</strong> to fulfill the publishing criteria. Use the "Aurenix Repository" page to contribute a new document.
                        </p>
                      </div>

                      <motion.button
                        onClick={onBackToLanding}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/60 shadow-xs text-left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Return to Research Hub to Upload
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 bg-emerald-50/50 border border-emerald-200/50 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p>
                          <strong>Minimum publishing requirements met!</strong> You have contributed {myUploadedPapers.length} research studies. You can now complete the application below to receive your verified checkmark badge.
                        </p>
                      </div>

                      {!showAppForm ? (
                        <motion.button
                          onClick={() => setShowAppForm(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border-0"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Apply for Scholar Verification Badge
                        </motion.button>
                      ) : (
                        <motion.form 
                          onSubmit={handleApplyVerification}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-slate-50/80 p-5 sm:p-6 border border-slate-200/60 rounded-2xl space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Unlock className="w-4 h-4 text-emerald-600" />
                              Scholar Verification Application
                            </span>
                            <button 
                              type="button" 
                              onClick={() => setShowAppForm(false)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3.5 text-xs text-slate-700 font-sans">
                            {/* Institution */}
                            <div className="space-y-1 text-left">
                              <label className="block font-bold text-slate-700">Academic / Institutional Affiliation *</label>
                              <input 
                                type="text"
                                placeholder="e.g. University of Ibadan, Nigeria"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-medium"
                                required
                              />
                            </div>

                            {/* ORCID iD */}
                            <div className="space-y-1 text-left">
                              <label className="block font-bold text-slate-700">ORCID iD (Optional)</label>
                              <input 
                                type="text"
                                placeholder="e.g. 0000-0002-1825-0097"
                                value={orcid}
                                onChange={(e) => setOrcid(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-mono"
                              />
                              <p className="text-[10px] text-slate-400">Enables automatic syncing of research citations globally.</p>
                            </div>

                            {/* Google Scholar URL */}
                            <div className="space-y-1 text-left">
                              <label className="block font-bold text-slate-700">Google Scholar Profile URL (Optional)</label>
                              <input 
                                type="url"
                                placeholder="https://scholar.google.com/citations?user=..."
                                value={googleScholar}
                                onChange={(e) => setGoogleScholar(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-medium"
                              />
                            </div>

                            {/* Bio / Research Statement */}
                            <div className="space-y-1 text-left">
                              <label className="block font-bold text-slate-700">Research Focus & Bio Statement *</label>
                              <textarea 
                                placeholder="Describe your primary focus area, expert topics, and research objectives. This will be displayed on your certified profile."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-medium leading-relaxed resize-none"
                                required
                              />
                            </div>

                            {/* Interests Checklist */}
                            <div className="space-y-1.5 text-left">
                              <label className="block font-bold text-slate-700 font-bold">Expertise Topics (Select multiple)</label>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {ALL_INTERESTS.map((interest) => {
                                  const isSelected = selectedInterests.includes(interest);
                                  return (
                                    <button
                                      key={interest}
                                      type="button"
                                      onClick={() => handleToggleInterest(interest)}
                                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                        isSelected 
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      {interest}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <motion.button
                              type="submit"
                              disabled={isSubmittingApp}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border-0"
                            >
                              {isSubmittingApp ? 'Submitting...' : 'Submit Credentials'}
                            </motion.button>
                            <button
                              type="button"
                              onClick={() => setShowAppForm(false)}
                              className="px-4 py-2.5 bg-slate-250 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border-0"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submitted inquiries and alliances - Right */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            {/* Consultation tracker widget */}
            <div className="bg-white p-6 rounded-3xl shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Consulting Reviews ({activeInquiries.length})</h4>
                </div>
              </div>

              {activeInquiries.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {activeInquiries.map((inq) => (
                    <motion.div 
                      key={inq.id} 
                      whileHover={{ x: 2 }}
                      className="p-4 bg-slate-50 rounded-xl space-y-2 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase max-w-[130px] truncate">{inq.organization}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          inq.status === 'Pending' 
                            ? 'bg-amber-100 text-amber-800' 
                            : inq.status === 'In Review' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inq.status}
                        </span>
                      </div>
                      <span className="block text-xs font-semibold text-slate-700">{inq.serviceType}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{inq.message}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No advisory inquiries submitted yet.</p>
              )}
            </div>

            {/* Partnerships tracker widget */}
            <div className="bg-white p-6 rounded-3xl shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Alliance Status ({activePartnerships.length})</h4>
                </div>
              </div>

              {activePartnerships.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {activePartnerships.map((sub) => (
                    <motion.div 
                      key={sub.id} 
                      whileHover={{ x: 2 }}
                      className="p-4 bg-slate-50 rounded-xl space-y-2 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-900 truncate max-w-[130px]">{sub.partnerName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-50 text-emerald-800">
                          Registered
                        </span>
                      </div>
                      <span className="block text-xs font-semibold text-emerald-700">{sub.stakeholderType}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{sub.message}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No active alliance applications.</p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
