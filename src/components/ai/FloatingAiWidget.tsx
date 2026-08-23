import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Maximize2, Minimize2, Bot, MessageSquare } from 'lucide-react';
import ResearchAiAssistant from './ResearchAiAssistant';

interface FloatingAiWidgetProps {
  user?: any;
  userProfile?: any;
  currentView?: string;
  onNavigateToView?: (view: string, id?: string) => void;
}

export default function FloatingAiWidget({
  user,
  userProfile,
  currentView,
  onNavigateToView
}: FloatingAiWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);

  // Listen for global custom event to open the AI assistant
  useEffect(() => {
    const handleOpenEvent = (e: any) => {
      setIsOpen(true);
      setHasUnreadNotice(false);
    };

    window.addEventListener('open-ai-assistant', handleOpenEvent);
    return () => window.removeEventListener('open-ai-assistant', handleOpenEvent);
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setHasUnreadNotice(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hide floating button if user is already on the dedicated full-page ai-assistant view
  if (currentView === 'ai-assistant') {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button at bottom right */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setHasUnreadNotice(false);
            }}
            id="floating_ai_assistant_btn"
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white rounded-full shadow-2xl hover:shadow-emerald-900/40 border-2 border-emerald-400/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            title="Ask Aurenix AI Research Assistant (Ctrl+K)"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
              {hasUnreadNotice && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-full ring-2 ring-emerald-900 animate-ping" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-tight leading-none">Research AI & Support</span>
              <span className="text-[10px] text-emerald-200 font-medium leading-tight mt-0.5 hidden sm:inline">
                Summarize PDFs & Brainstorm
              </span>
            </div>

            <div className="hidden lg:flex items-center ml-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-400/30 text-[9px] font-mono text-emerald-300">
              ⌘K
            </div>
          </button>
        </motion.div>
      )}

      {/* Floating Popup Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={`fixed z-50 transition-all duration-300 ${
              isExpanded
                ? 'inset-4 md:inset-8'
                : 'bottom-6 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[480px] md:w-[600px] h-[650px] max-h-[calc(100vh-60px)]'
            }`}
          >
            <div className="h-full w-full relative flex flex-col shadow-2xl rounded-2xl overflow-hidden ring-1 ring-slate-900/10">
              {/* Expand / Maximize Toggle on Header */}
              <div className="absolute top-3.5 right-12 z-30 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title={isExpanded ? 'Restore Size' : 'Maximize Window'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Research AI Assistant Component */}
              <ResearchAiAssistant
                user={user}
                userProfile={userProfile}
                isFloating={true}
                onClose={() => setIsOpen(false)}
                onNavigateToView={onNavigateToView}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
