import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Plus, 
  Building, 
  Globe, 
  Coins, 
  Users, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { AllianceOpportunity, StakeholderType } from './types';
import { RESEARCH_AREAS, TECHNOLOGY_AREAS, COUNTRIES, SUPPORT_OPTIONS } from './mockData';

interface AllianceWizardProps {
  onClose: () => void;
  onSave: (allianceData: Omit<AllianceOpportunity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

const STAKEHOLDER_TYPES: StakeholderType[] = [
  'University', 
  'Industry', 
  'Government', 
  'NGO', 
  'Investor', 
  'International Organization'
];

export default function AllianceWizard({ onClose, onSave }: AllianceWizardProps) {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<StakeholderType>('University');
  const [country, setCountry] = useState('Nigeria');
  const [website, setWebsite] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedResearchAreas, setSelectedResearchAreas] = useState<string[]>([]);
  const [selectedTechAreas, setSelectedTechAreas] = useState<string[]>([]);
  const [eligibleCountries, setEligibleCountries] = useState<string[]>(['Nigeria']);
  const [fundingAmount, setFundingAmount] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [currentFacility, setCurrentFacility] = useState('');
  const [timeline, setTimeline] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(3);
  const [supportOffered, setSupportOffered] = useState<string[]>([]);

  const handleNext = () => {
    if (step === 1) {
      if (!orgName || !contactPerson || !email) {
        setErrorMsg('Please specify organization name, contact person, and email.');
        return;
      }
    }
    if (step === 2) {
      if (!title || !description || selectedResearchAreas.length === 0) {
        setErrorMsg('Please fill in opportunity title, description, and select at least one research focus area.');
        return;
      }
    }
    setErrorMsg('');
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const handleResearchAreaToggle = (area: string) => {
    setSelectedResearchAreas(prev => 
      prev.includes(area) ? prev.filter(item => item !== area) : [...prev, area]
    );
  };

  const handleTechAreaToggle = (area: string) => {
    setSelectedTechAreas(prev => 
      prev.includes(area) ? prev.filter(item => item !== area) : [...prev, area]
    );
  };

  const handleCountryToggle = (ct: string) => {
    setEligibleCountries(prev => 
      prev.includes(ct) ? prev.filter(item => item !== ct) : [...prev, ct]
    );
  };

  const handleSupportToggle = (opt: string) => {
    setSupportOffered(prev => 
      prev.includes(opt) ? prev.filter(item => item !== opt) : [...prev, opt]
    );
  };

  const addFacility = () => {
    if (currentFacility.trim()) {
      setFacilities(prev => [...prev, currentFacility.trim()]);
      setCurrentFacility('');
    }
  };

  const removeFacility = (idx: number) => {
    setFacilities(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supportOffered.length === 0) {
      setErrorMsg('Please select at least one support offering (e.g., funding or lab space).');
      return;
    }
    const finalFacilities = facilities.length > 0 ? facilities : ['Technical advice'];
    
    onSave({
      orgName,
      orgType,
      country,
      website: website || 'https://aurenix.org',
      contactPerson,
      email,
      logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
      title,
      description,
      researchAreas: selectedResearchAreas,
      technologyAreas: selectedTechAreas,
      eligibleCountries,
      fundingAmount: fundingAmount || '$0 (In-Kind Facilities)',
      facilitiesAvailable: finalFacilities,
      timeline: timeline || '12 Months',
      deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      maxParticipants,
      supportOffered,
      status: 'Active',
      visibility: 'Public'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-left" id="alliance_wizard_modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Stakeholder Publisher</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-display mt-1">Create Alliance Opportunity</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Tracker */}
        <div className="px-8 py-4 bg-emerald-50/30 border-b border-slate-100/50 shrink-0 flex justify-between items-center text-xs font-mono font-semibold text-slate-500">
          <div className="flex items-center gap-6">
            <span className={step === 1 ? 'text-emerald-700 font-bold' : ''}>1. Organization Details</span>
            <span className="text-slate-300">&rarr;</span>
            <span className={step === 2 ? 'text-emerald-700 font-bold' : ''}>2. Scope & Target</span>
            <span className="text-slate-300">&rarr;</span>
            <span className={step === 3 ? 'text-emerald-700 font-bold' : ''}>3. Funding & Logistics</span>
          </div>
          <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">Step {step}/3</span>
        </div>

        {/* Content body */}
        <div className="p-8 overflow-y-auto flex-grow space-y-6">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: ORGANIZATION DETAILS */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. African Development Bank"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Organization Type</label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    >
                      {STAKEHOLDER_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Country Headquarter</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    >
                      {COUNTRIES.map((ct) => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Website URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. https://www.afdb.org"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Contact Person Name</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Dr. Albert Ndoumbe"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Contact Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. a.ndoumbe@afdb.org"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SCOPE & TARGETS */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Alliance Opportunity Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sub-Saharan Clean Energy Innovation Grant 2026"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Opportunity Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the opportunity scope, who is eligible, and what research you want to sponsor or host..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Focus Research Areas (Select multi)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {RESEARCH_AREAS.map((area) => (
                      <label
                        key={area}
                        className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                          selectedResearchAreas.includes(area)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedResearchAreas.includes(area)}
                          onChange={() => handleResearchAreaToggle(area)}
                          className="hidden"
                        />
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          selectedResearchAreas.includes(area) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedResearchAreas.includes(area) && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Target Technology Areas</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {TECHNOLOGY_AREAS.map((area) => (
                      <label
                        key={area}
                        className={`p-2.5 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                          selectedTechAreas.includes(area)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTechAreas.includes(area)}
                          onChange={() => handleTechAreaToggle(area)}
                          className="hidden"
                        />
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          selectedTechAreas.includes(area) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedTechAreas.includes(area) && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: FUNDING, LOGISTICS, FACILITIES */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Funding Cap Amount</label>
                    <input
                      type="text"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      placeholder="e.g. $50,000 or In-Kind"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Opportunity Timeline</label>
                    <input
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. 24 Months"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Applications Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Max Projects Co-Sponsored</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Eligible Countries</label>
                    <div className="flex flex-wrap gap-2">
                      {COUNTRIES.map((ct) => (
                        <button
                          type="button"
                          key={ct}
                          onClick={() => handleCountryToggle(ct)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            eligibleCountries.includes(ct)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Facilities List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Available Facilities / Support Items</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentFacility}
                      onChange={(e) => setCurrentFacility(e.target.value)}
                      placeholder="e.g. ISO-Certified Chromatography lab equipment"
                      className="flex-grow px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={addFacility}
                      className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  {facilities.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {facilities.map((fac, idx) => (
                        <div key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <span>{fac}</span>
                          <button type="button" onClick={() => removeFacility(idx)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 block pt-1">No facilities added yet.</span>
                  )}
                </div>

                {/* Support Offered Checklist */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Primary Support Offerings</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {SUPPORT_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all duration-150 ${
                          supportOffered.includes(opt)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={supportOffered.includes(opt)}
                          onChange={() => handleSupportToggle(opt)}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          supportOffered.includes(opt) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {supportOffered.includes(opt) && <Check className="w-3 h-3" />}
                        </div>
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </form>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Publish Alliance
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
