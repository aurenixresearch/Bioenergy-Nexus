import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, isFirestoreOffline, setFirestoreOffline } from '../firebase';
import { ResearchPaper, ConsultationInquiry, PartnershipSubmission, Researcher, Publication } from '../types';
import { SEED_RESEARCHERS, SEED_PUBLICATIONS } from './researchersSeed';

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

export function isOfflineError(error: unknown): boolean {
  const errMsg = error instanceof Error ? error.message : String(error);
  return (
    errMsg.includes('unavailable') || 
    errMsg.includes('offline') || 
    errMsg.includes('Could not reach') || 
    errMsg.includes('Connection failed') ||
    errMsg.includes('failed to connect') ||
    errMsg.includes('network')
  );
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMsg = error instanceof Error ? error.message : String(error);
  if (isOfflineError(error)) {
    setFirestoreOffline(true);
    console.warn("Detected Firestore connection failure in operation. Falling back to local demo mode.");
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
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
export function isDemoModeActive(userId?: string): boolean {
  if (userId && (userId === 'sandbox-guest-user' || userId.startsWith('sandbox-'))) {
    return true;
  }
  return localStorage.getItem('nexus_demo_mode') === 'true' || 
         localStorage.getItem('nexus_demo_user') !== null || 
         isFirestoreOffline;
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
  if (isDemoModeActive(userId)) {
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
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return savePaper(userId, paperId);
    }
    handleFirestoreError(error, OperationType.WRITE, `${path}/${userId}_${paperId}`);
  }
}

export async function unsavePaper(userId: string, paperId: string): Promise<void> {
  if (isDemoModeActive(userId)) {
    const papers = getLocalSavedPapers(userId);
    setLocalSavedPapers(userId, papers.filter(id => id !== paperId));
    return;
  }

  const path = 'saved_papers';
  try {
    const docRef = doc(db, path, `${userId}_${paperId}`);
    await deleteDoc(docRef);
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return unsavePaper(userId, paperId);
    }
    handleFirestoreError(error, OperationType.DELETE, `${path}/${userId}_${paperId}`);
  }
}

export async function getSavedPaperIds(userId: string): Promise<string[]> {
  if (isDemoModeActive(userId)) {
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
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getSavedPaperIds(userId);
    }
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// CONSULTATION INQUIRIES
export async function submitInquiry(inquiry: Omit<ConsultationInquiry, 'id' | 'status' | 'createdAt'>): Promise<string> {
  if (isDemoModeActive(inquiry.userId)) {
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
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return submitInquiry(inquiry);
    }
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserInquiries(userId: string): Promise<ConsultationInquiry[]> {
  if (isDemoModeActive(userId)) {
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
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getUserInquiries(userId);
    }
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// PARTNERSHIPS
export async function submitPartnership(partnership: Omit<PartnershipSubmission, 'id' | 'createdAt'>): Promise<string> {
  if (isDemoModeActive(partnership.userId)) {
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
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return submitPartnership(partnership);
    }
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserPartnerships(userId: string): Promise<PartnershipSubmission[]> {
  if (isDemoModeActive(userId)) {
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
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getUserPartnerships(userId);
    }
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updatePartnership(
  partnershipId: string, 
  userId: string, 
  updatedFields: Partial<Omit<PartnershipSubmission, 'id' | 'createdAt'>>
): Promise<void> {
  if (isDemoModeActive(userId)) {
    const partnerships = getLocalPartnerships(userId);
    const updated = partnerships.map(p => p.id === partnershipId ? { ...p, ...updatedFields } : p);
    setLocalPartnerships(userId, updated);
    return;
  }

  const path = 'partnership_submissions';
  try {
    const docRef = doc(db, path, partnershipId);
    await setDoc(docRef, {
      ...updatedFields,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return updatePartnership(partnershipId, userId, updatedFields);
    }
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${partnershipId}`);
  }
}

// CUSTOM RESEARCH PAPERS (CONTRIBUTIONS)
export async function addCustomPaper(paper: Omit<ResearchPaper, 'id'>, userId: string, userEmail: string): Promise<string> {
  if (isDemoModeActive(userId)) {
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
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return addCustomPaper(paper, userId, userEmail);
    }
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCustomPaper(paperId: string, paper: Partial<ResearchPaper>): Promise<void> {
  if (isDemoModeActive()) {
    const papers = getLocalCustomPapers();
    const updated = papers.map(p => {
      if (p.id === paperId) {
        return { ...p, ...paper };
      }
      return p;
    });
    setLocalCustomPapers(updated);
    return;
  }

  const path = 'custom_papers';
  try {
    const docRef = doc(db, path, paperId);
    await setDoc(docRef, paper, { merge: true });
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return updateCustomPaper(paperId, paper);
    }
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${paperId}`);
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
        isCustom: true,
        ...data,
      } as ResearchPaper);
    });
    // Merge both for complete sandboxing
    return [...papers, ...localPapers];
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getCustomPapers();
    }
    // If firebase fails entirely due to rules/restrictions, fallback gracefully to local custom papers
    console.warn('Firebase error fetching custom papers, falling back to local storage custom papers:', error);
    return localPapers;
  }
}

