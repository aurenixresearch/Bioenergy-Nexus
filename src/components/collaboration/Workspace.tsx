import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  FolderOpen, 
  Coins, 
  Video, 
  Calendar, 
  Activity, 
  Plus, 
  X, 
  Check, 
  ChevronRight, 
  User, 
  Sparkles, 
  AlertCircle, 
  History, 
  Sliders,
  Send,
  FileDown
} from 'lucide-react';
import { Workspace as WorkspaceType } from './types';
import { updateWorkspace } from '../../services/collaborationDb';

interface WorkspaceProps {
  workspace: WorkspaceType;
  user: any;
  onBack: () => void;
  onSuccess: (msg: string) => void;
}

type WorkspaceTab = 'notes' | 'tasks' | 'chat' | 'files' | 'budget';

export default function Workspace({ workspace: initialWorkspace, user, onBack, onSuccess }: WorkspaceProps) {
  const [workspace, setWorkspace] = useState<WorkspaceType>(initialWorkspace);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('notes');

  // Input states
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssigned, setNewTaskAssigned] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [chatMessage, setChatMessage] = useState('');

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  useEffect(() => {
    setWorkspace(initialWorkspace);
    if (initialWorkspace.researchNotes.length > 0) {
      setSelectedNoteId(initialWorkspace.researchNotes[0].id);
    }
  }, [initialWorkspace]);

  // General sync helper
  const syncWorkspace = async (updated: WorkspaceType, activityLog?: string) => {
    setWorkspace(updated);
    if (activityLog) {
      updated.activityLogs.unshift({
        id: `log-${Date.now()}`,
        user: user?.displayName || 'Partner',
        action: activityLog,
        time: new Date().toLocaleTimeString()
      });
    }
    await updateWorkspace(updated.id, updated);
  };

  // 1. NOTES ACTIONS
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteContent) return;

    const newNote = {
      id: `n-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent,
      updatedBy: user?.displayName || 'Scholar',
      updatedAt: new Date().toISOString()
    };

    const updated = {
      ...workspace,
      researchNotes: [...workspace.researchNotes, newNote],
      versionHistory: [
        { id: `v-${Date.now()}`, docName: newNoteTitle, version: 'v1.0 (Draft)', author: user?.displayName || 'Scholar', date: new Date().toLocaleDateString() },
        ...workspace.versionHistory
      ]
    };

    await syncWorkspace(updated, `Created note: "${newNoteTitle}"`);
    setSelectedNoteId(newNote.id);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
    onSuccess('Research note added to workspace.');
  };

  const handleUpdateNote = async (content: string) => {
    const updatedNotes = workspace.researchNotes.map(n => {
      if (n.id === selectedNoteId) {
        return { ...n, content, updatedBy: user?.displayName || 'Scholar', updatedAt: new Date().toISOString() };
      }
      return n;
    });

    const activeNote = workspace.researchNotes.find(n => n.id === selectedNoteId);

    const updated = {
      ...workspace,
      researchNotes: updatedNotes,
      versionHistory: [
        { id: `v-${Date.now()}`, docName: activeNote?.title || 'Research draft', version: `v1.${Date.now().toString().slice(-1)}`, author: user?.displayName || 'Scholar', date: new Date().toLocaleDateString() },
        ...workspace.versionHistory
      ]
    };

    await syncWorkspace(updated, `Edited note: "${activeNote?.title}"`);
  };

  // 2. TASKS & MILESTONES ACTIONS
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask = {
      id: `t-${Date.now()}`,
      title: newTaskTitle,
      assignedTo: newTaskAssigned || user?.displayName || 'Scholar',
      status: 'To Do' as const,
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0]
    };

    const updated = {
      ...workspace,
      tasks: [...workspace.tasks, newTask]
    };

    await syncWorkspace(updated, `Assigned task: "${newTaskTitle}" to ${newTask.assignedTo}`);
    setNewTaskTitle('');
    setNewTaskAssigned('');
    setNewTaskDueDate('');
    setIsAddingTask(false);
    onSuccess('Task added.');
  };

  const handleTaskStatusChange = async (taskId: string, status: any) => {
    const updatedTasks = workspace.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status };
      }
      return t;
    });

    const task = workspace.tasks.find(t => t.id === taskId);
    const updated = { ...workspace, tasks: updatedTasks };
    await syncWorkspace(updated, `Updated status of "${task?.title}" to ${status}`);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle) return;

    const newMilestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneTitle,
      dueDate: newMilestoneDueDate || new Date().toISOString().split('T')[0],
      status: 'Pending' as const,
      releaseState: 'Draft' as const
    };

    const updated = {
      ...workspace,
      milestones: [...workspace.milestones, newMilestone]
    };

    await syncWorkspace(updated, `Added milestone: "${newMilestoneTitle}"`);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
    setIsAddingMilestone(false);
  };

  const handleMilestoneCompleteToggle = async (milestoneId: string) => {
    const updatedMilestones = workspace.milestones.map(m => {
      if (m.id === milestoneId) {
        const nextStatus = m.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...m, status: nextStatus as any };
      }
      return m;
    });

    const m = workspace.milestones.find(item => item.id === milestoneId);
    const updated = { ...workspace, milestones: updatedMilestones };
    await syncWorkspace(updated, `Toggled milestone complete: "${m?.title}"`);
  };

  const handleMilestoneReleaseToggle = async (milestoneId: string) => {
    const updatedMilestones = workspace.milestones.map(m => {
      if (m.id === milestoneId) {
        const nextRelease = m.releaseState === 'Released' ? 'Draft' : 'Released';
        return { ...m, releaseState: nextRelease as any };
      }
      return m;
    });

    const m = workspace.milestones.find(item => item.id === milestoneId);
    const updated = { ...workspace, milestones: updatedMilestones };
    await syncWorkspace(updated, `Toggled release state of "${m?.title}"`);
  };

  // 3. CHAT ACTIONS
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.uid || 'guest',
      senderName: user?.displayName || 'Scholar',
      content: chatMessage.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...workspace,
      messages: [...workspace.messages, newMessage]
    };

    await syncWorkspace(updated);
    setChatMessage('');
  };

  const activeNote = workspace.researchNotes.find(n => n.id === selectedNoteId);

  return (
    <div className="bg-slate-50 min-h-screen text-left" id="active_workspace_canvas">
      
      {/* Top sticky workspace bar */}
      <div className="bg-white border-b border-slate-100 p-5 sm:px-8 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 border border-slate-200/60 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
          >
            &larr; Exit
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 font-display line-clamp-1">{workspace.title}</h1>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Notion-Style Active Collaboration Ecosystem</p>
          </div>
        </div>

        {/* Member list and active signals */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {workspace.members.map((m, idx) => (
              <div 
                key={m.uid} 
                title={`${m.name} (${m.role})`}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shrink-0 ${
                  idx === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                }`}
              >
                {m.name.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium font-display hidden sm:inline">{workspace.members.length} Collaborators Active</span>
        </div>
      </div>

      {/* Main Workspace Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 sm:p-8">
        
        {/* Workspace directory side column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-1.5">
            <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Workspace Navigation</h3>
            
            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-between ${
                activeTab === 'notes' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Research Notes
              </span>
              <span className="text-[9px] bg-white/20 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                {workspace.researchNotes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-between ${
                activeTab === 'tasks' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Tasks & Milestones
              </span>
              <span className="text-[9px] bg-white/20 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                {workspace.tasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-between ${
                activeTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Kinetics Chat
              </span>
              <span className="text-[9px] bg-white/20 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                {workspace.messages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-between ${
                activeTab === 'files' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Uploaded Documents
              </span>
              <span className="text-[9px] bg-white/20 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                {workspace.files.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-between ${
                activeTab === 'budget' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Ledger & Logs
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">{workspace.budget.remaining}</span>
            </button>
          </div>

          {/* Quick Meetings Panel */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-4">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">Scheduled Review Sync</h4>
            <div className="space-y-3">
              {workspace.meetings.map(meet => (
                <div key={meet.id} className="p-3 bg-emerald-50/50 border border-emerald-100/30 rounded-xl space-y-2">
                  <div>
                    <h5 className="text-xs font-bold text-slate-950 font-display">{meet.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">{meet.time}</p>
                  </div>
                  <a
                    href={meet.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Video Sync &rarr;
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Canvas panels */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: NOTES INTERACTIVE EDITOR */}
            {activeTab === 'notes' && (
              <motion.div
                key="notes-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Notes Directory Column */}
                <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200/60 p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-xs font-bold text-slate-900 font-display">Notes & Drafts</h4>
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {workspace.researchNotes.map(note => (
                      <button
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={`w-full p-3 rounded-xl text-left border cursor-pointer transition ${
                          selectedNoteId === note.id
                            ? 'bg-emerald-50/70 border-emerald-200 text-slate-950'
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <h5 className="text-xs font-bold font-display line-clamp-1">{note.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{note.content}</p>
                        <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-2">
                          <span>By: {note.updatedBy}</span>
                          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Notepad Column */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs flex flex-col justify-between min-h-[400px]">
                  {isAddingNote ? (
                    <form onSubmit={handleAddNote} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Note Title</label>
                        <input
                          type="text"
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          placeholder="e.g. Volatile Fatty Acids chromatographic ratios"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Research Notes Content</label>
                        <textarea
                          rows={10}
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder="Document your biochemical observations, lab chromatography data, or process design modifications..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingNote(false)}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                        >
                          Add Note & version-control
                        </button>
                      </div>
                    </form>
                  ) : activeNote ? (
                    <div className="space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 font-display">{activeNote.title}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Last modified by {activeNote.updatedBy} at {new Date(activeNote.updatedAt).toLocaleTimeString()}</p>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <History className="w-3 h-3" /> Auto-saved
                          </span>
                        </div>
                        <textarea
                          value={activeNote.content}
                          onChange={(e) => handleUpdateNote(e.target.value)}
                          className="w-full text-slate-700 text-xs sm:text-sm leading-relaxed border-none outline-none resize-none font-sans min-h-[250px]"
                        />
                      </div>

                      {/* Version history sub panel */}
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Version Control log</h4>
                        <div className="space-y-1.5 text-[10px] text-slate-500">
                          {workspace.versionHistory.slice(0, 2).map((vh) => (
                            <div key={vh.id} className="flex justify-between items-center">
                              <span className="font-medium text-slate-700">Document: {vh.docName} ({vh.version})</span>
                              <span className="font-mono text-slate-400">{vh.author} • {vh.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-2 py-16">
                      <FileText className="w-12 h-12 text-slate-300" />
                      <h4 className="text-xs font-bold text-slate-500">No Research Notes Yet</h4>
                      <p className="text-[10px] text-slate-400">Click the plus icon to log the first chemical process observation.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: TASKS & MILESTONES WITH STATUS CHANGE */}
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Milestones and Release Gates */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-display">Timeline Milestones & Release Gates</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Toggle milestones to mark progress and release results to the public domain.</p>
                    </div>
                    <button
                      onClick={() => setIsAddingMilestone(true)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      + Add Milestone
                    </button>
                  </div>

                  {isAddingMilestone && (
                    <form onSubmit={handleAddMilestone} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap gap-3 items-end">
                      <div className="flex-grow space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Milestone Title</label>
                        <input
                          type="text"
                          required
                          value={newMilestoneTitle}
                          onChange={(e) => setNewMilestoneTitle(e.target.value)}
                          placeholder="e.g. Continuous Digester Integration"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Due Date</label>
                        <input
                          type="date"
                          value={newMilestoneDueDate}
                          onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingMilestone(false)}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {workspace.milestones.map(mil => (
                      <div key={mil.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs text-slate-700">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleMilestoneCompleteToggle(mil.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                              mil.status === 'Completed'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-slate-300 hover:border-emerald-500'
                            }`}
                          >
                            {mil.status === 'Completed' && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <span className={mil.status === 'Completed' ? 'line-through text-slate-400 font-medium' : 'font-semibold text-slate-900'}>
                              {mil.title}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Due: {mil.dueDate}</span>
                          </div>
                        </div>

                        {/* Release gate toggle */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            mil.releaseState === 'Released'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {mil.releaseState}
                          </span>
                          <button
                            onClick={() => handleMilestoneReleaseToggle(mil.id)}
                            className="px-2.5 py-1 border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 rounded-lg text-[9px] font-mono font-bold cursor-pointer transition"
                          >
                            Toggle Release Gate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks checklists */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-display">Action Item Kanban</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assign deliverables and track tasks through progress columns.</p>
                    </div>
                    <button
                      onClick={() => setIsAddingTask(true)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      + Assign Task
                    </button>
                  </div>

                  {isAddingTask && (
                    <form onSubmit={handleAddTask} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap gap-3 items-end">
                      <div className="flex-grow space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Task Title</label>
                        <input
                          type="text"
                          required
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="e.g. Calibrate chromatography column parameters"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Assign To</label>
                        <select
                          value={newTaskAssigned}
                          onChange={(e) => setNewTaskAssigned(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white"
                        >
                          <option value="">-- Assignee --</option>
                          {workspace.members.map(m => (
                            <option key={m.uid} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Due Date</label>
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingTask(false)}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                          Add Action
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2 text-xs">
                    {workspace.tasks.map(task => (
                      <div key={task.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 leading-snug">{task.title}</h4>
                          <div className="flex gap-4 text-[10px] text-slate-400 font-mono mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-emerald-600" />
                              Assigned: {task.assignedTo}
                            </span>
                            <span>•</span>
                            <span>Due: {task.dueDate}</span>
                          </div>
                        </div>

                        {/* Interactive Status Selector */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-mono text-slate-400">Status:</span>
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                            className="p-1 px-2.5 bg-white border border-slate-200 text-[10px] font-bold rounded-lg focus:border-emerald-600 outline-none"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: CHAT FEED */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between min-h-[480px] overflow-hidden"
              >
                {/* Chat Feed */}
                <div className="p-6 overflow-y-auto space-y-4 flex-grow max-h-[360px]">
                  {workspace.messages.map(msg => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/50'
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 mt-1 px-1">{msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Sender bar */}
                <form onSubmit={handleSendChat} className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2.5 items-center shrink-0">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask co-operators questions or report process chromatography updates..."
                    className="flex-grow px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-600 outline-none"
                  />
                  <button type="submit" className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB 4: FILES & DOCUMENTS */}
            {activeTab === 'files' && (
              <motion.div
                key="files-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Uploaded items lists */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Symmetric Files Storage</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Access uploaded chromatograph sheets, structural CAD drafts, or joint papers.</p>
                  </div>

                  {workspace.files.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {workspace.files.map(file => (
                        <div key={file.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-center text-slate-700 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">{file.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono">Size: {file.size} • Uploaded by {file.uploadedBy}</span>
                            </div>
                          </div>
                          <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-500 hover:text-emerald-700 cursor-pointer flex items-center gap-1 text-[10px] font-mono">
                            <FileDown className="w-3.5 h-3.5" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                      No files uploaded. Drag & drop files here to upload.
                    </div>
                  )}
                </div>

                {/* Deliverables checklists */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Target Deliverables approvals</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Submit final reports and track official stakeholder sign-off status.</p>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-center">
                      <span>Zeolite Sorption Efficiency Report</span>
                      <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Approved
                      </span>
                    </div>
                    <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-center">
                      <span>Volatile Fatty Acids chromatography graphs</span>
                      <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Pending Partner Upload
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: BUDGET & LOGS */}
            {activeTab === 'budget' && (
              <motion.div
                key="budget-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Budget ledger spreadsheet */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-display">Disbursement Ledger</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Secured funding release milestones and material expense logs.</p>
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Grant</span>
                        <strong className="text-slate-900 font-extrabold">{workspace.budget.total}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Spent</span>
                        <strong className="text-rose-600 font-extrabold">{workspace.budget.spent}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Remaining</span>
                        <strong className="text-emerald-700 font-extrabold">{workspace.budget.remaining}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-xs text-left text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-100">
                        <tr>
                          <th className="p-3">Expense Description</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {workspace.budget.lineItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 text-slate-900">{item.description}</td>
                            <td className="p-3 text-right font-mono text-slate-700">{item.amount}</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                item.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit Logs feed */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Workspace Activity Log</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Complete cryptographic audit trail of workspace modifications.</p>
                  </div>

                  <div className="space-y-3 font-mono text-[10px] text-slate-500">
                    {workspace.activityLogs.map(log => (
                      <div key={log.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-slate-700">
                          <strong>{log.user}</strong>: {log.action}
                        </span>
                        <span className="text-slate-400">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
