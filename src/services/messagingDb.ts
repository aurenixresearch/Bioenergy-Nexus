import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  arrayUnion,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db, auth, isFirestoreOffline, setFirestoreOffline } from '../firebase';
import { isOfflineError, getResearchers } from './db';
import { getApplications } from './collaborationDb';

export interface ParticipantInfo {
  uid: string;
  fullName: string;
  photoURL?: string;
  role?: string;
  institution?: string;
  email?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantProfiles: Record<string, ParticipantInfo>;
  lastMessage: string;
  lastMessageTimestamp: string;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>;
  connectionType: 'mutual_follow' | 'collaboration';
  createdAt: string;
  updatedAt: string;
  disappearingDuration?: number; // duration in hours (0, 24, 168, 720, 2160)
  clearedAt?: Record<string, string>; // userId -> ISO date
  deletedFor?: string[]; // userIds who deleted the conversation from sidebar
}

export interface MessageAttachment {
  name: string;
  url: string;
  type: string;
}

export interface ReplyToPayload {
  id: string;
  senderName: string;
  text: string;
  senderId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  readBy: string[];
  status?: 'sent' | 'delivered' | 'read';
  deliveredAt?: string;
  readAt?: string;
  replyTo?: ReplyToPayload;
  deletedFor?: string[];
  isDeletedForEveryone?: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  connectionType?: 'mutual_follow' | 'collaboration';
}

// 1. DEMO / LOCAL STORAGE HELPER FOR MESSAGING
function isDemoModeActive(userId?: string): boolean {
  if (userId && (userId === 'sandbox-guest-user' || userId.startsWith('sandbox-'))) {
    return true;
  }
  return localStorage.getItem('nexus_demo_mode') === 'true' || 
         localStorage.getItem('nexus_demo_user') !== null || 
         isFirestoreOffline;
}

function getLocalConversations(userId: string): Conversation[] {
  const data = localStorage.getItem(`nexus_demo_conversations_${userId}`);
  if (data) {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
}

function saveLocalConversations(userId: string, convs: Conversation[]) {
  localStorage.setItem(`nexus_demo_conversations_${userId}`, JSON.stringify(convs));
}

function getLocalMessages(conversationId: string): Message[] {
  const data = localStorage.getItem(`nexus_demo_messages_${conversationId}`);
  if (data) {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
}

function saveLocalMessages(conversationId: string, msgs: Message[]) {
  localStorage.setItem(`nexus_demo_messages_${conversationId}`, JSON.stringify(msgs));
}

// 2. CHECK MESSAGING ELIGIBILITY
export async function checkMessagingEligibility(currentUserId: string, targetUserId: string): Promise<EligibilityResult> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return { eligible: false, reason: "Invalid participants or self-messaging." };
  }

  try {
    // A. Check Mutual Follow
    const researchers = await getResearchers();
    const currentUserRes = researchers.find(r => r.id === currentUserId || (r as any).uid === currentUserId);
    const targetUserRes = researchers.find(r => r.id === targetUserId || (r as any).uid === targetUserId);

    let userAFollowsUserB = false;
    let userBFollowsUserA = false;

    if (targetUserRes && Array.isArray(targetUserRes.followers)) {
      userAFollowsUserB = targetUserRes.followers.includes(currentUserId);
    }
    if (currentUserRes && Array.isArray(currentUserRes.followers)) {
      userBFollowsUserA = currentUserRes.followers.includes(targetUserId);
    }

    if (userAFollowsUserB && userBFollowsUserA) {
      return { eligible: true, connectionType: 'mutual_follow' };
    }

    // B. Check Approved Collaboration / Application Connection
    const applications = await getApplications();
    const hasApprovedCollab = applications.some(app => {
      const isConnectedUser = (app.applicantId === currentUserId || (app as any).createdBy === currentUserId) &&
                              (app.applicantId === targetUserId || (app as any).createdBy === targetUserId);
      const isApproved = app.status === 'Accepted' || app.status === 'Review';
      return isConnectedUser && isApproved;
    });

    if (hasApprovedCollab) {
      return { eligible: true, connectionType: 'collaboration' };
    }

    // C. Special Fallback for Demo Scholars/Researchers if connected in Seed Data
    if (isDemoModeActive(currentUserId)) {
      // In demo/guest mode, allow starting messaging with scientists for interactive user testing
      return { eligible: true, connectionType: 'mutual_follow' };
    }

    return { 
      eligible: false, 
      reason: "Private messaging requires a mutual follow connection or an approved alliance application between scholars." 
    };

  } catch (err) {
    console.warn("Error checking messaging eligibility:", err);
    // Graceful fallback for demo
    return { eligible: true, connectionType: 'mutual_follow' };
  }
}

