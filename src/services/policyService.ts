import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirestoreOffline, setFirestoreOffline } from '../firebase';
import { DEFAULT_POLICIES, PolicyDocumentData } from '../data/defaultPolicies';
import { sanitizeForFirestore, isDemoModeActive, isOfflineError } from './db';

export interface PolicyAcceptanceRecord {
  id?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  policyVersions: Record<string, string>;
  acceptedAt: string;
  userAgent?: string;
}

// Local Storage Fallback Keys
const LOCAL_ACCEPTANCES_KEY = 'nexus_demo_policy_acceptances';
const LOCAL_CUSTOM_POLICIES_KEY = 'nexus_demo_custom_policies';

function getLocalAcceptances(): PolicyAcceptanceRecord[] {
  const data = localStorage.getItem(LOCAL_ACCEPTANCES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalAcceptance(record: PolicyAcceptanceRecord) {
  const list = getLocalAcceptances();
  localStorage.setItem(LOCAL_ACCEPTANCES_KEY, JSON.stringify([record, ...list]));
}

function getLocalCustomPolicies(): Record<string, PolicyDocumentData> | null {
  const data = localStorage.getItem(LOCAL_CUSTOM_POLICIES_KEY);
  return data ? JSON.parse(data) : null;
}

function saveLocalCustomPolicy(policyId: string, updated: PolicyDocumentData) {
  const current = getLocalCustomPolicies() || { ...DEFAULT_POLICIES };
  current[policyId] = updated;
  localStorage.setItem(LOCAL_CUSTOM_POLICIES_KEY, JSON.stringify(current));
}

/**
 * Record user acceptance of policies in Firestore and Local Storage audit trail
 */
export async function recordPolicyAcceptance(
  userId: string,
  userEmail: string,
  userName: string = '',
  customVersions?: Record<string, string>
): Promise<void> {
  const defaultVersions: Record<string, string> = {
    terms: DEFAULT_POLICIES.terms.version,
    privacy: DEFAULT_POLICIES.privacy.version,
    cookies: DEFAULT_POLICIES.cookies.version,
    community: DEFAULT_POLICIES.community.version,
    copyright: DEFAULT_POLICIES.copyright.version,
    ethics: DEFAULT_POLICIES.ethics.version,
    disclaimer: DEFAULT_POLICIES.disclaimer.version,
  };

  const record: PolicyAcceptanceRecord = {
    userId,
    userEmail,
    userName: userName || userEmail.split('@')[0],
    policyVersions: customVersions || defaultVersions,
    acceptedAt: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Browser',
  };

  // Save to local backup
  saveLocalAcceptance(record);

  if (isDemoModeActive(userId) || isFirestoreOffline) {
    return;
  }

  const path = 'policy_acceptances';
  try {
    const colRef = collection(db, path);
    await addDoc(colRef, sanitizeForFirestore({
      ...record,
      timestamp: serverTimestamp()
    }));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return;
    }
    console.warn('Error recording policy acceptance in Firestore:', error);
  }
}

/**
 * Get all policy acceptances for a specific user
 */
export async function getUserPolicyAcceptances(userId: string): Promise<PolicyAcceptanceRecord[]> {
  const localList = getLocalAcceptances().filter(a => a.userId === userId);

  if (isDemoModeActive(userId) || isFirestoreOffline) {
    return localList;
  }

  const path = 'policy_acceptances';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const remoteList: PolicyAcceptanceRecord[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      remoteList.push({
        id: docSnap.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        policyVersions: data.policyVersions,
        acceptedAt: data.acceptedAt || new Date().toISOString(),
        userAgent: data.userAgent
      });
    });

    return remoteList.length > 0 ? remoteList : localList;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
    }
    return localList;
  }
}

/**
 * Get all policy acceptances (Admin Audit Trail)
 */
export async function getAllPolicyAcceptances(): Promise<PolicyAcceptanceRecord[]> {
  const localList = getLocalAcceptances();

  if (isFirestoreOffline) {
    return localList;
  }

  const path = 'policy_acceptances';
  try {
    const colRef = collection(db, path);
    const snapshot = await getDocs(colRef);
    const remoteList: PolicyAcceptanceRecord[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      remoteList.push({
        id: docSnap.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        policyVersions: data.policyVersions,
        acceptedAt: data.acceptedAt || new Date().toISOString(),
        userAgent: data.userAgent
      });
    });

    // Merge and deduplicate
    const combined = [...remoteList];
    localList.forEach(loc => {
      if (!combined.some(r => r.userId === loc.userId && r.acceptedAt === loc.acceptedAt)) {
        combined.push(loc);
      }
    });

    return combined.sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime());
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
    }
    return localList;
  }
}

/**
 * Get all policy documents
 */
export async function getPolicyDocuments(): Promise<Record<string, PolicyDocumentData>> {
  const customLocal = getLocalCustomPolicies();
  const merged: Record<string, PolicyDocumentData> = { ...DEFAULT_POLICIES };
  if (customLocal) {
    Object.keys(customLocal).forEach(id => {
      const defaultDoc = DEFAULT_POLICIES[id];
      const localDoc = customLocal[id];
      if (!defaultDoc || (localDoc && localDoc.sections && localDoc.sections.length >= (defaultDoc.sections?.length || 0))) {
        merged[id] = localDoc;
      }
    });
  }
  const basePolicies: Record<string, PolicyDocumentData> = merged;

  if (isFirestoreOffline) {
    return basePolicies;
  }

  const path = 'policy_documents';
  try {
    const colRef = collection(db, path);
    const snapshot = await getDocs(colRef);
    const remotePolicies: Record<string, PolicyDocumentData> = { ...basePolicies };
    snapshot.forEach(docSnap => {
      const id = docSnap.id;
      const data = docSnap.data() as PolicyDocumentData;
      if (id && data.title) {
        remotePolicies[id] = { ...data, id };
      }
    });
    return remotePolicies;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
    }
    return basePolicies;
  }
}

/**
 * Update policy document (Admin Control)
 */
export async function updatePolicyDocument(policyId: string, updatedData: Partial<PolicyDocumentData>): Promise<void> {
  const currentDocs = await getPolicyDocuments();
  const existingDoc = currentDocs[policyId] || DEFAULT_POLICIES[policyId];
  if (!existingDoc) return;

  const newVersion = (parseFloat(existingDoc.version) + 0.1).toFixed(1);
  const updatedDoc: PolicyDocumentData = {
    ...existingDoc,
    ...updatedData,
    version: newVersion,
    lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };

  saveLocalCustomPolicy(policyId, updatedDoc);

  if (isFirestoreOffline) return;

  const path = 'policy_documents';
  try {
    const docRef = doc(db, path, policyId);
    await setDoc(docRef, sanitizeForFirestore(updatedDoc), { merge: true });
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
    }
    console.warn('Error updating policy document in Firestore:', error);
  }
}
