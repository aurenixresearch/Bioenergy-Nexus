import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';
import { Workspace } from './types';

// Subcomponents imports
import Marketplace from './Marketplace';
import ChallengesSection from './ChallengesSection';
import WorkspaceView from './Workspace';

interface OperationalConsoleProps {
  user: any;
  onSignIn: () => void;
}

type UserRolePersona = 'marketplace' | 'challenges';

export default function OperationalConsole({ user, onSignIn }: OperationalConsoleProps) {
  // Console state
  const [rolePersona, setRolePersona] = useState<UserRolePersona>('marketplace');
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  const triggerSuccessAlert = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg('');
    }, 5000);
  };

  if (activeWorkspace) {
    return (
      <div className="bg-slate-50 min-h-screen text-slate-900 pb-20 relative text-left" id="operational_workspace_full">
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

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-900 pb-20 relative text-left" id="operational_console_container">
      
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

      {/* Header Info */}
      <section className="bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden py-10 sm:py-16" id="console_hero">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
        
        <div className="w-full px-3 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Aurenix Management Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-slate-900 leading-tight">
            Operational Console
          </h1>
          <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
            Manage your project workspaces, research matches, challenges, and view active grant funding options. Toggle your role persona below to access specialized workflows.
          </p>
        </div>
      </section>

      {/* DASHBOARD PERSONA AREA AND SWITCHER */}
      <section className="py-6 sm:py-8 w-full px-3 sm:px-6 lg:px-8">
        
        {/* Switcher Header */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Console Selector</h2>
            <p className="text-xs text-slate-400 mt-0.5">Toggle workspaces, matches, or view lists directly from different personas.</p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/50 w-full md:w-auto">
            <button
              onClick={() => setRolePersona('marketplace')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                rolePersona === 'marketplace' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Grants Marketplace
            </button>
            <button
              onClick={() => setRolePersona('challenges')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                rolePersona === 'challenges' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Challenges
            </button>
          </div>
        </div>

        {/* Console Container */}
        <div>
          {rolePersona === 'marketplace' && (
            <Marketplace 
              user={user}
              onSignIn={onSignIn}
              onSuccess={triggerSuccessAlert}
            />
          )}

          {rolePersona === 'challenges' && (
            <ChallengesSection 
              user={user}
              onSignIn={onSignIn}
              onSuccess={triggerSuccessAlert}
            />
          )}
        </div>

      </section>

    </div>
  );
}
