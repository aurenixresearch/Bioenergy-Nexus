import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Users, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  Coins, 
  Compass, 
  Award, 
  Layers, 
  Activity, 
  TrendingUp, 
  Heart, 
  Plus, 
  Eye, 
  User, 
  ArrowRight, 
  X, 
  CheckSquare 
} from 'lucide-react';
import { Project, AllianceOpportunity, Workspace } from './types';
import { createProject, createAlliance, getWorkspaces } from '../../services/collaborationDb';
import { getUserProfile } from '../../services/db';

// Subcomponents imports
import ProjectWizard from './ProjectWizard';
import AllianceWizard from './AllianceWizard';
import WorkflowVisualizer from './WorkflowVisualizer';
import ResearcherDashboard from './ResearcherDashboard';
import StakeholderDashboard from './StakeholderDashboard';
import WorkspaceView from './Workspace';

interface CollaborationHomeProps {
  user: any;
  onSignIn: () => void;
  onNavigateToConsole?: () => void;
}

export default function CollaborationHome({ user, onSignIn, onNavigateToConsole }: CollaborationHomeProps) {
  
  // Wizards trigger states
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [showAllianceWizard, setShowAllianceWizard] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [consoleType, setConsoleType] = useState<'none' | 'researcher' | 'stakeholder'>('none');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Notifications alerts
  const [notificationMsg, setNotificationMsg] = useState('');
  const [hasWorkspaces, setHasWorkspaces] = useState(false);

  useEffect(() => {
    async function loadProfileAndWorkspaces() {
      if (user) {
        try {
          const [profile, list] = await Promise.all([
            getUserProfile(user.uid),
            getWorkspaces(user.uid)
          ]);
          setUserProfile(profile);
          setHasWorkspaces(list.length > 0);

          if (profile?.role) {
            const normalizedRole = (profile.role || '').toLowerCase();
            const isScholar = ['student', 'researcher', 'lecturer', 'professor'].some(r => normalizedRole.includes(r));
            if (isScholar) {
              setConsoleType('researcher');
            } else {
              setConsoleType('stakeholder');
            }
          } else {
            // Default fallback if role is missing/empty
            setConsoleType('researcher');
          }
        } catch (err) {
          console.error('Error loading user profile in CollaborationHome:', err);
        }
      } else {
        setUserProfile(null);
        setConsoleType('none');
      }
    }
    loadProfileAndWorkspaces();
  }, [user]);

  const triggerSuccessAlert = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg('');
    }, 5000);
  };

  const getDesignatedConsole = (): 'researcher' | 'stakeholder' => {
    if (!userProfile?.role) return 'researcher';
    const normalizedRole = (userProfile.role || '').toLowerCase();
    const isScholar = ['student', 'researcher', 'lecturer', 'professor'].some(r => normalizedRole.includes(r));
    return isScholar ? 'researcher' : 'stakeholder';
  };

  const handleSaveProject = async (projectData: any) => {
    try {
      await createProject(projectData);
      triggerSuccessAlert('Research project published successfully! Matches calculated instantly.');
      setShowProjectWizard(false);
      // Automatically switch/redirect to operational console if provided
      if (onNavigateToConsole) {
        setTimeout(() => {
          onNavigateToConsole();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAlliance = async (allianceData: any) => {
    try {
      await createAlliance(allianceData);
      triggerSuccessAlert('Alliance opportunity published successfully!');
      setShowAllianceWizard(false);
      // Automatically switch/redirect to operational console if provided
      if (onNavigateToConsole) {
        setTimeout(() => {
          onNavigateToConsole();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stakeholderCategories = [
    { title: 'Universities', desc: 'Symmetric access to feedstock profiles and gas chromatography machinery', icon: GraduationCap },
    { title: 'Industry', desc: 'Optimize biodigester loading parameters and design commercial generators', icon: Briefcase },
    { title: 'Government', desc: 'Sponsor policy briefs and draft regional bioenergy safety roadmaps', icon: Globe },
    { title: 'NGOs', desc: 'Introduce decentralized micro-digesters to rural smallholder farm cooperatives', icon: Users },
    { title: 'Investors', desc: 'Fund high-TRL bio-waste conversion prototypes into utility scale', icon: Coins },
    { title: 'International Organizations', desc: 'Scale circular economy grids and trace localized carbon offsets', icon: Award }
  ];

  const normalizedRole = userProfile?.role?.toLowerCase() || '';
  const isScholar = !userProfile?.role || ['student', 'researcher', 'lecturer', 'professor'].some(r => normalizedRole.includes(r));

  if (activeWorkspace) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 pb-20 text-left relative" id="collaboration_workspace_full">
        <AnimatePresence>
          {notificationMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3.5 rounded-full z-50 flex items-center gap-3 shadow-2xl border border-emerald-500/50 text-xs sm:text-sm font-bold"
            >
              <CheckCircle2 className="w-5 h-5 animate-pulse text-white shrink-0" />
              <span>{notificationMsg}</span>
              <button onClick={() => setNotificationMsg('')} className="p-1 hover:bg-emerald-700/60 rounded-full cursor-pointer bg-transparent border-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <WorkspaceView 
          workspace={activeWorkspace}
          user={user}
          onBack={() => setActiveWorkspace(null)}
          onSuccess={triggerSuccessAlert}
        />
      </div>
    );
  }

  if (showProjectWizard) {
    return (
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 text-left relative" id="project_wizard_full_workspace">
        <AnimatePresence>
          {notificationMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3.5 rounded-full z-50 flex items-center gap-3 shadow-2xl border border-emerald-500/50 text-xs sm:text-sm font-bold"
            >
              <CheckCircle2 className="w-5 h-5 animate-pulse text-white shrink-0" />
              <span>{notificationMsg}</span>
              <button onClick={() => setNotificationMsg('')} className="p-1 hover:bg-emerald-700/60 rounded-full cursor-pointer bg-transparent border-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="max-w-4xl mx-auto space-y-4">
          <button
            onClick={() => setShowProjectWizard(false)}
            className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
          >
            &larr; Back to Collaborations
          </button>
          <ProjectWizard 
            onClose={() => setShowProjectWizard(false)}
            onSave={handleSaveProject}
          />
        </div>
      </div>
    );
  }

  if (showAllianceWizard) {
    return (
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 text-left relative" id="alliance_wizard_full_workspace">
        <AnimatePresence>
          {notificationMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3.5 rounded-full z-50 flex items-center gap-3 shadow-2xl border border-emerald-500/50 text-xs sm:text-sm font-bold"
            >
              <CheckCircle2 className="w-5 h-5 animate-pulse text-white shrink-0" />
              <span>{notificationMsg}</span>
              <button onClick={() => setNotificationMsg('')} className="p-1 hover:bg-emerald-700/60 rounded-full cursor-pointer bg-transparent border-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="max-w-4xl mx-auto space-y-4">
          <button
            onClick={() => setShowAllianceWizard(false)}
            className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
          >
            &larr; Back to Collaborations
          </button>
          <AllianceWizard 
            onClose={() => setShowAllianceWizard(false)}
            onSave={handleSaveAlliance}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-900 pb-20 relative text-left" id="collaboration_ecosystem_container">
      
      {/* Banner / Notification Alert */}
      <AnimatePresence>
        {notificationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3.5 rounded-full z-50 flex items-center gap-3 shadow-2xl border border-emerald-500/50 text-xs sm:text-sm font-bold"
          >
            <CheckCircle2 className="w-5 h-5 animate-pulse text-white shrink-0" />
            <span>{notificationMsg}</span>
            <button onClick={() => setNotificationMsg('')} className="p-1 hover:bg-emerald-700/60 rounded-full cursor-pointer bg-transparent border-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden py-12 sm:py-20 lg:py-24" id="collaboration_hero">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl"></div>

        <div className="w-full px-3 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Aurenix Matchmaking Platform
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-tight">
            Connecting Science with <br className="hidden sm:inline" />
            <span className="text-emerald-600 relative">
              Industrial Scale
              <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600/30 rounded-full"></span>
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 max-w-4xl leading-relaxed">
            Connect researchers, students, and organizations to collaborate, secure funding, access resources, and transform innovative ideas into real-world energy and climate solutions.
          </p>

          {/* Quick Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 pt-4 sm:pt-6 text-left">
            <div className="p-3 sm:p-4 bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200/60 rounded-xl sm:rounded-2xl transition-all">
              <span className="text-slate-500 font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block truncate">Matched Opportunities</span>
              <strong className="block text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 truncate">96% Score</strong>
            </div>
            <div className="p-3 sm:p-4 bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200/60 rounded-xl sm:rounded-2xl transition-all">
              <span className="text-slate-500 font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block truncate">Active Sponsors</span>
              <strong className="block text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 truncate">AfDB, World Bank</strong>
            </div>
            <div className="p-3 sm:p-4 bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200/60 rounded-xl sm:rounded-2xl transition-all">
              <span className="text-slate-500 font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block truncate">Research Areas</span>
              <strong className="block text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 truncate">Anaerobic Kinetics</strong>
            </div>
            <div className="p-3 sm:p-4 bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200/60 rounded-xl sm:rounded-2xl transition-all">
              <span className="text-slate-500 font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider block truncate">Available Pools</span>
              <strong className="block text-base sm:text-xl lg:text-2xl font-extrabold text-emerald-700 mt-0.5 sm:mt-1 truncate">$50,000+</strong>
            </div>
          </div>
        </div>
      </section>

      {/* THREE CONNECTED USER PORTAL JOURNEYS */}
      <section className="py-8 sm:py-12 w-full px-3 sm:px-6 lg:px-8" id="ecosystem_portals">
        <div className={`grid grid-cols-1 ${user ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-6`}>
          
          {/* Journey 1: Researchers & Students */}
          {(!user || isScholar) && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition">
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">For Scholars</span>
                <h3 className="text-lg font-bold text-slate-900 font-display">Student & Scholar Pipeline</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submit ongoing biochemical process designs, secure funding tranches, utilize ISO-certified GC-HPLC equipment, and commercialize your prototypes.
                </p>
              </div>
              <button
                id="btn_publish_collab_project"
                onClick={() => {
                  if (!user) {
                    onSignIn();
                  } else {
                    setShowProjectWizard(true);
                  }
                }}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Publish Research Project
              </button>
            </div>
          )}

          {/* Journey 2: Operational Consoles */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition relative overflow-hidden">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full uppercase">Operational Consoles</span>
              <h3 className="text-lg font-bold text-slate-900 font-display">Active Workspace Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Toggle your active Researcher or Stakeholder dashboard to inspect live matches, proposed circular alliances, and manage workspaces.
              </p>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  onSignIn();
                } else if (consoleType === 'none') {
                  setConsoleType(getDesignatedConsole());
                } else {
                  setConsoleType('none');
                }
              }}
              className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              {consoleType !== 'none' ? 'Collapse Active Console' : 'Expand Live Console'}
            </button>
          </div>

          {/* Journey 3: Stakeholders & Partners */}
          {(!user || !isScholar) && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition">
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full uppercase">For Sponsors</span>
                <h3 className="text-lg font-bold text-slate-900 font-display">Stakeholder & Investor Portal</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Publish laboratory bookings, fund active circular startups, review technical proposals, and track secure milestone-driven dispersals.
                </p>
              </div>
              <button
                id="btn_publish_collab_alliance"
                onClick={() => {
                  if (!user) {
                    onSignIn();
                  } else {
                    setShowAllianceWizard(true);
                  }
                }}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Sponsor Alliance Grant
              </button>
            </div>
          )}

        </div>

        {/* Console switch controls placed below the cards - only shown if not logged in */}
        {!user && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/50 w-full max-w-md shadow-xs">
              <button
                onClick={() => {
                  onSignIn();
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  consoleType === 'researcher' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Researcher Console
              </button>
              <button
                onClick={() => {
                  onSignIn();
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  consoleType === 'stakeholder' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Stakeholder Console
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DYNAMIC CONSOLE DASHBOARD AREA */}
      <AnimatePresence>
        {consoleType !== 'none' && user && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="py-6 sm:py-12 w-full px-3 sm:px-6 lg:px-8"
            id="collaboration_inline_consoles"
          >
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    {consoleType === 'researcher' ? 'Researcher Control Panel' : 'Stakeholder Investor Panel'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {consoleType === 'researcher' 
                      ? 'Track your circular bioprocess submissions, verify algorithmic match-scores, and enter secure digital workspaces.' 
                      : 'Review proposed chemical project profiles, distribute funding milestones, and verify ISO-equipment matches.'}
                  </p>
                </div>
                <button 
                  onClick={() => setConsoleType('none')} 
                  className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer transition text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {consoleType === 'researcher' ? (
                <ResearcherDashboard 
                  user={user}
                  onLaunchWorkspace={(work) => setActiveWorkspace(work)}
                  onRefreshAll={() => {}}
                  onViewMarketplace={() => {}}
                  onSuccess={triggerSuccessAlert}
                />
              ) : (
                <StakeholderDashboard 
                  user={user}
                  onLaunchWorkspace={(work) => setActiveWorkspace(work)}
                  onRefreshAll={() => {}}
                  onSuccess={triggerSuccessAlert}
                />
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ANIMATED TIMELINES AND WORKFLOWS */}
      <section className="py-6 sm:py-12 w-full px-3 sm:px-6 lg:px-8">
        <WorkflowVisualizer onNavigateToConsole={onNavigateToConsole} />
      </section>

      {/* STAKEHOLDER CATEGORY EXPLANATION CARDS */}
      <section className="py-6 sm:py-12 w-full px-3 sm:px-6 lg:px-8" id="stakeholder_categories">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Operational Scope</span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">Ecosystem Roles & Support Parameters</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            We actively coordinate multiple aligned categories to optimize bioenergy process pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {stakeholderCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5 sm:block space-y-0 sm:space-y-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-display group-hover:text-emerald-950 transition-colors">{cat.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 sm:mt-1.5">{cat.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WIZARDS POPUPS */}
      <AnimatePresence>
        {showProjectWizard && (
          <ProjectWizard 
            onClose={() => setShowProjectWizard(false)}
            onSave={handleSaveProject}
          />
        )}

        {showAllianceWizard && (
          <AllianceWizard 
            onClose={() => setShowAllianceWizard(false)}
            onSave={handleSaveAlliance}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
