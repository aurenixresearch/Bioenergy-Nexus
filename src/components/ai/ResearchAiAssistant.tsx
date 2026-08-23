import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Plus,
  Bot,
  User as UserIcon,
  HelpCircle,
  Award,
  BarChart2,
  ChevronDown,
  Download,
  Search,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Shield,
  Layers,
  Lightbulb,
  ExternalLink,
  BookOpen,
  Atom
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChatAttachment,
  ChatMessage,
  ChatSession,
  AI_MODELS,
  AI_PROMPT_PRESETS,
  fileToBase64,
  sendAiChatMessage,
  getSavedChatSessions,
  saveChatSession,
  deleteChatSession,
  clearAllChatSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession
} from '../../services/aiService';

interface ResearchAiAssistantProps {
  user?: any;
  userProfile?: any;
  isFloating?: boolean;
  onClose?: () => void;
  onNavigateToView?: (view: string, id?: string) => void;
}

export default function ResearchAiAssistant({
  user,
  userProfile,
  isFloating = false,
  onClose,
  onNavigateToView
}: ResearchAiAssistantProps) {
  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionSearch, setSessionSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isFloating);

  // Input & message generation state
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [selectedMode, setSelectedMode] = useState<'research' | 'ideas' | 'support' | 'general'>('research');
  const [isDragging, setIsDragging] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or load sessions
  useEffect(() => {
    const saved = getSavedChatSessions();
    if (saved.length > 0) {
      setSessions(saved);
      const activeId = getActiveSessionId();
      const active = saved.find((s) => s.id === activeId) || saved[0];
      setCurrentSession(active);
      setSelectedModel(active.model || 'gemini-3.7-flash');
      setSelectedMode(active.mode || 'research');
    } else {
      const newSess = createNewSession('research');
      setSessions([newSess]);
      setCurrentSession(newSess);
    }
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Handle File Uploads (PDF, Image, Text, Data)
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: ChatAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Size limit: 20MB per file
      if (file.size > 20 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 20MB limit.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        let previewUrl: string | undefined = undefined;
        if (file.type.startsWith('image/')) {
          previewUrl = base64;
        }

        newAttachments.push({
          id: `att_${Date.now()}_${i}`,
          name: file.name,
          mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain'),
          size: file.size,
          base64,
          previewUrl
        });
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Send message handler
  const handleSendMessage = async (textToSend?: string, customAttachments?: ChatAttachment[]) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    const files = customAttachments !== undefined ? customAttachments : attachments;

    if ((!text || !text.trim()) && files.length === 0) return;
    if (isLoading || !currentSession) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      attachments: files.length > 0 ? [...files] : undefined
    };

    // Auto-update session title if it's the first real user query
    let newTitle = currentSession.title;
    if (currentSession.messages.filter((m) => m.role === 'user').length === 0) {
      if (files.length > 0 && (!text || text.length < 5)) {
        newTitle = `Analysis: ${files[0].name.substring(0, 30)}`;
      } else {
        newTitle = text.trim().substring(0, 35) + (text.length > 35 ? '...' : '');
      }
    }

    const updatedMessages = [...currentSession.messages, userMessage];
    const updatedSession: ChatSession = {
      ...currentSession,
      title: newTitle,
      messages: updatedMessages,
      model: selectedModel,
      mode: selectedMode,
      updatedAt: new Date().toISOString()
    };

    setCurrentSession(updatedSession);
    saveChatSession(updatedSession);
    setSessions(getSavedChatSessions());

    // Reset input fields
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      // Build conversation payload for Gemini
      const apiPayload = updatedMessages.map((m) => ({
        role: m.role,
        text: m.text,
        attachments: m.attachments
      }));

      // Customize system instruction based on persona mode
      let modeInstruction = '';
      if (selectedMode === 'ideas') {
        modeInstruction = 'Focus intensely on generating high-impact novel research hypotheses, experimental frameworks, technology breakthroughs, and grant-ready proposals.';
      } else if (selectedMode === 'support') {
        modeInstruction = 'Focus on providing platform guidance for Aurenix Research: publishing papers, connecting with researchers, forming alliances, funding access, and user profile management.';
      } else if (selectedMode === 'research') {
        modeInstruction = 'Focus on rigorous scientific and academic analysis, summarizing paper methodologies, statistical metrics, chemical reactions, and critical engineering bottlenecks.';
      }

      const result = await sendAiChatMessage({
        messages: apiPayload,
        model: selectedModel,
        systemInstruction: modeInstruction
      });

      const assistantMessage: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        text: result.text,
        timestamp: result.timestamp || new Date().toISOString(),
        model: result.model || selectedModel,
        status: 'complete'
      };

      const finalSession: ChatSession = {
        ...updatedSession,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: new Date().toISOString()
      };

      setCurrentSession(finalSession);
      saveChatSession(finalSession);
      setSessions(getSavedChatSessions());
    } catch (err: any) {
      console.error('Error generating AI response:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Unable to complete response:** ${err?.message || 'Network or API error'}.\n\n*Please ensure your prompt is clear and files are properly formatted.*`,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: String(err)
      };

      const finalSession: ChatSession = {
        ...updatedSession,
        messages: [...updatedMessages, errorMessage],
        updatedAt: new Date().toISOString()
      };

      setCurrentSession(finalSession);
      saveChatSession(finalSession);
      setSessions(getSavedChatSessions());
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Enter to send (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Switch or create chat session
  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setActiveSessionId(session.id);
    setSelectedModel(session.model || 'gemini-3.7-flash');
    setSelectedMode(session.mode || 'research');
  };

  const handleCreateNewChat = (mode: 'research' | 'ideas' | 'support' | 'general' = selectedMode) => {
    const newSess = createNewSession(mode);
    setSessions(getSavedChatSessions());
    setCurrentSession(newSess);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteChatSession(sessionId);
    setSessions(updated);
    if (currentSession?.id === sessionId) {
      if (updated.length > 0) {
        setCurrentSession(updated[0]);
        setActiveSessionId(updated[0].id);
      } else {
        const brandNew = createNewSession('research');
        setSessions([brandNew]);
        setCurrentSession(brandNew);
      }
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleExportSession = () => {
    if (!currentSession) return;
    const lines = [
      `# ${currentSession.title}`,
      `Date: ${new Date(currentSession.createdAt).toLocaleString()}`,
      `Model: ${currentSession.model}`,
      `---\n`
    ];

    currentSession.messages.forEach((m) => {
      lines.push(`### ${m.role === 'user' ? 'User' : 'Aurenix AI Assistant'} (${new Date(m.timestamp).toLocaleTimeString()}):`);
      if (m.attachments && m.attachments.length > 0) {
        lines.push(`*Attachments: ${m.attachments.map((a) => a.name).join(', ')}*`);
      }
      lines.push(`\n${m.text}\n\n---\n`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSession.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ai_session.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render file icon helper
  const renderAttachmentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="w-4 h-4 text-rose-500" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    if (mimeType.includes('csv') || mimeType.includes('sheet')) return <FileSpreadsheet className="w-4 h-4 text-amber-500" />;
    return <FileCode className="w-4 h-4 text-cyan-500" />;
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative ${
        isFloating
          ? 'h-full w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl'
          : 'h-[calc(100vh-80px)] w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 border-4 border-dashed border-emerald-400 m-4 rounded-2xl text-white text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-700/80 flex items-center justify-center mb-4 ring-8 ring-emerald-500/30">
              <FileText className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-2xl font-black mb-2">Drop Research Documents or Images Here</h3>
            <p className="text-sm text-emerald-200 max-w-md">
              Upload PDF research papers, lab diagrams, spreadsheets, or charts for immediate AI summarization and technical insights.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isSidebarOpen ? 'Hide History' : 'Show History'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0 ring-2 ring-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black truncate text-slate-900 dark:text-white">
                  Aurenix Research Intelligence & Support AI
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  ARIS v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentSession ? currentSession.title : 'Scientific Advisor & Research Document Analyst'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Select Gemini AI Model"
            >
              <Atom className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">
                {AI_MODELS.find((m) => m.id === selectedModel)?.name || 'Gemini 3.7 Flash'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 text-left">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Available Gemini Engine
                </div>
                {AI_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(m.id);
                      setIsModelDropdownOpen(false);
                      if (currentSession) {
                        const updated = { ...currentSession, model: m.id };
                        setCurrentSession(updated);
                        saveChatSession(updated);
                      }
                    }}
                    className={`w-full flex flex-col p-2 rounded-xl text-left transition cursor-pointer ${
                      selectedModel === m.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                        {m.tag}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Session */}
          <button
            type="button"
            onClick={handleExportSession}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Export session as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => handleCreateNewChat()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Close if floating */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area (Sidebar + Message Thread) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left History Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isFloating ? 240 : 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden z-10"
            >
              {/* Search chats */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Chat Session List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Recent Sessions ({filteredSessions.length})
                </div>

                {filteredSessions.map((s) => {
                  const isActive = currentSession?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s)}
                      className={`group w-full flex items-center justify-between p-2 rounded-xl text-left cursor-pointer transition ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{s.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {new Date(s.updatedAt || s.createdAt).toLocaleDateString()} · {s.messages.length} msgs
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Mode Switcher in sidebar */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Advisory Mode</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('research')}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      selectedMode === 'research'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Reviewer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMode('ideas')}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      selectedMode === 'ideas'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3" />
                    <span>Ideas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMode('support')}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      selectedMode === 'support'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Platform</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMode('general')}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      selectedMode === 'general'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>General</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center Chat Messages Thread */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-white dark:bg-slate-950">
            {currentSession?.messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isCopied = copiedMessageId === msg.id;

              return (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[80%]`}>
                    {/* Attached files pills in user message */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-bold text-slate-800 dark:text-slate-200"
                          >
                            {renderAttachmentIcon(att.mimeType)}
                            <span className="truncate max-w-[160px]">{att.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              ({(att.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`p-4 md:p-5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-emerald-700 text-white rounded-tr-xs shadow-md font-semibold'
                          : 'bg-slate-50/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-white">{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-900 dark:text-slate-100 prose-p:text-slate-900 dark:prose-p:text-slate-100 prose-p:leading-relaxed prose-headings:text-slate-950 dark:prose-headings:text-white prose-headings:font-black prose-strong:text-slate-950 dark:prose-strong:text-white prose-strong:font-bold prose-li:text-slate-900 dark:prose-li:text-slate-200 prose-ul:text-slate-900 prose-ol:text-slate-900 prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-code:text-emerald-800 dark:prose-code:text-emerald-300 prose-code:bg-emerald-50/80 dark:prose-code:bg-emerald-950/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-blockquote:text-slate-900 dark:prose-blockquote:text-slate-200 prose-blockquote:border-l-4 prose-blockquote:border-emerald-600 prose-blockquote:bg-emerald-50/50 dark:prose-blockquote:bg-emerald-950/20 prose-blockquote:p-3 prose-blockquote:rounded-r-lg prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:text-slate-950 dark:prose-th:text-white prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-800 prose-td:text-slate-900 dark:prose-td:text-slate-200 prose-th:p-2 prose-td:p-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* Message Meta & Action Bar */}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.model && <span>· {msg.model}</span>}

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, msg.id)}
                          className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer ml-1 font-semibold"
                          title="Copy response"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs shrink-0 mt-1">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-4xl mx-auto justify-start"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Synthesizing scientific insights & proposals...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Starters & Presets Pills (shown when thread is short) */}
          {(!currentSession?.messages || currentSession.messages.length <= 1) && (
            <div className="px-4 pb-2 max-w-4xl mx-auto w-full bg-white dark:bg-slate-950">
              <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Suggested Research & Support Actions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {AI_PROMPT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setInputText(preset.prompt);
                      if (fileInputRef.current && (preset.id === 'summarize_paper' || preset.id === 'data_insights')) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-slate-950 dark:text-white font-bold text-xs group-hover:text-emerald-700 dark:group-hover:text-emerald-400 mb-1">
                      <span>{preset.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                      {preset.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Input Area */}
          <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto flex flex-col gap-2">
              {/* Attachment Preview Chips */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs"
                    >
                      {renderAttachmentIcon(att.mimeType)}
                      <span className="truncate max-w-[150px]">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Input Row */}
              <div className="relative flex items-end gap-2 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition p-2 shadow-xs">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.json,.md"
                  className="hidden"
                />

                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
                  title="Attach research PDF, image, or dataset (up to 20MB)"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask ARIS or attach a paper: 'Summarize key findings', 'Generate novel research ideas', 'Help me publish'..."
                  rows={1}
                  className="flex-1 bg-transparent resize-none border-0 text-sm text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-hidden py-2 px-1 max-h-[180px] custom-scrollbar"
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
                  className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 ${
                    isLoading || (!inputText.trim() && attachments.length === 0)
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
                  }`}
                  title="Send message (Enter)"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Footer Disclaimers & Hint */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium px-1">
                <span>Supports PDFs, lab images, charts, and datasets. Press Enter to send, Shift+Enter for new line.</span>
                <span className="hidden sm:inline font-mono font-bold text-emerald-800 dark:text-emerald-400">Gemini 3.7 Multimodal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
