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
  RotateCcw
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
  markMessagesAsDelivered,
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
import { getResearchers } from '../services/db';
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'mutual_follow' | 'collaboration'>('all');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<'smileys' | 'nature' | 'food' | 'objects'>('smileys');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  
  // Voice Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    const secs = recordingSeconds || 3;
    const formattedTime = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
    setAttachedFiles(prev => [
      ...prev,
      {
        name: `Voice Note (${formattedTime})`,
        url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        type: 'audio'
      }
    ]);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
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

  // Camera & Webcam Video Recorder Modal State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoRecordingTime, setVideoRecordingTime] = useState(0);
  const [cameraPreview, setCameraPreview] = useState<{ type: 'image' | 'video'; url: string; name: string } | null>(null);

  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (webcamVideoRef.current && cameraStream) {
      webcamVideoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isCameraModalOpen, cameraPreview]);

  const openCameraModal = async () => {
    setShowAttachmentMenu(false);
    setIsCameraModalOpen(true);
    setCameraError(null);
    setCameraPreview(null);
    setCameraMode('photo');
    setIsVideoRecording(false);
    setVideoRecordingTime(0);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      setCameraStream(stream);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(err.message || "Could not access webcam/camera. Please check browser permissions.");
    }
  };

  const closeCameraModal = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraModalOpen(false);
    setCameraError(null);
    setCameraPreview(null);
    setIsVideoRecording(false);
    setVideoRecordingTime(0);
  };

  const takeSnapshot = () => {
    if (!webcamVideoRef.current) return;
    const video = webcamVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCameraPreview({
        type: 'image',
        url: dataUrl,
        name: `Webcam_Photo_${Date.now()}.jpg`
      });
    }
  };

  const startRecordingVideo = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';
      const recorder = new MediaRecorder(cameraStream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        setCameraPreview({
          type: 'video',
          url: videoUrl,
          name: `Webcam_Video_${Date.now()}.webm`
        });
      };
      recorder.start();
      setIsVideoRecording(true);
      setVideoRecordingTime(0);
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      videoTimerRef.current = setInterval(() => {
        setVideoRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to start MediaRecorder:", err);
      setCameraError("Video recording failed or is not supported on this browser.");
    }
  };

  const stopRecordingVideo = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    setIsVideoRecording(false);
  };

  const attachCameraCapture = () => {
    if (!cameraPreview) return;
    setAttachedFiles(prev => [
      ...prev,
      {
        name: cameraPreview.name,
        url: cameraPreview.url,
        type: cameraPreview.type
      }
    ]);
    closeCameraModal();
  };
  
  // New Message Modal State
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState<ParticipantInfo[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Feature 1: Contact Information Screen
  const [showContactInfoScreen, setShowContactInfoScreen] = useState(false);
  const [contactResearcher, setContactResearcher] = useState<Researcher | null>(null);
  const [loadingContactInfo, setLoadingContactInfo] = useState(false);
  const [isFollowingTarget, setIsFollowingTarget] = useState(false);

  // Feature 3: Search Within a Chat
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Feature 4: Select Messages
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [contextMenuMsg, setContextMenuMsg] = useState<{ msg: Message; x: number; y: number } | null>(null);

  // Feature 5: Reply to Specific Message
  const [replyToMsg, setReplyToMsg] = useState<Message | null>(null);

  // Feature 6 & 7 & 8: Deletion Modals
  const [showDeleteMsgModal, setShowDeleteMsgModal] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showDeleteConvModal, setShowDeleteConvModal] = useState(false);

  // Feature 9: Disappearing Messages
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);

  // Feature 10 & 11: Block & Report Modals
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportComments, setReportComments] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Feature 10: Blocked Users list real-time
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Feature 12: Chat Header Menu
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Mobile long press timer ref
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Current user info for messaging
  const currentUserInfo: ParticipantInfo = {
    uid: user.uid,
    fullName: user.displayName || userProfile?.fullName || 'Scholar Researcher',
    photoURL: user.photoURL || userProfile?.profilePhoto || '',
    role: userProfile?.role || 'Researcher',
    institution: userProfile?.institution || 'Aurenix Research Network',
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

  // 2. Subscribe to messages when selected conversation changes or disappearing/clear timestamps change
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

  // Fetch full researcher profile when Contact Info screen opens
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
            role: targetProfile?.role || 'Researcher',
            institution: targetProfile?.institution || 'Aurenix Network',
            country: 'Global',
            bio: 'Active scholar collaborating on bioenergy and environmental research within Aurenix.',
            researchInterests: ['Bioenergy', 'Renewable Resources', 'Sustainability'],
            verified: true,
            followers: [user.uid],
            following: 12,
            publicationCount: 5,
            downloads: 140,
            views: 520,
            citations: 28,
            createdAt: '2024-01-15T00:00:00.000Z',
            email: targetProfile?.email || ''
          });
          setIsFollowingTarget(true);
        }
      }).catch(err => {
        console.warn("Error loading contact researcher profile:", err);
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [inputText]);

  // Search matches inside active conversation
  const inChatMatches = messages.filter(m => {
    if (!inChatSearchQuery.trim()) return false;
    const q = (inChatSearchQuery || '').toLowerCase();
    const textMatch = (m.text || '').toLowerCase().includes(q);
    const dateMatch = new Date(m.createdAt).toLocaleDateString().toLowerCase().includes(q);
    const fileMatch = m.attachments?.some(att => (att.name || '').toLowerCase().includes(q));
    return textMatch || dateMatch || fileMatch;
  });

  // Scroll to search match or message
  const jumpToMessage = (messageId: string) => {
    const el = document.getElementById(`msg_bubble_${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2');
      }, 2000);
    }
  };

  useEffect(() => {
    if (inChatMatches.length > 0 && currentMatchIndex < inChatMatches.length) {
      jumpToMessage(inChatMatches[currentMatchIndex].id);
    }
  }, [currentMatchIndex, inChatSearchQuery]);

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
    if (activeFilter === 'collaboration') {
      return conv.connectionType === 'collaboration';
    }
    return true;
  });

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

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConvId || (!inputText.trim() && attachedFiles.length === 0) || isSending || isTargetBlocked) return;

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

    // Optimistic message update for instant UI responsiveness
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
    }, 40);

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
      // Remove temporary optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  // Open New Message Modal
  const handleOpenNewMessageModal = async () => {
    setIsNewMessageModalOpen(true);
    setLoadingEligible(true);
    setPermissionError(null);

    try {
      const eligible = await getEligibleUsersForMessaging(user.uid);
      setEligibleUsers(eligible);
    } catch (err) {
      console.error("Failed to load eligible scholars:", err);
    } finally {
      setLoadingEligible(false);
    }
  };

  // Start Direct Conversation
  const handleStartDirectConversation = async (targetUid: string) => {
    setPermissionError(null);

    let targetProf: ParticipantInfo = {
      uid: targetUid,
      fullName: 'Scholar',
      role: 'Researcher'
    };

    const researchers = await getResearchers();
    const foundRes = researchers.find(r => r.id === targetUid);
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
      setPermissionError(res.error || "Messaging is restricted between non-connected users.");
    }
  };

  // Selection mode helpers
  const toggleSelectMsg = (msgId: string) => {
    if (selectedMsgIds.includes(msgId)) {
      const updated = selectedMsgIds.filter(id => id !== msgId);
      setSelectedMsgIds(updated);
      if (updated.length === 0) setIsSelectionMode(false);
    } else {
      setSelectedMsgIds([...selectedMsgIds, msgId]);
      setIsSelectionMode(true);
    }
  };

  const handleTouchStartMessage = (msgId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      toggleSelectMsg(msgId);
    }, 500);
  };

  const handleTouchEndMessage = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Copy selected messages
  const handleCopySelected = () => {
    const selectedMsgs = messages.filter(m => selectedMsgIds.includes(m.id));
    const combinedText = selectedMsgs.map(m => `[${m.senderName}]: ${m.text}`).join('\n');
    navigator.clipboard.writeText(combinedText);
    showToast(`${selectedMsgs.length} message(s) copied to clipboard.`);
    setIsSelectionMode(false);
    setSelectedMsgIds([]);
  };

  // Forward selected message
  const handleForwardSelected = () => {
    const selectedMsgs = messages.filter(m => selectedMsgIds.includes(m.id));
    const textToForward = selectedMsgs.map(m => m.text).join('\n');
    setInputText(`[Forwarded]: ${textToForward}`);
    setIsSelectionMode(false);
    setSelectedMsgIds([]);
    showToast("Message loaded into composer ready to forward.");
  };

  // Delete message handlers
  const handleConfirmDeleteMessage = async (deleteForEveryone: boolean) => {
    if (!selectedConvId) return;
    for (const msgId of selectedMsgIds) {
      if (deleteForEveryone) {
        await deleteMessageForEveryone(selectedConvId, msgId, user.uid);
      } else {
        await deleteMessageForMe(selectedConvId, msgId, user.uid);
      }
    }
    showToast(deleteForEveryone ? "Deleted for everyone." : "Deleted for me.");
    setShowDeleteMsgModal(false);
    setIsSelectionMode(false);
    setSelectedMsgIds([]);
  };

  // Clear Chat Handler
  const handleConfirmClearChat = async () => {
    if (!selectedConvId) return;
    await clearConversationMessages(selectedConvId, user.uid);
    showToast("Chat history cleared.");
    setShowClearChatModal(false);
  };

  // Delete Conversation Handler
  const handleConfirmDeleteConv = async () => {
    if (!selectedConvId) return;
    await deleteConversationForUser(selectedConvId, user.uid);
    showToast("Conversation deleted.");
    setSelectedConvId(null);
    setShowDeleteConvModal(false);
  };

  // Disappearing Messages Handler
  const handleSetDisappearing = async (hours: number) => {
    if (!selectedConvId) return;
    await setDisappearingMessagesDuration(selectedConvId, hours, user.uid);
    showToast(hours === 0 ? "Disappearing messages turned off." : `Disappearing duration set to ${hours} hours.`);
    setShowDisappearingModal(false);
  };

  // Block User Handler
  const handleConfirmBlockUser = async () => {
    if (!targetUserId) return;
    if (isTargetBlocked) {
      await unblockUser(user.uid, targetUserId);
      showToast(`${targetProfile?.fullName || 'User'} unblocked.`);
    } else {
      await blockUser(user.uid, targetUserId);
      showToast(`${targetProfile?.fullName || 'User'} blocked.`);
    }
    setShowBlockModal(false);
  };

  // Report User Handler
  const handleSubmitReport = async () => {
    if (!targetUserId) return;
    setIsSubmittingReport(true);
    await submitUserReport({
      reporterId: user.uid,
      reporterName: currentUserInfo.fullName,
      reportedUserId: targetUserId,
      reportedUserName: targetProfile?.fullName || 'Scholar',
      conversationId: selectedConvId || undefined,
      reason: reportReason,
      comments: reportComments
    });
    setIsSubmittingReport(false);
    setShowReportModal(false);
    setReportComments('');
    showToast("Report submitted successfully for admin review.");
  };

  // Format relative timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-2 sm:py-4 relative" id="messages_workspace_container">
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-emerald-600 px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden flex h-[calc(100vh-100px)] min-h-[580px] relative">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: CONVERSATIONS LIST                                            */}
        {/* ========================================================================= */}
        <div className={`w-full lg:w-80 xl:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-white ${
          selectedConvId ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 space-y-3" style={{ backgroundColor: '#ffffff', borderStyle: 'none' }}>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#000000' }}>
                Messages
              </h1>

              <button
                onClick={handleOpenNewMessageModal}
                className="p-2 bg-emerald-50 text-emerald-800 rounded-full transition-all cursor-pointer border border-emerald-200/60"
                title="New Message"
                id="btn_new_message"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Feature 2: Search Conversations */}
            <div className="relative" style={{ backgroundColor: 'transparent', borderStyle: 'none' }}>
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, institution, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-slate-200 focus:border-emerald-500 rounded-full text-xs placeholder:text-slate-200 focus:outline-none transition-all shadow-2xs"
                style={{ backgroundColor: '#063411', color: '#ffffff', fontFamily: 'Verdana' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 "
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pt-0.5 pb-0.5" style={{ backgroundColor: 'transparent' }}>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'mutual_follow', label: 'Mutual' },
                  { id: 'collaboration', label: 'Collaborators' },
                ].map((tab, idx) => {
                  const isSelected = activeFilter === tab.id;
                  
                  // Style matches CSS selectors 2, 3, 4
                  let btnStyle: React.CSSProperties = {};
                  if (idx === 1) {
                    btnStyle = { backgroundColor: '#000000' };
                  } else if (idx === 2) {
                    btnStyle = { backgroundColor: '#000000', color: '#ffffff' };
                  } else if (idx === 3) {
                    btnStyle = { backgroundColor: '#000000', color: '#ffffff' };
                  }

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id as any)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isSelected && idx === 0
                          ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 '
                      }`}
                      style={btnStyle}
                    >
                      <p 
                        className="m-0 inline" 
                        style={{ 
                          color: idx === 1 ? '#ffffff' : idx === 2 ? '#ffffff' : idx === 3 ? '#ffffff' : isSelected ? '#ffffff' : idx === 0 ? '#ffffff' : 'inherit' 
                        }}
                      >
                        {tab.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-white">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const otherUid = conv.participants.find(p => p !== user.uid) || '';
                const prof = conv.participantProfiles?.[otherUid];
                const unread = conv.unreadCount?.[user.uid] || 0;
                const isSelected = conv.id === selectedConvId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setShowContactInfoScreen(false);
                      setIsSelectionMode(false);
                      setSelectedMsgIds([]);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 relative border ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 text-slate-900 shadow-2xs'
                        : 'bg-white  border-slate-100 text-slate-900'
                    }`}
                    id={`conv_item_${conv.id}`}
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      {prof?.photoURL ? (
                        <img
                          src={prof.photoURL}
                          alt={prof.fullName}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-200">
                          {prof?.fullName?.charAt(0) || <User className="w-5 h-5" />}
                        </div>
                      )}

                      <span 
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500"
                        title={conv.connectionType === 'mutual_follow' ? 'Mutual Follow' : 'Collaborator'}
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs truncate ${unread > 0 ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {prof?.fullName || 'Scholar'}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatTime(conv.lastMessageTimestamp)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${unread > 0 ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                          {conv.lastMessage || 'Started a conversation'}
                        </p>

                        {/* Unread Pill */}
                        {unread > 0 && (
                          <span className="w-5 h-5 bg-emerald-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {searchQuery ? 'No messages found' : 'No conversations yet.'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Connect with scholars via mutual follows or alliance applications to start chatting.
                </p>
                <button
                  onClick={handleOpenNewMessageModal}
                  className="px-4 py-2 bg-emerald-600  text-white rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: CHAT AREA OR CONTACT INFO SCREEN                             */}
        {/* ========================================================================= */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 relative ${
          !selectedConvId ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Feature 1: FULL-PAGE CONTACT INFORMATION SCREEN */}
          {showContactInfoScreen && targetUserId ? (
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar z-30">
              {/* Contact Info Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900 sticky top-0 z-20">
                <button
                  onClick={() => setShowContactInfoScreen(false)}
                  className="p-2 text-slate-600 dark:text-slate-300  dark: rounded-full transition-all cursor-pointer"
                  title="Back to conversation"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Contact Info
                </h2>
              </div>

              {loadingContactInfo ? (
                <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
                  Loading scholar profile details...
                </div>
              ) : (
                <div className="p-6 max-w-2xl mx-auto w-full space-y-6">
                  {/* Hero Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-6 text-center space-y-4">
                    <div className="relative w-24 h-24 mx-auto">
                      {contactResearcher?.profilePhoto ? (
                        <img
                          src={contactResearcher.profilePhoto}
                          alt={contactResearcher.fullName}
                          className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-3xl border-2 border-emerald-500">
                          {contactResearcher?.fullName?.charAt(0) || 'S'}
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Online" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {contactResearcher?.fullName || targetProfile?.fullName}
                      </h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        @{contactResearcher?.id || 'scholar'} • {contactResearcher?.role || targetProfile?.role || 'Researcher'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {contactResearcher?.institution || targetProfile?.institution} • {contactResearcher?.country || 'Global'}
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setIsFollowingTarget(!isFollowingTarget);
                          showToast(isFollowingTarget ? "Unfollowed scholar" : "Following scholar");
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isFollowingTarget
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 '
                            : 'bg-emerald-600  text-white'
                        }`}
                      >
                        {isFollowingTarget ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {isFollowingTarget ? 'Following' : 'Follow'}
                      </button>

                      <button
                        onClick={() => setShowContactInfoScreen(false)}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>

                      {onNavigateToProfile && (
                        <button
                          onClick={() => {
                            setShowContactInfoScreen(false);
                            onNavigateToProfile(targetUserId);
                          }}
                          className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold  dark: transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Full Profile
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bio & Interests */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Biography
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {contactResearcher?.bio || 'Scholar actively participating in collaborative research publications and bioenergy initiatives.'}
                    </p>

                    {contactResearcher?.researchInterests && contactResearcher.researchInterests.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                          Research Interests
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {contactResearcher.researchInterests.map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium rounded-lg">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-center border border-slate-200/60 dark:border-slate-800">
                      <span className="block text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {contactResearcher?.followers?.length || 14}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Followers</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-center border border-slate-200/60 dark:border-slate-800">
                      <span className="block text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {contactResearcher?.following || 8}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Following</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-center border border-slate-200/60 dark:border-slate-800">
                      <span className="block text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {contactResearcher?.publicationCount || 4}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Published Research</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-center border border-slate-200/60 dark:border-slate-800">
                      <span className="block text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        2
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Alliances Joined</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-center border border-slate-200/60 dark:border-slate-800">
                      <span className="block text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        3
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Collaborations</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-center border border-slate-200/60 dark:border-slate-800">
                      <span className="block text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {contactResearcher?.citations || 12}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Citations</span>
                    </div>
                  </div>

                  {/* Account Meta & Danger Actions */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Joined Aurenix:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatTime(contactResearcher?.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Last Active:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active today</span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          setShowContactInfoScreen(false);
                          setShowBlockModal(true);
                        }}
                        className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400  dark: rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ban className="w-4 h-4" />
                        {isTargetBlocked ? 'Unblock User' : 'Block User'}
                      </button>

                      <button
                        onClick={() => {
                          setShowContactInfoScreen(false);
                          setShowReportModal(true);
                        }}
                        className="px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400  dark: rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Flag className="w-4 h-4" />
                        Report User
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedConvId && activeConversation ? (
            <>
              {/* Feature 4: Selection Toolbar overlay if selection mode active */}
              {isSelectionMode ? (
                <div className="px-4 py-3 bg-emerald-700 text-white flex items-center justify-between z-20 shadow-md">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedMsgIds([]);
                      }}
                      className="p-1  rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold">
                      {selectedMsgIds.length} Selected
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedMsgIds.length === 1 && (
                      <button
                        onClick={() => {
                          const msg = messages.find(m => m.id === selectedMsgIds[0]);
                          if (msg) setReplyToMsg(msg);
                          setIsSelectionMode(false);
                          setSelectedMsgIds([]);
                        }}
                        className="p-1.5  rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Reply"
                      >
                        <CornerUpLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Reply</span>
                      </button>
                    )}

                    <button
                      onClick={handleCopySelected}
                      className="p-1.5  rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>

                    <button
                      onClick={handleForwardSelected}
                      className="p-1.5  rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Forward"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Forward</span>
                    </button>

                    <button
                      onClick={() => setShowDeleteMsgModal(true)}
                      className="p-1.5 bg-rose-600  rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Chat Header */
                <div className="px-4 py-3 flex items-center justify-between bg-white z-10 border-none" style={{ borderStyle: 'none', backgroundColor: '#ffffff' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setSelectedConvId(null)}
                      className="lg:hidden p-2 text-slate-600 rounded-full cursor-pointer"
                      title="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Profile Photo - Click opens Contact Info */}
                    <button
                      onClick={() => setShowContactInfoScreen(true)}
                      className="flex items-center gap-3 min-w-0 text-left border-0 bg-transparent p-0 cursor-pointer"
                      title="View Contact Info"
                    >
                      {targetProfile?.photoURL ? (
                        <img
                          src={targetProfile.photoURL}
                          alt={targetProfile.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {targetProfile?.fullName?.charAt(0) || <User className="w-4 h-4" />}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-900 truncate">
                            {targetProfile?.fullName || 'Scholar'}
                          </h2>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Connected" />
                        </div>

                        <p className="text-[11px] text-slate-500 truncate">
                          {targetProfile?.institution || targetProfile?.role || 'Aurenix Scholar'}
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Header Menu & In-Chat Search toggle */}
                  <div className="flex items-center gap-1 relative">
                    <button
                      onClick={() => setShowInChatSearch(!showInChatSearch)}
                      className="p-2 text-slate-600 rounded-full cursor-pointer"
                      title="Search in Chat"
                    >
                      <Search className="w-4 h-4" />
                    </button>

                    {/* Chat Menu Dropdown */}
                    <button
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="p-2 text-slate-600 rounded-full cursor-pointer"
                      title="Chat Menu"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {showChatMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 w-52 z-40 text-xs"
                        >
                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setShowContactInfoScreen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200  dark: cursor-pointer font-medium"
                          >
                            <Info className="w-4 h-4 text-emerald-600" />
                            Contact Info
                          </button>

                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setShowInChatSearch(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200  dark: cursor-pointer font-medium"
                          >
                            <Search className="w-4 h-4 text-emerald-600" />
                            Search in Chat
                          </button>

                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setIsSelectionMode(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200  dark: cursor-pointer font-medium"
                          >
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                            Select Messages
                          </button>

                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setShowDisappearingModal(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200  dark: cursor-pointer font-medium"
                          >
                            <Clock className="w-4 h-4 text-emerald-600" />
                            Disappearing Messages
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setShowClearChatModal(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200  dark: cursor-pointer font-medium"
                          >
                            <RotateCcw className="w-4 h-4 text-amber-500" />
                            Clear Chat
                          </button>

                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setShowDeleteConvModal(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200  dark: cursor-pointer font-medium"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                            Delete Chat
                          </button>

                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setShowBlockModal(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200  dark: cursor-pointer font-medium"
                          >
                            <Ban className="w-4 h-4 text-rose-500" />
                            {isTargetBlocked ? 'Unblock User' : 'Block User'}
                          </button>

                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setShowReportModal(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200  dark: cursor-pointer font-medium"
                          >
                            <Flag className="w-4 h-4 text-amber-500" />
                            Report User
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Feature 3: Floating In-Chat Search Bar */}
              <AnimatePresence>
                {showInChatSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 z-10"
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      placeholder="Search keywords, dates, files in chat..."
                      value={inChatSearchQuery}
                      onChange={(e) => {
                        setInChatSearchQuery(e.target.value);
                        setCurrentMatchIndex(0);
                      }}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    />

                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 px-1">
                      {inChatMatches.length > 0 ? `${currentMatchIndex + 1} of ${inChatMatches.length}` : 'No matches'}
                    </span>

                    <button
                      onClick={() => setCurrentMatchIndex(prev => (prev > 0 ? prev - 1 : inChatMatches.length - 1))}
                      disabled={inChatMatches.length === 0}
                      className="p-1  dark: rounded-full text-slate-600 dark:text-slate-300 disabled:opacity-40"
                      title="Previous Match"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setCurrentMatchIndex(prev => (prev < inChatMatches.length - 1 ? prev + 1 : 0))}
                      disabled={inChatMatches.length === 0}
                      className="p-1  dark: rounded-full text-slate-600 dark:text-slate-300 disabled:opacity-40"
                      title="Next Match"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setShowInChatSearch(false);
                        setInChatSearchQuery('');
                      }}
                      className="p-1  dark: rounded-full text-slate-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feature 9: Disappearing Messages Banner in Feed */}
              {activeConversation.disappearingDuration && activeConversation.disappearingDuration > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 p-2 text-center text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disappearing messages enabled ({activeConversation.disappearingDuration} hours). Messages auto-expire.</span>
                </div>
              )}

              {/* Message Feed */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-white" style={{ borderStyle: 'none' }}>
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.uid;
                    const isSelected = selectedMsgIds.includes(msg.id);

                    return (
                      <div
                        key={msg.id}
                        id={`msg_bubble_${msg.id}`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          toggleSelectMsg(msg.id);
                        }}
                        onTouchStart={() => handleTouchStartMessage(msg.id)}
                        onTouchEnd={handleTouchEndMessage}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%] ${isMe ? 'ml-auto' : 'mr-auto'} transition-all`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative ${
                            isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                          } ${
                            isMe
                              ? 'bg-[#00a86b] text-white rounded-tr-xs shadow-2xs'
                              : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs shadow-2xs'
                          }`}
                        >
                          {/* Selection Checkbox */}
                          {isSelectionMode && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectMsg(msg.id);
                              }}
                              className={`absolute -left-7 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          )}

                          {/* Feature 5: Quoted Reply Banner */}
                          {msg.replyTo && (
                            <div 
                              onClick={() => jumpToMessage(msg.replyTo!.id)}
                              className={`mb-2 p-2 rounded-xl text-left cursor-pointer border-l-4 ${
                                isMe 
                                  ? 'bg-[#005737] dark:bg-[#005737] border-emerald-300 text-white' 
                                  : 'bg-slate-100 dark:bg-slate-900 border-emerald-500 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <p className="text-[10px] font-bold text-emerald-200">
                                Replying to {msg.replyTo.senderName}
                              </p>
                              <p className="text-[11px] truncate opacity-90 text-white">
                                {msg.replyTo.text}
                              </p>
                            </div>
                          )}

                          {/* Message Text */}
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1 pt-1.5 border-t border-white/20">
                              {msg.attachments.map((att, idx) => (
                                <a
                                  key={idx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-[11px] underline font-medium text-emerald-100"
                                >
                                  <Paperclip className="w-3 h-3" />
                                  {att.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Meta & Delivery Status */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 px-1">
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMe && !msg.isDeletedForEveryone && (
                            <span
                              className="inline-flex items-center shrink-0"
                              title={
                                msg.status === 'read' || (msg.readBy && msg.readBy.some(id => id !== user.uid))
                                  ? 'Read'
                                  : msg.status === 'delivered'
                                  ? 'Delivered'
                                  : 'Sent'
                              }
                            >
                              {msg.status === 'read' || (msg.readBy && msg.readBy.some(id => id !== user.uid)) ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : msg.status === 'delivered' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 px-4 space-y-2">
                    <div className="w-12 h-12 bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Direct Messaging Established
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Send a message to start communicating with {targetProfile?.fullName || 'scholar'}.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Feature 10: Read-Only Banner if User Blocked */}
              {isTargetBlocked ? (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                    <Ban className="w-4 h-4 text-rose-500" />
                    You have blocked this user. Messages cannot be sent or received.
                  </p>
                  <button
                    onClick={handleConfirmBlockUser}
                    className="px-4 py-1.5 bg-emerald-600  text-white rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Unblock User
                  </button>
                </div>
              ) : (
                /* Unified MessageComposer Section */
                <div className="p-2.5 sm:p-3 bg-white relative border-none" style={{ borderStyle: 'none' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.zip,.rar,application/pdf,application/msword,text/plain"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />
                  <input
                    type="file"
                    ref={mediaFileInputRef}
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />

                  {/* Feature 5: Active Reply Preview Banner */}
                  {replyToMsg && (
                    <div className="flex items-center justify-between p-2 mb-2 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl">
                      <div className="min-w-0 pr-2">
                        <p className="text-[11px] font-bold text-emerald-800">
                          Replying to {replyToMsg.senderName}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {replyToMsg.text}
                        </p>
                      </div>
                      <button
                        onClick={() => setReplyToMsg(null)}
                        className="p-1 text-slate-400  rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Attachment Menu Popup */}
                  <AnimatePresence>
                    {showAttachmentMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-3 bottom-16 bg-white rounded-2xl border border-slate-200 shadow-lg p-2 min-w-[200px] z-30"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 border-0 cursor-pointer bg-transparent  transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span>Document</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachmentMenu(false);
                            mediaFileInputRef.current?.click();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 border-0 cursor-pointer bg-transparent  transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Image className="w-4 h-4" />
                          </div>
                          <span>Photos & videos</span>
                        </button>

                        <button
                          type="button"
                          onClick={openCameraModal}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 border-0 cursor-pointer bg-transparent  transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                            <Camera className="w-4 h-4" />
                          </div>
                          <span>Camera / Webcam</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Emoji Quick Drawer */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-3 right-3 sm:left-4 sm:right-auto sm:w-80 bottom-16 p-3 bg-white rounded-2xl border border-slate-200 shadow-lg z-30"
                      >
                        <div className="flex items-center gap-1 border-b border-slate-100 pb-2 mb-2">
                          {[
                            { id: 'smileys', label: '😊' },
                            { id: 'nature', label: '🌿' },
                            { id: 'food', label: '🍕' },
                            { id: 'objects', label: '💡' }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveEmojiCategory(tab.id as any)}
                              className={`px-2.5 py-1 rounded-lg text-sm border-0 cursor-pointer ${
                                activeEmojiCategory === tab.id 
                                  ? 'bg-emerald-50 text-emerald-600 font-semibold' 
                                  : 'text-slate-500 bg-transparent '
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 max-h-40 overflow-y-auto custom-scrollbar p-1">
                          {(
                            activeEmojiCategory === 'smileys' ? ['😊', '😂', '😍', '🥰', '😎', '🤔', '😅', '🥳', '🤩', '🙈', '👍', '🙏', '👏', '🤝', '🙌', '❤️', '🔥', '✨', '✅', '🎉', '💯'] :
                            activeEmojiCategory === 'nature' ? ['🌿', '🐶', '🐱', '🌱', '🌳', '🦁', '🐯', '🐼', '🌸', '🌻', '🌍', '☀️', '🌧️', '⚡'] :
                            activeEmojiCategory === 'food' ? ['☕', '🍎', '🍕', '🍔', '🍟', '🍣', '🍦', '🍩', '🥑', '🥗', '🍹', '🍿'] :
                            ['💡', '📚', '⚡', '📌', '🔒', '💬', '🔑', '📊', '🔬', '🎓', '🏆', '🎨', '🎯', '🚀']
                          ).map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setInputText(prev => prev + emoji);
                                textareaRef.current?.focus({ preventScroll: true });
                              }}
                              className="w-8 h-8 flex items-center justify-center text-base rounded-xl cursor-pointer border-0 bg-transparent "
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Single Unified Outer Composer Surface */}
                  <form 
                    onSubmit={handleSendMessage}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        textareaRef.current?.focus({ preventScroll: true });
                      }
                    }}
                    className="w-full relative flex flex-col justify-center bg-white rounded-[28px] px-3.5 py-1.5 border border-slate-300 cursor-text min-h-[52px]"
                  >
                    {/* Attached File Chips */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-1.5 px-1">
                        {attachedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                            <Paperclip className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[130px] font-medium">{file.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-0.5 rounded-full cursor-pointer text-emerald-700 dark:text-emerald-300 border-0 bg-transparent  dark:"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Active Voice Recording Bar */}
                    {isRecordingVoice ? (
                      <div className="flex items-center justify-between gap-2 py-1 px-2 w-full">
                        <div className="flex items-center gap-2 text-rose-600 font-medium text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                          <span>Recording audio note... {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCancelRecording}
                            className="text-xs text-slate-500  px-2.5 py-1 rounded-full border border-slate-200  cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleStopRecording}
                            className="text-xs bg-emerald-600 text-white font-semibold px-3 py-1 rounded-full  transition-colors cursor-pointer"
                          >
                            Attach Voice
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-end gap-1.5 w-full">
                        <div className="flex items-center gap-0.5 shrink-0 pb-1 text-slate-500 dark:text-slate-400">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEmojiPicker(!showEmojiPicker);
                              setShowAttachmentMenu(false);
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400  dark: transition-colors cursor-pointer border-0 bg-transparent ${
                              showEmojiPicker ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : ''
                            }`}
                            title="Add emoji"
                          >
                            <Smile className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAttachmentMenu(!showAttachmentMenu);
                              setShowEmojiPicker(false);
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400  dark: transition-colors cursor-pointer border-0 bg-transparent ${
                              showAttachmentMenu ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' : ''
                            }`}
                            title="Add attachment"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        <textarea
                          ref={textareaRef}
                          rows={1}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          className="composer-textarea flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none max-h-32 custom-scrollbar py-2 px-1 leading-relaxed cursor-text relative z-10"
                          style={{ color: '#02080e' }}
                        />

                        <div className="flex items-center gap-1 shrink-0 pb-0.5">
                          <button
                            type="button"
                            onClick={handleStartRecording}
                            className="w-9 h-9 text-slate-400 dark:text-slate-500  dark: rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer border-0 bg-transparent"
                            title="Record Voice Note"
                          >
                            <Mic className="w-5 h-5" />
                          </button>

                          <button
                            type="submit"
                            disabled={isSending || (!inputText.trim() && attachedFiles.length === 0)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-0 ${
                              inputText.trim() || attachedFiles.length > 0
                                ? 'bg-emerald-600 text-white cursor-pointer'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                            }`}
                            title="Send message"
                            id="btn_send_message"
                          >
                            <Send className="w-4 h-4 ml-0.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </>
          ) : (
            /* Empty State on Desktop */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your Messages
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mx-auto leading-relaxed">
                  Send private messages to scholars you follow mutually or collaborate with.
                </p>
              </div>

              <button
                onClick={handleOpenNewMessageModal}
                className="px-5 py-2.5 bg-emerald-600  text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Send Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NEW MESSAGE / SCHOLAR PICKER                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNewMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  New Message
                </h3>

                <button
                  onClick={() => setIsNewMessageModalOpen(false)}
                  className="p-1.5 text-slate-400  dark: rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {permissionError && (
                <div className="m-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{permissionError}</span>
                </div>
              )}

              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search connected scholars..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 rounded-full text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {loadingEligible ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Loading connected scholars...
                  </div>
                ) : eligibleUsers.filter(u => (u.fullName || '').toLowerCase().includes((modalSearch || '').toLowerCase())).length > 0 ? (
                  eligibleUsers
                    .filter(u => (u.fullName || '').toLowerCase().includes((modalSearch || '').toLowerCase()))
                    .map((prof) => (
                      <button
                        key={prof.uid}
                        onClick={() => handleStartDirectConversation(prof.uid)}
                        className="w-full p-3 rounded-2xl  dark: transition-all cursor-pointer flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prof.photoURL ? (
                            <img
                              src={prof.photoURL}
                              alt={prof.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                              {prof.fullName.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {prof.fullName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {prof.institution || prof.role || 'Aurenix Scholar'}
                            </p>
                          </div>
                        </div>

                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full  transition-all shrink-0">
                          Chat
                        </span>
                      </button>
                    ))
                ) : (
                  <div className="text-center py-8 px-4 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No matching connected scholars found.
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Follow scholars mutually in Explore Scientists to enable direct messaging.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE MESSAGE OPTIONS                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDeleteMsgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete {selectedMsgIds.length} Message(s)?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose whether to remove message(s) for yourself or for all participants in this chat.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleConfirmDeleteMessage(false)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800  text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Delete for Me
                </button>

                <button
                  onClick={() => handleConfirmDeleteMessage(true)}
                  className="w-full py-2.5 bg-rose-600  text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Delete for Everyone
                </button>

                <button
                  onClick={() => setShowDeleteMsgModal(false)}
                  className="w-full py-2 text-slate-500  dark: text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: CLEAR CHAT CONFIRMATION                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showClearChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Clear Chat History?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will remove all messages in this conversation for your account. The conversation entry will remain in your list.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowClearChatModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearChat}
                  className="flex-1 py-2.5 bg-amber-600  text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Clear Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONVERSATION CONFIRMATION                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDeleteConvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Conversation?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This will permanently delete this conversation and its messages from your account.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConvModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteConv}
                  className="flex-1 py-2.5 bg-rose-600  text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: DISAPPEARING MESSAGES SELECTOR                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDisappearingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Disappearing Messages
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set new messages in this chat to automatically expire and disappear after a specific time duration.
              </p>

              <div className="space-y-1.5 pt-2">
                {[
                  { hours: 0, label: 'Off' },
                  { hours: 24, label: '24 Hours' },
                  { hours: 168, label: '7 Days' },
                  { hours: 720, label: '30 Days' },
                  { hours: 2160, label: '90 Days' },
                ].map(opt => (
                  <button
                    key={opt.hours}
                    onClick={() => handleSetDisappearing(opt.hours)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left cursor-pointer flex items-center justify-between ${
                      (activeConversation?.disappearingDuration || 0) === opt.hours
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 '
                    }`}
                  >
                    <span>{opt.label}</span>
                    {(activeConversation?.disappearingDuration || 0) === opt.hours && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowDisappearingModal(false)}
                className="w-full py-2 text-slate-500  dark: text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 6: BLOCK / UNBLOCK USER                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isTargetBlocked ? 'Unblock User?' : 'Block User?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isTargetBlocked
                  ? 'Unblocking will allow you and this scholar to exchange direct messages again.'
                  : 'Blocked contacts will no longer be able to message you or view your online active status.'}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBlockUser}
                  className="flex-1 py-2.5 bg-rose-600  text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {isTargetBlocked ? 'Unblock' : 'Block User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 7: REPORT USER                                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-500" />
                  Report Scholar
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1 text-slate-400 "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reports are submitted confidentially to platform administrators for moderation.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Reason
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Spam', 'Harassment', 'Fake Account', 'Offensive Content', 'Fraud', 'Copyright Violation', 'Other'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReportReason(r)}
                      className={`p-2 rounded-xl text-left font-semibold border cursor-pointer transition-all ${
                        reportReason === r
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reportComments}
                  onChange={(e) => setReportComments(e.target.value)}
                  placeholder="Provide context or description of the issue..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmittingReport}
                  className="px-4 py-2 bg-amber-600  text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Camera & Webcam Photo / Video Recorder Modal */}
      <AnimatePresence>
        {isCameraModalOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Webcam & Camera Recorder
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeCameraModal}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body / Video Feed or Preview */}
              <div className="p-4 bg-slate-950 flex flex-col items-center justify-center relative min-h-[300px]">
                {cameraError ? (
                  <div className="text-center p-6 text-slate-300 space-y-3">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <p className="text-sm font-medium text-rose-400">{cameraError}</p>
                    <button
                      type="button"
                      onClick={openCameraModal}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold cursor-pointer border-0"
                    >
                      Try Again
                    </button>
                  </div>
                ) : cameraPreview ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    {cameraPreview.type === 'image' ? (
                      <img src={cameraPreview.url} alt="Captured preview" className="w-full h-full object-contain" />
                    ) : (
                      <video src={cameraPreview.url} controls autoPlay className="w-full h-full object-contain" />
                    )}
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    <video
                      ref={webcamVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                    {isVideoRecording && (
                      <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>Rec {Math.floor(videoRecordingTime / 60)}:{(videoRecordingTime % 60).toString().padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Controls */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                {cameraPreview ? (
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCameraPreview(null)}
                      className="flex-1 py-2.5 px-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border-0 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCw className="w-4 h-4" />
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={attachCameraCapture}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 text-white text-xs font-bold rounded-xl border-0 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Attach to Message
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    {/* Mode selector */}
                    <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-xl gap-1 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setCameraMode('photo')}
                        disabled={isVideoRecording}
                        className={`px-3 py-1.5 rounded-lg border-0 cursor-pointer transition-all ${
                          cameraMode === 'photo'
                            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 bg-transparent'
                        }`}
                      >
                        Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setCameraMode('video')}
                        disabled={isVideoRecording}
                        className={`px-3 py-1.5 rounded-lg border-0 cursor-pointer transition-all ${
                          cameraMode === 'video'
                            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 bg-transparent'
                        }`}
                      >
                        Video
                      </button>
                    </div>

                    {/* Action button */}
                    {cameraMode === 'photo' ? (
                      <button
                        type="button"
                        onClick={takeSnapshot}
                        disabled={!cameraStream || !!cameraError}
                        className="py-2.5 px-5 bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-full border-0 cursor-pointer flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Capture Photo
                      </button>
                    ) : isVideoRecording ? (
                      <button
                        type="button"
                        onClick={stopRecordingVideo}
                        className="py-2.5 px-5 bg-rose-600 text-white text-xs font-bold rounded-full border-0 cursor-pointer flex items-center gap-2 animate-pulse"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        Stop Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecordingVideo}
                        disabled={!cameraStream || !!cameraError}
                        className="py-2.5 px-5 bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-full border-0 cursor-pointer flex items-center gap-2"
                      >
                        <Circle className="w-4 h-4 fill-white" />
                        Record Video
                      </button>
                    )}
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
