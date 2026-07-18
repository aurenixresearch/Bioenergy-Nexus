import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  PenTool, 
  ExternalLink, 
  Copy, 
  Archive, 
  Compass, 
  Check, 
  X,
  Gauge,
  Building,
  Atom,
  Clock
} from 'lucide-react';
import { InnovationProject } from '../../services/db';

interface InnovationProjectsProps {
  projects: InnovationProject[];
  onCreateProject: (proj: Omit<InnovationProject, 'id' | 'userId' | 'lastUpdated'>) => Promise<any>;
  onUpdateProject: (id: string, fields: Partial<InnovationProject>) => Promise<any>;
  onDeleteProject: (id: string) => Promise<any>;
}

export default function InnovationProjects({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: InnovationProjectsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<InnovationProject | null>(null);
  const [activeProjectView, setActiveProjectView] = useState<InnovationProject | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [trl, setTrl] = useState(4);
  const [status, setStatus] = useState<InnovationProject['status']>('Draft');
  const [fundingStatus, setFundingStatus] = useState<InnovationProject['fundingStatus']>('Pending');
  const [progress, setProgress] = useState(30);
  const [industryPartner, setIndustryPartner] = useState('');
  const [laboratoryPartner, setLaboratoryPartner] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setTitle('');
    setTrl(4);
    setStatus('Draft');
    setFundingStatus('Pending');
    setProgress(30);
    setIndustryPartner('');
    setLaboratoryPartner('');
    setDescription('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreateProject({
      title,
      trl,
      status,
      fundingStatus,
      progress,
      industryPartner: industryPartner || 'Aurenix Partner Network',
      laboratoryPartner: laboratoryPartner || 'National Research Lab',
      description
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleStartEdit = (proj: InnovationProject) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setTrl(proj.trl);
    setStatus(proj.status);
    setFundingStatus(proj.fundingStatus);
    setProgress(proj.progress);
    setIndustryPartner(proj.industryPartner);
    setLaboratoryPartner(proj.laboratoryPartner);
    setDescription(proj.description || '');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    await onUpdateProject(editingProject.id, {
      title,
      trl,
      status,
      fundingStatus,
      progress,
      industryPartner,
      laboratoryPartner,
      description
    });
    setEditingProject(null);
    resetForm();
  };

  const handleDuplicate = async (proj: InnovationProject) => {
    await onCreateProject({
      title: `${proj.title} (Copy)`,
      trl: proj.trl,
      status: 'Draft',
      fundingStatus: 'Pending',
      progress: Math.max(0, proj.progress - 20),
      industryPartner: proj.industryPartner,
      laboratoryPartner: proj.laboratoryPartner,
      description: proj.description || ''
    });
  };

  const handleArchive = async (proj: InnovationProject) => {
    await onUpdateProject(proj.id, { status: 'Archived' });
  };

  return (
    <div className="space-y-6" id="innovation_projects_section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            My Innovation Projects ({projects.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium mt-0.5">
            Monitor circular economy product development from concept to commercialization.
          </p>
        </div>
        <motion.button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </motion.button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <motion.div
              key={proj.id}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left relative overflow-hidden"
            >
              {/* Top Banner accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
              
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider">
                      <Gauge className="w-2.5 h-2.5" />
                      TRL {proj.trl}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                      {proj.title}
                    </h4>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0 text-right">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      proj.status === 'Completed' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' 
                        : proj.status === 'Draft'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                        : proj.status === 'Archived'
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400'
                    }`}>
                      {proj.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      proj.fundingStatus === 'Funded' 
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-400' 
                        : proj.fundingStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {proj.fundingStatus}
                    </span>
                  </div>
                </div>

                {/* description */}
                {proj.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-sans font-medium">
                    {proj.description}
                  </p>
                )}

                {/* Partner metadata */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-[10px] font-sans text-slate-600 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate"><strong>Industry:</strong> {proj.industryPartner}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Atom className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate"><strong>Laboratory:</strong> {proj.laboratoryPartner}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Updated: {new Date(proj.lastUpdated).toLocaleDateString()}
                    </span>
                    <span>{proj.progress}% Done</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex flex-wrap items-center justify-end gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button
                  onClick={() => setActiveProjectView(proj)}
                  className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  View Details
                </button>
                {proj.status === 'Draft' ? (
                  <button
                    onClick={() => handleStartEdit(proj)}
                    className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                  >
                    Continue Draft
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartEdit(proj)}
                    className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDuplicate(proj)}
                  className="px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                  title="Duplicate Project"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {proj.status !== 'Archived' && (
                  <button
                    onClick={() => handleArchive(proj)}
                    className="px-2.5 py-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold transition cursor-pointer"
                    title="Archive Project"
                  >
                    <Archive className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => onDeleteProject(proj.id)}
                  className="px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 dark:text-red-400 rounded-lg text-[10px] font-bold transition cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Innovation Projects Found</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mx-auto">
              Create your first technological or scientific innovation pipeline project here.
            </p>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingProject) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 p-5 flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Product Sandbox</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                    {editingProject ? 'Edit Innovation Project' : 'Launch Innovation Project'}
                  </h3>
                </div>
                <button 
                  onClick={() => { setShowAddModal(false); setEditingProject(null); }}
                  className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={editingProject ? handleUpdateSubmit : handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Project Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Biodegradable Cashew Shell Battery Cells"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-hidden transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* TRL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">TRL Level (1 - 9)</label>
                    <select
                      value={trl}
                      onChange={(e) => setTrl(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-hidden transition"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <option key={n} value={n}>TRL {n} - {n < 4 ? 'Research' : n < 7 ? 'Prototype' : 'Commercial'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Progress Percentage ({progress}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Development Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-hidden transition"
                    >
                      <option value="Draft">Draft (Continue Later)</option>
                      <option value="Active">Active Development</option>
                      <option value="Completed">Completed / Validated</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  {/* Funding Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Funding Status</label>
                    <select
                      value={fundingStatus}
                      onChange={(e) => setFundingStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-hidden transition"
                    >
                      <option value="Pending">Pending Application</option>
                      <option value="Approved">Approved but Unfunded</option>
                      <option value="Funded">Funded / Active Grant</option>
                    </select>
                  </div>
                </div>

                {/* Partners */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Industry Partner</label>
                    <input
                      type="text"
                      value={industryPartner}
                      onChange={(e) => setIndustryPartner(e.target.value)}
                      placeholder="e.g. NexaPower Corp"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-hidden transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Laboratory Partner</label>
                    <input
                      type="text"
                      value={laboratoryPartner}
                      onChange={(e) => setLaboratoryPartner(e.target.value)}
                      placeholder="e.g. UNILAG Bioenergy Lab"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-hidden transition"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Project Description / Scientific Objective</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a brief summary of objectives, technology, and commercial potential..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-hidden transition resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingProject(null); }}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition text-center border-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 border-0"
                  >
                    {editingProject ? 'Save Changes' : 'Launch Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail View Modal */}
      <AnimatePresence>
        {activeProjectView && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">Project Dossier</span>
                <button 
                  onClick={() => setActiveProjectView(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-sans">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded uppercase">TRL {activeProjectView.trl}</span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight mt-1">{activeProjectView.title}</h4>
                </div>

                {activeProjectView.description && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-600 dark:text-slate-400 italic">
                    "{activeProjectView.description}"
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/60 py-1">
                    <span className="text-slate-400">Development Stage:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{activeProjectView.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/60 py-1">
                    <span className="text-slate-400">Funding Status:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{activeProjectView.fundingStatus}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/60 py-1">
                    <span className="text-slate-400">Industry Sponsor:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{activeProjectView.industryPartner}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/60 py-1">
                    <span className="text-slate-400">Hosting Laboratory:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{activeProjectView.laboratoryPartner}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Last Synced:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{new Date(activeProjectView.lastUpdated).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
                    <span>Task Completion</span>
                    <span>{activeProjectView.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activeProjectView.progress}%` }}></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveProjectView(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer border-0 mt-2"
              >
                Close Dossier
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
