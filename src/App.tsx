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
import { getSavedPaperIds, getUserInquiries, getUserPartnerships, getUserProfile, isDemoModeActive } from './services/db';
import { ConsultationInquiry, PartnershipSubmission } from './types';
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

export default function App() {
  // Sync sessionStorage for loading animation on fresh load or reload
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('nexus_system_initialized');
  }

  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Layout View: 'home' | 'about' | 'services' | 'research' | 'collaboration' | 'dashboard' | 'contact' | 'saved' | 'signin' | 'initializing' | 'researchers' | 'console' | 'profile' | 'settings' | 'onboarding' | 'admin'
  const [currentView, setView] = useState<'home' | 'about' | 'services' | 'research' | 'collaboration' | 'dashboard' | 'contact' | 'saved' | 'signin' | 'initializing' | 'researchers' | 'console' | 'profile' | 'settings' | 'onboarding' | 'admin'>('initializing');
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

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setView('admin');
    }
  }, []);

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
        setView(prev => prev === 'dashboard' || prev === 'onboarding' ? 'home' : prev);
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
        setView(prev => (prev === 'admin') ? 'admin' : ((prev === 'onboarding' || prev === 'signin' || prev === 'home' || prev === 'initializing') ? 'dashboard' : prev));
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
        {!user && currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'admin' && (
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
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div
                key="home-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <Hero 
                  onExploreResearch={() => setView('research')}
                  onRequestConsulting={() => setView('services')}
                  onSignIn={() => setView('signin')}
                  user={user}
                />
                
                {/* Dedicated Hub Ecosystem section on the Home page */}
                <section className="py-20 bg-white border-t border-slate-100" id="ecosystem_overview">
                  <div className="w-full px-4 sm:px-6 lg:px-8">
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
                  <div className="w-full px-4 sm:px-6 lg:px-8">
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
                  <div className="w-full px-4 sm:px-6 lg:px-8">
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
            )}

            {currentView === 'about' && (
              <motion.div
                key="about-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {/* Dedicated About Header Banner */}
                <div className="bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden py-24 text-left">
                  {/* Glowing graphic elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl"></div>

                  <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
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
                <ConsultationSection 
                  user={user}
                  onSignIn={() => setView('signin')}
                  activeInquiries={activeInquiries}
                  setActiveInquiries={setActiveInquiries}
                />
              </motion.div>
            )}

            {currentView === 'research' && (
              <motion.div
                key="research-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
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
                <ExploreResearchers 
                  user={user}
                  onSignIn={() => setView('signin')}
                />
              </motion.div>
            )}

            {currentView === 'collaboration' && (
              <motion.div
                key="collaboration-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
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
                {/* Dedicated Contact Header Banner */}
                <div className="bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden py-24 text-left">
                  {/* Glowing graphic elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl"></div>

                  <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Connect with Us
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900 font-bold">
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

            {currentView === 'dashboard' && user && (
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

            {currentView === 'admin' && (
              <motion.div
                key="admin-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <AdminPortal 
                  user={user}
                  userProfile={userProfile}
                  setView={setView}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        {currentView !== 'signin' && currentView !== 'initializing' && currentView !== 'onboarding' && currentView !== 'admin' && <Footer onNavClick={handlePageSelect} />}
      </motion.div>

    </div>
  );
}
