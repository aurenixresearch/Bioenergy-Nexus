import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  addDoc, 
  onSnapshot, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, isFirestoreOffline } from '../firebase';

export type NotificationType = 
  | 'research'
  | 'messaging'
  | 'followers'
  | 'collaboration'
  | 'funding'
  | 'challenge'
  | 'admin';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string; // ISO date string
  relatedResourceId?: string;
  relatedResourceType?: 'paper' | 'message' | 'alliance' | 'project' | 'researcher' | 'funding' | 'challenge' | 'account' | 'profile';
  actionUrl?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
}

// Check if user or system is in demo/sandbox mode
export function isDemoUser(userId?: string): boolean {
  if (!userId) return true;
  if (userId === 'sandbox-guest-user' || userId.startsWith('sandbox-')) return true;
  return localStorage.getItem('nexus_demo_mode') === 'true' || isFirestoreOffline;
}

const LOCAL_STORAGE_KEY_PREFIX = 'aurenix_notifications_';

function getLocalStorageKey(userId: string): string {
  return `${LOCAL_STORAGE_KEY_PREFIX}${userId}`;
}

function getLocalNotifications(userId: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local notifications:', err);
    return [];
  }
}

function saveLocalNotifications(userId: string, notifications: AppNotification[]): void {
  try {
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(notifications));
    // Dispatch custom event for real-time local sync across tabs/components
    window.dispatchEvent(new CustomEvent('aurenix_notifications_updated', { detail: { userId } }));
  } catch (err) {
    console.error('Error saving local notifications:', err);
  }
}

// Seed notifications (returns empty array to avoid rendering fake notifications)
export function getSeedNotifications(userId: string, userName?: string): AppNotification[] {
  return [];
}

// Subscribe to real-time notifications for a user
export function subscribeNotifications(
  userId: string,
  callback: (notifications: AppNotification[]) => void
): () => void {
  if (!userId) {
    callback([]);
    return () => {};
  }

  // Handle Demo / Sandbox mode
  if (isDemoUser(userId)) {
    const local = getLocalNotifications(userId);
    callback([...local].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    const handleLocalUpdate = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv.detail?.userId === userId) {
        const updated = getLocalNotifications(userId);
        callback([...updated].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    };

    window.addEventListener('aurenix_notifications_updated', handleLocalUpdate);
    return () => {
      window.removeEventListener('aurenix_notifications_updated', handleLocalUpdate);
    };
  }

  // Live Firestore subscription
  try {
    const collRef = collection(db, 'notifications');
    const q = query(collRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const readValue = data.read !== undefined ? Boolean(data.read) : (data.isRead !== undefined ? Boolean(data.isRead) : false);
          items.push({
            id: docSnap.id,
            userId: data.userId || userId,
            type: data.type || 'admin',
            title: data.title || 'Notification',
            description: data.description || '',
            isRead: readValue,
            createdAt: data.createdAt || new Date().toISOString(),
            relatedResourceId: data.relatedResourceId,
            relatedResourceType: data.relatedResourceType,
            actionUrl: data.actionUrl,
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar
          });
        });

        // Sort newest first
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        console.warn('Firestore notifications listener error, falling back to local storage:', error);
        let local = getLocalNotifications(userId);
        if (local.length === 0) {
          local = getSeedNotifications(userId);
          saveLocalNotifications(userId, local);
        }
        callback([...local].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to setup Firestore notifications listener:', err);
    let local = getLocalNotifications(userId);
    if (local.length === 0) {
      local = getSeedNotifications(userId);
      saveLocalNotifications(userId, local);
    }
    callback([...local].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    return () => {};
  }
}

// Seed notifications in Firestore if none exist
async function seedFirestoreNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const seeds = getSeedNotifications(userId);
    const created: AppNotification[] = [];
    for (const seed of seeds) {
      const { id, ...data } = seed;
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...data,
        read: seed.isRead,
        isRead: seed.isRead
      });
      created.push({ ...seed, id: docRef.id });
    }
    return created;
  } catch (err) {
    console.error('Error seeding Firestore notifications:', err);
    return [];
  }
}

