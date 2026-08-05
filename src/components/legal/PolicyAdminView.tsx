import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Edit3, 
  Save, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Plus, 
  Trash2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { PolicyDocumentData, DEFAULT_POLICIES } from '../../data/defaultPolicies';
import { 
  getAllPolicyAcceptances, 
  getPolicyDocuments, 
  updatePolicyDocument, 
  PolicyAcceptanceRecord 
} from '../../services/policyService';

interface PolicyAdminViewProps {
  onClose: () => void;
}

export default function PolicyAdminView({ onClose }: PolicyAdminViewProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'editor'>('audit');
  const [loading, setLoading] = useState(true);
  const [acceptances, setAcceptances] = useState<PolicyAcceptanceRecord[]>([]);
  const [policies, setPolicies] = useState<Record<string, PolicyDocumentData>>(DEFAULT_POLICIES);
  
  // Audit filter state
  const [auditSearch, setAuditSearch] = useState('');
  
  // Editor state
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<string>('terms');
  const [editingPolicy, setEditingPolicy] = useState<PolicyDocumentData>(DEFAULT_POLICIES.terms);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (policies[selectedPolicyKey]) {
      setEditingPolicy(JSON.parse(JSON.stringify(policies[selectedPolicyKey])));
    }
  }, [selectedPolicyKey, policies]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accList, polMap] = await Promise.all([
        getAllPolicyAcceptances(),
        getPolicyDocuments()
      ]);
      setAcceptances(accList);
      setPolicies(polMap);
      if (polMap[selectedPolicyKey]) {
        setEditingPolicy(JSON.parse(JSON.stringify(polMap[selectedPolicyKey])));
      }
    } catch (err) {
      console.error('Error loading admin policy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAcceptances = acceptances.filter(a => 
    a.userEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
    (a.userName && a.userName.toLowerCase().includes(auditSearch.toLowerCase())) ||
    a.userId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['User ID', 'Email', 'Name', 'Accepted At', 'Policy Versions', 'User Agent'];
    const rows = acceptances.map(a => [
      `"${a.userId}"`,
      `"${a.userEmail}"`,
      `"${a.userName || ''}"`,
      `"${a.acceptedAt}"`,
      `"${JSON.stringify(a.policyVersions).replace(/"/g, '""')}"`,
      `"${(a.userAgent || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aurenix_Policy_Acceptance_Audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSavePolicyEdit = async () => {
    setSaveStatus('saving');
    try {
      await updatePolicyDocument(selectedPolicyKey, editingPolicy);
      setSaveStatus('saved');
      await loadData();
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Failed to update policy:', err);
      setSaveStatus('error');
    }
  };

  const handleSectionContentChange = (index: number, newContent: string) => {
    const updated = { ...editingPolicy };
    updated.sections[index].content = newContent;
    setEditingPolicy(updated);
  };

  const handleSectionTitleChange = (index: number, newTitle: string) => {
    const updated = { ...editingPolicy };
    updated.sections[index].title = newTitle;
    setEditingPolicy(updated);
  };

  const handleAddSection = () => {
    const updated = { ...editingPolicy };
    const nextNum = updated.sections.length + 1;
    updated.sections.push({
      id: `section_${Date.now()}`,
      title: `${nextNum}. New Governance Clause`,
      content: 'Enter section content details here...'
    });
    setEditingPolicy(updated);
  };

  const handleDeleteSection = (index: number) => {
    if (editingPolicy.sections.length <= 1) return;
    const updated = { ...editingPolicy };
    updated.sections.splice(index, 1);
    setEditingPolicy(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                Legal Governance Console
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit records & dynamic policy document management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Acceptance Audit Trail ({acceptances.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Policy Editor & Versioning</span>
            </button>
          </div>

          {activeTab === 'audit' && (
            <button
              onClick={handleExportCSV}
              disabled={acceptances.length === 0}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Audit</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-slate-500">Fetching legal records from Firestore...</p>
            </div>
          ) : activeTab === 'audit' ? (
            /* AUDIT TRAIL TAB */
            <div className="space-y-4">
              
              {/* Search input */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by email, name, or User ID..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <span className="text-xs font-mono text-slate-500">
                  Showing {filteredAcceptances.length} of {acceptances.length} consent records
                </span>
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-mono text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">User & Email</th>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Accepted Versions</th>
                        <th className="px-4 py-3">User Agent</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                      {filteredAcceptances.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                            No consent records matching search query.
                          </td>
                        </tr>
                      ) : (
                        filteredAcceptances.map((rec, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {rec.userName || 'Scholar Member'}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                {rec.userEmail}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {new Date(rec.acceptedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(rec.policyVersions || {}).map(([key, val]) => (
                                  <span key={key} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {key}: v{val}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-[180px] truncate font-mono text-[10px] text-slate-400">
                              {rec.userAgent || 'Standard Browser'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Valid
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            /* EDITOR TAB */
            <div className="space-y-6">
              
              {/* Policy selector bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono font-bold text-slate-500 uppercase">
                    Select Policy:
                  </label>
                  <select
                    value={selectedPolicyKey}
                    onChange={(e) => setSelectedPolicyKey(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.entries(policies).map(([key, doc]: [string, PolicyDocumentData]) => (
                      <option key={key} value={key}>
                        {doc.title} (v{doc.version})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs font-mono text-slate-500">
                    Next Version: v{(parseFloat(editingPolicy.version || '1.0') + 0.1).toFixed(1)}
                  </span>
                  
                  <button
                    onClick={handleSavePolicyEdit}
                    disabled={saveStatus === 'saving'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveStatus === 'saving' ? 'Saving to Firestore...' : 'Publish Policy Update'}</span>
                  </button>
                </div>
              </div>

              {saveStatus === 'saved' && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Policy updated successfully and new version published to platform!</span>
                </div>
              )}

              {/* Policy Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-500">Policy Title</label>
                  <input
                    type="text"
                    value={editingPolicy.title}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-500">Executive Summary</label>
                  <input
                    type="text"
                    value={editingPolicy.summary}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, summary: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Editable Sections List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Policy Sections ({editingPolicy.sections.length})
                  </h3>
                  <button
                    onClick={handleAddSection}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Clause Section</span>
                  </button>
                </div>

                {editingPolicy.sections.map((section, idx) => (
                  <div key={section.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleSectionTitleChange(idx, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                      
                      <button
                        onClick={() => handleDeleteSection(idx)}
                        disabled={editingPolicy.sections.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                        title="Delete Clause"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      value={section.content}
                      onChange={(e) => handleSectionContentChange(idx, e.target.value)}
                      className="w-full p-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                    />
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
