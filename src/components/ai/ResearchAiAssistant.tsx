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
  ArrowLeft,
  Shield,
  Layers,
  Lightbulb,
  ExternalLink,
  BookOpen,
  Atom,
  AppWindow,
  PanelRight,
  Maximize2,
  Minimize2,
  Pencil
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

export type AiAssistantSizeMode = 'compact' | 'docked' | 'window' | 'fullscreen';

interface ResearchAiAssistantProps {
  user?: any;
  userProfile?: any;
  isFloating?: boolean;
  sizeMode?: AiAssistantSizeMode;
  onChangeSizeMode?: (mode: AiAssistantSizeMode) => void;
  onClose?: () => void;
  onNavigateToView?: (view: string, id?: string) => void;
}

export default function ResearchAiAssistant({
  user,
  userProfile,
  isFloating = false,
  sizeMode = 'window',
  onChangeSizeMode,
  onClose,
  onNavigateToView
}: ResearchAiAssistantProps) {
  // Chat sessions state - default sidebar open on laptop/desktop (>=1024px) when not in compact mode
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionSearch, setSessionSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      if (sizeMode === 'compact') return false;
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

  // Keyboard shortcut: Escape to close/exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModelDropdownOpen) {
          setIsModelDropdownOpen(false);
        } else if (onClose) {
          onClose();
        } else if (onNavigateToView) {
          onNavigateToView(user ? 'dashboard' : 'home');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModelDropdownOpen, onClose, onNavigateToView, user]);

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

  // Keyboard shortcut: Enter to send (Shift+Enter for new line), Escape to exit/clear text
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      if (inputText) {
        e.preventDefault();
        handleClearInput();
      }
    }
  };

  // Clear / exit input text
  const handleClearInput = () => {
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  // Delete a specific message from current session
  const handleDeleteMessage = (msgId: string) => {
    if (!currentSession) return;
    const updatedMessages = currentSession.messages.filter((m) => m.id !== msgId);
    const updated = { ...currentSession, messages: updatedMessages };
    setCurrentSession(updated);
    saveChatSession(updated);
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Clear current conversation messages
  const handleClearCurrentThread = () => {
    if (!currentSession) return;
    const updated = { ...currentSession, messages: [] };
    setCurrentSession(updated);
    saveChatSession(updated);
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Edit/reuse a previous message
  const handleEditMessage = (text: string) => {
    setInputText(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
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
      id="ai_assistant_workspace"
      className="w-full h-full min-h-0 flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative box-border m-0 p-0 border-0 rounded-none shadow-none"
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
      <header id="ai_assistant_header" className="sticky top-0 w-full px-3.5 sm:px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 sm:gap-3 shrink-0 z-20">
        {/* Left Side: Navigation & Brand/Session Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Navigation Controls Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(onClose || onNavigateToView) && (
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  else if (onNavigateToView) onNavigateToView(user ? 'dashboard' : 'home');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                title="Return (Esc)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{user ? 'Dashboard' : 'Home'}</span>
              </button>
            )}

            {/* Sidebar History Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer shrink-0 border ${
                isSidebarOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
              title={isSidebarOpen ? 'Hide History' : 'Show History'}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          </div>

          {/* Assistant Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-white leading-tight">
                ARIS AI Assistant
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {currentSession ? currentSession.title : 'Research Intelligence & Advisor'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Engine Selector & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
              title="Select Gemini Engine"
            >
              <Atom className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline font-medium">
                {AI_MODELS.find((m) => m.id === selectedModel)?.name || 'Gemini 3.7 Flash'}
              </span>
              <span className="sm:hidden text-[11px]">
                {selectedModel.includes('pro') ? '3.7 Pro' : '3.7 Flash'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 text-left">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Model Engine
                </div>
                <div className="space-y-1">
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
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                          {m.tag}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size Controls */}
          {onChangeSizeMode && (
            <div className="hidden lg:flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onChangeSizeMode('compact')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  sizeMode === 'compact'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Compact Mode"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeSizeMode('docked')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  sizeMode === 'docked'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Docked Side Panel"
              >
                <PanelRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeSizeMode('window')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  sizeMode === 'window'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Window Mode"
              >
                <AppWindow className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeSizeMode('fullscreen')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  sizeMode === 'fullscreen'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Full Screen Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Clear Current Chat Messages */}
          {currentSession && currentSession.messages && currentSession.messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearCurrentThread}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Clear all messages in this conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => handleCreateNewChat()}
            className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Assistant (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area (Sidebar + Message Thread) */}
      <div className="flex-1 w-full flex overflow-hidden relative min-h-0">
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
              id="ai_assistant_sidebar"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed lg:relative inset-y-0 left-0 z-40 lg:z-10 w-72 sm:w-80 lg:w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden shadow-xl lg:shadow-none min-h-0"
            >
              {/* Search chats */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    placeholder="Search chats..."
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
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-white dark:bg-slate-900">
                <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Conversations ({filteredSessions.length})
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
                          : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{s.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate font-medium">
                            {new Date(s.updatedAt || s.createdAt).toLocaleDateString()}
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
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center Chat Messages Thread */}
        <div id="ai_assistant_chat_area" className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950 w-full min-w-0 min-h-0">
          {/* Scrollable Message List / Welcome Screen */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 custom-scrollbar bg-white dark:bg-slate-950 w-full min-h-0">
            {(!currentSession?.messages || currentSession.messages.length === 0 || (currentSession.messages.length === 1 && currentSession.messages[0].id.startsWith('msg_welcome_'))) && (
              <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 space-y-5">
                {/* Welcome Card - Clean White in Light Mode */}
                <div className="w-full p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-bold w-fit">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Aurenix Research Assistant</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        How can ARIS support your research?
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                        Upload research papers to summarize findings, query experimental data, brainstorm grant-ready hypotheses, or get platform guidance.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-xs"
                    >
                      <Paperclip className="w-4 h-4 text-emerald-200" />
                      <span>Upload Document</span>
                    </button>
                  </div>
                </div>

                {/* Suggested Prompts - 4 clean, concise cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-slate-900 dark:text-slate-100 font-bold">Quick Prompts:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AI_PROMPT_PRESETS.slice(0, 4).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setInputText(preset.prompt);
                          if (preset.requiresUpload && fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                          textareaRef.current?.focus();
                        }}
                        className="p-3.5 rounded-xl bg-white hover:bg-emerald-50/80 dark:bg-slate-900 dark:hover:bg-slate-800 border-2 border-slate-200 hover:border-emerald-500 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer text-left shadow-2xs group"
                      >
                        <span className="truncate text-slate-900 dark:text-white font-bold">{preset.title}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages Thread - full width spread */}
            {currentSession?.messages && (currentSession.messages.length > 1 || (currentSession.messages.length === 1 && !currentSession.messages[0].id.startsWith('msg_welcome_'))) && (
              <div className="space-y-5 sm:space-y-6 w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-1 sm:px-2">
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

                        {/* Message Bubble - Crisp White Background in Light Mode */}
                        <div
                          className={`p-4 sm:p-6 rounded-2xl text-sm md:text-base leading-relaxed w-full ${
                            isUser
                              ? 'bg-emerald-700 text-white rounded-tr-xs shadow-md font-semibold'
                              : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-md'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap text-white !text-white font-medium">{msg.text}</p>
                          ) : (
                            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none w-full text-slate-900 dark:text-slate-100 prose-p:text-slate-900 dark:prose-p:text-slate-100 prose-p:leading-relaxed prose-headings:text-slate-950 dark:prose-headings:text-white prose-headings:font-black prose-strong:text-slate-950 dark:prose-strong:text-white prose-strong:font-bold prose-li:text-slate-900 dark:prose-li:text-slate-200 prose-ul:text-slate-900 dark:prose-ul:text-slate-200 prose-ol:text-slate-900 dark:prose-ol:text-slate-200 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-950 prose-pre:text-slate-800 dark:prose-pre:text-slate-100 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:p-4 prose-code:text-emerald-800 dark:prose-code:text-emerald-300 prose-code:bg-emerald-50 dark:prose-code:bg-emerald-950/60 prose-code:border prose-code:border-emerald-200/60 dark:prose-code:border-emerald-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-blockquote:text-slate-800 dark:prose-blockquote:text-slate-200 prose-blockquote:border-l-4 prose-blockquote:border-emerald-600 prose-blockquote:bg-emerald-50/70 dark:prose-blockquote:bg-emerald-950/30 prose-blockquote:p-3.5 prose-blockquote:rounded-r-xl prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-700 prose-th:text-slate-950 dark:prose-th:text-white prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-td:border prose-td:border-slate-200 dark:border-slate-800 prose-td:text-slate-800 dark:prose-td:text-slate-200 prose-td:bg-white dark:prose-td:bg-slate-900 prose-th:p-3 prose-td:p-3">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {/* Message Meta & Action Bar - Fully Visible in Between Cards */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold px-1">
                          <span className="text-slate-700 dark:text-slate-300">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.model && <span className="text-slate-600 dark:text-slate-400">· {msg.model}</span>}

                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.text, msg.id)}
                              className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer ml-1 font-bold"
                              title="Copy response"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                              <span className="text-slate-700 dark:text-slate-300 font-bold">{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          )}

                          {isUser && (
                            <button
                              type="button"
                              onClick={() => handleEditMessage(msg.text)}
                              className="flex items-center gap-1 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 transition cursor-pointer ml-1 font-bold"
                              title="Edit and reuse this prompt"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                              <span className="text-slate-700 dark:text-slate-300 font-bold">Edit</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="flex items-center gap-1 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition cursor-pointer ml-1 font-bold"
                            title="Delete this message"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-slate-700 dark:text-slate-300 font-bold">Delete</span>
                          </button>
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
                className="flex gap-3 sm:gap-4 w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto justify-start px-1 sm:px-2"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
                  <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-md flex items-center gap-3">
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
            <div className="w-full px-3 sm:px-6 lg:px-8 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 z-10">
              <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto overflow-x-auto custom-scrollbar flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider shrink-0">Quick Ask:</span>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Can you break down the mathematical methodology and statistical significance in detail?')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 border-2 border-slate-200 hover:border-emerald-500 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 transition shrink-0 cursor-pointer shadow-xs"
                >
                  🔬 Methodology & Stats
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('What are the key commercialization bottlenecks and policy recommendations?')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 border-2 border-slate-200 hover:border-emerald-500 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 transition shrink-0 cursor-pointer shadow-xs"
                >
                  💡 Bottlenecks & Policy
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Draft an executive summary abstract suitable for an African clean-energy grant.')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 border-2 border-slate-200 hover:border-emerald-500 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 transition shrink-0 cursor-pointer shadow-xs"
                >
                  📝 Grant Abstract
                </button>
              </div>
            </div>
          )}

          {/* Bottom Input Area */}
          <div id="ai_assistant_composer" className="p-3 sm:p-4 lg:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 w-full shrink-0 z-10">
            <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto flex flex-col gap-2">
              {/* Attachment Preview Chips */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
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
              <div className="relative flex items-end gap-2 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-slate-700 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition p-2 sm:p-2.5 shadow-sm">
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
                  className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
                  title="Attach research PDF, image, or dataset"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask ARIS or attach a paper: 'Summarize key findings', 'Propose hypotheses'..."
                  rows={1}
                  className="flex-1 bg-transparent resize-none border-0 text-sm md:text-base text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 font-medium focus:outline-hidden py-2 px-1.5 max-h-[220px] custom-scrollbar"
                />

                {/* Exit / Clear Text Button */}
                {inputText.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearInput}
                    className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
                    title="Clear / Exit text (Esc)"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
                  className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition cursor-pointer shrink-0 ${
                    isLoading || (!inputText.trim() && attachments.length === 0)
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                  }`}
                  title="Send message (Enter)"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Minimal Clean Hint */}
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold px-1">
                <span className="text-slate-700 dark:text-slate-300">Enter to send · Shift+Enter for new line · Esc to clear text</span>
                <span className="font-mono text-emerald-800 dark:text-emerald-400 font-extrabold">Gemini 3.7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