// 3. GET ALL ELIGIBLE USERS FOR NEW CONVERSATIONS
export async function getEligibleUsersForMessaging(currentUserId: string): Promise<ParticipantInfo[]> {
  try {
    const researchers = await getResearchers();
    const eligibleList: ParticipantInfo[] = [];

    for (const res of researchers) {
      if (res.id === currentUserId) continue;

      const eligibility = await checkMessagingEligibility(currentUserId, res.id);
      if (eligibility.eligible) {
        eligibleList.push({
          uid: res.id,
          fullName: res.fullName,
          photoURL: res.profilePhoto,
          role: res.role,
          institution: res.institution,
          email: res.email
        });
      }
    }

    return eligibleList;
  } catch (err) {
    console.warn("Error getting eligible users for messaging:", err);
    return [];
  }
}

// 4. GET OR CREATE CONVERSATION
export async function getOrCreateConversation(
  currentUserId: string,
  currentUserProfile: ParticipantInfo,
  targetUserId: string,
  targetUserProfile: ParticipantInfo
): Promise<{ conversationId: string; eligible: boolean; error?: string }> {

  const eligibility = await checkMessagingEligibility(currentUserId, targetUserId);
  if (!eligibility.eligible) {
    return { conversationId: '', eligible: false, error: eligibility.reason };
  }

  const participants = [currentUserId, targetUserId].sort();
  const convDocId = `conv_${participants[0]}_${participants[1]}`;

  if (isDemoModeActive(currentUserId)) {
    let convs = getLocalConversations(currentUserId);
    let existing = convs.find(c => c.id === convDocId);

    if (!existing) {
      existing = {
        id: convDocId,
        participants,
        participantProfiles: {
          [currentUserId]: currentUserProfile,
          [targetUserId]: targetUserProfile
        },
        lastMessage: 'Conversation initialized.',
        lastMessageTimestamp: new Date().toISOString(),
        lastMessageSenderId: currentUserId,
        unreadCount: { [currentUserId]: 0, [targetUserId]: 0 },
        connectionType: eligibility.connectionType || 'mutual_follow',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      convs.unshift(existing);
      saveLocalConversations(currentUserId, convs);
      saveLocalConversations(targetUserId, convs);
    }
    return { conversationId: convDocId, eligible: true };
  }

  try {
    const docRef = doc(db, 'conversations', convDocId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return { conversationId: snap.id, eligible: true };
    }

    // Create new conversation document
    const newConv: Omit<Conversation, 'id'> = {
      participants,
      participantProfiles: {
        [currentUserId]: currentUserProfile,
        [targetUserId]: targetUserProfile
      },
      lastMessage: 'Conversation started',
      lastMessageTimestamp: new Date().toISOString(),
      lastMessageSenderId: currentUserId,
      unreadCount: { [currentUserId]: 0, [targetUserId]: 0 },
      connectionType: eligibility.connectionType || 'mutual_follow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, newConv);
    return { conversationId: convDocId, eligible: true };

  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return getOrCreateConversation(currentUserId, currentUserProfile, targetUserId, targetUserProfile);
    }
    console.error("Error creating conversation in Firestore:", err);
    return { conversationId: '', eligible: false, error: "Failed to create conversation thread." };
  }
}

// 5. SUBSCRIBE TO USER CONVERSATIONS (REAL-TIME LISTENER)
export function subscribeToConversations(
  userId: string, 
  callback: (conversations: Conversation[]) => void
): () => void {
  if (isDemoModeActive(userId)) {
    const convs = getLocalConversations(userId).filter(c => !c.deletedFor || !c.deletedFor.includes(userId));
    callback(convs);
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convList: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Conversation;
        if (!data.deletedFor || !data.deletedFor.includes(userId)) {
          convList.push({ id: docSnap.id, ...data });
        }
      });

      // Sort client side by updatedAt DESC
      convList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      callback(convList);
    }, (error) => {
      console.warn("Firestore error in conversations snapshot:", error);
      if (isOfflineError(error)) {
        setFirestoreOffline(true);
        callback(getLocalConversations(userId).filter(c => !c.deletedFor || !c.deletedFor.includes(userId)));
      }
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Error setting up conversation listener:", err);
    callback(getLocalConversations(userId).filter(c => !c.deletedFor || !c.deletedFor.includes(userId)));
    return () => {};
  }
}

