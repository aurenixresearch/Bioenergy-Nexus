import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { getSavedPaperIds, getUserInquiries, getUserPartnerships } from './services/db';
import { ConsultationInquiry, PartnershipSubmission } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, Sparkles, X, UserCheck, KeyRound, HelpCircle, BookOpen, Users, HeartHandshake, Leaf } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import FloatingAside from './components/FloatingAside';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ResearchSection from './components/ResearchSection';
import ConsultationSection from './components/ConsultationSection';
import CollaborationSection from './components/CollaborationSection';
import ContactSection from './components/ContactSection';
import UserDashboard from './components/UserDashboard';
import Footer from './components/Footer';

export default function App() {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Layout View: 'home' | 'about' | 'services' | 'research' | 'collaboration' | 'dashboard' | 'contact'
  const [currentView, setView] = useState<'home' | 'about' | 'services' | 'research' | 'collaboration' | 'dashboard' | 'contact'>('home');

  // Sidebar collapsed state and mobile check
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('nexus_sidebar_collapsed');
    return saved === null ? false : saved === 'true';
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Firestore Saved State & Submissions
  const [savedPaperIds, setSavedPaperIds] = useState<string[]>([]);
  const [activeInquiries, setActiveInquiries] = useState<ConsultationInquiry[]>([]);
  const [activePartnerships, setActivePartnerships] = useState<PartnershipSubmission[]>([]);

  // Listen to Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // If we are currently using sandbox demo mode, let it persist instead of null auth
      if (localStorage.getItem('nexus_demo_mode') === 'true') {
        const storedDemoUser = localStorage.getItem('nexus_demo_user');
        if (storedDemoUser) {
          try {
            const demoObj = JSON.parse(storedDemoUser);
            setUser(demoObj);
            setAuthLoading(false);
            refreshAllUserData(demoObj.uid);
            setView('dashboard');
            return;
          } catch (e) {
            console.error('Error parsing stored demo user:', e);
          }
        }
      }

      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        refreshAllUserData(currentUser.uid);
        setView('dashboard');
      } else {
        setSavedPaperIds([]);
        setActiveInquiries([]);
        setActivePartnerships([]);
        // Keep the view intact unless we're on dashboard (which requires login)
        setView(prev => prev === 'dashboard' ? 'home' : prev);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync user info
  const refreshAllUserData = async (userId: string) => {
    try {
      const [savedIds, inquiries, partnerships] = await Promise.all([
        getSavedPaperIds(userId),
        getUserInquiries(userId),
        getUserPartnerships(userId)
      ]);
      setSavedPaperIds(savedIds || []);
      setActiveInquiries(inquiries || []);
      setActivePartnerships(partnerships || []);
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
      setView('dashboard');
    } catch (err: any) {
      console.error('Authentication Error:', err);
      const errStr = String(err);
      const errCode = err?.code || '';
      const errMsg = err?.message || '';

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
        setAuthError(errMsg || errStr);
      }
    }
  };

  // Demo / Guest Sandbox Account sign-in
  const handleGuestSignIn = async () => {
    try {
      setAuthError(null);
      setAuthLoading(true);
      
      // Try real Firebase Anonymous sign in if enabled
      try {
        await signInAnonymously(auth);
        localStorage.removeItem('nexus_demo_mode');
        localStorage.removeItem('nexus_demo_user');
      } catch (fbErr) {
        console.warn('Firebase Anonymous sign in not available/disabled, launching Client Sandbox mode:', fbErr);
        // Client-side sandbox bypass fallback
        const demoUser = {
          uid: 'sandbox-guest-user',
          email: 'guest.researcher@bioenergy-nexus.org',
          displayName: 'Guest Researcher',
          photoURL: null,
          isAnonymous: true
        };
        localStorage.setItem('nexus_demo_mode', 'true');
        localStorage.setItem('nexus_demo_user', JSON.stringify(demoUser));
        setUser(demoUser as any);
        await refreshAllUserData(demoUser.uid);
      }
      setView('dashboard');
    } catch (err: any) {
      console.error('Guest Sign-In Error:', err);
      setAuthError(err.message || String(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('nexus_demo_mode');
      localStorage.removeItem('nexus_demo_user');
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
    <div className="bg-white min-h-screen font-sans flex flex-col justify-between" id="app_root">
      
      {/* Collapsible Floating Aside Section */}
      <FloatingAside 
        user={user}
        currentView={currentView}
        setView={setView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onSignOut={handleSignOut}
      />

      {/* Main layout container with animated padding-left for the side menu */}
      <motion.div
        animate={{ 
          paddingLeft: (user && !isMobile) ? (isCollapsed ? '94px' : '280px') : '0px'
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="flex-grow flex flex-col justify-between min-h-screen w-full"
        id="app_layout_wrapper"
      >
        {/* Dynamic Navigation */}
        {!user && (
          <Navbar 
            user={user}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            currentView={currentView}
            setView={setView}
          />
        )}

        {/* Floating Authentication Error Handler / Guest Banner Modal */}
        <AnimatePresence>
          {authError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
              id="auth_error_overlay"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden"
                id="auth_error_card"
              >
                {/* Card Header Accent */}
                <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-300" />
                    <span className="font-display font-bold tracking-tight text-base">Access Options</span>
                  </div>
                  <button 
                    onClick={() => setAuthError(null)}
                    className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Close notice"
                    id="close_auth_error_btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      {authError === 'popup-closed' ? (
                        <p>
                          The Google Authentication window was closed. This commonly occurs in sandboxed environments or if you closed the login dialog.
                        </p>
                      ) : authError === 'popup-blocked' ? (
                        <p>
                          The Google Sign-In popup window was blocked by your browser's security filters.
                        </p>
                      ) : (
                        <p>
                          An authentication error occurred: <strong className="font-semibold">{authError}</strong>.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3.5 text-left">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      How would you like to proceed?
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You can easily explore the complete collaborative platform, submit bioenergy inquiries, and bookmark published research papers instantly.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={() => {
                        setAuthError(null);
                        handleGuestSignIn();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                      id="guest_signin_confirm_btn"
                    >
                      <UserCheck className="w-4 h-4" />
                      Use Guest Sandbox Mode (Recommended)
                    </button>
                    
                    <button
                      onClick={handleSignIn}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                      id="try_google_signin_again_btn"
                    >
                      Try Google Sign-In Again
                    </button>
                    
                    <button
                      onClick={() => setAuthError(null)}
                      className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      id="dismiss_notice_btn"
                    >
                      Dismiss Notice
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  No password required. Your data remains safe in this sandbox.
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  onSignIn={handleSignIn}
                  user={user}
                />
                
                {/* Dedicated Hub Ecosystem section on the Home page */}
                <section className="py-20 bg-white border-t border-slate-100" id="ecosystem_overview">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Dedicated Research Hub
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900">
                      About Bioenergy <span className="text-emerald-600">Nexus</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
                      Our mission is to establish waste-to-energy technologies and circular economy principles across Nigeria, offering high-quality peer-reviewed research, operations training, and feasibility advisory.
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
                  onSignIn={handleSignIn}
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
                  onSignIn={handleSignIn}
                  savedPaperIds={savedPaperIds}
                  setSavedPaperIds={setSavedPaperIds}
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
                  onSignIn={handleSignIn}
                  activePartnerships={activePartnerships}
                  setActivePartnerships={setActivePartnerships}
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

                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Connect with Us
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900 font-bold">
                      Contact <span className="text-emerald-600">Bioenergy Nexus</span>
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
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer onNavClick={handlePageSelect} />
      </motion.div>

    </div>
  );
}
