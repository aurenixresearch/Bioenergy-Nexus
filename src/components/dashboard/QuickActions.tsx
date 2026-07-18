import React from 'react';
import { motion } from 'motion/react';
import { 
  FileUp, 
  Briefcase, 
  Users, 
  Search, 
  ClipboardCopy, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

interface QuickActionsProps {
  onPublishResearch: () => void;
  onCreateProject: () => void;
  onBrowseAlliances: () => void;
  onFindCollaborators: () => void;
  onCreateConsulting: () => void;
  onOpenMessages: () => void;
  onNavigateToSettings: () => void;
}

export default function QuickActions({
  onPublishResearch,
  onCreateProject,
  onBrowseAlliances,
  onFindCollaborators,
  onCreateConsulting,
  onOpenMessages,
  onNavigateToSettings,
}: QuickActionsProps) {
  const actions = [
    {
      label: 'Publish Research',
      icon: FileUp,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
      onClick: onPublishResearch,
      desc: 'Contribute a new publication'
    },
    {
      label: 'Create Innovation Project',
      icon: Briefcase,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
      onClick: onCreateProject,
      desc: 'Start a new TRL development'
    },
    {
      label: 'Browse Alliances',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
      onClick: onBrowseAlliances,
      desc: 'Explore institutional alliances'
    },
    {
      label: 'Find Collaborators',
      icon: Search,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
      onClick: onFindCollaborators,
      desc: 'Search active African experts'
    },
    {
      label: 'Create Consulting Request',
      icon: ClipboardCopy,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
      onClick: onCreateConsulting,
      desc: 'Request advisory reviews'
    },
    {
      label: 'Messages & Mailbox',
      icon: MessageSquare,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
      onClick: onOpenMessages,
      desc: 'Check incoming peer requests'
    },
    {
      label: 'System Settings',
      icon: Settings,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
      onClick: onNavigateToSettings,
      desc: 'Configure notification preferences'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4" id="dashboard_quick_actions">
      {actions.map((act) => (
        <motion.button
          key={act.label}
          onClick={act.onClick}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-100 hover:border-emerald-200 dark:border-slate-800 dark:hover:border-emerald-900/50 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer text-center group h-36`}
        >
          <div className={`p-3 rounded-xl mb-2.5 transition-colors duration-300 ${act.color} group-hover:bg-emerald-600 group-hover:text-white`}>
            <act.icon className="w-5 h-5 transition-transform group-hover:rotate-6" />
          </div>
          <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {act.label}
          </span>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 max-w-[120px] font-normal font-sans">
            {act.desc}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