// 6. SUBSCRIBE TO CONVERSATION MESSAGES (REAL-TIME LISTENER)
export function subscribeToMessages(
  conversationId: string, 
  callback: (messages: Message[]) => void,
  currentUserId?: string,
  disappearingDurationHours?: number,
  clearedAtIso?: string
): () => void {
  if (!conversationId) return () => {};

  const processAndFilterMessages = (rawMsgs: Message[]): Message[] => {
    return rawMsgs.filter(msg => {
      // 1. Filter deleted for me
      if (currentUserId && msg.deletedFor && msg.deletedFor.includes(currentUserId)) {
        return false;
      }
      // 2. Filter cleared chat messages
      if (clearedAtIso && new Date(msg.createdAt).getTime() <= new Date(clearedAtIso).getTime()) {
        return false;
      }
      // 3. Filter disappearing messages
      if (disappearingDurationHours && disappearingDurationHours > 0) {
        const expireTime = new Date(msg.createdAt).getTime() + disappearingDurationHours * 3600 * 1000;
        if (Date.now() > expireTime) {
          return false;
        }
      }
      return true;
    });
  };

  if (isDemoModeActive()) {
    const msgs = getLocalMessages(conversationId);
    callback(processAndFilterMessages(msgs));
    return () => {};
  }

  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((docSnap) => {
        msgList.push({ id: docSnap.id, ...docSnap.data() } as Message);
      });
      callback(processAndFilterMessages(msgList));
    }, (error) => {
      console.warn("Firestore error in messages snapshot:", error);
      if (isOfflineError(error)) {
        setFirestoreOffline(true);
        callback(processAndFilterMessages(getLocalMessages(conversationId)));
      }
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Error subscribing to messages:", err);
    callback(processAndFilterMessages(getLocalMessages(conversationId)));
    return () => {};
  }
}

// 7. SEND A MESSAGE
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string | undefined,
  text: string,
  attachments?: MessageAttachment[],
  replyTo?: ReplyToPayload
): Promise<boolean> {
  if (!conversationId || !senderId || (!text.trim() && (!attachments || attachments.length === 0))) {
    return false;
  }

  const nowISO = new Date().toISOString();

  const messageData: any = {
    conversationId,
    senderId,
    senderName,
    senderPhoto: senderPhoto || '',
    text: text.trim(),
    attachments: attachments || [],
    createdAt: nowISO,
    readBy: [senderId],
    status: 'sent' as const
  };

  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  if (isDemoModeActive(senderId)) {
    const msgs = getLocalMessages(conversationId);
    const newMsg: Message = { id: `msg_${Date.now()}`, ...messageData };
    msgs.push(newMsg);
    saveLocalMessages(conversationId, msgs);

    // Update conversation summary locally
    let convs = getLocalConversations(senderId);
    convs = convs.map(c => {
      if (c.id === conversationId) {
        const otherUser = c.participants.find(p => p !== senderId) || '';
        const currentUnread = c.unreadCount?.[otherUser] || 0;
        return {
          ...c,
          lastMessage: text.trim(),
          lastMessageTimestamp: nowISO,
          lastMessageSenderId: senderId,
          unreadCount: {
            ...(c.unreadCount || {}),
            [senderId]: 0,
            [otherUser]: currentUnread + 1
          },
          updatedAt: nowISO
        };
      }
      return c;
    });
    saveLocalConversations(senderId, convs);
    return true;
  }

  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, messageData);

    // Update parent conversation summary
    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);

    if (convSnap.exists()) {
      const data = convSnap.data() as Conversation;
      const otherUserId = data.participants.find(p => p !== senderId) || '';
      const currentOtherUnread = data.unreadCount?.[otherUserId] || 0;

      await updateDoc(convRef, {
        lastMessage: text.trim(),
        lastMessageTimestamp: nowISO,
        lastMessageSenderId: senderId,
        updatedAt: nowISO,
        [`unreadCount.${senderId}`]: 0,
        [`unreadCount.${otherUserId}`]: currentOtherUnread + 1
      });
    }

    return true;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return sendMessage(conversationId, senderId, senderName, senderPhoto, text, attachments);
    }
    console.error("Error sending message to Firestore:", err);
    return false;
  }
}

