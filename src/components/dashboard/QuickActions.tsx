import React from 'react';
import { motion } from 'motion/react';
import { 
  FileUp, 
  Briefcase, 
  Users, 
  Search, 
  ClipboardCopy, 
  MessageSquare, 
  Settings,
  User 
} from 'lucide-react';

interface QuickActionsProps {
  onPublishResearch: () => void;
  onCreateProject: () => void;
  onBrowseAlliances: () => void;
  onFindCollaborators: () => void;
  onCreateConsulting: () => void;
  onOpenMessages: () => void;
  onNavigateToSettings: () => void;
  onNavigateToProfile?: () => void;
}

export default function QuickActions({
  onPublishResearch,
  onCreateProject,
  onBrowseAlliances,
  onFindCollaborators,
  onCreateConsulting,
  onOpenMessages,
  onNavigateToSettings,
  onNavigateToProfile,
}: QuickActionsProps) {
  const actions = [
    {
      label: 'My Public Profile',
      icon: User,
      color: 'bg-white text-emerald-600 border border-slate-150/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-transparent',
      onClick: onNavigateToProfile || (() => {}),
      desc: 'View & edit public portfolio'
    },
    {
      label: 'Publish Research',
      icon: FileUp,
      color: 'bg-white text-emerald-600 border border-slate-150/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-transparent',
      onClick: onPublishResearch,
      desc: 'Contribute a new publication'
    },
    {
      label: 'Create Innovation Project',
      icon: Briefcase,
      color: 'bg-white text-emerald-600 border border-slate-150/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-transparent',
      onClick: onCreateProject,
      desc: 'Start a new TRL development'
    },
    {
      label: 'Browse Alliances',
      icon: Users,
      color: 'bg-white text-emerald-600 border border-slate-150/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-transparent',
      onClick: onBrowseAlliances,
      desc: 'Explore institutional alliances'
    },
    {
      label: 'Find Collaborators',
      icon: Search,
      color: 'bg-white text-emerald-600 border border-slate-150/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-transparent',
      onClick: onFindCollaborators,
      desc: 'Search active African experts'
    },
    {
      label: 'Create Consulting Request',
      icon: ClipboardCopy,
      color: 'bg-white text-emerald-600 border border-slate-150/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-transparent',
      onClick: onCreateConsulting,
      desc: 'Request advisory reviews'
    },
    {
      label: 'Messages & Mailbox',
      icon: MessageSquare,
      color: 'bg-white text-emerald-600 border border-slate-150/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-transparent',
      onClick: onOpenMessages,
      desc: 'Check incoming peer requests'
    },
    {
      label: 'System Settings',
      icon: Settings,
      color: 'bg-white text-emerald-600 border border-slate-150/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-transparent',
      onClick: onNavigateToSettings,
      desc: 'Configure notification preferences'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4" id="dashboard_quick_actions">
      {actions.map((act) => (
        <motion.button
          key={act.label}
          onClick={act.onClick}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 hover:border-emerald-300 dark:hover:border-emerald-400 rounded-xl sm:rounded-2xl shadow-2xs hover:shadow-md hover:shadow-emerald-500/5 transition-all cursor-pointer text-center group min-h-[4.75rem] sm:min-h-[5.5rem] w-full"
        >
          <div className="p-1.5 sm:p-2 rounded-lg mb-1 transition-colors duration-300 bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white shrink-0">
            <act.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:rotate-6" />
          </div>
          <span className="block text-[10px] sm:text-xs font-bold leading-tight line-clamp-1 text-slate-900 dark:text-slate-900 w-full px-0.5">
            {act.label}
          </span>
          <span className="block text-[8.5px] sm:text-[9.5px] mt-0.5 line-clamp-1 font-normal font-sans text-slate-500 dark:text-slate-500 w-full px-0.5">
            {act.desc}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
