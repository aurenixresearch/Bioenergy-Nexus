import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X,
  FileText,
  Bookmark
} from 'lucide-react';
import { UserDeadline } from '../../services/db';

interface UpcomingDeadlinesProps {
  deadlines: UserDeadline[];
  onAddDeadline: (deadline: Omit<UserDeadline, 'id' | 'userId' | 'status'>) => Promise<any>;
  onDeleteDeadline: (id: string) => Promise<any>;
}

export default function UpcomingDeadlines({
  deadlines,
  onAddDeadline,
  onDeleteDeadline,
}: UpcomingDeadlinesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<UserDeadline | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<UserDeadline['category']>('Grant');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    await onAddDeadline({
      title,
      date,
      category,
      description
    });

    setTitle('');
    setDate('');
    setCategory('Grant');
    setDescription('');
    setShowAddModal(false);
  };

  // Helper to calculate days remaining
  const getDaysRemaining = (dateStr: string) => {
    const diffTime = new Date(dateStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md text-left space-y-6" id="upcoming_deadlines_section">
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Upcoming Academic Deadlines ({deadlines.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium mt-0.5">
            Synchronize project deliverable targets, alliance application cycles, and peer reviews.
          </p>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-xl cursor-pointer border-0"
          title="Add New Target"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {deadlines.length > 0 ? (
        <div className="space-y-3">
          {deadlines.map((dl) => {
            const daysLeft = getDaysRemaining(dl.date);
            const isOverdue = daysLeft < 0;
            const isClose = daysLeft >= 0 && daysLeft <= 3;

            return (
              <motion.div
                key={dl.id}
                whileHover={{ y: -2 }}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left cursor-pointer bg-white dark:bg-slate-900/40 hover:bg-emerald-50/25 dark:hover:bg-emerald-950/10 ${
                  isOverdue 
                    ? 'border-slate-100 hover:border-red-300 dark:border-slate-800/80 dark:hover:border-red-900/50' 
                    : isClose
                    ? 'border-slate-100 hover:border-amber-300 dark:border-slate-800/80 dark:hover:border-amber-900/50'
                    : 'border-slate-100 hover:border-emerald-300 dark:border-slate-800/80 dark:hover:border-emerald-900/50'
                }`}
                onClick={() => setSelectedDeadline(dl)}
              >
                <div className="space-y-1.5 font-sans flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-900/40 dark:text-emerald-300 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider">
                      {dl.category}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-450 dark:text-slate-500" />
                      {new Date(dl.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-1">
                    {dl.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    isOverdue 
                      ? 'bg-red-500/10 text-red-600 dark:bg-red-950/30 dark:text-red-400' 
                      : isClose
                      ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  }`}>
                    {isOverdue 
                      ? 'Overdue' 
                      : isClose 
                      ? `${daysLeft} days left` 
                      : `${daysLeft} days left`}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDeadline(dl.id);
                    }}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition border-0 bg-transparent"
                    title="Delete Deadline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-2">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-xs font-bold text-slate-600">No Upcoming Targets</h4>
        </div>
      )}

      {/* Add Target Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-left font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Calendar className="w-4 h-4" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">Create Upcoming Target</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Title / Objective *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Upload PDF Pitch Concept"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Target Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-hidden focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-hidden focus:border-emerald-500"
                    >
                      <option value="Grant">Grant Proposal</option>
                      <option value="Alliance">Alliance Milestone</option>
                      <option value="Milestone">Product Milestone</option>
                      <option value="Deliverable">Task Deliverable</option>
                      <option value="Review">Peer Review</option>
                      <option value="Report">Sponsor Report</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Brief Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific notes or reminders..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-hidden focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition border-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition border-0"
                  >
                    Save Target
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {selectedDeadline && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-left font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-xs w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full uppercase">Target Info</span>
                <button 
                  onClick={() => setSelectedDeadline(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold block">
                  Deadline Date: {new Date(selectedDeadline.date).toLocaleDateString()}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{selectedDeadline.title}</h4>
                {selectedDeadline.description ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-50 dark:border-slate-850">
                    {selectedDeadline.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No description provided for this milestone target.</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onDeleteDeadline(selectedDeadline.id);
                    setSelectedDeadline(null);
                  }}
                  className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition border-0 cursor-pointer"
                >
                  Delete Target
                </button>
                <button
                  onClick={() => setSelectedDeadline(null)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition border-0 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