// 8. MARK MESSAGES AS DELIVERED
export async function markMessagesAsDelivered(
  conversationId: string, 
  recipientId: string, 
  messages?: Message[]
): Promise<void> {
  if (!conversationId || !recipientId) return;

  const nowISO = new Date().toISOString();
  let undelivered: Message[] = [];

  if (messages && messages.length > 0) {
    undelivered = messages.filter(
      m => m.senderId !== recipientId && (!m.status || m.status === 'sent')
    );
  } else if (!isDemoModeActive(recipientId)) {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(messagesRef);
      const snap = await getDocs(q);
      snap.forEach(docSnap => {
        const data = docSnap.data() as Message;
        if (data.senderId !== recipientId && (!data.status || data.status === 'sent')) {
          undelivered.push({ id: docSnap.id, ...data });
        }
      });
    } catch (err) {
      console.warn("Error fetching undelivered messages:", err);
    }
  }

  if (isDemoModeActive(recipientId)) {
    const msgs = getLocalMessages(conversationId);
    let changed = false;
    const updatedMsgs = msgs.map(m => {
      if (m.senderId !== recipientId && (!m.status || m.status === 'sent')) {
        changed = true;
        return { ...m, status: 'delivered' as const, deliveredAt: nowISO };
      }
      return m;
    });
    if (changed) {
      saveLocalMessages(conversationId, updatedMsgs);
    }
  }

  if (undelivered.length === 0) return;

  try {
    const batchPromises = undelivered.map(m => {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', m.id);
      return updateDoc(msgRef, {
        status: 'delivered',
        deliveredAt: nowISO
      }).catch(err => {
        console.warn(`Could not mark message ${m.id} as delivered:`, err);
      });
    });
    await Promise.all(batchPromises);
  } catch (err) {
    console.warn("Error marking messages as delivered:", err);
  }
}

// 9. MARK MESSAGES AS READ
export async function markMessagesAsRead(
  conversationId: string, 
  recipientId: string, 
  messages?: Message[]
): Promise<void> {
  if (!conversationId || !recipientId) return;

  const nowISO = new Date().toISOString();

  let unreadMessages: Message[] = [];
  if (messages && messages.length > 0) {
    unreadMessages = messages.filter(
      m => m.senderId !== recipientId && m.status !== 'read'
    );
  } else if (!isDemoModeActive(recipientId)) {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(messagesRef);
      const snap = await getDocs(q);
      snap.forEach(docSnap => {
        const data = docSnap.data() as Message;
        if (data.senderId !== recipientId && data.status !== 'read') {
          unreadMessages.push({ id: docSnap.id, ...data });
        }
      });
    } catch (err) {
      console.warn("Error fetching unread messages to mark as read:", err);
    }
  }

  if (isDemoModeActive(recipientId)) {
    const msgs = getLocalMessages(conversationId);
    let changed = false;
    const updatedMsgs = msgs.map(m => {
      if (m.senderId !== recipientId && m.status !== 'read') {
        changed = true;
        const readBy = Array.from(new Set([...(m.readBy || []), recipientId]));
        return { ...m, status: 'read' as const, readBy, readAt: nowISO };
      }
      return m;
    });
    if (changed) {
      saveLocalMessages(conversationId, updatedMsgs);
    }
  }

  if (unreadMessages.length === 0) return;

  try {
    const batchPromises = unreadMessages.map(m => {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', m.id);
      return updateDoc(msgRef, {
        status: 'read',
        readBy: [m.senderId, recipientId],
        readAt: nowISO
      }).catch(err => {
        console.warn(`Could not mark message ${m.id} as read:`, err);
      });
    });
    await Promise.all(batchPromises);
  } catch (err) {
    console.warn("Error marking messages as read:", err);
  }
}

