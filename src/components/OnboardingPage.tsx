import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Globe, 
  Compass, 
  Search, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ChevronDown, 
  Sparkles,
  Loader2,
  ShieldCheck,
  LogOut,
  User,
  AtSign,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { createUserProfile } from '../services/db';
import { recordPolicyAcceptance } from '../services/policyService';

interface OnboardingPageProps {
  user: any;
  onComplete: () => void;
  onSignOut: () => Promise<void>;
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
  { id: 'Student', label: 'Student', emoji: '🎓' },
  { id: 'Researcher', label: 'Researcher', emoji: '🔬' },
  { id: 'Lecturer', label: 'Lecturer / Professor', emoji: '🧑‍🏫' },
  { id: 'Institution', label: 'Institution', emoji: '🏛️' },
  { id: 'Industry', label: 'Industry Professional', emoji: '🏢' },
  { id: 'Government', label: 'Government Agency', emoji: '🏛️' },
  { id: 'NGO', label: 'NGO / Development', emoji: '🌍' },
  { id: 'Other', label: 'Other', emoji: '👤' }
];

export default function OnboardingPage({ user, onComplete, onSignOut }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  
  // Basic Account info from Google
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(
    user?.displayName 
      ? user.displayName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20) 
      : (user?.email?.split('@')[0] || '')
  );

  // Role, Country, Institution
  const [role, setRole] = useState('');
  const [country, setCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [institution, setInstitution] = useState('');

  // Interests & Legal Terms
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [termsChecked, setTermsChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleInterest = (interest: string) => {
    if (researchInterests.includes(interest)) {
      setResearchInterests(researchInterests.filter(i => i !== interest));
    } else {
      if (researchInterests.length < 10) {
        setResearchInterests([...researchInterests, interest]);
      }
    }
  };

  const isStep1Valid = fullName.trim().length > 0;
  const isStep2Valid = role !== '' && country !== '';
  const isStep3Valid = termsChecked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      setErrorMsg('Please ensure all required fields and agreements are completed.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const sanitizedName = fullName.trim() || user?.displayName || 'Google Scholar';
      const sanitizedUsername = username.trim() || sanitizedName.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // Update profile with the selected role, origin, institution, interests and terms
      await createUserProfile(user.uid, {
        fullName: sanitizedName,
        username: sanitizedUsername,
        email: user.email || '',
        role: role,
        country: country,
        institution: institution.trim(),
        researchInterests: researchInterests,
        termsAccepted: true,
        needsOnboarding: false,
        profilePicture: user?.photoURL || ''
      });

      // Record legal compliance acceptance audit
      await recordPolicyAcceptance(
        user.uid, 
        user.email || '', 
        sanitizedName
      );

      // Successfully finished onboarding
      onComplete();
    } catch (err: any) {
      console.error('Error during Google onboarding submission:', err);
      const rawMsg = err?.message || String(err || '');
      const cleanMsg = (rawMsg.startsWith('{') || rawMsg.includes('"error":') || rawMsg.includes('permission'))
        ? 'Could not sync cloud profile immediately. Profile configured in local scholar session.'
        : rawMsg || 'Onboarding failed. Please try again.';
      setErrorMsg(cleanMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Country Search filters
  const countryQuery = (countrySearch || '').toLowerCase();
  const filteredAfrican = AFRICAN_COUNTRIES.filter(c => (c || '').toLowerCase().includes(countryQuery));
  const filteredOther = OTHER_COUNTRIES.filter(c => (c || '').toLowerCase().includes(countryQuery));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 font-sans" id="onboarding_wrapper">
      {/* Small floating sign out action */}
      <button
        onClick={onSignOut}
        className="absolute top-6 right-6 flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
        id="onboarding_signout_btn"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      <div className="max-w-xl w-full" id="onboarding_container">
        {/* Header decoration */}
        <div className="text-center mb-6" id="onboarding_header">
          <div className="inline-flex p-3.5 bg-emerald-50 rounded-2xl mx-auto shadow-xs mb-3 border border-emerald-100/50">
            <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Complete Your Scholar Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mt-1">
            Hi, <span className="font-semibold text-slate-800">{user?.displayName || 'Google Scholar'}</span>! You're signed in via Google. Please complete the registration questions to configure your research credentials before accessing the dashboard.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-6 px-1 space-y-2" id="onboarding_progress">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            <span>Onboarding Journey</span>
            <span className="text-emerald-700">Step {step} of 3</span>
          </div>
          <div className="flex gap-2" id="onboarding_step_bar">
            <div className={`h-1.5 flex-grow rounded-full transition-all duration-300 ${step >= 1 ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}></div>
            <div className={`h-1.5 flex-grow rounded-full transition-all duration-300 ${step >= 2 ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}></div>
            <div className={`h-1.5 flex-grow rounded-full transition-all duration-300 ${step >= 3 ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}></div>
          </div>
          <div className="grid grid-cols-3 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wide">
            <span className={step === 1 ? 'text-emerald-700' : ''}>1. Account</span>
            <span className={step === 2 ? 'text-emerald-700' : ''}>2. Role & Origin</span>
            <span className={step === 3 ? 'text-emerald-700' : ''}>3. Interests & Terms</span>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200/60 text-rose-800 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs"
              id="onboarding_error_alert"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main interactive form card */}
        <form onSubmit={handleSubmit} id="onboarding_form">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Google Account Verification & Identity */}
            {step === 1 && (
              <motion.div
                key="onboarding_step_1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                id="onboarding_step_1_card"
              >
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <h2 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                      SECTION 1: BASIC ACCOUNT INFORMATION
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Google Verified
                    </span>
                  </div>

                  {/* Connected Google Account Badge */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'Google Avatar'} 
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base border border-emerald-200 shrink-0">
                        {(user?.displayName || user?.email || 'G').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.displayName || 'Google Scholar'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        {user?.email || 'No email attached'}
                      </p>
                    </div>
                  </div>

                  {/* Full Name Confirmation */}
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
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl text-sm outline-none transition-all text-slate-800 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                      Username (Optional)
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setErrorMsg(null); }}
                        placeholder="blessing_w"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-xl text-sm outline-none transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm tracking-wider uppercase"
                  >
                    <span>Next: Role & Origin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: User Role & Origin / Location & Institution */}
            {step === 2 && (
              <motion.div
                key="onboarding_step_2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                id="onboarding_step_2_card"
              >
                {/* SECTION 2: USER ROLE */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h2 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                      SECTION 2: USER ROLE
                    </h2>
                  </div>

                  <div className="space-y-2.5 text-left">
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
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer min-w-0 ${
                              isSelected 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 font-bold' 
                                : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/5 text-slate-700 font-semibold'
                            }`}
                          >
                            <span className="text-lg shrink-0">{r.emoji}</span>
                            <span className="text-xs leading-tight min-w-0 flex-1 break-words">{r.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: ORIGIN / LOCATION */}
                <div className="space-y-4 pt-4 border-t border-slate-100 relative">
                  <div>
                    <h2 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                      SECTION 3: ORIGIN / LOCATION
                    </h2>
                  </div>

                  <div className="space-y-1.5 text-left">
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

                      {/* Searchable country dropdown panel */}
                      <AnimatePresence>
                        {countryDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-60 flex flex-col"
                          >
                            {/* Dropdown Search */}
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

                            {/* Dropdown list */}
                            <div className="overflow-y-auto flex-grow text-xs divide-y divide-slate-100 scrollbar-thin">
                              {/* African Nations group */}
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

                              {/* Other Nations group */}
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
                </div>

                {/* SECTION 4: INSTITUTION */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <h2 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                      SECTION 4: INSTITUTION (OPTIONAL)
                    </h2>
                  </div>

                  <div className="space-y-1.5 text-left">
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
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/2 py-3 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm tracking-wider uppercase transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!isStep2Valid}
                    className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs sm:text-sm tracking-wider uppercase"
                  >
                    <span>Next: Interests</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Research Interests & Terms Checkbox */}
            {step === 3 && (
              <motion.div
                key="onboarding_step_3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                id="onboarding_step_3_card"
              >
                {/* SECTION 5: RESEARCH INTERESTS */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h2 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                      SECTION 5: RESEARCH INTERESTS <span className="text-[10px] text-slate-400 font-normal">(OPTIONAL)</span>
                    </h2>
                  </div>

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
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/5'
                            }`}
                          >
                            {interest}
                            {isSelected && <X className="w-3 h-3 text-white shrink-0 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SECTION 6: TERMS AND PRIVACY */}
                <div className="space-y-3 text-left pt-3 border-t border-slate-100">
                  <h2 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase pb-1">
                    SECTION 6: TERMS AND PRIVACY
                  </h2>
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

                {/* Step 3 Actions */}
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
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
                    className="w-2/3 py-3 bg-gradient-to-t from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all border-t border-white/10 text-[10px] sm:text-xs tracking-tight uppercase whitespace-nowrap px-2"
                    id="onboarding_submit_btn"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Complete Scholar Registration</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