// USER PROFILES
export async function createUserProfile(userId: string, profile: {
  fullName: string;
  email: string;
  role: string;
  country: string;
  institution?: string;
  researchInterests?: string[];
  termsAccepted: boolean;
  needsOnboarding?: boolean;
}): Promise<void> {
  if (isDemoModeActive(userId)) {
    localStorage.setItem(`nexus_demo_profile_${userId}`, JSON.stringify({
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    return;
  }

  const path = 'users';
  try {
    const docRef = doc(db, path, userId);
    await setDoc(docRef, {
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
      country: profile.country,
      institution: profile.institution || '',
      researchInterests: profile.researchInterests || [],
      termsAccepted: profile.termsAccepted,
      needsOnboarding: profile.needsOnboarding !== undefined ? profile.needsOnboarding : false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return createUserProfile(userId, profile);
    }
    handleFirestoreError(error, OperationType.WRITE, `${path}/${userId}`);
  }
}

export async function getAllUsers(): Promise<any[]> {
  if (isFirestoreOffline) {
    return [];
  }
  const path = 'users';
  try {
    const colRef = collection(db, path);
    const querySnapshot = await getDocs(colRef);
    const list: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      list.push({
        uid: docSnap.id,
        id: docSnap.id,
        ...d,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
        updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt,
      });
    });
    return list;
  } catch (error) {
    console.error('Error fetching all users from Firestore:', error);
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
    }
    return [];
  }
}

export async function saveUserProfileByAdmin(userId: string, data: any): Promise<void> {
  // If in demo mode for this user, write to demo local storage profile
  const isDemo = userId === 'sandbox-admin-bola' || userId.startsWith('sandbox-');
  if (isFirestoreOffline || isDemo) {
    const profileKey = `nexus_demo_profile_${userId}`;
    const localProfile = localStorage.getItem(profileKey);
    const parsed = localProfile ? JSON.parse(localProfile) : {};
    localStorage.setItem(profileKey, JSON.stringify({ ...parsed, ...data, updatedAt: new Date().toISOString() }));
    return;
  }
  const path = 'users';
  try {
    const docRef = doc(db, path, userId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return saveUserProfileByAdmin(userId, data);
    }
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${userId}`);
  }
}

export async function getUserProfile(userId: string): Promise<any> {
  if (isDemoModeActive(userId)) {
    const data = localStorage.getItem(`nexus_demo_profile_${userId}`);
    if (!data && userId === 'sandbox-admin-bola') {
      const defaultAdminProfile = {
        fullName: 'Bola Adeyemi',
        email: 'bola.adeyemi@aurenix-research.org',
        role: 'super_admin',
        country: 'Nigeria',
        institution: 'Aurenix Core Labs',
        researchInterests: ['Bioenergy', 'Circular Economy', 'Nuclear Energy'],
        termsAccepted: true,
        verified: true,
        verificationStatus: 'verified'
      };
      localStorage.setItem(`nexus_demo_profile_${userId}`, JSON.stringify(defaultAdminProfile));
      return defaultAdminProfile;
    }
    return data ? JSON.parse(data) : null;
  }

  const path = 'users';
  try {
    const docRef = doc(db, path, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    // Check if the user is authenticated via Firebase but does not have a profile document yet (e.g. Google Sign-In registration)
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId && !currentUser.isAnonymous) {
      return {
        id: userId,
        needsOnboarding: true,
        fullName: currentUser.displayName || 'Google Scholar',
        email: currentUser.email || '',
        role: '',
        country: '',
        institution: '',
        researchInterests: [],
        termsAccepted: false
      };
    }

    return null;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getUserProfile(userId);
    }
    console.warn('Error fetching user profile from Firestore, trying local storage fallback:', error);
    const data = localStorage.getItem(`nexus_demo_profile_${userId}`);
    return data ? JSON.parse(data) : null;
  }
}

export async function applyForVerification(userId: string, researchCount: number, details: {
  institution: string;
  orcid?: string;
  googleScholar?: string;
  bio: string;
  researchInterests: string[];
}): Promise<void> {
  const updateData = {
    verificationStatus: 'pending',
    verificationSubmittedAt: new Date().toISOString(),
    uploadedResearchCount: researchCount,
    verificationDetails: details,
  };

  if (isDemoModeActive(userId)) {
    const profileKey = `nexus_demo_profile_${userId}`;
    const data = localStorage.getItem(profileKey);
    const profile = data ? JSON.parse(data) : {};
    const updatedProfile = { ...profile, ...updateData };
    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
    return;
  }

  const path = 'users';
  try {
    const docRef = doc(db, path, userId);
    await setDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return applyForVerification(userId, researchCount, details);
    }
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${userId}`);
  }
}

