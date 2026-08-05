import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Check, Lock, BarChart3, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CookieConsentPreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp: string;
}

export const COOKIE_CONSENT_KEY = 'aurenix_cookie_consent_v1';

export function getCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read cookie consent', e);
  }
  return null;
}

export function openCookiePreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aurenix-open-cookie-preferences'));
  }
}

function updateGA4Consent(analyticsGranted: boolean) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    try {
      (window as any).gtag('consent', 'update', {
        analytics_storage: analyticsGranted ? 'granted' : 'denied'
      });
    } catch (e) {
      console.warn('GA4 consent update error:', e);
    }
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference states
  const [analytics, setAnalytics] = useState(true);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    const existing = getCookieConsent();
    if (existing && existing.timestamp) {
      const savedTime = new Date(existing.timestamp).getTime();
      const now = Date.now();
      const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

      if (!isNaN(savedTime) && (now - savedTime) < TWO_WEEKS_MS) {
        // User accepted/saved preferences within two weeks - do not show banner
        setShowBanner(false);
        setAnalytics(existing.analytics);
        setPreferences(existing.preferences);
        updateGA4Consent(existing.analytics);
      } else {
        // Consent expired (> 14 days)
        setShowBanner(true);
      }
    } else {
      // No consent recorded yet
      setShowBanner(true);
    }

    // Listen for custom event from Settings page or elsewhere to open preferences
    const handleOpenEvent = () => {
      const current = getCookieConsent();
      if (current) {
        setAnalytics(current.analytics);
        setPreferences(current.preferences);
      }
      setShowPreferences(true);
    };

    window.addEventListener('aurenix-open-cookie-preferences', handleOpenEvent);
    return () => {
      window.removeEventListener('aurenix-open-cookie-preferences', handleOpenEvent);
    };
  }, []);

  const saveConsent = (analyticsVal: boolean, preferencesVal: boolean) => {
    const record: CookieConsentPreferences = {
      essential: true,
      analytics: analyticsVal,
      preferences: preferencesVal,
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
    } catch (e) {
      console.error('Failed to save cookie consent', e);
    }

    updateGA4Consent(analyticsVal);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectOptional = () => {
    saveConsent(false, false);
  };

  const handleSavePreferences = () => {
    saveConsent(analytics, preferences);
  };

  return (
    <>
      {/* FIXED COOKIE CONSENT BANNER */}
      <AnimatePresence>
        {showBanner && !showPreferences && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-1.25rem)] sm:w-auto max-w-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-xl dark:shadow-2xl/50 p-3 sm:p-5 text-left text-slate-800 dark:text-slate-100 pointer-events-auto"
            id="aurenix_cookie_consent_banner"
          >
            <div className="flex flex-col gap-2.5 sm:gap-4">
              {/* Header & Description */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="p-1 sm:p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Cookie className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-display">
                      We use cookies
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBanner(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-normal sm:leading-relaxed">
                  Aurenix uses essential cookies to keep the platform secure. Optional cookies help us analyze usage and customize your experience.
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowPreferences(true)}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl whitespace-nowrap cursor-pointer transition-colors shrink-0"
                >
                  Preferences
                </button>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl whitespace-nowrap cursor-pointer transition-colors shrink-0"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl whitespace-nowrap cursor-pointer transition-colors shadow-xs shrink-0"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MANAGE PREFERENCES PANEL / MODAL */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowPreferences(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-left overflow-hidden space-y-6"
              id="aurenix_cookie_preferences_panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                      Cookie Preferences
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Customize which optional cookies you allow Aurenix to store.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cookie Categories List */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* 1. Essential Cookies */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Essential Cookies
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Required for core website functionality, security, authentication, and essential services.
                  </p>
                </div>

                {/* 2. Analytics Cookies */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Analytics Cookies
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Optional
                      </span>
                      <button
                        type="button"
                        onClick={() => setAnalytics(!analytics)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer shrink-0 ${
                          analytics ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                            analytics ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Used to understand how users interact with Aurenix and improve the platform.
                  </p>
                </div>

                {/* 3. Preference Cookies */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Preference Cookies
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Optional
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreferences(!preferences)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer shrink-0 ${
                          preferences ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                            preferences ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Used to remember user preferences such as interface settings and theme preferences where applicable.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-colors shadow-xs"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