// 10. MARK CONVERSATION AS READ
export async function markConversationAsRead(conversationId: string, userId: string): Promise<void> {
  if (!conversationId || !userId) return;

  // First mark unread messages from the other sender as read
  await markMessagesAsRead(conversationId, userId);

  if (isDemoModeActive(userId)) {
    let convs = getLocalConversations(userId);
    convs = convs.map(c => {
      if (c.id === conversationId && c.unreadCount) {
        return {
          ...c,
          unreadCount: { ...c.unreadCount, [userId]: 0 }
        };
      }
      return c;
    });
    saveLocalConversations(userId, convs);
    return;
  }

  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`unreadCount.${userId}`]: 0
    });
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return markConversationAsRead(conversationId, userId);
    }
    console.warn("Error marking conversation as read:", err);
  }
}

// 9. SUBSCRIBE TO TOTAL UNREAD MESSAGES COUNT
export function subscribeToUnreadCount(
  userId: string, 
  callback: (unreadTotal: number) => void
): () => void {
  if (!userId) {
    callback(0);
    return () => {};
  }

  return subscribeToConversations(userId, (conversations) => {
    let total = 0;
    for (const conv of conversations) {
      if (conv.unreadCount && typeof conv.unreadCount[userId] === 'number') {
        total += conv.unreadCount[userId];
      }
    }
    callback(total);
  });
}

// 11. DELETE MESSAGE FOR ME
export async function deleteMessageForMe(conversationId: string, messageId: string, userId: string): Promise<boolean> {
  if (!conversationId || !messageId || !userId) return false;

  if (isDemoModeActive(userId)) {
    const msgs = getLocalMessages(conversationId);
    const updated = msgs.map(m => {
      if (m.id === messageId) {
        const deletedFor = Array.from(new Set([...(m.deletedFor || []), userId]));
        return { ...m, deletedFor };
      }
      return m;
    });
    saveLocalMessages(conversationId, updated);
    return true;
  }

  try {
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(msgRef, {
      deletedFor: arrayUnion(userId)
    });
    return true;
  } catch (err) {
    console.error("Error deleting message for me:", err);
    return false;
  }
}

// 12. DELETE MESSAGE FOR EVERYONE
export async function deleteMessageForEveryone(conversationId: string, messageId: string, userId: string): Promise<boolean> {
  if (!conversationId || !messageId || !userId) return false;

  if (isDemoModeActive(userId)) {
    const msgs = getLocalMessages(conversationId);
    const updated = msgs.map(m => {
      if (m.id === messageId) {
        return { ...m, isDeletedForEveryone: true, text: 'This message was deleted', attachments: [] };
      }
      return m;
    });
    saveLocalMessages(conversationId, updated);
    return true;
  }

  try {
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(msgRef, {
      isDeletedForEveryone: true,
      text: 'This message was deleted',
      attachments: []
    });
    return true;
  } catch (err) {
    console.error("Error deleting message for everyone:", err);
    return false;
  }
}

// 13. CLEAR CONVERSATION CHAT (FOR CURRENT USER)
export async function clearConversationMessages(conversationId: string, userId: string): Promise<boolean> {
  if (!conversationId || !userId) return false;

  const nowISO = new Date().toISOString();

  if (isDemoModeActive(userId)) {
    // Save clearedAt timestamp for conversation
    let convs = getLocalConversations(userId);
    convs = convs.map(c => {
      if (c.id === conversationId) {
        return { ...c, clearedAt: { ...(c.clearedAt || {}), [userId]: nowISO }, lastMessage: 'Chat history cleared' };
      }
      return c;
    });
    saveLocalConversations(userId, convs);

    // Also update local messages
    const msgs = getLocalMessages(conversationId);
    const updated = msgs.map(m => ({
      ...m,
      deletedFor: Array.from(new Set([...(m.deletedFor || []), userId]))
    }));
    saveLocalMessages(conversationId, updated);
    return true;
  }

  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`clearedAt.${userId}`]: nowISO
    });
    return true;
  } catch (err) {
    console.error("Error clearing chat history:", err);
    return false;
  }
}

// 14. DELETE CONVERSATION FOR CURRENT USER
export async function deleteConversationForUser(conversationId: string, userId: string): Promise<boolean> {
  if (!conversationId || !userId) return false;

  if (isDemoModeActive(userId)) {
    let convs = getLocalConversations(userId);
    convs = convs.filter(c => c.id !== conversationId);
    saveLocalConversations(userId, convs);
    return true;
  }

  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      deletedFor: arrayUnion(userId)
    });
    return true;
  } catch (err) {
    console.error("Error deleting conversation for user:", err);
    return false;
  }
}

