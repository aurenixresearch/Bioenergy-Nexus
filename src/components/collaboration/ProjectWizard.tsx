import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  HelpCircle, 
  AlertCircle, 
  X, 
  Plus, 
  FileText, 
  Cpu, 
  Layers, 
  MapPin, 
  Building, 
  Calendar, 
  Sparkles 
} from 'lucide-react';
import { Project } from './types';
import { RESEARCH_AREAS, TECHNOLOGY_AREAS, SDG_LIST, COUNTRIES, SUPPORT_OPTIONS } from './mockData';

interface ProjectWizardProps {
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export default function ProjectWizard({ onClose, onSave }: ProjectWizardProps) {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [technologyArea, setTechnologyArea] = useState(TECHNOLOGY_AREAS[0]);
  const [trl, setTrl] = useState(3);
  const [expectedImpact, setExpectedImpact] = useState('');
  const [selectedSdgs, setSelectedSdgs] = useState<string[]>([]);
  const [country, setCountry] = useState('Nigeria');
  const [institution, setInstitution] = useState('');
  const [researchArea, setResearchArea] = useState(RESEARCH_AREAS[0]);
  const [supportNeeded, setSupportNeeded] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [milestones, setMilestones] = useState<string[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState('');
  const [currentStage, setCurrentStage] = useState('Research');
  const [prototypeAvailable, setPrototypeAvailable] = useState(false);
  const [patentStatus, setPatentStatus] = useState<'None' | 'Pending' | 'Granted'>('None');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [currentTeamMember, setCurrentTeamMember] = useState('');

  const handleNext = () => {
    if (step === 1) {
      if (!title || !problemStatement || !proposedSolution) {
        setErrorMsg('Please fill in all fields before proceeding.');
        return;
      }
    }
    if (step === 2) {
      if (!expectedImpact || selectedSdgs.length === 0) {
        setErrorMsg('Please describe expected impact and select at least one SDG.');
        return;
      }
    }
    if (step === 3) {
      if (!institution || !budget || !timeline || supportNeeded.length === 0) {
        setErrorMsg('Please specify institution, budget, timeline, and support needed.');
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

  const handleSdgToggle = (sdg: string) => {
    setSelectedSdgs(prev => 
      prev.includes(sdg) ? prev.filter(item => item !== sdg) : [...prev, sdg]
    );
  };

  const handleSupportToggle = (opt: string) => {
    setSupportNeeded(prev => 
      prev.includes(opt) ? prev.filter(item => item !== opt) : [...prev, opt]
    );
  };

  const addMilestone = () => {
    if (currentMilestone.trim()) {
      setMilestones(prev => [...prev, currentMilestone.trim()]);
      setCurrentMilestone('');
    }
  };

  const removeMilestone = (idx: number) => {
    setMilestones(prev => prev.filter((_, i) => i !== idx));
  };

  const addTeamMember = () => {
    if (currentTeamMember.trim()) {
      setTeamMembers(prev => [...prev, currentTeamMember.trim()]);
      setCurrentTeamMember('');
    }
  };

  const removeTeamMember = (idx: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMilestones = milestones.length > 0 ? milestones : ['Project Kickoff', 'Validation Study'];
    const finalTeam = teamMembers.length > 0 ? teamMembers : ['Lead Researcher'];
    
    onSave({
      title,
      problemStatement,
      proposedSolution,
      technologyArea,
      trl,
      expectedImpact,
      sdgs: selectedSdgs,
      country,
      institution,
      researchArea,
      supportNeeded,
      budget,
      timeline,
      milestones: finalMilestones,
      currentStage,
      prototypeAvailable,
      patentStatus,
      researchTeam: finalTeam,
      status: 'Published',
      visibility: 'Public'
    });
  };

  const trlDescriptions: Record<number, string> = {
    1: 'TRL 1: Basic principles observed and reported (Conceptual level)',
    2: 'TRL 2: Technology concept and/or application formulated',
    3: 'TRL 3: Analytical and experimental critical function / characteristic proof-of-concept',
    4: 'TRL 4: Component and/or breadboard validation in laboratory environment',
    5: 'TRL 5: Component and/or breadboard validation in relevant environment (Pilot model)',
    6: 'TRL 6: System/subsystem model or prototype demonstration in a relevant environment',
    7: 'TRL 7: System prototype demonstration in an operational environment (e.g. Airport/Coop)',
    8: 'TRL 8: Actual system completed and qualified through test and demonstration',
    9: 'TRL 9: Actual system proven through successful mission operations'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-left" id="project_wizard_modal">
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
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Research Publish Wizard</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-display mt-1">Publish Active Research Project</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress tracker */}
        <div className="px-8 py-4 bg-emerald-50/30 border-b border-slate-100/50 shrink-0 flex justify-between items-center text-xs font-mono font-semibold text-slate-500">
          <div className="flex items-center gap-6">
            <span className={step === 1 ? 'text-emerald-700 font-bold' : ''}>1. Fundamentals</span>
            <span className="text-slate-300">&rarr;</span>
            <span className={step === 2 ? 'text-emerald-700 font-bold' : ''}>2. Classification</span>
            <span className="text-slate-300">&rarr;</span>
            <span className={step === 3 ? 'text-emerald-700 font-bold' : ''}>3. Context</span>
            <span className="text-slate-300">&rarr;</span>
            <span className={step === 4 ? 'text-emerald-700 font-bold' : ''}>4. Roster & Deliverables</span>
          </div>
          <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">Step {step}/4</span>
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
            {/* STEP 1: BASE/FUNDAMENTALS */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Research Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Off-grid Dual-Stage Poultry Digester with Zeolite Adsorption"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition"
                  />
                  <span className="text-[10px] text-slate-400">Describe your research target clearly and concisely.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Problem Statement</label>
                  <textarea
                    rows={3}
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="Describe the critical environmental, energy, or circular challenge your study targets..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Proposed Chemical or Engineering Solution</label>
                  <textarea
                    rows={3}
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value)}
                    placeholder="Describe how your design solves this problem, highlighting specific process kinetics or mechanical components..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: CLASSIFICATION */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Technology Area</label>
                    <select
                      value={technologyArea}
                      onChange={(e) => setTechnologyArea(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    >
                      {TECHNOLOGY_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Current Stage</label>
                    <select
                      value={currentStage}
                      onChange={(e) => setCurrentStage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    >
                      <option value="Idea">Idea / Literature Study</option>
                      <option value="Research">Active Laboratory Research</option>
                      <option value="Prototype">Bench-Scale Prototype Validated</option>
                      <option value="Pilot">Active Pilot Running on Site</option>
                      <option value="Commercial">Commercialized / Licensed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Technology Readiness Level (TRL)</label>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">Level {trl}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    value={trl}
                    onChange={(e) => setTrl(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                    {trlDescriptions[trl]}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Expected Impact Metrics</label>
                  <textarea
                    rows={2}
                    value={expectedImpact}
                    onChange={(e) => setExpectedImpact(e.target.value)}
                    placeholder="e.g. Methane capture rate, daily bio-fertilizer yield, or carbon-offset calculations..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Aligned Sustainable Development Goals (SDGs)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {SDG_LIST.map((sdg) => (
                      <label
                        key={sdg}
                        className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all duration-150 ${
                          selectedSdgs.includes(sdg)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSdgs.includes(sdg)}
                          onChange={() => handleSdgToggle(sdg)}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          selectedSdgs.includes(sdg) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedSdgs.includes(sdg) && <Check className="w-3 h-3" />}
                        </div>
                        <span>{sdg}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONTEXT & SUPPORT */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Host Institution</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Ahmadu Bello University"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Host Country</label>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 block">Core Research Area</label>
                    <select
                      value={researchArea}
                      onChange={(e) => setResearchArea(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    >
                      {RESEARCH_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 block">Estimated Budget Needed</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. $18,500"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 block">Expected Study Duration</label>
                    <input
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. 12 Months"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Critical Support Needed</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {SUPPORT_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all duration-150 ${
                          supportNeeded.includes(opt)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={supportNeeded.includes(opt)}
                          onChange={() => handleSupportToggle(opt)}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          supportNeeded.includes(opt) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {supportNeeded.includes(opt) && <Check className="w-3 h-3" />}
                        </div>
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: DETAILS, ROSTER, UPLOADS */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Patent / IP Status</label>
                    <select
                      value={patentStatus}
                      onChange={(e) => setPatentStatus(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    >
                      <option value="None">None (Open Source / Public Domain)</option>
                      <option value="Pending">IP Patent Pending</option>
                      <option value="Granted">IP Patent Granted</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Functional Prototype</label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          checked={prototypeAvailable === true}
                          onChange={() => setPrototypeAvailable(true)}
                          className="w-4 h-4 text-emerald-600 border-slate-200 focus:ring-emerald-500"
                        />
                        <span>Yes, Prototype Available</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          checked={prototypeAvailable === false}
                          onChange={() => setPrototypeAvailable(false)}
                          className="w-4 h-4 text-emerald-600 border-slate-200 focus:ring-emerald-500"
                        />
                        <span>No, Conceptual / Simulation Only</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Team Roster List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Research Team Roster</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentTeamMember}
                      onChange={(e) => setCurrentTeamMember(e.target.value)}
                      placeholder="e.g. Dr. Yusuf Bello (Principal Investigator)"
                      className="flex-grow px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  {teamMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {teamMembers.map((member, idx) => (
                        <div key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <span>{member}</span>
                          <button type="button" onClick={() => removeTeamMember(idx)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 block pt-1">No roster entries. System will default to your profile.</span>
                  )}
                </div>

                {/* Study Milestones List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Core Timeline Milestones</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentMilestone}
                      onChange={(e) => setCurrentMilestone(e.target.value)}
                      placeholder="e.g. Substrate characterization & yield calibration (Month 03)"
                      className="flex-grow px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  {milestones.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {milestones.map((milestone, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium flex justify-between items-center text-slate-700">
                          <span>{milestone}</span>
                          <button type="button" onClick={() => removeMilestone(idx)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 block pt-1">No milestones added. Defaults will be injected.</span>
                  )}
                </div>

                {/* Simulated file upload block */}
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50 transition cursor-pointer">
                  <FileText className="w-8 h-8 text-slate-400" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-700">Attach Technical Studies (PDF, PNG, CAD)</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Drag & drop files or click to simulate attachments upload.</p>
                  </div>
                  <div className="inline-flex gap-2 text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-bold">
                    <span>Max Size: 10MB</span>
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
            {step < 4 ? (
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
                Publish Study
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