export async function approveVerification(userId: string, userProfile: any): Promise<void> {
  const updateData = {
    verificationStatus: 'verified',
    verified: true,
    verificationApprovedAt: new Date().toISOString(),
  };

  // 1. Update user profile in Firestore / local storage
  if (isDemoModeActive(userId)) {
    const profileKey = `nexus_demo_profile_${userId}`;
    const data = localStorage.getItem(profileKey);
    const profile = data ? JSON.parse(data) : {};
    const updatedProfile = { ...profile, ...updateData };
    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
  } else {
    const path = 'users';
    try {
      const docRef = doc(db, path, userId);
      await setDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user profile to verified in Firestore:', error);
    }
  }

  // 2. Create/add to the researchers collection so they appear on the Explore Researchers page!
  const newResearcher: Researcher = {
    id: userId,
    fullName: userProfile.fullName || 'Verified Researcher',
    profilePhoto: 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq', // default elegant logo/avatar
    role: userProfile.role || 'Senior Researcher',
    institution: userProfile.verificationDetails?.institution || userProfile.institution || 'Aurenix Research Network',
    country: userProfile.country || 'Nigeria',
    bio: userProfile.verificationDetails?.bio || 'Verified academic contributor to the Aurenix Research repository.',
    researchInterests: userProfile.verificationDetails?.researchInterests || userProfile.researchInterests || ['Bioenergy'],
    verified: true,
    followers: [],
    following: 0,
    publicationCount: userProfile.uploadedResearchCount || 3,
    downloads: 12,
    views: 45,
    citations: 2,
    createdAt: new Date().toISOString(),
    orcid: userProfile.verificationDetails?.orcid || '',
    googleScholar: userProfile.verificationDetails?.googleScholar || '',
  };

  if (isDemoModeActive(userId)) {
    const researchers = getLocalResearchers();
    // Prevent duplicate entries
    const filtered = researchers.filter(r => r.id !== userId);
    setLocalResearchers([...filtered, newResearcher]);
  } else {
    try {
      const docRef = doc(db, 'researchers', userId);
      await setDoc(docRef, newResearcher, { merge: true });
    } catch (error) {
      console.warn('Error creating researcher entry in Firestore, saving to local list:', error);
      const researchers = getLocalResearchers();
      const filtered = researchers.filter(r => r.id !== userId);
      setLocalResearchers([...filtered, newResearcher]);
    }
  }
}

// --- RESEARCHERS & PUBLICATIONS SERVICES ---

// Helper to get/set local storage for demo
function getLocalResearchers(): Researcher[] {
  const data = localStorage.getItem('nexus_demo_researchers');
  if (!data) {
    localStorage.setItem('nexus_demo_researchers', JSON.stringify(SEED_RESEARCHERS));
    return SEED_RESEARCHERS;
  }
  return JSON.parse(data);
}

function setLocalResearchers(researchers: Researcher[]) {
  localStorage.setItem('nexus_demo_researchers', JSON.stringify(researchers));
}

