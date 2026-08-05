import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
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
  X,
  Pencil,
  User,
  MessageSquare,
  UploadCloud,
  Settings,
  Camera,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import { ConsultationInquiry, PartnershipSubmission, ResearchPaper } from '../types';
import { RESEARCH_PAPERS } from '../data';
import { 
  getSavedPaperIds, 
  unsavePaper, 
  getCustomPapers, 
  getUserProfile, 
  createUserProfile,
  applyForVerification, 
  approveVerification,
  updatePartnership,
  getInnovationProjects,
  addInnovationProject,
  updateInnovationProject,
  deleteInnovationProject,
  getUserDeadlines,
  addDeadline,
  deleteDeadline,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  addNotification,
  InnovationProject,
  UserDeadline,
  UserNotification,
  isDemoModeActive
} from '../services/db';
import { motion } from 'motion/react';

// Modular Sub-components
import InnovationProjects from './dashboard/InnovationProjects';
import AIRecommendations from './dashboard/AIRecommendations';
import ActivityTimeline from './dashboard/ActivityTimeline';
import UpcomingDeadlines from './dashboard/UpcomingDeadlines';

interface UtilityPageProps {
  user: FirebaseUser;
  onBackToLanding: () => void;
  activeInquiries: ConsultationInquiry[];
  activePartnerships: PartnershipSubmission[];
  onRefreshAll: () => Promise<void>;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToView?: (view: any) => void;
  setSavedPaperIds?: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function UtilityPage({
  user,
  onBackToLanding,
  activeInquiries,
  activePartnerships,
  onRefreshAll,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToView,
  setSavedPaperIds
}: UtilityPageProps) {
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

  // Alliance Application Editing states
  const [editingPartnership, setEditingPartnership] = useState<PartnershipSubmission | null>(null);
  const [isUpdatingPartnership, setIsUpdatingPartnership] = useState(false);
  const [editPartnerName, setEditPartnerName] = useState('');
  const [editStakeholderType, setEditStakeholderType] = useState<PartnershipSubmission['stakeholderType']>('University & Research Institute');
  const [editCollaborationArea, setEditCollaborationArea] = useState('');
  const [editMessage, setEditMessage] = useState('');

  // Interactive Live Dashboard States
  const [projects, setProjects] = useState<InnovationProject[]>([]);
  const [deadlines, setDeadlines] = useState<UserDeadline[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  // Additional live-sync states
  const [allResearchers, setAllResearchers] = useState<any[]>([]);
  const [allCustomPapers, setAllCustomPapers] = useState<ResearchPaper[]>([]);
  const [localInquiries, setLocalInquiries] = useState<ConsultationInquiry[]>(activeInquiries);
  const [localPartnerships, setLocalPartnerships] = useState<PartnershipSubmission[]>(activePartnerships);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const handleStartEditPartnership = (sub: PartnershipSubmission) => {
    setEditingPartnership(sub);
    setEditPartnerName(sub.partnerName || '');
    setEditStakeholderType(sub.stakeholderType || 'University & Research Institute');
    setEditCollaborationArea(sub.collaborationArea || '');
    setEditMessage(sub.message || '');
  };

  const handleUpdatePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartnership) return;

    if (!editPartnerName.trim() || !editCollaborationArea.trim() || !editMessage.trim()) {
      setErrorMessage('Please fill in all alliance application fields.');
      return;
    }

    setIsUpdatingPartnership(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await updatePartnership(editingPartnership.id, user.uid, {
        partnerName: editPartnerName,
        stakeholderType: editStakeholderType,
        collaborationArea: editCollaborationArea,
        message: editMessage
      });
      await onRefreshAll();
      setSuccessMessage('Alliance application updated successfully!');
      setEditingPartnership(null);
    } catch (err) {
      console.error('Error updating alliance application:', err);
      setErrorMessage('Failed to update alliance application. Please try again.');
    } finally {
      setIsUpdatingPartnership(false);
    }
  };

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

  // Keep savedPapers dynamically calculated whenever savedIds or allCustomPapers update
  useEffect(() => {
    const combined = [...RESEARCH_PAPERS, ...allCustomPapers];
    const saved = combined.filter(paper => savedIds.includes(paper.id));
    setSavedPapers(saved);
  }, [savedIds, allCustomPapers]);