// Mark single notification as read
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  if (!userId || !notificationId) return;

  if (isDemoUser(userId) || notificationId.startsWith('seed-')) {
    const list = getLocalNotifications(userId);
    const updated = list.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    saveLocalNotifications(userId, updated);
    return;
  }

  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { 
      read: true, 
      isRead: true, 
      readAt: serverTimestamp() 
    });
    // Optimistic local update
    const list = getLocalNotifications(userId);
    const updated = list.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    saveLocalNotifications(userId, updated);
  } catch (err) {
    console.error('Failed to mark notification as read in Firestore:', err);
    // Fallback local update
    const list = getLocalNotifications(userId);
    const updated = list.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    saveLocalNotifications(userId, updated);
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) return;

  if (isDemoUser(userId)) {
    const list = getLocalNotifications(userId);
    const updated = list.map(n => ({ ...n, isRead: true }));
    saveLocalNotifications(userId, updated);
    return;
  }

  try {
    const collRef = collection(db, 'notifications');
    const q = query(collRef, where('userId', '==', userId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const batch = writeBatch(db);
      let updatedCount = 0;
      snap.forEach((d) => {
        const data = d.data();
        const isAlreadyRead = Boolean(data.read !== undefined ? data.read : (data.isRead !== undefined ? data.isRead : false));
        if (!isAlreadyRead) {
          batch.update(d.ref, { 
            read: true, 
            isRead: true, 
            readAt: serverTimestamp() 
          });
          updatedCount++;
        }
      });
      if (updatedCount > 0) {
        await batch.commit();
      }
    }

    // Also sync local storage
    const list = getLocalNotifications(userId);
    const updated = list.map(n => ({ ...n, isRead: true }));
    saveLocalNotifications(userId, updated);
  } catch (err) {
    console.error('Error marking all notifications read in Firestore:', err);
    const list = getLocalNotifications(userId);
    const updated = list.map(n => ({ ...n, isRead: true }));
    saveLocalNotifications(userId, updated);
  }
}

// Delete single notification
export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  if (!userId || !notificationId) return;

  if (isDemoUser(userId) || notificationId.startsWith('seed-')) {
    const list = getLocalNotifications(userId);
    const updated = list.filter(n => n.id !== notificationId);
    saveLocalNotifications(userId, updated);
    return;
  }

  try {
    const docRef = doc(db, 'notifications', notificationId);
    await deleteDoc(docRef);

    // Sync local
    const list = getLocalNotifications(userId);
    const updated = list.filter(n => n.id !== notificationId);
    saveLocalNotifications(userId, updated);
  } catch (err) {
    console.error('Error deleting notification from Firestore:', err);
    const list = getLocalNotifications(userId);
    const updated = list.filter(n => n.id !== notificationId);
    saveLocalNotifications(userId, updated);
  }
}

// Clear all notifications for a user
export async function clearAllNotifications(userId: string): Promise<void> {
  if (!userId) return;

  if (isDemoUser(userId)) {
    saveLocalNotifications(userId, []);
    return;
  }

  try {
    const collRef = collection(db, 'notifications');
    const q = query(collRef, where('userId', '==', userId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }

    saveLocalNotifications(userId, []);
  } catch (err) {
    console.error('Error clearing all notifications in Firestore:', err);
    saveLocalNotifications(userId, []);
  }
}

// Create new notification for any user event
export async function createNotification(
  userId: string,
  notificationData: Omit<AppNotification, 'id' | 'userId' | 'createdAt' | 'isRead'> & { isRead?: boolean; createdAt?: string }
): Promise<string> {
  const newNotif: Omit<AppNotification, 'id'> = {
    userId,
    type: notificationData.type,
    title: notificationData.title,
    description: notificationData.description,
    isRead: notificationData.isRead ?? false,
    createdAt: notificationData.createdAt || new Date().toISOString(),
    relatedResourceId: notificationData.relatedResourceId,
    relatedResourceType: notificationData.relatedResourceType,
    actionUrl: notificationData.actionUrl,
    senderId: notificationData.senderId,
    senderName: notificationData.senderName,
    senderAvatar: notificationData.senderAvatar
  };

  if (isDemoUser(userId)) {
    const id = `local-notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const full = { ...newNotif, id };
    const list = getLocalNotifications(userId);
    saveLocalNotifications(userId, [full, ...list]);
    return id;
  }

  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...newNotif,
      read: newNotif.isRead
    });
    
    // Also save to local storage for quick access
    const list = getLocalNotifications(userId);
    saveLocalNotifications(userId, [{ ...newNotif, id: docRef.id }, ...list]);

    return docRef.id;
  } catch (err) {
    console.error('Error creating notification in Firestore:', err);
    const id = `local-notif-${Date.now()}`;
    const full = { ...newNotif, id };
    const list = getLocalNotifications(userId);
    saveLocalNotifications(userId, [full, ...list]);
    return id;
  }
}

// Helper to format relative time
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Recently';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 30) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}
