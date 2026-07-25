import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Building, Coins, MapPin, Calendar, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AllianceOpportunity, Project } from './collaboration/types';
import { getAlliances, getProjects, submitApplication } from '../services/collaborationDb';
import { User as FirebaseUser } from 'firebase/auth';

interface AllianceDetailsPageProps {
  allianceId: string;
  user: FirebaseUser | null;
  onBack: () => void;
  onSignIn: () => void;
  onSuccess: (msg: string) => void;
}

export default function AllianceDetailsPage({
  allianceId,
  user,
  onBack,
  onSignIn,
  onSuccess
}: AllianceDetailsPageProps) {
  const [alliance, setAlliance] = useState<AllianceOpportunity | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [allAlliances, allProjects] = await Promise.all([
          getAlliances(),
          user ? getProjects(user.uid) : Promise.resolve([])
        ]);
        const found = allAlliances.find(a => a.id === allianceId);
        if (found) {
          setAlliance(found);
        }
        setProjects(allProjects);
      } catch (err) {
        console.error('Error loading alliance details:', err);
      }
    }
    loadData();
  }, [allianceId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }
    if (!selectedProjectId) {
      setErrorMsg('Please select one of your published projects to submit for this alliance.');
      return;
    }
    if (!alliance) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const matchedProject = projects.find(p => p.id === selectedProjectId);
      await submitApplication({
        projectId: selectedProjectId,
        opportunityId: alliance.id,
        applicantId: user.uid,
        applicantName: user.displayName || 'Lead Scholar',
        projectTitle: matchedProject?.title || 'Joint Study',
        status: 'Submitted',
        timelineStep: 1
      });

      setSuccessMsg(`Successfully applied to alliance: ${alliance.title}!`);
      onSuccess(`Successfully applied to alliance: ${alliance.title}!`);
      setSelectedProjectId('');
    } catch (err) {
      setErrorMsg('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!alliance) {
    return (
      <div className="py-20 text-center space-y-4 max-w-lg mx-auto" id="alliance_not_found">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Alliance Opportunity Not Found</h3>
        <p className="text-xs text-slate-500">The requested alliance may be closed or you may not have sufficient access permissions.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collaborations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left" id="alliance_details_workspace">
      {/* Top Back Action Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          id="btn_back_to_alliances"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collaborations
        </button>
        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md uppercase tracking-wider">
          {alliance.orgType} Alliance
        </span>
      </div>

      {/* Alliance Logo, Title and Host info */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {alliance.logo && (
          <img 
            src={alliance.logo} 
            alt={alliance.orgName} 
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border border-slate-100" 
          />
        )}
        <div className="space-y-1.5 flex-grow">
          <div className="flex items-center gap-2 text-emerald-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{alliance.orgName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white leading-tight">
            {alliance.title}
          </h1>
        </div>
      </div>

      {/* Success Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2.5 shadow-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Alliance details vs Fast-Track Application Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: General Opportunity Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Opportunity Parameters</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Eligible Country</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{alliance.country}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-xl">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Funding / Grant Support</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{alliance.fundingAmount || 'Unspecified support / In-kind'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Submission Window Closes</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{alliance.deadline || 'Rolling Submission'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
                  <Building className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Institution Type</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{alliance.orgType}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Core Technologies</h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {alliance.technologyAreas?.map((tech, i) => (
                <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9px] font-mono font-bold uppercase border border-slate-100 dark:border-slate-800/40">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Detailed description and Apply Form on the page */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display border-b border-slate-50 dark:border-slate-800 pb-3">
              Alliance Scope & Requirements
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              {alliance.description}
            </p>
            <div className="space-y-3 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Specialized Research Areas Supported</h4>
              <div className="flex flex-wrap gap-1.5">
                {alliance.researchAreas?.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold rounded-lg text-xs">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Core Proposal Submission Area on the Page */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="space-y-1 border-b border-slate-50 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Submit Collaborative Application</h3>
              <p className="text-xs text-slate-400">Fast-track your proposal entry by anchoring it to an active research project.</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select active project from your dashboard</label>
                {projects.length > 0 ? (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition"
                  >
                    <option value="">-- Choose project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl text-center space-y-3">
                    <p className="text-xs text-slate-500">You do not have any published projects to apply with in this sandbox stream.</p>
                    <button
                      type="button"
                      onClick={() => {
                        window.history.pushState(null, '', '/dashboard');
                        window.dispatchEvent(new Event('popstate'));
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      + Create a Project first
                    </button>
                  </div>
                )}
              </div>

              {user ? (
                <button
                  type="submit"
                  disabled={isSubmitting || projects.length === 0}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Submitting proposal...' : 'Submit Collaborative Proposal'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Sign In with Google to Submit
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
