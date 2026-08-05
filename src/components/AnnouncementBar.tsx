import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { checkProfileCompleteness } from '../utils/profileValidation';
import { getUserProfile } from '../services/db';

interface AnnouncementBarProps {
  user: FirebaseUser;
  userProfile?: any;
  currentView: string;
  setView: (view: string) => void;
}

type AnnouncementType = 'profile' | 'upload' | 'community' | 'draft';

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
  const [communityVisited, setCommunityVisited] = useState<boolean>(() => {
    return localStorage.getItem('aurenix_community_visited') === 'true';
  });
  const [dismissedType, setDismissedType] = useState<AnnouncementType | null>(null);

  // Keep communityVisited updated if current view is 'community'
  useEffect(() => {
    if (currentView === 'community') {
      localStorage.setItem('aurenix_community_visited', 'true');
      setCommunityVisited(true);
    }
  }, [currentView]);

  // Keep liveProfile updated from prop or Firestore
  useEffect(() => {
    if (propUserProfile) {
      setLiveProfile(propUserProfile);
    }
  }, [propUserProfile]);

  // Real-time Firestore profile listener
  useEffect(() => {
    if (!user) return;

    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setLiveProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        getUserProfile(user.uid).then(p => {
          if (p) setLiveProfile(p);
        }).catch(() => {});
      }
    }, (err) => {
      console.warn('AnnouncementBar profile snapshot warning:', err);
    });

    return () => unsubProfile();
  }, [user]);

  // Real-time custom papers snapshot to calculate published vs draft research
  useEffect(() => {
    if (!user) return;

    const unsubPapers = onSnapshot(collection(db, 'custom_papers'), (snapshot) => {
      let pub = 0;
      let drf = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const isUserPaper = data.userId === user.uid || (user.email && data.userEmail === user.email);

        if (isUserPaper) {
          const isDraft =
            data.isDraft === true ||
            data.completionStatus === 'Draft' ||
            data.status === 'Draft' ||
            (data.draftStep && Number(data.draftStep) > 1);

          if (isDraft) {
            drf++;
          } else {
            pub++;
          }
        }
      });

      setPublishedCount(pub);
      setDraftCount(drf);
    }, (err) => {
      console.warn('AnnouncementBar custom_papers snapshot warning:', err);
    });

    return () => unsubPapers();
  }, [user]);

  const effectiveProfile = liveProfile || propUserProfile;
  const isProfileComplete = checkProfileCompleteness(effectiveProfile).isComplete;

  // Determine current announcement based on priority rules
  let activeAnnouncement: AnnouncementConfig | null = null;

  if (!isProfileComplete) {
    activeAnnouncement = {
      type: 'profile',
      badge: 'Action Required',
      message: 'Complete your profile to unlock all Aurenix features.',
      buttonText: 'Complete profile',
      icon: User,
      action: () => setView('profile')
    };
  } else if (publishedCount === 0) {
    activeAnnouncement = {
      type: 'upload',
      badge: 'Getting Started',
      message: 'Upload your first research paper and share your work with the Aurenix community.',
      buttonText: 'Upload research',
      icon: UploadCloud,
      action: () => setView('research')
    };
  } else if (!communityVisited) {
    activeAnnouncement = {
      type: 'community',
      badge: 'Community',
      message: 'Explore the Aurenix community and connect with researchers.',
      buttonText: 'Explore community',
      icon: Users,
      action: () => {
        localStorage.setItem('aurenix_community_visited', 'true');
        setCommunityVisited(true);
        setView('community');
      }
    };
  } else if (draftCount > 0) {
    activeAnnouncement = {
      type: 'draft',
      badge: 'Draft Saved',
      message: 'You have unfinished research waiting for your attention.',
      buttonText: 'Continue editing',
      icon: Pencil,
      action: () => setView('research')
    };
  }

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
              onClick={() => setDismissedType(activeAnnouncement!.type)}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer bg-transparent border-0"
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

