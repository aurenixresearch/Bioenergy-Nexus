import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Sliders, Sparkles, Building, FlaskConical, Calendar, Target, HelpCircle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { InnovationProject } from '../services/db';
import { User as FirebaseUser } from 'firebase/auth';

interface ProjectDetailsPageProps {
  projectId: string;
  user: FirebaseUser | null;
  onBack: () => void;
  projects: InnovationProject[];
  onUpdateProject: (id: string, fields: Partial<InnovationProject>) => Promise<any>;
}

export default function ProjectDetailsPage({
  projectId,
  user,
  onBack,
  projects,
  onUpdateProject
}: ProjectDetailsPageProps) {
  const [project, setProject] = useState<InnovationProject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [trl, setTrl] = useState(4);
  const [status, setStatus] = useState<InnovationProject['status']>('Draft');
  const [fundingStatus, setFundingStatus] = useState<InnovationProject['fundingStatus']>('Pending');
  const [progress, setProgress] = useState(30);
  const [industryPartner, setIndustryPartner] = useState('');
  const [laboratoryPartner, setLaboratoryPartner] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const found = projects.find(p => p.id === projectId);
    if (found) {
      setProject(found);
      setTitle(found.title);
      setTrl(found.trl);
      setStatus(found.status);
      setFundingStatus(found.fundingStatus);
      setProgress(found.progress);
      setIndustryPartner(found.industryPartner);
      setLaboratoryPartner(found.laboratoryPartner);
      setDescription(found.description || '');
    }
  }, [projectId, projects]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsSaving(true);
    try {
      await onUpdateProject(project.id, {
        title,
        trl,
        status,
        fundingStatus,
        progress,
        industryPartner,
        laboratoryPartner,
        description
      });
      setProject({
        ...project,
        title,
        trl,
        status,
        fundingStatus,
        progress,
        industryPartner,
        laboratoryPartner,
        description,
        lastUpdated: new Date().toISOString()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating project details:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return (
      <div className="py-20 text-center space-y-4 max-w-lg mx-auto" id="project_not_found">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Project Dossier Not Found</h3>
        <p className="text-xs text-slate-500">The requested project ID may be invalid or you may not have sufficient access permissions.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left" id="project_details_workspace">
      {/* Back Button & Top Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          id="btn_back_to_dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md uppercase tracking-wider">
            Technology Readiness Level (TRL) {trl}
          </span>
          <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-md uppercase tracking-wider">
            {status}
          </span>
        </div>
      </div>

      {/* Main Title Banner & Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Aurenix Research Core Dossier</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white leading-tight">
          {project.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          {project.description || 'No detailed abstract recorded for this operational biodigester research stream. Use the workspace controls below to establish coordinates, feedstock yield metrics, and chemical digestion bounds.'}
        </p>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2.5 shadow-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>Your operational project changes have been securely synchronized with the Aurenix Cloud Repository!</span>
        </div>
      )}

      {/* Grid Layout: Detailed Workspace Information vs Editing Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Metadata Cards and Progress Visualizers */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Tracker Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Project Progress</h3>
              <span className="text-xs font-mono font-bold text-emerald-600">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed leading-snug">
              Milestone delivery updates are logged directly to the operational dashboard timeline for peer citation review.
            </p>
          </div>

          {/* Dossier Coordinates & Partners Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Institutional Alignments</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                  <Building className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Industry Sponsor</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{industryPartner || 'Aurenix Partner Network'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-xl">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Hosting Laboratory</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{laboratoryPartner || 'National Bioenergy Laboratory'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Last Synced Timestamp</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{new Date(project.lastUpdated).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
                  <Target className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Funding Support Level</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{fundingStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Details View / Interactive Edit Terminal */}
        <div className="lg:col-span-2">
          {!isEditing ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Dossier Overview</h2>
                  <p className="text-xs text-slate-400">Browse published study metrics or toggle workspace editing.</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 cursor-pointer transition shadow-xs"
                >
                  Edit Workspace Parameters
                </button>
              </div>

              <div className="space-y-5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono text-slate-800 dark:text-slate-300 uppercase tracking-wider">Abstract Objectives</h4>
                  <p className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl italic">
                    "{description || 'This bioenergy deployment model targets sustainable carbon offset metrics and raw feedstock parameters. Toggle the edit button above to customize objective details and target achievements.'}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <span className="block text-[10px] uppercase font-bold font-mono text-slate-400">Sponsor Status</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{industryPartner || 'Internal Funding Stream'}</p>
                  </div>
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <span className="block text-[10px] uppercase font-bold font-mono text-slate-400">Hosting Facility</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{laboratoryPartner || 'Aurenix Affiliated Lab'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Edit Project Parameters</h2>
                  <p className="text-xs text-slate-400">Update development milestones, readiness indices, and abstractions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5 font-sans">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Project Dossier Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition"
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Technology Readiness Index (TRL) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Technology Readiness Level (TRL)</label>
                    <select
                      value={trl}
                      onChange={(e) => setTrl(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <option key={num} value={num}>Level {num} (TRL {num})</option>
                      ))}
                    </select>
                  </div>

                  {/* Development Stage status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Development Stage</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition"
                    >
                      <option value="Draft">Drafting Phase</option>
                      <option value="Published">Active Publication</option>
                      <option value="Under Review">Under Peer Review</option>
                      <option value="Completed">Completed Study</option>
                    </select>
                  </div>

                  {/* Funding level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Funding Allocation Status</label>
                    <select
                      value={fundingStatus}
                      onChange={(e) => setFundingStatus(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition"
                    >
                      <option value="Pending">Approval Pending</option>
                      <option value="Approved">Fully Funded</option>
                      <option value="Rejected">Allocation Rejected</option>
                      <option value="In Progress">Active Review</option>
                    </select>
                  </div>

                  {/* Task Completion Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Milestone Progress Indicator</label>
                      <span className="text-xs font-mono font-bold text-emerald-600">{progress}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className="flex-grow accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Sponsoring alignments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Industry Sponsor</label>
                    <input
                      type="text"
                      value={industryPartner}
                      onChange={(e) => setIndustryPartner(e.target.value)}
                      placeholder="e.g. Aurenix Partner Network"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Hosting Lab / Facility</label>
                    <input
                      type="text"
                      value={laboratoryPartner}
                      onChange={(e) => setLaboratoryPartner(e.target.value)}
                      placeholder="e.g. Bioenergy Research Lab"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>
                </div>

                {/* Abstract Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Operational Abstract & Bounds</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Interpret process kinetics, feedstock constraints, organic chemical configurations, and target carbon-offsets..."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none transition resize-none"
                  />
                </div>

                {/* Submit Controls */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Synchronizing parameters...' : 'Save Parameters'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition"
                  >
                    Discard
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