  // Keep local inquiries & partnerships in sync with parent props when first loaded
  useEffect(() => {
    if (activeInquiries && activeInquiries.length > 0) {
      setLocalInquiries(activeInquiries);
    }
  }, [activeInquiries]);

  useEffect(() => {
    if (activePartnerships && activePartnerships.length > 0) {
      setLocalPartnerships(activePartnerships);
    }
  }, [activePartnerships]);

  const fetchSavedAndCustom = async () => {
    setLoading(true);
    try {
      await onRefreshAll();
      const sIds = await getSavedPaperIds(user.uid);
      setSavedIds(sIds);
      
      const customP = await getCustomPapers();
      setAllCustomPapers(customP);

      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      const uploaded = customP.filter(p => p.userId === user.uid || p.userEmail === user.email);
      setMyUploadedPapers(uploaded);

      const projs = await getInnovationProjects(user.uid);
      setProjects(projs);

      const dls = await getUserDeadlines(user.uid);
      setDeadlines(dls);

      const notifs = await getUserNotifications(user.uid);
      setNotifications(notifs);
    } catch (err) {
      console.error('Error manual refreshing dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time Firestore onSnapshot subscribers
  useEffect(() => {
    if (!user) return;

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.userId === user.uid) {
        setUserProfile(customEvent.detail.profile);
      }
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate as EventListener);

    if (isDemoModeActive(user.uid)) {
      // Offline / sandbox fallback polling to simulate real-time updates safely
      const interval = setInterval(async () => {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);

          const sIds = await getSavedPaperIds(user.uid);
          setSavedIds(sIds);

          const customP = await getCustomPapers();
          setAllCustomPapers(customP);

          const projs = await getInnovationProjects(user.uid);
          setProjects(projs);

          const dls = await getUserDeadlines(user.uid);
          setDeadlines(dls);

          const notifs = await getUserNotifications(user.uid);
          setNotifications(notifs);
        } catch (err) {
          console.warn('Sandbox live sync warning:', err);
        }
      }, 4000);

      fetchSavedAndCustom();
      return () => {
        clearInterval(interval);
        window.removeEventListener('user-profile-updated', handleProfileUpdate as EventListener);
      };
    }

    setLoading(true);

    // 1. User Profile Snapshot
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        getUserProfile(user.uid).then(p => setUserProfile(p));
      }
      setLoading(false);
    }, (err) => {
      console.warn('Profile listener error, fetching:', err);
      getUserProfile(user.uid).then(p => {
        setUserProfile(p);
        setLoading(false);
      });
    });

    // 2. Custom papers snapshot
    const unsubCustomPapers = onSnapshot(collection(db, 'custom_papers'), (snapshot) => {
      const papers: ResearchPaper[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        papers.push({
          id: docSnap.id,
          isCustom: true,
          ...data
        } as ResearchPaper);
      });
      setAllCustomPapers(papers);
      setMyUploadedPapers(papers.filter(p => p.userId === user.uid || p.userEmail === user.email));
    }, (err) => {
      console.warn('Custom papers snapshot error:', err);
    });

    // 3. Saved papers snapshot
    const qSaved = query(collection(db, 'saved_papers'), where('userId', '==', user.uid));
    const unsubSaved = onSnapshot(qSaved, (snapshot) => {
      const sIds: string[] = [];
      snapshot.forEach((docSnap) => {
        sIds.push(docSnap.data().paperId);
      });
      setSavedIds(sIds);
      if (setSavedPaperIds) {
        setSavedPaperIds(sIds);
      }
    }, (err) => {
      console.warn('Saved papers snapshot error:', err);
    });

    // 4. Projects snapshot
    const qProjs = query(collection(db, 'innovation_projects'), where('userId', '==', user.uid));
    const unsubProjs = onSnapshot(qProjs, (snapshot) => {
      const projs: InnovationProject[] = [];
      snapshot.forEach((docSnap) => {
        projs.push({ id: docSnap.id, ...docSnap.data() } as InnovationProject);
      });
      setProjects(projs);
    }, (err) => {
      console.warn('Projects snapshot error:', err);
    });

    // 5. Deadlines snapshot
    const qDeadlines = query(collection(db, 'user_deadlines'), where('userId', '==', user.uid));
    const unsubDeadlines = onSnapshot(qDeadlines, (snapshot) => {
      const dls: UserDeadline[] = [];
      snapshot.forEach((docSnap) => {
        dls.push({ id: docSnap.id, ...docSnap.data() } as UserDeadline);
      });
      dls.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDeadlines(dls);
    }, (err) => {
      console.warn('Deadlines snapshot error:', err);
    });

    // 6. Notifications snapshot
    const qNotifs = query(collection(db, 'user_notifications'), where('userId', '==', user.uid));
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      const notifs: UserNotification[] = [];
      snapshot.forEach((docSnap) => {
        notifs.push({ id: docSnap.id, ...docSnap.data() } as UserNotification);
      });
      setNotifications(notifs);
    }, (err) => {
      console.warn('Notifications snapshot error:', err);
    });

    // 7. Consultation inquiries snapshot
    const qInq = query(collection(db, 'consultation_inquiries'), where('userId', '==', user.uid));
    const unsubInq = onSnapshot(qInq, (snapshot) => {
      const list: ConsultationInquiry[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ConsultationInquiry);
      });
      setLocalInquiries(list);
    }, (err) => {
      console.warn('Inquiries snapshot error:', err);
    });

    // 8. Partnership submissions snapshot
    const qPart = query(collection(db, 'partnership_submissions'), where('userId', '==', user.uid));
    const unsubPart = onSnapshot(qPart, (snapshot) => {
      const list: PartnershipSubmission[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as PartnershipSubmission);
      });
      setLocalPartnerships(list);
    }, (err) => {
      console.warn('Partnerships snapshot error:', err);
    });

    // 9. All researchers snapshot
    const unsubResearchers = onSnapshot(collection(db, 'researchers'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAllResearchers(list);
    }, (err) => {
      console.warn('Researchers snapshot error:', err);
    });

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate as EventListener);
      unsubProfile();
      unsubCustomPapers();
      unsubSaved();
      unsubProjs();
      unsubDeadlines();
      unsubNotifs();
      unsubInq();
      unsubPart();
      unsubResearchers();
    };
  }, [user]);

  // Set default values from profile once loaded
  useEffect(() => {
    if (userProfile) {
      setInstitution(userProfile.institution || '');
      setSelectedInterests(userProfile.researchInterests || []);
    }
  }, [userProfile]);

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

  // Interactive callbacks for Innovation Projects
  const handleCreateProject = async (proj: Omit<InnovationProject, 'id' | 'userId' | 'lastUpdated'>) => {
    try {
      const newId = await addInnovationProject(user.uid, proj);
      await addNotification(user.uid, {
        type: 'workspace',
        title: 'New Innovation Pipeline Launched',
        message: `Project "${proj.title}" has been registered inside your Aurenix product sandbox.`
      });
      await fetchSavedAndCustom();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleUpdateProject = async (id: string, fields: Partial<InnovationProject>) => {
    try {
      await updateInnovationProject(user.uid, id, fields);
      await fetchSavedAndCustom();
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteInnovationProject(user.uid, id);
      await fetchSavedAndCustom();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  // Interactive callbacks for Deadlines
  const handleAddDeadline = async (dl: Omit<UserDeadline, 'id' | 'userId' | 'status'>) => {
    try {
      await addDeadline(user.uid, dl);
      await fetchSavedAndCustom();
    } catch (err) {
      console.error('Error adding deadline:', err);
    }
  };

  const handleDeleteDeadline = async (id: string) => {
    try {
      await deleteDeadline(user.uid, id);
      await fetchSavedAndCustom();
    } catch (err) {
      console.error('Error deleting deadline:', err);
    }
  };

  // AI Recommendation Callbacks
  const handleApplyRecommendation = async (rec: any) => {
    try {
      await addNotification(user.uid, {
        type: rec.category === 'Funding' ? 'grant' : 'alliance',
        title: `Applied for: ${rec.title}`,
        message: `Your credentials have been successfully transmitted to ${rec.source}.`
      });
      await fetchSavedAndCustom();
      alert(`Success! Your application profile has been submitted directly to ${rec.source}.`);
    } catch (err) {
      console.error('Error applying recommendation:', err);
    }
  };

  const handleSaveRecommendation = async (rec: any) => {
    alert(`Bookmarked matching target: "${rec.title}" to saved recommendations list.`);
  };

  const safeOnNavigate = (viewName: any) => {
    if (onNavigateToView) {
      onNavigateToView(viewName);
    }
  };

  // Build live activities list chronologically
  const liveActivities: any[] = [];

  myUploadedPapers.forEach((paper, i) => {
    liveActivities.push({
      id: `act_paper_${paper.id || i}`,
      type: 'publish',
      title: 'Published New Feasibility Brief',
      description: `You uploaded a custom study: "${paper.title}".`,
      time: 'Recently',
      detail: `This study, titled "${paper.title}", outlines circular economy developments in ${paper.country || 'the region'}. It is registered under authors: ${paper.authors || user.displayName || 'Me'}.`
    });
  });

  projects.forEach((p, i) => {
    liveActivities.push({
      id: `act_project_${p.id || i}`,
      type: 'workspace',
      title: 'Innovation Pipeline Launched',
      description: `Project "${p.title}" was successfully registered.`,
      time: 'Recently',
      detail: `This project is focused on "${p.focusArea}" (TRL: ${p.trlLevel || 'N/A'}). Budget: ${p.budget || 'N/A'}, current status: "${p.status}".`
    });
  });

  localPartnerships.forEach((sub, i) => {
    liveActivities.push({
      id: `act_part_${sub.id || i}`,
      type: 'alliance',
      title: 'Applied for Alliance',
      description: `Submitted an affiliation application to "${sub.partnerName}".`,
      time: 'Recently',
      detail: `Proposed collaboration in the area of "${sub.collaborationArea || 'General'}". Message submitted: "${sub.message}".`
    });
  });

  localInquiries.forEach((inq, i) => {
    liveActivities.push({
      id: `act_inq_${inq.id || i}`,
      type: 'consulting',
      title: 'Consulting Advisory Submitted',
      description: `Submitted consultation request for organization "${inq.organization}".`,
      time: 'Recently',
      detail: `Requested advisory service type "${inq.serviceType}". Message detail: "${inq.message}". Status is currently: ${inq.status}.`
    });
  });

  if (editingPartnership) {
    return (
      <div className="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-left" id="edit_partnership_full_workspace" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-150 shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">Alliance Portal</span>
              <h3 className="text-base font-extrabold text-slate-900 font-display">Edit Alliance Application</h3>
            </div>
            <button 
              onClick={() => setEditingPartnership(null)}
              className="p-1.5 hover:bg-slate-200/60 text-slate-400 rounded-full transition-colors cursor-pointer bg-transparent border-0"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <form onSubmit={handleUpdatePartnershipSubmit} className="space-y-4 text-xs font-sans">
            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-700 block">Partner / Organization Name</label>
              <input
                type="text"
                value={editPartnerName}
                onChange={(e) => setEditPartnerName(e.target.value)}
                placeholder="e.g. University of Lagos, Clean Energy Corp"
                className="w-full px-3.5 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden font-medium"
                required
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-700 block">Stakeholder Group</label>
              <select
                value={editStakeholderType}
                onChange={(e) => setEditStakeholderType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden font-medium"
                required
              >
                <option value="University & Research Institute">University & Research Institute</option>
                <option value="Energy Companies & Industry">Energy Companies & Industry</option>
                <option value="Funding & Government Bodies">Funding & Government Bodies</option>
                <option value="NGO & Civil Society">NGO & Civil Society</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-700 block">Collaboration Area</label>
              <input
                type="text"
                value={editCollaborationArea}
                onChange={(e) => setEditCollaborationArea(e.target.value)}
                placeholder="e.g. Solar Energy Storage, Bio-waste Conversion"
                className="w-full px-3.5 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden font-medium"
                required
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="font-bold text-slate-700 block">Application Details / Message</label>
              <textarea
                rows={4}
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                placeholder="State the focus of your proposed collaboration, goals, and key objectives..."
                className="w-full px-3.5 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl focus:border-emerald-600 outline-hidden transition resize-none font-medium leading-relaxed"
                required
              />
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPartnership(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition text-center border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingPartnership}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition flex items-center justify-center gap-1.5 border-0"
              >
                {isUpdatingPartnership ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-left" id="utility_page_root" style={{ backgroundColor: '#ffffff' }}>
      <div className="w-full max-w-7xl mx-auto space-y-8 font-bold">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Wrench className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
                Utility Console
              </h1>
              <p className="text-xs text-slate-500 font-sans font-medium mt-1">
                Establish scholar verification, coordinate innovation pipelines, track active milestones, and explore intelligent recommendations.
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={fetchSavedAndCustom}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer border border-emerald-100/90 text-xs font-semibold"
            style={{ backgroundColor: '#ffffff' }}
            id="refresh_utility_btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Reloading...' : 'Reload Console'}</span>
          </motion.button>
        </div>

        {/* Dynamic States message bars */}
        {(errorMessage || successMessage) && (
          <div className="space-y-3 font-sans">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between gap-2">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between gap-2">
                <span>{successMessage}</span>
                <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700 bg-transparent border-0 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* MAIN MODULES GRID (Moved from Dashboard) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: PRIMARY MODULES (8/12 widths) */}
          <div className="lg:col-span-8 space-y-8" id="utility_left_column">
            
            {/* 1. Innovation Projects */}
            <InnovationProjects
              projects={projects}
              onCreateProject={handleCreateProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />

            {/* 2. Scholar Verification & Badge Card */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-5 sm:space-y-6 text-left relative overflow-hidden" id="scholar_verification_section">
              <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-display font-black text-slate-900 tracking-tight">
                    Scholar Verification & Badge
                  </h3>
                </div>
              </div>

              {/* 1. Verified Scholar State */}
              {userProfile?.verificationStatus === 'verified' && (
                <div className="space-y-6 text-left font-sans">
                  <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-emerald-600 text-white rounded-xl shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        Your Profile is Verified
                        <Check className="w-4 h-4 text-emerald-600 font-extrabold" />
                      </h4>
                      <p className="text-xs text-emerald-900/85 leading-relaxed font-medium">
                        Congratulations! Your academic background and research outputs have been verified by the Aurenix Research board. The certified researcher badge is active on your publications and profile.
                      </p>
                    </div>
                  </div>

                  {/* Credentials details list */}
                  <div className="p-5 bg-white border border-emerald-100/60 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Verified Scholar Credentials</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-600">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-mono font-bold text-emerald-600 uppercase">Institutional Affiliation</span>
                        <span className="font-semibold text-emerald-950">{userProfile.verificationDetails?.institution || userProfile.institution || 'Aurenix Research Network'}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[10px] font-mono font-bold text-emerald-600 uppercase">ORCID Identifier</span>
                        <span className="font-semibold text-emerald-950">{userProfile.verificationDetails?.orcid || 'Not provided'}</span>
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <span className="block text-[10px] font-mono font-bold text-emerald-600 uppercase font-bold">Google Scholar Profile</span>
                        {userProfile.verificationDetails?.googleScholar ? (
                          <a href={userProfile.verificationDetails.googleScholar} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold">
                            {userProfile.verificationDetails.googleScholar}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-550 font-medium">Not provided</span>
                        )}
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <span className="block text-[10px] font-mono font-bold text-emerald-600 uppercase font-bold">Research Statement / Focus Area</span>
                        <p className="italic text-emerald-900/80 bg-white p-3 rounded-xl border border-emerald-150 font-medium shadow-xs">
                          "{userProfile.verificationDetails?.bio || 'Verified scientific author and contributor.'}"
                        </p>
                      </div>
                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <span className="block text-[10px] font-mono font-bold text-emerald-600 uppercase font-bold">Verified Expertise Topics</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(userProfile.verificationDetails?.researchInterests || userProfile.researchInterests || ['Bioenergy']).map((interest: string) => (
                            <span key={interest} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-full text-[10px] font-semibold">
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
                <div className="space-y-6 text-left font-sans">
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900">Application Under Active Audit</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Thank you for applying. Your background profile and custom contributions are currently being audited against our peer-review quality standards. Verification checks typically complete within 2-3 business days.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/10 border border-emerald-100/60 rounded-xl space-y-3">
                    <span className="block text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">Submitted Credentials Preview</span>
                    <ul className="text-xs space-y-1 font-sans text-slate-600">
                      <li><strong>Institution:</strong> {userProfile.verificationDetails?.institution}</li>
                      <li><strong>ORCID iD:</strong> {userProfile.verificationDetails?.orcid || 'N/A'}</li>
                      <li><strong>Scholar Profile:</strong> {userProfile.verificationDetails?.googleScholar || 'N/A'}</li>
                    </ul>
                  </div>

                  {/* Sandbox Admin Approval Panel */}
                  <div className="p-5 bg-white border border-emerald-250 rounded-2xl space-y-3 text-left">
                    <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 font-sans">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Sandbox Developer Admin Tool
                    </h5>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      You are in sandbox/preview mode. You can instantly bypass the review delay and approve this application to see the "Verified" badge live!
                    </p>
                    <button
                      onClick={handleSimulateApproval}
                      disabled={isSubmittingApp}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isSubmittingApp ? 'Approving...' : 'Approve Application Now'}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Not Applied Yet State */}
              {(!userProfile?.verificationStatus || userProfile?.verificationStatus === 'none') && (
                <div className="space-y-6 text-left">
                  <div className="bg-white border border-emerald-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl font-sans">
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        <Award className="w-4.5 h-4.5 text-emerald-600" />
                        Scholar Verification
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Establish academic trust in the Aurenix Research network. Verified scholars earn a distinct verification checkmark badge, highlight their researcher profile, and gain authorized indexing across African circular economy channels.
                      </p>
                    </div>
                  </div>

                  {/* Requirements Progress checklist */}
                  <div className="space-y-3 font-sans">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Application Requirements Check</h5>
                    
                    {/* Requirement 1: 3 custom uploads */}
                    <div className="p-4 bg-white border border-emerald-100 rounded-xl flex items-center justify-between gap-4">
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
                          <span className="block text-[10px] text-slate-500 font-normal">
                            Contribute academic journals, feasibility reports, or regulatory briefs to the repo.
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-800 shrink-0">
                        {myUploadedPapers.length}/3 Uploaded
                      </span>
                    </div>

                    {/* Requirement 2: Submit Details */}
                    <div className="p-4 bg-white border border-emerald-100 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-full bg-slate-100 text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold text-slate-800">Provide Scholar Association Details</span>
                          <span className="block text-[10px] text-slate-500 font-normal">
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

                      <div className="p-4 border border-amber-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5" style={{ backgroundColor: '#f9f9e8' }}>
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p>
                          Please upload at least <strong>{3 - myUploadedPapers.length} more study</strong> to fulfill the publishing criteria. Use the "Research Hub" page to contribute a new document.
                        </p>
                      </div>

                      <button
                        onClick={onBackToLanding}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 text-left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Return to Research Hub to Upload
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 bg-white border border-emerald-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <p>
                          <strong>Minimum publishing requirements met!</strong> You have contributed {myUploadedPapers.length} research studies. You can now complete the application below to receive your verified checkmark badge.
                        </p>
                      </div>

                      {!showAppForm ? (
                        <button
                          onClick={() => setShowAppForm(true)}
                          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Apply for Scholar Verification Badge
                        </button>
                      ) : (
                        <motion.form 
                          onSubmit={handleApplyVerification}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-white p-5 sm:p-6 border border-emerald-150 rounded-2xl space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-emerald-150 pb-2.5 mb-2 font-sans">
                            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                              <Unlock className="w-4 h-4 text-emerald-600" />
                              Scholar Verification Application
                            </span>
                            <button 
                              type="button" 
                              onClick={() => setShowAppForm(false)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3.5 text-xs text-slate-700 font-sans">
                            <div className="space-y-1 text-left">
                              <label className="block font-bold text-emerald-900">Academic / Institutional Affiliation *</label>
                              <input 
                                type="text"
                                placeholder="e.g. University of Ibadan, Nigeria"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-emerald-200/80 rounded-xl text-xs focus:border-emerald-600 outline-hidden font-medium text-emerald-950"
                                required
                              />
                            </div>

                            <div className="space-y-1 text-left">
                              <label className="block font-bold text-emerald-900">ORCID iD (Optional)</label>
                              <input 
                                type="text"
                                placeholder="e.g. 0000-0002-1825-0097"
                                value={orcid}
                                onChange={(e) => setOrcid(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-emerald-200/80 rounded-xl text-xs focus:border-emerald-600 outline-hidden font-mono text-emerald-950"
                              />
                              <p className="text-[10px] text-slate-400">Enables automatic syncing of research citations globally.</p>
                            </div>

                            <div className="space-y-1 text-left">
                              <label className="block font-bold text-emerald-900">Google Scholar Profile URL (Optional)</label>
                              <input 
                                type="url"
                                placeholder="https://scholar.google.com/citations?user=..."
                                value={googleScholar}
                                onChange={(e) => setGoogleScholar(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-emerald-200/80 rounded-xl text-xs focus:border-emerald-600 outline-hidden font-medium text-emerald-950"
                              />
                            </div>

                            <div className="space-y-1 text-left">
                              <label className="block font-bold text-emerald-900">Research Focus & Bio Statement *</label>
                              <textarea 
                                placeholder="Describe your primary focus area, expert topics, and research objectives. This will be displayed on your certified profile."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2.5 bg-white border border-emerald-200/80 rounded-xl text-xs focus:border-emerald-600 outline-hidden font-medium leading-relaxed resize-none text-emerald-950"
                                required
                              />
                            </div>

                            <div className="space-y-1.5 text-left font-sans">
                              <label className="block font-bold text-emerald-900">Expertise Topics (Select multiple)</label>
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
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'
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
                              className="px-4 py-2.5 bg-slate-150 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border-0"
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

            {/* 3. AI Recommendations */}
            <AIRecommendations
              userProfile={userProfile}
              onApplyAction={handleApplyRecommendation}
              onSaveAction={handleSaveRecommendation}
            />

          </div>

          {/* RIGHT COLUMN: SECONDARY MODULES (4/12 widths) */}
          <div className="lg:col-span-4 space-y-8" id="utility_right_column">
            
            {/* 1. Upcoming Deadlines */}
            <UpcomingDeadlines
              deadlines={deadlines}
              onAddDeadline={handleAddDeadline}
              onDeleteDeadline={handleDeleteDeadline}
            />

            {/* 2. Alliance Status & Application Editing */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-emerald-950">Alliance Status ({localPartnerships.length})</h4>
                </div>
              </div>

              {localPartnerships.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {localPartnerships.map((sub) => (
                    <motion.div 
                      key={sub.id} 
                      whileHover={{ x: 2 }}
                      className="p-4 bg-white border border-emerald-100/80 rounded-xl space-y-2 shadow-xs hover:shadow-sm transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between gap-2 font-sans">
                        <span className="text-[10px] font-bold text-emerald-950 truncate max-w-[130px]">{sub.partnerName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Registered
                        </span>
                      </div>
                      <span className="block text-xs font-semibold text-emerald-700 font-sans">{sub.stakeholderType}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans font-medium">{sub.message}</p>
                      
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-100 mt-1 font-sans">
                        <span className="text-[9px] font-mono text-slate-500 truncate max-w-[120px]">
                          Area: {sub.collaborationArea || 'General'}
                        </span>
                        <button
                          onClick={() => handleStartEditPartnership(sub)}
                          className="px-2 py-0.5 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer bg-transparent border-0"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                          Edit App
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6 font-sans">No active alliance applications.</p>
              )}
            </div>

            {/* 3. Consultation tracker widget */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-emerald-950 font-display">Consulting Reviews ({localInquiries.length})</h4>
                </div>
              </div>

              {localInquiries.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {localInquiries.map((inq) => (
                    <motion.div 
                      key={inq.id} 
                      whileHover={{ x: 2 }}
                      className="p-4 bg-white border border-emerald-100/80 rounded-xl space-y-2 shadow-xs hover:shadow-sm transition-shadow duration-300 font-sans"
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
                      <span className="block text-xs font-semibold text-slate-700"> {inq.serviceType}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{inq.message}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6 font-sans">No advisory inquiries submitted yet.</p>
              )}
            </div>

            {/* 4. Activity Timeline Logger */}
            <ActivityTimeline customActivities={liveActivities} />

          </div>

        </div>

      </div>
    </div>
  );
}
