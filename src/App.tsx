import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getSavedPaperIds, getUserInquiries, getUserPartnerships, getUserProfile, isDemoModeActive, getCustomPapers, getInnovationProjects, updateInnovationProject, savePaper, unsavePaper } from './services/db';
import { ConsultationInquiry, PartnershipSubmission, ResearchPaper } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, Sparkles, X, UserCheck, KeyRound, HelpCircle, BookOpen, Users, HeartHandshake, Leaf, Award, Quote, Building, CheckCircle2, FlaskConical } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import SignInPage from './components/SignInPage';
import OnboardingPage from './components/OnboardingPage';
import FloatingAside from './components/FloatingAside';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ResearchSection from './components/ResearchSection';
import ResearchDetail from './components/ResearchDetail';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import AllianceDetailsPage from './components/AllianceDetailsPage';
import SavedStudiesPage from './components/SavedStudiesPage';
import ConsultationSection from './components/ConsultationSection';
import CollaborationSection from './components/CollaborationSection';
import ContactSection from './components/ContactSection';
import UserDashboard from './components/UserDashboard';
import Footer from './components/Footer';
import SystemBootLoader from './components/SystemBootLoader';
import ExploreResearchers from './components/ExploreResearchers';
import OperationalConsole from './components/collaboration/OperationalConsole';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import AdminPortal from './components/admin/AdminPortal';
import CookieConsent from './components/CookieConsent';
import MessagesPage from './components/MessagesPage';
import NotificationsPage from './components/NotificationsPage';
import SeoManager from './components/seo/SeoManager';
import InsightsHub from './components/InsightsHub';
import ResearchAreasPage from './components/ResearchAreasPage';
import NotFoundPage from './components/NotFoundPage';
import { RESEARCH_PAPERS } from './data';
import { generateResearchPDF } from './utils/pdfGenerator';

