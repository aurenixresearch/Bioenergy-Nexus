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
  // Chat sessions state - default sidebar open on laptop/desktop (>=1024px), closed on mobile/tablet
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionSearch, setSessionSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Input & message generation state
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [selectedMode, setSelectedMode] = useState<'research' | 'ideas' | 'support' | 'general'>('research');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<'all' | 'review' | 'ideation' | 'grants' | 'data' | 'support'>('all');
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
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleCreateNewChat = (mode: 'research' | 'ideas' | 'support' | 'general' = selectedMode) => {
    const newSess = createNewSession(mode);
    setSessions(getSavedChatSessions());
    setCurrentSession(newSess);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
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

  const renderPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'Award': return <Award className="w-4 h-4 text-indigo-500" />;
      case 'BarChart2': return <BarChart2 className="w-4 h-4 text-teal-500" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'HelpCircle': return <HelpCircle className="w-4 h-4 text-cyan-500" />;
      default: return <Sparkles className="w-4 h-4 text-emerald-500" />;
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  const filteredPresets = selectedPresetCategory === 'all'
    ? AI_PROMPT_PRESETS
    : AI_PROMPT_PRESETS.filter((p) => p.category === selectedPresetCategory);

  return (
    <div
      className="h-full w-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative"
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
            className="absolute inset-0 z-50 bg-emerald-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 sm:p-8 border-4 border-dashed border-emerald-400 m-2 sm:m-4 rounded-2xl text-white text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-700/80 flex items-center justify-center mb-4 ring-8 ring-emerald-500/30">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-2">Drop Research Documents or Images Here</h3>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-md">
              Upload PDF research papers, lab diagrams, spreadsheets, or charts for immediate AI summarization and technical insights.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title={isSidebarOpen ? 'Hide History' : 'Show History'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shrink-0 ring-2 ring-emerald-500/20">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-sm md:text-base font-black truncate text-slate-900 dark:text-white">
                  <span className="hidden sm:inline">Aurenix Research Intelligence & AI Support</span>
                  <span className="sm:hidden">ARIS Research AI</span>
                </h2>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {currentSession ? currentSession.title : 'Scientific Advisor & Research Document Analyst'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Select Gemini AI Model"
            >
              <Atom className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden md:inline">
                {AI_MODELS.find((m) => m.id === selectedModel)?.name || 'Gemini 3.7 Flash'}
              </span>
              <span className="md:hidden text-[11px]">
                {selectedModel.includes('pro') ? '3.7 Pro' : '3.7 Flash'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 sm:w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 text-left">
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
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer hidden sm:flex"
            title="Export session as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => handleCreateNewChat()}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
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
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Assistant (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area (Sidebar + Message Thread) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile/Tablet Backdrop for Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden cursor-pointer"
            />
          )}
        </AnimatePresence>

        {/* History Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed lg:relative inset-y-0 left-0 z-40 lg:z-10 w-72 sm:w-80 lg:w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden shadow-2xl lg:shadow-none"
            >
              {/* Search chats & mobile close */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
                  title="Close Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
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
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950 w-full">
          {/* Scrollable Message List / Welcome Screen */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 space-y-5 sm:space-y-6 custom-scrollbar bg-white dark:bg-slate-950 w-full">
            {(!currentSession?.messages || currentSession.messages.length <= 1) && (
              <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto py-2 space-y-6">
                {/* Welcome Hero Banner */}
                <div className="w-full p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-900/95 via-emerald-950 to-slate-950 text-white border border-emerald-800/60 shadow-xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-2 max-w-4xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-600/40 text-xs font-black">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>Aurenix Research Intelligence & AI Support</span>
                      </div>
                      <h3 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                        Accelerate Your Bioenergy & Academic Discovery
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-emerald-200/90 leading-relaxed font-medium">
                        Multimodal Gemini 3.7 engine built for African researchers. Summarize peer-reviewed papers, extract chemical and thermodynamic datasets, draft competitive grant proposals, or get real-time publishing support.
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
                      >
                        <Paperclip className="w-4 h-4 text-emerald-700" />
                        <span>Upload Research PDF</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Categories Filter Bar */}
                <div className="space-y-3.5 w-full">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Explore Suggested Capabilities & Prompts</span>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full">
                      <button
                        type="button"
                        onClick={() => setSelectedPresetCategory('all')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          selectedPresetCategory === 'all'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        All ({AI_PROMPT_PRESETS.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPresetCategory('review')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          selectedPresetCategory === 'review'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Paper Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPresetCategory('ideation')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          selectedPresetCategory === 'ideation'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Ideation
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPresetCategory('grants')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          selectedPresetCategory === 'grants'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Grants
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPresetCategory('data')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          selectedPresetCategory === 'data'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPresetCategory('support')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          selectedPresetCategory === 'support'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Platform
                      </button>
                    </div>
                  </div>

                  {/* Organized Cards Grid - spreads full width */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 w-full">
                    {filteredPresets.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => {
                          setInputText(preset.prompt);
                          if (preset.requiresUpload && fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                          textareaRef.current?.focus();
                        }}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group text-left hover:-translate-y-0.5"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                              {preset.tag}
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 transition">
                              {renderPresetIcon(preset.icon)}
                            </div>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
                            {preset.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                            {preset.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <span>{preset.requiresUpload ? 'Attach PDF & Run' : 'Use Prompt'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages Thread - full width spread */}
            {currentSession?.messages && currentSession.messages.length > 1 && (
              <div className="space-y-6 w-full max-w-6xl 2xl:max-w-7xl mx-auto">
                {currentSession.messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const isCopied = copiedMessageId === msg.id;

                  return (
                    <motion.div
                      key={msg.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 sm:gap-4 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-1">
                          <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                        </div>
                      )}

                      <div className={`flex flex-col ${isUser ? 'items-end max-w-[90%] sm:max-w-[80%]' : 'items-start flex-1 min-w-0 max-w-full'}`}>
                        {/* Attached files pills in user message */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {msg.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-bold text-slate-800 dark:text-slate-200"
                              >
                                {renderAttachmentIcon(att.mimeType)}
                                <span className="truncate max-w-[200px]">{att.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  ({(att.size / 1024).toFixed(0)} KB)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`p-4 sm:p-6 rounded-2xl text-sm md:text-base leading-relaxed w-full ${
                            isUser
                              ? 'bg-emerald-700 text-white rounded-tr-xs shadow-md font-semibold'
                              : 'bg-slate-50/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap text-white">{msg.text}</p>
                          ) : (
                            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none w-full text-slate-900 dark:text-slate-100 prose-p:text-slate-900 dark:prose-p:text-slate-100 prose-p:leading-relaxed prose-headings:text-slate-950 dark:prose-headings:text-white prose-headings:font-black prose-strong:text-slate-950 dark:prose-strong:text-white prose-strong:font-bold prose-li:text-slate-900 dark:prose-li:text-slate-200 prose-ul:text-slate-900 prose-ol:text-slate-900 prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-code:text-emerald-800 dark:prose-code:text-emerald-300 prose-code:bg-emerald-50/80 dark:prose-code:bg-emerald-950/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-blockquote:text-slate-900 dark:prose-blockquote:text-slate-200 prose-blockquote:border-l-4 prose-blockquote:border-emerald-600 prose-blockquote:bg-emerald-50/50 dark:prose-blockquote:bg-emerald-950/20 prose-blockquote:p-3 prose-blockquote:rounded-r-lg prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:text-slate-950 dark:prose-th:text-white prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-800 prose-td:text-slate-900 dark:prose-td:text-slate-200 prose-th:p-3 prose-td:p-3">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Message Meta & Action Bar */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.model && <span>· {msg.model}</span>}

                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.text, msg.id)}
                              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer ml-1 font-bold"
                              title="Copy response"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs shrink-0 mt-1">
                          <UserIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 sm:gap-4 w-full max-w-6xl 2xl:max-w-7xl mx-auto justify-start"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
                  <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce"></div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Synthesizing scientific insights & academic proposals...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Follow-up Chips (only shown if messages exist) */}
          {currentSession?.messages && currentSession.messages.length > 1 && (
            <div className="w-full px-4 sm:px-6 py-2.5 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800/80">
              <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto overflow-x-auto custom-scrollbar flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Quick Ask:</span>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Can you break down the mathematical methodology and statistical significance in detail?')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 hover:border-emerald-600 transition shrink-0 cursor-pointer shadow-2xs"
                >
                  🔬 Methodology & Stats
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('What are the key commercialization bottlenecks and policy recommendations?')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 hover:border-emerald-600 transition shrink-0 cursor-pointer shadow-2xs"
                >
                  💡 Bottlenecks & Policy
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Draft an executive summary abstract suitable for an African clean-energy grant.')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 hover:border-emerald-600 transition shrink-0 cursor-pointer shadow-2xs"
                >
                  📝 Grant Abstract
                </button>
              </div>
            </div>
          )}

          {/* Bottom Input Area */}
          <div className="p-3 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 w-full">
            <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto flex flex-col gap-2.5">
              {/* Attachment Preview Chips */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs"
                    >
                      {renderAttachmentIcon(att.mimeType)}
                      <span className="truncate max-w-[200px]">{att.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({(att.size / 1024).toFixed(0)} KB)</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer ml-1"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Input Row */}
              <div className="relative flex items-end gap-2 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition p-2.5 shadow-xs">
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
                  className="flex-1 bg-transparent resize-none border-0 text-sm md:text-base text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-hidden py-2 px-1.5 max-h-[220px] custom-scrollbar"
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition cursor-pointer shrink-0 ${
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
