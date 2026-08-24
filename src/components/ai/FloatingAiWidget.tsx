import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
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
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);

  // Listen for global custom event to open the AI assistant
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      setHasUnreadNotice(false);
    };

    window.addEventListener('open-ai-assistant', handleOpenEvent);
    return () => window.removeEventListener('open-ai-assistant', handleOpenEvent);
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K to toggle, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setHasUnreadNotice(false);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock background scroll when full-page modal is open on mobile/tablets
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setHasUnreadNotice(false);
            }}
            id="floating_ai_assistant_btn"
            className="group relative flex items-center gap-2 sm:gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white rounded-full shadow-2xl hover:shadow-emerald-900/40 border-2 border-emerald-400/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            title="Ask Aurenix AI Research Assistant (Ctrl+K)"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-amber-300" />
              {hasUnreadNotice && (
                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-400 rounded-full ring-2 ring-emerald-900 animate-ping" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-tight leading-none">Research AI & Support</span>
              <span className="text-[10px] text-emerald-200 font-medium leading-tight mt-0.5 hidden md:inline">
                Summarize PDFs & Brainstorm
              </span>
            </div>

            <div className="hidden lg:flex items-center ml-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-400/30 text-[9px] font-mono text-emerald-300">
              ⌘K
            </div>
          </button>
        </motion.div>
      )}

      {/* Full Page AI Assistant Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] bg-white dark:bg-slate-950 flex flex-col overflow-hidden"
          >
            <div className="h-full w-full relative flex flex-col overflow-hidden">
              {/* Research AI Assistant Component */}
              <ResearchAiAssistant
                user={user}
                userProfile={userProfile}
                isFloating={true}
                onClose={() => setIsOpen(false)}
                onNavigateToView={(view, id) => {
                  setIsOpen(false);
                  onNavigateToView?.(view, id);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
