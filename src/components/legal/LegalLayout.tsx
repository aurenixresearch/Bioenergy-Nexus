import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Cookie, 
  Users, 
  Scale, 
  FlaskConical, 
  AlertTriangle,
  Lock,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Search,
  Clock,
  HelpCircle,
  Mail,
  Send,
  MessageSquare,
  Check,
  Building2,
  MapPin,
  Linkedin,
  Instagram,
  BookOpen
} from 'lucide-react';
import LegalPageViewer from './LegalPageViewer';
import PolicyAdminView from './PolicyAdminView';
import { DEFAULT_POLICIES, PolicyDocumentData } from '../../data/defaultPolicies';
import { getPolicyDocuments, getUserPolicyAcceptances, PolicyAcceptanceRecord } from '../../services/policyService';

interface LegalLayoutProps {
  initialPolicyId?: string;
  onNavigateHome: () => void;
  currentUser?: any;
}

// Normalize policy aliases
const normalizePolicyId = (id?: string): string => {
  if (!id || id === 'hub') return 'hub';
  if (id === 'community') return 'community-guidelines';
  if (id === 'ethics') return 'research-ethics';
  if (id === 'copyright') return 'intellectual-property';
  return id;
};

const POLICY_ITEMS = [
  { id: 'terms', title: 'Terms and Conditions', icon: FileText, desc: 'Master governance agreement, eligibility, account responsibilities, and liabilities.', category: 'Governance', updated: 'August 1, 2026', version: '1.0' },
  { id: 'privacy', title: 'Privacy Policy', icon: ShieldCheck, desc: 'Data collection, Firebase storage, Google Analytics, user rights, and deletion requests.', category: 'Privacy & Data', updated: 'August 1, 2026', version: '1.0' },
  { id: 'cookies', title: 'Cookie Policy', icon: Cookie, desc: 'Essential, analytics, functional, and performance cookies management.', category: 'Privacy & Data', updated: 'August 1, 2026', version: '1.0' },
  { id: 'community-guidelines', title: 'Community Guidelines', icon: Users, desc: 'Academic integrity, harassment policy, spam prevention, and misconduct reporting.', category: 'Academic Standards', updated: 'August 1, 2026', version: '1.0' },
  { id: 'research-ethics', title: 'Research Ethics Policy', icon: FlaskConical, desc: 'Ethical research practices, AI disclosure rules, environmental standards, and conflicts of interest.', category: 'Academic Standards', updated: 'August 1, 2026', version: '1.0' },
  { id: 'intellectual-property', title: 'Intellectual Property Policy', icon: Scale, desc: 'Ownership rights, copyright policy, licensing grants, trademark rules, and DMCA notices.', category: 'Academic Standards', updated: 'August 1, 2026', version: '1.0' },
  { id: 'disclaimer', title: 'Disclaimer Notice', icon: AlertTriangle, desc: 'Scientific information accuracy, funding disclaimers, and advisory limits.', category: 'Governance', updated: 'August 1, 2026', version: '1.0' },
  { id: 'help', title: 'Help Center', icon: HelpCircle, desc: 'Frequently asked questions, scholar onboarding guides, and technical support.', category: 'Support & Help', updated: 'August 1, 2026', version: '1.0' },
  { id: 'contact', title: 'Legal & Support Contact', icon: Mail, desc: 'Official inquiry contact form, direct email channels, office locations, and SLAs.', category: 'Support & Help', updated: 'August 1, 2026', version: '1.0' },
];

const FAQS = [
  {
    category: 'Account & Verification',
    question: 'How do I complete scholar profile verification and ORCID linking?',
    answer: 'Navigate to Settings > Profile, enter your institutional ORCID iD or institutional email. Our academic review system cross-references public publication registries to verify your scholar badge within 12 hours.'
  },
  {
    category: 'Research Submissions',
    question: 'How are paper copyrights and IP ownership handled upon upload?',
    answer: 'Authors retain 100% of their copyright and intellectual property rights. By making a paper public, you grant Aurenix a non-exclusive license to index metadata and generate AI summaries to foster global discovery.'
  },
  {
    category: 'Blueprints & Workspaces',
    question: 'Are proprietary engineering blueprints kept confidential?',
    answer: 'Yes. Blueprint repositories in private workspace folders utilize end-to-end access controls and encrypted cloud storage. Only authorized consortium team members specified by project owners can inspect private files.'
  },
  {
    category: 'Grants & Alliances',
    question: 'How do institutional grant discovery and alliance matchings work?',
    answer: 'Verified funding organizations list open research challenges. Scholars submit joint proposals. Once accepted, pilot grant agreements are executed directly between participating institutions with Aurenix providing progress tracking.'
  },
  {
    category: 'Data Privacy & Deletion',
    question: 'How can I request export or complete deletion of my personal data?',
    answer: 'Under GDPR/NDPR guidelines, you can request full data export or account erasure by visiting Settings > Security or emailing privacy@aurenix-research.org. Deletion requests are fulfilled within 5 business days.'
  }
];

