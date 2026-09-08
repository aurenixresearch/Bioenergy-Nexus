import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import ResearchAiAssistant from './ResearchAiAssistant';

export type AiWidgetSizeMode = 'compact' | 'docked' | 'window' | 'fullscreen';

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
  
  // Persisted size mode
  const [sizeMode, setSizeMode] = useState<AiWidgetSizeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aris_ai_window_size_mode') as AiWidgetSizeMode;
      if (saved && ['compact', 'docked', 'window', 'fullscreen'].includes(saved)) {
        return saved;
      }
      return window.innerWidth < 768 ? 'fullscreen' : 'window';
    }
    return 'window';
  });

  const handleSetSizeMode = (mode: AiWidgetSizeMode) => {
    setSizeMode(mode);
    try {
      localStorage.setItem('aris_ai_window_size_mode', mode);
    } catch {
      // ignore
    }
  };

  // Listen for global custom event to open the AI assistant
  useEffect(() => {
    const handleOpenEvent = (e: any) => {
      setIsOpen(true);
      setHasUnreadNotice(false);
      if (e?.detail?.sizeMode && ['compact', 'docked', 'window', 'fullscreen'].includes(e.detail.sizeMode)) {
        handleSetSizeMode(e.detail.sizeMode);
      }
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

  // Lock background scroll when modal is window or fullscreen
  useEffect(() => {
    if (isOpen && (sizeMode === 'fullscreen' || sizeMode === 'window')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, sizeMode]);

  // Hide floating button if user is already on the dedicated full-page ai-assistant view
  if (currentView === 'ai-assistant') {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button on the left side */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 ${user ? 'xl:left-[300px]' : 'xl:left-6'} z-50 flex items-center gap-2`}
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

      {/* AI Assistant Modal with Multi-Size Framework */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for Window Mode or Fullscreen Mode */}
            {(sizeMode === 'window' || sizeMode === 'fullscreen') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
              />
            )}

            {/* Backdrop for Docked Mode on mobile */}
            {sizeMode === 'docked' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/40 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none pointer-events-auto sm:pointer-events-none"
              />
            )}

            {/* Container based on sizeMode */}
            {sizeMode === 'fullscreen' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed inset-0 z-50 w-screen h-screen w-[100vw] h-[100vh] h-[100dvh] max-h-[100dvh] bg-white dark:bg-slate-950 flex flex-col overflow-hidden m-0 p-0 border-0 shadow-none"
              >
                <ResearchAiAssistant
                  user={user}
                  userProfile={userProfile}
                  isFloating={true}
                  sizeMode={sizeMode}
                  onChangeSizeMode={handleSetSizeMode}
                  onClose={() => setIsOpen(false)}
                  onNavigateToView={(view, id) => {
                    setIsOpen(false);
                    onNavigateToView?.(view, id);
                  }}
                />
              </motion.div>
            )}

            {sizeMode === 'window' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full max-w-5xl h-[92vh] max-h-[920px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                >
                  <ResearchAiAssistant
                    user={user}
                    userProfile={userProfile}
                    isFloating={true}
                    sizeMode={sizeMode}
                    onChangeSizeMode={handleSetSizeMode}
                    onClose={() => setIsOpen(false)}
                    onNavigateToView={(view, id) => {
                      setIsOpen(false);
                      onNavigateToView?.(view, id);
                    }}
                  />
                </motion.div>
              </div>
            )}

            {sizeMode === 'docked' && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[560px] md:w-[640px] lg:w-[700px] h-screen h-[100dvh] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
              >
                <ResearchAiAssistant
                  user={user}
                  userProfile={userProfile}
                  isFloating={true}
                  sizeMode={sizeMode}
                  onChangeSizeMode={handleSetSizeMode}
                  onClose={() => setIsOpen(false)}
                  onNavigateToView={(view, id) => {
                    setIsOpen(false);
                    onNavigateToView?.(view, id);
                  }}
                />
              </motion.div>
            )}

            {sizeMode === 'compact' && (
              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 25, scale: 0.92 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[480px] md:w-[520px] h-[85vh] sm:h-[720px] max-h-[90vh] sm:max-h-[820px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-emerald-500/30 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col"
              >
                <ResearchAiAssistant
                  user={user}
                  userProfile={userProfile}
                  isFloating={true}
                  sizeMode={sizeMode}
                  onChangeSizeMode={handleSetSizeMode}
                  onClose={() => setIsOpen(false)}
                  onNavigateToView={(view, id) => {
                    setIsOpen(false);
                    onNavigateToView?.(view, id);
                  }}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
