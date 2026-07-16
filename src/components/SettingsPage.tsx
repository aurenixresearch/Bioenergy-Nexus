import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  User, 
  Settings, 
  Lock, 
  Bell, 
  Eye, 
  Handshake, 
  Cpu, 
  Sparkles, 
  Layers, 
  Monitor, 
  Link2, 
  Database, 
  CreditCard, 
  HelpCircle, 
  Trash2, 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  X,
  FileCheck,
  Check,
  ChevronRight,
  ShieldAlert,
  Save,
  Activity,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getUserProfile, createUserProfile } from '../services/db';

interface SettingsPageProps {
  user: FirebaseUser;
  onNavigateToView: (view: 'dashboard' | 'profile' | 'research') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

type SettingsSection = 
  | 'account' 
  | 'security' 
  | 'notifications' 
  | 'privacy' 
  | 'collaboration' 
  | 'aimatch' 
  | 'research' 
  | 'appearance' 
  | 'connected' 
  | 'data' 
  | 'subscription' 
  | 'help' 
  | 'danger';

export default function SettingsPage({ user, onNavigateToView, theme, onToggleTheme }: SettingsPageProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [formData, setFormData] = useState<any>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch complete profile and settings configuration
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setProfileData(profile);
        // Ensure settings sections are instantiated to avoid undefined properties
        const merged = {
          ...profile,
          settings: {
            security: { twoFactorEnabled: false, ...profile?.settings?.security },
            notifications: {
              email: true, push: false, inApp: true,
              collaborationInvitations: true, fundingOpportunities: true,
              allianceMatches: true, aiRecommendations: true, newFollowers: true,
              messages: true, comments: true, publicationCitations: true,
              projectUpdates: true, innovationChallenges: true, deadlines: true,
              weeklyResearchDigest: true,
              ...profile?.settings?.notifications
            },
            privacy: {
              visibility: 'Public', email: true, phone: false,
              institution: true, publications: true, projects: true,
              collaborations: true, followers: true, achievements: true,
              ...profile?.settings?.privacy
            },
            collaborationPreferences: {
              lookingFor: ['Funding', 'Laboratory Access'],
              availability: 'Open to Collaborate',
              ...profile?.settings?.collaborationPreferences
            },
            aiMatchPreferences: {
              countries: ['Nigeria'],
              researchAreas: ['Bioenergy'],
              trl: [5, 6, 7],
              fundingRange: '$100k - $250k',
              collaborationType: ['R&D'],
              languages: ['English'],
              ...profile?.settings?.aiMatchPreferences
            },
            researchPreferences: {
              defaultVisibility: 'Public',
              citationStyle: 'IEEE',
              defaultLanguage: 'English',
              ...profile?.settings?.researchPreferences
            },
            appearance: {
              mode: 'light',
              fontSize: 'Medium',
              accessibility: {},
              ...profile?.settings?.appearance
            },
            connectedAccounts: {
              googleConnected: true,
              ...profile?.settings?.connectedAccounts
            }
          }
        };
        setFormData(merged);
      }
    } catch (err) {
      console.error('Error fetching settings config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  // Handle general save
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await createUserProfile(user.uid, formData);
      setProfileData(formData);
      setAlertMsg({ type: 'success', text: 'System configuration and preferences saved successfully.' });
      setTimeout(() => setAlertMsg(null), 4000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setAlertMsg({ type: 'error', text: 'Failed to update preferences.' });
      setTimeout(() => setAlertMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Profile completion calculation helper
  const getProfileCompletion = () => {
    if (!formData) return 0;
    let completed = 0;
    const checks = [
      !!formData.profilePicture,
      !!formData.bio,
      formData.education?.length > 0,
      formData.workExperience?.length > 0,
      formData.skills?.length > 0,
      formData.researchInterests?.length > 0,
      Object.values(formData.portfolioLinks || {}).some(v => !!v)
    ];
    checks.forEach(c => { if (c) completed++; });
    return Math.round((completed / checks.length) * 100);
  };

  const completionPercent = getProfileCompletion();

  if (loading && !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4" id="settings_loading_state">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">Loading settings panel...</p>
      </div>
    );
  }

  const sectionsList: { id: SettingsSection; label: string; icon: any; desc: string }[] = [
    { id: 'account', label: 'Account Profile', icon: User, desc: 'Personal details, avatar, credentials' },
    { id: 'security', label: 'Security & Auth', icon: Lock, desc: 'Passwords, login sessions, Google link' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Weekly digests, alliance recommendations' },
    { id: 'privacy', label: 'Privacy Gates', icon: Eye, desc: 'Field visibility, public exposure controls' },
    { id: 'collaboration', label: 'Collaboration Prefs', icon: Handshake, desc: 'Availability, consortium seeks' },
    { id: 'aimatch', label: 'AI Match Criteria', icon: Cpu, desc: 'TRL, funding ranges, research lands' },
    { id: 'research', label: 'Research Prefs', icon: Layers, desc: 'Default citation models, initial drafts' },
    { id: 'appearance', label: 'Appearance', icon: Monitor, desc: 'Light/dark styles, scaling' },
    { id: 'connected', label: 'Connected Accounts', icon: Link2, desc: 'Google, ORCID, GitHub, Microsoft' },
    { id: 'data', label: 'Data & Storage', icon: Database, desc: 'Download my data, export publications' },
    { id: 'subscription', label: 'Subscription & Tier', icon: CreditCard, desc: 'Billings, invoices, professional scales' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, desc: 'Aurenix community, feature tickets' },
    { id: 'danger', label: 'Danger Zone', icon: Trash2, desc: 'Deactivation, profile deletion tools' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen text-left" id="settings_system_view">
      
      {/* Alert Notification */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/20 dark:text-emerald-300' 
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-500/20 dark:text-rose-300'
            }`}
            id="settings_alert_box"
          >
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
            <span className="text-xs font-semibold">{alertMsg.text}</span>
            <button onClick={() => setAlertMsg(null)} className="ml-2 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white dark:bg-slate-900">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider mb-1">
              <Settings className="w-4 h-4 text-emerald-600" />
              Aurenix Research Network Settings
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
              System Preferences
            </h1>
          </div>
          
          <button 
            onClick={() => onNavigateToView('dashboard')}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors text-slate-700 dark:text-slate-200"
            id="settings_back_btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </button>
        </div>

        {/* Layout Grid: Left Sidebar Selector, Right Form Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. LEFT SIDEBAR (SECTIONS SELECTOR & RESEARCH SCORE) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Split Sidebar list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-xs space-y-0.5" id="settings_sections_selector">
              {sectionsList.map((sec) => {
                const SecIcon = sec.icon;
                const isSecActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${
                      isSecActive 
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold shadow-inner' 
                        : 'text-slate-400 dark:text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 hover:bg-zinc-900 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <SecIcon className={`w-4.5 h-4.5 shrink-0 ${isSecActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <div className="truncate">{sec.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">{sec.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Research Identity Score Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-left">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider">Research Identity Score</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-500/10">{completionPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Completing your research metadata improves the AI match engine accuracy by up to <strong>3.5x</strong>. Linking verified ORCID registers is required for grant access channels.
              </p>
              
              <button 
                onClick={() => onNavigateToView('profile')}
                className="w-full mt-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold rounded-xl text-xs text-center block cursor-pointer transition-colors"
              >
                Go Complete Portfolio
              </button>
            </div>

          </div>

          {/* 2. RIGHT FORM PANEL (ACTIVE CONTENT PORTAL) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            
            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              {/* ----------------- ACCOUNT PROFILE PANEL ----------------- */}
              {activeSection === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Account Profile Credentials</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Personal identifiers, associated institutions and structural titles.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input 
                        type="text"
                        required
                        value={formData.fullName || ''}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Username</label>
                      <input 
                        type="text"
                        required
                        value={formData.username || ''}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Primary Email</label>
                      <input 
                        type="email"
                        disabled
                        value={formData.email || ''}
                        className="w-full px-3.5 py-2 bg-zinc-950 dark:bg-zinc-950 border border-slate-700 text-slate-500 rounded-xl text-xs cursor-not-allowed outline-none"
                        title="Authorized ID cannot be changed."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Mobile Phone</label>
                      <input 
                        type="text"
                        placeholder="+234 (0) 803 123 4567"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Default Timezone</label>
                      <input 
                        type="text"
                        value={formData.timezone || 'UTC+1 (WAT)'}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Institution Location</label>
                      <input 
                        type="text"
                        value={formData.country || ''}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- SECURITY & CREDENTIALS PANEL ----------------- */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Security & Cryptography Gates</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Keep your login parameters, connected systems and authorization sessions secure.</p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
                    {/* Google Linked Account */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Google Identity Authorization</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Linked to: {formData.email}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
                        Active & Synced
                      </span>
                    </div>

                    {/* Change Password Block */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Change Security Password</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">New Password</label>
                          <input 
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                          <input 
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2FA Toggle Switch */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="space-y-1 pr-4">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Requires a secure mobile authenticator code upon signing in.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            security: { ...formData.settings.security, twoFactorEnabled: !formData.settings.security?.twoFactorEnabled }
                          }
                        })}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          formData.settings.security?.twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-800'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          formData.settings.security?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Active Sessions list */}
                    <div className="pt-4 border-t border-slate-200/60 dark:border-[#10241b]">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Active Workspace Sessions</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl font-mono border border-slate-100 dark:border-slate-800/40">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">Chrome on Linux Container</p>
                            <p className="text-[10px] text-slate-400">IP: 10.244.12.8 • Active Now</p>
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Current Device</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- NOTIFICATIONS PANEL ----------------- */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Notifications & Digest Controls</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Configure what activities generate email, push, or in-app workspace prompts.</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    {[
                      { key: 'email', label: 'Global Email Notifications', desc: 'Allow Aurenix System to send research digests and alerts to your email.' },
                      { key: 'inApp', label: 'In-App Alerts', desc: 'Toggle structural toast highlights inside the researcher dashboard.' },
                      { key: 'collaborationInvitations', label: 'Collaboration Invitations', desc: 'Prompts when researchers request to join your customized pilot projects.' },
                      { key: 'fundingOpportunities', label: 'Funding Opportunities Alerts', desc: 'Real-time indicators when matching green funds publish eligibility criteria.' },
                      { key: 'aiRecommendations', label: 'AI Match Engine Suggestions', desc: 'Weekly custom researcher pairing and citation matching alerts.' },
                      { key: 'weeklyResearchDigest', label: 'Weekly Research Digest', desc: 'Aggregated analytics of most downloaded sub-Saharan bioenergy papers.' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        <div className="space-y-0.5 text-left pr-4">
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-200">{item.label}</h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              notifications: {
                                ...formData.settings.notifications,
                                [item.key]: !formData.settings.notifications?.[item.key]
                              }
                            }
                          })}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-150 focus:outline-none shrink-0 cursor-pointer ${
                            formData.settings.notifications?.[item.key] ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-150 ${
                            formData.settings.notifications?.[item.key] ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ----------------- PRIVACY PANEL ----------------- */}
              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Profile Exposure & Privacy Gates</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Control who can view your credentials, papers, or send partnership requests.</p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    {/* General profile visibility selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Profile Index Visibility</label>
                      <select 
                        value={formData.settings.privacy?.visibility || 'Public'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            privacy: { ...formData.settings.privacy, visibility: e.target.value }
                          }
                        })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                      >
                        <option value="Public">Public (Indexed globally & indexed on search engines)</option>
                        <option value="Researchers Only">Registered Researchers Only</option>
                        <option value="Private">Private Draft (Only you and project collaborators can view)</option>
                      </select>
                    </div>

                    {/* Feature-level toggles */}
                    <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-3">Field Visibility Overrides</h4>
                      
                      {[
                        { key: 'email', label: 'Expose Primary Email', desc: 'Let verified scholars view your email for co-author invitations.' },
                        { key: 'phone', label: 'Expose Mobile Phone Number', desc: 'Allows industrial partners to view your direct phone contact.' },
                        { key: 'projects', label: 'Show Active Innovation Milestones', desc: 'Expose active pilot TRL progresses on public portfolio pages.' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                          <div className="space-y-0.5 text-left pr-4 flex-grow">
                            <h5 className="font-bold text-slate-700 dark:text-slate-300">{item.label}</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                privacy: {
                                  ...formData.settings.privacy,
                                  [item.key]: !formData.settings.privacy?.[item.key]
                                }
                              }
                            })}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-150 focus:outline-none shrink-0 cursor-pointer ${
                              formData.settings.privacy?.[item.key] ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-150 ${
                              formData.settings.privacy?.[item.key] ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- COLLABORATION PREFERENCES PANEL ----------------- */}
              {activeSection === 'collaboration' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Collaboration Preferences</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select what resources you seek and your availability level for green-energy consortium alliances.</p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Availability Level</label>
                      <select 
                        value={formData.settings.collaborationPreferences?.availability || 'Open to Collaborate'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            collaborationPreferences: { ...formData.settings.collaborationPreferences, availability: e.target.value }
                          }
                        })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                      >
                        <option value="Open to Collaborate">Open to Collaborate (Actively seeking partnership proposals)</option>
                        <option value="Invite Only">Invite Only (Will accept proposals from verified institutions only)</option>
                        <option value="Not Currently Available">Not Currently Available</option>
                      </select>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Resources & Partners Desired</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          'Funding', 'Laboratory Access', 'Equipment', 'Technical Mentor', 
                          'Industry Partner', 'Government Partner', 'NGO Partner', 'University Partner'
                        ].map((resource) => {
                          const isChecked = (formData.settings.collaborationPreferences?.lookingFor || []).includes(resource);
                          return (
                            <button
                              type="button"
                              key={resource}
                              onClick={() => {
                                const currentList = formData.settings.collaborationPreferences?.lookingFor || [];
                                const newList = currentList.includes(resource)
                                  ? currentList.filter((item: string) => item !== resource)
                                  : [...currentList, resource];
                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    collaborationPreferences: { ...formData.settings.collaborationPreferences, lookingFor: newList }
                                  }
                                });
                              }}
                              className={`p-3 border rounded-xl text-left font-semibold cursor-pointer transition-all flex items-center justify-between ${
                                isChecked 
                                  ? 'bg-emerald-950/20 border-emerald-600 text-emerald-400' 
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                              }`}
                            >
                              <span>{resource}</span>
                              {isChecked ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- AI MATCH PREFERENCES PANEL ----------------- */}
              {activeSection === 'aimatch' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">AI Matching Engine Constraints</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Instruct our background recommendation pipelines on how to target matches for you.</p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Preferred Technology Readiness Levels (TRL)</label>
                      <p className="text-[10px] text-slate-400 mb-2">TRL 1-3 indicates Basic Research; TRL 4-6 is Bench Validation; TRL 7-9 is Operational Pilot Deployments.</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                          const isSelected = (formData.settings.aiMatchPreferences?.trl || []).includes(lvl);
                          return (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => {
                                const list = formData.settings.aiMatchPreferences?.trl || [];
                                const newList = list.includes(lvl) ? list.filter((l: number) => l !== lvl) : [...list, lvl];
                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    aiMatchPreferences: { ...formData.settings.aiMatchPreferences, trl: newList }
                                  }
                                });
                              }}
                              className={`w-9 h-9 rounded-lg border font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                                  : 'bg-black dark:bg-black border border-slate-700 text-slate-400'
                              }`}
                            >
                              T{lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Target Funding Ranges</label>
                      <select 
                        value={formData.settings.aiMatchPreferences?.fundingRange || '$100k - $250k'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            aiMatchPreferences: { ...formData.settings.aiMatchPreferences, fundingRange: e.target.value }
                          }
                        })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600 transition-colors"
                      >
                        <option value="Under $50k">Under $50k USD (Seed scale & student fellowships)</option>
                        <option value="$50k - $250k">$50k — $250k USD (Standard institutional academic grants)</option>
                        <option value="$250k - $1M">$250k — $1M USD (National pilot feasibility funds)</option>
                        <option value="Over $1M">Over $1M USD (International utility scales)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- RESEARCH METADATA PREFERENCES PANEL ----------------- */}
              {activeSection === 'research' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Research Documentation Preferences</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Configure default rendering metadata parameters for studies you submit.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Default Study Privacy</label>
                      <select 
                        value={formData.settings.researchPreferences?.defaultVisibility || 'Public'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            researchPreferences: { ...formData.settings.researchPreferences, defaultVisibility: e.target.value }
                          }
                        })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                      >
                        <option value="Public">Public (Accessible to everyone)</option>
                        <option value="Private">Private Draft (Only you can access)</option>
                        <option value="Collaborators Only">Collaborators Only</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Default Citation Format</label>
                      <select 
                        value={formData.settings.researchPreferences?.citationStyle || 'IEEE'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            researchPreferences: { ...formData.settings.researchPreferences, citationStyle: e.target.value }
                          }
                        })}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                      >
                        <option value="IEEE">IEEE Reference style (Scientific standard)</option>
                        <option value="APA">APA 7th Reference Style (Social sciences)</option>
                        <option value="Harvard">Harvard Parenthetical Style</option>
                        <option value="Chicago">Chicago Manual Reference</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- APPEARANCE THEME PANEL ----------------- */}
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Appearance & Accessibility Styles</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Control visual scaling, typography weighting and contrast layers.</p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Visual Mode Theme</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (theme === 'dark' && onToggleTheme) onToggleTheme();
                          }}
                          className={`p-4 border rounded-2xl cursor-pointer text-left transition-all ${
                            theme === 'light' 
                              ? 'bg-emerald-950/20 border-emerald-600 font-extrabold text-emerald-400' 
                              : 'bg-black dark:bg-black border border-slate-700 text-slate-500 hover:bg-zinc-900'
                          }`}
                        >
                          <Monitor className="w-5 h-5 mb-2" />
                          <div>Aurenix Emerald Light</div>
                          <p className="text-[10px] font-normal text-slate-400 pt-0.5">High-contrast slate off-whites</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (theme === 'light' && onToggleTheme) onToggleTheme();
                          }}
                          className={`p-4 border rounded-2xl cursor-pointer text-left transition-all ${
                            theme === 'dark' 
                              ? 'bg-emerald-950/40 border-emerald-500/30 font-extrabold text-emerald-400' 
                              : 'bg-black dark:bg-black border border-slate-700 text-slate-500 hover:bg-zinc-900'
                          }`}
                        >
                          <Monitor className="w-5 h-5 mb-2" />
                          <div>Forest Obsidian Dark</div>
                          <p className="text-[10px] font-normal text-slate-500 pt-0.5">Energy efficient Pitch-Black backdrop</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- CONNECTED ACCOUNTS ----------------- */}
              {activeSection === 'connected' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Linked Credentials Directories</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Consolidate your digital academic footprints inside Aurenix.</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between p-4 bg-black dark:bg-black rounded-2xl border border-slate-700">
                      <div>
                        <h4 className="font-extrabold text-slate-200 dark:text-slate-200">Google Workspace Identity</h4>
                        <p className="text-[10px] text-slate-400">Authenticated: {user.email}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Connected</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black dark:bg-black rounded-2xl border border-slate-700">
                      <div>
                        <h4 className="font-extrabold text-slate-200 dark:text-slate-200">ORCID Registry Identifier</h4>
                        <p className="text-[10px] text-slate-400">Allows automatic synchronizations of global publications metadata.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setAlertMsg({ type: 'success', text: 'Connecting to ORCID authentication sandbox...' });
                          setTimeout(() => setAlertMsg(null), 3000);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        Link Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- DATA & STORAGE PANEL ----------------- */}
              {activeSection === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Data & Archive Portability</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Export, package or review storage consumption inside your personal sandbox.</p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="p-4 bg-black dark:bg-black rounded-2xl border border-slate-700">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="font-bold text-slate-300 dark:text-slate-300">Workspace Storage Allocated</span>
                        <span className="font-mono text-slate-400">12.5 MB of 1.00 GB</span>
                      </div>
                      <div className="w-full bg-zinc-900 dark:bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '1.2%' }} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAlertMsg({ type: 'success', text: 'Compiling research portfolio JSON backup...' });
                          setTimeout(() => setAlertMsg(null), 3000);
                        }}
                        className="px-4 py-2 bg-black dark:bg-black border border-slate-700 hover:bg-zinc-900 text-slate-200 font-bold rounded-xl"
                      >
                        Download My Data
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAlertMsg({ type: 'success', text: 'Exporting publication bibliography in BibTeX format...' });
                          setTimeout(() => setAlertMsg(null), 3000);
                        }}
                        className="px-4 py-2 bg-black dark:bg-black border border-slate-700 hover:bg-zinc-900 text-slate-200 font-bold rounded-xl"
                      >
                        Export Bibliography (.bib)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- SUBSCRIPTION & BILLING PANEL ----------------- */}
              {activeSection === 'subscription' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Subscription Tier & Funding Roles</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Control subscription parameters, view invoice histories or raise matching roles.</p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-8 opacity-10 pointer-events-none">
                        <UserCheck className="w-40 h-40" />
                      </div>

                      <div className="space-y-4 relative z-10">
                        <div>
                          <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">Active Consortium Role</span>
                          <h3 className="text-xl font-extrabold mt-2">Aurenix Professional Scholar</h3>
                        </div>
                        <p className="text-xs text-emerald-100 max-w-lg">
                          Unlocks infinite publication uploads, direct alliance message pipelines, real-time AI recommend feeds and certified ORCID identifiers verification.
                        </p>
                        <div className="text-lg font-bold">Free Trial Tier <span className="text-xs font-normal opacity-85">($0 / lifetime trial)</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- HELP & SUPPORT PANEL ----------------- */}
              {activeSection === 'help' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Help & Structural Support Center</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Connect with operations teams, submit technical bug reports or propose platform enhancements.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <div className="p-4 bg-black dark:bg-black rounded-2xl text-left border border-slate-700 space-y-2">
                      <h4 className="font-extrabold text-slate-200 dark:text-slate-200">Contact Help Operations</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 leading-relaxed">Have a query regarding co-author credentials verification or publication indexing? File a support case.</p>
                      <a href="mailto:support@aurenix-research.org" className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 hover:underline">
                        support@aurenix-research.org
                      </a>
                    </div>

                    <div className="p-4 bg-black dark:bg-black rounded-2xl text-left border border-slate-700 space-y-2">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Community Consortium Forum</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Collaborate and chat with other process chemistry and bioenergy researchers across West Africa.</p>
                      <button 
                        type="button"
                        onClick={() => {
                          setAlertMsg({ type: 'success', text: 'Navigating to decentralized forum...' });
                          setTimeout(() => setAlertMsg(null), 3000);
                        }}
                        className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 hover:underline"
                      >
                        Enter Forum
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- DANGER ZONE PANEL ----------------- */}
              {activeSection === 'danger' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 font-display">Danger Zone</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Irreversible actions regarding account ownership, research deactivations and data wipes.</p>
                  </div>

                  <div className="p-5 bg-black dark:bg-black border border-rose-900/50 rounded-2xl space-y-4 text-xs text-left pt-4">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-rose-800 dark:text-rose-400">Deactivate Researcher Account</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Temporarily hide your public portfolio page, active innovation projects and publications from our AI matching pipelines and Explore page indexes.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const conf = window.confirm('Are you absolutely sure you want to deactivate your researcher portfolio?');
                        if (conf) {
                          setAlertMsg({ type: 'success', text: 'Researcher portfolio successfully deactivated.' });
                          setTimeout(() => setAlertMsg(null), 3000);
                        }
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Deactivate Portfolio
                    </button>
                  </div>
                </div>
              )}

              {/* BOTTOM ACTIONS BAR */}
              <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-end gap-3 bg-black dark:bg-black">
                <button 
                  type="button" 
                  onClick={() => onNavigateToView('dashboard')}
                  className="px-4 py-2.5 bg-black hover:bg-zinc-900 dark:bg-black dark:hover:bg-zinc-900 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/10"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