export default function LegalLayout({
  initialPolicyId = 'hub',
  onNavigateHome,
  currentUser
}: LegalLayoutProps) {
  const [activePolicyId, setActivePolicyId] = useState<string>(
    normalizePolicyId(initialPolicyId)
  );
  const [policies, setPolicies] = useState<Record<string, PolicyDocumentData>>(DEFAULT_POLICIES);
  const [userAcceptances, setUserAcceptances] = useState<PolicyAcceptanceRecord[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hub Page States
  const [hubSearchQuery, setHubSearchQuery] = useState('');
  const [hubCategoryFilter, setHubCategoryFilter] = useState('All');

  // Help Page States
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // Contact Page States
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Legal & Governance Query',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Check if current user is platform admin
  const isAdmin = currentUser && (
    currentUser.role === 'admin' || 
    currentUser.role === 'super_admin' || 
    currentUser.email === 'bola.adeyemi@aurenix-research.org' ||
    currentUser.email === 'adeyemibola2569@gmail.com'
  );

  useEffect(() => {
    loadPoliciesAndAcceptances();
  }, [currentUser]);

  useEffect(() => {
    setActivePolicyId(normalizePolicyId(initialPolicyId));
  }, [initialPolicyId]);

  const loadPoliciesAndAcceptances = async () => {
    setLoading(true);
    try {
      const pols = await getPolicyDocuments();
      setPolicies(pols);

      if (currentUser?.uid) {
        const acceptances = await getUserPolicyAcceptances(currentUser.uid);
        setUserAcceptances(acceptances);
      }
    } catch (err) {
      console.error('Error initializing legal layout data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPolicy = (policyId: string) => {
    const normalized = normalizePolicyId(policyId);
    setActivePolicyId(normalized);
    if (typeof window !== 'undefined') {
      const targetUrl = normalized === 'hub' ? '/legal' : `/legal/${normalized}`;
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({
        name: '',
        email: '',
        subject: 'Legal & Governance Query',
        message: ''
      });
    }, 4000);
  };

  // Filtered Cards for Legal Hub
  const filteredHubItems = useMemo(() => {
    return POLICY_ITEMS.filter(item => {
      const matchesCategory = hubCategoryFilter === 'All' || item.category === hubCategoryFilter;
      const q = hubSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) || 
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [hubCategoryFilter, hubSearchQuery]);

  const currentPolicy = useMemo(() => {
    const norm = normalizePolicyId(activePolicyId);
    const aliasMap: Record<string, string> = {
      'community-guidelines': 'community',
      'community': 'community-guidelines',
      'research-ethics': 'ethics',
      'ethics': 'research-ethics',
      'intellectual-property': 'copyright',
      'copyright': 'intellectual-property'
    };
    const alt = aliasMap[norm] || norm;
    return (
      policies[norm] ||
      policies[alt] ||
      DEFAULT_POLICIES[norm] ||
      DEFAULT_POLICIES[alt] ||
      DEFAULT_POLICIES.terms
    );
  }, [policies, activePolicyId]);

  const latestUserAcceptance = userAcceptances[0];
  const isAcceptedByUser = !!latestUserAcceptance;

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 py-6 sm:py-10 transition-colors duration-200">
      <div className="w-full max-w-[96%] sm:max-w-[94%] lg:max-w-[92%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb & Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Platform</span>
            </button>

            {activePolicyId !== 'hub' && (
              <button
                onClick={() => handleSelectPolicy('hub')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Legal Hub</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Aurenix Legal Center</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-emerald-600 font-semibold">
              {activePolicyId === 'hub' ? 'Overview Hub' : activePolicyId === 'help' ? 'Help Center' : activePolicyId === 'contact' ? 'Contact' : currentPolicy.title}
            </span>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: LEGAL CENTER HUB PAGE (/legal)
           ========================================================================= */}
        {activePolicyId === 'hub' && (
          <div className="space-y-10">
            
            {/* Hub Hero Header */}
            <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-slate-900 shadow-md">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 space-y-6 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Platform Governance v1.0
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Last Updated: August 1, 2026
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAdminModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-all cursor-pointer shadow-xs"
                    >
                      <Lock className="w-3 h-3 text-white" />
                      <span>Admin Portal</span>
                    </button>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-slate-900">
                    Legal Center
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 mt-2 leading-relaxed">
                    Policies, guidelines, and information governing the use of the Aurenix platform.
                  </p>
                </div>

                {/* Hub Live Search Bar */}
                <div className="relative max-w-xl">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search policies, terms, cookies, privacy rights, guidelines..."
                    value={hubSearchQuery}
                    onChange={(e) => setHubSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 text-sm rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
                  />
                  {hubSearchQuery && (
                    <button
                      onClick={() => setHubSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['All', 'Governance', 'Privacy & Data', 'Academic Standards', 'Support & Help'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setHubCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      hubCategoryFilter === cat
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono text-slate-500">
                Showing <span className="font-bold text-slate-800">{filteredHubItems.length}</span> documents
              </div>
            </div>

            {/* Policy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHubItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between space-y-6 relative overflow-hidden"
                  >
                    {/* Subtle decorative hover glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300" />

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-100/80 rounded-2xl group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:shadow-md group-hover:shadow-emerald-600/20 transition-all duration-300">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60">
                          v{item.version}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="inline-block text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-700">
                          {item.category}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 font-display group-hover:text-emerald-700 transition-colors tracking-tight">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.updated}
                      </span>

                      <button
                        onClick={() => handleSelectPolicy(item.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50/80 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer group-hover:shadow-xs group-hover:translate-x-0.5"
                      >
                        <span>Read policy</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hub Quick Footer Info banner */}
            <div className="p-6 bg-emerald-50/70 border border-emerald-200/80 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-700 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Need legal advice or institutional custom agreements?</div>
                  <div className="text-slate-600">Our legal governance board coordinates directly with African university research councils and consortium partners.</div>
                </div>
              </div>

              <button
                onClick={() => handleSelectPolicy('contact')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors shrink-0 shadow-xs"
              >
                Contact Legal Committee
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: POLICY DOCUMENT VIEWER & SPECIALIZED PAGES (/legal/*)
           ========================================================================= */}
        {activePolicyId !== 'hub' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Policy Navigation Sidebar */}
            <aside className="md:col-span-4 lg:col-span-3 space-y-4">
              
              {/* Mobile Horizontal Selector */}
              <div className="block md:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                <div className="flex items-center gap-2 w-max">
                  {POLICY_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePolicyId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectPolicy(item.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Vertical Menu */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-2 sticky top-24">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Legal Documents
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                    9 Covenants
                  </span>
                </div>

                <nav className="space-y-1 pt-1">
                  {POLICY_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePolicyId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectPolicy(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className={`p-2 rounded-xl transition-colors shrink-0 ${
                            isActive 
                              ? 'bg-emerald-700 text-white' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <span className={`block text-xs font-bold leading-tight truncate ${isActive ? 'text-white' : ''}`}>
                              {item.title}
                            </span>
                            <span className={`block text-[10px] font-sans truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? 'text-white translate-x-0.5' : 'text-slate-300'
                        }`} />
                      </button>
                    );
                  })}
                </nav>

                {isAdmin && (
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setShowAdminModal(true)}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700"
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Legal Governance Console</span>
                    </button>
                  </div>
                )}
              </div>

            </aside>

            {/* Policy Content Viewer */}
            <main className="md:col-span-8 lg:col-span-9 space-y-8">
              <LegalPageViewer
                policy={currentPolicy}
                userAccepted={isAcceptedByUser}
                acceptedAt={latestUserAcceptance?.acceptedAt}
                onNavigateToPolicy={handleSelectPolicy}
                onOpenAdminModal={() => setShowAdminModal(true)}
                isAdmin={isAdmin}
              />

              {/* Extra Interactive Modules for Help Center */}
              {activePolicyId === 'help' && (
                <div className="space-y-8 pt-4 border-t border-slate-200">
                  {/* FAQs Accordion Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                      <span>Frequently Asked Questions</span>
                    </h2>

                    <div className="space-y-3">
                      {FAQS.filter(f => !faqSearchQuery || f.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || f.answer.toLowerCase().includes(faqSearchQuery.toLowerCase())).map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-2xs hover:border-slate-300"
                          >
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                              className="w-full p-5 text-left font-bold text-sm text-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:text-emerald-700 transition-colors"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {faq.category}
                                </span>
                                {faq.question}
                              </span>
                              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
                            </button>

                            {isOpen && (
                              <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-sans">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Guides Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-2xs">
                      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-max border border-emerald-100">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">User & Scholar Guides</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Step-by-step walkthroughs covering account registration, ORCID verification, bookmarking papers, and joining research alliances.
                      </p>
                      <button
                        onClick={() => handleSelectPolicy('terms')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-2"
                      >
                        <span>Read Platform Terms</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-2xs">
                      <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl w-max border border-teal-100">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Bioenergy Research Guides</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Formatting guidelines for biomass feedstocks, gasification calculations, carbon offset metrics, and pilot plant documentation.
                      </p>
                      <button
                        onClick={() => handleSelectPolicy('research-ethics')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-2"
                      >
                        <span>Read Research Ethics Policy</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Interactive Modules for Contact Page */}
              {activePolicyId === 'contact' && (
                <div className="space-y-8 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Form Column */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 font-display">Submit an Official Inquiry</h2>
                        <p className="text-xs text-slate-500 mt-1">Our compliance board reviews and responds within 24 hours.</p>
                      </div>

                      {contactSubmitted ? (
                        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2 text-emerald-900 dark:text-emerald-200 animate-fadeIn">
                          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                            <CheckCircle2 className="w-5 h-5" /> Inquiry Successfully Logged
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Thank you. Your message has been routed to our Legal & Compliance Committee. Reference ticket code: <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">#AUR-LEG-{Math.floor(100000 + Math.random() * 900000)}</span>.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                              <input
                                type="text"
                                required
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-2xs"
                                placeholder={currentUser?.displayName || currentUser?.fullName || "Dr. Adeyemi Bola"}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                              <input
                                type="email"
                                required
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-2xs"
                                placeholder={currentUser?.email || "adeyemibola2569@gmail.com"}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Topic *</label>
                            <select
                              value={contactForm.subject}
                              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer"
                            >
                              <option value="Legal & Governance Query">Legal & Governance Query</option>
                              <option value="Privacy & Data Protection (GDPR/NDPR)">Privacy & Data Protection (GDPR/NDPR)</option>
                              <option value="DMCA & Copyright Takedown Request">DMCA & Copyright Takedown Request</option>
                              <option value="Research Misconduct Report">Research Misconduct Report</option>
                              <option value="Institutional Alliance Partnership">Institutional Alliance Partnership</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message *</label>
                            <textarea
                              required
                              rows={5}
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-2xs"
                              placeholder="Please describe your legal or compliance inquiry in detail..."
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            <span>Submit Inquiry</span>
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Sidebar Info Column */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Official Emails */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                          Direct Email Channels
                        </h3>

                        <div className="space-y-3 text-xs">
                          {[
                            { label: 'Legal & Governance', email: 'legal@aurenix-research.org' },
                            { label: 'Data Privacy Officer', email: 'privacy@aurenix-research.org' },
                            { label: 'Copyright Agent', email: 'copyright@aurenix-research.org' },
                            { label: 'General Assistance', email: 'contact@aurenix-research.org' },
                          ].map((m, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between gap-2 border border-slate-100">
                              <div>
                                <div className="font-bold text-slate-800">{m.label}</div>
                                <div className="text-[11px] text-emerald-700 font-mono font-medium">{m.email}</div>
                              </div>
                              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Headquarters & Response SLA */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-xs shadow-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span>Office Headquarters</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed">
                          Aurenix Research Foundation<br />
                          Bioenergy Innovation Hub, Victoria Island, Lagos, Nigeria<br />
                          Regional Science Offices: Nairobi, Kenya
                        </p>

                        <div className="pt-3 border-t border-slate-100 space-y-1">
                          <div className="font-bold text-slate-700">Official SLA Pledge:</div>
                          <div className="text-slate-500">Legal inquiries acknowledged within 24 hours. DMCA removal requests resolved within 5 business days.</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </main>

          </div>
        )}

      </div>

      {/* Admin Governance Modal */}
      {showAdminModal && (
        <PolicyAdminView onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  );
}
