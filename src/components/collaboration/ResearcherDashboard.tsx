import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  FileText, 
  Sparkles, 
  Heart, 
  Coins, 
  MessageSquare, 
  Users, 
  CheckSquare, 
  Activity, 
  Globe, 
  Building, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  Compass, 
  ChevronDown 
} from 'lucide-react';
import { Project, AllianceOpportunity, Application, Workspace, MatchScore } from './types';
import { getProjects, getApplications, getWorkspaces, getAlliances } from '../../services/collaborationDb';
import { INITIAL_MATCH_SCORES } from './mockData';

interface ResearcherDashboardProps {
  user: any;
  onLaunchWorkspace: (workspace: Workspace) => void;
  onRefreshAll: () => void;
  onViewMarketplace: () => void;
  onSuccess: (msg: string) => void;
}

type DashboardTab = 
  | 'projects' 
  | 'applications' 
  | 'matches' 
  | 'saved' 
  | 'progress';

export default function ResearcherDashboard({ 
  user, 
  onLaunchWorkspace, 
  onRefreshAll, 
  onViewMarketplace, 
  onSuccess 
}: ResearcherDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('projects');
  
  // States
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [alliances, setAlliances] = useState<AllianceOpportunity[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<AllianceOpportunity[]>([]);
  
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      const projs = await getProjects(user.uid);
      const apps = await getApplications(user.uid, false);
      const allAlliances = await getAlliances();
      const works = await getWorkspaces(user.uid);

      setProjects(projs);
      setApplications(apps);
      setAlliances(allAlliances);
      setWorkspaces(works);

      // Load saved bookmark IDs
      const savedIdsStr = localStorage.getItem(`saved_alliances_${user.uid}`);
      if (savedIdsStr) {
        const savedIds: string[] = JSON.parse(savedIdsStr);
        setSavedOpportunities(allAlliances.filter(a => savedIds.includes(a.id)));
      }
    }
    loadDashboardData();
  }, [user]);

  // Automated match scorer calculation for "Matches" tab
  const getScoredMatches = () => {
    if (projects.length === 0) return [];
    
    const results: { project: Project; alliance: AllianceOpportunity; score: number; reasons: string[] }[] = [];
    
    // Check our standard matches seed
    INITIAL_MATCH_SCORES.forEach(m => {
      const p = projects.find(item => item.id === m.projectId);
      const a = alliances.find(item => item.id === m.opportunityId);
      if (p && a) {
        results.push({ project: p, alliance: a, score: m.score, reasons: m.matchReasons });
      }
    });

    // Fallback dynamic generator
    if (results.length === 0 && projects.length > 0 && alliances.length > 0) {
      projects.forEach(p => {
        alliances.forEach(a => {
          let score = 55;
          const reasons = ['Geographic eligibility matches'];
          if (p.researchArea === a.researchAreas[0]) {
            score += 30;
            reasons.push('High research area alignment');
          }
          if (a.supportOffered.includes(p.supportNeeded[0])) {
            score += 10;
            reasons.push('Support mechanisms compatible');
          }
          score = Math.min(score, 99);
          if (score > 70) {
            results.push({ project: p, alliance: a, score, reasons });
          }
        });
      });
    }

    return results.sort((a, b) => b.score - a.score);
  };

  const getStepDescription = (stepNum: number) => {
    const steps = [
      'Published Opportunity',
      'Researcher Applied',
      'Reviewing Technical Proposal',
      'Interview & Sync scheduled',
      'Contract & Agreement sign-off',
      'Secured Milestone Agreements',
      'First tranche disbursed',
      'Active lab/operations auditing',
      'Progress metrics validation',
      'Closeout evaluation report',
      'Impact metrics filed'
    ];
    return steps[stepNum - 1] || 'Under review';
  };

  const scoredMatches = getScoredMatches();

  return (
    <div className="space-y-8 text-left" id="researcher_dashboard_canvas">
      
      {/* Sub menu tabs row */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-1 shrink-0">
        {(['projects', 'applications', 'matches', 'saved', 'progress'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition border-b-2 -mb-0.5 capitalize flex items-center gap-1.5 ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'projects' && <Folder className="w-3.5 h-3.5" />}
            {tab === 'applications' && <FileText className="w-3.5 h-3.5" />}
            {tab === 'matches' && <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-600" />}
            {tab === 'saved' && <Heart className="w-3.5 h-3.5 text-rose-500" />}
            {tab === 'progress' && <Activity className="w-3.5 h-3.5" />}
            {tab === 'saved' ? 'Saved Alliances' : tab}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: MY PROJECTS */}
          {activeTab === 'projects' && (
            <motion.div
              key="projects-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">My Published Research Projects</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manage details and visibility scopes of your active studies.</p>
                </div>
                <button
                  onClick={() => {
                    const btn = document.getElementById('btn_publish_collab_project');
                    if (btn) btn.click();
                  }}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + New Study
                </button>
              </div>

              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((proj) => (
                    <div key={proj.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between hover:bg-slate-50/50 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                            TRL {proj.trl} • {proj.currentStage}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">Visibility: {proj.visibility}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-display line-clamp-1">{proj.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{proj.proposedSolution}</p>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {proj.supportNeeded.map((sup, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              Need: {sup}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                        <span>Institution: {proj.institution}</span>
                        <span>{proj.country}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-4">
                  <Folder className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-600">No Projects Published Yet</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Submit your ongoing process kinetics or biodigester blueprints to activate matches.</p>
                  </div>
                  <button
                    onClick={() => {
                      const btn = document.getElementById('btn_publish_collab_project');
                      if (btn) btn.click();
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Publish a Research Project
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: APPLICATIONS SUBMITTED */}
          {activeTab === 'applications' && (
            <motion.div
              key="applications-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Submitted Applications</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Track reviews, scheduled interviews, and access collaborative workspaces once accepted.</p>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((app) => {
                    const linkedAlliance = alliances.find(a => a.id === app.opportunityId);
                    const linkedWorkspace = workspaces.find(w => w.applicationId === app.id);
                    const isExpanded = expandedApp === app.id;

                    return (
                      <div key={app.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs text-xs">
                        
                        {/* Summary Block */}
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/30 transition">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 font-display text-sm">
                                {linkedAlliance ? linkedAlliance.title : 'Innovation Challenge Proposal'}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[9px] uppercase ${
                                app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                                app.status === 'Interview' ? 'bg-indigo-100 text-indigo-800' :
                                app.status === 'Review' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">Associated Project: <strong className="text-slate-600">{app.projectTitle}</strong></p>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                            {app.status === 'Accepted' && linkedWorkspace && (
                              <button
                                onClick={() => onLaunchWorkspace(linkedWorkspace)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition flex items-center gap-1 shadow-sm"
                              >
                                Launch Shared Workspace
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer transition"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Expandable detail progress timeline */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden border-t border-slate-100 bg-slate-50/40 p-5 space-y-4"
                            >
                              {/* Workflow Step Tracker */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Application Progress Stage:</h4>
                                <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-700">Stage {app.timelineStep}/11: {getStepDescription(app.timelineStep)}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">Last updated: {new Date(app.updatedAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {linkedAlliance && (
                                <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-mono pt-1">
                                  <span>Partner Body: {linkedAlliance.orgName}</span>
                                  <span className="text-right">Funding offered: {linkedAlliance.fundingAmount}</span>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-4">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-600">No Active Applications</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Browse the Alliance Marketplace or Innovation Challenges to submit a design proposal.</p>
                  </div>
                  <button
                    onClick={onViewMarketplace}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Go to Marketplace
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: AI MATCHES */}
          {activeTab === 'matches' && (
            <motion.div
              key="matches-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Automated AI Match Scores</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Our engine calculates technology, geographic, and support requirements to match alliances.</p>
              </div>

              {scoredMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scoredMatches.map((match, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between hover:bg-slate-50/50 transition relative overflow-hidden">
                      <div className="space-y-3.5">
                        
                        {/* Score badge */}
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-400">Matched Study: <strong>{match.project.title.substring(0, 15)}...</strong></span>
                          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            {match.score}% Alignment
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 font-display">{match.alliance.title}</h4>
                          <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">{match.alliance.orgName}</span>
                        </div>

                        {/* Match reasons */}
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                          <h5 className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Match Alignment Reasons:</h5>
                          <ul className="space-y-1 text-[10px] text-slate-600">
                            {match.reasons.map((reason, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0"></span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                      <button
                        onClick={() => {
                          const marketEl = document.getElementById('alliance_marketplace_section');
                          if (marketEl) marketEl.scrollIntoView({ behavior: 'smooth' });
                          onSuccess(`Opened details for matched opportunity.`);
                        }}
                        className="mt-5 w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1"
                      >
                        Review Alignment and Apply
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-2">
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-600">No Match Alignments Yet</h4>
                  <p className="text-[10px] text-slate-400">Publish more projects with detailed TRL and support definitions to seed matches.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: SAVED OPPORTUNITIES */}
          {activeTab === 'saved' && (
            <motion.div
              key="saved-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Bookmarked Opportunities</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Quickly access and submit applications to alliances you have saved.</p>
              </div>

              {savedOpportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedOpportunities.map((all) => (
                    <div key={all.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between hover:bg-slate-50/50 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>{all.orgName}</span>
                          <span className="font-bold text-emerald-700 font-mono">{all.fundingAmount}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-display line-clamp-1">{all.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{all.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          const marketEl = document.getElementById('alliance_marketplace_section');
                          if (marketEl) marketEl.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="mt-5 w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1"
                      >
                        Submit Proposal Proposal Now
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-4">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-600">No Saved Bookmarks</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Click the heart icons in the marketplace to add opportunities here.</p>
                  </div>
                  <button
                    onClick={onViewMarketplace}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Go to Marketplace
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: PROGRESS */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Funding & Deliverables Progress</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Once an application is Accepted, funding and milestone release gates are tracked interactively.</p>
              </div>

              {workspaces.length > 0 ? (
                <div className="space-y-4">
                  {workspaces.map((work) => (
                    <div key={work.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-display">{work.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Workspace Budget Cap: {work.budget.total}</p>
                        </div>
                        <button
                          onClick={() => onLaunchWorkspace(work)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                        >
                          Open Workspace
                        </button>
                      </div>

                      {/* Ledger breakdown status */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Funds Distributed:</span>
                          <strong className="block text-slate-900 mt-1">{work.budget.spent}</strong>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Unreleased Ledger Balance:</span>
                          <strong className="block text-emerald-700 mt-1">{work.budget.remaining}</strong>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Milestones Met:</span>
                          <strong className="block text-slate-900 mt-1">
                            {work.milestones.filter(m => m.status === 'Completed').length} / {work.milestones.length} Completed
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-2">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-600">No Active Disbursals</h4>
                  <p className="text-[10px] text-slate-400">Collaborative ledger trackers appear once a partner Accepts your proposal.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
