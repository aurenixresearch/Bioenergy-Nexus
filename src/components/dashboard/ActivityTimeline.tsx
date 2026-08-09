import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck, 
  Users, 
  Mail, 
  UserCheck, 
  Award, 
  GitCommit, 
  HelpCircle,
  Clock,
  X,
  Plus
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'publish' | 'alliance' | 'invitation' | 'follower' | 'funding' | 'workspace' | 'consulting';
  title: string;
  description: string;
  time: string; // e.g. 2 hours ago
  detail: string;
}

interface ActivityTimelineProps {
  customActivities?: ActivityItem[];
}

export default function ActivityTimeline({ customActivities }: ActivityTimelineProps) {
  const activities = customActivities || [];

  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  const icons = {
    publish: { icon: FileCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' },
    alliance: { icon: Users, color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40' },
    invitation: { icon: Mail, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' },
    follower: { icon: UserCheck, color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40' },
    funding: { icon: Award, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' },
    workspace: { icon: GitCommit, color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40' },
    consulting: { icon: HelpCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow text-left space-y-6 min-h-[368px] h-auto" id="activity_timeline_section" style={{ minHeight: '368px', height: 'auto' }}>
      <div>
        <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600 animate-spin" style={{ animationDuration: '10s' }} />
          Academic Activity Timeline
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium mt-0.5">
          A real-time, chronological logger tracking your citations, workspace edits, and regional applications.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No recent activity to display.</p>
        </div>
      ) : (
        <div className="relative border-l border-slate-100 dark:border-slate-800 ml-3.5 pl-6 space-y-6">
        {activities.map((act, index) => {
          const config = icons[act.type] || icons.publish;
          const markerStyle = index === 0 
            ? { backgroundColor: '#ffffff', color: '#14ff0a' } 
            : index === 1 
            ? { backgroundColor: '#ffffff', color: '#03ff08' } 
            : {};
          return (
            <motion.div
              key={act.id}
              whileHover={{ x: 2 }}
              onClick={() => setSelectedActivity(act)}
              className="relative group cursor-pointer font-sans"
            >
              {/* Timeline marker icon */}
              <div 
                className={`absolute -left-[37px] top-0 p-1.5 rounded-full border bg-white dark:bg-slate-900 transition-all group-hover:scale-110 ${config.color}`}
                style={markerStyle}
              >
                <config.icon className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="block text-xs font-bold text-slate-800 dark:text-slate-200"
                    style={index === 0 || index === 1 ? { color: '#443f3f' } : {}}
                  >
                    {act.title}
                  </span>
                  <span 
                    className="text-[10px] font-mono text-slate-400 font-bold"
                    style={
                      index === 0 
                        ? { width: '56.66669999999999px', color: '#050000', display: 'inline-block' }
                        : index === 1 
                        ? { width: '56.66669999999999px', color: '#000000', display: 'inline-block' }
                        : {}
                    }
                  >
                    {act.time}
                  </span>
                </div>
                <p 
                  className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors leading-relaxed"
                  style={index === 0 ? { color: '#443f3f' } : index === 1 ? { color: '#120101' } : {}}
                >
                  {act.description}
                </p>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to inspect details
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Activity Details Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Activity Logger</span>
                </div>
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-slate-400 block">{selectedActivity.time}</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{selectedActivity.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-4 rounded-xl border border-slate-200">
                  {selectedActivity.detail}
                </p>
              </div>

              <button
                onClick={() => setSelectedActivity(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer border-0"
              >
                Close Activity Log
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