function parseUrl() {
  if (typeof window === 'undefined') {
    return { view: 'initializing' as const, researcherId: null as string | null, paperId: null as string | null, projectId: null as string | null, allianceId: null as string | null, insightSlug: null as string | null, areaSlug: null as string | null };
  }
  
  const isInitialized = sessionStorage.getItem('nexus_system_initialized') === 'true';
  if (!isInitialized) {
    return { view: 'initializing' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }
  
  const path = window.location.pathname;
  
  // 1. /researchers/:researcherId
  let match = path.match(/^\/researchers\/([^/]+)$/);
  if (match) {
    return { view: 'researchers' as const, researcherId: match[1], paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }
  
  // 2. /researchers
  if (path === '/researchers') {
    return { view: 'researchers' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }
  
  // 3. /research/:paperId
  match = path.match(/^\/research\/([^/]+)$/);
  if (match) {
    return { view: 'research' as const, researcherId: null, paperId: match[1], projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }
  
  // 4. /research
  if (path === '/research') {
    return { view: 'research' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }

  // 5. /projects/:projectId
  match = path.match(/^\/projects\/([^/]+)$/);
  if (match) {
    return { view: 'dashboard' as const, researcherId: null, paperId: null, projectId: match[1], allianceId: null, insightSlug: null, areaSlug: null };
  }

  // 6. /alliances/:allianceId
  match = path.match(/^\/alliances\/([^/]+)$/);
  if (match) {
    return { view: 'collaboration' as const, researcherId: null, paperId: null, projectId: null, allianceId: match[1], insightSlug: null, areaSlug: null };
  }

  // 7. /messages/:targetUserId
  match = path.match(/^\/messages\/([^/]+)$/);
  if (match) {
    return { view: 'messages' as const, researcherId: match[1], paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }

  // 8. /insights/:slug
  match = path.match(/^\/insights\/([^/]+)$/);
  if (match) {
    return { view: 'insights' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: match[1], areaSlug: null };
  }
  if (path === '/insights') {
    return { view: 'insights' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }

  // 9. /research-areas/:areaSlug
  match = path.match(/^\/research-areas\/([^/]+)$/);
  if (match) {
    return { view: 'research-areas' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: match[1] };
  }
  if (path === '/research-areas') {
    return { view: 'research-areas' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }

  // Root homepage
  if (path === '/' || path === '') {
    return { view: 'home' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }

  // Standard views
  const views = ['about', 'services', 'collaboration', 'dashboard', 'contact', 'saved', 'signin', 'initializing', 'console', 'profile', 'settings', 'onboarding', 'admin', 'messages', 'notifications', 'insights', 'research-areas'];
  const viewName = path.substring(1);
  if (views.includes(viewName)) {
    return { view: viewName as any, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
  }
  
  return { view: 'notfound' as const, researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null };
}

export default function App() {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Routing State Manager
  const [routeState, setRouteState] = useState(() => parseUrl());
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
    setRouteState(parseUrl());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setView = (view: string) => {
    let effectiveView = view;
    if (effectiveView === 'home' && user) {
      effectiveView = 'dashboard';
    }

    if (effectiveView === 'initializing') {
      setRouteState({ view: 'initializing', researcherId: null, paperId: null, projectId: null, allianceId: null, insightSlug: null, areaSlug: null });
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
      'research-areas': '/research-areas'
    };

    const currentPath = window.location.pathname;
    const isCurrentSubpathOfView = (effectiveView === 'research' && currentPath.startsWith('/research/')) ||
                                   (effectiveView === 'researchers' && currentPath.startsWith('/researchers/')) ||
                                   (effectiveView === 'dashboard' && currentPath.startsWith('/projects/')) ||
                                   (effectiveView === 'collaboration' && currentPath.startsWith('/alliances/')) ||
                                   (effectiveView === 'insights' && currentPath.startsWith('/insights/')) ||
                                   (effectiveView === 'research-areas' && currentPath.startsWith('/research-areas/'));

    if (isCurrentSubpathOfView) {
      navigateTo(currentPath);
    } else {
      navigateTo(pathMap[effectiveView] || '/');
    }
  };

  // Ensure logged-in users visiting root '/' or 'home' are directed to the user dashboard
  useEffect(() => {
    if (user && routeState.view === 'home' && !authLoading) {
      window.history.replaceState(null, '', '/dashboard');
      setRouteState(parseUrl());
    }
  }, [user, routeState.view, authLoading]);

  useEffect(() => {
    const handlePopState = () => {
      setRouteState(parseUrl());
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
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load custom papers & user projects on load / auth state changes
  useEffect(() => {
    async function loadAllPapersAndProjects() {
      try {
        const custom = await getCustomPapers();
        setAllPapers([...RESEARCH_PAPERS, ...custom]);
      } catch (err) {
        console.error('Error loading papers:', err);
        setAllPapers(RESEARCH_PAPERS);
      }
      
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
    loadAllPapersAndProjects();
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const handleAuthChange = async () => {
        if (currentUser) {
          // Real authenticated Firebase user is present (e.g. Google Sign-In)
          // We MUST clear any cached sandbox/guest demo mode and use the real user details.
          localStorage.removeItem('nexus_demo_mode');
          localStorage.removeItem('nexus_demo_user');
          
          setUser(currentUser);
          setAuthLoading(false);
          await refreshAllUserData(currentUser.uid);
          if (sessionStorage.getItem('nexus_system_initialized') !== 'true') {
            setView('initializing');
          }
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
                setUser(null);
                setAuthLoading(false);
                setView('home');
                return;
              }
              setUser(demoObj);
              setAuthLoading(false);
              await refreshAllUserData(demoObj.uid);
              if (sessionStorage.getItem('nexus_system_initialized') !== 'true') {
                setView('initializing');
              }
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
        // Keep the view intact unless we're on dashboard (which requires login)
        const prevView = routeState.view;
        setView(prevView === 'dashboard' || prevView === 'onboarding' ? 'home' : prevView);
      };

      handleAuthChange();
    });
    return () => unsubscribe();
  }, []);

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
            console.log(`[REAL-TIME ROLE AUDIT] Role loaded from LocalStorage (Demo Mode): "${profile?.role}"`);
            setUserProfileState(profile);
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
        if (docSnap.exists()) {
          const profileData = { id: docSnap.id, ...docSnap.data() } as any;
          console.log(`[REAL-TIME ROLE AUDIT] Role loaded from Firestore for ${userId}: "${profileData?.role}"`);
          setUserProfileState(profileData);
        } else {
          console.warn(`[REAL-TIME ROLE AUDIT] No Firestore document found for user: ${userId}`);
          // If no doc exists but user is authenticated, construct a default onboarding/transient profile
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.uid === userId && !currentUser.isAnonymous) {
            const transientProfile = {
              id: userId,
              needsOnboarding: true,
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
          }
        }
      }, (error) => {
        console.error(`[REAL-TIME ROLE AUDIT] error onSnapshot:`, error);
      });

      return () => unsubscribeSnap();
    } catch (err) {
      console.error(`[REAL-TIME ROLE AUDIT] Error setting up Firestore listener:`, err);
    }
  }, [user]);

  // Temporary logging to trace role stored in application state
  useEffect(() => {
    console.log(`[REAL-TIME ROLE AUDIT] Role stored in application state (userProfile): "${userProfile?.role}"`);
  }, [userProfile]);

  // Route Guard check and access restriction
  useEffect(() => {
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
        setView('dashboard');
      }
    }
  }, [currentView, userProfile, user]);

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

      if (profile && profile.needsOnboarding) {
        setNeedsOnboarding(true);
        if (sessionStorage.getItem('nexus_system_initialized') === 'true') {
          setView('onboarding');
        }
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
      await signInWithPopup(auth, googleProvider);
      if (sessionStorage.getItem('nexus_system_initialized') !== 'true') {
        setView('initializing');
      } else {
        setView('dashboard');
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
      } else {
        setAuthError(err?.message || errStr);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('nexus_demo_mode');
      localStorage.removeItem('nexus_demo_user');
      sessionStorage.removeItem('nexus_system_initialized');
      await signOut(auth);
      setUser(null);
      setView('about');
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
      
      {/* Collapsible Floating Aside Section */}
      {currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'onboarding' && currentView !== 'admin' && (
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

      {/* Main layout container with animated padding-left for the side menu */}
      <motion.div
        animate={{ 
          paddingLeft: (user && !isMobile && currentView !== 'onboarding' && currentView !== 'admin') ? (isCollapsed ? '94px' : '280px') : '0px'
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="flex-grow flex flex-col justify-between min-h-screen w-full"
        id="app_layout_wrapper"
      >
        {/* Dynamic Navigation */}
        {currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'onboarding' && currentView !== 'admin' && (
          <Navbar 
            user={user}
            onSignIn={() => setView('signin')}
            onSignOut={handleSignOut}
            currentView={currentView}
            setView={setView}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          />
        )}

        {/* Main Container */}
        <main className="flex-grow">
          {/* Bypassing AnimatePresence prevents the fatal React 19 "Expected static flag was missing" reconciler assertion crash while preserving mounting fade-ins */}
          {currentView === 'home' && (
            user ? (
              <motion.div
                key="dashboard-home-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <SeoManager noIndex={true} />
                <UserDashboard 
                  user={user}
                  onBackToLanding={() => setView('home')}
                  activeInquiries={activeInquiries}
                  activePartnerships={activePartnerships}
                  onRefreshAll={handleRefreshAll}
                  onNavigateToProfile={() => setView('profile')}
                  onNavigateToSettings={() => setView('settings')}
                  onNavigateToView={setView}
                  setSavedPaperIds={setSavedPaperIds}
                />
              </motion.div>
            ) : (
              <motion.div
                key="home-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <SeoManager
                  title="Aurenix — Connecting Energy and Climate Research, Innovation, and Global Collaboration"
                  description="Aurenix connects African researchers, universities, students, climate tech leaders, and funding bodies to accelerate renewable energy research, bioenergy, energy storage, and clean technology."
                  keywords={['Energy research', 'Renewable energy', 'Clean energy innovation', 'Climate technology', 'African research', 'Global research collaboration']}
                  canonicalUrl="https://aurenix-research.org/"
                />
                <Hero 
                  onExploreResearch={() => setView('research')}
                  onRequestConsulting={() => setView('services')}
                  onSignIn={() => setView('signin')}
                  user={user}
                />
                
                {/* Dedicated Hub Ecosystem section on the Home page */}
                <section className="py-20 bg-white border-t border-slate-100" id="ecosystem_overview">
                  <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Our Hub Ecosystem
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                        Explore Our Operational Areas
                      </h2>
                      <p className="text-base text-slate-600 leading-relaxed">
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
                <section className="py-20 bg-slate-50 border-t border-slate-100 text-left" id="featured_pilots">
                  <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        Proven Field Deployments
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                        Real-World Bioenergy Impact
                      </h2>
                      <p className="text-base text-slate-600 leading-relaxed">
                        We don't just write papers. Our technical team works on-site at major high-traffic facilities and municipal centers to configure, audit, and optimize bioenergy reactors.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* MMA Airport Pilot */}
                      <motion.div 
                        whileHover={{ y: -6 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-xs flex flex-col justify-between relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                          <Building className="w-32 h-32 text-emerald-900" />
                        </div>
                        <div className="space-y-6 relative z-10">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Operational Pilot
                            </span>
                            <span className="text-xs font-mono text-slate-400">Lagos, Nigeria</span>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 font-display">Murtala Muhammed Airport Biodigester</h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              Configured and optimized the daily feedstock loading and biochemical digestion parameters for localized aviation waste-to-energy conversion, providing clean, secondary electrical and gas backup.
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-4 border-t border-slate-100">
                            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase">Key Project Achievements:</h4>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>100% locally managed bioenergy operational workflow.</span>
                              </li>
                              <li className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Capacity-building programs delivered to technical site engineers.</span>
                              </li>
                              <li className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Successful organic methane yield tuning in tropical conditions.</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>

                      {/* Lagos Waste Feasibility Pilot */}
                      <motion.div 
                        whileHover={{ y: -6 }}
                        className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-xs flex flex-col justify-between relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                          <FlaskConical className="w-32 h-32 text-emerald-900" />
                        </div>
                        <div className="space-y-6 relative z-10">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Analytical Case Study
                            </span>
                            <span className="text-xs font-mono text-slate-400">Metropolitan Lagos</span>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 font-display">Municipal Solid Waste Audit</h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                              Conducted complete chemical assessment of metropolitan Lagos solid waste streams. Assessed biochemical vs thermochemical pathways to structure high-yield investment roadmaps for urban suburbs.
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-4 border-t border-slate-100">
                            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase">Key Project Achievements:</h4>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Published peer-reviewed chemical compositions of local feedstocks.</span>
                              </li>
                              <li className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Quantified exact carbon-offset metrics for regional green funds.</span>
                              </li>
                              <li className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Presented policy benchmarks directly to municipal waste bodies.</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </section>

                {/* Scientific & Stakeholder Endorsements (Social Proof Quotes) */}
                <section className="py-20 bg-white border-t border-slate-100 text-left" id="endorsements">
                  <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                        <Quote className="w-3.5 h-3.5 text-emerald-600" />
                        Ecosystem Endorsements
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
                        What Aligned Stakeholders Say
                      </h2>
                      <p className="text-base text-slate-600 leading-relaxed">
                        Read perspectives from university researchers, clean energy program managers, and regional policy developers who have collaborated with Aurenix Research.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Testimonial 1 */}
                      <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100/80 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="text-emerald-600">
                            <Quote className="w-8 h-8 opacity-40" />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                            "Aurenix Research delivered precise, local chemical and feedstock parameters that resolved our digester overloading issues. Their academic depth combined with physical plant experience is exceptional."
                          </p>
                        </div>
                        <div className="border-t border-slate-200/60 pt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            SA
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Dr. Samuel Adebayo</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Process Chemistry Specialist, UNILAG</p>
                          </div>
                        </div>
                      </div>

                      {/* Testimonial 2 */}
                      <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100/80 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="text-emerald-600">
                            <Quote className="w-8 h-8 opacity-40" />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                            "The airport waste-to-energy feasibility study was remarkably rigorous. It was the first report we reviewed that integrated local supply-chain constraints with practical chemical yield projections."
                          </p>
                        </div>
                        <div className="border-t border-slate-200/60 pt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                            CO
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Engr. Chidi Okafor</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Clean Tech Plant Operations Consultant</p>
                          </div>
                        </div>
                      </div>

                      {/* Testimonial 3 */}
                      <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100/80 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="text-emerald-600">
                            <Quote className="w-8 h-8 opacity-40" />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                            "By training our cooperative waste managers, Aurenix Research built local capacity rather than just delivering templates. They are true champions of indigenous African science."
                          </p>
                        </div>
                        <div className="border-t border-slate-200/60 pt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            FA
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Fatima Alao</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Director, West African Circularity NGO</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )
          )}

            {currentView === 'about' && (
              <motion.div
                key="about-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                      onDownload={(paper) => {
                        try { generateResearchPDF(paper); } catch (err) { console.error('Error generating PDF:', err); }
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <SeoManager
                  title="Research Repository — Peer-Reviewed Energy & Climate Publications | Aurenix"
                  description="Explore open-access peer-reviewed research papers, technical reports, and datasets on bioenergy, waste-to-energy, solar photovoltaics, battery storage, and climate policy."
                  canonicalUrl="https://aurenix-research.org/research"
                />
                <ResearchSection 
                  user={user}
                  onSignIn={() => setView('signin')}
                  savedPaperIds={savedPaperIds}
                  setSavedPaperIds={setSavedPaperIds}
                />
              </motion.div>
            )}

            {currentView === 'researchers' && (
              <motion.div
                key="researchers-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                />
              </motion.div>
            )}

            {currentView === 'collaboration' && selectedAllianceId && (
              <motion.div
                key="alliance-details-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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

            {currentView === 'dashboard' && user && selectedProjectId && (
              <motion.div
                key="project-details-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <ProjectDetailsPage 
                  projectId={selectedProjectId}
                  user={user}
                  onBack={() => {
                    window.history.pushState(null, '', '/dashboard');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  projects={dbProjects}
                  onUpdateProject={handleUpdateProjectInApp}
                />
              </motion.div>
            )}

            {currentView === 'dashboard' && user && !selectedProjectId && (
              <motion.div
                key="dashboard-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <UserDashboard 
                  user={user}
                  onBackToLanding={() => setView('home')}
                  activeInquiries={activeInquiries}
                  activePartnerships={activePartnerships}
                  onRefreshAll={handleRefreshAll}
                  onNavigateToProfile={() => setView('profile')}
                  onNavigateToSettings={() => setView('settings')}
                  onNavigateToView={setView}
                  setSavedPaperIds={setSavedPaperIds}
                />
              </motion.div>
            )}

            {currentView === 'profile' && user && (
              <motion.div
                key="profile-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <ProfilePage 
                  user={user}
                  onNavigateToView={setView}
                  theme={theme}
                />
              </motion.div>
            )}

            {currentView === 'settings' && user && (
              <motion.div
                key="settings-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <SettingsPage 
                  user={user}
                  onNavigateToView={setView}
                  theme={theme}
                  onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                />
              </motion.div>
            )}

            {currentView === 'messages' && user && (
              <motion.div
                key="messages-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <MessagesPage 
                  user={user}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <NotificationsPage 
                  user={user}
                  onNavigateToView={setView}
                  theme={theme}
                />
              </motion.div>
            )}

            {currentView === 'saved' && user && (
              <motion.div
                key="saved-studies-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
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
                    if (sessionStorage.getItem('nexus_system_initialized') !== 'true') {
                      setView('initializing');
                    } else {
                      setView('dashboard');
                    }
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
                      if (sessionStorage.getItem('nexus_system_initialized') !== 'true') {
                        setView('initializing');
                      } else {
                        setView('dashboard');
                      }
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <OnboardingPage 
                  user={user}
                  onComplete={async () => {
                    setNeedsOnboarding(false);
                    await refreshAllUserData(user.uid);
                    setView('dashboard');
                  }}
                  onSignOut={handleSignOut}
                />
              </motion.div>
            )}

            {currentView === 'initializing' && (
              <motion.div
                key="initializing-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SystemBootLoader 
                  user={user}
                  onComplete={() => {
                    sessionStorage.setItem('nexus_system_initialized', 'true');
                    setView(user ? (needsOnboarding ? 'onboarding' : 'dashboard') : 'home');
                  }}
                />
              </motion.div>
            )}

            {currentView === 'insights' && (
              <motion.div
                key="insights-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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

            {currentView === 'notfound' && (
              <motion.div
                key="notfound-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <NotFoundPage onNavigate={setView} />
              </motion.div>
            )}

            {currentView === 'admin' && (
              <motion.div
                key="admin-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
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
        </main>

        {/* Footer */}
        {!user && currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'onboarding' && currentView !== 'admin' && <Footer onNavClick={handlePageSelect} />}
      </motion.div>

      {/* Global Cookie Consent System */}
      <CookieConsent />

    </div>
  );
}