function getLocalPublications(): Publication[] {
  const data = localStorage.getItem('nexus_demo_publications');
  if (!data) {
    localStorage.setItem('nexus_demo_publications', JSON.stringify(SEED_PUBLICATIONS));
    return SEED_PUBLICATIONS;
  }
  return JSON.parse(data);
}

function setLocalPublications(publications: Publication[]) {
  localStorage.setItem('nexus_demo_publications', JSON.stringify(publications));
}

// FETCH RESEARCHERS
export async function getResearchers(): Promise<Researcher[]> {
  if (isDemoModeActive()) {
    return getLocalResearchers();
  }

  const path = 'researchers';
  try {
    const colRef = collection(db, path);
    const querySnapshot = await getDocs(colRef);
    const list: Researcher[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        fullName: data.fullName || '',
        profilePhoto: data.profilePhoto || '',
        role: data.role || '',
        institution: data.institution || '',
        country: data.country || '',
        bio: data.bio || '',
        researchInterests: data.researchInterests || [],
        verified: !!data.verified,
        followers: data.followers || [],
        following: data.following || 0,
        publicationCount: data.publicationCount || 0,
        downloads: data.downloads || 0,
        views: data.views || 0,
        citations: data.citations || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        orcid: data.orcid,
        googleScholar: data.googleScholar,
        linkedin: data.linkedin,
        email: data.email,
        website: data.website,
        qualifications: data.qualifications || [],
        experienceYears: data.experienceYears || 0
      });
    });

    if (list.length === 0) {
      // Try to seed Firestore if empty
      try {
        for (const res of SEED_RESEARCHERS) {
          const docRef = doc(db, 'researchers', res.id);
          await setDoc(docRef, res);
        }
        return SEED_RESEARCHERS;
      } catch (seedErr) {
        if (isOfflineError(seedErr)) {
          setFirestoreOffline(true);
          return getResearchers();
        }
        console.warn('Could not seed Firestore researchers, returning static seed data:', seedErr);
        return SEED_RESEARCHERS;
      }
    }
    return list;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getResearchers();
    }
    console.warn('Error fetching researchers from Firestore, falling back to local seed:', error);
    return getLocalResearchers();
  }
}

export async function getResearcherById(id: string): Promise<Researcher | null> {
  const researchers = await getResearchers();
  return researchers.find(r => r.id === id) || null;
}

// FETCH PUBLICATIONS
export async function getPublications(): Promise<Publication[]> {
  if (isDemoModeActive()) {
    return getLocalPublications();
  }

  const path = 'publications';
  try {
    const colRef = collection(db, path);
    const querySnapshot = await getDocs(colRef);
    const list: Publication[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        researcherId: data.researcherId || '',
        title: data.title || '',
        abstract: data.abstract || '',
        category: data.category || '',
        keywords: data.keywords || [],
        pdfUrl: data.pdfUrl || '',
        coverImage: data.coverImage,
        downloads: data.downloads || 0,
        views: data.views || 0,
        citations: data.citations || 0,
        createdAt: data.createdAt || new Date().toISOString()
      });
    });

    if (list.length === 0) {
      // Try to seed Firestore if empty
      try {
        for (const pub of SEED_PUBLICATIONS) {
          const docRef = doc(db, 'publications', pub.id);
          await setDoc(docRef, pub);
        }
        return SEED_PUBLICATIONS;
      } catch (seedErr) {
        if (isOfflineError(seedErr)) {
          setFirestoreOffline(true);
          return getPublications();
        }
        console.warn('Could not seed Firestore publications, returning static seed data:', seedErr);
        return SEED_PUBLICATIONS;
      }
    }
    return list;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getPublications();
    }
    console.warn('Error fetching publications from Firestore, falling back to local seed:', error);
    return getLocalPublications();
  }
}

export async function getPublicationsByResearcherId(researcherId: string): Promise<Publication[]> {
  const publications = await getPublications();
  return publications.filter(p => p.researcherId === researcherId);
}

