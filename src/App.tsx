import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, browserPopupRedirectResolver, db, setFirestoreOffline } from './firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { getSavedPaperIds, getUserInquiries, getUserPartnerships, getUserProfile, isDemoModeActive, getCustomPapers, getInnovationProjects, updateInnovationProject, savePaper, unsavePaper, isOfflineError } from './services/db';
import { ConsultationInquiry, PartnershipSubmission, ResearchPaper } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, Sparkles, X, UserCheck, KeyRound, HelpCircle, BookOpen, Users, HeartHandshake, Leaf, Award, Quote, Building, CheckCircle2, FlaskConical } from 'lucide-react';

// Core layout components
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import FloatingAside from './components/FloatingAside';
import Hero from './components/Hero';
import FeaturedPilots from './components/FeaturedPilots';
import { TrustedLeadersBanner } from './components/TrustedLeadersBanner';
import TestimonialsSection from './components/TestimonialsSection';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import SeoManager from './components/seo/SeoManager';
import ErrorBoundary from './components/ErrorBoundary';
import SignInPage from './components/SignInPage';
import { RESEARCH_PAPERS } from './data';
import { initBackgroundPreloading, preloadRoute } from './utils/routePreloader';

// Safe lazy loading helper with retry & cache recovery
function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.warn('Lazy module load failed, attempting chunk reload:', error);
      const hasReloaded = sessionStorage.getItem('nexus_chunk_reloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('nexus_chunk_reloaded', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

// Route-based code splitting
const OnboardingPage = safeLazy(() => import('./components/OnboardingPage'));
const AboutSection = safeLazy(() => import('./components/AboutSection'));
const ResearchSection = safeLazy(() => import('./components/ResearchSection'));
const ResearchDetail = safeLazy(() => import('./components/ResearchDetail'));
const ProjectDetailsPage = safeLazy(() => import('./components/ProjectDetailsPage'));
const AllianceDetailsPage = safeLazy(() => import('./components/AllianceDetailsPage'));
const SavedStudiesPage = safeLazy(() => import('./components/SavedStudiesPage'));
const ConsultationSection = safeLazy(() => import('./components/ConsultationSection'));
const CollaborationSection = safeLazy(() => import('./components/CollaborationSection'));
const ContactSection = safeLazy(() => import('./components/ContactSection'));
const UserDashboard = safeLazy(() => import('./components/UserDashboard'));
const OrganizationDashboard = safeLazy(() => import('./components/organization/OrganizationDashboard'));
const ExploreResearchers = safeLazy(() => import('./components/ExploreResearchers'));
const OperationalConsole = safeLazy(() => import('./components/collaboration/OperationalConsole'));
const ProfilePage = safeLazy(() => import('./components/ProfilePage'));
const SettingsPage = safeLazy(() => import('./components/SettingsPage'));
const AdminPortal = safeLazy(() => import('./components/admin/AdminPortal'));
const MessagesPage = safeLazy(() => import('./components/MessagesPage'));
const NotificationsPage = safeLazy(() => import('./components/NotificationsPage'));
const InsightsHub = safeLazy(() => import('./components/InsightsHub'));
const ResearchAreasPage = safeLazy(() => import('./components/ResearchAreasPage'));
const LegalLayout = safeLazy(() => import('./components/legal/LegalLayout'));
const CommunityPage = safeLazy(() => import('./components/CommunityPage'));
const NotFoundPage = safeLazy(() => import('./components/NotFoundPage'));
const ResearchAiAssistant = safeLazy(() => import('./components/ai/ResearchAiAssistant'));
import FloatingAiWidget from './components/ai/FloatingAiWidget';

function ViewLoadingFallback() {
  return (
    <div className="w-full min-h-[70vh] py-8 px-4 sm:px-8 max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto animate-pulse text-left space-y-6">
      <div className="space-y-3 max-w-2xl">
        <div className="h-7 bg-slate-200/70 dark:bg-slate-800/60 rounded-xl w-1/3" />
        <div className="h-4 bg-slate-200/50 dark:bg-slate-800/40 rounded-lg w-2/3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="h-48 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl" />
        <div className="h-48 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl" />
        <div className="h-48 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl" />
      </div>
    </div>
  );
}

export interface AppRouteState {
  view: string;
  researcherId: string | null;
  paperId: string | null;
  projectId: string | null;
  allianceId: string | null;
  insightSlug: string | null;
  areaSlug: string | null;
  policyId?: string | null;
}

function parsePath(path: string): AppRouteState {
  // 1. /researchers/:researcherId
  let match = path.match(/^\/researchers\/([^/]+)$/);
  if (match) {
    return { view: 'researchers', researcherId: match[1], paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }
  
  // 2. /researchers
  if (path === '/researchers') {
    return { view: 'researchers', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }
  
  // 3. /research/:paperId
  match = path.match(/^\/research\/([^/]+)$/);
  if (match) {
    return { view: 'research', researcherId: null, paperId: match[1], projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }
  
  // 4. /research
  if (path === '/research') {
    return { view: 'research', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }

  // 5. /projects/:projectId
  match = path.match(/^\/projects\/([^/]+)$/);
  if (match) {
    return { view: 'dashboard', researcherId: null, paperId: null, projectId: match[1], allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }

  // 6. /alliances/:allianceId
  match = path.match(/^\/alliances\/([^/]+)$/);
  if (match) {
    return { view: 'collaboration', researcherId: null, paperId: null, projectId: null, allianceId: match[1], insightSlug: null, areaSlug: null, policyId: null };
  }

  // 7. /messages/:targetUserId
  match = path.match(/^\/messages\/([^/]+)$/);
  if (match) {
    return { view: 'messages', researcherId: match[1], paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }

  // 8. /insights/:slug
  match = path.match(/^\/insights\/([^/]+)$/);
  if (match) {
    return { view: 'insights', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: match[1], areaSlug: null, policyId: null };
  }
  if (path === '/insights') {
    return { view: 'insights', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }

  // 9. /research-areas/:areaSlug
  match = path.match(/^\/research-areas\/([^/]+)$/);
  if (match) {
    return { view: 'research-areas', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: match[1], policyId: null };
  }
  if (path === '/research-areas') {
    return { view: 'research-areas', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }

  // 10. /legal/:policyId or /legal
  match = path.match(/^\/legal\/([^/]+)$/);
  if (match) {
    return { view: 'legal', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: match[1] };
  }
  if (path === '/legal' || path === '/legal/') {
    return { view: 'legal', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: 'hub' };
  }

  // Root homepage
  if (path === '/' || path === '') {
    return { view: 'home', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
  }

  // Standard views
  const views = ['about', 'services', 'collaboration', 'dashboard', 'contact', 'saved', 'signin', 'console', 'profile', 'settings', 'onboarding', 'admin', 'messages', 'notifications', 'insights', 'research-areas', 'legal', 'community', 'ai-assistant'];
  const viewName = path.substring(1);
  if (views.includes(viewName)) {
    return { view: viewName, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: 'terms' };
  }
  
  return { view: 'notfound', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null };
}

const DEMO_GUEST_USER = {
  uid: 'guest-user',
  displayName: 'Guest Scholar',
  email: '',
  photoURL: '',
  emailVerified: false,
  isAnonymous: true,
  metadata: {
    creationTime: '2026-01-01T00:00:00.000Z',
    lastSignInTime: '2026-01-01T00:00:00.000Z'
  }
};

function parseUrl() {
  if (typeof window === 'undefined') {
    return parsePath('/');
  }
  return parsePath(window.location.pathname);
}

export default function App() {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Routing State Manager
  const [routeState, setRouteState] = useState<AppRouteState>(() => parseUrl());
  const currentView = routeState.view;
  const selectedResearcherId = routeState.researcherId;
  const selectedPaperId = routeState.paperId;
  const selectedProjectId = routeState.projectId;
  const selectedAllianceId = routeState.allianceId;
  const selectedInsightSlug = routeState.insightSlug;
  const selectedAreaSlug = routeState.areaSlug;

  const [allPapers, setAllPapers] = useState<ResearchPaper[]>([]);
  const [dbProjects, setDbProjects] = useState<any[]>([]);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    React.startTransition(() => {
      setRouteState(parseUrl());
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const setView = (view: string) => {
    let effectiveView = view === 'saved_studies' ? 'saved' : (view === 'collaborations' ? 'collaboration' : view);

    if (effectiveView === 'initializing') {
      React.startTransition(() => {
        setRouteState({ view: 'initializing', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null, policyId: null });
      });
      return;
    }

    // Signed-in users must never view or access the home page
    if (user && effectiveView === 'home') {
      effectiveView = 'dashboard';
    }

    // Direct subpaths or path handles (e.g. 'legal/terms', '/legal/privacy')
    if (effectiveView.includes('/') || effectiveView.startsWith('/')) {
      const targetPath = effectiveView.startsWith('/') ? effectiveView : `/${effectiveView}`;
      navigateTo(targetPath);
      return;
    }
    const pathMap: Record<string, string> = {
      home: '/',
      about: '/about',
      services: '/services',
      research: '/research',
      collaboration: '/collaboration',
      dashboard: '/dashboard',
      contact: '/contact',
      saved: '/saved',
      signin: '/signin',
      researchers: '/researchers',
      console: '/console',
      profile: '/profile',
      settings: '/settings',
      onboarding: '/onboarding',
      admin: '/admin',
      messages: '/messages',
      notifications: '/notifications',
      insights: '/insights',
      'research-areas': '/research-areas',
      legal: '/legal',
      community: '/community'
    };

    const currentPath = window.location.pathname;
    const isCurrentSubpathOfView = (effectiveView === 'research' && currentPath.startsWith('/research/')) ||
                                   (effectiveView === 'researchers' && currentPath.startsWith('/researchers/')) ||
                                   (effectiveView === 'dashboard' && currentPath.startsWith('/projects/')) ||
                                   (effectiveView === 'collaboration' && currentPath.startsWith('/alliances/')) ||
                                   (effectiveView === 'insights' && currentPath.startsWith('/insights/')) ||
                                   (effectiveView === 'research-areas' && currentPath.startsWith('/research-areas/')) ||
                                   (effectiveView === 'legal' && currentPath.startsWith('/legal/'));

    if (isCurrentSubpathOfView) {
      navigateTo(currentPath);
    } else {
      navigateTo(pathMap[effectiveView] || '/');
    }
  };

  useEffect(() => {
    // Preload views in idle background
    initBackgroundPreloading();

    const handlePopState = () => {
      React.startTransition(() => {
        setRouteState(parseUrl());
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [userProfile, setUserProfileState] = useState<any | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Sidebar collapsed state and mobile check
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('nexus_sidebar_collapsed');
    return saved === null ? false : saved === 'true';
  });
  const [isMobile, setIsMobile] = useState(false);

  // Theme state for dark & light mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nexus_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1280);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load custom papers in real-time & user projects on load / auth state changes
  useEffect(() => {
    const customPapersCol = collection(db, 'custom_papers');
    const unsubCustomPapers = onSnapshot(customPapersCol, (snapshot) => {
      const custom: ResearchPaper[] = [];
      snapshot.forEach((docSnap) => {
        custom.push({ id: docSnap.id, isCustom: true, ...docSnap.data() } as ResearchPaper);
      });
      setAllPapers([...RESEARCH_PAPERS, ...custom]);
    }, (err) => {
      console.warn('custom_papers snapshot error in App:', err);
      getCustomPapers().then(custom => setAllPapers([...RESEARCH_PAPERS, ...custom])).catch(() => {});
    });

    return () => unsubCustomPapers();
  }, []);

  useEffect(() => {
    async function loadUserProjects() {
      if (user) {
        try {
          const projs = await getInnovationProjects(user.uid);
          setDbProjects(projs);
        } catch (err) {
          console.error('Error loading projects:', err);
        }
      } else {
        setDbProjects([]);
      }
    }
    loadUserProjects();
  }, [user]);

  const handleUpdateProjectInApp = async (id: string, fields: Partial<any>) => {
    if (!user) return;
    await updateInnovationProject(user.uid, id, fields);
    try {
      const projs = await getInnovationProjects(user.uid);
      setDbProjects(projs);
    } catch (err) {
      console.error(err);
    }
  };

  // Firestore Saved State & Submissions
  const [savedPaperIds, setSavedPaperIds] = useState<string[]>([]);
  const [activeInquiries, setActiveInquiries] = useState<ConsultationInquiry[]>([]);
  const [activePartnerships, setActivePartnerships] = useState<PartnershipSubmission[]>([]);

  // Listen to Auth state changes
  useEffect(() => {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const handleAuthChange = async () => {
        // Check if session has expired (> 30 days of inactivity)
        const lastActiveStr = localStorage.getItem('nexus_last_active_timestamp');
        if (lastActiveStr) {
          const lastActive = parseInt(lastActiveStr, 10);
          if (!isNaN(lastActive) && (Date.now() - lastActive > THIRTY_DAYS_MS)) {
            console.log('Session expired due to 30+ days of inactivity. Logging out.');
            localStorage.removeItem('nexus_demo_mode');
            localStorage.removeItem('nexus_demo_user');
            localStorage.removeItem('nexus_last_active_timestamp');
            sessionStorage.removeItem('nexus_system_initialized');
            if (currentUser) {
              try { await signOut(auth); } catch (e) { /* silent fail */ }
            }
            setUser(null);
            setAuthLoading(false);
            setSavedPaperIds([]);
            setActiveInquiries([]);
            setActivePartnerships([]);
            setUserProfileState(null);
            setView('signin');
            return;
          }
        }

        if (currentUser) {
          // Real authenticated Firebase user is present (e.g. Google Sign-In)
          // We MUST clear any cached sandbox/guest demo mode and use the real user details.
          localStorage.removeItem('nexus_demo_mode');
          localStorage.removeItem('nexus_demo_user');
          localStorage.setItem('nexus_last_active_timestamp', Date.now().toString());
          
          setUser(currentUser);
          setAuthLoading(false);
          await refreshAllUserData(currentUser.uid);
          return;
        }

        // If no real Firebase user is logged in, fallback to sandbox demo mode if it was active
        if (localStorage.getItem('nexus_demo_mode') === 'true') {
          const storedDemoUser = localStorage.getItem('nexus_demo_user');
          if (storedDemoUser) {
            try {
              const demoObj = JSON.parse(storedDemoUser);
              // Clear and delete Guest Researcher session immediately if found
              if (demoObj.uid === 'sandbox-guest-user' || demoObj.email === 'guest.researcher@aurenix-research.org') {
                localStorage.removeItem('nexus_demo_mode');
                localStorage.removeItem('nexus_demo_user');
                localStorage.removeItem('nexus_last_active_timestamp');
                setUser(null);
                setAuthLoading(false);
                setView('home');
                return;
              }
              localStorage.setItem('nexus_last_active_timestamp', Date.now().toString());
              setUser(demoObj);
              setAuthLoading(false);
              await refreshAllUserData(demoObj.uid);
              return;
            } catch (e) {
              console.error('Error parsing stored demo user:', e);
            }
          }
        }

        setUser(null);
        setAuthLoading(false);
        setSavedPaperIds([]);
        setActiveInquiries([]);
        setActivePartnerships([]);
        setUserProfileState(null);
        // Keep the view intact unless we're on onboarding
        const prevView = routeState.view;
        setView(prevView === 'onboarding' ? 'home' : prevView);
      };

      handleAuthChange();
    });
    return () => unsubscribe();
  }, []);

  // Rolling session activity updater: updates last active timestamp when logged in
  useEffect(() => {
    if (!user) return;
    localStorage.setItem('nexus_last_active_timestamp', Date.now().toString());
    const interval = setInterval(() => {
      localStorage.setItem('nexus_last_active_timestamp', Date.now().toString());
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Real-time Firestore onSnapshot listener for User Profile (Source of Truth)
  useEffect(() => {
    if (!user) {
      setUserProfileState(null);
      return;
    }

    const userId = user.uid;
    console.log(`[REAL-TIME ROLE AUDIT] Initiating real-time snapshot listener for: ${userId}`);

    if (isDemoModeActive(userId)) {
      // Local Storage profile polling for sandbox demo mode
      const loadProfile = () => {
        const localData = localStorage.getItem(`nexus_demo_profile_${userId}`);
        if (localData) {
          try {
            const profile = JSON.parse(localData);
            setUserProfileState(prev => {
              if (prev && JSON.stringify(prev) === localData) return prev;
              return profile;
            });
          } catch (e) {
            console.error('Error parsing local storage profile:', e);
          }
        } else if (userId === 'sandbox-admin-bola') {
          const defaultAdminProfile = {
            fullName: 'Bola Adeyemi',
            email: 'bola.adeyemi@aurenix-research.org',
            role: 'super_admin',
            country: 'Nigeria',
            institution: 'Aurenix Core Labs',
            bio: 'Lead Bioenergy Systems Researcher & Administrator at Aurenix Core Labs.',
            researchInterests: ['Bioenergy', 'Circular Economy', 'Nuclear Energy'],
            termsAccepted: true,
            verified: true,
            verificationStatus: 'verified'
          };
          localStorage.setItem(`nexus_demo_profile_${userId}`, JSON.stringify(defaultAdminProfile));
          setUserProfileState(defaultAdminProfile);
        }
      };

      loadProfile();
      const interval = setInterval(loadProfile, 1000);
      return () => clearInterval(interval);
    }

    // Real Firebase Firestore onSnapshot listener for online users
    try {
      const docRef = doc(db, 'users', userId);
      const unsubscribeSnap = onSnapshot(docRef, (docSnap) => {
        const isLocalCompleted = typeof window !== 'undefined' && localStorage.getItem(`onboarding_completed_${userId}`) === 'true';

        if (docSnap.exists()) {
          const profileData = { id: docSnap.id, ...docSnap.data() } as any;
          console.log(`[REAL-TIME ROLE AUDIT] Role loaded from Firestore for ${userId}: "${profileData?.role}"`);
          
          const isCompleted = 
            profileData.onboardingCompleted === true || 
            profileData.needsOnboarding === false || 
            (Boolean(profileData.role) && Boolean(profileData.country)) || 
            isLocalCompleted;

          if (isCompleted) {
            profileData.needsOnboarding = false;
            profileData.onboardingCompleted = true;
            setNeedsOnboarding(false);
          }
          setUserProfileState(profileData);
        } else {
          console.warn(`[REAL-TIME ROLE AUDIT] No Firestore document found for user: ${userId}`);
          const currentUser = auth.currentUser;
          const localProfileStr = typeof window !== 'undefined' ? localStorage.getItem(`nexus_demo_profile_${userId}`) : null;
          
          if (isLocalCompleted || localProfileStr) {
            let localProf: any = {};
            try { if (localProfileStr) localProf = JSON.parse(localProfileStr); } catch {}
            setUserProfileState({
              id: userId,
              needsOnboarding: false,
              onboardingCompleted: true,
              fullName: currentUser?.displayName || localProf.fullName || 'Google Scholar',
              email: currentUser?.email || localProf.email || '',
              role: localProf.role || 'Researcher',
              country: localProf.country || 'Nigeria',
              institution: localProf.institution || '',
              researchInterests: localProf.researchInterests || [],
              termsAccepted: true,
              ...localProf
            });
            setNeedsOnboarding(false);
          } else if (currentUser && currentUser.uid === userId && !currentUser.isAnonymous) {
            const transientProfile = {
              id: userId,
              needsOnboarding: true,
              onboardingCompleted: false,
              fullName: currentUser.displayName || 'Google Scholar',
              email: currentUser.email || '',
              role: '',
              country: '',
              institution: '',
              researchInterests: [],
              termsAccepted: false
            };
            console.log(`[REAL-TIME ROLE AUDIT] Constructing transient profile for onboarding: "${transientProfile.role}"`);
            setUserProfileState(transientProfile);
            setNeedsOnboarding(true);
          }
        }
      }, (error) => {
        if (isOfflineError(error)) {
          setFirestoreOffline(true);
          console.warn(`[REAL-TIME ROLE AUDIT] Firestore connection offline, operating in local sandbox/demo mode.`);
        } else {
          console.error(`[REAL-TIME ROLE AUDIT] error onSnapshot:`, error);
        }
      });

      const handleProfileUpdated = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && customEvent.detail.userId === userId) {
          const prof = customEvent.detail.profile;
          if (prof && (prof.onboardingCompleted || prof.needsOnboarding === false || (prof.role && prof.country))) {
            setNeedsOnboarding(false);
          }
          setUserProfileState(prof);
        }
      };
      window.addEventListener('user-profile-updated', handleProfileUpdated as EventListener);

      return () => {
        if (unsubscribeSnap) unsubscribeSnap();
        window.removeEventListener('user-profile-updated', handleProfileUpdated as EventListener);
      };
    } catch (err) {
      console.error(`[REAL-TIME ROLE AUDIT] Error setting up Firestore listener:`, err);
    }
  }, [user]);

  // Temporary logging to trace role stored in application state
  useEffect(() => {
    console.log(`[REAL-TIME ROLE AUDIT] Role stored in application state (userProfile): "${userProfile?.role}"`);
  }, [userProfile]);

  // Admin Route Guard check and access restriction
  useEffect(() => {
    if (authLoading) return;
    if (currentView === 'admin') {
      const isUserPlatformAdmin = 
        userProfile?.role?.toLowerCase() === 'admin' ||
        userProfile?.role?.toLowerCase() === 'super_admin' ||
        user?.uid === 'sandbox-admin-bola' ||
        user?.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' ||
        user?.email?.toLowerCase() === 'adeyemibola2569@gmail.com' ||
        userProfile?.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' ||
        userProfile?.email?.toLowerCase() === 'adeyemibola2569@gmail.com';
      
      console.log(`[REAL-TIME ROLE AUDIT] Route guard role check - currentView: "${currentView}", role: "${userProfile?.role}", authorized: ${isUserPlatformAdmin}`);

      if (!isUserPlatformAdmin) {
        console.warn(`[REAL-TIME ROLE AUDIT] Route guard access restriction triggered! Redirecting user to dashboard.`);
        setView(user ? 'dashboard' : 'home');
      }
    }
  }, [currentView, userProfile, user, authLoading]);

  // Protected User Routes guard check
  useEffect(() => {
    if (authLoading) return;
    const protectedViews = ['dashboard', 'profile', 'settings', 'messages', 'notifications'];
    if (protectedViews.includes(currentView)) {
      if (!user) {
        console.warn(`[ROUTE GUARD] Unauthenticated attempt to access protected route "${currentView}". Redirecting to home.`);
        setView('home');
      } else {
        const isCompleted = 
          userProfile?.onboardingCompleted === true || 
          userProfile?.needsOnboarding === false || 
          (Boolean(userProfile?.role) && Boolean(userProfile?.country)) ||
          (typeof window !== 'undefined' && localStorage.getItem(`onboarding_completed_${user.uid}`) === 'true');

        if (!isCompleted && needsOnboarding) {
          console.warn(`[ROUTE GUARD] User has not completed onboarding. Redirecting to onboarding questions.`);
          setView('onboarding');
        }
      }
    }
  }, [currentView, user, authLoading, needsOnboarding, userProfile]);

  // Home Page Guard check: Signed-in users are directed to dashboard or onboarding
  useEffect(() => {
    if (authLoading) return;
    if (user && currentView === 'home') {
      const isCompleted = 
        userProfile?.onboardingCompleted === true || 
        userProfile?.needsOnboarding === false || 
        (Boolean(userProfile?.role) && Boolean(userProfile?.country)) ||
        (typeof window !== 'undefined' && localStorage.getItem(`onboarding_completed_${user.uid}`) === 'true');

      if (!isCompleted && needsOnboarding) {
        console.log(`[ROUTE GUARD] Signed-in user directed to onboarding from home route.`);
        setView('onboarding');
      } else {
        console.log(`[ROUTE GUARD] Signed-in user directed to dashboard from home route.`);
        setView('dashboard');
      }
    }
  }, [currentView, user, authLoading, needsOnboarding, userProfile]);

  // Sync user info
  const refreshAllUserData = async (userId: string) => {
    try {
      const [savedIds, inquiries, partnerships, profile] = await Promise.all([
        getSavedPaperIds(userId),
        getUserInquiries(userId),
        getUserPartnerships(userId),
        getUserProfile(userId)
      ]);
      setSavedPaperIds(savedIds || []);
      setActiveInquiries(inquiries || []);
      setActivePartnerships(partnerships || []);
      setUserProfileState(profile || null);

      const isLocalCompleted = typeof window !== 'undefined' && localStorage.getItem(`onboarding_completed_${userId}`) === 'true';
      const userNeedsOnboarding = Boolean(
        (!profile && !isLocalCompleted) || 
        (profile?.needsOnboarding === true && !isLocalCompleted) || 
        (!profile?.role && !profile?.country && !isLocalCompleted && profile?.onboardingCompleted !== true)
      );

      if (userNeedsOnboarding) {
        setNeedsOnboarding(true);
        setView('onboarding');
      } else {
        setNeedsOnboarding(false);
        // Do not force route to dashboard if current view is already 'admin'
        const prevView = routeState.view;
        setView(prevView === 'admin' ? 'admin' : ((prevView === 'onboarding' || prevView === 'signin' || prevView === 'home' || prevView === 'initializing') ? 'dashboard' : prevView));
      }
    } catch (err) {
      console.error('Error synchronizing Firestore user data:', err);
    }
  };

  const handleRefreshAll = async () => {
    if (user) {
      await refreshAllUserData(user.uid);
    }
  };

  // Google Authentication handler
  const handleSignIn = async () => {
    try {
      setAuthError(null);
      localStorage.removeItem('nexus_demo_mode');
      localStorage.removeItem('nexus_demo_user');
      let res;
      try {
        res = await signInWithPopup(auth, googleProvider);
      } catch (firstErr: any) {
        if (browserPopupRedirectResolver) {
          res = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
        } else {
          throw firstErr;
        }
      }
      if (res && res.user) {
        setUser(res.user);
        await refreshAllUserData(res.user.uid);
      }
    } catch (err: any) {
      console.warn('Google Sign-In failed or was restricted:', err);
      const errStr = String(err);
      const errCode = err?.code || '';

      if (errCode === 'auth/popup-blocked' || errStr.includes('popup-blocked')) {
        setAuthError('popup-blocked');
      } else if (
        errCode === 'auth/popup-closed-by-user' || 
        errCode === 'auth/cancelled-popup-request' ||
        errStr.includes('popup-closed-by-user') ||
        errStr.includes('cancelled-popup-request')
      ) {
        setAuthError('popup-closed');
      } else if (errCode === 'auth/unauthorized-domain' || errStr.includes('unauthorized-domain')) {
        setAuthError('unauthorized-domain');
      } else {
        setAuthError(err?.message || errStr);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('nexus_demo_mode');
      localStorage.removeItem('nexus_demo_user');
      localStorage.removeItem('nexus_last_active_timestamp');
      await signOut(auth);
      setUser(null);
      setUserProfileState(null);
      setView('home');
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  // Page selection helper
  const handlePageSelect = (viewId: string) => {
    setView(viewId as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col justify-between" id="app_root">
      
      {/* Collapsible Floating Aside Section (visible when logged in) */}
      {user && currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'onboarding' && currentView !== 'admin' && (
        <FloatingAside 
          user={user}
          userProfile={userProfile}
          currentView={currentView}
          setView={setView}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onSignOut={handleSignOut}
          theme={theme}
          onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        />
      )}

      {/* Main layout container */}
      <motion.div
        animate={{ 
          paddingLeft: user && currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'onboarding' && currentView !== 'admin'
            ? (isMobile ? '0px' : (isCollapsed ? '80px' : '280px'))
            : '0px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`flex-grow flex flex-col ${
          currentView === 'ai-assistant'
            ? 'h-[100dvh] max-h-[100dvh] overflow-hidden'
            : 'justify-between min-h-screen'
        } w-full`}
        id="app_layout_wrapper"
      >
        {/* Dynamic Navigation */}
        {currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'onboarding' && currentView !== 'admin' && (
          <>
            <Navbar 
              user={user}
              userProfile={userProfile}
              onSignIn={() => setView('signin')}
              onSignOut={handleSignOut}
              currentView={currentView}
              setView={setView}
              theme={theme}
              onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            />
            {user && (
              <AnnouncementBar 
                user={user}
                userProfile={userProfile}
                currentView={currentView}
                setView={setView}
              />
            )}
          </>
        )}

        {/* Main Container */}
        <main className={`flex-grow ${currentView === 'ai-assistant' ? 'flex-1 h-full min-h-0 overflow-hidden flex flex-col' : 'min-h-[85vh]'}`}>
          <ErrorBoundary>
            <Suspense fallback={<ViewLoadingFallback />}>
          {/* Bypassing AnimatePresence prevents the fatal React 19 "Expected static flag was missing" reconciler assertion crash while preserving mounting fade-ins */}
          {currentView === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0 }}
            >
              <SeoManager
                title="Aurenix Research | Africa's Research & Innovation Platform"
                description="Aurenix is Africa's research and innovation platform dedicated to advancing energy, climate, and technology solutions. We connect students, researchers, institutions, and global stakeholders to document research, foster collaboration, and transform innovative ideas into real-world impact."
                keywords={['energy climate technology solutions Africa', 'African research platform', 'scholarly collaboration Africa', 'bioenergy research', 'waste-to-energy Africa', 'circular economy research', 'Aurenix Research']}
                canonicalUrl="https://aurenix-research.org/"
              />
              <Hero 
                onExploreResearch={() => setView('research')}
                onRequestConsulting={() => setView('services')}
                onSignIn={() => setView('signin')}
                user={user}
              />
                
                {/* Dedicated Hub Ecosystem section on the Home page */}
                <section className="py-20 bg-white" id="ecosystem_overview">
                  <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Our Hub Ecosystem
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                        Explore Our Operational Areas
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto px-2 sm:px-0">
                        We bridge the gap between scientific feasibility and industrial-scale implementation to support sustainable energy deployment across Africa.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* About Us Card */}
                      <motion.div 
                        whileHover={{ y: -6 }}
                        className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between text-left group"
                      >
                        <div className="space-y-4">
                          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                            <Leaf className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 font-display">Who We Are</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Learn about our founding mission, local energy sovereignty dedication, and our lead environmental and chemical researchers.
                          </p>
                        </div>
                        <button 
                          onClick={() => handlePageSelect('about')}
                          className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                        >
                          Learn About Us &rarr;
                        </button>
                      </motion.div>

                      {/* Research Card */}
                      <motion.div 
                        whileHover={{ y: -6 }}
                        className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between text-left group"
                      >
                        <div className="space-y-4">
                          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 font-display">Research Hub</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Access our complete repository of verified technical studies, anaerobic digester blueprints, and regional biomass catalogs.
                          </p>
                        </div>
                        <button 
                          onClick={() => handlePageSelect('research')}
                          className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                        >
                          Access Research &rarr;
                        </button>
                      </motion.div>

                      {/* Services Card */}
                      <motion.div 
                        whileHover={{ y: -6 }}
                        className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between text-left group"
                      >
                        <div className="space-y-4">
                          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                            <HeartHandshake className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 font-display">Technical Services</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Submit organic resource inquiries and request specialized feasibility reviews for commercial biodigester setups.
                          </p>
                        </div>
                        <button 
                          onClick={() => handlePageSelect('services')}
                          className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                        >
                          Request Advisory &rarr;
                        </button>
                      </motion.div>

                      {/* Collaborations Card */}
                      <motion.div 
                        whileHover={{ y: -6 }}
                        className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between text-left group"
                      >
                        <div className="space-y-4">
                          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                            <Users className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 font-display">Collaborations</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Partner with our team for active field deployments, governmental training modules, and joint waste audits.
                          </p>
                        </div>
                        <button 
                          onClick={() => handlePageSelect('collaboration')}
                          className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                        >
                          Explore Network &rarr;
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </section>

                {/* Real-World Pilot Projects (Social Proof of Deployments) */}
                <FeaturedPilots />

                {/* Trusted By Leaders Showcase Banner */}
                <TrustedLeadersBanner />

                {/* Scientific & Stakeholder Endorsements + FAQ Testimonials */}
                <TestimonialsSection />
              </motion.div>
            )}

            {currentView === 'about' && (
              <motion.div
                key="about-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="About Us — Energy Research & Climate Innovation Hub | Aurenix"
                  description="Learn about Aurenix's mission to bridge clean energy technology research, academic rigor, and industrial deployment across Sub-Saharan Africa and global markets."
                  canonicalUrl="https://aurenix-research.org/about"
                />
                {/* Dedicated About Header Banner */}
                <div className="bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden py-24 text-left">
                  {/* Glowing graphic elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl"></div>

                  <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Dedicated Research Hub
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900">
                      About Aurenix <span className="text-emerald-600">Research</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
                      Aurenix is Africa's research and innovation platform dedicated to advancing energy, climate, and technology solutions. We connect students, researchers, institutions, and global stakeholders to document research, foster collaboration, and transform innovative ideas into real-world impact.
                    </p>
                  </div>
                </div>

                <AboutSection />
              </motion.div>
            )}

            {currentView === 'services' && (
              <motion.div
                key="services-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="Technical Advisory & Feasibility Services | Aurenix"
                  description="Custom technical consulting, biomass audits, and bioenergy feasibility analysis for commercial facilities, universities, and utility providers."
                  canonicalUrl="https://aurenix-research.org/services"
                />
                <ConsultationSection 
                  user={user}
                  onSignIn={() => setView('signin')}
                  activeInquiries={activeInquiries}
                  setActiveInquiries={setActiveInquiries}
                />
              </motion.div>
            )}

            {currentView === 'research' && selectedPaperId && (
              <motion.div
                key="research-detail-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                {allPapers.find(p => p.id === selectedPaperId) ? (
                  <>
                    <SeoManager
                      title={`${allPapers.find(p => p.id === selectedPaperId)!.title} | Aurenix Research`}
                      description={allPapers.find(p => p.id === selectedPaperId)!.abstract}
                      keywords={allPapers.find(p => p.id === selectedPaperId)!.keywords || ['Energy research paper', 'Renewable energy study']}
                      canonicalUrl={`https://aurenix-research.org/research/${selectedPaperId}`}
                      ogType="article"
                      author={allPapers.find(p => p.id === selectedPaperId)!.author}
                      jsonLd={{
                        '@context': 'https://schema.org',
                        '@type': 'ScholarlyArticle',
                        headline: allPapers.find(p => p.id === selectedPaperId)!.title,
                        description: allPapers.find(p => p.id === selectedPaperId)!.abstract,
                        author: { '@type': 'Person', name: allPapers.find(p => p.id === selectedPaperId)!.author },
                        datePublished: allPapers.find(p => p.id === selectedPaperId)!.publishedYear
                      }}
                    />
                    <ResearchDetail 
                      paper={allPapers.find(p => p.id === selectedPaperId)!}
                      onBack={() => {
                        window.history.pushState(null, '', '/research');
                        window.dispatchEvent(new Event('popstate'));
                      }}
                      isSaved={savedPaperIds.includes(selectedPaperId)}
                      onSaveToggle={async () => {
                        if (!user) {
                          setView('signin');
                          return;
                        }
                        const isAlreadySaved = savedPaperIds.includes(selectedPaperId);
                        if (isAlreadySaved) {
                          setSavedPaperIds(prev => prev.filter(id => id !== selectedPaperId));
                          try { await unsavePaper(user.uid, selectedPaperId); } catch (err) { setSavedPaperIds(prev => [...prev, selectedPaperId]); }
                        } else {
                          setSavedPaperIds(prev => [...prev, selectedPaperId]);
                          try { await savePaper(user.uid, selectedPaperId); } catch (err) { setSavedPaperIds(prev => prev.filter(id => id !== selectedPaperId)); }
                        }
                      }}
                      onDownload={async (paper) => {
                        try {
                          const { generateResearchPDF } = await import('./utils/pdfGenerator');
                          await generateResearchPDF(paper);
                        } catch (err) {
                          console.error('Error generating PDF:', err);
                          throw err;
                        }
                      }}
                      user={user}
                      onSignIn={() => setView('signin')}
                    />
                  </>
                ) : (
                  <div className="py-20 text-center space-y-4 max-w-lg mx-auto">
                    <HelpCircle className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
                    <h3 className="text-lg font-bold text-slate-800">Research Paper Not Found</h3>
                    <p className="text-xs text-slate-500">The requested document may have been archived or deleted.</p>
                    <button
                      onClick={() => {
                        window.history.pushState(null, '', '/research');
                        window.dispatchEvent(new Event('popstate'));
                      }}
                      className="px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl"
                    >
                      Back to Research
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {currentView === 'research' && !selectedPaperId && (
              <motion.div
                key="research-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="Research Repository — Peer-Reviewed Energy & Climate Publications | Aurenix"
                  description="Explore open-access peer-reviewed research papers, technical reports, and datasets on bioenergy, waste-to-energy, solar photovoltaics, battery storage, and climate policy."
                  canonicalUrl="https://aurenix-research.org/research"
                />
                <ResearchSection 
                  user={user}
                  userProfile={userProfile}
                  onSignIn={() => setView('signin')}
                  savedPaperIds={savedPaperIds}
                  setSavedPaperIds={setSavedPaperIds}
                  onNavigateToProfile={() => setView('profile')}
                />
              </motion.div>
            )}

            {currentView === 'researchers' && (
              <motion.div
                key="researchers-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="Explore Researchers & Energy Scientists | Aurenix Network"
                  description="Connect with leading academic researchers, energy engineers, and climate scientists across African universities and international research centers."
                  canonicalUrl="https://aurenix-research.org/researchers"
                />
                <ExploreResearchers 
                  user={user}
                  onSignIn={() => setView('signin')}
                  selectedResearcherId={selectedResearcherId}
                  onSelectResearcherId={(id) => {
                    if (id) {
                      window.history.pushState(null, '', `/researchers/${id}`);
                    } else {
                      window.history.pushState(null, '', '/researchers');
                    }
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  onNavigateToMessages={(targetUid) => {
                    navigateTo(`/messages/${targetUid}`);
                  }}
                  onNavigateToProfile={() => setView('profile')}
                />
              </motion.div>
            )}

            {currentView === 'collaboration' && selectedAllianceId && (
              <motion.div
                key="alliance-details-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="Research Alliance Details | Aurenix Network"
                  description="View collaborative research opportunity details, participating institutions, eligibility, and grant guidelines."
                  canonicalUrl={`https://aurenix-research.org/alliances/${selectedAllianceId}`}
                />
                <AllianceDetailsPage 
                  allianceId={selectedAllianceId}
                  user={user}
                  onBack={() => {
                    window.history.pushState(null, '', '/collaboration');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  onSignIn={() => setView('signin')}
                  onSuccess={() => {}}
                />
              </motion.div>
            )}

            {currentView === 'collaboration' && !selectedAllianceId && (
              <motion.div
                key="collaboration-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="Collaboration Network & Research Alliances | Aurenix"
                  description="Discover collaborative research alliances, joint university-industry projects, funding calls, and innovation challenges in renewable energy."
                  canonicalUrl="https://aurenix-research.org/collaboration"
                />
                <CollaborationSection 
                  user={user}
                  onSignIn={() => setView('signin')}
                  onNavigateToConsole={() => setView('console')}
                />
              </motion.div>
            )}

            {currentView === 'console' && (
              <motion.div
                key="operational-console-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager noIndex={true} />
                <OperationalConsole 
                  user={user}
                  onSignIn={() => setView('signin')}
                />
              </motion.div>
            )}

            {currentView === 'contact' && (
              <motion.div
                key="contact-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="Contact Aurenix Research — Connect with Lead Analysts"
                  description="Get in touch with Aurenix lead energy analysts, research program coordinators, and technical advisory teams."
                  canonicalUrl="https://aurenix-research.org/contact"
                />
                {/* Dedicated Contact Header Banner */}
                <div className="bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden py-24 text-left font-sans">
                  {/* Glowing graphic elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl"></div>

                  <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Connect with Us
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900">
                      Contact <span className="text-emerald-600">Aurenix Research</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
                      Have questions about our peer-reviewed research, specialized feasibility studies, or operations training? Get in touch with our lead analysts.
                    </p>
                  </div>
                </div>

                <ContactSection />
              </motion.div>
            )}

            {currentView === 'dashboard' && selectedProjectId && (
              <motion.div
                key="project-details-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <ProjectDetailsPage 
                  projectId={selectedProjectId}
                  user={user || (DEMO_GUEST_USER as any)}
                  onBack={() => {
                    window.history.pushState(null, '', '/dashboard');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  projects={dbProjects}
                  onUpdateProject={handleUpdateProjectInApp}
                />
              </motion.div>
            )}

            {currentView === 'dashboard' && !selectedProjectId && (
              <motion.div
                key="dashboard-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                {((['Institution', 'Industry', 'Government', 'Government Agency', 'NGO', 'Other'].includes(userProfile?.userRole || userProfile?.role || '')) || !!userProfile?.isOrganization || !!userProfile?.organizationType || userProfile?.accountType === 'institution') ? (
                  <OrganizationDashboard 
                    user={user || (DEMO_GUEST_USER as any)}
                    userProfile={userProfile}
                    onRefreshAll={handleRefreshAll}
                    onNavigateToView={setView}
                    onNavigateToProfile={() => setView('profile')}
                    onNavigateToSettings={() => setView('settings')}
                  />
                ) : (
                  <UserDashboard 
                    user={user || (DEMO_GUEST_USER as any)}
                    onBackToLanding={() => setView('research')}
                    activeInquiries={activeInquiries}
                    activePartnerships={activePartnerships}
                    onRefreshAll={handleRefreshAll}
                    onNavigateToProfile={() => setView('profile')}
                    onNavigateToSettings={() => setView('settings')}
                    onNavigateToView={setView}
                    setSavedPaperIds={setSavedPaperIds}
                  />
                )}
              </motion.div>
            )}

            {currentView === 'profile' && (
              <motion.div
                key="profile-page"
                initial={{ opacity: 0.96, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ProfilePage 
                  user={user || (DEMO_GUEST_USER as any)}
                  onNavigateToView={setView}
                  theme={theme}
                  initialProfile={userProfile}
                />
              </motion.div>
            )}

            {currentView === 'settings' && (
              <motion.div
                key="settings-page"
                initial={{ opacity: 0.96, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SettingsPage 
                  user={user || (DEMO_GUEST_USER as any)}
                  onNavigateToView={setView}
                  theme={theme}
                  onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                  initialProfile={userProfile}
                />
              </motion.div>
            )}

            {currentView === 'messages' && (
              <motion.div
                key="messages-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <MessagesPage 
                  user={user || (DEMO_GUEST_USER as any)}
                  userProfile={userProfile}
                  theme={theme}
                  initialTargetUserId={selectedResearcherId}
                  onNavigateToProfile={(uid) => {
                    navigateTo(`/researchers/${uid}`);
                  }}
                  onNavigateToView={setView}
                />
              </motion.div>
            )}

            {currentView === 'notifications' && (
              <motion.div
                key="notifications-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <NotificationsPage 
                  user={user}
                  onNavigateToView={setView}
                  theme={theme}
                />
              </motion.div>
            )}

            {currentView === 'community' && (
              <motion.div
                key="community-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="Scholar Community Feed | Aurenix Network"
                  description="Share and discuss peer research updates on bioenergy, climate tech, and solar photovoltaics with scientists worldwide."
                  canonicalUrl="https://aurenix-research.org/community"
                />
                <CommunityPage 
                  user={user}
                  userProfile={userProfile}
                />
              </motion.div>
            )}

            {currentView === 'saved' && (
              <motion.div
                key="saved-studies-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SavedStudiesPage 
                  user={user}
                  onSignIn={() => setView('signin')}
                  savedPaperIds={savedPaperIds}
                  setSavedPaperIds={setSavedPaperIds}
                  onGoToResearch={() => setView('research')}
                />
              </motion.div>
            )}
            {currentView === 'signin' && (
              <motion.div
                key="signin-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SignInPage 
                  onBack={() => {
                    setAuthError(null);
                    setView('home');
                  }}
                  authError={authError}
                  setAuthError={setAuthError}
                  onSuccess={(authenticatedUser) => {
                    const isSandbox = authenticatedUser?.uid?.startsWith('sandbox-') || authenticatedUser?.uid === 'sandbox-guest-user';
                    if (isSandbox) {
                      localStorage.setItem('nexus_demo_mode', 'true');
                      localStorage.setItem('nexus_demo_user', JSON.stringify(authenticatedUser));
                    } else {
                      localStorage.removeItem('nexus_demo_mode');
                      localStorage.removeItem('nexus_demo_user');
                    }
                    setUser(authenticatedUser);
                    setView('dashboard');
                  }}
                  onGoogleSignIn={handleSignIn}
                   onGuestSignIn={async (customProfile) => {
                    setAuthError(null);
                    setAuthLoading(true);
                    try {
                      if (!customProfile) {
                        throw new Error('No sandbox profile selected.');
                      }
                      const demoUser = {
                        uid: customProfile.uid,
                        email: customProfile.email,
                        displayName: customProfile.displayName,
                        photoURL: null,
                        isAnonymous: true
                      };
                      localStorage.setItem('nexus_demo_mode', 'true');
                      localStorage.setItem('nexus_demo_user', JSON.stringify(demoUser));
                      setUser(demoUser as any);
                      await refreshAllUserData(demoUser.uid);
                      setView('dashboard');
                    } catch (err: any) {
                      setAuthError(err.message || String(err));
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                />
              </motion.div>
            )}

            {currentView === 'onboarding' && user && (
              <motion.div
                key="onboarding-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <OnboardingPage 
                  user={user}
                  onComplete={async () => {
                    setNeedsOnboarding(false);
                    try {
                      localStorage.setItem(`onboarding_completed_${user.uid}`, 'true');
                      if (user.email) {
                        localStorage.setItem(`onboarding_completed_${user.email.toLowerCase()}`, 'true');
                      }
                    } catch {}
                    await refreshAllUserData(user.uid);
                    setView('dashboard');
                  }}
                  onSignOut={handleSignOut}
                />
              </motion.div>
            )}

            {currentView === 'insights' && (
              <motion.div
                key="insights-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <InsightsHub 
                  selectedSlug={selectedInsightSlug}
                  onNavigateToArticle={(slug) => {
                    if (slug) {
                      navigateTo(`/insights/${slug}`);
                    } else {
                      navigateTo('/insights');
                    }
                  }}
                  onNavigateToResearchArea={(areaSlug) => navigateTo(`/research-areas/${areaSlug}`)}
                  onNavigateToPaper={(paperId) => navigateTo(`/research/${paperId}`)}
                  onNavigateHome={() => setView('home')}
                />
              </motion.div>
            )}

            {currentView === 'research-areas' && (
              <motion.div
                key="research-areas-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <ResearchAreasPage 
                  selectedSlug={selectedAreaSlug}
                  onNavigateToArea={(slug) => {
                    if (slug) {
                      navigateTo(`/research-areas/${slug}`);
                    } else {
                      navigateTo('/research-areas');
                    }
                  }}
                  onNavigateToPaper={(paperId) => navigateTo(`/research/${paperId}`)}
                  onNavigateToArticle={(slug) => navigateTo(`/insights/${slug}`)}
                  onNavigateHome={() => setView('home')}
                />
              </motion.div>
            )}

            {currentView === 'legal' && (
              <motion.div
                key="legal-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager
                  title="Legal & Platform Compliance Center — Aurenix Research"
                  description="Aurenix Research legal policies, Terms and Conditions, Privacy Policy, Cookie Policy, Research Ethics, and IP guidelines."
                  canonicalUrl="https://aurenix-research.org/legal"
                />
                <LegalLayout 
                  initialPolicyId={(routeState as any).policyId || 'terms'}
                  onNavigateHome={() => setView(user ? 'dashboard' : 'home')}
                  currentUser={user || (DEMO_GUEST_USER as any)}
                />
              </motion.div>
            )}

            {currentView === 'notfound' && (
              <motion.div
                key="notfound-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <NotFoundPage onNavigate={setView} />
              </motion.div>
            )}

            {currentView === 'ai-assistant' && (
              <motion.div
                key="ai-assistant-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
                className="w-full h-full flex-1 flex flex-col overflow-hidden min-h-0"
              >
                <SeoManager
                  title="Aurenix Research Intelligence & AI Support — Paper Summarizer & Brainstorming"
                  description="Interactive Gemini-powered research intelligence assistant. Summarize research PDFs, analyze experimental data, generate novel research proposals, and get platform support."
                  canonicalUrl="https://aurenix-research.org/ai-assistant"
                />
                <ResearchAiAssistant 
                  user={user || (DEMO_GUEST_USER as any)}
                  userProfile={userProfile}
                  onNavigateToView={setView}
                  onClose={() => setView(user ? 'dashboard' : 'home')}
                />
              </motion.div>
            )}

            {currentView === 'admin' && (
              <motion.div
                key="admin-page"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
              >
                <SeoManager noIndex={true} />
                <AdminPortal 
                  user={user}
                  userProfile={userProfile}
                  setView={setView}
                  theme={theme}
                  onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                />
              </motion.div>
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

        {/* Footer */}
        {!user && currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'onboarding' && currentView !== 'admin' && currentView !== 'ai-assistant' && <Footer onNavClick={handlePageSelect} />}
      </motion.div>

      {/* Global Cookie Consent System */}
      <CookieConsent />

      {/* Global Floating AI Research & Support Assistant */}
      <FloatingAiWidget 
        user={user}
        userProfile={userProfile}
        currentView={currentView}
        onNavigateToView={setView}
      />

    </div>
  );
}
