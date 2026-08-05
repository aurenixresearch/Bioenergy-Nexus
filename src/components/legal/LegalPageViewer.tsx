import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Cookie, 
  Users, 
  Scale, 
  FlaskConical, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Printer,
  Share2,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { PolicyDocumentData } from '../../data/defaultPolicies';

interface LegalPageViewerProps {
  policy: PolicyDocumentData;
  userAccepted?: boolean;
  acceptedAt?: string;
  onNavigateToPolicy: (policyId: string) => void;
  onOpenAdminModal?: () => void;
  isAdmin?: boolean;
}

const POLICY_ICONS: Record<string, React.ElementType> = {
  FileText,
  ShieldCheck,
  Cookie,
  Users,
  Scale,
  FlaskConical,
  AlertTriangle
};

export default function LegalPageViewer({
  policy,
  userAccepted = false,
  acceptedAt,
  onNavigateToPolicy,
  onOpenAdminModal,
  isAdmin = false
}: LegalPageViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTocId, setActiveTocId] = useState<string>('');

  const IconComponent = POLICY_ICONS[policy.iconName] || FileText;

  // Filtered sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return policy.sections;
    const q = searchQuery.toLowerCase();
    return policy.sections.filter(sec => 
      sec.title.toLowerCase().includes(q) || 
      sec.content.toLowerCase().includes(q)
    );
  }, [policy, searchQuery]);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setActiveTocId(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/legal/${policy.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-8">
      {/* Policy Hero Header */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 text-slate-900 shadow-sm">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                <IconComponent className="w-3.5 h-3.5" />
                Version {policy.version}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Effective: {policy.lastUpdated}
              </span>
              {userAccepted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Agreed & Verified
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-slate-900">
              {policy.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {policy.summary}
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#007c2e] hover:bg-[#006424] text-white border border-emerald-700 transition-all cursor-pointer shadow-xs"
              title="Copy link to this policy"
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4 text-white" />}
              <span>{copiedLink ? 'Copied' : 'Share URL'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#007c2e] hover:bg-[#006424] text-white border border-emerald-700 transition-all cursor-pointer shadow-xs"
              title="Print Policy"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Print</span>
            </button>

            {isAdmin && onOpenAdminModal && (
              <button
                onClick={onOpenAdminModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Admin Governance</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sticky Table of Contents (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            
            {/* Search Input within policy */}
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-100 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search in ${policy.title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#035b26] border border-emerald-700 text-white placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-200 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                Sections Index ({filteredSections.length})
              </h3>
              <nav className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                {filteredSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => handleSectionClick(e, section.id)}
                    className={`block px-3 py-2 rounded-xl text-xs transition-colors truncate ${
                      activeTocId === section.id
                        ? 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Verification Footer Pill */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Legally Binding Policy</span>
              </div>
              <p className="leading-snug">
                This document is maintained by Aurenix Legal & Compliance Committee.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Body Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Mobile Search Bar */}
          <div className="block lg:hidden relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${policy.title}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          {filteredSections.length === 0 ? (
            <div className="bg-transparent border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-600 font-medium">
                No sections found matching "{searchQuery}".
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <div className="p-0 divide-y divide-slate-100 space-y-6">
              {filteredSections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={`${index !== 0 ? 'pt-6' : ''} space-y-3 transition-colors scroll-mt-28`}
                >
                  <h2 className="text-base sm:text-lg font-display font-bold text-black flex items-center justify-between">
                    <span className="text-black">{section.title}</span>
                  </h2>
                  
                  <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                    {section.content}
                  </div>

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {section.subsections.map((sub, idx) => (
                        <div key={idx} className="p-3 rounded-xl space-y-1 bg-slate-50 border border-slate-100">
                          <h4 className="text-xs font-semibold text-slate-800 font-mono">
                            {sub.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {sub.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}

          {/* Policy Acknowledgement Card */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 text-emerald-950 space-y-3">
            <div className="flex items-center gap-2.5 font-display font-semibold text-emerald-900 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Platform Compliance Notice</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              By accessing Aurenix Research, creating an account, or interacting with our research repository, you confirm that your usage complies with this {policy.title} and our broader platform governance guidelines.
            </p>
            {acceptedAt && (
              <p className="text-[11px] font-mono text-emerald-800 pt-1">
                Your consent timestamp: {new Date(acceptedAt).toLocaleString()}
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
