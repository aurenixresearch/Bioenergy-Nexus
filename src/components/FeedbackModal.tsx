import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Bug,
  MessageSquare,
  Lightbulb,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Monitor,
  Globe,
  Loader2,
  Info
} from 'lucide-react';
import { FeedbackType, FeedbackCategory, FeedbackFormValues } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  currentUserName?: string;
}

const CATEGORIES: FeedbackCategory[] = [
  'Bug report',
  'Feature request',
  'User interface feedback',
  'User experience feedback',
  'Performance issue',
  'Security issue',
  'Research submission issue',
  'Messaging issue',
  'Community issue',
  'Other'
];

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvkppogp';
const RATE_LIMIT_KEY = 'aurenix_feedback_last_submit';
const LAST_HASH_KEY = 'aurenix_feedback_last_hash';

// Utility to sanitize HTML/Script tags from input string
function sanitizeInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Simple hash function for duplicate check
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

export default function FeedbackModal({
  isOpen,
  onClose,
  currentUserEmail = '',
  currentUserName = ''
}: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('feedback');
  const [fullName, setFullName] = useState(currentUserName);
  const [email, setEmail] = useState(currentUserEmail);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('User interface feedback');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<string>('');
  const [includeSystemInfo, setIncludeSystemInfo] = useState<boolean>(true);
  const [honeypot, setHoneypot] = useState<string>(''); // Spam prevention honeypot field

  const [browserInfo, setBrowserInfo] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Auto-detect browser & device info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let bName = 'Unknown Browser';
      if (ua.includes('Firefox')) bName = 'Mozilla Firefox';
      else if (ua.includes('SamsungBrowser')) bName = 'Samsung Internet';
      else if (ua.includes('Opera') || ua.includes('OPR')) bName = 'Opera';
      else if (ua.includes('Trident')) bName = 'Internet Explorer';
      else if (ua.includes('Edge') || ua.includes('Edg')) bName = 'Microsoft Edge';
      else if (ua.includes('Chrome')) bName = 'Google Chrome';
      else if (ua.includes('Safari')) bName = 'Apple Safari';

      setBrowserInfo(`${bName} (${navigator.language || 'en'})`);
      setDeviceInfo(
        `${navigator.platform || 'Unknown OS'} • Screen: ${window.innerWidth}x${window.innerHeight}`
      );
    }
  }, []);

  useEffect(() => {
    if (currentUserName && !fullName) setFullName(currentUserName);
    if (currentUserEmail && !email) setEmail(currentUserEmail);
  }, [currentUserName, currentUserEmail]);

  // Handle category update when feedback type changes
  useEffect(() => {
    if (feedbackType === 'bug') setCategory('Bug report');
    else if (feedbackType === 'idea') setCategory('Feature request');
    else setCategory('User interface feedback');
  }, [feedbackType]);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Screenshot size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): string | null => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!subject.trim()) return 'Subject is required.';
    if (!category) return 'Please select a category.';
    if (!message.trim() || message.trim().length < 10) {
      return 'Message must be at least 10 characters long.';
    }
    if (message.length > 3000) {
      return 'Message length cannot exceed 3000 characters.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Honeypot check (Spam Prevention)
    if (honeypot) {
      console.warn('Spam detected via honeypot.');
      setStatus('success');
      return;
    }

    // 2. Form Validation
    const valError = validateForm();
    if (valError) {
      setErrorMessage(valError);
      return;
    }

    // 3. Rate Limiting Check (Minimum 30 seconds between submissions)
    const lastSubmitTime = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmitTime) {
      const diffMs = Date.now() - parseInt(lastSubmitTime, 10);
      if (diffMs < 30000) {
        const remainingSec = Math.ceil((30000 - diffMs) / 1000);
        setErrorMessage(`Please wait ${remainingSec} seconds before submitting feedback again.`);
        return;
      }
    }

    // 4. Duplicate Check (Hash comparison)
    const msgHash = simpleHash(message.trim() + subject.trim());
    const lastHash = localStorage.getItem(LAST_HASH_KEY);
    if (lastHash === msgHash) {
      setErrorMessage('You have already submitted this feedback recently.');
      return;
    }

    setSubmitting(true);

    // 5. Sanitize Inputs
    const sanitizedData: FeedbackFormValues = {
      type: feedbackType,
      fullName: sanitizeInput(fullName),
      email: sanitizeInput(email),
      subject: sanitizeInput(subject),
      category: category,
      message: sanitizeInput(message),
      screenshot: screenshot || undefined,
      browserInfo: includeSystemInfo ? browserInfo : undefined,
      deviceInfo: includeSystemInfo ? deviceInfo : undefined
    };

    // Payload formatted for Formspree
    const payload = {
      _subject: `[Aurenix ${feedbackType.toUpperCase()}] ${sanitizedData.subject}`,
      type: sanitizedData.type,
      fullName: sanitizedData.fullName,
      email: sanitizedData.email,
      subject: sanitizedData.subject,
      category: sanitizedData.category,
      message: sanitizedData.message,
      screenshot: sanitizedData.screenshot || 'None provided',
      browserInfo: sanitizedData.browserInfo || 'Not shared',
      deviceInfo: sanitizedData.deviceInfo || 'Not shared',
      submittedAt: new Date().toISOString()
    };

    try {
      // POST directly to Formspree endpoint - NOT stored in Firebase
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Record rate limit timestamp & hash
        localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
        localStorage.setItem(LAST_HASH_KEY, msgHash);

        setStatus('success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Formspree submission error:', errorData);
        setStatus('error');
        setErrorMessage('Your feedback could not be submitted. Please try again.');
      }
    } catch (err) {
      console.error('Formspree network request error:', err);
      setStatus('error');
      setErrorMessage('Your feedback could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setSubject('');
    setMessage('');
    setScreenshot('');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl my-auto max-h-[calc(100vh-1rem)] sm:max-h-[85vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-slate-100 bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20 shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 leading-tight truncate">
                  Private Feedback System
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-mono truncate">
                  Direct submission to Aurenix team (Formspree)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="p-6 sm:p-8 text-center space-y-5 sm:space-y-6 overflow-y-auto">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
                  Feedback Received
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for helping us improve Aurenix.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 sm:px-5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition-colors cursor-pointer"
                >
                  Send another submission
                </button>
                <button
                  onClick={onClose}
                  className="px-5 sm:px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form 
              action="https://formspree.io/f/xvkppogp" 
              method="POST" 
              onSubmit={handleSubmit} 
              className="p-4 sm:p-6 space-y-3.5 sm:space-y-5 overflow-y-auto flex-1"
            >
              {/* Spam Prevention Honeypot (Hidden from human users) */}
              <input
                type="text"
                name="_gotcha"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Feedback Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                  Feedback Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'bug', label: 'Report a bug', icon: Bug, color: 'text-amber-500' },
                    { type: 'feedback', label: 'Send feedback', icon: MessageSquare, color: 'text-emerald-500' },
                    { type: 'idea', label: 'Share an idea', icon: Lightbulb, color: 'text-blue-500' }
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = feedbackType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setFeedbackType(item.type as FeedbackType)}
                        className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all text-xs font-bold cursor-pointer ${
                          active
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${item.color}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jane Doe"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                {/* Email address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@institution.edu"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your feedback"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {message.length} / 3000 chars
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={3000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue, feedback, or feature proposal in detail..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-slate-900"
                />
              </div>

              {/* Optional Screenshot & System Info */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Screenshot upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Optional Screenshot
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                      {screenshot && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-mono">Attached</span>
                          <button
                            type="button"
                            onClick={() => setScreenshot('')}
                            className="text-rose-500 hover:underline text-[10px] ml-1"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toggle system details */}
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-2 sm:pt-0">
                    <input
                      type="checkbox"
                      checked={includeSystemInfo}
                      onChange={(e) => setIncludeSystemInfo(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Include browser & device info</span>
                  </label>
                </div>

                {includeSystemInfo && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 font-mono space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Browser: {browserInfo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Device: {deviceInfo}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-mono min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">Direct delivery to Aurenix support</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="hidden sm:block px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-emerald-800 disabled:to-emerald-900 text-white font-extrabold rounded-xl text-xs transition-all shadow-md hover:shadow-emerald-950/30 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 active:scale-[0.98] border border-emerald-400/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
                        <span className="whitespace-nowrap">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="whitespace-nowrap">Send Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
