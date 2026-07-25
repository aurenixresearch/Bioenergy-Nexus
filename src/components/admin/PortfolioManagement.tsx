import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Briefcase, 
  Award, 
  Building, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Archive, 
  Search, 
  Edit3, 
  Plus, 
  X, 
  TrendingUp, 
  Globe, 
  Calendar, 
  FileUp,
  Inbox,
  Bookmark
} from 'lucide-react';
import { AdminResearch, AdminProject, AdminAlliance, AdminOrganization, AdminChallenge } from './AdminMockData';

interface PortfolioManagementProps {
  currentTab: 'research' | 'projects' | 'alliances' | 'organizations' | 'challenges';
  research: AdminResearch[];
  projects: AdminProject[];
  alliances: AdminAlliance[];
  organizations: AdminOrganization[];
  challenges: AdminChallenge[];
  onUpdateResearch: (updated: AdminResearch[]) => void;
  onUpdateProjects: (updated: AdminProject[]) => void;
  onUpdateAlliances: (updated: AdminAlliance[]) => void;
  onUpdateOrganizations: (updated: AdminOrganization[]) => void;
  onUpdateChallenges: (updated: AdminChallenge[]) => void;
  theme: 'light' | 'dark';
}

export default function PortfolioManagement({
  currentTab,
  research,
  projects,
  alliances,
  organizations,
  challenges,
  onUpdateResearch,
  onUpdateProjects,
  onUpdateAlliances,
  onUpdateOrganizations,
  onUpdateChallenges,
  theme
}: PortfolioManagementProps) {
  // Search query & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Rejection feedback state
  const [rejectingPaperId, setRejectingPaperId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Detailed Modal/Drawer State
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [viewingFullResearch, setViewingFullResearch] = useState<AdminResearch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Full Research detail states
  const [modalTab, setModalTab] = useState<'overview' | 'citations' | 'edit'>('overview');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editCategory, setEditCategory] = useState<'Bioenergy Technology' | 'Waste-to-Energy' | 'Environmental Sustainability' | 'Climate & Energy Policy'>('Bioenergy Technology');
  const [editAbstract, setEditAbstract] = useState('');
  const [editViews, setEditViews] = useState(0);
  const [editDownloads, setEditDownloads] = useState(0);
  const [editCitations, setEditCitations] = useState(0);

  React.useEffect(() => {
    if (viewingFullResearch) {
      setEditTitle(viewingFullResearch.title);
      setEditAuthor(viewingFullResearch.author);
      setEditInstitution(viewingFullResearch.institution);
      setEditCategory(viewingFullResearch.category);
      setEditAbstract(viewingFullResearch.abstract || '');
      setEditViews(viewingFullResearch.views || 0);
      setEditDownloads(viewingFullResearch.downloads || 0);
      setEditCitations(viewingFullResearch.citations || 0);
      setModalTab('overview');
      setDownloadProgress(null);
      setCopiedFormat(null);
      setSaveSuccess(false);
    }
  }, [viewingFullResearch]);

  // New item draft templates
  const [challengeDraft, setChallengeDraft] = useState<Partial<AdminChallenge>>({
    title: '', description: '', funding: '', timeline: '', expectedDeliverables: '', deadline: '', supportingOrganization: '', researchArea: '', status: 'Active'
  });

  // Action methods: RESEARCH
  const handleApproveResearch = (id: string) => {
    const updated = research.map(r => r.id === id ? { ...r, status: 'Approved' as const } : r);
    onUpdateResearch(updated);
  };

  const handleRejectResearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPaperId) return;
    const updated = research.map(r => r.id === rejectingPaperId ? { ...r, status: 'Rejected' as const, feedback: rejectionNotes } : r);
    onUpdateResearch(updated);
    setRejectingPaperId(null);
    setRejectionNotes('');
  };

  const handleFeatureResearch = (id: string) => {
    const updated = research.map(r => r.id === id ? { ...r, featured: !r.featured } : r);
    onUpdateResearch(updated);
  };

  const handleDeleteResearch = (id: string) => {
    if (window.confirm('Are you sure you want to remove this research paper from the repository?')) {
      onUpdateResearch(research.filter(r => r.id !== id));
    }
  };

  const handleSaveFullResearchEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingFullResearch) return;
    const updatedPaper: AdminResearch = {
      ...viewingFullResearch,
      title: editTitle,
      author: editAuthor,
      institution: editInstitution,
      category: editCategory,
      abstract: editAbstract,
      views: Number(editViews),
      downloads: Number(editDownloads),
      citations: Number(editCitations),
    };
    const updated = research.map(r => r.id === viewingFullResearch.id ? updatedPaper : r);
    onUpdateResearch(updated);
    setViewingFullResearch(updatedPaper);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const triggerResearchDownloadFile = (paper: AdminResearch) => {
    const fileContent = `========================================================================
AURENIX SUSTAINABLE ECOSYSTEM RESEARCH REPOSITORY
========================================================================

DOCUMENT ID:       ${paper.id}
DOCUMENT TITLE:    ${paper.title}
PRIMARY AUTHOR:    ${paper.author}
INSTITUTION:       ${paper.institution}
TOPIC STREAM:      ${paper.category}
PUBLICATION DATE:  ${paper.date}
DOI REFERENCE:     10.1016/j.aurenix.${paper.id}
STATUS:            ${paper.status}
ENGAGEMENT METRICS: Views: ${paper.views || 0} | Downloads: ${(paper.downloads || 0) + 1} | Citations: ${paper.citations || 0}

========================================================================
RESEARCH ABSTRACT
========================================================================
${paper.abstract || 'No detailed publication abstract available.'}

========================================================================
ACADEMIC CITATIONS & BIBLIOGRAPHY
========================================================================
[APA]
${paper.author}. (${paper.date.split('-')[0] || '2026'}). ${paper.title}. Aurenix Research Journal, 14(2), 112-125.

[MLA]
${paper.author}. "${paper.title}." Aurenix Research Journal, vol. 14, no. 2, 2026, pp. 112-125.

[BibTeX]
@article{aurenix_${paper.id},
  author = {${paper.author}},
  title = {${paper.title}},
  journal = {Aurenix Research Journal},
  year = {2026},
  volume = {14},
  pages = {112-125}
}

========================================================================
END OF DOCUMENT
Generated by Aurenix Platform Super Admin Node
========================================================================`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Aurenix_Research_${paper.id}_${(paper.title || '').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSimulatedDownload = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        // Increment download count in research database
        if (viewingFullResearch) {
          const updatedPaper: AdminResearch = {
            ...viewingFullResearch,
            downloads: viewingFullResearch.downloads + 1,
          };
          const updated = research.map(r => r.id === viewingFullResearch.id ? updatedPaper : r);
          onUpdateResearch(updated);
          setViewingFullResearch(updatedPaper);
          triggerResearchDownloadFile(updatedPaper);
        }
        setTimeout(() => setDownloadProgress(null), 1500);
      } else {
        setDownloadProgress(progress);
      }
    }, 80);
  };

  // Action methods: PROJECTS
  const handleFeatureProject = (id: string) => {
    const updated = projects.map(p => p.id === id ? { ...p, featured: !p.featured } : p);
    onUpdateProjects(updated);
  };

  const handleUpdateTRL = (id: string, nextTrl: number) => {
    const updated = projects.map(p => p.id === id ? { ...p, trl: Math.min(Math.max(nextTrl, 1), 9) } : p);
    onUpdateProjects(updated);
  };

  // Action methods: CHALLENGES
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const newChallenge: AdminChallenge = {
      id: `chal-${Date.now()}`,
      title: challengeDraft.title || 'Untitled Challenge',
      description: challengeDraft.description || '',
      funding: challengeDraft.funding || '$0',
      timeline: challengeDraft.timeline || 'TBD',
      expectedDeliverables: challengeDraft.expectedDeliverables || '',
      deadline: challengeDraft.deadline || '',
      supportingOrganization: challengeDraft.supportingOrganization || 'Aurenix Hub',
      researchArea: challengeDraft.researchArea || 'Bioenergy Technology',
      status: 'Active' as const,
      featured: false
    };
    onUpdateChallenges([...challenges, newChallenge]);
    setIsAddingNew(false);
    setChallengeDraft({ title: '', description: '', funding: '', timeline: '', expectedDeliverables: '', deadline: '', supportingOrganization: '', researchArea: '', status: 'Active' });
  };

  const handleToggleFeatureChallenge = (id: string) => {
    const updated = challenges.map(c => c.id === id ? { ...c, featured: !c.featured } : c);
    onUpdateChallenges(updated);
  };

  const handleDeleteChallenge = (id: string) => {
    if (window.confirm('Are you sure you want to delete this innovation challenge?')) {
      onUpdateChallenges(challenges.filter(c => c.id !== id));
    }
  };

  // Action methods: ORGANIZATIONS
  const handleToggleOrgVerification = (id: string) => {
    const updated = organizations.map(o => o.id === id ? { ...o, verified: !o.verified } : o);
    onUpdateOrganizations(updated);
  };

  const handleToggleOrgStatus = (id: string) => {
    const updated = organizations.map(o => o.id === id ? { ...o, status: o.status === 'active' ? 'suspended' as const : 'active' as const } : o);
    onUpdateOrganizations(updated);
  };

  // Render Filtering
  const getFilteredData = () => {
    const q = (searchQuery || '').toLowerCase().trim();
    switch (currentTab) {
      case 'research':
        return research.filter(r => {
          const matchesSearch = !q || (r.title || '').toLowerCase().includes(q) || (r.author || '').toLowerCase().includes(q) || (r.institution || '').toLowerCase().includes(q);
          const matchesCategory = !filterCategory || r.category === filterCategory;
          const matchesStatus = !filterStatus || r.status === filterStatus;
          return matchesSearch && matchesCategory && matchesStatus;
        });
      case 'projects':
        return projects.filter(p => {
          const matchesSearch = !q || (p.title || '').toLowerCase().includes(q) || (p.researcher || '').toLowerCase().includes(q) || (p.laboratory || '').toLowerCase().includes(q);
          const matchesStatus = !filterStatus || p.status === filterStatus;
          return matchesSearch && matchesStatus;
        });
      case 'alliances':
        return alliances.filter(a => {
          const matchesSearch = !q || (a.organization || '').toLowerCase().includes(q) || (a.opportunity || '').toLowerCase().includes(q);
          const matchesStatus = !filterStatus || a.status === filterStatus;
          return matchesSearch && matchesStatus;
        });
      case 'organizations':
        return organizations.filter(o => {
          const matchesSearch = !q || (o.name || '').toLowerCase().includes(q) || (o.country || '').toLowerCase().includes(q);
          const matchesCategory = !filterCategory || o.category === filterCategory;
          const matchesStatus = !filterStatus || o.status === filterStatus;
          return matchesSearch && matchesCategory && matchesStatus;
        });
      case 'challenges':
        return challenges.filter(c => {
          const matchesSearch = !q || (c.title || '').toLowerCase().includes(q) || (c.supportingOrganization || '').toLowerCase().includes(q);
          const matchesCategory = !filterCategory || c.researchArea === filterCategory;
          return matchesSearch && matchesCategory;
        });
      default:
        return [];
    }
  };


  if (viewingItem) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left" id="admin_reviewer_view">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase block">{viewingItem.category}</span>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-display mt-1">{viewingItem.title}</h3>
          </div>
          <button onClick={() => setViewingItem(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition border-0">
            &larr; Back to list
          </button>
        </div>

        <div className="space-y-4">
          <span className="block text-[11px] font-mono text-slate-400">
            Author Affiliation: <span className="text-slate-700 dark:text-slate-300 font-bold">{viewingItem.author} • {viewingItem.institution}</span>
          </span>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Research Abstract</label>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed rounded-2xl min-h-[16rem] overflow-y-auto">
              {viewingItem.abstract}
            </div>
          </div>

          {viewingItem.feedback && (
            <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 text-xs font-medium">
              <span className="block font-mono font-bold uppercase text-[9px] tracking-wider mb-1">Previous Rejection Notes:</span>
              {viewingItem.feedback}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          {viewingItem.status === 'Pending' && (
            <>
              <button
                onClick={() => {
                  handleApproveResearch(viewingItem.id);
                  setViewingItem(null);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0 transition"
              >
                Approve Paper
              </button>
              <button
                onClick={() => {
                  setRejectingPaperId(viewingItem.id);
                  setViewingItem(null);
                }}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl cursor-pointer border-0 transition"
              >
                Reject Submission
              </button>
            </>
          )}
          <button
            onClick={() => setViewingItem(null)}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition border-0"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  if (viewingFullResearch) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left" id="admin_full_research_view">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-md">
                {viewingFullResearch.category}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-md font-bold ${
                viewingFullResearch.status === 'Approved' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                  : viewingFullResearch.status === 'Pending' 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
              }`}>
                {viewingFullResearch.status}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-2 font-display leading-snug">
              {viewingFullResearch.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              By <span className="font-bold text-slate-700 dark:text-slate-300">{viewingFullResearch.author}</span> • {viewingFullResearch.institution}
            </p>
          </div>
          <button onClick={() => setViewingFullResearch(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition border-0">
            &larr; Back to list
          </button>
        </div>

        {/* Performance Stats Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-1">
            <span className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider">Views</span>
            <span className="block text-base font-black font-mono text-slate-800 dark:text-slate-100">{viewingFullResearch.views}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-1">
            <span className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider">Downloads</span>
            <span className="block text-base font-black font-mono text-slate-800 dark:text-slate-100">{viewingFullResearch.downloads}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-1">
            <span className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider">Citations</span>
            <span className="block text-base font-black font-mono text-slate-800 dark:text-slate-100">{viewingFullResearch.citations}</span>
          </div>
        </div>

        {/* Tab Swapper */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setModalTab('overview')}
            className={`py-2 px-4 font-bold border-b-2 cursor-pointer transition-all ${
              modalTab === 'overview' 
                ? 'border-emerald-600 text-slate-950 dark:text-slate-50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Overview & Abstract
          </button>
          <button
            onClick={() => setModalTab('citations')}
            className={`py-2 px-4 font-bold border-b-2 cursor-pointer transition-all ${
              modalTab === 'citations' 
                ? 'border-emerald-600 text-slate-950 dark:text-slate-50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Citations & Bibliography
          </button>
          <button
            onClick={() => setModalTab('edit')}
            className={`py-2 px-4 font-bold border-b-2 cursor-pointer transition-all ${
              modalTab === 'edit' 
                ? 'border-emerald-600 text-slate-950 dark:text-slate-50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Edit Metadata
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-4 min-h-48">
          {modalTab === 'overview' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">Research Abstract</h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed rounded-2xl min-h-[12rem] overflow-y-auto">
                  {viewingFullResearch.abstract || 'No detailed publication abstract available.'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400 font-mono">
                <div>Original Publish Date: <span className="font-bold text-slate-700 dark:text-slate-300">{viewingFullResearch.date}</span></div>
                <div>Digital Object Identifier: <span className="font-bold text-slate-700 dark:text-slate-300">10.1016/j.aurenix.{viewingFullResearch.id}</span></div>
              </div>
            </div>
          )}

          {modalTab === 'citations' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400">
                Standardized reference formats for academic work.
              </p>
              <div className="space-y-3">
                {/* APA Citation */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold uppercase">
                    <span>APA Format</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${viewingFullResearch.author}. (${viewingFullResearch.date.split('-')[0] || '2026'}). ${viewingFullResearch.title}. Aurenix Research Journal, 14(2), 112-125.`);
                        setCopiedFormat('APA');
                        setTimeout(() => setCopiedFormat(null), 2000);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition-colors border-0 bg-transparent"
                    >
                      {copiedFormat === 'APA' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    {viewingFullResearch.author}. ({viewingFullResearch.date.split('-')[0] || '2026'}). {viewingFullResearch.title}. <span className="underline">Aurenix Research Journal</span>, 14(2), 112-125.
                  </p>
                </div>

                {/* MLA Citation */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold uppercase">
                    <span>MLA Format</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${viewingFullResearch.author}. "${viewingFullResearch.title}." Aurenix Research Journal, vol. 14, no. 2, 2026, pp. 112-125.`);
                        setCopiedFormat('MLA');
                        setTimeout(() => setCopiedFormat(null), 2000);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition-colors border-0 bg-transparent"
                    >
                      {copiedFormat === 'MLA' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {viewingFullResearch.author}. "{viewingFullResearch.title}." <span className="italic">Aurenix Research Journal</span>, vol. 14, no. 2, 2026, pp. 112-125.
                  </p>
                </div>

                {/* BibTeX */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold uppercase">
                    <span>BibTeX format</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`@article{aurenix_${viewingFullResearch.id},\n  author = {${viewingFullResearch.author}},\n  title = {${viewingFullResearch.title}},\n  journal = {Aurenix Research Journal},\n  year = {2026},\n  volume = {14},\n  pages = {112-125}\n}`);
                        setCopiedFormat('BibTeX');
                        setTimeout(() => setCopiedFormat(null), 2000);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition-colors border-0 bg-transparent"
                    >
                      {copiedFormat === 'BibTeX' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100/50 dark:bg-slate-900 p-2 rounded-lg overflow-x-auto whitespace-pre leading-normal">
{`@article{aurenix_${viewingFullResearch.id},
  author = {${viewingFullResearch.author}},
  title = {${viewingFullResearch.title}},
  journal = {Aurenix Research Journal},
  year = {2026},
  volume = {14},
  pages = {112-125}
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {modalTab === 'edit' && (
            <form onSubmit={handleSaveFullResearchEdit} className="space-y-3.5">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Publication details saved and updated successfully across nodes.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Research Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Author Name</label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Institution Affiliation</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Topic Stream Category</label>
                  <select
                    value={editCategory}
                    onChange={(e: any) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  >
                    <option value="Bioenergy Technology">Bioenergy Technology</option>
                    <option value="Waste-to-Energy">Waste-to-Energy</option>
                    <option value="Environmental Sustainability">Environmental Sustainability</option>
                    <option value="Climate & Energy Policy">Climate & Energy Policy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Views Count</label>
                  <input
                    type="number"
                    value={editViews}
                    onChange={(e) => setEditViews(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Downloads Count</label>
                  <input
                    type="number"
                    value={editDownloads}
                    onChange={(e) => setEditDownloads(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Citations Count</label>
                  <input
                    type="number"
                    value={editCitations}
                    onChange={(e) => setEditCitations(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Abstract Text</label>
                <textarea
                  value={editAbstract}
                  onChange={(e) => setEditAbstract(e.target.value)}
                  className="w-full h-24 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTab('overview')}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl cursor-pointer border-0 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition duration-150 border-0"
                >
                  Save Document Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer with simulation download & state transitions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3">
          {/* Simulated Download Progress bar */}
          <div className="flex-grow max-w-xs">
            {downloadProgress !== null ? (
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <span>{downloadProgress === 100 ? 'Download complete!' : 'Securing local copy...'}</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-100"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSimulatedDownload}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all duration-200 shadow-xs border-0"
                title="Simulate paper publication download"
              >
                <FileUp className="w-4 h-4 rotate-180" />
                Download Full PDF publication
              </button>
            )}
          </div>

          {/* Status Action list */}
          <div className="flex items-center gap-2">
            {viewingFullResearch.status === 'Pending' && (
              <>
                <button
                  onClick={() => {
                    handleApproveResearch(viewingFullResearch.id);
                    setViewingFullResearch(prev => prev ? { ...prev, status: 'Approved' } : null);
                  }}
                  className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 text-xs font-bold rounded-xl cursor-pointer transition-colors duration-200 border-0"
                >
                  Approve publication
                </button>
                <button
                  onClick={() => {
                    setRejectingPaperId(viewingFullResearch.id);
                    setViewingFullResearch(null);
                  }}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 text-xs font-bold rounded-xl cursor-pointer transition-colors duration-200 border-0"
                >
                  Reject Submission
                </button>
              </>
            )}
            <button
              onClick={() => setViewingFullResearch(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors duration-200 border-0"
            >
              Back to list
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredData();

  return (
    <div className="space-y-6" id={`portfolio_mgmt_${currentTab}`}>
      {/* Search & Tabs Filtering Row */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={`Search ${currentTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Specific Filters depending on Tab */}
          {currentTab === 'research' && (
            <>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Waste-to-Energy">Waste-to-Energy</option>
                <option value="Bioenergy Technology">Bioenergy Technology</option>
                <option value="Climate & Energy Policy">Climate & Energy Policy</option>
                <option value="Environmental Sustainability">Environmental Sustainability</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Archived">Archived</option>
              </select>
            </>
          )}

          {currentTab === 'organizations' && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Universities">Universities</option>
              <option value="Industries">Industries</option>
              <option value="Government">Government Agencies</option>
              <option value="NGOs">NGOs</option>
              <option value="Investors">Investors</option>
            </select>
          )}

          {currentTab === 'challenges' && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Launch Challenge
            </button>
          )}
        </div>
      </div>

      {/* Grid rendering by tab type */}
      {currentTab === 'research' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="research_repo_grid">
          {filteredItems.map((r: any) => (
            <motion.div
              key={r.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-40 bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                <FileText className="w-12 h-12 text-emerald-600/40" />
                <span className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] font-mono uppercase rounded-md font-bold ${
                  r.status === 'Approved' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
                    : r.status === 'Pending' 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                }`}>
                  {r.status}
                </span>

                {r.featured && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-mono uppercase shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                    Featured
                  </span>
                )}
              </div>

              <div className="p-5 flex-grow space-y-3">
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold uppercase tracking-wider">
                  {r.category}
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                  {r.title}
                </h4>
                <div className="text-[11px] text-slate-400 font-mono">
                  <span>Author: {r.author}</span>
                  <span className="block mt-0.5">{r.institution}</span>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingItem(r)}
                    className="px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg cursor-pointer flex items-center gap-1 transition-colors duration-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review Abstract
                  </button>
                  <button
                    onClick={() => setViewingFullResearch(r)}
                    className="px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all duration-200 border border-emerald-100/30 dark:border-emerald-900/30"
                    title="View Comprehensive Publication Details"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    Full Research
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {r.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApproveResearch(r.id)}
                        className="p-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg cursor-pointer"
                        title="Approve & Publish to Repository"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRejectingPaperId(r.id)}
                        className="p-1.5 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-400 rounded-lg cursor-pointer"
                        title="Reject submission"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleFeatureResearch(r.id)}
                    className={`p-1.5 rounded-lg cursor-pointer ${r.featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}
                    title="Feature research on landing"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteResearch(r.id)}
                    className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg cursor-pointer"
                    title="Delete paper"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {currentTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="projects_trl_grid">
          {filteredItems.map((p: any) => (
            <motion.div
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide">
                    TRL Level {p.trl}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-md ${
                    p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                    {p.description || 'No detailed description available for this innovation stream.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Project Progress</span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1 text-slate-400 font-mono">
                  <div>Researcher: <span className="text-slate-700 dark:text-slate-300 font-bold">{p.researcher}</span></div>
                  <div>Industry Partner: <span className="text-slate-600 dark:text-slate-400">{p.industryPartner || 'Unassigned'}</span></div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleUpdateTRL(p.id, p.trl - 1)}
                    className="p-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    title="Demote TRL level"
                  >
                    -
                  </button>
                  <span className="px-2 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">TRL</span>
                  <button 
                    onClick={() => handleUpdateTRL(p.id, p.trl + 1)}
                    className="p-1 border border-slate-200 dark:border-slate-700 rounded-md text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    title="Advance TRL level"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleFeatureProject(p.id)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer ${
                    p.featured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Feature
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {currentTab === 'organizations' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs" id="organizations_mgmt_table_wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">
                  <th className="p-4">Organization Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Website</th>
                  <th className="p-4 text-center">Projects Supported</th>
                  <th className="p-4 text-center">Verification Status</th>
                  <th className="p-4 text-center">Security Status</th>
                  <th className="p-4 text-right pr-6">Verify Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredItems.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 text-xs text-slate-700 dark:text-slate-300">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-600" />
                        {o.name}
                      </div>
                    </td>
                    <td className="p-4">{o.category}</td>
                    <td className="p-4">{o.country}</td>
                    <td className="p-4">
                      <a href={o.website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1">
                        {o.website}
                      </a>
                    </td>
                    <td className="p-4 text-center font-mono font-bold">{o.projectsSupported}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        o.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {o.verified ? 'Verified Partner' : 'Pending Verification'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${
                        o.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleOrgVerification(o.id)}
                          className="px-2 py-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md cursor-pointer"
                        >
                          {o.verified ? 'Revoke Verify' : 'Verify Organization'}
                        </button>
                        <button
                          onClick={() => handleToggleOrgStatus(o.id)}
                          className={`p-1 rounded-md cursor-pointer ${o.status === 'active' ? 'hover:bg-red-50 text-red-600' : 'text-emerald-600'}`}
                        >
                          {o.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="challenges_portfolio_grid">
          {filteredItems.map((c: any) => (
            <div key={c.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold uppercase tracking-wider">
                    {c.researchArea}
                  </span>
                  {c.featured && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[8px] font-bold uppercase font-mono rounded">
                      Featured Challenge
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">
                  {c.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {c.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50 dark:border-slate-800 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider">Funding Award</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{c.funding}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider">Submission Deadline</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{c.deadline}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Supporting Org: <span className="text-slate-600 dark:text-slate-300 font-bold">{c.supportingOrganization}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => handleToggleFeatureChallenge(c.id)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                    c.featured ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  Feature
                </button>
                <button
                  onClick={() => handleDeleteChallenge(c.id)}
                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REJECTION FEEDBACK TEXT DIALOG */}
      {rejectingPaperId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
              <AlertTriangle className="text-red-500 w-5 h-5 animate-pulse" />
              Provide Rejection Feedback & Notes
            </h3>
            <p className="text-[11px] text-slate-400">
              The researcher will receive an automated portal alert containing these guidelines to help them revise and re-submit.
            </p>

            <form onSubmit={handleRejectResearchSubmit} className="space-y-4">
              <textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="List specific formatting, citation, or empirical gaps the researcher needs to correct..."
                className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-emerald-500"
                required
              ></textarea>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPaperId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                >
                  Issue Rejection Alert
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* LAUNCH CHALLENGE MODAL */}
      {isAddingNew && currentTab === 'challenges' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Launch New Circular Economy Challenge
              </h3>
              <button onClick={() => setIsAddingNew(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Challenge Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bio-waste reactor design hackathon..."
                  value={challengeDraft.title}
                  onChange={(e) => setChallengeDraft({ ...challengeDraft, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Scope Description</label>
                <textarea
                  placeholder="Detail the technical hurdles, community parameters, and criteria..."
                  value={challengeDraft.description}
                  onChange={(e) => setChallengeDraft({ ...challengeDraft, description: e.target.value })}
                  className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Sponsor Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. UNEP Africa Office"
                    value={challengeDraft.supportingOrganization}
                    onChange={(e) => setChallengeDraft({ ...challengeDraft, supportingOrganization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Research Stream Focus</label>
                  <select
                    value={challengeDraft.researchArea}
                    onChange={(e) => setChallengeDraft({ ...challengeDraft, researchArea: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  >
                    <option value="Waste-to-Energy">Waste-to-Energy</option>
                    <option value="Bioenergy Technology">Bioenergy Technology</option>
                    <option value="Climate & Energy Policy">Climate & Energy Policy</option>
                    <option value="Environmental Sustainability">Environmental Sustainability</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Funding Allocation</label>
                  <input
                    type="text"
                    placeholder="e.g. $45,000"
                    value={challengeDraft.funding}
                    onChange={(e) => setChallengeDraft({ ...challengeDraft, funding: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Challenge Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Months"
                    value={challengeDraft.timeline}
                    onChange={(e) => setChallengeDraft({ ...challengeDraft, timeline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Submission Limit</label>
                  <input
                    type="date"
                    value={challengeDraft.deadline}
                    onChange={(e) => setChallengeDraft({ ...challengeDraft, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Expected Deliverables</label>
                <input
                  type="text"
                  placeholder="e.g. Working physical prototype and analytical load logs"
                  value={challengeDraft.expectedDeliverables}
                  onChange={(e) => setChallengeDraft({ ...challengeDraft, expectedDeliverables: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Publish Challenge
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
