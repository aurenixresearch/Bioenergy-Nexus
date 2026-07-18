import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartHandshake, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Search, 
  MessageSquare, 
  Download, 
  Paperclip, 
  UserPlus, 
  Clock, 
  Brain, 
  RefreshCcw, 
  Activity, 
  Plus, 
  TrendingUp, 
  Check 
} from 'lucide-react';
import { AdminConsulting, AdminFunding, AdminUser, AdminProject, MOCK_USERS, MOCK_PROJECTS } from './AdminMockData';

interface ConsultingFundingProps {
  currentTab: 'consulting' | 'funding' | 'matchmaking';
  consulting: AdminConsulting[];
  funding: AdminFunding[];
  users: AdminUser[];
  projects: AdminProject[];
  onUpdateConsulting: (updated: AdminConsulting[]) => void;
  onUpdateFunding: (updated: AdminFunding[]) => void;
  theme: 'light' | 'dark';
}

export default function ConsultingFunding({
  currentTab,
  consulting,
  funding,
  users,
  projects,
  onUpdateConsulting,
  onUpdateFunding,
  theme
}: ConsultingFundingProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Consulting assign states
  const [assigningRequestId, setAssigningRequestId] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState('');

  // Consulting chat details modal
  const [activeChatRequest, setActiveChatRequest] = useState<AdminConsulting | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  // AI Matchmaking states
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculatingProgress, setRecalculatingProgress] = useState(0);
  const [manualMatch, setManualMatch] = useState({ researcherId: '', projectId: '', score: 95 });
  const [aiMatchLogs, setAiMatchLogs] = useState<string[]>([
    'System: Matchmaking engine online.',
    'Engine: Computed 34 potential university-enterprise alignments.',
    'Success: High correlation identified in waste pyrolysis sector (Score: 92%).'
  ]);

  // Consulting Actions
  const handleAssignConsultant = (id: string, name: string) => {
    const updated = consulting.map(c => {
      if (c.id === id) {
        const nextChat = c.chat ? [...c.chat] : [];
        nextChat.push({
          sender: 'System',
          msg: `Platform Admin assigned Consultant: ${name} to lead this advisory stream.`,
          timestamp: new Date().toISOString()
        });
        return { 
          ...c, 
          consultant: name, 
          status: 'In Review' as const,
          chat: nextChat
        };
      }
      return c;
    });
    onUpdateConsulting(updated);
    setAssigningRequestId(null);
    setSelectedConsultant('');
  };

  const handleUpdateStatus = (id: string, status: AdminConsulting['status']) => {
    const updated = consulting.map(c => {
      if (c.id === id) {
        return { ...c, status };
      }
      return c;
    });
    onUpdateConsulting(updated);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatRequest || !chatMessage.trim()) return;

    const nextChat = activeChatRequest.chat ? [...activeChatRequest.chat] : [];
    nextChat.push({
      sender: 'Platform Admin',
      msg: chatMessage,
      timestamp: new Date().toISOString()
    });

    const updatedRequest = { ...activeChatRequest, chat: nextChat };
    setActiveChatRequest(updatedRequest);

    const updated = consulting.map(c => c.id === activeChatRequest.id ? updatedRequest : c);
    onUpdateConsulting(updated);
    setChatMessage('');
  };

  // Funding Actions
  const handleArchiveFunding = (id: string) => {
    const updated = funding.map(f => f.id === id ? { ...f, status: 'Archived' as const } : f);
    onUpdateFunding(updated);
  };

  // Matchmaking Actions
  const handleRecalculateMatches = () => {
    if (isRecalculating) return;
    setIsRecalculating(true);
    setRecalculatingProgress(0);
    setAiMatchLogs(prev => [...prev, `Engine: Initiated complete realignment calculations...`]);

    const interval = setInterval(() => {
      setRecalculatingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsRecalculating(false);
          setAiMatchLogs(prev => [
            ...prev, 
            `Success: Realignment calculations completed successfully.`,
            `Stats: Indexed ${users.length} active researchers against ${projects.length} laboratory streams.`,
            `Database: Synchronized 14 high-matching partnerships (average score: 88.4%).`
          ]);
          return 100;
        }
        return p + 10;
      });
    }, 250);
  };

  const handleManualMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMatch.researcherId || !manualMatch.projectId) return;

    const res = users.find(u => u.uid === manualMatch.researcherId);
    const proj = projects.find(p => p.id === manualMatch.projectId);

    if (res && proj) {
      setAiMatchLogs(prev => [
        ...prev,
        `Manual Alignment: Verified connection between ${res.fullName} & ${proj.title} (Match Score: ${manualMatch.score}%).`
      ]);
      alert(`Manual Match Authorized: Alignment index recorded with score ${manualMatch.score}%. An alert has been pushed to the respective profiles.`);
      setManualMatch({ researcherId: '', projectId: '', score: 95 });
    }
  };

  // Filters
  const filteredConsulting = consulting.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return !q || c.researcher.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
  });

  const filteredFunding = funding.filter(f => {
    const q = searchQuery.toLowerCase().trim();
    return !q || f.sponsor.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6" id={`consulting_funding_${currentTab}`}>
      {/* Search Header Row */}
      {currentTab !== 'matchmaking' && (
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
        </div>
      )}

      {/* CONSULTING TAB */}
      {currentTab === 'consulting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="consulting_requests_grid">
          {filteredConsulting.map((c) => (
            <div key={c.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                    c.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.priority} Priority
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                    c.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">
                  {c.subject}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {c.message}
                </p>

                {c.files && c.files.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="block text-[9px] font-mono uppercase text-slate-400">Attached Documents</span>
                    <div className="flex flex-wrap gap-2">
                      {c.files.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded text-[10px] font-mono text-slate-500">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-50 dark:border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div>Requester: <span className="text-slate-700 dark:text-slate-300 font-bold">{c.researcher}</span></div>
                  <div>Assigned Expert: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{c.consultant || 'PENDING ASSIGNMENT'}</span></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveChatRequest(c)}
                  className="px-3 py-1.5 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat ({c.chat ? c.chat.length : 0})
                </button>

                <div className="flex items-center gap-2">
                  {!c.consultant ? (
                    <button
                      onClick={() => setAssigningRequestId(c.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase font-mono rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Assign Expert
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'Completed')}
                      className="px-3 py-1.5 bg-slate-100 text-emerald-800 font-bold text-[10px] uppercase font-mono rounded-lg cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FUNDING TAB */}
      {currentTab === 'funding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="funding_grants_grid">
          {filteredFunding.map((f) => (
            <div key={f.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-full text-[9px] font-mono font-bold uppercase tracking-wide">
                    {f.type}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-md ${
                    f.status === 'Open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {f.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">
                    {f.sponsor} Green Portfolio Allocation
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {f.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50 dark:border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider">Allocation Cap</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{f.amount}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider">Submissions</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{f.applicantsCount} partners</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleArchiveFunding(f.id)}
                  className="px-3 py-1.5 text-[10px] font-bold bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg cursor-pointer"
                >
                  Archive Opportunity
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI MATCHMAKING TAB */}
      {currentTab === 'matchmaking' && (
        <div className="space-y-6" id="ai_matchmaking_panel">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Control Panel / animated recalculations */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-emerald-600 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Ecosystem Matchmaker Core</h4>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Aurenix leverages server-side neural clustering to automatically establish high-correlation partners, laboratory allocations, and research alliances across the African continent.
              </p>

              <div className="space-y-4 pt-2">
                <button
                  onClick={handleRecalculateMatches}
                  disabled={isRecalculating}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                >
                  <RefreshCcw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                  {isRecalculating ? 'Clustering Models...' : 'Recalculate Matches'}
                </button>

                {isRecalculating && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Neural Matrix Refactoring</span>
                      <span>{recalculatingProgress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${recalculatingProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase">Clustering Score</span>
                  <span className="block text-lg font-black text-slate-800 dark:text-slate-100 mt-1">88.4%</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase">Alignments</span>
                  <span className="block text-lg font-black text-slate-800 dark:text-slate-100 mt-1">34 active</span>
                </div>
              </div>
            </div>

            {/* Manual Alignment Creator */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Authorize Manual Alignment</h4>
              </div>

              <form onSubmit={handleManualMatchSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Select Researcher</label>
                  <select
                    value={manualMatch.researcherId}
                    onChange={(e) => setManualMatch({ ...manualMatch, researcherId: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Choose an expert...</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>{u.fullName} ({u.institution})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Select Laboratory / Project</label>
                  <select
                    value={manualMatch.projectId}
                    onChange={(e) => setManualMatch({ ...manualMatch, projectId: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Choose project stream...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Confidence Alignment Score ({manualMatch.score}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={manualMatch.score}
                    onChange={(e) => setManualMatch({ ...manualMatch, score: parseInt(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Create Match Covenant
                </button>
              </form>
            </div>

            {/* AI Action/Calculations Logs Console */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Model Execution Log</h4>
                </div>

                <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-[10px] h-48 overflow-y-auto custom-scrollbar rounded-2xl space-y-2 leading-relaxed border border-slate-800 shadow-inner select-text">
                  {aiMatchLogs.map((log, idx) => (
                    <div key={idx} className="break-words">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Model Engine: Cluster-v4</span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="w-3 h-3" />
                  Stable Sync
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ASSIGN EXPERT MODAL */}
      {assigningRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              Assign Advisory Consultant
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Select Certified Expert</label>
                <select
                  value={selectedConsultant}
                  onChange={(e) => setSelectedConsultant(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Choose consultant...</option>
                  <option value="Dr. Sarah Adebayo">Dr. Sarah Adebayo (Pyrolysis Specialist)</option>
                  <option value="Prof. Fatima Diop">Prof. Fatima Diop (Bioenergy Control)</option>
                  <option value="Engr. Chidi Okafor">Engr. Chidi Okafor (Hardware Design)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningRequestId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignConsultant(assigningRequestId, selectedConsultant)}
                  disabled={!selectedConsultant}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-lg cursor-pointer"
                >
                  Authorize Assignment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* CHAT/MESSAGE BOX DRAWER */}
      {activeChatRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">Consultation ID: {activeChatRequest.id}</span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display mt-0.5">{activeChatRequest.subject}</h3>
              </div>
              <button onClick={() => setActiveChatRequest(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat message logs */}
            <div className="flex-grow overflow-y-auto custom-scrollbar h-64 pr-2 space-y-3.5 my-4">
              {activeChatRequest.chat && activeChatRequest.chat.map((msg, idx) => {
                const isAdmin = msg.sender === 'Platform Admin';
                const isSystem = msg.sender === 'System';

                if (isSystem) {
                  return (
                    <div key={idx} className="text-center">
                      <span className="inline-block bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-400 px-3 py-1 rounded-full leading-snug">
                        {msg.msg}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] font-mono text-slate-400 mb-0.5">{msg.sender}</span>
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      isAdmin 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100/60 dark:border-slate-700/60'
                    }`}>
                      {msg.msg}
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono mt-0.5">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                );
              })}
            </div>

            {/* Chat input box */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <input
                type="text"
                placeholder="Type your official administrative message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                required
              />
              <button
                type="submit"
                className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
