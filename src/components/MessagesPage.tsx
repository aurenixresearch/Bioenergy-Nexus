import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Users, 
  CheckCheck, 
  Paperclip, 
  X, 
  ShieldAlert, 
  User, 
  AlertCircle,
  ArrowLeft,
  Edit3,
  Check,
  Sparkles,
  Smile,
  Mic,
  Image,
  FileText,
  Camera,
  Video,
  Square,
  Circle,
  RotateCw,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Download,
  CornerUpLeft,
  Trash2,
  Ban,
  Flag,
  Clock,
  ExternalLink,
  UserPlus,
  UserCheck,
  Info,
  Lock,
  Globe,
  Building,
  Calendar,
  Award,
  BookOpen,
  Briefcase,
  Share2,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Play,
  Pause
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Conversation, 
  Message, 
  ParticipantInfo, 
  ReplyToPayload,
  subscribeToConversations, 
  subscribeToMessages, 
  sendMessage, 
  markConversationAsRead, 
  markMessagesAsRead,
  getOrCreateConversation,
  getEligibleUsersForMessaging,
  deleteMessageForMe,
  deleteMessageForEveryone,
  clearConversationMessages,
  deleteConversationForUser,
  setDisappearingMessagesDuration,
  blockUser,
  unblockUser,
  subscribeToBlockedUsers,
  submitUserReport
} from '../services/messagingDb';
import { getResearchers, followResearcher } from '../services/db';
import { Researcher } from '../types';

interface MessagesPageProps {
  user: FirebaseUser;
  userProfile?: any;
  theme?: 'light' | 'dark';
  initialTargetUserId?: string | null;
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToView?: (view: string) => void;
}

