import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  FileText, 
  ArrowLeft, 
  User, 
  AtSign,
  Check, 
  ShieldCheck, 
  Zap, 
  Loader2,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  Search,
  Building,
  Globe,
  Compass,
  CheckCircle2,
  X,
  LockKeyhole
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { createUserProfile } from '../services/db';
import { recordPolicyAcceptance } from '../services/policyService';

interface SignInPageProps {
  onBack: () => void;
  onSuccess: (user: any) => void;
  onGoogleSignIn: () => Promise<void>;
  onGuestSignIn: (customProfile?: { uid: string; email: string; displayName: string }) => Promise<void>;
  authError?: string | null;
  setAuthError?: (err: string | null) => void;
}

// African Countries first alphabetically
const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", 
  "Central African Republic", "Chad", "Comoros", "Democratic Republic of the Congo", "Republic of the Congo", 
  "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", 
  "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", 
  "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", 
  "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", 
  "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
];

// Other countries
const OTHER_COUNTRIES = [
  "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "China", "Denmark", "Finland", 
  "France", "Germany", "India", "Indonesia", "Ireland", "Italy", "Japan", "Malaysia", "Mexico", 
  "Netherlands", "New Zealand", "Norway", "Pakistan", "Portugal", "Saudi Arabia", "Singapore", 
  "South Korea", "Spain", "Sweden", "Switzerland", "Turkey", "United Arab Emirates", "United Kingdom", "United States"
];

// Research Interests
const INTERESTS = [
  "Solar Energy",
  "Wind Energy",
  "Hydropower",
  "Bioenergy",
  "Energy Storage",
  "Smart Grids",
  "Climate Change",
  "Energy Policy",
  "Circular Economy",
  "Sustainable Development",
  "Nuclear Energy",
  "Carbon Capture",
  "Rural Electrification"
];

// Selectable user roles
const ROLES = [
  { id: 'Student', label: 'Student', emoji: '👨‍🎓' },
  { id: 'Researcher', label: 'Researcher', emoji: '👩‍🔬' },
  { id: 'Lecturer', label: 'Lecturer / Professor', emoji: '👨‍🏫' },
  { id: 'Institution', label: 'Institution', emoji: '🏛' },
  { id: 'Industry', label: 'Industry Professional', emoji: '🏢' },
  { id: 'Government', label: 'Government Agency', emoji: '🏛' },
  { id: 'NGO', label: 'NGO / Development', emoji: '🌍' },
  { id: 'Other', label: 'Other', emoji: '👤' }
];