// FOLLOW SYSTEM
export async function followResearcher(userId: string, researcherId: string): Promise<boolean> {
  // Returns true if now following, false if unfollowed
  if (isDemoModeActive()) {
    const researchers = getLocalResearchers();
    let isFollowing = false;
    const updated = researchers.map(r => {
      if (r.id === researcherId) {
        const index = r.followers.indexOf(userId);
        let followers = [...r.followers];
        if (index > -1) {
          followers.splice(index, 1);
          isFollowing = false;
        } else {
          followers.push(userId);
          isFollowing = true;
        }
        return { ...r, followers };
      }
      return r;
    });
    setLocalResearchers(updated);
    return isFollowing;
  }

  try {
    const docRef = doc(db, 'researchers', researcherId);
    const researchers = await getResearchers();
    const researcher = researchers.find(r => r.id === researcherId);
    if (!researcher) return false;

    let followers = [...researcher.followers];
    const index = followers.indexOf(userId);
    let isFollowing = false;
    if (index > -1) {
      followers.splice(index, 1);
      isFollowing = false;
    } else {
      followers.push(userId);
      isFollowing = true;
    }

    await setDoc(docRef, { followers }, { merge: true });
    return isFollowing;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return followResearcher(userId, researcherId);
    }
    console.warn('Error toggling follow state on Firestore:', error);
    // Fallback locally
    const researchers = getLocalResearchers();
    let isFollowing = false;
    const updated = researchers.map(r => {
      if (r.id === researcherId) {
        const index = r.followers.indexOf(userId);
        let followers = [...r.followers];
        if (index > -1) {
          followers.splice(index, 1);
          isFollowing = false;
        } else {
          followers.push(userId);
          isFollowing = true;
        }
        return { ...r, followers };
      }
      return r;
    });
    setLocalResearchers(updated);
    return isFollowing;
  }
}

// METRICS INCREMENTS
export async function incrementResearcherMetric(researcherId: string, metric: 'views' | 'downloads' | 'citations'): Promise<void> {
  if (isDemoModeActive()) {
    const researchers = getLocalResearchers();
    const updated = researchers.map(r => {
      if (r.id === researcherId) {
        return { ...r, [metric]: (r[metric] || 0) + 1 };
      }
      return r;
    });
    setLocalResearchers(updated);
    return;
  }

  try {
    const docRef = doc(db, 'researchers', researcherId);
    const researchers = await getResearchers();
    const researcher = researchers.find(r => r.id === researcherId);
    if (researcher) {
      await setDoc(docRef, { [metric]: (researcher[metric] || 0) + 1 }, { merge: true });
    }
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return incrementResearcherMetric(researcherId, metric);
    }
    console.warn('Error incrementing researcher metric on Firestore:', error);
    // Fallback locally
    const researchers = getLocalResearchers();
    const updated = researchers.map(r => {
      if (r.id === researcherId) {
        return { ...r, [metric]: (r[metric] || 0) + 1 };
      }
      return r;
    });
    setLocalResearchers(updated);
  }
}

export async function incrementPublicationMetric(publicationId: string, metric: 'views' | 'downloads' | 'citations'): Promise<void> {
  if (isDemoModeActive()) {
    const publications = getLocalPublications();
    const updated = publications.map(p => {
      if (p.id === publicationId) {
        return { ...p, [metric]: (p[metric] || 0) + 1 };
      }
      return p;
    });
    setLocalPublications(updated);
    return;
  }

  try {
    const docRef = doc(db, 'publications', publicationId);
    const publications = await getPublications();
    const publication = publications.find(p => p.id === publicationId);
    if (publication) {
      await setDoc(docRef, { [metric]: (publication[metric] || 0) + 1 }, { merge: true });
    }
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return incrementPublicationMetric(publicationId, metric);
    }
    console.warn('Error incrementing publication metric on Firestore:', error);
    // Fallback locally
    const publications = getLocalPublications();
    const updated = publications.map(p => {
      if (p.id === publicationId) {
        return { ...p, [metric]: (p[metric] || 0) + 1 };
      }
      return p;
    });
    setLocalPublications(updated);
  }
}

// ==========================================
// INNOVATION PROJECTS HELPERS
// ==========================================

export interface InnovationProject {
  id: string;
  userId: string;
  title: string;
  trl: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Archived';
  fundingStatus: 'Pending' | 'Approved' | 'Funded';
  progress: number;
  industryPartner: string;
  laboratoryPartner: string;
  description?: string;
  lastUpdated: string;
}