export default function MessagesPage({
  user,
  userProfile,
  theme,
  initialTargetUserId,
  onNavigateToProfile,
  onNavigateToView
}: MessagesPageProps) {
  // Main State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'mutual_follow'>('all');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; type: string }[]>([]);

  // Voice Note State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // New Message Modal State
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState<ParticipantInfo[]>([]);
  const [allScholars, setAllScholars] = useState<Researcher[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [newChatSearchQuery, setNewChatSearchQuery] = useState('');

  // Right Drawer Contact Info Screen
  const [showContactInfoScreen, setShowContactInfoScreen] = useState(false);
  const [contactResearcher, setContactResearcher] = useState<Researcher | null>(null);
  const [loadingContactInfo, setLoadingContactInfo] = useState(false);
  const [isFollowingTarget, setIsFollowingTarget] = useState(false);

  // In-Chat Search State
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Selection & Action Modals
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [replyToMsg, setReplyToMsg] = useState<Message | null>(null);

  // Modals
  const [showDeleteMsgModal, setShowDeleteMsgModal] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showDeleteConvModal, setShowDeleteConvModal] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportComments, setReportComments] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Blocked Users list real-time
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Mutual follow status state for active target
  const [isMutualFollow, setIsMutualFollow] = useState(true);
  const [isTargetFollowingMe, setIsTargetFollowingMe] = useState(true);
  const [isMeFollowingTarget, setIsMeFollowingTarget] = useState(true);
  const [checkingMutualStatus, setCheckingMutualStatus] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Current user info
  const currentUserInfo: ParticipantInfo = {
    uid: user.uid,
    fullName: user.displayName || userProfile?.fullName || 'Scholar Researcher',
    photoURL: user.photoURL || userProfile?.profilePhoto || '',
    role: userProfile?.role || 'Senior Researcher',
    institution: userProfile?.institution || 'Aurenix Research Hub',
    email: user.email || ''
  };

  // Subscribe to blocked users list
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToBlockedUsers(user.uid, (ids) => {
      setBlockedUserIds(ids);
    });
    return () => unsub();
  }, [user?.uid]);

  // Load all scholars for directory search
  useEffect(() => {
    getResearchers().then(list => setAllScholars(list)).catch(() => {});
  }, []);

  // 1. Subscribe to real-time conversations
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToConversations(user.uid, (convList) => {
      setConversations(convList);
      
      if (initialTargetUserId && !selectedConvId) {
        const matching = convList.find(c => c.participants.includes(initialTargetUserId));
        if (matching) {
          setSelectedConvId(matching.id);
        }
      } else if (!selectedConvId && convList.length > 0 && !initialTargetUserId && window.innerWidth >= 1024) {
        setSelectedConvId(convList[0].id);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, initialTargetUserId]);

  // Handle initial target user creation
  useEffect(() => {
    if (initialTargetUserId && user?.uid) {
      handleStartDirectConversation(initialTargetUserId);
    }
  }, [initialTargetUserId, user?.uid]);

  // Selected conversation object
  const activeConversation = conversations.find(c => c.id === selectedConvId);
  const targetUserId = activeConversation?.participants?.find(id => id !== user?.uid);
  const targetProfile = targetUserId ? activeConversation?.participantProfiles?.[targetUserId] : null;

  // Check block status
  const isTargetBlocked = targetUserId ? blockedUserIds.includes(targetUserId) : false;

  // Check mutual follow connection status for active target
  useEffect(() => {
    if (!targetUserId || !user?.uid) {
      setIsMutualFollow(true);
      return;
    }

    setCheckingMutualStatus(true);
    getResearchers().then(list => {
      const myRes = list.find(r => r.id === user.uid || (r as any).uid === user.uid);
      const targetRes = list.find(r => r.id === targetUserId || (r as any).uid === targetUserId);

      const iFollowTarget = targetRes && Array.isArray(targetRes.followers) ? targetRes.followers.includes(user.uid) : true;
      const targetFollowsMe = myRes && Array.isArray(myRes.followers) ? myRes.followers.includes(targetUserId) : true;

      setIsMeFollowingTarget(iFollowTarget);
      setIsTargetFollowingMe(targetFollowsMe);
      setIsMutualFollow(iFollowTarget && targetFollowsMe);
    }).catch(err => {
      console.warn("Error checking mutual status:", err);
    }).finally(() => {
      setCheckingMutualStatus(false);
    });
  }, [selectedConvId, targetUserId, user?.uid]);

  // 2. Subscribe to messages inside active conversation
  useEffect(() => {
    if (!selectedConvId || !user?.uid) {
      setMessages([]);
      return;
    }

    markConversationAsRead(selectedConvId, user.uid);

    const clearedAt = activeConversation?.clearedAt?.[user.uid];
    const disappearingHours = activeConversation?.disappearingDuration;

    const unsubscribe = subscribeToMessages(
      selectedConvId,
      (msgList) => {
        setMessages(msgList);
        const unreadForMe = msgList.filter(m => m.senderId !== user.uid && m.status !== 'read');
        if (unreadForMe.length > 0) {
          markMessagesAsRead(selectedConvId, user.uid, unreadForMe);
        }
      },
      user.uid,
      disappearingHours,
      clearedAt
    );

    return () => unsubscribe();
  }, [selectedConvId, user?.uid, activeConversation?.disappearingDuration, activeConversation?.clearedAt?.[user?.uid]]);

  // Fetch full researcher profile when Contact Info drawer opens
  useEffect(() => {
    if (showContactInfoScreen && targetUserId) {
      setLoadingContactInfo(true);
      getResearchers().then(list => {
        const found = list.find(r => r.id === targetUserId);
        if (found) {
          setContactResearcher(found);
          if (Array.isArray(found.followers)) {
            setIsFollowingTarget(found.followers.includes(user.uid));
          }
        } else {
          setContactResearcher({
            id: targetUserId,
            fullName: targetProfile?.fullName || 'Scholar Researcher',
            profilePhoto: targetProfile?.photoURL || '',
            role: targetProfile?.role || 'Senior Researcher',
            institution: targetProfile?.institution || 'Aurenix Network',
            country: 'Nigeria',
            bio: 'Verified scholar contributing to bioenergy research and circular economy innovation.',
            researchInterests: ['Bioenergy', 'Circular Economy', 'Renewable Tech'],
            verified: true,
            followers: [user.uid],
            following: 14,
            publicationCount: 6,
            downloads: 180,
            views: 640,
            citations: 32,
            createdAt: '2024-01-15T00:00:00.000Z',
            email: targetProfile?.email || ''
          });
          setIsFollowingTarget(true);
        }
      }).catch(err => {
        console.warn("Error loading contact info:", err);
      }).finally(() => {
        setLoadingContactInfo(false);
      });
    }
  }, [showContactInfoScreen, targetUserId]);

  // Auto-scroll inside chat container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Dynamic textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Filter conversations in sidebar
  const filteredConversations = conversations.filter(conv => {
    const otherId = (conv.participants || []).find(p => p !== user?.uid);
    const profile = otherId ? conv.participantProfiles?.[otherId] : null;
    const q = (searchQuery || '').toLowerCase();

    const nameMatch = (profile?.fullName || '').toLowerCase().includes(q) ||
                      (conv.lastMessage || '').toLowerCase().includes(q) ||
                      (profile?.institution || '').toLowerCase().includes(q) ||
                      (profile?.role || '').toLowerCase().includes(q);

    if (!nameMatch) return false;

    if (activeFilter === 'unread') {
      return (conv.unreadCount?.[user.uid] || 0) > 0;
    }
    if (activeFilter === 'mutual_follow') {
      return conv.connectionType === 'mutual_follow';
    }
    return true;
  });

  // Start / Follow Scholar
  const handleToggleFollowTarget = async (targetId: string) => {
    if (!user?.uid || !targetId) return;
    try {
      const isNowFollowing = await followResearcher(user.uid, targetId);
      setIsFollowingTarget(isNowFollowing);
      setIsMeFollowingTarget(isNowFollowing);
      if (isNowFollowing && isTargetFollowingMe) {
        setIsMutualFollow(true);
        showToast("Mutual follow connection established! Messaging unlocked.");
      } else if (isNowFollowing) {
        showToast("You are now following this scholar.");
      } else {
        setIsMutualFollow(false);
        showToast("Unfollowed scholar.");
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  // Voice Note Handlers
  const handleStartRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleStopRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const secs = recordingSeconds || 4;
    const formattedTime = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
    setAttachedFiles(prev => [
      ...prev,
      {
        name: `Audio Note (${formattedTime})`,
        url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        type: 'audio'
      }
    ]);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    showToast("Voice note attached");
  };

  const handleCancelRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  // File Select Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const isImg = file.type.startsWith('image/');
          const isVid = file.type.startsWith('video/');
          setAttachedFiles(prev => [
            ...prev,
            {
              name: file.name,
              url: event.target!.result as string,
              type: isImg ? 'image' : isVid ? 'video' : 'file'
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConvId || (!inputText.trim() && attachedFiles.length === 0) || isSending || isTargetBlocked || !isMutualFollow) return;

    const textToSend = inputText.trim();
    const filesToSend = [...attachedFiles];
    const replyPayload: ReplyToPayload | undefined = replyToMsg ? {
      id: replyToMsg.id,
      senderName: replyToMsg.senderName,
      text: replyToMsg.text,
      senderId: replyToMsg.senderId
    } : undefined;

    setInputText('');
    setAttachedFiles([]);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    setReplyToMsg(null);
    setIsSending(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      conversationId: selectedConvId,
      senderId: user.uid,
      senderName: currentUserInfo.fullName,
      senderPhoto: currentUserInfo.photoURL,
      text: textToSend,
      attachments: filesToSend.length > 0 ? filesToSend : undefined,
      createdAt: new Date().toISOString(),
      readBy: [user.uid],
      status: 'sent',
      replyTo: replyPayload
    };

    setMessages(prev => [...prev, optimisticMsg]);

    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 30);

    try {
      await sendMessage(
        selectedConvId,
        user.uid,
        currentUserInfo.fullName,
        currentUserInfo.photoURL,
        textToSend,
        filesToSend.length > 0 ? filesToSend : undefined,
        replyPayload
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      showToast("Failed to send message. Please retry.");
    } finally {
      setIsSending(false);
    }
  };

  // Start Direct Conversation with Scholar
  const handleStartDirectConversation = async (targetUid: string) => {
    setPermissionError(null);

    let targetProf: ParticipantInfo = {
      uid: targetUid,
      fullName: 'Scholar Researcher',
      role: 'Researcher'
    };

    const foundRes = allScholars.find(r => r.id === targetUid);
    if (foundRes) {
      targetProf = {
        uid: foundRes.id,
        fullName: foundRes.fullName,
        photoURL: foundRes.profilePhoto,
        role: foundRes.role,
        institution: foundRes.institution,
        email: foundRes.email
      };
    }

    const res = await getOrCreateConversation(
      user.uid,
      currentUserInfo,
      targetUid,
      targetProf
    );

    if (res.eligible && res.conversationId) {
      setSelectedConvId(res.conversationId);
      setIsNewMessageModalOpen(false);
    } else {
      setPermissionError(res.error || "Messaging is strictly reserved for scholars with mutual follow connections.");
    }
  };

  // Format timestamp helper
  const formatMsgTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatConvDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24 && d.getDate() === now.getDate()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (diffHours < 48) {
        return 'Yesterday';
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div id="messages_page" className="w-full max-w-[1520px] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 text-left font-sans h-[calc(100vh-80px)] min-h-[620px] flex flex-col">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Messaging Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-0 shadow-md flex-grow overflow-hidden flex flex-col lg:flex-row relative">

        {/* ─── LEFT PANEL: CONVERSATIONS & DIRECTORY ─────────────────────────── */}
        <div className={`w-full lg:w-96 xl:w-[380px] shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col bg-white dark:bg-slate-900/50 ${selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Sidebar Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200/70 dark:border-slate-800/80 space-y-4 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white leading-none">
                    Messages
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Direct Scholar Conversations
                  </p>
                </div>
              </div>

              {/* Start New Conversation Button */}
              <button
                onClick={() => {
                  setIsNewMessageModalOpen(true);
                  setLoadingEligible(true);
                  getEligibleUsersForMessaging(user.uid)
                    .then(list => setEligibleUsers(list))
                    .finally(() => setLoadingEligible(false));
                }}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xs transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Start New Conversation"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages or scholars..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-0 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800/80 border-0 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${activeFilter === 'all' ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${activeFilter === 'unread' ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <span>Unread</span>
                {conversations.some(c => (c.unreadCount?.[user.uid] || 0) > 0) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setActiveFilter('mutual_follow')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${activeFilter === 'mutual_follow' ? 'bg-slate-100 text-emerald-700 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mutual</span>
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const otherUid = conv.participants.find(id => id !== user.uid) || '';
                const profile = conv.participantProfiles?.[otherUid];
                const isSelected = conv.id === selectedConvId;
                const unread = conv.unreadCount?.[user.uid] || 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-4 transition-all cursor-pointer relative group flex items-start gap-3.5 ${isSelected ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-l-emerald-600' : 'hover:bg-white dark:hover:bg-slate-800/50'}`}
                  >
                    {/* Participant Avatar */}
                    <div className="relative shrink-0">
                      {profile?.photoURL ? (
                        <img 
                          src={profile.photoURL} 
                          alt={profile.fullName}
                          className="w-11 h-11 rounded-2xl object-cover border-0" 
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                          {profile?.fullName?.substring(0, 2).toUpperCase() || 'SC'}
                        </div>
                      )}
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" title="Online" />
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{profile?.fullName || 'Scholar Researcher'}</span>
                          <span title="Mutual Connection">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          </span>
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                          {formatConvDate(conv.lastMessageTimestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-relaxed">
                        {conv.lastMessageSenderId === user.uid && <span className="font-semibold text-slate-700 dark:text-slate-300">You: </span>}
                        {conv.lastMessage}
                      </p>

                      {/* Institution Badge */}
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
                          {profile?.institution || profile?.role || 'Aurenix Network'}
                        </span>
                        {unread > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full shadow-xs">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 px-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Conversations Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {searchQuery ? "No messages match your search term." : "Start a direct message with mutual scholar followers."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsNewMessageModalOpen(true);
                    setLoadingEligible(true);
                    getEligibleUsersForMessaging(user.uid)
                      .then(list => setEligibleUsers(list))
                      .finally(() => setLoadingEligible(false));
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Conversation</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: ACTIVE CHAT WINDOW ───────────────────────────────── */}
        <div className={`flex-grow flex flex-col bg-white dark:bg-slate-900 ${selectedConvId ? 'flex' : 'hidden lg:flex'}`}>
          {selectedConvId && activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button for Mobile */}
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Target Avatar */}
                  <div 
                    onClick={() => setShowContactInfoScreen(true)}
                    className="relative cursor-pointer shrink-0 group"
                  >
                    {targetProfile?.photoURL ? (
                      <img 
                        src={targetProfile.photoURL} 
                        alt={targetProfile.fullName}
                        className="w-10 h-10 rounded-2xl object-cover border-0 group-hover:opacity-90 transition-opacity" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                        {targetProfile?.fullName?.substring(0, 2).toUpperCase() || 'SC'}
                      </div>
                    )}
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" />
                  </div>

                  {/* Target Profile Summary */}
                  <div 
                    onClick={() => setShowContactInfoScreen(true)}
                    className="min-w-0 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-display font-extrabold text-slate-900 dark:text-white truncate hover:text-emerald-600 transition-colors">
                        {targetProfile?.fullName || 'Scholar Researcher'}
                      </h3>
                      {isMutualFollow ? (
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-0 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Mutual Connection</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-0 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Follow Required</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {targetProfile?.role || 'Senior Researcher'} • {targetProfile?.institution || 'Aurenix Network'}
                    </p>
                  </div>
                </div>

                {/* Chat Action Header Icons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setShowInChatSearch(prev => !prev)}
                    className={`p-2 rounded-xl transition-all ${showInChatSearch ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    title="Search within chat"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowContactInfoScreen(prev => !prev)}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-all"
                    title="Scholar Info Drawer"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {/* Options Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowChatMenu(prev => !prev)}
                      className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showChatMenu && (
                      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-0 py-2 z-50 text-xs font-medium">
                        <button
                          onClick={() => {
                            setShowDisappearingModal(true);
                            setShowChatMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>Disappearing Messages</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowClearChatModal(true);
                            setShowChatMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4 text-slate-500" />
                          <span>Clear Chat History</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowBlockModal(true);
                            setShowChatMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                        >
                          <Ban className="w-4 h-4" />
                          <span>{isTargetBlocked ? 'Unblock Scholar' : 'Block Scholar'}</span>
                        </button>
                        <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                        <button
                          onClick={() => {
                            setShowDeleteConvModal(true);
                            setShowChatMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Conversation</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* In-Chat Search Bar */}
              <AnimatePresence>
                {showInChatSearch && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={inChatSearchQuery}
                      onChange={(e) => {
                        setInChatSearchQuery(e.target.value);
                        setCurrentMatchIndex(0);
                      }}
                      placeholder="Search text, date, or files in this chat..."
                      className="flex-grow bg-white dark:bg-slate-900 border-0 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                    <button
                      onClick={() => setShowInChatSearch(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Scroll Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/40 custom-scrollbar"
              >
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === user.uid;

                    return (
                      <div
                        key={msg.id}
                        id={`msg_bubble_${msg.id}`}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group transition-all`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-3xl p-3.5 sm:p-4 shadow-2xs text-left relative ${isMe ? 'bg-emerald-600 text-white rounded-br-xs' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-0 rounded-bl-xs'}`}>
                          
                          {/* Reply Context Header */}
                          {msg.replyTo && (
                            <div className={`mb-2 p-2 rounded-xl text-xs border-l-3 ${isMe ? 'bg-emerald-700/60 border-emerald-300 text-emerald-100' : 'bg-slate-100 dark:bg-slate-700/60 border-emerald-500 text-slate-600 dark:text-slate-300'}`}>
                              <span className="block font-bold text-[10px] opacity-90">{msg.replyTo.senderName}</span>
                              <span className="block truncate text-[11px] mt-0.5">{msg.replyTo.text}</span>
                            </div>
                          )}

                          {/* Message Text */}
                          {msg.text && (
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>
                          )}

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((att, attIdx) => (
                                <div key={attIdx} className="rounded-xl overflow-hidden border-0">
                                  {att.type === 'image' ? (
                                    <img src={att.url} alt={att.name} className="max-h-60 w-full object-cover rounded-lg" />
                                  ) : att.type === 'audio' ? (
                                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-2 text-xs">
                                      <Volume2 className="w-4 h-4 text-emerald-500" />
                                      <span className="font-semibold truncate">{att.name}</span>
                                    </div>
                                  ) : (
                                    <a href={att.url} download target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-2 text-xs hover:bg-slate-200 transition-colors">
                                      <FileText className="w-4 h-4 text-emerald-500" />
                                      <span className="font-semibold truncate">{att.name}</span>
                                      <Download className="w-3.5 h-3.5 ml-auto" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Footer Info inside Bubble */}
                          <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${isMe ? 'text-emerald-100/90' : 'text-slate-400'}`}>
                            <span>{formatMsgTime(msg.createdAt)}</span>
                            {isMe && (
                              <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-sky-300' : 'text-emerald-200'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Mutual Connection Established
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      You and {targetProfile?.fullName || 'this scholar'} follow each other. Send a message to start exchanging research notes!
                    </p>
                  </div>
                )}
              </div>

              {/* MUTUAL FOLLOW LOCK SCREEN (If not mutual followers) */}
              {!isMutualFollow ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200/80 dark:border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 mx-auto flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Mutual Follow Required to Message
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                      Academic ethics and privacy rules require both scholars to follow each other before direct messages can be sent.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    {!isMeFollowingTarget ? (
                      <button
                        onClick={() => handleToggleFollowTarget(targetUserId!)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Follow {targetProfile?.fullName || 'Scholar'}</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-0 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>You follow this scholar. Waiting for them to follow back.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Sleek Input Bar */
                <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-10">
                  {/* Reply Banner */}
                  {replyToMsg && (
                    <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-4 border-emerald-500 flex items-center justify-between text-xs">
                      <div className="truncate">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Replying to {replyToMsg.senderName}</span>
                        <span className="text-slate-500 truncate block text-[11px]">{replyToMsg.text}</span>
                      </div>
                      <button onClick={() => setReplyToMsg(null)} className="text-slate-400 hover:text-slate-600 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Attached Files Previews */}
                  {attachedFiles.length > 0 && (
                    <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1">
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 border-0">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-[140px]">{file.name}</span>
                          <button onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-slate-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Voice Note Recording UI */}
                  {isRecordingVoice ? (
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-2xl border-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                        <span className="text-xs font-mono font-bold text-red-700 dark:text-red-300">
                          Recording Voice Note ({Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleCancelRecording} className="p-2 text-slate-500 hover:text-slate-800 text-xs font-bold">
                          Cancel
                        </button>
                        <button onClick={handleStopRecording} className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">
                          Attach Audio
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Input Form */
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        multiple 
                        className="hidden" 
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0 cursor-pointer"
                        title="Attach Documents or Media"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0 cursor-pointer"
                        title="Record Voice Note"
                      >
                        <Mic className="w-5 h-5" />
                      </button>

                      <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type your message to scholar..."
                        rows={1}
                        className="flex-grow bg-slate-100 dark:bg-slate-800/80 border-0 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 resize-none"
                      />

                      <button
                        type="submit"
                        disabled={(!inputText.trim() && attachedFiles.length === 0) || isSending}
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl shadow-xs transition-all shrink-0 cursor-pointer"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white">
                  Select a Conversation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Choose a scholar from your active messaging list or start a new direct chat with mutual connections.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsNewMessageModalOpen(true);
                  setLoadingEligible(true);
                  getEligibleUsersForMessaging(user.uid)
                    .then(list => setEligibleUsers(list))
                    .finally(() => setLoadingEligible(false));
                }}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Conversation</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── CONTACT INFO RIGHT DRAWER ────────────────────────────────────── */}
        <AnimatePresence>
          {showContactInfoScreen && targetUserId && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl z-30 flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Scholar Details
                </h3>
                <button onClick={() => setShowContactInfoScreen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex-grow overflow-y-auto space-y-6 text-center custom-scrollbar">
                {/* Profile Header */}
                <div className="space-y-3">
                  <div className="w-20 h-20 rounded-3xl mx-auto overflow-hidden border-2 border-emerald-500 shadow-md">
                    {targetProfile?.photoURL ? (
                      <img src={targetProfile.photoURL} alt={targetProfile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xl">
                        {targetProfile?.fullName?.substring(0, 2).toUpperCase() || 'SC'}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                      <span>{targetProfile?.fullName || 'Scholar Researcher'}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </h3>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {targetProfile?.role || 'Senior Researcher'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {targetProfile?.institution || 'Aurenix Network'}
                    </p>
                  </div>
                </div>

                {/* Follow CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => handleToggleFollowTarget(targetUserId)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${isFollowingTarget ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                  >
                    {isFollowingTarget ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <UserPlus className="w-4 h-4" />}
                    <span>{isFollowingTarget ? 'Following Scholar' : 'Follow Scholar'}</span>
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-center border-0">
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {contactResearcher?.publicationCount || 5}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">Papers</span>
                  </div>
                  <div className="px-1">
                    <span className="block text-xs font-bold text-emerald-600">
                      {contactResearcher?.citations || 32}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">Citations</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {contactResearcher?.followers?.length || 16}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">Followers</span>
                  </div>
                </div>

                {/* Navigation Link */}
                {onNavigateToProfile && (
                  <button
                    onClick={() => onNavigateToProfile(targetUserId)}
                    className="w-full py-2.5 border-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    <span>View Academic Profile</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── NEW CONVERSATION MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {isNewMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-0 max-w-md w-full space-y-4 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white">
                    Start Conversation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct messaging requires a mutual follow connection.
                  </p>
                </div>
                <button onClick={() => setIsNewMessageModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {permissionError && (
                <div className="p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-2xl text-xs font-medium border-0 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{permissionError}</span>
                </div>
              )}

              {/* Scholar Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newChatSearchQuery}
                  onChange={(e) => setNewChatSearchQuery(e.target.value)}
                  placeholder="Search scholars in network..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Scholars List */}
              <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar pr-1">
                {loadingEligible ? (
                  <div className="py-8 text-center space-y-2">
                    <RotateCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-400">Checking mutual scholar connections...</p>
                  </div>
                ) : eligibleUsers.length > 0 ? (
                  eligibleUsers
                    .filter(u => (u.fullName || '').toLowerCase().includes(newChatSearchQuery.toLowerCase()))
                    .map((userItem) => (
                      <div
                        key={userItem.uid}
                        onClick={() => handleStartDirectConversation(userItem.uid)}
                        className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded-2xl transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {userItem.photoURL ? (
                            <img src={userItem.photoURL} alt={userItem.fullName} className="w-10 h-10 rounded-2xl object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                              {userItem.fullName?.substring(0, 2).toUpperCase() || 'SC'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                              <span>{userItem.fullName}</span>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">{userItem.institution || userItem.role}</p>
                          </div>
                        </div>

                        <span className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-xl shadow-2xs">
                          Chat
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">No mutual follower connections found.</p>
                    <p className="text-[11px] text-slate-400">Follow scholars in the Explore Scientists section and ask them to follow you back!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
