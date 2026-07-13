import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Upload, Plus, Trash2, Check, Sparkles, 
  Sun, Wind, Zap, Droplets, RefreshCw, Battery, Globe, Landmark, Eye, Lock, Users, ShieldAlert,
  FileText, Link2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResearchPaper, CoAuthor } from '../types';

interface PublishWizardProps {
  onClose: () => void;
  onSubmit: (paperData: Omit<ResearchPaper, 'id'>) => Promise<void>;
  initialData?: Partial<ResearchPaper>;
}

export default function PublishWizard({ onClose, onSubmit, initialData }: PublishWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // State for all form fields
  // Step 1
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [category, setCategory] = useState<ResearchPaper['category']>(initialData?.category || 'Bioenergy Technology');
  const [keywords, setKeywords] = useState<string>(initialData?.keywords?.join(', ') || '');
  const [status, setStatus] = useState<'Ongoing' | 'Completed' | 'Under Review' | 'Published'>(initialData?.status || 'Published');
  const [language, setLanguage] = useState(initialData?.language || 'English');
  const [readingTime, setReadingTime] = useState(initialData?.readingTime || '15 mins');

  // Step 2
  const [leadResearcher, setLeadResearcher] = useState(initialData?.leadResearcher || '');
  const [coAuthors, setCoAuthors] = useState<CoAuthor[]>(initialData?.coAuthors || []);
  const [institution, setInstitution] = useState(initialData?.institution || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [country, setCountry] = useState(initialData?.country || '');
  const [orcid, setOrcid] = useState(initialData?.orcid || '');
  const [googleScholar, setGoogleScholar] = useState(initialData?.googleScholar || '');

  // Co-author temporary fields
  const [tempCoAuthorName, setTempCoAuthorName] = useState('');
  const [tempCoAuthorInstitution, setTempCoAuthorInstitution] = useState('');
  const [tempCoAuthorDepartment, setTempCoAuthorDepartment] = useState('');
  const [tempCoAuthorCountry, setTempCoAuthorCountry] = useState('');
  const [tempCoAuthorOrcid, setTempCoAuthorOrcid] = useState('');
  const [tempCoAuthorScholar, setTempCoAuthorScholar] = useState('');
  const [showAddCoAuthorForm, setShowAddCoAuthorForm] = useState(false);

  // Step 3
  const [problemStatement, setProblemStatement] = useState(initialData?.problemStatement || '');
  const [objectives, setObjectives] = useState(initialData?.objectives || '');
  const [researchQuestions, setResearchQuestions] = useState(initialData?.researchQuestions || '');
  const [researchMethodology, setResearchMethodology] = useState(initialData?.researchMethodology || '');
  const [materialsUsed, setMaterialsUsed] = useState(initialData?.materialsUsed || '');
  const [dataCollectionMethod, setDataCollectionMethod] = useState(initialData?.dataCollectionMethod || '');
  const [studyArea, setStudyArea] = useState(initialData?.studyArea || '');
  const [durationOfResearch, setDurationOfResearch] = useState(initialData?.durationOfResearch || '');

  // Step 4
  const [keyFindings, setKeyFindings] = useState(initialData?.keyFindings || '');
  const [discussion, setDiscussion] = useState(initialData?.discussion || '');
  const [conclusion, setConclusion] = useState(initialData?.conclusion || '');
  const [recommendations, setRecommendations] = useState(initialData?.recommendations || '');
  const [futureResearch, setFutureResearch] = useState(initialData?.futureResearch || '');

  // Step 5 - Uploads (simulated files)
  const [uploadedPdf, setUploadedPdf] = useState(initialData?.uploads?.pdf || '');
  const [uploadedCoverImage, setUploadedCoverImage] = useState(initialData?.uploads?.coverImage || '');
  const [uploadedFigures, setUploadedFigures] = useState(initialData?.uploads?.figures || '');
  const [uploadedTables, setUploadedTables] = useState(initialData?.uploads?.tables || '');
  const [uploadedDatasets, setUploadedDatasets] = useState(initialData?.uploads?.datasets || '');
  const [uploadedSupplementary, setUploadedSupplementary] = useState(initialData?.uploads?.supplementary || '');

  // Step 6 - Tags
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);

  // Step 7 - Visibility
  const [visibility, setVisibility] = useState<'Public' | 'Registered Users' | 'Collaborators Only' | 'Private Draft'>(initialData?.visibility || 'Public');

  // Step 8 - License
  const [license, setLicense] = useState<'Copyright' | 'Creative Commons' | 'Open Access'>(initialData?.license || 'Open Access');
  const [isConfirmed, setIsConfirmed] = useState(initialData?.isConfirmed || false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    { name: 'Solar Energy', icon: Sun, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { name: 'Wind Energy', icon: Wind, color: 'text-sky-500 bg-sky-50 border-sky-200' },
    { name: 'Smart Grid', icon: Zap, color: 'text-yellow-500 bg-yellow-50 border-yellow-200' },
    { name: 'Hydropower', icon: Droplets, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { name: 'Bioenergy', icon: RefreshCw, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { name: 'Energy Storage', icon: Battery, color: 'text-purple-500 bg-purple-50 border-purple-200' },
    { name: 'Climate Change', icon: Globe, color: 'text-red-500 bg-red-50 border-red-200' },
    { name: 'Energy Policy', icon: Landmark, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' }
  ];

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(prev => prev.filter(t => t !== tagName));
    } else {
      setSelectedTags(prev => [...prev, tagName]);
    }
  };

  const handleAddCoAuthor = () => {
    if (!tempCoAuthorName.trim()) return;
    const newCo: CoAuthor = {
      name: tempCoAuthorName.trim(),
      institution: tempCoAuthorInstitution.trim() || undefined,
      department: tempCoAuthorDepartment.trim() || undefined,
      country: tempCoAuthorCountry.trim() || undefined,
      orcid: tempCoAuthorOrcid.trim() || undefined,
      scholar: tempCoAuthorScholar.trim() || undefined
    };
    setCoAuthors(prev => [...prev, newCo]);
    
    // Reset temp fields
    setTempCoAuthorName('');
    setTempCoAuthorInstitution('');
    setTempCoAuthorDepartment('');
    setTempCoAuthorCountry('');
    setTempCoAuthorOrcid('');
    setTempCoAuthorScholar('');
    setShowAddCoAuthorForm(false);
  };

  const handleRemoveCoAuthor = (index: number) => {
    setCoAuthors(prev => prev.filter((_, idx) => idx !== index));
  };

  // Simulated drag and drop / click file upload
  const handleSimulatedUpload = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      switch(fieldName) {
        case 'pdf': setUploadedPdf(fileName); break;
        case 'coverImage': setUploadedCoverImage(fileName); break;
        case 'figures': setUploadedFigures(fileName); break;
        case 'tables': setUploadedTables(fileName); break;
        case 'datasets': setUploadedDatasets(fileName); break;
        case 'supplementary': setUploadedSupplementary(fileName); break;
      }
    }
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!title.trim()) { setErrorMsg('Research Title is required.'); return; }
      if (!abstract.trim()) { setErrorMsg('Abstract Summary is required.'); return; }
    }
    if (currentStep === 2) {
      if (!leadResearcher.trim()) { setErrorMsg('Lead Researcher name is required.'); return; }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 8));
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = async () => {
    setErrorMsg(null);
    if (!isConfirmed) {
      setErrorMsg('You must confirm that this research is your original work.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedKeywords = keywords.split(',').map(k => k.trim()).filter(k => k !== '');
      const paperData: Omit<ResearchPaper, 'id'> = {
        title: title.trim(),
        author: leadResearcher.trim(),
        category,
        abstract: abstract.trim(),
        downloadUrl: uploadedPdf ? `#` : '#',
        publishedYear: new Date().getFullYear(),
        
        // Advanced metadata
        subtitle: subtitle.trim() || undefined,
        keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
        status,
        language: language.trim() || undefined,
        readingTime: readingTime.trim() || undefined,

        leadResearcher: leadResearcher.trim(),
        coAuthors: coAuthors.length > 0 ? coAuthors : undefined,
        institution: institution.trim() || undefined,
        department: department.trim() || undefined,
        country: country.trim() || undefined,
        orcid: orcid.trim() || undefined,
        googleScholar: googleScholar.trim() || undefined,

        problemStatement: problemStatement.trim() || undefined,
        objectives: objectives.trim() || undefined,
        researchQuestions: researchQuestions.trim() || undefined,
        researchMethodology: researchMethodology.trim() || undefined,
        materialsUsed: materialsUsed.trim() || undefined,
        dataCollectionMethod: dataCollectionMethod.trim() || undefined,
        studyArea: studyArea.trim() || undefined,
        durationOfResearch: durationOfResearch.trim() || undefined,

        keyFindings: keyFindings.trim() || undefined,
        discussion: discussion.trim() || undefined,
        conclusion: conclusion.trim() || undefined,
        recommendations: recommendations.trim() || undefined,
        futureResearch: futureResearch.trim() || undefined,

        uploads: {
          pdf: uploadedPdf || undefined,
          coverImage: uploadedCoverImage || undefined,
          figures: uploadedFigures || undefined,
          tables: uploadedTables || undefined,
          datasets: uploadedDatasets || undefined,
          supplementary: uploadedSupplementary || undefined
        },

        tags: selectedTags.length > 0 ? selectedTags : undefined,
        visibility,
        license,
        isConfirmed,

        doi: `10.5281/zenodo.${Math.floor(1000000 + Math.random() * 9000000)}`,
        viewsCount: 1,
        downloadsCount: 0,
        bookmarksCount: 0,
        versions: [
          {
            id: 'v1.0',
            version: '1.0',
            title: title.trim(),
            abstract: abstract.trim(),
            publishedYear: new Date().getFullYear(),
            date: new Date().toISOString(),
            notes: 'Original Publication',
            changes: ['Original Publication']
          }
        ],
        contributions: [],
        comments: []
      };

      await onSubmit(paperData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to publish research. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsInfo = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Authors' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Findings' },
    { num: 5, label: 'Uploads' },
    { num: 6, label: 'Tags' },
    { num: 7, label: 'Visibility' },
    { num: 8, label: 'License' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] md:h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header bar */}
        <div className="px-6 py-4.5 bg-slate-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-800 text-emerald-300 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base tracking-tight">Publish Scientific Research Study</h3>
              <p className="text-[10px] text-slate-400">Complete the 8-step peer-review wizard to upload your research</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Stepper bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[700px] gap-2 px-2">
            {stepsInfo.map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    currentStep === s.num 
                      ? 'bg-emerald-700 text-white shadow-md ring-4 ring-emerald-100'
                      : currentStep > s.num
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-white text-slate-400 border border-slate-200'
                  }`}>
                    {currentStep > s.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${
                    currentStep === s.num ? 'text-emerald-950 font-extrabold' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < stepsInfo.length - 1 && (
                  <div className={`flex-grow h-0.5 max-w-[40px] rounded ${
                    currentStep > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Core Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 text-left bg-slate-50/50">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3 text-sm font-semibold animate-in fade-in duration-200">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Step 1 — Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Research Title <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Biochemical Methanol Yield Tuning of High-Starch Market Residues"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Subtitle (Optional)</label>
                      <input 
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="e.g. A Feasibility Case Study in Lagos Mainland"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Abstract / Summary Summary <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={4}
                        required
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                        placeholder="Provide an executive summary detailing the methodology, biochemical limits, findings, and scalability guidelines..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Research Category <span className="text-red-500">*</span></label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ResearchPaper['category'])}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      >
                        <option value="Bioenergy Technology">Bioenergy Technology</option>
                        <option value="Waste-to-Energy">Waste-to-Energy</option>
                        <option value="Environmental Sustainability">Environmental Sustainability</option>
                        <option value="Climate & Energy Policy">Climate & Energy Policy</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Keywords (Comma Separated)</label>
                      <input 
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g. Anaerobic, Biomethane, Starch Waste, Lagos"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 md:col-span-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">Status</label>
                        <select 
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                        >
                          <option value="Ongoing">Ongoing</option>
                          <option value="Completed">Completed</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Published">Published</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">Language</label>
                        <input 
                          type="text"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          placeholder="English"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">Est. Reading Time</label>
                        <input 
                          type="text"
                          value={readingTime}
                          onChange={(e) => setReadingTime(e.target.value)}
                          placeholder="15 mins"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Authors */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Step 2 — Authors & Institution</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddCoAuthorForm(!showAddCoAuthorForm)}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Co-author
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Lead Researcher / Principal Author <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        required
                        value={leadResearcher}
                        onChange={(e) => setLeadResearcher(e.target.value)}
                        placeholder="e.g. Filani Olalekan Theophilus"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Institution / University</label>
                      <input 
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. University of Lagos"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Department</label>
                      <input 
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Chemical Engineering"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Country</label>
                      <input 
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. Nigeria"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">ORCID Identifier (Optional)</label>
                      <input 
                        type="text"
                        value={orcid}
                        onChange={(e) => setOrcid(e.target.value)}
                        placeholder="0000-0002-1825-0097"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Google Scholar Profile (Optional)</label>
                      <input 
                        type="text"
                        value={googleScholar}
                        onChange={(e) => setGoogleScholar(e.target.value)}
                        placeholder="https://scholar.google.com/citations?user=..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Dynamic Co-author adding subform */}
                  <AnimatePresence>
                    {showAddCoAuthorForm && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 bg-white rounded-2xl border border-emerald-100 space-y-4 shadow-sm overflow-hidden"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-emerald-600" />
                            Co-author Information
                          </h5>
                          <button
                            type="button"
                            onClick={() => setShowAddCoAuthorForm(false)}
                            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                            <input 
                              type="text"
                              value={tempCoAuthorName}
                              onChange={(e) => setTempCoAuthorName(e.target.value)}
                              placeholder="e.g. Dr. Amina Gwarzo"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Institution</label>
                            <input 
                              type="text"
                              value={tempCoAuthorInstitution}
                              onChange={(e) => setTempCoAuthorInstitution(e.target.value)}
                              placeholder="e.g. Bayero University Kano"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Department</label>
                            <input 
                              type="text"
                              value={tempCoAuthorDepartment}
                              onChange={(e) => setTempCoAuthorDepartment(e.target.value)}
                              placeholder="Mechanical Engineering"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Country</label>
                            <input 
                              type="text"
                              value={tempCoAuthorCountry}
                              onChange={(e) => setTempCoAuthorCountry(e.target.value)}
                              placeholder="Nigeria"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">ORCID</label>
                            <input 
                              type="text"
                              value={tempCoAuthorOrcid}
                              onChange={(e) => setTempCoAuthorOrcid(e.target.value)}
                              placeholder="0000-0001-..."
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Google Scholar</label>
                            <input 
                              type="text"
                              value={tempCoAuthorScholar}
                              onChange={(e) => setTempCoAuthorScholar(e.target.value)}
                              placeholder="Profile Link"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={handleAddCoAuthor}
                            disabled={!tempCoAuthorName.trim()}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all border-0 cursor-pointer"
                          >
                            Add to Author List
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* List of co-authors added */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Authors ({coAuthors.length + 1})</h5>
                    <div className="space-y-2.5">
                      {/* Lead Author */}
                      <div className="px-4 py-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-700 text-white text-[9px] font-extrabold uppercase rounded">Lead</span>
                            <span className="text-sm font-extrabold text-slate-900">{leadResearcher || '(Provide Lead Author above)'}</span>
                          </div>
                          {institution && <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{institution} • {department || 'General'}</p>}
                        </div>
                        <span className="text-xs font-mono text-slate-400 font-bold">{country || 'Global'}</span>
                      </div>

                      {/* Co Authors */}
                      {coAuthors.map((co, index) => (
                        <div key={index} className="px-4 py-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between group">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold uppercase rounded">Co-author</span>
                              <span className="text-sm font-extrabold text-slate-900">{co.name}</span>
                            </div>
                            {co.institution && <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{co.institution} • {co.department || 'General'}</p>}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-400 font-bold">{co.country || 'Global'}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoAuthor(index)}
                              className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded transition-colors cursor-pointer border-0 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Research Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Step 3 — Research Details & Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Problem Statement</label>
                      <textarea 
                        rows={3}
                        value={problemStatement}
                        onChange={(e) => setProblemStatement(e.target.value)}
                        placeholder="What environmental or waste management barrier does this study aim to solve? Describe current challenges..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Research Objectives</label>
                      <textarea 
                        rows={3}
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        placeholder="e.g. 1. Isolate mesophilic inoculum. 2. Measure organic loading rates..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Research Questions</label>
                      <textarea 
                        rows={3}
                        value={researchQuestions}
                        onChange={(e) => setResearchQuestions(e.target.value)}
                        placeholder="e.g. What is the optimal moisture percentage? How does co-digestion affect the volatile acid ratio?"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Detailed Research Methodology</label>
                      <textarea 
                        rows={4}
                        value={researchMethodology}
                        onChange={(e) => setResearchMethodology(e.target.value)}
                        placeholder="Detail the experimental design, anaerobic conditions, gas chromatography setup, or chemical modeling software used..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Materials & Reagents Used</label>
                      <input 
                        type="text"
                        value={materialsUsed}
                        onChange={(e) => setMaterialsUsed(e.target.value)}
                        placeholder="e.g. Iron-oxide mesh, gas chromatography tubes, mesophilic manure"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Data Collection Method</label>
                      <input 
                        type="text"
                        value={dataCollectionMethod}
                        onChange={(e) => setDataCollectionMethod(e.target.value)}
                        placeholder="e.g. Chromatographic sensors, digital volumetric displacement, surveys"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Study Area / Location Boundaries</label>
                      <input 
                        type="text"
                        value={studyArea}
                        onChange={(e) => setStudyArea(e.target.value)}
                        placeholder="e.g. Lagos Mainland, South-West Nigeria"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Duration of Research</label>
                      <input 
                        type="text"
                        value={durationOfResearch}
                        onChange={(e) => setDurationOfResearch(e.target.value)}
                        placeholder="e.g. 14 months (Jan 2023 - Mar 2024)"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Findings */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Step 4 — Research Findings & Discussion</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Key Empirical Findings</label>
                      <textarea 
                        rows={3}
                        value={keyFindings}
                        onChange={(e) => setKeyFindings(e.target.value)}
                        placeholder="List the primary results. e.g. 1. Biomethane concentration peaked at 62.4%. 2. Average COD reduction of 72% was achieved..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Academic Discussion</label>
                      <textarea 
                        rows={3}
                        value={discussion}
                        onChange={(e) => setDiscussion(e.target.value)}
                        placeholder="Interpret results, compare with other peer-reviewed studies, and list any operational boundaries..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Conclusion</label>
                      <textarea 
                        rows={3}
                        value={conclusion}
                        onChange={(e) => setConclusion(e.target.value)}
                        placeholder="Summarize the core takeaways and scientific value added by the study..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Recommendations & Scalability Guidelines</label>
                      <textarea 
                        rows={3}
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        placeholder="e.g. Pre-dry feedstocks below 30% moisture; install iron-oxide inline scrubbers..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Future Research Opportunities</label>
                      <textarea 
                        rows={3}
                        value={futureResearch}
                        onChange={(e) => setFutureResearch(e.target.value)}
                        placeholder="Suggest topics or variables that require further chemical auditing or testing..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Upload */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Step 5 — Upload Files</h4>
                    <p className="text-xs text-slate-500 mt-1">Provide or upload supporting documents. You can upload files or paste document links.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Research PDF */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Research PDF <span className="text-red-500">*</span>
                          </label>
                          {uploadedPdf && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Selected</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">The primary peer-reviewed scientific report containing entire studies.</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="flex-grow flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-400" />
                          {uploadedPdf ? uploadedPdf : 'Select / Drag PDF'}
                          <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleSimulatedUpload('pdf', e)} />
                        </label>
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Cover Image
                          </label>
                          {uploadedCoverImage && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Selected</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">A preview cover photo for catalog layouts (jpg, png).</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="flex-grow flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-400" />
                          {uploadedCoverImage ? uploadedCoverImage : 'Select Cover Image'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSimulatedUpload('coverImage', e)} />
                        </label>
                      </div>
                    </div>

                    {/* Figures */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Figures & Charts
                          </label>
                          {uploadedFigures && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Selected</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Vector images or chemical reactor layouts.</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="flex-grow flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-400" />
                          {uploadedFigures ? uploadedFigures : 'Select Figure'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSimulatedUpload('figures', e)} />
                        </label>
                      </div>
                    </div>

                    {/* Tables */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Tables
                          </label>
                          {uploadedTables && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Selected</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Structured table data, yields, or stoichiometric data.</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="flex-grow flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-400" />
                          {uploadedTables ? uploadedTables : 'Select Tables'}
                          <input type="file" accept=".pdf,.csv,.xlsx" className="hidden" onChange={(e) => handleSimulatedUpload('tables', e)} />
                        </label>
                      </div>
                    </div>

                    {/* Datasets */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Datasets
                          </label>
                          {uploadedDatasets && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Selected</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Spreadsheets, CSV values, or telemetry log records.</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="flex-grow flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-400" />
                          {uploadedDatasets ? uploadedDatasets : 'Select Dataset'}
                          <input type="file" accept=".csv,.xlsx,.json" className="hidden" onChange={(e) => handleSimulatedUpload('datasets', e)} />
                        </label>
                      </div>
                    </div>

                    {/* Supplementary Files */}
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Supplementary Files
                          </label>
                          {uploadedSupplementary && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Selected</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Other files, blueprints, or chemical process diagrams.</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <label className="flex-grow flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold text-slate-700">
                          <Upload className="w-4 h-4 text-slate-400" />
                          {uploadedSupplementary ? uploadedSupplementary : 'Select Supplementary'}
                          <input type="file" accept="*" className="hidden" onChange={(e) => handleSimulatedUpload('supplementary', e)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Tags */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Step 6 — Select Research Tags</h4>
                    <p className="text-xs text-slate-500 mt-1">Associate your study with multiple energy frameworks for optimized scientific search index classification.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {availableTags.map((tag) => {
                      const IconComp = tag.icon;
                      const isSelected = selectedTags.includes(tag.name);
                      return (
                        <motion.button
                          key={tag.name}
                          type="button"
                          onClick={() => toggleTag(tag.name)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-950 text-emerald-100 border-emerald-900 shadow-md shadow-emerald-900/10'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`p-3 rounded-full ${isSelected ? 'bg-emerald-800 text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold tracking-tight">{tag.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {selectedTags.length > 0 && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-center gap-3 text-xs font-semibold">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Selected Classifications: {selectedTags.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 7: Visibility */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Step 7 — Privacy & Visibility Settings</h4>
                    <p className="text-xs text-slate-500 mt-1">Select who has reading access to your complete technical research files.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Public */}
                    <label className={`p-5 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                      visibility === 'Public' ? 'bg-emerald-50/50 border-emerald-600 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="visibility" 
                        value="Public" 
                        checked={visibility === 'Public'}
                        onChange={() => setVisibility('Public')}
                        className="mt-1 accent-emerald-600" 
                      />
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-emerald-600" />
                          Public
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Anyone visiting Bioenergy Nexus can search, read, and download full papers.</p>
                      </div>
                    </label>

                    {/* Registered Users */}
                    <label className={`p-5 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                      visibility === 'Registered Users' ? 'bg-emerald-50/50 border-emerald-600 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="visibility" 
                        value="Registered Users" 
                        checked={visibility === 'Registered Users'}
                        onChange={() => setVisibility('Registered Users')}
                        className="mt-1 accent-emerald-600" 
                      />
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-600" />
                          Registered Users
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Only users who have signed in can download or view full studies.</p>
                      </div>
                    </label>

                    {/* Collaborators Only */}
                    <label className={`p-5 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                      visibility === 'Collaborators Only' ? 'bg-emerald-50/50 border-emerald-600 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="visibility" 
                        value="Collaborators Only" 
                        checked={visibility === 'Collaborators Only'}
                        onChange={() => setVisibility('Collaborators Only')}
                        className="mt-1 accent-emerald-600" 
                      />
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-emerald-600" />
                          Collaborators Only
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Only explicitly designated project partners can access results.</p>
                      </div>
                    </label>

                    {/* Private Draft */}
                    <label className={`p-5 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                      visibility === 'Private Draft' ? 'bg-emerald-50/50 border-emerald-600 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="visibility" 
                        value="Private Draft" 
                        checked={visibility === 'Private Draft'}
                        onChange={() => setVisibility('Private Draft')}
                        className="mt-1 accent-emerald-600" 
                      />
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-slate-500" />
                          Private Draft
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Only you (the author) can see or manage this paper in your dashboard.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 8: License */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Step 8 — License & Confirmation</h4>
                    <p className="text-xs text-slate-500 mt-1">Specify scientific distribution standards and finalize the upload workflow.</p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">License Agreement</label>
                      <select 
                        value={license}
                        onChange={(e) => setLicense(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none shadow-xs"
                      >
                        <option value="Open Access">Open Access (CC BY 4.0 - Attribution Required)</option>
                        <option value="Creative Commons">Creative Commons Non-Commercial (CC BY-NC 4.0)</option>
                        <option value="Copyright">All Rights Reserved (Full Copyright)</option>
                      </select>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      By selecting <strong>Open Access</strong>, you permit other scientists, researchers, and government departments to copy, share, and build upon your biogas calculations or frameworks with proper author citation.
                    </p>
                  </div>

                  {/* Scientific Integrity Agreement Checkbox */}
                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                        className="mt-1 accent-emerald-700 w-4.5 h-4.5"
                      />
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-emerald-950">Declaration of Academic Integrity <span className="text-red-500">*</span></span>
                        <p className="text-xs text-emerald-800 leading-relaxed font-sans">
                          "I confirm this research is my original work. I guarantee that all chemical process modeling, anaerobic loading rates, and spatial surveys comply with scientific research standards, and contain no plagiarized material."
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-1 px-4 py-2 bg-white disabled:bg-slate-100 hover:bg-slate-100 disabled:text-slate-300 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0"
            >
              Continue Wizard
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting || !isConfirmed || !title || !abstract}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-950 disabled:bg-slate-300 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer border-0"
              id="finalize_publish_btn"
            >
              {isSubmitting ? 'Publishing Research...' : 'Publish Research'}
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
