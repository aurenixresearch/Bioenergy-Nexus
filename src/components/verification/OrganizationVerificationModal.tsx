import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Building2, 
  GraduationCap, 
  FlaskConical, 
  Briefcase, 
  Coins, 
  Globe, 
  HeartHandshake, 
  BookOpen, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Upload, 
  Info, 
  Sparkles, 
  AlertCircle,
  FileText,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { OrganizationCategory } from '../../types';
import { submitOrganizationVerification } from '../../services/db';

interface OrganizationVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userProfile?: any;
  onVerificationSubmitted?: () => void;
}

const ORG_TYPES: { id: OrganizationCategory; title: string; desc: string; icon: any; color: string }[] = [
  { id: 'university', title: 'University / Research Institution', desc: 'Academic institutions, faculties, and public/private universities', icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
  { id: 'lab', title: 'Research Institute / Laboratory', desc: 'Specialized scientific research centers, labs, and testing facilities', icon: FlaskConical, color: 'from-cyan-500 to-teal-600' },
  { id: 'company', title: 'Industry / Company', desc: 'Private sector enterprises, technology developers, and manufacturers', icon: Briefcase, color: 'from-amber-500 to-orange-600' },
  { id: 'investor', title: 'Investor / Funding Organization', desc: 'Venture funds, angel networks, grant bodies, and foundations', icon: Coins, color: 'from-emerald-500 to-green-600' },
  { id: 'government', title: 'Government Agency', desc: 'Ministries, national research councils, and regulatory bodies', icon: Globe, color: 'from-purple-500 to-violet-600' },
  { id: 'ngo', title: 'NGO / Development Organization', desc: 'Non-profits, civil society, and international development agencies', icon: HeartHandshake, color: 'from-rose-500 to-pink-600' },
  { id: 'publisher', title: 'Publisher / Academic Journal', desc: 'Scientific journal publishers, editorial bodies, and repositories', icon: BookOpen, color: 'from-amber-400 to-yellow-600' },
  { id: 'professional', title: 'Professional / Technical Org', desc: 'Engineering societies, standards bodies, and trade federations', icon: Award, color: 'from-sky-500 to-blue-600' },
  { id: 'other_org', title: 'Other Organization', desc: 'Other institutional or organizational research entities', icon: Building2, color: 'from-slate-500 to-slate-700' },
];

// African & Global Countries
const COUNTRIES = [
  "Nigeria", "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Cameroon", "Egypt", 
  "Ethiopia", "Ghana", "Ivory Coast", "Kenya", "Morocco", "Mozambique", "Rwanda", "Senegal", 
  "South Africa", "Sudan", "Tanzania", "Tunisia", "Uganda", "Zambia", "Zimbabwe",
  "Australia", "Austria", "Belgium", "Brazil", "Canada", "China", "Denmark", "Finland", 
  "France", "Germany", "India", "Ireland", "Italy", "Japan", "Malaysia", "Netherlands", 
  "Norway", "Saudi Arabia", "Singapore", "South Korea", "Spain", "Sweden", "Switzerland", 
  "United Arab Emirates", "United Kingdom", "United States"
];

export default function OrganizationVerificationModal({
  isOpen,
  onClose,
  user,
  userProfile,
  onVerificationSubmitted
}: OrganizationVerificationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOrgType, setSelectedOrgType] = useState<OrganizationCategory | null>(
    userProfile?.organizationType || null
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // General Form States
  const [formData, setFormData] = useState<Record<string, any>>({
    country: userProfile?.country || 'Nigeria',
    officialEmail: user?.email || userProfile?.email || '',
    contactPerson: userProfile?.fullName || '',
    contactPosition: userProfile?.professionalTitle || '',
    website: userProfile?.website || '',
    orgName: userProfile?.institution || userProfile?.organizationName || '',
    city: userProfile?.city || '',
    contributions: [],
    supportGoals: [],
    documentUrl: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxToggle = (arrayField: string, item: string) => {
    setFormData(prev => {
      const current = prev[arrayField] || [];
      const updated = current.includes(item)
        ? current.filter((i: string) => i !== item)
        : [...current, item];
      return { ...prev, [arrayField]: updated };
    });
  };

  const validateStep2 = () => {
    if (!selectedOrgType) {
      setErrorMsg('Please select an organization type.');
      return false;
    }
    const name = formData.orgName || formData.institutionName || formData.companyName || formData.agencyName || formData.publisherName || formData.fundName;
    if (!name || !name.trim()) {
      setErrorMsg('Please enter your organization name.');
      return false;
    }
    if (!formData.country) {
      setErrorMsg('Please select your country.');
      return false;
    }
    if (!formData.contactPerson || !formData.contactPerson.trim()) {
      setErrorMsg('Please specify the contact person name.');
      return false;
    }
    if (!formData.officialEmail || !formData.officialEmail.trim()) {
      setErrorMsg('Please enter an official contact email.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const docs = formData.documentUrl ? [formData.documentUrl] : [];
      await submitOrganizationVerification(
        user.uid,
        user.email || '',
        userProfile?.role || 'Institution',
        selectedOrgType,
        formData,
        docs
      );

      setStep(3);
      if (onVerificationSubmitted) {
        onVerificationSubmitted();
      }
    } catch (err: any) {
      console.error('Error submitting organization verification:', err);
      setErrorMsg(err.message || 'Failed to submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 sm:px-8 border-b border-slate-800/80 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Organization Verification Pathway
                </h2>
                <p className="text-xs text-slate-400">
                  {step === 1 && 'Step 1 of 2: Select Organization Type'}
                  {step === 2 && 'Step 2 of 2: Complete Verification Details'}
                  {step === 3 && 'Verification Submitted'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: ORGANIZATION TYPE SELECTOR */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    What type of organization are you?
                  </h3>
                  <p className="text-sm text-slate-400">
                    Select your organization entity type below. Each organization type loads a tailored verification form aligned with your research infrastructure and contributions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {ORG_TYPES.map((org) => {
                    const IconComponent = org.icon;
                    const isSelected = selectedOrgType === org.id;

                    return (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrgType(org.id);
                          setErrorMsg(null);
                        }}
                        className={`group relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/20'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${org.color} p-2.5 text-white shadow-md flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5" />
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                              {org.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {org.desc}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-3 right-3 p-1 rounded-full bg-emerald-500 text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    disabled={!selectedOrgType}
                    onClick={() => {
                      if (!selectedOrgType) {
                        setErrorMsg('Please select an organization type to continue.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg flex items-center gap-2"
                  >
                    <span>Continue to Verification Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DYNAMIC FORM BASED ON ORGANIZATION TYPE */}
            {step === 2 && selectedOrgType && (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Organization Type ({ORG_TYPES.find(t => t.id === selectedOrgType)?.title})</span>
                </button>

                {/* --- PUBLISHER / JOURNAL SPECIFIC EXPLANATION BANNER --- */}
                {selectedOrgType === 'publisher' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-sm text-amber-200">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Publisher and Journal Verification Notice</span>
                    </div>
                    <p className="text-xs leading-relaxed text-amber-300/90">
                      Publisher and journal profiles are verified separately because publishing organizations represent research dissemination infrastructure rather than individual researchers. Providing journal details ensures transparent indexing and verification tiers.
                    </p>
                  </div>
                )}

                {/* SECTION 1: CORE IDENTITY */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                    1. Core Institutional Identity
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        {selectedOrgType === 'university' && 'University / Institution Name *'}
                        {selectedOrgType === 'company' && 'Company / Organization Name *'}
                        {selectedOrgType === 'investor' && 'Fund / Organization Name *'}
                        {selectedOrgType === 'government' && 'Government Agency Name *'}
                        {selectedOrgType === 'publisher' && 'Publisher / Journal Name *'}
                        {selectedOrgType === 'ngo' && 'NGO / Organization Name *'}
                        {(selectedOrgType === 'lab' || selectedOrgType === 'professional' || selectedOrgType === 'other_org') && 'Organization Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.orgName}
                        onChange={e => handleInputChange('orgName', e.target.value)}
                        placeholder="e.g. Federal University of Technology Akure"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Country *
                      </label>
                      <select
                        required
                        value={formData.country}
                        onChange={e => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      >
                        {COUNTRIES.map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        City / Region
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => handleInputChange('city', e.target.value)}
                        placeholder="e.g. Akure, Ondo State"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Official Website URL
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={e => handleInputChange('website', e.target.value)}
                        placeholder="https://www.futa.edu.ng"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CONTACT & CREDENTIALS */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                    2. Primary Contact & Official Credentials
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactPerson}
                        onChange={e => handleInputChange('contactPerson', e.target.value)}
                        placeholder="Dr. Samuel Adebayo"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Contact Person Position / Title
                      </label>
                      <input
                        type="text"
                        value={formData.contactPosition}
                        onChange={e => handleInputChange('contactPosition', e.target.value)}
                        placeholder="Director of Research & Innovation"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Official Institutional/Business Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.officialEmail}
                        onChange={e => handleInputChange('officialEmail', e.target.value)}
                        placeholder="research@futa.edu.ng"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Registration / Legal ID Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.registrationNumber || ''}
                        onChange={e => handleInputChange('registrationNumber', e.target.value)}
                        placeholder="e.g. CAC/RC/998822 or Accreditation ID"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: SPECIFIC TYPE-BASED QUESTIONS */}

                {/* UNIVERSITY & LAB SPECIFIC */}
                {(selectedOrgType === 'university' || selectedOrgType === 'lab') && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                      3. Academic Infrastructure & Facilities
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Department / Faculty / Unit</label>
                        <input
                          type="text"
                          value={formData.department || ''}
                          onChange={e => handleInputChange('department', e.target.value)}
                          placeholder="Faculty of Engineering / Renewable Energy Lab"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Institution Type</label>
                        <select
                          value={formData.institutionType || 'Public Research University'}
                          onChange={e => handleInputChange('institutionType', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Public Research University">Public Research University</option>
                          <option value="Private University">Private University</option>
                          <option value="Polytechnic / Technology Institute">Polytechnic / Technology Institute</option>
                          <option value="Government Research Institute">Government Research Institute</option>
                          <option value="Independent Research Lab">Independent Research Lab</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Laboratory & Research Facilities Description</label>
                      <textarea
                        rows={2}
                        value={formData.facilitiesDescription || ''}
                        onChange={e => handleInputChange('facilitiesDescription', e.target.value)}
                        placeholder="Describe available spectrometers, biodigesters, gas chromatography tools, pilots..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">What does your institution wish to contribute to Aurenix?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Research collaboration', 'Laboratory access', 'Equipment access',
                          'Technical expertise', 'Student/researcher support', 'Joint research',
                          'Training', 'Funding partnership', 'Industry-academic collaboration'
                        ].map(item => (
                          <label key={item} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                            <input
                              type="checkbox"
                              checked={(formData.contributions || []).includes(item)}
                              onChange={() => handleCheckboxToggle('contributions', item)}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* INDUSTRY & COMPANY SPECIFIC */}
                {selectedOrgType === 'company' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                      3. Industrial Sector & Research Challenges
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Industry Sector</label>
                        <input
                          type="text"
                          value={formData.industrySector || ''}
                          onChange={e => handleInputChange('industrySector', e.target.value)}
                          placeholder="e.g. Bio-Manufacturing, Waste Management, Clean Energy"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Registration Legal Identity</label>
                        <input
                          type="text"
                          value={formData.legalIdentity || ''}
                          onChange={e => handleInputChange('legalIdentity', e.target.value)}
                          placeholder="e.g. Registered LLC / Public Limited Company"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Problems / Challenges You Want Research to Solve</label>
                      <textarea
                        rows={2}
                        value={formData.researchChallenges || ''}
                        onChange={e => handleInputChange('researchChallenges', e.target.value)}
                        placeholder="e.g. Optimizing bio-digester methane yield using cassava peel feedstock..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Possible Contributions to Research Alliances</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Funding', 'Equipment', 'Materials', 'Industrial data', 'Pilot testing',
                          'Manufacturing', 'Technical expertise', 'Internship/placement',
                          'Commercialization', 'Technology adoption', 'Research collaboration'
                        ].map(item => (
                          <label key={item} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                            <input
                              type="checkbox"
                              checked={(formData.contributions || []).includes(item)}
                              onChange={() => handleCheckboxToggle('contributions', item)}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* INVESTOR SPECIFIC */}
                {selectedOrgType === 'investor' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                      3. Investment Focus & Funding Criteria
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Funding Model</label>
                        <select
                          value={formData.fundingModel || 'Grants'}
                          onChange={e => handleInputChange('fundingModel', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Grants">Non-repayable Grants</option>
                          <option value="Equity Investment">Equity Investment</option>
                          <option value="Sponsorship">Sponsorship & Equipment</option>
                          <option value="Concessional Loans">Concessional Loans</option>
                          <option value="Hybrid / Convertible">Hybrid / Convertible</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Funding Stage Focus</label>
                        <input
                          type="text"
                          value={formData.fundingStage || ''}
                          onChange={e => handleInputChange('fundingStage', e.target.value)}
                          placeholder="e.g. Lab TRL 3-6 / Prototype to Pilot"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Typical Funding Range (Optional)</label>
                        <input
                          type="text"
                          value={formData.fundingRange || ''}
                          onChange={e => handleInputChange('fundingRange', e.target.value)}
                          placeholder="e.g. $10,000 - $100,000"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">What are you looking to support through Aurenix?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Research grants', 'Technology development', 'Commercialization', 'Startups',
                          'Laboratory development', 'Equipment', 'Pilot projects', 'Student/researcher projects',
                          'Environmental projects', 'Industrial research', 'Other'
                        ].map(item => (
                          <label key={item} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                            <input
                              type="checkbox"
                              checked={(formData.supportGoals || []).includes(item)}
                              onChange={() => handleCheckboxToggle('supportGoals', item)}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* GOVERNMENT SPECIFIC */}
                {selectedOrgType === 'government' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                      3. Ministry & Public Program Mandate
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Government Level</label>
                        <select
                          value={formData.governmentLevel || 'National / Federal'}
                          onChange={e => handleInputChange('governmentLevel', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="National / Federal">National / Federal</option>
                          <option value="State / Regional">State / Regional</option>
                          <option value="Local Government">Local Government</option>
                          <option value="Multilateral / Intergovernmental">Multilateral / Intergovernmental</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Ministry / Department</label>
                        <input
                          type="text"
                          value={formData.ministry || ''}
                          onChange={e => handleInputChange('ministry', e.target.value)}
                          placeholder="e.g. Ministry of Science & Technology"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Programs & National Directives to Support</label>
                      <textarea
                        rows={2}
                        value={formData.programInterests || ''}
                        onChange={e => handleInputChange('programInterests', e.target.value)}
                        placeholder="e.g. National Bioenergy Safety Framework and Rural Electrification Programs..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* NGO SPECIFIC */}
                {selectedOrgType === 'ngo' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                      3. NGO Operations & Impact Focus
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Development & Community Focus</label>
                        <input
                          type="text"
                          value={formData.developmentFocus || ''}
                          onChange={e => handleInputChange('developmentFocus', e.target.value)}
                          placeholder="e.g. Rural Clean Energy Access & Smallholder Farmers"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Communities / Sectors Served</label>
                        <input
                          type="text"
                          value={formData.communitiesServed || ''}
                          onChange={e => handleInputChange('communitiesServed', e.target.value)}
                          placeholder="e.g. Off-grid agrarian communities in West Africa"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PUBLISHER & ACADEMIC JOURNAL SPECIFIC */}
                {selectedOrgType === 'publisher' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                      3. Journal Metadata & Dissemination Metrics
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Journal Name(s)</label>
                        <input
                          type="text"
                          value={formData.journalNames || ''}
                          onChange={e => handleInputChange('journalNames', e.target.value)}
                          placeholder="e.g. African Journal of Bioenergy Research"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">ISSN (Print)</label>
                        <input
                          type="text"
                          value={formData.issn || ''}
                          onChange={e => handleInputChange('issn', e.target.value)}
                          placeholder="e.g. 1234-5678"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">eISSN (Online)</label>
                        <input
                          type="text"
                          value={formData.eissn || ''}
                          onChange={e => handleInputChange('eissn', e.target.value)}
                          placeholder="e.g. 9876-5432"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Editor-in-Chief & Affiliation</label>
                        <input
                          type="text"
                          value={formData.editorInChief || ''}
                          onChange={e => handleInputChange('editorInChief', e.target.value)}
                          placeholder="Prof. O. K. Johnson (Univ. of Ibadan)"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Publication Model</label>
                        <select
                          value={formData.publicationModel || 'Open Access'}
                          onChange={e => handleInputChange('publicationModel', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Open Access">Gold Open Access</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Subscription">Subscription</option>
                          <option value="Diamond Open Access">Diamond Open Access (No APC)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Peer-Review Process & Policy</label>
                        <input
                          type="text"
                          value={formData.peerReviewProcess || ''}
                          onChange={e => handleInputChange('peerReviewProcess', e.target.value)}
                          placeholder="e.g. Double-blind peer review with 2 minimum reviewers"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">DOI / Crossref Prefix (If applicable)</label>
                        <input
                          type="text"
                          value={formData.doiPrefix || ''}
                          onChange={e => handleInputChange('doiPrefix', e.target.value)}
                          placeholder="e.g. 10.59822/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENT / EVIDENCE UPLOAD / URL */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                    4. Verification Supporting Document (Optional / Recommended)
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Supporting Document URL / Link (Official Decree, Accreditation Certificate, or Portal Page)
                    </label>
                    <input
                      type="url"
                      value={formData.documentUrl || ''}
                      onChange={e => handleInputChange('documentUrl', e.target.value)}
                      placeholder="https://drive.google.com/... or official accreditation document link"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Form Footer Action */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Organization Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUBMISSION CONFIRMATION */}
            {step === 3 && (
              <div className="py-8 text-center space-y-6 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    Verification Application Submitted!
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your organization details have been received and routed to our administrative review queue.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1 text-left">
                  <p className="font-semibold text-slate-200">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Review standard takes between 24 and 48 business hours.</li>
                    <li>You will receive a notification on your dashboard when reviewed.</li>
                    <li>You can continue exploring the platform and managing your profile.</li>
                  </ul>
                </div>

                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm transition-all shadow-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