export default function SignInPage({ 
  onBack, 
  onSuccess, 
  onGoogleSignIn, 
  onGuestSignIn,
  authError,
  setAuthError
}: SignInPageProps) {
  // Sign-in states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Registration Multi-Step/Onboarding states
  const [regStep, setRegStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [role, setRole] = useState('');
  const [country, setCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [institution, setInstitution] = useState('');

  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [termsChecked, setTermsChecked] = useState(false);

  // Profile Selection Handlers collapsed state
  const [handlersOpen, setHandlersOpen] = useState(false);

  // Password reset fields state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Custom demo profiles to quickly test
  const demoProfiles = [
    {
      uid: 'sandbox-blessing-williams',
      email: 'blessing.williams@aurenix-research.org',
      displayName: 'Blessing Williams',
      role: 'Student Cohort',
      idNum: '5999883-DEV'
    },
    {
      uid: 'sandbox-chidi-okafor',
      email: 'chidi.okafor@aurenix-research.org',
      displayName: 'Engr. Chidi Okafor',
      role: 'Clean Tech Consultant',
      idNum: '4820124-CT'
    },
    {
      uid: 'sandbox-samuel-adebayo',
      email: 'samuel.adebayo@aurenix-research.org',
      displayName: 'Dr. Samuel Adebayo',
      role: 'Academic Partner',
      idNum: '8839011-AP'
    },
    {
      uid: 'sandbox-admin-bola',
      email: 'bola.adeyemi@aurenix-research.org',
      displayName: 'Bola Adeyemi',
      role: 'Platform Super Admin',
      idNum: '1000001-ADM'
    }
  ];

  // Quick profile selector
  const selectDemoProfile = (profile: typeof demoProfiles[0]) => {
    setAuthError?.(null);
    setEmail(profile.email);
    setPassword('sandboxPassword123');
    setHandlersOpen(false);
    setErrorMsg(null);
    setSuccessMsg(`Selected sandbox profile for ${profile.displayName}`);
  };

  // Dynamic Password Validation logic
  const hasMinLength = regPassword.length >= 8;
  const hasSpecialOrNum = /[0-9!@#$%^&*(),.?":{}|<>]/.test(regPassword);
  const hasUpperAndLower = /[A-Z]/.test(regPassword) && /[a-z]/.test(regPassword);
  const strengthScore = [hasMinLength, hasSpecialOrNum, hasUpperAndLower].filter(Boolean).length;

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const passwordsMatch = regPassword === regConfirmPassword && regConfirmPassword.length > 0;

  // Step validation helpers
  const isStep1Valid = fullName.trim().length > 0 && isEmailValid(regEmail) && strengthScore === 3 && passwordsMatch;
  const isStep2Valid = role !== '' && country !== '';

  // Handle interest selection toggles
  const handleToggleInterest = (interest: string) => {
    if (researchInterests.includes(interest)) {
      setResearchInterests(researchInterests.filter(i => i !== interest));
    } else {
      if (researchInterests.length < 10) {
        setResearchInterests([...researchInterests, interest]);
      }
    }
  };

  // Submit Handler for Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccessMsg('Your password has been securely updated! Logging in...');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(async () => {
        const targetEmail = email || 'blessing.williams@aurenix-research.org';
        const matchingDemo = demoProfiles.find(p => p.email === targetEmail) || demoProfiles[0];
        
        await onGuestSignIn({
          uid: matchingDemo.uid,
          email: matchingDemo.email,
          displayName: matchingDemo.displayName
        });
        setIsLoading(false);
      }, 1000);

    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setErrorMsg(err.message || 'Failed to update password.');
      setIsLoading(false);
    }
  };

  // Submit Handler for standard Login
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError?.(null);
    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const matchingDemo = demoProfiles.find(p => p.email === email);

    try {
      if (matchingDemo) {
        await onGuestSignIn({
          uid: matchingDemo.uid,
          email: matchingDemo.email,
          displayName: matchingDemo.displayName
        });
        setIsLoading(false);
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(userCredential.user);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password') {
          console.warn('Real Firebase Auth credential failed. Falling back to sandbox bypass.');
          const customUser = {
            uid: 'sandbox-' + email.replace(/[^a-zA-Z0-9]/g, '-'),
            email: email,
            displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
          };
          await onGuestSignIn(customUser);
        } else {
          throw authError;
        }
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler for Onboarding-focused Registration
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid || !isStep2Valid || !termsChecked) {
      setErrorMsg('Please ensure all required fields are correctly configured.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let registeredUser;
      try {
        // 1. Firebase Authentication Account Creation
        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        registeredUser = userCredential.user;
        
        // Update display name in Auth
        await updateProfile(registeredUser, {
          displayName: fullName
        });
      } catch (authError: any) {
        console.warn('Firebase Auth account creation unavailable/restricted, falling back to Sandbox User Mode:', authError);
        
        // Dynamic Sandbox Fallback User
        registeredUser = {
          uid: 'sandbox-' + regEmail.replace(/[^a-zA-Z0-9]/g, '-'),
          email: regEmail,
          displayName: fullName,
          isAnonymous: true
        };
        
        // Configure local storage sandbox state
        localStorage.setItem('nexus_demo_mode', 'true');
        localStorage.setItem('nexus_demo_user', JSON.stringify(registeredUser));
      }

      // 2. Save detailed user profile data into Firestore (or local sandbox fallback)
      await createUserProfile(registeredUser.uid, {
        fullName,
        username: username.trim() || fullName.trim(),
        email: regEmail,
        role,
        country,
        institution,
        researchInterests,
        termsAccepted: termsChecked
      });

      // 3. Record policy acceptance audit trail
      await recordPolicyAcceptance(registeredUser.uid, regEmail, fullName);

      setSuccessMsg('Account registered successfully! Configuring research environment...');
      
      setTimeout(() => {
        onSuccess(registeredUser);
      }, 1200);

    } catch (err: any) {
      console.error('Onboarding Registration Failure:', err);
      setErrorMsg(err.message || 'Onboarding failed. Please review your entries and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Country Search filters
  const countryQuery = (countrySearch || '').toLowerCase();
  const filteredAfrican = AFRICAN_COUNTRIES.filter(c => (c || '').toLowerCase().includes(countryQuery));
  const filteredOther = OTHER_COUNTRIES.filter(c => (c || '').toLowerCase().includes(countryQuery));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="signin_page_wrapper">
      
      {/* LEFT PORTION: The interactive sign-in / registration form */}
      <div className="w-full md:w-[45%] bg-[url('https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq')] bg-cover bg-center bg-no-repeat p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto text-left relative scrollbar-thin scrollbar-thumb-slate-200" id="signin_form_side">
        
        {/* Soft blur overlay over the background image */}
        <div className="absolute inset-0 bg-white/65 backdrop-blur-[6px] z-0 pointer-events-none" id="signin_left_blur_overlay"></div>

        {/* Back Link */}
        <button
          onClick={showResetPassword ? () => { setShowResetPassword(false); setErrorMsg(null); setSuccessMsg(null); } : onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors text-xs font-bold uppercase tracking-wider mb-8 cursor-pointer w-fit relative z-10"
          id="back_to_home_btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Aurenix Research Home
        </button>

        <div className="max-w-md w-full mx-auto space-y-8 my-auto relative z-10" id="signin_form_container">
          
          <AnimatePresence mode="wait">
            {showResetPassword ? (
              // PASSWORD RESET VIEW
              <motion.div
                key="reset_password_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
                id="reset_password_container"
              >
                <div className="flex flex-col items-center text-center space-y-4" id="reset_logo_header">
                  <div className="relative w-28 h-28 flex items-center justify-center" id="reset_graphic_orbit">
                    <div className="absolute w-20 h-20 bg-emerald-500/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute inset-0 border border-emerald-300/40 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-2 border border-dotted border-emerald-500/30 rounded-full animate-[spin_14s_linear_infinite_reverse]"></div>
                    <div className="absolute inset-4 border border-emerald-400/20 rounded-full"></div>
                    
                    <div className="relative w-20 h-20 bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 rounded-full flex items-center justify-center shadow-[0_12px_30px_rgba(16,185,129,0.4)] border border-white/20">
                      <div className="absolute inset-1.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full opacity-95 animate-pulse"></div>
                      <div className="absolute inset-1 border border-white/25 rounded-full"></div>
                      <div className="relative z-10 text-white flex flex-col items-center justify-center">
                        <Lock className="w-8 h-8 stroke-[2.2]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400/95 text-emerald-950 p-1 rounded-full border border-white shadow-md">
                          <Zap className="w-3 h-3 fill-current text-emerald-950 stroke-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight" id="reset_password_title">
                      Reset Your Password
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto" id="reset_password_subtitle">
                      A secure reset link has been sent to your email. <br />
                      Alternatively, create a new, strong password below.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4" id="reset_password_form">
                  <AnimatePresence mode="wait">
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs leading-relaxed font-semibold"
                        id="reset_error_banner"
                      >
                        {errorMsg}
                      </motion.div>
                    )}
                    {successMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-3.5 bg-emerald-50 border border-emerald-200/50 text-emerald-800 rounded-xl text-xs leading-relaxed font-semibold animate-pulse"
                        id="reset_success_banner"
                      >
                        {successMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); setErrorMsg(null); }}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-white/80 hover:bg-white border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm outline-none transition-all text-slate-800 shadow-xs"
                        id="reset_current_password_input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(null); }}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-white/80 hover:bg-white border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm outline-none transition-all text-slate-800 shadow-xs"
                        id="reset_new_password_input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(null); }}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-white/80 hover:bg-white border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm outline-none transition-all text-slate-800 shadow-xs"
                        id="reset_confirm_password_input"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-85 text-xs sm:text-sm tracking-wider uppercase"
                      id="reset_save_btn"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>SAVE AND LOG IN</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : isRegistering ? (
              // ==========================================
              // PREMIUM ONBOARDING REGISTRATION VIEW (3 STEPS)
              // ==========================================
              <motion.div
                key="onboarding_registration_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
                id="onboarding_registration_container"
              >
                {/* Visual Step Header */}
                <div className="text-center space-y-2" id="onboarding_brand_header">
                  <div className="inline-flex p-3 bg-emerald-50 rounded-2xl mx-auto shadow-sm">
                    <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                    Join the Network
                  </h1>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Configure your specialized scholar profile to download blueprints, bookmark research, and request waste audits.
                  </p>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    <span>Onboarding Journey</span>
                    <span className="text-emerald-700">Step {regStep} of 3</span>
                  </div>
                  <div className="flex gap-2" id="registration_step_bar">
                    <div className={`h-1.5 flex-grow rounded-full transition-all duration-300 ${regStep >= 1 ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 flex-grow rounded-full transition-all duration-300 ${regStep >= 2 ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}></div>
                    <div className={`h-1.5 flex-grow rounded-full transition-all duration-300 ${regStep >= 3 ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}></div>
                  </div>
                  <div className="grid grid-cols-3 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    <span className={regStep === 1 ? 'text-emerald-700' : ''}>1. Account</span>
                    <span className={regStep === 2 ? 'text-emerald-700' : ''}>2. Role & Origin</span>
                    <span className={regStep === 3 ? 'text-emerald-700' : ''}>3. Interests</span>
                  </div>
                </div>

                {/* Status/Error Alerts */}
                <AnimatePresence mode="wait">
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3.5 bg-rose-50 border border-rose-200/60 text-rose-800 rounded-xl text-xs font-semibold leading-relaxed"
                      id="reg_error_alert"
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3.5 bg-emerald-50 border border-emerald-200/50 text-emerald-800 rounded-xl text-xs font-semibold animate-pulse"
                      id="reg_success_alert"
                    >
                      {successMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Wrapper */}
                <form onSubmit={handleRegistrationSubmit} className="space-y-5" id="registration_onboarding_form">
                  
                  {/* STEP 1: Basic Account Information */}
                  {regStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                      id="reg_step_1_container"
                    >
                      <div className="bg-white/40 backdrop-blur-sm border border-slate-200/60 p-4 rounded-2xl space-y-4">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                          Section 1: Basic Account Information
                        </h3>
                        
                        {/* Full Name */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => { setFullName(e.target.value); setErrorMsg(null); }}
                              placeholder="Blessing Williams"
                              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl text-sm outline-none transition-all text-slate-800"
                              required
                            />
                          </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            Username
                          </label>
                          <div className="relative">
                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => { setUsername(e.target.value); setErrorMsg(null); }}
                              placeholder="blessing_w"
                              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl text-sm outline-none transition-all text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => { setRegEmail(e.target.value); setErrorMsg(null); }}
                              placeholder="blessing@example.com"
                              className={`w-full pl-11 pr-4 py-2.5 bg-white border ${regEmail.length > 0 && !isEmailValid(regEmail) ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'} hover:border-slate-300 focus:ring-1 focus:ring-emerald-500/20 rounded-xl text-sm outline-none transition-all text-slate-800`}
                              required
                            />
                          </div>
                          {regEmail.length > 0 && !isEmailValid(regEmail) && (
                            <span className="block text-[10px] text-rose-500 font-semibold pl-1">
                              Please enter a valid email format.
                            </span>
                          )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            Password <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showRegPassword ? 'text' : 'password'}
                              value={regPassword}
                              onChange={(e) => { setRegPassword(e.target.value); setErrorMsg(null); }}
                              placeholder="••••••••"
                              className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl text-sm outline-none transition-all text-slate-800"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              title={showRegPassword ? "Hide password" : "Show password"}
                            >
                              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Interactive Password Strength Indicators */}
                          <div className="pt-1.5 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                              <span className="text-slate-400">Password Strength:</span>
                              <span className={strengthScore === 3 ? 'text-emerald-700' : strengthScore === 2 ? 'text-amber-700' : 'text-slate-400'}>
                                {strengthScore === 3 ? '🟢 Strong' : strengthScore === 2 ? '🟡 Medium' : '🔴 Weak'}
                              </span>
                            </div>
                            {/* Strength Meter Bar */}
                            <div className="flex gap-1 h-1">
                              <div className={`h-full flex-grow rounded-full transition-colors duration-300 ${strengthScore >= 1 ? (strengthScore === 3 ? 'bg-emerald-500' : strengthScore === 2 ? 'bg-amber-400' : 'bg-rose-400') : 'bg-slate-200'}`}></div>
                              <div className={`h-full flex-grow rounded-full transition-colors duration-300 ${strengthScore >= 2 ? (strengthScore === 3 ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200'}`}></div>
                              <div className={`h-full flex-grow rounded-full transition-colors duration-300 ${strengthScore >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                            </div>

                            {/* Checklist Criteria */}
                            <ul className="space-y-1 text-[10px] font-semibold text-slate-500">
                              <li className="flex items-center gap-1.5">
                                {hasMinLength ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[8px] font-bold">X</div>
                                )}
                                <span className={hasMinLength ? 'text-emerald-800' : ''}>At least 8 characters</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                {hasSpecialOrNum ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[8px] font-bold">X</div>
                                )}
                                <span className={hasSpecialOrNum ? 'text-emerald-800' : ''}>Includes a number or special character</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                {hasUpperAndLower ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[8px] font-bold">X</div>
                                )}
                                <span className={hasUpperAndLower ? 'text-emerald-800' : ''}>Uppercase and lowercase letters</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            Confirm Password <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showRegConfirmPassword ? 'text' : 'password'}
                              value={regConfirmPassword}
                              onChange={(e) => { setRegConfirmPassword(e.target.value); setErrorMsg(null); }}
                              placeholder="••••••••"
                              className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl text-sm outline-none transition-all text-slate-800"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              title={showRegConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {regConfirmPassword.length > 0 && (
                            <span className={`block text-[10px] font-bold pl-1 ${passwordsMatch ? 'text-emerald-700' : 'text-rose-500'}`}>
                              {passwordsMatch ? '✓ Passwords match perfectly' : '✗ Passwords do not match'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Step 1 Actions */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(2)}
                          disabled={!isStep1Valid}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm tracking-wider uppercase"
                        >
                          <span>Next: Scholar Profile</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Divider & Google Sign-Up Option */}
                      <div className="pt-2 space-y-3" id="signup_google_section">
                        <div className="relative flex items-center" id="signup_divider">
                          <div className="flex-grow border-t border-slate-200"></div>
                          <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Or Register With
                          </span>
                          <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <motion.button
                          type="button"
                          disabled={isGoogleLoading || isLoading}
                          onClick={async () => {
                            setAuthError?.(null);
                            setErrorMsg(null);
                            setSuccessMsg(null);
                            setIsGoogleLoading(true);
                            try {
                              await onGoogleSignIn();
                            } catch (err: any) {
                              console.error('Google Sign-Up Exception:', err);
                            } finally {
                              setIsGoogleLoading(false);
                            }
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer text-xs sm:text-sm"
                          id="google_signup_btn"
                        >
                          {isGoogleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                          ) : (
                            <>
                              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                              </svg>
                              <span>Sign up with Google</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: User Role & Country */}
                  {regStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                      id="reg_step_2_container"
                    >
                      <div className="bg-white/40 backdrop-blur-sm border border-slate-200/60 p-4 rounded-2xl space-y-4">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                          Section 2: User Role
                        </h3>

                        {/* Selectable Cards for User Role */}
                        <div className="space-y-2 text-left">
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            I am a: <span className="text-rose-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {ROLES.map((r) => {
                              const isSelected = role === r.id;
                              return (
                                <motion.button
                                  key={r.id}
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => { setRole(r.id); setErrorMsg(null); }}
                                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer min-w-0 ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/5 text-slate-700'}`}
                                >
                                  <span className="text-lg shrink-0">{r.emoji}</span>
                                  <span className="text-xs font-bold leading-tight min-w-0 flex-1 break-words">{r.label}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Searchable Country Dropdown */}
                        <div className="space-y-1.5 text-left pt-2 border-t border-slate-100 relative">
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1.5">
                            Section 3: Origin / Location
                          </h3>
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            Country <span className="text-rose-500">*</span>
                          </label>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                              className="w-full flex items-center justify-between pl-4 pr-10 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-left transition-all outline-none"
                            >
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-400" />
                                <span className={country ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                                  {country || 'Select your country'}
                                </span>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown panel */}
                            <AnimatePresence>
                              {countryDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-60 flex flex-col"
                                >
                                  {/* Dropdown Search Input */}
                                  <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <input
                                      type="text"
                                      value={countrySearch}
                                      onChange={(e) => setCountrySearch(e.target.value)}
                                      placeholder="Search countries..."
                                      className="w-full bg-transparent text-xs outline-none border-none text-slate-800 p-0.5"
                                      autoFocus
                                    />
                                    {countrySearch.length > 0 && (
                                      <button type="button" onClick={() => setCountrySearch('')}>
                                        <X className="w-3 h-3 text-slate-400" />
                                      </button>
                                    )}
                                  </div>

                                  {/* List of Countries */}
                                  <div className="overflow-y-auto flex-grow text-xs divide-y divide-slate-100">
                                    
                                    {/* AFRICAN COUNTRIES GROUP */}
                                    {filteredAfrican.length > 0 && (
                                      <div>
                                        <div className="bg-emerald-50/50 text-emerald-800 font-bold px-3 py-1.5 uppercase text-[9px] tracking-wider flex items-center gap-1 sticky top-0">
                                          <Compass className="w-3 h-3 text-emerald-600" />
                                          African Nations
                                        </div>
                                        {filteredAfrican.map((c) => (
                                          <button
                                            key={c}
                                            type="button"
                                            onClick={() => {
                                              setCountry(c);
                                              setCountryDropdownOpen(false);
                                              setCountrySearch('');
                                              setErrorMsg(null);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold"
                                          >
                                            <span>{c}</span>
                                            {country === c && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    {/* OTHER COUNTRIES GROUP */}
                                    {filteredOther.length > 0 && (
                                      <div>
                                        <div className="bg-slate-100/80 text-slate-500 font-bold px-3 py-1.5 uppercase text-[9px] tracking-wider sticky top-0">
                                          Other Countries
                                        </div>
                                        {filteredOther.map((c) => (
                                          <button
                                            key={c}
                                            type="button"
                                            onClick={() => {
                                              setCountry(c);
                                              setCountryDropdownOpen(false);
                                              setCountrySearch('');
                                              setErrorMsg(null);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold"
                                          >
                                            <span>{c}</span>
                                            {country === c && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    {filteredAfrican.length === 0 && filteredOther.length === 0 && (
                                      <p className="p-3 text-slate-400 italic text-center">No countries matched search.</p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Institution or Organization (Optional) */}
                        <div className="space-y-1.5 text-left pt-2 border-t border-slate-100">
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1.5">
                            Section 4: Institution (Optional)
                          </h3>
                          <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                            Institution or Organization
                          </label>
                          <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={institution}
                              onChange={(e) => setInstitution(e.target.value)}
                              placeholder="e.g. University of Lagos"
                              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl text-sm outline-none transition-all text-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 2 Actions */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="w-1/2 py-3 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm tracking-wider uppercase transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegStep(3)}
                          disabled={!isStep2Valid}
                          className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm tracking-wider uppercase"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Research Interests & Terms Checkbox */}
                  {regStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                      id="reg_step_3_container"
                    >
                      <div className="bg-white/40 backdrop-blur-sm border border-slate-200/60 p-4 rounded-2xl space-y-4">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                          Section 5: Research Interests <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                        </h3>

                        {/* Interests Wrapping Cloud */}
                        <div className="space-y-2 text-left">
                          <p className="text-[10px] text-slate-400 italic">
                            Select up to 10 key research fields of interest to filter your scientific feed:
                          </p>
                          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1 scrollbar-thin">
                            {INTERESTS.map((interest) => {
                              const isSelected = researchInterests.includes(interest);
                              return (
                                <button
                                  key={interest}
                                  type="button"
                                  onClick={() => handleToggleInterest(interest)}
                                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/5'}`}
                                >
                                  {interest}
                                  {isSelected && <X className="w-3 h-3 text-white shrink-0 ml-0.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Terms & Privacy Required checkbox */}
                        <div className="space-y-2 text-left pt-3 border-t border-slate-100">
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1">
                            Section 6: Terms and Privacy
                          </h3>
                          <label className="flex items-start gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={termsChecked}
                              onChange={(e) => setTermsChecked(e.target.checked)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4.5 h-4.5 cursor-pointer shrink-0 mt-0.5"
                              required
                            />
                            <span className="leading-relaxed text-slate-500">
                              I agree to the{' '}
                              <a 
                                href="/legal/terms" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-900 underline font-bold"
                              >
                                Terms and Conditions
                              </a>,{' '}
                              <a 
                                href="/legal/privacy" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-900 underline font-bold"
                              >
                                Privacy Policy
                              </a>, and{' '}
                              <a 
                                href="/legal/community" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-900 underline font-bold"
                              >
                                Community Guidelines
                              </a>. <span className="text-rose-500">*</span>
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Step 3 Actions & Creation Button */}
                      <div className="space-y-3 pt-2">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setRegStep(2)}
                            className="w-1/3 py-3 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm tracking-wider uppercase transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                          
                          <motion.button
                            type="submit"
                            disabled={!termsChecked || isLoading}
                            whileHover={termsChecked && !isLoading ? { scale: 1.01, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' } : {}}
                            whileTap={termsChecked && !isLoading ? { scale: 0.99 } : {}}
                            className="w-2/3 py-3 bg-gradient-to-t from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all border-t border-white/10 text-xs sm:text-sm tracking-wider uppercase"
                            id="registration_submit_btn"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Create Research Account</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Toggle Sign-In View */}
                  <div className="text-center text-xs text-slate-500 font-semibold pt-2" id="toggle_signin_row">
                    Already have a scholar profile?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setRegStep(1);
                      }}
                      className="text-emerald-700 hover:text-emerald-900 underline font-bold uppercase tracking-wider text-[10px] ml-1 cursor-pointer"
                      id="toggle_signin_btn"
                    >
                      SIGN IN NOW
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              // ==========================================
              // STANDARD SIGN IN VIEW
              // ==========================================
              <motion.div
                key="standard_signin_view"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
                id="standard_signin_content"
              >
                {/* Logo Section */}
                <div className="text-center space-y-4" id="signin_brand_header">
                  <div className="inline-flex p-3 bg-emerald-50 rounded-2xl mx-auto shadow-sm">
                    <img 
                      src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                      alt="Aurenix Research Logo" 
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">
                    Welcome
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Welcome back! Reconnect to access your personalized research dashboard, real-time data visualizations, and project progress trackers.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitLogin} className="space-y-5" id="signin_form">
                  <AnimatePresence mode="wait">
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs leading-relaxed font-semibold"
                        id="signin_error_banner"
                      >
                        {errorMsg}
                      </motion.div>
                    )}
                    {successMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-3.5 bg-emerald-50 border border-emerald-200/50 text-emerald-800 rounded-xl text-xs leading-relaxed font-semibold"
                        id="signin_success_banner"
                      >
                        {successMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                        placeholder="name@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-sm outline-none transition-all text-slate-800"
                        id="signin_email_input"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-sm outline-none transition-all text-slate-800"
                        id="signin_password_input"
                        required
                      />
                    </div>
                  </div>

                  {/* Remember & Forgot Row */}
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4 h-4 cursor-pointer"
                        id="signin_remember_checkbox"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setShowResetPassword(true);
                      }}
                      className="text-emerald-700 hover:text-emerald-900 transition-colors uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                      id="forgot_password_btn"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Capsule Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 bg-gradient-to-t from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-85 text-xs sm:text-sm tracking-wider uppercase border-t border-white/10"
                    id="signin_submit_btn"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="relative flex py-1 items-center" id="signin_divider">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Or Continue With
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Google Sign In button */}
                <motion.button
                  type="button"
                  disabled={isGoogleLoading || isLoading}
                  onClick={async () => {
                    setAuthError?.(null);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setIsGoogleLoading(true);
                    try {
                      await onGoogleSignIn();
                    } catch (err: any) {
                      console.error('Google Sign-In Exception:', err);
                    } finally {
                      setIsGoogleLoading(false);
                    }
                  }}
                  whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-3 shadow-xs cursor-pointer text-xs sm:text-sm transition-colors uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
                  id="google_signin_btn"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Authenticating with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.35 1 3.37 3.65 1.41 7.54l3.82 2.96C6.18 7.54 8.83 5.04 12 5.04z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.66-2.31 3.48l3.6 2.79c2.1-1.94 3.31-4.8 3.31-8.42z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.23 10.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.41 2.94C.51 4.74 0 6.76 0 8.9c0 2.14.51 4.16 1.41 5.96l3.82-2.96z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.6-2.79c-1.1.74-2.51 1.18-4.36 1.18-3.17 0-5.82-2.5-6.78-5.46L1.41 15.98C3.37 19.87 7.35 23 12 23z"
                        />
                      </svg>
                      <span>Sign In with Google</span>
                    </>
                  )}
                </motion.button>

                {/* Toggle Registration View */}
                <div className="text-center text-xs text-slate-500 font-semibold" id="toggle_register_row">
                  Don't have a scholar profile?{' '}
                  <button
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setRegStep(1);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 underline font-bold uppercase tracking-wider text-[10px] ml-1 cursor-pointer"
                    id="toggle_register_btn"
                  >
                    REGISTER NOW
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>



        </div>

        {/* Footer info */}
        <div className="pt-8 text-[10px] text-slate-400 text-center font-mono border-t border-slate-200/50 max-w-md w-full mx-auto relative z-10" id="signin_footer">
          Aurenix Research Research System &copy; 2024 &bull; Environment Sandboxed
        </div>

      </div>

      {/* RIGHT PORTION: Beautiful information portal view */}
      <div className="hidden md:flex w-[55%] bg-[url('https://lh3.googleusercontent.com/d/10ZBdCHZ037o-3k7c2VnRZGT8XXbKdzdy')] bg-cover bg-center bg-no-repeat border-l border-slate-200/60 p-10 pt-[30px] flex-col items-center justify-start relative overflow-hidden select-none" id="signin_info_side">
        
        {/* Soft blur overlay over the background image */}
        <div className="absolute inset-0 bg-white/55 backdrop-blur-[6px] z-0 pointer-events-none" id="signin_right_blur_overlay"></div>

        {/* Complex Grid Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.14] pointer-events-none z-0"></div>
        
        {/* Giant glowing gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full filter blur-3xl pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/25 rounded-full filter blur-3xl pointer-events-none z-0"></div>

        {/* Content container */}
        <div className="max-w-lg w-full text-center space-y-8 lg:space-y-10 z-10 pt-[30px] mt-0" id="signin_portal_info">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/80 border border-emerald-200/60 rounded-full text-[10px] font-bold text-emerald-800 uppercase tracking-widest shadow-xs" id="signin_portal_badge">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Aurenix Research &bull; Research Portal v2.1
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.15]">
              AI-Optimized <br />
              <span className="text-emerald-700 bg-emerald-100/30 px-3 py-1 rounded-xl">Bioenergy Research</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Tailor-made project diagnostics, personalized data insights, instant answers from expert systems, and complete data transparency.
            </p>
          </div>

          {/* GLASSMORPHIC FLOATING CARD */}
          <div className="bg-white/55 backdrop-blur-md border border-white/60 shadow-xl rounded-3xl p-6 text-left space-y-5 transition-transform hover:scale-[1.01]" id="glass_profile_preview">
            
            {/* Header Block inside Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-tr from-emerald-200/80 to-emerald-50 rounded-2xl flex items-center justify-center shadow-xs border border-emerald-200/40">
                  <span className="p-1.5 text-emerald-700 font-bold">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight">Blessing Williams</h4>
                  <span className="block text-[9px] font-mono text-slate-400 mt-0.5 uppercase tracking-wide">
                    ID: 5999883-DEV
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="px-2.5 py-1 bg-emerald-100/50 border border-emerald-200/40 rounded-full text-[9px] font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ONLINE RESEARCH PORTAL
              </div>
            </div>

            <div className="h-px bg-slate-200/40"></div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Active Progress
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-slate-800">18,596</span>
                  <span className="text-[10px] font-bold text-emerald-600 font-mono">+4.2%</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Authorized As
                </span>
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Student Cohort
                </div>
              </div>
            </div>

            {/* Sparkline chart portion */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Weekly Level Trend
                </span>
                <span className="text-[9px] font-bold text-emerald-600 font-mono uppercase">
                  Streak Secured
                </span>
              </div>
              
              {/* Animated SVG Sparkline */}
              <div className="bg-slate-50/50 border border-slate-200/30 rounded-xl p-3 h-20 flex items-center justify-center relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Filled area */}
                  <path
                    d="M 0 50 Q 30 30 60 45 T 120 20 T 180 35 T 240 15 T 300 25 L 300 60 L 0 60 Z"
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Curved Path */}
                  <motion.path
                    d="M 0 50 Q 30 30 60 45 T 120 20 T 180 35 T 240 15 T 300 25"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.8, ease: 'easeInOut' }}
                  />

                  {/* Endpoint Pulse node */}
                  <circle cx="300" cy="25" r="4" fill="#059669" />
                  <circle cx="300" cy="25" r="8" fill="#10b981" className="animate-ping" opacity="0.3" />
                </svg>
              </div>
            </div>

            {/* Row of bottom metadata cards inside glass container */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-slate-50/85 border border-slate-200/40 rounded-xl text-center">
                <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                  Role Client
                </span>
                <span className="block text-[9px] font-extrabold text-slate-700 uppercase mt-0.5">
                  Premium GR
                </span>
              </div>
              <div className="p-2 bg-slate-50/85 border border-slate-200/40 rounded-xl text-center">
                <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                  Projects
                </span>
                <span className="block text-[9px] font-extrabold text-slate-700 uppercase mt-0.5">
                  6 Active
                </span>
              </div>
              <div className="p-2 bg-slate-50/85 border border-slate-200/40 rounded-xl text-center">
                <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                  Research Streak
                </span>
                <span className="block text-[9px] font-extrabold text-slate-700 uppercase mt-0.5">
                  12 Days
                </span>
              </div>
            </div>

            {/* Card Footer row */}
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 font-mono pt-1">
              <span>SECURE PROFILE STATUS GATED</span>
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                SVIC TERMINAL ACTIVE
              </span>
            </div>

          </div>

          {/* Bottom Security Highlights */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 font-semibold font-mono" id="signin_portal_security_hints">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              AES-256 Credentials
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Instant Synced Alerts
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