function getLocalProjects(userId: string): InnovationProject[] {
  const data = localStorage.getItem(`nexus_demo_projects_${userId}`);
  if (data) return JSON.parse(data);
  
  // Default seed projects
  const defaults: InnovationProject[] = [
    {
      id: 'proj_1',
      userId,
      title: 'Solar-Powered Bio-waste Digester for Off-grid Agro-processors',
      trl: 6,
      status: 'Active',
      fundingStatus: 'Funded',
      progress: 75,
      industryPartner: 'GreenCycle West Africa Ltd',
      laboratoryPartner: 'Renewable Energy Lab, UNILAG',
      description: 'Developing an automated, off-grid digester combining waste heat from solar panels to accelerate organic solid waste degradation into high-yield methane.',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'proj_2',
      userId,
      title: 'Decentralized Microgrid Controller with Smart Contract Load-Shedding',
      trl: 4,
      status: 'Draft',
      fundingStatus: 'Pending',
      progress: 35,
      industryPartner: 'NexaPower Grid Solutions',
      laboratoryPartner: 'Smart Power Systems Center, ABU',
      description: 'A hardware-in-the-loop microgrid controller using decentralized logic to coordinate agricultural processing loads based on localized battery states.',
      lastUpdated: new Date().toISOString()
    }
  ];
  localStorage.setItem(`nexus_demo_projects_${userId}`, JSON.stringify(defaults));
  return defaults;
}

function setLocalProjects(userId: string, projects: InnovationProject[]) {
  localStorage.setItem(`nexus_demo_projects_${userId}`, JSON.stringify(projects));
}

export async function getInnovationProjects(userId: string): Promise<InnovationProject[]> {
  if (isDemoModeActive(userId)) {
    return getLocalProjects(userId);
  }

  const path = 'innovation_projects';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const projects: InnovationProject[] = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() } as InnovationProject);
    });

    if (projects.length === 0) {
      // Seed initial projects to firestore
      const defaults = getLocalProjects(userId);
      for (const p of defaults) {
        await setDoc(doc(db, path, p.id), p);
      }
      return defaults;
    }
    return projects;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getInnovationProjects(userId);
    }
    console.warn('Firestore getInnovationProjects error:', error);
    return getLocalProjects(userId);
  }
}

export async function addInnovationProject(userId: string, project: Omit<InnovationProject, 'id' | 'userId' | 'lastUpdated'>): Promise<string> {
  const newId = 'proj_' + Math.random().toString(36).substring(2, 9);
  const fullProject: InnovationProject = {
    ...project,
    id: newId,
    userId,
    lastUpdated: new Date().toISOString()
  };

  if (isDemoModeActive(userId)) {
    const list = getLocalProjects(userId);
    setLocalProjects(userId, [fullProject, ...list]);
    return newId;
  }

  const path = 'innovation_projects';
  try {
    await setDoc(doc(db, path, newId), fullProject);
    return newId;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return addInnovationProject(userId, project);
    }
    console.warn('Firestore addInnovationProject error:', error);
    const list = getLocalProjects(userId);
    setLocalProjects(userId, [fullProject, ...list]);
    return newId;
  }
}

export async function updateInnovationProject(userId: string, projectId: string, fields: Partial<InnovationProject>): Promise<void> {
  if (isDemoModeActive(userId)) {
    const list = getLocalProjects(userId);
    const updated = list.map(p => p.id === projectId ? { ...p, ...fields, lastUpdated: new Date().toISOString() } : p);
    setLocalProjects(userId, updated);
    return;
  }

  const path = 'innovation_projects';
  try {
    const docRef = doc(db, path, projectId);
    await setDoc(docRef, { ...fields, lastUpdated: new Date().toISOString() }, { merge: true });
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return updateInnovationProject(userId, projectId, fields);
    }
    console.warn('Firestore updateInnovationProject error:', error);
    const list = getLocalProjects(userId);
    const updated = list.map(p => p.id === projectId ? { ...p, ...fields, lastUpdated: new Date().toISOString() } : p);
    setLocalProjects(userId, updated);
  }
}

export async function deleteInnovationProject(userId: string, projectId: string): Promise<void> {
  if (isDemoModeActive(userId)) {
    const list = getLocalProjects(userId);
    setLocalProjects(userId, list.filter(p => p.id !== projectId));
    return;
  }

  const path = 'innovation_projects';
  try {
    await deleteDoc(doc(db, path, projectId));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return deleteInnovationProject(userId, projectId);
    }
    console.warn('Firestore deleteInnovationProject error:', error);
    const list = getLocalProjects(userId);
    setLocalProjects(userId, list.filter(p => p.id !== projectId));
  }
}

