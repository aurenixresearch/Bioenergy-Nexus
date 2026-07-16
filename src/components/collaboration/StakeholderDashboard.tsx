import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  FileText, 
  Users, 
  Coins, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Calendar, 
  Activity, 
  ArrowRight, 
  X, 
  Check, 
  ChevronRight, 
  Trash2 
} from 'lucide-react';
import { Project, AllianceOpportunity, Application, Workspace } from './types';
import { getAlliances, getApplications, getWorkspaces, updateApplicationStatus, getProjects } from '../../services/collaborationDb';

interface StakeholderDashboardProps {
  user: any;
  onLaunchWorkspace: (workspace: Workspace) => void;
  onRefreshAll: () => void;
  onSuccess: (msg: string) => void;
}

type StakeholderTab = 
  | 'alliances' 
  | 'received' 
  | 'matched' 
  | 'sponsored' 
  | 'analytics';

export default function StakeholderDashboard({ 
  user, 
  onLaunchWorkspace, 
  onRefreshAll, 
  onSuccess 
}: StakeholderDashboardProps) {
  const [activeTab, setActiveTab] = useState<StakeholderTab>('received');
  
  // States
  const [alliances, setAlliances] = useState<AllianceOpportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loadingAppId, setLoadingAppId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const creatorId = user?.uid || 'sandbox-stakeholder';
      const myAlls = await getAlliances(creatorId);
      const apps = await getApplications(creatorId, true); // true = get stakeholder view
      const works = await getWorkspaces();
      const allProjects = await getProjects();

      setAlliances(myAlls);
      setApplications(apps);
      setWorkspaces(works);
      setProjects(allProjects);
    }
    loadData();
  }, [user]);

  const handleUpdateStatus = async (appId: string, status: Application['status'], nextStep: number) => {
    setLoadingAppId(appId);
    try {
      await updateApplicationStatus(appId, status, nextStep);
      onSuccess(`Application status updated to: ${status}.`);
      
      // Refresh local states
      const apps = await getApplications(user?.uid || 'sandbox-stakeholder', true);
      const works = await getWorkspaces();
      setApplications(apps);
      setWorkspaces(works);
      onRefreshAll();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppId(null);
    }
  };

  const getSponsorshipMetrics = () => {
    const activeWorks = workspaces.filter(w => w.status === 'Active');
    let totalSponsorship = 15000 * activeWorks.length;
    let spent = 4200 * activeWorks.length;
    let remaining = totalSponsorship - spent;

    return {
      total: `$${totalSponsorship.toLocaleString()}`,
      spent: `$${spent.toLocaleString()}`,
      remaining: `$${remaining.toLocaleString()}`
    };
  };

  const metrics = getSponsorshipMetrics();

  return (
    <div className="space-y-8 text-left" id="stakeholder_dashboard_canvas">
      
      {/* Tab selectors */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-1 shrink-0">
        {(['received', 'alliances', 'matched', 'sponsored', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition border-b-2 -mb-0.5 capitalize flex items-center gap-1.5 ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'received' && <FileText className="w-3.5 h-3.5" />}
            {tab === 'alliances' && <Building className="w-3.5 h-3.5" />}
            {tab === 'matched' && <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
            {tab === 'sponsored' && <Activity className="w-3.5 h-3.5" />}
            {tab === 'analytics' && <Coins className="w-3.5 h-3.5" />}
            {tab === 'received' ? 'Applications Received' : tab === 'alliances' ? 'My Alliances' : tab === 'sponsored' ? 'Sponsored Projects' : tab}
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: APPLICATIONS RECEIVED */}
          {activeTab === 'received' && (
            <motion.div
              key="received-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Submitted Scholar Proposals</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Review credentials and technical readiness. Move candidates to Interview or Accept to spawn workspaces.</p>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const linkedAlliance = alliances.find(a => a.id === app.opportunityId);
                    const associatedProject = projects.find(p => p.id === app.projectId);
                    
                    return (
                      <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-4 text-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 font-display">{app.projectTitle}</h4>
                              <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[9px] uppercase ${
                                app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                                app.status === 'Interview' ? 'bg-indigo-100 text-indigo-800' :
                                app.status === 'Review' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Submitted by: <strong className="text-slate-600">{app.applicantName}</strong> for alliance: <span className="text-slate-500 font-semibold">{linkedAlliance?.title || 'Open Program'}</span></p>
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono">Date: {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>

                        {associatedProject && (
                          <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                            <p><strong>Problem Statement:</strong> {associatedProject.problemStatement}</p>
                            <p><strong>Proposed Solution:</strong> {associatedProject.proposedSolution}</p>
                            <p><strong>Technology Readiness Level:</strong> TRL {associatedProject.trl} ({associatedProject.currentStage})</p>
                          </div>
                        )}

                        {/* Interactive Workflow Actions */}
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 justify-end">
                          {app.status === 'Submitted' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Review', 3)}
                              disabled={loadingAppId === app.id}
                              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg font-bold cursor-pointer transition"
                            >
                              Move to Tech Review
                            </button>
                          )}
                          {(app.status === 'Submitted' || app.status === 'Review') && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Interview', 4)}
                              disabled={loadingAppId === app.id}
                              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold cursor-pointer transition"
                            >
                              Schedule Video Interview
                            </button>
                          )}
                          {app.status !== 'Accepted' && app.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Accepted', 5)}
                              disabled={loadingAppId === app.id}
                              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold cursor-pointer transition flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Accept & Build Workspace
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-2">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-600">No Proposals Received</h4>
                  <p className="text-[10px] text-slate-400">Applications submitted to your published opportunities will show up here.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: ALLIANCE OPPORTUNITIES LISTINGS */}
          {activeTab === 'alliances' && (
            <motion.div
              key="alliances-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">My Published Alliances & Grants</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manage and edit your active programs.</p>
                </div>
                <button
                  onClick={() => {
                    const btn = document.getElementById('btn_publish_collab_alliance');
                    if (btn) btn.click();
                  }}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  + Publish Alliance
                </button>
              </div>

              {alliances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {alliances.map((all) => (
                    <div key={all.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between hover:bg-slate-50/50 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 uppercase">
                          <span>{all.orgType} • {all.country}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{all.fundingAmount}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-display line-clamp-1">{all.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{all.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                        <span>Max Sponsors: {all.maxParticipants}</span>
                        <span>Deadline: {all.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-4">
                  <Building className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-600">No Opportunities Published</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Publish an alliance grant or facility opening to attract African scholars.</p>
                  </div>
                  <button
                    onClick={() => {
                      const btn = document.getElementById('btn_publish_collab_alliance');
                      if (btn) btn.click();
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Publish Alliance Opportunity
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: SPONSORED PROJECTS */}
          {activeTab === 'sponsored' && (
            <motion.div
              key="sponsored-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Active Sponsored Projects</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Track deliverables, ledger balances, and check milestones of your accepted partners.</p>
              </div>

              {workspaces.length > 0 ? (
                <div className="space-y-4">
                  {workspaces.map((work) => (
                    <div key={work.id} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-4 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-display">{work.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Budget cap: {work.budget.total}</span>
                        </div>
                        <button
                          onClick={() => onLaunchWorkspace(work)}
                          className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold cursor-pointer"
                        >
                          Launch Workspace
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Disbursed Ledger:</span>
                          <strong className="block text-slate-900 mt-1 font-semibold">{work.budget.spent}</strong>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Remaining Pool:</span>
                          <strong className="block text-emerald-700 mt-1 font-semibold">{work.budget.remaining}</strong>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Approved Deliverables:</span>
                          <strong className="block text-slate-900 mt-1 font-semibold">
                            {work.deliverables.filter(d => d.status === 'Approved').length} Approved
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/50 space-y-2">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-600">No Sponsored Projects</h4>
                  <p className="text-[10px] text-slate-400">Sponsored workspaces are generated once you Accept received applications.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: SCHOLARS MATCHED */}
          {activeTab === 'matched' && (
            <motion.div
              key="matched-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Matched Scholars & Research Groups</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Scholars with high-relevancy bio-kinetic processes matching your focus areas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400">Ahmadu Bello University</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">96% Relevancy</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-display">High-Yield Anaerobic Digestor for poultry waste</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">processes wet waste to eliminate ammonia toxicity by dual-stage kinetics co-digesting.</p>
                  </div>
                  
                  <button
                    onClick={() => onSuccess('Emailed matching researcher details.')}
                    className="mt-5 w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    Contact Researcher &rarr;
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400">KNUST Ghana</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">92% Relevancy</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-display">Solar-Powered Pyrolysis Cassava Biochar Reactor</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">Processes wet cassava peels into conditioning biochar and bio-oil fractions without wood.</p>
                  </div>
                  
                  <button
                    onClick={() => onSuccess('Emailed matching researcher details.')}
                    className="mt-5 w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    Contact Researcher &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: ANALYTICS LEDGER */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Financial & Ledger Distribution Analytics</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Interactive spreadsheet logs of distributed grants, available pools, and audit dates.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-xs text-xs space-y-1">
                  <span className="text-slate-400 font-mono">Total Capital Committed:</span>
                  <strong className="block text-xl font-extrabold text-slate-900">{metrics.total}</strong>
                </div>
                <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-xs text-xs space-y-1">
                  <span className="text-slate-400 font-mono">Total Disbursed:</span>
                  <strong className="block text-xl font-extrabold text-rose-600">{metrics.spent}</strong>
                </div>
                <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-xs text-xs space-y-1">
                  <span className="text-slate-400 font-mono">Ledger Balance Pool:</span>
                  <strong className="block text-xl font-extrabold text-emerald-700">{metrics.remaining}</strong>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 font-display">Ledger Audit Logs</h4>
                <div className="divide-y divide-slate-100 font-medium">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-700">Substrate Transport & Chromatographs Consumables</span>
                    <span className="text-rose-600 font-mono">-$3,200</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-700">Zeolite sorbent core purchase milestone</span>
                    <span className="text-rose-600 font-mono">-$1,000</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
