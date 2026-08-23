import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  FileText, 
  AlertTriangle, 
  User, 
  Users, 
  UploadCloud, 
  X, 
  ArrowRight,
  Pencil,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { checkProfileCompleteness } from '../utils/profileValidation';
import { getUserProfile, getCustomPapers, getLocalCustomPapers, isDemoModeActive } from '../services/db';
import { ResearchPaper } from '../types';

interface AnnouncementBarProps {
  user: FirebaseUser;
  userProfile?: any;
  currentView: string;
  setView: (view: string) => void;
}

type AnnouncementType = 
  | 'profile' 
  | 'upload' 
  | 'draft' 
  | 'org_action_required' 
  | 'org_verify' 
  | 'community' 
  | 'collaboration' 
  | 'insights';

interface AnnouncementConfig {
  type: AnnouncementType;
  badge: string;
  message: string;
  buttonText: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export default function AnnouncementBar({
  user,
  userProfile: propUserProfile,
  currentView,
  setView
}: AnnouncementBarProps) {
  const [liveProfile, setLiveProfile] = useState<any>(propUserProfile || null);
  const [publishedCount, setPublishedCount] = useState<number>(0);
  const [draftCount, setDraftCount] = useState<number>(0);
  const [latestDraft, setLatestDraft] = useState<ResearchPaper | null>(null);

  const [communityVisited, setCommunityVisited] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aurenix_community_visited') === 'true';
  });

  const [collaborationVisited, setCollaborationVisited] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aurenix_collaboration_visited') === 'true';
  });

  const [insightsVisited, setInsightsVisited] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aurenix_insights_visited') === 'true';
  });

  const [dismissedType, setDismissedType] = useState<AnnouncementType | null>(null);

  // Keep tracking states updated as user navigates views
  useEffect(() => {
    if (currentView === 'community' || currentView === 'researchers') {
      localStorage.setItem('aurenix_community_visited', 'true');
      setCommunityVisited(true);
    } else if (currentView === 'collaboration' || currentView === 'console') {
      localStorage.setItem('aurenix_collaboration_visited', 'true');
      setCollaborationVisited(true);
    } else if (currentView === 'insights' || currentView === 'research-areas') {
      localStorage.setItem('aurenix_insights_visited', 'true');
      setInsightsVisited(true);
    }
  }, [currentView]);

  // Sync live profile when propUserProfile updates from parent
  useEffect(() => {
    if (propUserProfile) {
      setLiveProfile(propUserProfile);
    }
  }, [propUserProfile]);

  // Real-time Profile Listeners: Firestore doc listener + Custom Event + Storage Event + Polling Fallback
  useEffect(() => {
    if (!user) return;

    // 1. Initial direct load
    getUserProfile(user.uid).then(p => {
      if (p) setLiveProfile(p);
    }).catch(() => {});

    // 2. Custom window event listener (dispatched upon any profile update across the app)
    const handleProfileUpdatedEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.userId === user.uid) {
        setLiveProfile(customEvent.detail.profile);
      }
    };
    window.addEventListener('user-profile-updated', handleProfileUpdatedEvent as EventListener);

    // 3. Storage event listener (multi-tab or local storage update sync)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === `nexus_demo_profile_${user.uid}` && e.newValue) {
        try {
          setLiveProfile(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'aurenix_community_visited') {
        setCommunityVisited(e.newValue === 'true');
      }
      if (e.key === 'aurenix_collaboration_visited') {
        setCollaborationVisited(e.newValue === 'true');
      }
      if (e.key === 'aurenix_insights_visited') {
        setInsightsVisited(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 4. Firestore real-time onSnapshot listener
    let unsubProfile: (() => void) | null = null;
    try {
      unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setLiveProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
          getUserProfile(user.uid).then(p => {
            if (p) setLiveProfile(p);
          }).catch(() => {});
        }
      }, (err) => {
        console.warn('AnnouncementBar profile snapshot notice:', err);
      });
    } catch (err) {
      console.warn('Could not attach Firestore onSnapshot for profile:', err);
    }

    // 5. Polling fallback for demo/offline sandbox mode
    const pollInterval = setInterval(() => {
      if (isDemoModeActive(user.uid)) {
        const local = localStorage.getItem(`nexus_demo_profile_${user.uid}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setLiveProfile((prev: any) => {
              if (prev && JSON.stringify(prev) === local) return prev;
              return parsed;
            });
          } catch {}
        }
      }
    }, 2500);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdatedEvent as EventListener);
      window.removeEventListener('storage', handleStorageEvent);
      if (unsubProfile) unsubProfile();
      clearInterval(pollInterval);
    };
  }, [user]);

  // Helper to accurately classify and count papers
  const processCustomPapers = useCallback((papersList: ResearchPaper[]) => {
    if (!user) return;
    const userPapers = (papersList || []).filter(p => 
      p.userId === user.uid || (user.email && p.userEmail === user.email)
    );

    const drafts: ResearchPaper[] = [];
    const published: ResearchPaper[] = [];

    userPapers.forEach((p) => {
      const isDraft =
        p.isDraft === true ||
        p.completionStatus === 'Draft' ||
        p.status === 'Draft' ||
        (p.draftStep && Number(p.draftStep) > 1);

      if (isDraft) {
        drafts.push(p);
      } else {
        published.push(p);
      }
    });

    setDraftCount(drafts.length);
    setPublishedCount(published.length);

    if (drafts.length > 0) {
      const sorted = [...drafts].sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setLatestDraft(sorted[0]);
    } else {
      setLatestDraft(null);
    }
  }, [user]);

  // Real-time Research Papers & Drafts Listeners
  useEffect(() => {
    if (!user) return;

    // 1. Initial direct load
    getCustomPapers()
      .then(papers => processCustomPapers(papers))
      .catch(() => processCustomPapers(getLocalCustomPapers()));

    // 2. Custom event listeners for paper mutations
    const handlePapersUpdatedEvent = () => {
      getCustomPapers()
        .then(papers => processCustomPapers(papers))
        .catch(() => processCustomPapers(getLocalCustomPapers()));
    };

    window.addEventListener('custom-papers-updated', handlePapersUpdatedEvent);
    window.addEventListener('research-updated', handlePapersUpdatedEvent);

    // 3. Storage event listener for demo custom papers
    const handlePaperStorage = (e: StorageEvent) => {
      if (e.key === 'nexus_demo_custom_papers') {
        processCustomPapers(getLocalCustomPapers());
      }
    };
    window.addEventListener('storage', handlePaperStorage);

    // 4. Firestore real-time custom_papers collection onSnapshot listener
    let unsubPapers: (() => void) | null = null;
    try {
      unsubPapers = onSnapshot(collection(db, 'custom_papers'), (snapshot) => {
        const papers: ResearchPaper[] = [];
        snapshot.forEach((docSnap) => {
          papers.push({ id: docSnap.id, isCustom: true, ...docSnap.data() } as ResearchPaper);
        });
        // Merge with local storage fallback if any
        const local = getLocalCustomPapers();
        const merged = [...papers];
        local.forEach(lp => {
          if (!merged.some(p => p.id === lp.id)) {
            merged.push(lp);
          }
        });
        processCustomPapers(merged);
      }, (err) => {
        console.warn('AnnouncementBar custom_papers snapshot notice:', err);
        processCustomPapers(getLocalCustomPapers());
      });
    } catch (err) {
      console.warn('Could not attach Firestore onSnapshot for custom_papers:', err);
      processCustomPapers(getLocalCustomPapers());
    }

    // 5. Polling fallback for demo/offline sandbox mode
    const paperInterval = setInterval(() => {
      if (isDemoModeActive(user.uid)) {
        processCustomPapers(getLocalCustomPapers());
      }
    }, 2500);

    return () => {
      window.removeEventListener('custom-papers-updated', handlePapersUpdatedEvent);
      window.removeEventListener('research-updated', handlePapersUpdatedEvent);
      window.removeEventListener('storage', handlePaperPaperStorage);
      if (unsubPapers) unsubPapers();
      clearInterval(paperInterval);
    };

    function handlePaperPaperStorage(e: StorageEvent) {
      if (e.key === 'nexus_demo_custom_papers') {
        processCustomPapers(getLocalCustomPapers());
      }
    }
  }, [user, processCustomPapers]);

  // Calculate Profile Completeness and Total Published Count
  const effectiveProfile = liveProfile || propUserProfile;
  const profileValidation = useMemo(() => checkProfileCompleteness(effectiveProfile), [effectiveProfile]);
  const isProfileComplete = profileValidation.isComplete;
  const isOrgAccount = ['Institution', 'Industry', 'Government', 'NGO', 'Other', 'Government Agency'].includes(effectiveProfile?.userRole || effectiveProfile?.role || '') || !!effectiveProfile?.isOrganization || !!effectiveProfile?.organizationType || effectiveProfile?.accountType === 'institution';

  const totalPublishedPapers = useMemo(() => {
    const profilePublished = Array.isArray(effectiveProfile?.publishedPapers) 
      ? effectiveProfile.publishedPapers.length 
      : (typeof effectiveProfile?.uploadedResearchCount === 'number' ? effectiveProfile.uploadedResearchCount : 0);
    return Math.max(publishedCount, profilePublished);
  }, [publishedCount, effectiveProfile]);

  // Determine current announcement based on priority lifecycle rules
  const activeAnnouncement = useMemo<AnnouncementConfig | null>(() => {
    // For organizations: do not display the "Complete profile" banner under the header
    if (isOrgAccount) {
      return null;
    }

    // 1. Stage 1: Profile Incomplete (For researchers/scholars/students)
    if (!isProfileComplete) {
      return {
        type: 'profile',
        badge: 'Action Required',
        message: 'Complete your profile to unlock all Aurenix features.',
        buttonText: 'Complete profile',
        icon: User,
        action: () => setView('profile')
      };
    }

    // 2. Stage 2: Profile Complete, but 0 Research Papers Published
    if (totalPublishedPapers === 0) {
      return {
        type: 'upload',
        badge: 'Getting Started',
        message: 'Upload your first research paper and share your work with the Aurenix community.',
        buttonText: 'Upload research',
        icon: UploadCloud,
        action: () => {
          setView('research');
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-publish-wizard'));
            }
          }, 80);
        }
      };
    }

    // 3. Stage 3: Unfinished Drafts saved
    if (draftCount > 0) {
      return {
        type: 'draft',
        badge: 'Draft Saved',
        message: draftCount === 1 
          ? 'You have an unfinished research draft waiting for your attention.' 
          : `You have ${draftCount} unfinished research drafts waiting for your attention.`,
        buttonText: 'Continue editing',
        icon: Pencil,
        action: () => {
          setView('research');
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-publish-wizard', { detail: { draftData: latestDraft } }));
            }
          }, 80);
        }
      };
    }

    // 4. Stage 4: Organization Verification Action Required
    if (effectiveProfile?.verificationStatus === 'action_required') {
      return {
        type: 'org_action_required',
        badge: 'Verification Alert',
        message: 'Your organization verification requires updates. Please review admin notes.',
        buttonText: 'Review notes',
        icon: AlertTriangle,
        action: () => setView('profile')
      };
    }

    // 5. Stage 5: Unverified Organization
    if (
      effectiveProfile?.isOrganization && 
      !effectiveProfile?.isVerified && 
      !effectiveProfile?.verified && 
      effectiveProfile?.verificationStatus !== 'pending'
    ) {
      return {
        type: 'org_verify',
        badge: 'Institutional Badge',
        message: 'Verify your institution to unlock official publishing credentials & grant syndication.',
        buttonText: 'Verify organization',
        icon: ShieldCheck,
        action: () => setView('profile')
      };
    }

    // 6. Stage 6: Explore Community Hub & Peer Researchers
    if (!communityVisited) {
      return {
        type: 'community',
        badge: 'Community',
        message: 'Explore the Aurenix community, discover peer research, and connect with scholars.',
        buttonText: 'Explore community',
        icon: Users,
        action: () => {
          localStorage.setItem('aurenix_community_visited', 'true');
          setCommunityVisited(true);
          setView('community');
        }
      };
    }

    // 7. Stage 7: Explore Collaboration Hub & Alliances
    if (!collaborationVisited) {
      return {
        type: 'collaboration',
        badge: 'Collaboration',
        message: 'Discover active collaborative research alliances and open innovation challenges.',
        buttonText: 'Explore alliances',
        icon: Sparkles,
        action: () => {
          localStorage.setItem('aurenix_collaboration_visited', 'true');
          setCollaborationVisited(true);
          setView('collaboration');
        }
      };
    }

    // 8. Stage 8: Explore Insights Hub & Market Briefs
    if (!insightsVisited) {
      return {
        type: 'insights',
        badge: 'Insights Hub',
        message: 'Discover curated bioenergy research insights, technical analyses, and market briefings.',
        buttonText: 'Read insights',
        icon: FileText,
        action: () => {
          localStorage.setItem('aurenix_insights_visited', 'true');
          setInsightsVisited(true);
          setView('insights');
        }
      };
    }

    return null;
  }, [
    isProfileComplete, 
    totalPublishedPapers, 
    draftCount, 
    latestDraft, 
    effectiveProfile, 
    communityVisited, 
    collaborationVisited, 
    insightsVisited, 
    setView
  ]);

  if (!activeAnnouncement || dismissedType === activeAnnouncement.type) {
    return null;
  }

  const IconComponent = activeAnnouncement.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeAnnouncement.type}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-[80px] z-40 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)] flex items-center h-[46px] transition-colors duration-200"
        id="dashboard_sticky_announcement_bar"
      >
        <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left / Centre: Icon, Badge & Message */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeAnnouncement.badge}
              </span>
            </div>

            <p className="text-slate-800 dark:text-slate-100 font-medium text-xs sm:text-sm truncate tracking-tight">
              {activeAnnouncement.message}
            </p>
          </div>

          {/* Right: Premium Action Button & Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={activeAnnouncement.action}
              className="group relative inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs tracking-tight transition-all duration-200 shadow-sm hover:shadow-emerald-600/20 cursor-pointer border-0 whitespace-nowrap overflow-hidden"
              id="announcement_action_btn"
            >
              <span>{activeAnnouncement.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => setDismissedType(activeAnnouncement.type)}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 rounded-full transition-colors cursor-pointer bg-transparent border-0"
              title="Dismiss announcement"
              id="announcement_close_btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
