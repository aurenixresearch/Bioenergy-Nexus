import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  Send,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  User,
  Briefcase,
  Loader2,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { submitTestimonial } from '../services/db';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail?: string;
  defaultFullName?: string;
  defaultInstitution?: string;
  defaultCountry?: string;
  defaultAvatar?: string;
}

export default function TestimonialModal({
  isOpen,
  onClose,
  userId,
  userEmail = '',
  defaultFullName = '',
  defaultInstitution = '',
  defaultCountry = '',
  defaultAvatar = ''
}: TestimonialModalProps) {
  const [fullName, setFullName] = useState(defaultFullName);
  const [occupation, setOccupation] = useState('');
  const [institution, setInstitution] = useState(defaultInstitution);
  const [country, setCountry] = useState(defaultCountry);
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState(defaultAvatar);
  const [website, setWebsite] = useState('');
  const [socialProfile, setSocialProfile] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (defaultFullName && !fullName) setFullName(defaultFullName);
    if (defaultInstitution && !institution) setInstitution(defaultInstitution);
    if (defaultCountry && !country) setCountry(defaultCountry);
    if (defaultAvatar && !imageUrl) setImageUrl(defaultAvatar);
  }, [defaultFullName, defaultInstitution, defaultCountry, defaultAvatar]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Profile picture size should be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) return setErrorMessage('Full name is required.');
    if (!occupation.trim()) return setErrorMessage('Occupation / Title is required.');
    if (!institution.trim()) return setErrorMessage('Institution / Organization is required.');
    if (!country.trim()) return setErrorMessage('Country is required.');
    if (!rating) return setErrorMessage('Please select a rating.');
    if (!message.trim() || message.trim().length < 20) {
      return setErrorMessage('Testimonial message must be at least 20 characters long.');
    }

    setSubmitting(true);

    try {
      // Submits to Firestore with approved: false, featured: false
      await submitTestimonial({
        userId,
        fullName: fullName.trim(),
        occupation: occupation.trim(),
        institution: institution.trim(),
        country: country.trim(),
        rating,
        message: message.trim(),
        imageUrl: imageUrl || undefined,
        website: website.trim() || undefined,
        socialProfile: socialProfile.trim() || undefined
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit testimonial:', err);
      setErrorMessage('Failed to submit testimonial to Firebase. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage('');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl my-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-500/20 shrink-0">
                <Star className="w-5 h-5 fill-emerald-500 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 leading-tight truncate">
                  Share Your Testimonial
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-mono truncate">
                  Stored in Firebase • Pending Administrator Approval
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white">
            {submitted ? (
              <div className="py-6 sm:py-8 text-center space-y-5 bg-white">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-2xl border border-emerald-500/30 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                    Testimonial Submitted for Review
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you! Your testimonial has been saved to Firebase. An Aurenix administrator will review and publish it to the public endorsements section.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 font-mono space-y-1 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Publication Status: Pending Verification</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    All submitted endorsements undergo administrative review before appearing live on the platform.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer border border-emerald-200"
                  >
                    Submit Another Testimonial
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Rating selection */}
                <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 font-mono">
                      Rating Score <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">Click stars to select rating</p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                        aria-label={`Rate ${star} star`}
                      >
                        <Star
                          className={`w-6 h-6 sm:w-7 sm:h-7 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 rounded-lg text-xs font-mono font-bold ml-1 border border-amber-500/20 shrink-0">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                {/* Fields Grid 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Prof. Chidi Okafor"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Occupation / Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="Senior Bioenergy Specialist"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Fields Grid 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Institution */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Institution / Organization <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="University of Lagos / ECOWAS"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Nigeria, Kenya, Ghana..."
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Testimonial Message <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Min 20 characters</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your experience working with Aurenix Research or utilizing our empirical bioenergy platform..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none text-slate-900 leading-relaxed"
                  />
                </div>

                {/* Optional Profile Section */}
                <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      Optional Profile Details
                    </p>
                    <span className="text-[10px] text-slate-500">Enhances endorsement credibility</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.org"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Social Profile (LinkedIn/Scholar)
                      </label>
                      <input
                        type="url"
                        value={socialProfile}
                        onChange={(e) => setSocialProfile(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Profile Picture Upload Card */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-11 h-11 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-500/30 rounded-xl cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{imageUrl ? 'Change Photo' : 'Upload Profile Picture'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 3MB</p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 font-mono text-center sm:text-left">
                    Protected by Firestore Rules • SSL Encrypted
                  </span>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Endorsement</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
