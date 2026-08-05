import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Upload, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Search,
  X,
  Share2,
  Award,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserResearchPublication } from '../types';

interface ResearchIdentityCenterProps {
  userId: string;
  initialData: any;
  onSaveProfile: (updatedData: any) => Promise<void>;
  theme?: 'light' | 'dark';
}

export default function ResearchIdentityCenter({
  userId,
  initialData,
  onSaveProfile,
  theme
}: ResearchIdentityCenterProps) {
  // Extract initial research identity fields with backwards compatibility for existing ORCID data
  const existingOrcid = initialData?.orcidId || initialData?.orcid || initialData?.portfolioLinks?.orcid || '';
  const existingOrcidUrl = initialData?.orcidUrl || (existingOrcid ? `https://orcid.org/${existingOrcid}` : '');

  const [identityFields, setIdentityFields] = useState({
    orcidId: existingOrcid,
    orcidUrl: existingOrcidUrl,
    googleScholarUrl: initialData?.googleScholarUrl || initialData?.portfolioLinks?.googleScholar || '',
    scopusId: initialData?.scopusId || '',
    researchGateUrl: initialData?.researchGateUrl || initialData?.portfolioLinks?.researchgate || '',
    linkedInUrl: initialData?.linkedInUrl || initialData?.portfolioLinks?.linkedin || '',
  });

  // Extract publications array
  const [publications, setPublications] = useState<UserResearchPublication[]>(
    Array.isArray(initialData?.publications) ? initialData.publications : []
  );

  // Modal / Form state for Publication Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPub, setEditingPub] = useState<UserResearchPublication | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [pubFormData, setPubFormData] = useState<Partial<UserResearchPublication>>({
    title: '',
    authors: '',
    publishedYear: new Date().getFullYear(),
    journal: '',
    doi: '',
    abstract: '',
    keywords: '',
    publicationUrl: '',
    pdfUrl: '',
    pdfFileName: ''
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state if initialData changes externally
  useEffect(() => {
    if (initialData) {
      const orcid = initialData?.orcidId || initialData?.orcid || initialData?.portfolioLinks?.orcid || '';
      const orcidUrl = initialData?.orcidUrl || (orcid ? `https://orcid.org/${orcid}` : '');
      setIdentityFields({
        orcidId: orcid,
        orcidUrl: orcidUrl,
        googleScholarUrl: initialData?.googleScholarUrl || initialData?.portfolioLinks?.googleScholar || '',
        scopusId: initialData?.scopusId || '',
        researchGateUrl: initialData?.researchGateUrl || initialData?.portfolioLinks?.researchgate || '',
        linkedInUrl: initialData?.linkedInUrl || initialData?.portfolioLinks?.linkedin || '',
      });
      if (Array.isArray(initialData?.publications)) {
        setPublications(initialData.publications);
      }
    }
  }, [initialData]);

  // Handle Identity Field changes
  const handleIdentityChange = (field: string, value: string) => {
    setIdentityFields(prev => {
      const updated = { ...prev, [field]: value };
      // If user types orcidId, auto-generate orcidUrl if blank or default
      if (field === 'orcidId' && value.trim()) {
        const cleanId = value.trim();
        if (!updated.orcidUrl || updated.orcidUrl.includes('orcid.org')) {
          updated.orcidUrl = `https://orcid.org/${cleanId}`;
        }
      }
      return updated;
    });
  };

  // Save Identity Fields & Publications to Firestore
  const handleSaveAll = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const updatedProfile = {
        ...initialData,
        orcidId: identityFields.orcidId,
        orcidUrl: identityFields.orcidUrl,
        googleScholarUrl: identityFields.googleScholarUrl,
        scopusId: identityFields.scopusId,
        researchGateUrl: identityFields.researchGateUrl,
        linkedInUrl: identityFields.linkedInUrl,
        // Also sync into portfolioLinks for backward compatibility with profile page renderer
        portfolioLinks: {
          ...(initialData?.portfolioLinks || {}),
          orcid: identityFields.orcidId,
          googleScholar: identityFields.googleScholarUrl,
          linkedin: identityFields.linkedInUrl,
          researchgate: identityFields.researchGateUrl,
          website: initialData?.website || initialData?.portfolioLinks?.website || ''
        },
        publications: publications,
        updatedAt: new Date().toISOString()
      };

      await onSaveProfile(updatedProfile);
      setFeedback({ type: 'success', text: 'Research Identity & Publications saved to Firestore successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('Error saving research identity:', err);
      setFeedback({ type: 'error', text: 'Failed to save Research Identity to Firestore. Please try again.' });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPub(null);
    setPubFormData({
      title: '',
      authors: initialData?.fullName || '',
      publishedYear: new Date().getFullYear(),
      journal: '',
      doi: '',
      abstract: '',
      keywords: '',
      publicationUrl: '',
      pdfUrl: '',
      pdfFileName: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (pub: UserResearchPublication) => {
    setEditingPub(pub);
    setPubFormData({
      title: pub.title || '',
      authors: pub.authors || '',
      publishedYear: pub.publishedYear || new Date().getFullYear(),
      journal: pub.journal || '',
      doi: pub.doi || '',
      abstract: pub.abstract || '',
      keywords: Array.isArray(pub.keywords) ? pub.keywords.join(', ') : (pub.keywords || ''),
      publicationUrl: pub.publicationUrl || '',
      pdfUrl: pub.pdfUrl || '',
      pdfFileName: pub.pdfFileName || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Delete Publication
  const handleDeletePublication = (pubId: string) => {
    const updated = publications.filter(p => p.id !== pubId);
    setPublications(updated);
  };

  // Handle PDF File Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setPubFormData(prev => ({
        ...prev,
        pdfUrl: fakeUrl,
        pdfFileName: file.name
      }));
    }
  };

  // Submit Publication Form
  const handleSubmitPubForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!pubFormData.title?.trim()) errors.title = 'Title is required';
    if (!pubFormData.authors?.trim()) errors.authors = 'Authors are required';
    if (!pubFormData.publishedYear) errors.publishedYear = 'Publication year is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const keywordsArray = typeof pubFormData.keywords === 'string'
      ? pubFormData.keywords.split(',').map(k => k.trim()).filter(Boolean)
      : (pubFormData.keywords || []);

    if (editingPub) {
      // Update existing publication
      const updatedList = publications.map(p => {
        if (p.id === editingPub.id) {
          return {
            ...p,
            title: pubFormData.title!.trim(),
            authors: pubFormData.authors!.trim(),
            publishedYear: pubFormData.publishedYear!,
            journal: pubFormData.journal?.trim() || '',
            doi: pubFormData.doi?.trim() || '',
            abstract: pubFormData.abstract?.trim() || '',
            keywords: keywordsArray,
            publicationUrl: pubFormData.publicationUrl?.trim() || '',
            pdfUrl: pubFormData.pdfUrl || '',
            pdfFileName: pubFormData.pdfFileName || '',
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
      setPublications(updatedList);
    } else {
      // Create new publication
      const newPublication: UserResearchPublication = {
        id: `pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: pubFormData.title!.trim(),
        authors: pubFormData.authors!.trim(),
        publishedYear: pubFormData.publishedYear!,
        journal: pubFormData.journal?.trim() || '',
        doi: pubFormData.doi?.trim() || '',
        abstract: pubFormData.abstract?.trim() || '',
        keywords: keywordsArray,
        publicationUrl: pubFormData.publicationUrl?.trim() || '',
        pdfUrl: pubFormData.pdfUrl || '',
        pdfFileName: pubFormData.pdfFileName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPublications(prev => [newPublication, ...prev]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 text-left" id="research_identity_center_wrapper">
      
      {/* Feedback Toast Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-bold">{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- HEADER SECTION ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Academic Credentials & Publications</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
            Research Identity Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your professional research identity and connect external academic profiles.
          </p>
        </div>
      </div>

      {/* ----------------- ACADEMIC IDENTITY FIELDS GRID ----------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            External Academic Identifiers & Profiles
          </h3>
          <span className="text-[11px] font-medium text-slate-400 font-mono">
            6 Connected Systems
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* ORCID ID */}
          <div className="group relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-emerald-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    ORCID ID
                  </label>
                  <p className="text-[10px] text-slate-400 font-mono">16-digit Open Researcher ID</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                Verified Format
              </span>
            </div>
            
            <input
              type="text"
              placeholder="e.g. 0000-0002-1825-0097"
              value={identityFields.orcidId}
              onChange={(e) => handleIdentityChange('orcidId', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* ORCID Profile URL */}
          <div className="group relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-emerald-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    ORCID Profile URL
                  </label>
                  <p className="text-[10px] text-slate-400 font-mono">Public registry endpoint</p>
                </div>
              </div>
              {identityFields.orcidUrl && (
                <a
                  href={identityFields.orcidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  title="Test Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            
            <input
              type="url"
              placeholder="https://orcid.org/0000-0002-1825-0097"
              value={identityFields.orcidUrl}
              onChange={(e) => handleIdentityChange('orcidUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Google Scholar profile URL */}
          <div className="group relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-blue-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    Google Scholar Profile
                  </label>
                  <p className="text-[10px] text-slate-400 font-mono">Citations & index link</p>
                </div>
              </div>
              {identityFields.googleScholarUrl && (
                <a
                  href={identityFields.googleScholarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Test Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            
            <input
              type="url"
              placeholder="https://scholar.google.com/citations?user=..."
              value={identityFields.googleScholarUrl}
              onChange={(e) => handleIdentityChange('googleScholarUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Scopus Author ID */}
          <div className="group relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-amber-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    Scopus Author ID
                  </label>
                  <p className="text-[10px] text-slate-400 font-mono">Elsevier indexed researcher ID</p>
                </div>
              </div>
            </div>
            
            <input
              type="text"
              placeholder="e.g. 57204910283"
              value={identityFields.scopusId}
              onChange={(e) => handleIdentityChange('scopusId', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          {/* ResearchGate profile URL */}
          <div className="group relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-teal-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform duration-300">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    ResearchGate Profile
                  </label>
                  <p className="text-[10px] text-slate-400 font-mono">Academic network URL</p>
                </div>
              </div>
              {identityFields.researchGateUrl && (
                <a
                  href={identityFields.researchGateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  title="Test Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            
            <input
              type="url"
              placeholder="https://www.researchgate.net/profile/..."
              value={identityFields.researchGateUrl}
              onChange={(e) => handleIdentityChange('researchGateUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* LinkedIn profile URL */}
          <div className="group relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-sky-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/60 rounded-xl border border-sky-200/60 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform duration-300">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    LinkedIn Profile
                  </label>
                  <p className="text-[10px] text-slate-400 font-mono">Professional network URL</p>
                </div>
              </div>
              {identityFields.linkedInUrl && (
                <a
                  href={identityFields.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  title="Test Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            
            <input
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={identityFields.linkedInUrl}
              onChange={(e) => handleIdentityChange('linkedInUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

        </div>
      </div>

      {/* ----------------- CREATE / EDIT PUBLICATION MODAL ----------------- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                    {editingPub ? 'Edit Publication' : 'Add New Publication'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitPubForm} className="space-y-4 text-xs">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    Publication Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kinetic Modeling of Thermochemical Anaerobic Digesters"
                    value={pubFormData.title || ''}
                    onChange={(e) => setPubFormData({ ...pubFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  {formErrors.title && <p className="text-[10px] text-rose-500">{formErrors.title}</p>}
                </div>

                {/* Authors & Publication Year */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Authors <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bola Adeyemi, J. O. Smith, A. K. Mensah"
                      value={pubFormData.authors || ''}
                      onChange={(e) => setPubFormData({ ...pubFormData, authors: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    {formErrors.authors && <p className="text-[10px] text-rose-500">{formErrors.authors}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Publication Year <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1950}
                      max={2030}
                      value={pubFormData.publishedYear || new Date().getFullYear()}
                      onChange={(e) => setPubFormData({ ...pubFormData, publishedYear: parseInt(e.target.value) || 2026 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium font-mono"
                    />
                  </div>
                </div>

                {/* Journal & DOI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Journal / Publisher
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Journal of Renewable & Sustainable Energy"
                      value={pubFormData.journal || ''}
                      onChange={(e) => setPubFormData({ ...pubFormData, journal: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      DOI (Digital Object Identifier)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10.1016/j.biortech.2024.130948"
                      value={pubFormData.doi || ''}
                      onChange={(e) => setPubFormData({ ...pubFormData, doi: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                </div>

                {/* Abstract */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    Abstract
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter full abstract or brief overview of methodology and findings..."
                    value={pubFormData.abstract || ''}
                    onChange={(e) => setPubFormData({ ...pubFormData, abstract: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium leading-relaxed"
                  />
                </div>

                {/* Keywords & Publication URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Keywords (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Bioenergy, Anaerobic, Biogas, Waste"
                      value={pubFormData.keywords || ''}
                      onChange={(e) => setPubFormData({ ...pubFormData, keywords: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Publication URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://doi.org/10.1016/..."
                      value={pubFormData.publicationUrl || ''}
                      onChange={(e) => setPubFormData({ ...pubFormData, publicationUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                </div>

                {/* Upload PDF Button / Selector */}
                <div className="space-y-1 pt-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    Upload PDF Document
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer transition">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{pubFormData.pdfFileName ? 'Change PDF File' : 'Select PDF File'}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {pubFormData.pdfFileName && (
                      <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold truncate">
                        {pubFormData.pdfFileName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                  >
                    {editingPub ? 'Update Publication' : 'Save Publication'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
