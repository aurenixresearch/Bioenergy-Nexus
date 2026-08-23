import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Upload, Plus, Trash2, Check, Sparkles, 
  Sun, Wind, Zap, Droplets, RefreshCw, Battery, Globe, Landmark, Eye, Lock, Users, ShieldAlert,
  FileText, Link2, Info, ArrowLeft, Save, FileEdit, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResearchPaper, CoAuthor } from '../types';
import { checkProfileCompleteness } from '../utils/profileValidation';
import { addCustomPaper, updateCustomPaper } from '../services/db';

interface PublishWizardProps {
  onClose: () => void;
  onSubmit: (paperData: Omit<ResearchPaper, 'id'>, draftPaperId?: string | null) => Promise<void> | void;
  initialData?: Partial<ResearchPaper>;
  userProfile?: any;
  onNavigateToProfile?: () => void;
}

export default function PublishWizard({ onClose, onSubmit, initialData, userProfile, onNavigateToProfile }: PublishWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialData?.draftStep || 1);
  const profileValidation = useMemo(() => checkProfileCompleteness(userProfile), [userProfile]);
  
  // Draft tracking state
  const [draftPaperId, setDraftPaperId] = useState<string | null>(initialData?.id || null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // State for all form fields
  // Step 1
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [category, setCategory] = useState<ResearchPaper['category']>(initialData?.category || 'Bioenergy Technology');
  const [keywords, setKeywords] = useState<string>(initialData?.keywords?.join(', ') || '');
  const [status, setStatus] = useState<'Ongoing' | 'Completed' | 'Under Review' | 'Published'>(
    initialData?.status === 'Draft' ? 'Published' : (initialData?.status || 'Published')
  );
  const [language, setLanguage] = useState(initialData?.language || 'English');
  const [readingTime, setReadingTime] = useState(initialData?.readingTime || '15 mins');

  // Step 2
  const [leadResearcher, setLeadResearcher] = useState(
    initialData?.leadResearcher || 
    initialData?.author || 
    userProfile?.fullName || 
    userProfile?.displayName || 
    userProfile?.username || 
    ''
  );
  const [coAuthors, setCoAuthors] = useState<CoAuthor[]>(initialData?.coAuthors || []);
  const [institution, setInstitution] = useState(
    initialData?.institution || 
    userProfile?.institution || 
    userProfile?.organizationName || 
    userProfile?.organization || 
    ''
  );
  const [department, setDepartment] = useState(
    initialData?.department || 
    userProfile?.department || 
    ''
  );
  const [country, setCountry] = useState(
    initialData?.country || 
    userProfile?.country || 
    userProfile?.location || 
    ''
  );
  const [orcid, setOrcid] = useState(
    initialData?.orcid || 
    userProfile?.orcid || 
    userProfile?.portfolioLinks?.orcid || 
    ''
  );
  const [googleScholar, setGoogleScholar] = useState(
    initialData?.googleScholar || 
    userProfile?.googleScholar || 
    userProfile?.portfolioLinks?.googleScholar || 
    ''
  );

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
  const [uploadedCoverImageName, setUploadedCoverImageName] = useState(initialData?.uploads?.coverImage ? 'Cover Image Uploaded' : '');
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

  // Dynamic progress calculation based on filled fields
  const progressPercentage = useMemo(() => {
    const fields = [
      Boolean(title.trim()),
      Boolean(subtitle.trim()),
      Boolean(abstract.trim()),
      Boolean(keywords.trim()),
      Boolean(leadResearcher.trim()),
      Boolean(institution.trim()),
      Boolean(department.trim()),
      Boolean(country.trim()),
      Boolean(orcid.trim()),
      Boolean(googleScholar.trim()),
      coAuthors.length > 0,
      Boolean(problemStatement.trim()),
      Boolean(objectives.trim()),
      Boolean(researchQuestions.trim()),
      Boolean(researchMethodology.trim()),
      Boolean(materialsUsed.trim()),
      Boolean(dataCollectionMethod.trim()),
      Boolean(studyArea.trim()),
      Boolean(durationOfResearch.trim()),
      Boolean(keyFindings.trim()),
      Boolean(discussion.trim()),
      Boolean(conclusion.trim()),
      Boolean(recommendations.trim()),
      Boolean(futureResearch.trim()),
      Boolean(uploadedPdf),
      Boolean(uploadedCoverImage),
      Boolean(uploadedFigures),
      Boolean(uploadedTables),
      Boolean(uploadedDatasets),
      Boolean(uploadedSupplementary),
      selectedTags.length > 0,
      Boolean(isConfirmed),
    ];

    const filledCount = fields.filter(Boolean).length;
    if (filledCount === 0) return 0;
    return Math.min(100, Math.round((filledCount / fields.length) * 100));
  }, [
    title, subtitle, abstract, keywords, leadResearcher, institution, department,
    country, orcid, googleScholar, coAuthors, problemStatement, objectives,
    researchQuestions, researchMethodology, materialsUsed, dataCollectionMethod,
    studyArea, durationOfResearch, keyFindings, discussion, conclusion,
    recommendations, futureResearch, uploadedPdf, uploadedCoverImage, uploadedFigures,
    uploadedTables, uploadedDatasets, uploadedSupplementary, selectedTags, isConfirmed
  ]);

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
    if (!tempCoAuthorName.trim() || coAuthors.length >= 9) return;
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
      const file = e.target.files[0];
      const fileName = file.name;

      if (fieldName === 'coverImage') {
        setUploadedCoverImageName(fileName);
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setUploadedCoverImage(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        } else {
          setUploadedCoverImage(fileName);
        }
      } else {
        switch(fieldName) {
          case 'pdf': setUploadedPdf(fileName); break;
          case 'figures': setUploadedFigures(fileName); break;
          case 'tables': setUploadedTables(fileName); break;
          case 'datasets': setUploadedDatasets(fileName); break;
          case 'supplementary': setUploadedSupplementary(fileName); break;
        }
      }
    }
  };

  // Determine if user has entered sufficient draft data to persist
  const isDraftContentPresent = Boolean(
    title.trim() || 
    abstract.trim() || 
    leadResearcher.trim() || 
    problemStatement.trim() || 
    keyFindings.trim() || 
    uploadedPdf || 
    uploadedCoverImage || 
    (keywords && keywords.trim())
  );

  const saveDraft = async (silent: boolean = false) => {
    if (!isDraftContentPresent) return null;
    setIsDraftSaving(true);
    try {
      const parsedKeywords = keywords.split(',').map(k => k.trim()).filter(k => k !== '');
      const draftData: any = {
        title: title.trim() || 'Untitled Draft Research',
        author: leadResearcher.trim() || userProfile?.fullName || 'Anonymous Researcher',
        category: category || 'Bioenergy Technology',
        abstract: abstract.trim() || 'Draft research study pending completion.',
        downloadUrl: uploadedPdf ? `#` : '#',
        publishedYear: new Date().getFullYear(),
        
        subtitle: subtitle.trim() || undefined,
        keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
        status: 'Draft',
        language: language.trim() || undefined,
        readingTime: readingTime.trim() || undefined,

        leadResearcher: leadResearcher.trim() || undefined,
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
        visibility: 'Private Draft',
        license,
        isConfirmed,
        isDraft: true,
        draftStep: currentStep,
        updatedAt: new Date().toISOString(),

        doi: initialData?.doi || `10.5281/zenodo.${Math.floor(1000000 + Math.random() * 9000000)}`,
        viewsCount: initialData?.viewsCount ?? 0,
        downloadsCount: initialData?.downloadsCount ?? 0,
        bookmarksCount: initialData?.bookmarksCount ?? 0,
        versions: initialData?.versions || [
          {
            id: 'v1.0',
            version: '1.0',
            title: title.trim() || 'Untitled Draft Research',
            abstract: abstract.trim() || 'Draft research study pending completion.',
            publishedYear: new Date().getFullYear(),
            date: new Date().toISOString(),
            notes: 'Draft Version',
            changes: ['Draft Version']
          }
        ],
        contributions: initialData?.contributions || [],
        comments: initialData?.comments || []
      };

      if (draftPaperId) {
        await updateCustomPaper(draftPaperId, draftData);
      } else {
        const userId = userProfile?.uid || 'current_user';
        const userEmail = userProfile?.email || '';
        const newId = await addCustomPaper(draftData, userId, userEmail);
        if (newId) {
          setDraftPaperId(newId);
        }
      }

      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (!silent) {
        setErrorMsg(null);
      }
    } catch (err) {
      console.error('Error auto-saving draft:', err);
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Debounced auto-save effect whenever form fields or step change
  useEffect(() => {
    if (!isDraftContentPresent) return;
    const timer = setTimeout(() => {
      saveDraft(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    title, subtitle, abstract, category, keywords, leadResearcher, coAuthors,
    institution, department, country, orcid, googleScholar, problemStatement,
    objectives, researchQuestions, researchMethodology, materialsUsed,
    dataCollectionMethod, studyArea, durationOfResearch, keyFindings, discussion,
    conclusion, recommendations, futureResearch, uploadedPdf, uploadedCoverImage,
    uploadedFigures, uploadedTables, uploadedDatasets, uploadedSupplementary,
    selectedTags, visibility, license, isConfirmed, currentStep
  ]);

  const handleCloseAndSaveDraft = async () => {
    if (isDraftContentPresent && !isSubmitting) {
      await saveDraft(true);
    }
    onClose();
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
    if (!profileValidation.isComplete && !leadResearcher.trim()) {
      setErrorMsg(`Profile Completion Required: You cannot upload research without completing your profile (Missing: ${profileValidation.missingFields.join(', ')}).`);
      return;
    }
    if (!isConfirmed) {
      setErrorMsg('You must confirm that this research is your original work.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedKeywords = keywords.split(',').map(k => k.trim()).filter(k => k !== '');
      const paperData: Omit<ResearchPaper, 'id'> & { isDraft?: boolean } = {
        title: title.trim(),
        author: leadResearcher.trim(),
        category,
        abstract: abstract.trim(),
        downloadUrl: uploadedPdf ? `#` : '#',
        publishedYear: new Date().getFullYear(),
        
        // Advanced metadata
        subtitle: subtitle.trim() || undefined,
        keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
        status: status === 'Draft' ? 'Published' : status,
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
        visibility: visibility === 'Private Draft' ? 'Public' : visibility,
        license,
        isConfirmed,
        isDraft: false,
        updatedAt: new Date().toISOString(),

        doi: initialData?.doi || `10.5281/zenodo.${Math.floor(1000000 + Math.random() * 9000000)}`,
        viewsCount: initialData?.viewsCount ?? 0,
        downloadsCount: initialData?.downloadsCount ?? 0,
        bookmarksCount: initialData?.bookmarksCount ?? 0,
        versions: initialData?.versions || [
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
        contributions: initialData?.contributions || [],
        comments: initialData?.comments || []
      };

      if (draftPaperId) {
        await updateCustomPaper(draftPaperId, paperData);
      }

      await onSubmit(paperData, draftPaperId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to publish research. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsInfo = [
    { num: 1, label: 'Basic Info', icon: FileText },
    { num: 2, label: 'Authors', icon: Users },
    { num: 3, label: 'Details', icon: Info },
    { num: 4, label: 'Findings', icon: Sparkles },
    { num: 5, label: 'Uploads', icon: Upload },
    { num: 6, label: 'Tags', icon: Zap },
    { num: 7, label: 'Visibility', icon: Lock },
    { num: 8, label: 'License', icon: Check }
  ];

  return (
    <div className="w-full text-left" id="publish_wizard_container">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl">
        
        {/* Header bar */}
        <div className="px-5 sm:px-8 py-5 text-slate-900 relative overflow-hidden shrink-0 border-b border-slate-200" style={{ backgroundColor: '#ffffff' }}>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold tracking-tight" style={{ color: '#000000', width: '235.656px', fontSize: '14px' }}>
                    Publish Scientific Research Study
                  </h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold rounded">
                    Step {currentStep} of 8
                  </span>
                  {isDraftSaving ? (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold rounded flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-600" /> Saving draft...
                    </span>
                  ) : lastSavedTime ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Draft auto-saved at {lastSavedTime}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#606060' }}>
                  Complete the peer-review wizard to register your research in the Aurenix index
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleCloseAndSaveDraft}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-600 hover:text-black shrink-0 flex items-center gap-1.5"
              title="Save Draft & Close Wizard"
            >
              <X className="w-5 h-5" style={{ color: '#000000' }} />
            </button>
          </div>

          {(initialData?.isDraft || initialData?.status === 'Draft' || initialData?.visibility === 'Private Draft') && (
            <div className="mt-3 px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs font-medium text-amber-900">
              <FileEdit className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Resuming Saved Draft:</strong> Continue updating any step below and click <em>Finalize & Publish Study</em> when ready.
              </span>
            </div>
          )}

          {/* Top Progress Track */}
          <div className="mt-4 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-300 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Wizard Progress Stepper bar */}
        <div className="px-4 sm:px-8 py-3.5 border-b border-slate-200 shrink-0 overflow-x-auto scrollbar-none" style={{ backgroundColor: '#ffffff' }}>
          <div className="flex items-center justify-between min-w-[720px] gap-2">
            {stepsInfo.map((s, index) => {
              const StepIcon = s.icon;
              const isActive = currentStep === s.num;
              const isDone = currentStep > s.num;

              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isDone || s.num <= currentStep) {
                        setCurrentStep(s.num);
                      }
                    }}
                    disabled={!isDone && s.num > currentStep}
                    className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${
                      isActive || isDone ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div 
                      className={`flex items-center justify-center text-xs font-mono font-extrabold transition-all ${
                        isActive 
                          ? 'bg-emerald-700 text-white shadow-md ring-4 ring-emerald-100 dark:ring-emerald-900/40'
                          : isDone
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                      style={{
                        borderRadius: '26px',
                        width: '42.0437px',
                        height: '28.9875px',
                      }}
                    >
                      {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <span className="whitespace-nowrap font-bold inline-block text-center" style={{ color: '#000000', width: '55px', fontSize: '11px' }}>
                      {s.label}
                    </span>
                  </button>
                  {index < stepsInfo.length - 1 && (
                    <div className={`flex-grow h-0.5 max-w-[32px] rounded-full ${
                      isDone ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Core Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 text-left" style={{ backgroundColor: '#ffffff' }}>
          {!profileValidation.isComplete && !leadResearcher.trim() && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <strong className="block text-sm font-extrabold text-amber-950 dark:text-amber-100">Author Profile Identification</strong>
                  <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                    Please provide your author name and affiliation details below to publish your research.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToProfile) onNavigateToProfile();
                  else window.location.hash = '#/profile';
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition cursor-pointer shadow-xs"
                id="wizard_complete_profile_btn"
              >
                View Profile
              </button>
            </div>
          )}

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
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color: '#000000' }}>
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Step 1 — Paper Metadata & Classification
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Provide essential titles, abstract, and category metadata for scientific indexing.</p>
                    </div>
                  </div>

                  <div className="w-full max-w-full rounded-2xl p-5 sm:p-8 space-y-5" style={{ backgroundColor: '#ececec', borderWidth: '1px', borderStyle: 'none' }}>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>
                          Research Title <span className="text-red-500" style={{ width: '42.5125px' }}>*</span>
                        </label>
                        <span className="text-[10px] font-mono" style={{ color: '#202020', width: '37.1187px' }}>REQUIRED</span>
                      </div>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Biochemical Methanol Yield Tuning of High-Starch Market Residues"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium outline-none transition-all"
                        style={{ backgroundColor: '#ffffff', color: '#0f172b' }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>Subtitle (Optional)</label>
                      <input 
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="e.g. A Feasibility Case Study in Lagos Mainland"
                        className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 text-sm font-medium outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>
                          Executive Abstract <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">{abstract.length} characters</span>
                      </div>
                      <textarea 
                        rows={4}
                        required
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                        placeholder="Provide an executive summary detailing the research objectives, methodology, anaerobic/biochemical limits, empirical results, and scalability guidelines..."
                        className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 text-sm font-medium outline-none resize-none transition-all leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>
                          Primary Research Category <span className="text-red-500">*</span>
                        </label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value as ResearchPaper['category'])}
                          className="w-full px-3.5 py-3 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 text-sm font-medium outline-none transition-all cursor-pointer"
                        >
                          <option value="Bioenergy Technology">Bioenergy Technology</option>
                          <option value="Waste-to-Energy">Waste-to-Energy</option>
                          <option value="Environmental Sustainability">Environmental Sustainability</option>
                          <option value="Climate & Energy Policy">Climate & Energy Policy</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>Keywords (Comma Separated)</label>
                        <input 
                          type="text"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          placeholder="e.g. Anaerobic, Biomethane, Starch Waste, Lagos"
                          className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 text-sm font-medium outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>Publication Status</label>
                        <select 
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="Ongoing">Ongoing Study</option>
                          <option value="Completed">Completed Study</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Published">Published Study</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>Language</label>
                        <input 
                          type="text"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          placeholder="English"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#000000' }}>Est. Reading Time</label>
                        <input 
                          type="text"
                          value={readingTime}
                          onChange={(e) => setReadingTime(e.target.value)}
                          placeholder="15 mins"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold outline-none"
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
                    {coAuthors.length < 9 ? (
                      <button
                        type="button"
                        onClick={() => setShowAddCoAuthorForm(!showAddCoAuthorForm)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Co-author ({coAuthors.length}/9)
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl">
                        Maximum 9 co-authors reached
                      </span>
                    )}
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
                        className="w-full px-4 py-3.5 sm:py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-base sm:text-sm outline-none shadow-xs"
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
                        className="p-5 sm:p-6 bg-white rounded-2xl border border-emerald-200 shadow-md space-y-4 overflow-hidden"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h5 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-emerald-600" />
                            Co-author Information ({coAuthors.length + 1}/10)
                          </h5>
                          <button
                            type="button"
                            onClick={() => setShowAddCoAuthorForm(false)}
                            className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 cursor-pointer border-0 bg-transparent font-medium"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
                            <input 
                              type="text"
                              value={tempCoAuthorName}
                              onChange={(e) => setTempCoAuthorName(e.target.value)}
                              placeholder="e.g. Dr. Amina Gwarzo"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-slate-800 outline-none shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Institution</label>
                            <input 
                              type="text"
                              value={tempCoAuthorInstitution}
                              onChange={(e) => setTempCoAuthorInstitution(e.target.value)}
                              placeholder="e.g. Bayero University Kano"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-slate-800 outline-none shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Department</label>
                            <input 
                              type="text"
                              value={tempCoAuthorDepartment}
                              onChange={(e) => setTempCoAuthorDepartment(e.target.value)}
                              placeholder="Mechanical Engineering"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-slate-800 outline-none shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Country</label>
                            <input 
                              type="text"
                              value={tempCoAuthorCountry}
                              onChange={(e) => setTempCoAuthorCountry(e.target.value)}
                              placeholder="Nigeria"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-slate-800 outline-none shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">ORCID</label>
                            <input 
                              type="text"
                              value={tempCoAuthorOrcid}
                              onChange={(e) => setTempCoAuthorOrcid(e.target.value)}
                              placeholder="0000-0001-..."
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-slate-800 outline-none shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Google Scholar</label>
                            <input 
                              type="text"
                              value={tempCoAuthorScholar}
                              onChange={(e) => setTempCoAuthorScholar(e.target.value)}
                              placeholder="Profile Link"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-slate-800 outline-none shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={handleAddCoAuthor}
                            disabled={!tempCoAuthorName.trim()}
                            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold transition-all border-0 cursor-pointer shadow-md"
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
                          {uploadedCoverImageName || (uploadedCoverImage ? 'Cover Image Selected' : 'Select Cover Image')}
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
                        <p className="text-[11px] text-slate-500 leading-relaxed">Anyone visiting Aurenix Research can search, read, and download full papers.</p>
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
                        <p className="text-xs text-emerald-800 leading-relaxed font-sans hidden lg:block">
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
        <div className="px-5 sm:px-8 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0" style={{ backgroundColor: '#ffffff' }}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-white dark:bg-slate-800 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:text-slate-300 dark:disabled:text-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-600" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleCloseAndSaveDraft}
              disabled={isDraftSaving}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              title="Save current progress as a draft and close"
            >
              <Save className="w-3.5 h-3.5 text-amber-600" />
              <span>Save Draft & Exit</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400">
            <span>Progress:</span>
            <span className="text-emerald-700 dark:text-emerald-400">{progressPercentage}%</span>
          </div>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer border-0"
            >
              <span>Continue Wizard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting || !isConfirmed || !title || !abstract}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-emerald-900/20 cursor-pointer border-0"
              id="finalize_publish_btn"
            >
              {isSubmitting ? 'Publishing Research...' : 'Finalize & Publish Study'}
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
