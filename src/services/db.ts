import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ResearchPaper, ConsultationInquiry, PartnershipSubmission } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// LOCAL STORAGE SANDBOX FALLBACK HELPERS
export function isDemoModeActive(): boolean {
  return localStorage.getItem('nexus_demo_mode') === 'true';
}

function getLocalSavedPapers(userId: string): string[] {
  const data = localStorage.getItem(`nexus_demo_saved_papers_${userId}`);
  return data ? JSON.parse(data) : [];
}

function setLocalSavedPapers(userId: string, papers: string[]) {
  localStorage.setItem(`nexus_demo_saved_papers_${userId}`, JSON.stringify(papers));
}

function getLocalInquiries(userId: string): ConsultationInquiry[] {
  const data = localStorage.getItem(`nexus_demo_inquiries_${userId}`);
  return data ? JSON.parse(data) : [];
}

function setLocalInquiries(userId: string, inquiries: ConsultationInquiry[]) {
  localStorage.setItem(`nexus_demo_inquiries_${userId}`, JSON.stringify(inquiries));
}

function getLocalPartnerships(userId: string): PartnershipSubmission[] {
  const data = localStorage.getItem(`nexus_demo_partnerships_${userId}`);
  return data ? JSON.parse(data) : [];
}

function setLocalPartnerships(userId: string, partnerships: PartnershipSubmission[]) {
  localStorage.setItem(`nexus_demo_partnerships_${userId}`, JSON.stringify(partnerships));
}

function getLocalCustomPapers(): ResearchPaper[] {
  const data = localStorage.getItem(`nexus_demo_custom_papers`);
  return data ? JSON.parse(data) : [];
}

function setLocalCustomPapers(papers: ResearchPaper[]) {
  localStorage.setItem(`nexus_demo_custom_papers`, JSON.stringify(papers));
}

// SAVED PAPERS
export async function savePaper(userId: string, paperId: string): Promise<void> {
  if (isDemoModeActive()) {
    const papers = getLocalSavedPapers(userId);
    if (!papers.includes(paperId)) {
      setLocalSavedPapers(userId, [...papers, paperId]);
    }
    return;
  }

  const path = 'saved_papers';
  try {
    const docRef = doc(db, path, `${userId}_${paperId}`);
    await setDoc(docRef, {
      userId,
      paperId,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${userId}_${paperId}`);
  }
}

export async function unsavePaper(userId: string, paperId: string): Promise<void> {
  if (isDemoModeActive()) {
    const papers = getLocalSavedPapers(userId);
    setLocalSavedPapers(userId, papers.filter(id => id !== paperId));
    return;
  }

  const path = 'saved_papers';
  try {
    const docRef = doc(db, path, `${userId}_${paperId}`);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${userId}_${paperId}`);
  }
}

export async function getSavedPaperIds(userId: string): Promise<string[]> {
  if (isDemoModeActive()) {
    return getLocalSavedPapers(userId);
  }

  const path = 'saved_papers';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const ids: string[] = [];
    querySnapshot.forEach((docSnap) => {
      ids.push(docSnap.data().paperId);
    });
    return ids;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// CONSULTATION INQUIRIES
export async function submitInquiry(inquiry: Omit<ConsultationInquiry, 'id' | 'status' | 'createdAt'>): Promise<string> {
  if (isDemoModeActive()) {
    const inquiries = getLocalInquiries(inquiry.userId);
    const mockId = 'inquiry_' + Math.random().toString(36).substring(2, 9);
    const newInquiry: ConsultationInquiry = {
      ...inquiry,
      id: mockId,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setLocalInquiries(inquiry.userId, [newInquiry, ...inquiries]);
    return mockId;
  }

  const path = 'consultation_inquiries';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...inquiry,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserInquiries(userId: string): Promise<ConsultationInquiry[]> {
  if (isDemoModeActive()) {
    return getLocalInquiries(userId);
  }

  const path = 'consultation_inquiries';
  try {
    const q = query(
      collection(db, path), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const inquiries: ConsultationInquiry[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      inquiries.push({
        id: docSnap.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        organization: data.organization,
        serviceType: data.serviceType,
        message: data.message,
        createdAt: data.createdAt,
        status: data.status,
      });
    });
    return inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// PARTNERSHIPS
export async function submitPartnership(partnership: Omit<PartnershipSubmission, 'id' | 'createdAt'>): Promise<string> {
  if (isDemoModeActive()) {
    const partnerships = getLocalPartnerships(partnership.userId);
    const mockId = 'partner_' + Math.random().toString(36).substring(2, 9);
    const newPartnership: PartnershipSubmission = {
      ...partnership,
      id: mockId,
      createdAt: new Date().toISOString()
    };
    setLocalPartnerships(partnership.userId, [newPartnership, ...partnerships]);
    return mockId;
  }

  const path = 'partnership_submissions';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...partnership,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserPartnerships(userId: string): Promise<PartnershipSubmission[]> {
  if (isDemoModeActive()) {
    return getLocalPartnerships(userId);
  }

  const path = 'partnership_submissions';
  try {
    const q = query(
      collection(db, path), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const submissions: PartnershipSubmission[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      submissions.push({
        id: docSnap.id,
        userId: data.userId,
        userEmail: data.userEmail,
        partnerName: data.partnerName,
        stakeholderType: data.stakeholderType,
        collaborationArea: data.collaborationArea,
        message: data.message,
        createdAt: data.createdAt,
      });
    });
    return submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// CUSTOM RESEARCH PAPERS (CONTRIBUTIONS)
export async function addCustomPaper(paper: Omit<ResearchPaper, 'id'>, userId: string, userEmail: string): Promise<string> {
  if (isDemoModeActive()) {
    const papers = getLocalCustomPapers();
    const mockId = 'paper_' + Math.random().toString(36).substring(2, 9);
    const newPaper: ResearchPaper = {
      ...paper,
      id: mockId,
      isCustom: true
    };
    setLocalCustomPapers([...papers, newPaper]);
    return mockId;
  }

  const path = 'custom_papers';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...paper,
      isCustom: true,
      userId,
      userEmail,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getCustomPapers(): Promise<ResearchPaper[]> {
  const localPapers = getLocalCustomPapers();

  if (isDemoModeActive()) {
    return localPapers;
  }

  const path = 'custom_papers';
  try {
    const colRef = collection(db, path);
    const querySnapshot = await getDocs(colRef);
    const papers: ResearchPaper[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      papers.push({
        id: docSnap.id,
        title: data.title,
        author: data.author,
        category: data.category,
        abstract: data.abstract,
        downloadUrl: data.downloadUrl || '#',
        publishedYear: data.publishedYear,
        isCustom: true,
      });
    });
    // Merge both for complete sandboxing
    return [...papers, ...localPapers];
  } catch (error) {
    // If firebase fails entirely due to rules/restrictions, fallback gracefully to local custom papers
    console.warn('Firebase error fetching custom papers, falling back to local storage custom papers:', error);
    return localPapers;
  }
}