// 15. SET DISAPPEARING MESSAGES DURATION (in hours: 0, 24, 168, 720, 2160)
export async function setDisappearingMessagesDuration(conversationId: string, durationHours: number, userId: string): Promise<boolean> {
  if (!conversationId) return false;

  if (isDemoModeActive(userId)) {
    let convs = getLocalConversations(userId);
    convs = convs.map(c => {
      if (c.id === conversationId) {
        return { ...c, disappearingDuration: durationHours };
      }
      return c;
    });
    saveLocalConversations(userId, convs);
    return true;
  }

  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      disappearingDuration: durationHours,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error("Error setting disappearing messages duration:", err);
    return false;
  }
}

// 16. BLOCK USER & UNBLOCK USER
export async function blockUser(blockerId: string, blockedUserId: string): Promise<boolean> {
  if (!blockerId || !blockedUserId) return false;

  const nowISO = new Date().toISOString();
  const blockDocId = `block_${blockerId}_${blockedUserId}`;

  if (isDemoModeActive(blockerId)) {
    const localBlocks = JSON.parse(localStorage.getItem(`nexus_demo_blocks_${blockerId}`) || '[]');
    if (!localBlocks.includes(blockedUserId)) {
      localBlocks.push(blockedUserId);
      localStorage.setItem(`nexus_demo_blocks_${blockerId}`, JSON.stringify(localBlocks));
    }
    return true;
  }

  try {
    const blockRef = doc(db, 'blocks', blockDocId);
    await setDoc(blockRef, {
      blockerId,
      blockedUserId,
      createdAt: nowISO
    });
    return true;
  } catch (err) {
    console.error("Error blocking user:", err);
    return false;
  }
}

export async function unblockUser(blockerId: string, blockedUserId: string): Promise<boolean> {
  if (!blockerId || !blockedUserId) return false;

  const blockDocId = `block_${blockerId}_${blockedUserId}`;

  if (isDemoModeActive(blockerId)) {
    const localBlocks = JSON.parse(localStorage.getItem(`nexus_demo_blocks_${blockerId}`) || '[]');
    const updated = localBlocks.filter((id: string) => id !== blockedUserId);
    localStorage.setItem(`nexus_demo_blocks_${blockerId}`, JSON.stringify(updated));
    return true;
  }

  try {
    const blockRef = doc(db, 'blocks', blockDocId);
    await deleteDoc(blockRef);
    return true;
  } catch (err) {
    console.error("Error unblocking user:", err);
    return false;
  }
}

export function subscribeToBlockedUsers(userId: string, callback: (blockedUserIds: string[]) => void): () => void {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (isDemoModeActive(userId)) {
    const localBlocks = JSON.parse(localStorage.getItem(`nexus_demo_blocks_${userId}`) || '[]');
    callback(localBlocks);
    return () => {};
  }

  try {
    const q = query(collection(db, 'blocks'), where('blockerId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.blockedUserId) ids.push(data.blockedUserId);
      });
      callback(ids);
    }, (err) => {
      console.warn("Error subscribing to blocks:", err);
      const localBlocks = JSON.parse(localStorage.getItem(`nexus_demo_blocks_${userId}`) || '[]');
      callback(localBlocks);
    });
  } catch (err) {
    console.warn("Error in blocks listener:", err);
    callback([]);
    return () => {};
  }
}

// 17. SUBMIT USER REPORT
export async function submitUserReport(report: {
  reporterId: string;
  reporterName?: string;
  reportedUserId: string;
  reportedUserName?: string;
  conversationId?: string;
  reason: string;
  comments?: string;
}): Promise<boolean> {
  if (!report.reporterId || !report.reportedUserId || !report.reason) return false;

  const reportData = {
    ...report,
    comments: report.comments || '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  if (isDemoModeActive(report.reporterId)) {
    const localReports = JSON.parse(localStorage.getItem('nexus_demo_reports') || '[]');
    localReports.push(reportData);
    localStorage.setItem('nexus_demo_reports', JSON.stringify(localReports));
    return true;
  }

  try {
    await addDoc(collection(db, 'reports'), reportData);
    return true;
  } catch (err) {
    console.error("Error submitting user report:", err);
    return false;
  }
}