// ==========================================
// NOTIFICATIONS HELPERS
// ==========================================

export interface UserNotification {
  id: string;
  userId: string;
  type: 'follower' | 'alliance' | 'grant' | 'citation' | 'comment' | 'workspace' | 'deadline';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

function getLocalNotifications(userId: string): UserNotification[] {
  const data = localStorage.getItem(`nexus_demo_notifications_${userId}`);
  if (data) return JSON.parse(data);

  const defaults: UserNotification[] = [
    {
      id: 'notif_1',
      userId,
      type: 'follower',
      title: 'New Follower Joined',
      message: 'Dr. Sarah Adebayo, Lab Director at UNILAG, started following your profile.',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString() // 30 mins ago
    },
    {
      id: 'notif_2',
      userId,
      type: 'alliance',
      title: 'Alliance Invitation Received',
      message: 'EcoEnergy Alliance Nigeria invited you to join the Solar-Bioenergy Integration Workgroup.',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString() // 3 hours ago
    },
    {
      id: 'notif_3',
      userId,
      type: 'grant',
      title: 'New Funding Opportunity Match',
      message: 'The African Climate Foundation launched a $50k grant for Off-grid Agricultural Digitization.',
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString() // 1 day ago
    },
    {
      id: 'notif_4',
      userId,
      type: 'citation',
      title: 'Research Citation Identified',
      message: 'Your research paper on "Off-Grid Bio-waste Conversions" was cited in Journal of African Circular Science.',
      isRead: true,
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString() // 2 days ago
    }
  ];
  localStorage.setItem(`nexus_demo_notifications_${userId}`, JSON.stringify(defaults));
  return defaults;
}

function setLocalNotifications(userId: string, notifications: UserNotification[]) {
  localStorage.setItem(`nexus_demo_notifications_${userId}`, JSON.stringify(notifications));
}

export async function getUserNotifications(userId: string): Promise<UserNotification[]> {
  if (isDemoModeActive(userId)) {
    return getLocalNotifications(userId);
  }

  const path = 'user_notifications';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const notifs: UserNotification[] = [];
    snapshot.forEach(doc => {
      notifs.push({ id: doc.id, ...doc.data() } as UserNotification);
    });

    if (notifs.length === 0) {
      const defaults = getLocalNotifications(userId);
      for (const n of defaults) {
        await setDoc(doc(db, path, n.id), n);
      }
      return defaults;
    }
    // Sort by creation date descending
    return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getUserNotifications(userId);
    }
    console.warn('Firestore getUserNotifications error:', error);
    return getLocalNotifications(userId);
  }
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  if (isDemoModeActive(userId)) {
    const list = getLocalNotifications(userId);
    const updated = list.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    setLocalNotifications(userId, updated);
    return;
  }

  const path = 'user_notifications';
  try {
    const docRef = doc(db, path, notificationId);
    await setDoc(docRef, { isRead: true }, { merge: true });
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return markNotificationAsRead(userId, notificationId);
    }
    console.warn('Firestore markNotificationAsRead error:', error);
    const list = getLocalNotifications(userId);
    const updated = list.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    setLocalNotifications(userId, updated);
  }
}

export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  if (isDemoModeActive(userId)) {
    const list = getLocalNotifications(userId);
    setLocalNotifications(userId, list.filter(n => n.id !== notificationId));
    return;
  }

  const path = 'user_notifications';
  try {
    await deleteDoc(doc(db, path, notificationId));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return deleteNotification(userId, notificationId);
    }
    console.warn('Firestore deleteNotification error:', error);
    const list = getLocalNotifications(userId);
    setLocalNotifications(userId, list.filter(n => n.id !== notificationId));
  }
}

export async function addNotification(userId: string, notif: Omit<UserNotification, 'id' | 'userId' | 'createdAt' | 'isRead'>): Promise<string> {
  const newId = 'notif_' + Math.random().toString(36).substring(2, 9);
  const fullNotif: UserNotification = {
    ...notif,
    id: newId,
    userId,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  if (isDemoModeActive(userId)) {
    const list = getLocalNotifications(userId);
    setLocalNotifications(userId, [fullNotif, ...list]);
    return newId;
  }

  const path = 'user_notifications';
  try {
    await setDoc(doc(db, path, newId), fullNotif);
    return newId;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return addNotification(userId, notif);
    }
    console.warn('Firestore addNotification error:', error);
    const list = getLocalNotifications(userId);
    setLocalNotifications(userId, [fullNotif, ...list]);
    return newId;
  }
}

// ==========================================
// UPCOMING DEADLINES HELPERS
// ==========================================

export interface UserDeadline {
  id: string;
  userId: string;
  category: 'Alliance' | 'Grant' | 'Milestone' | 'Deliverable' | 'Review' | 'Report';
  title: string;
  date: string;
  description: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

function getLocalDeadlines(userId: string): UserDeadline[] {
  const data = localStorage.getItem(`nexus_demo_deadlines_${userId}`);
  if (data) return JSON.parse(data);

  const defaults: UserDeadline[] = [
    {
      id: 'dl_1',
      userId,
      category: 'Grant',
      title: 'African Climate Foundation Grant Proposal Pitch',
      date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split('T')[0], // 3 days from now
      description: 'Prepare and upload the five-page concept slide deck for solar integration.',
      status: 'Pending'
    },
    {
      id: 'dl_2',
      userId,
      category: 'Milestone',
      title: 'TRL-6 Bio-waste digester prototype trial run',
      date: new Date(Date.now() + 10 * 24 * 3600000).toISOString().split('T')[0], // 10 days from now
      description: 'Host initial physical validation session at UNILAG laboratories.',
      status: 'Pending'
    },
    {
      id: 'dl_3',
      userId,
      category: 'Alliance',
      title: 'EcoEnergy Alliance Application Deadline',
      date: new Date(Date.now() + 14 * 24 * 3600000).toISOString().split('T')[0], // 14 days from now
      description: 'Provide final institutional signoff letters and ORCID references.',
      status: 'Pending'
    }
  ];
  localStorage.setItem(`nexus_demo_deadlines_${userId}`, JSON.stringify(defaults));
  return defaults;
}

function setLocalDeadlines(userId: string, deadlines: UserDeadline[]) {
  localStorage.setItem(`nexus_demo_deadlines_${userId}`, JSON.stringify(deadlines));
}

export async function getUserDeadlines(userId: string): Promise<UserDeadline[]> {
  if (isDemoModeActive(userId)) {
    return getLocalDeadlines(userId);
  }

  const path = 'user_deadlines';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list: UserDeadline[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as UserDeadline);
    });

    if (list.length === 0) {
      const defaults = getLocalDeadlines(userId);
      for (const d of defaults) {
        await setDoc(doc(db, path, d.id), d);
      }
      return defaults;
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getUserDeadlines(userId);
    }
    console.warn('Firestore getUserDeadlines error:', error);
    return getLocalDeadlines(userId);
  }
}

export async function addDeadline(userId: string, deadline: Omit<UserDeadline, 'id' | 'userId' | 'status'>): Promise<string> {
  const newId = 'dl_' + Math.random().toString(36).substring(2, 9);
  const fullDeadline: UserDeadline = {
    ...deadline,
    id: newId,
    userId,
    status: 'Pending'
  };

  if (isDemoModeActive(userId)) {
    const list = getLocalDeadlines(userId);
    setLocalDeadlines(userId, [...list, fullDeadline]);
    return newId;
  }

  const path = 'user_deadlines';
  try {
    await setDoc(doc(db, path, newId), fullDeadline);
    return newId;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return addDeadline(userId, deadline);
    }
    console.warn('Firestore addDeadline error:', error);
    const list = getLocalDeadlines(userId);
    setLocalDeadlines(userId, [...list, fullDeadline]);
    return newId;
  }
}

export async function deleteDeadline(userId: string, deadlineId: string): Promise<void> {
  if (isDemoModeActive(userId)) {
    const list = getLocalDeadlines(userId);
    setLocalDeadlines(userId, list.filter(d => d.id !== deadlineId));
    return;
  }

  const path = 'user_deadlines';
  try {
    await deleteDoc(doc(db, path, deadlineId));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return deleteDeadline(userId, deadlineId);
    }
    console.warn('Firestore deleteDeadline error:', error);
    const list = getLocalDeadlines(userId);
    setLocalDeadlines(userId, list.filter(d => d.id !== deadlineId));
  }
}



