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
import { ResearchPaper, ConsultationInquiry, PartnershipSubmission, Researcher, Publication, CommunityPost, CommunityComment, Testimonial } from '../types';
import { SEED_RESEARCHERS, SEED_PUBLICATIONS } from './researchersSeed';
import { checkProfileCompleteness } from '../utils/profileValidation';

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
  console.error('Firestore Error Diagnostic Log:', JSON.stringify(errInfo));
  if (errMsg.includes('permission') || errMsg.includes('Missing or insufficient permissions')) {
    throw new Error('Database access restriction encountered. Operation processed in local mode.');
  }
  throw new Error(errMsg || 'Database request could not be completed. Please try again.');
}

// SANITIZE PAYLOADS FOR FIRESTORE (REMOVES UNDEFINED VALUES RECURSIVELY)
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }
  return data;
}

// LOCAL STORAGE SANDBOX FALLBACK HELPERS
export function isDemoModeActive(userId?: string): boolean {
  if (userId && (userId === 'sandbox-guest-user' || userId === 'demo-scholar-guest' || userId.startsWith('sandbox-') || userId.startsWith('demo-'))) {
    return true;
  }
  // If an authenticated, real Firebase user is active and online, prioritize real Firestore
  if (auth.currentUser && !auth.currentUser.isAnonymous && auth.currentUser.uid === userId && !isFirestoreOffline) {
    return false;
  }
  return localStorage.getItem('nexus_demo_mode') === 'true' || 
         localStorage.getItem('nexus_demo_user') !== null || 
         isFirestoreOffline;
}

export function getLocalSavedPapers(userId: string): string[] {
  if (!userId) return [];
  const data = localStorage.getItem(`nexus_demo_saved_papers_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function setLocalSavedPapers(userId: string, papers: string[]) {
  if (!userId) return;
  localStorage.setItem(`nexus_demo_saved_papers_${userId}`, JSON.stringify(papers));
}

export function getLocalInquiries(userId: string): ConsultationInquiry[] {
  if (!userId) return [];
  const data = localStorage.getItem(`nexus_demo_inquiries_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function setLocalInquiries(userId: string, inquiries: ConsultationInquiry[]) {
  if (!userId) return;
  localStorage.setItem(`nexus_demo_inquiries_${userId}`, JSON.stringify(inquiries));
}

export function getLocalPartnerships(userId: string): PartnershipSubmission[] {
  if (!userId) return [];
  const data = localStorage.getItem(`nexus_demo_partnerships_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function setLocalPartnerships(userId: string, partnerships: PartnershipSubmission[]) {
  if (!userId) return;
  localStorage.setItem(`nexus_demo_partnerships_${userId}`, JSON.stringify(partnerships));
}

export function getLocalCustomPapers(): ResearchPaper[] {
  const data = localStorage.getItem(`nexus_demo_custom_papers`);
  return data ? JSON.parse(data) : [];
}

export function setLocalCustomPapers(papers: ResearchPaper[]) {
  localStorage.setItem(`nexus_demo_custom_papers`, JSON.stringify(papers));
}

// SAVED PAPERS
export async function savePaper(userId: string, paperId: string): Promise<void> {
  if (!userId || isDemoModeActive(userId) || !auth.currentUser) {
    const papers = getLocalSavedPapers(userId || 'guest');
    if (!papers.includes(paperId)) {
      setLocalSavedPapers(userId || 'guest', [...papers, paperId]);
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
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('permission') || errMsg.includes('insufficient')) {
      const papers = getLocalSavedPapers(userId);
      if (!papers.includes(paperId)) {
        setLocalSavedPapers(userId, [...papers, paperId]);
      }
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, `${path}/${userId}_${paperId}`);
  }
}

export async function unsavePaper(userId: string, paperId: string): Promise<void> {
  if (!userId || isDemoModeActive(userId) || !auth.currentUser) {
    const papers = getLocalSavedPapers(userId || 'guest');
    setLocalSavedPapers(userId || 'guest', papers.filter(id => id !== paperId));
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
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('permission') || errMsg.includes('insufficient')) {
      const papers = getLocalSavedPapers(userId);
      setLocalSavedPapers(userId, papers.filter(id => id !== paperId));
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, `${path}/${userId}_${paperId}`);
  }
}

export async function getSavedPaperIds(userId: string): Promise<string[]> {
  if (!userId || isDemoModeActive(userId) || !auth.currentUser) {
    return getLocalSavedPapers(userId || 'guest');
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
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('permission') || errMsg.includes('insufficient') || !auth.currentUser) {
      console.warn("Falling back to local saved papers due to auth state or permission restriction.");
      return getLocalSavedPapers(userId);
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
    const docRef = await addDoc(colRef, sanitizeForFirestore({
      ...inquiry,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }));
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
  if (!userId || isDemoModeActive(userId) || !auth.currentUser) {
    return getLocalInquiries(userId || 'guest');
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
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('permission') || errMsg.includes('insufficient') || !auth.currentUser) {
      return getLocalInquiries(userId);
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
    const docRef = await addDoc(colRef, sanitizeForFirestore({
      ...partnership,
      createdAt: new Date().toISOString(),
    }));
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
  if (!userId || isDemoModeActive(userId) || !auth.currentUser) {
    return getLocalPartnerships(userId || 'guest');
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
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes('permission') || errMsg.includes('insufficient') || !auth.currentUser) {
      return getLocalPartnerships(userId);
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

let customPapersCache: { timestamp: number; data: ResearchPaper[] } | null = null;
const CACHE_TTL_MS = 5000;

export function invalidateCustomPapersCache() {
  customPapersCache = null;
}

// CUSTOM RESEARCH PAPERS (CONTRIBUTIONS)
export async function addCustomPaper(paper: Omit<ResearchPaper, 'id'>, userId: string, userEmail: string): Promise<string> {
  invalidateCustomPapersCache();
  if (isDemoModeActive(userId)) {
    const papers = getLocalCustomPapers();
    const mockId = 'paper_' + Math.random().toString(36).substring(2, 9);
    const newPaper: ResearchPaper = {
      ...paper,
      id: mockId,
      isCustom: true
    };
    setLocalCustomPapers([...papers, newPaper]);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('custom-papers-updated', { detail: { paperId: mockId, userId } }));
      window.dispatchEvent(new CustomEvent('research-updated', { detail: { paperId: mockId, userId } }));
    }
    return mockId;
  }

  const path = 'custom_papers';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, sanitizeForFirestore({
      ...paper,
      isCustom: true,
      userId,
      userEmail,
      createdAt: new Date().toISOString(),
    }));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('custom-papers-updated', { detail: { paperId: docRef.id, userId } }));
      window.dispatchEvent(new CustomEvent('research-updated', { detail: { paperId: docRef.id, userId } }));
    }
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
  invalidateCustomPapersCache();
  const papers = getLocalCustomPapers();
  const updated = papers.map(p => {
    if (p.id === paperId) {
      return { ...p, ...paper };
    }
    return p;
  });
  setLocalCustomPapers(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('custom-papers-updated', { detail: { paperId } }));
    window.dispatchEvent(new CustomEvent('research-updated', { detail: { paperId } }));
  }

  if (isDemoModeActive()) {
    return;
  }

  const path = 'custom_papers';
  try {
    const docRef = doc(db, path, paperId);
    await setDoc(docRef, sanitizeForFirestore(paper), { merge: true });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('custom-papers-updated', { detail: { paperId } }));
      window.dispatchEvent(new CustomEvent('research-updated', { detail: { paperId } }));
    }
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return updateCustomPaper(paperId, paper);
    }
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${paperId}`);
  }
}

export async function deleteCustomPaper(paperId: string, requestingUserId?: string, requestingUserEmail?: string): Promise<void> {
  const papers = getLocalCustomPapers();
  const target = papers.find(p => p.id === paperId);
  
  // Enforce ownership: only the user who published it (or admin) can delete it
  if (target && requestingUserId) {
    const isOwner = target.userId === requestingUserId || 
      (Boolean(requestingUserEmail) && Boolean(target.userEmail) && target.userEmail.toLowerCase() === requestingUserEmail.toLowerCase());
    const isAdmin = ['bola.adeyemi@aurenix-research.org', 'adeyemibola2569@gmail.com', 'egburedipraise@gmail.com', 'aurenixresearch@gmail.com'].includes(requestingUserEmail || '');
    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized: Only the researcher or organization that published this research can delete it.');
    }
  }

  invalidateCustomPapersCache();
  const updated = papers.filter(p => p.id !== paperId);
  setLocalCustomPapers(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('custom-papers-updated', { detail: { paperId } }));
    window.dispatchEvent(new CustomEvent('research-updated', { detail: { paperId } }));
  }

  if (isDemoModeActive()) {
    return;
  }

  const path = 'custom_papers';
  try {
    const docRef = doc(db, path, paperId);
    await deleteDoc(docRef);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('custom-papers-updated', { detail: { paperId } }));
      window.dispatchEvent(new CustomEvent('research-updated', { detail: { paperId } }));
    }
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, `${path}/${paperId}`);
  }
}

export async function getCustomPapers(): Promise<ResearchPaper[]> {
  if (customPapersCache && (Date.now() - customPapersCache.timestamp < CACHE_TTL_MS)) {
    return customPapersCache.data;
  }

  const localPapers = getLocalCustomPapers();

  if (isDemoModeActive()) {
    customPapersCache = { timestamp: Date.now(), data: localPapers };
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
    // Merge both for complete sandboxing and deduplicate by paper id
    const paperMap = new Map<string, ResearchPaper>();
    for (const p of localPapers) {
      if (p && p.id) paperMap.set(p.id, p);
    }
    for (const p of papers) {
      if (p && p.id) paperMap.set(p.id, p);
    }
    const result = Array.from(paperMap.values());
    customPapersCache = { timestamp: Date.now(), data: result };
    return result;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getCustomPapers();
    }
    // If firebase fails entirely due to rules/restrictions, fallback gracefully to local custom papers
    console.warn('Firebase error fetching custom papers, falling back to local storage custom papers:', error);
    customPapersCache = { timestamp: Date.now(), data: localPapers };
    return localPapers;
  }
}

// Helper to identify individual researcher/professor/student roles and exclude organizations/industry stakeholders
export function isIndividualResearcherRole(role?: string, profile?: any): boolean {
  if (!role && !profile) return false;
  if (profile) {
    if (
      profile.isOrganization === true || 
      profile.organizationType || 
      profile.accountType === 'organization' || 
      profile.accountType === 'industry' ||
      profile.accountType === 'institution' ||
      profile.accountType === 'ngo' ||
      profile.accountType === 'government' ||
      profile.accountType === 'corporate' ||
      profile.accountType === 'enterprise' ||
      profile.accountType === 'funder' ||
      profile.accountType === 'publisher' ||
      profile.entityType === 'organization' ||
      profile.entityType === 'industry' ||
      profile.stakeholderType === 'industry' ||
      profile.stakeholderType === 'organization' ||
      profile.stakeholderType === 'corporate' ||
      profile.stakeholderType === 'ngo' ||
      profile.stakeholderType === 'institution' ||
      profile.stakeholderType === 'government' ||
      profile.userType === 'industry' ||
      profile.userType === 'organization' ||
      profile.userType === 'institution' ||
      profile.userType === 'ngo' ||
      profile.userType === 'government' ||
      profile.publisherVerificationLevel
    ) {
      return false;
    }
  }
  const r = (role || (profile?.role || profile?.professionalTitle || profile?.currentPosition || '')).toLowerCase().trim();
  const name = (profile?.fullName || profile?.displayName || profile?.organizationName || '').toLowerCase().trim();

  // If empty role and empty name
  if (!r && !name) return false;

  // Strict list of non-individual / organization / industry terms to exclude unconditionally
  const excludedKeywords = [
    'industry',
    'organisation',
    'organization',
    'enterprise',
    'company',
    'corporate',
    'corporation',
    'business',
    'firm',
    'commercial',
    'ngo',
    'non-governmental',
    'non-profit',
    'non profit',
    'civil society',
    'institution',
    'institutional',
    'ministry',
    'government',
    'public agency',
    'parastatal',
    'funder',
    'funding',
    'investor',
    'donor',
    'sponsor',
    'consortium',
    'publisher',
    'association',
    'foundation',
    'partner',
    'agency',
    'development partner'
  ];

  for (const kw of excludedKeywords) {
    if (r.includes(kw) || name.includes(kw)) {
      return false;
    }
  }

  // Exact matches for non-researcher roles
  const nonAcademicExactRoles = [
    'industry',
    'industry professional',
    'industry partner',
    'institution',
    'government',
    'government agency',
    'ngo',
    'ngo / development',
    'other',
    'funder',
    'funding body',
    'publisher',
    'organization',
    'organisation'
  ];
  if (nonAcademicExactRoles.includes(r)) {
    return false;
  }

  // Academic whitelist check (must have genuine academic / scholarly / researcher role)
  const validAcademicKeywords = [
    'researcher',
    'scientist',
    'professor',
    'lecturer',
    'student',
    'phd',
    'postdoc',
    'post-doc',
    'scholar',
    'fellow',
    'faculty',
    'instructor',
    'academic',
    'candidate',
    'investigator',
    'graduate',
    'dean',
    'chair',
    'chemist',
    'biologist',
    'physicist',
    'engineer',
    'analyst',
    'author',
    'specialist',
    'innovator'
  ];

  return validAcademicKeywords.some(kw => r.includes(kw));
}

// Helper to identify if an account is an organization / institution / corporate / NGO entity (both existing & new records)
export function isOrganizationAccount(profile?: any): boolean {
  if (!profile) return false;
  if (
    profile.isOrganization === true ||
    profile.organizationType ||
    profile.accountType === 'institution' ||
    profile.accountType === 'organization' ||
    profile.accountType === 'industry' ||
    profile.accountType === 'ngo' ||
    profile.accountType === 'government' ||
    profile.accountType === 'corporate' ||
    profile.accountType === 'enterprise' ||
    profile.accountType === 'funder' ||
    profile.accountType === 'publisher' ||
    profile.entityType === 'organization' ||
    profile.entityType === 'industry' ||
    profile.stakeholderType ||
    profile.publisherVerificationLevel
  ) {
    return true;
  }
  const role = (profile.userRole || profile.role || profile.professionalTitle || '').toLowerCase().trim();
  const orgKeywords = [
    'institution', 'industry', 'government', 'ngo', 'other', 'publisher', 
    'company', 'investor', 'university', 'lab', 'stakeholder', 'corporate', 
    'enterprise', 'funder', 'government agency', 'organization', 'organisation'
  ];
  return orgKeywords.some(kw => role.includes(kw));
}

// Helper to determine if an organization account has been fully verified
export function isOrganizationVerified(profile?: any): boolean {
  if (!profile) return false;
  return Boolean(
    profile.verificationStatus === 'verified' ||
    profile.isVerified === true ||
    profile.verified === true ||
    profile.publisherVerificationLevel === 'fully_verified'
  );
}

// USER PROFILES
export function isPublicProfileComplete(profile: any): boolean {
  if (!profile) return false;
  // If user explicitly made their profile private, do not show on public researcher page
  if (profile.privacySettings?.visibility === 'Private' || profile.privacySettings?.profileVisibility === 'private') {
    return false;
  }
  
  const completeness = checkProfileCompleteness(profile);
  if (completeness.isComplete) return true;

  // Check if key public identity fields are present
  const hasName = Boolean((profile.fullName || profile.displayName || profile.organizationName || profile.name || '').trim());
  const hasCountry = Boolean((profile.country || profile.location || profile.state || profile.city || '').trim());
  const hasInstitution = Boolean((profile.institution || profile.organization || profile.organizationName || profile.affiliation || profile.university || profile.department || '').trim());
  const hasBio = Boolean((profile.bio || profile.professionalBio || profile.organizationDescription || profile.role || profile.professionalTitle || '').trim());
  const interests = profile.researchInterests || profile.primaryResearchArea || profile.interests;
  const hasInterests = Array.isArray(interests) ? interests.length > 0 : Boolean(interests && (typeof interests === 'string' ? interests.trim() !== '' : true));

  return Boolean(hasName && (hasInstitution || hasCountry || hasInterests || hasBio));
}

export async function syncUserProfileToResearcher(userId: string, profile: any): Promise<void> {
  if (!userId || !profile) return;

  // If organization or non-individual stakeholder, ensure not in researchers directory
  if (profile.isOrganization || profile.organizationType || profile.accountType === 'organization' || !isIndividualResearcherRole(profile.role, profile)) {
    const currentLocal = getLocalResearchers();
    const filteredLocal = currentLocal.filter(r => r.id !== userId);
    setLocalResearchers(filteredLocal);
    if (!isFirestoreOffline && !isDemoModeActive(userId)) {
      try {
        const docRef = doc(db, 'researchers', userId);
        await deleteDoc(docRef);
      } catch (err) {
        // ignore
      }
    }
    return;
  }

  const isComplete = isPublicProfileComplete(profile);
  const isPrivate = profile.privacySettings?.visibility === 'Private' || profile.privacySettings?.profileVisibility === 'private';

  if (isPrivate || !isComplete) {
    return;
  }

  // Get papers count
  const allPapers = getLocalCustomPapers();
  const userPaperCount = allPapers.filter(p => p.userId === userId || (profile.email && p.userEmail === profile.email)).length;

  const existingLocal = getLocalResearchers().find(r => r.id === userId);

  const researcherData: Researcher = {
    id: userId,
    fullName: (profile.fullName || profile.displayName || 'Researcher').trim(),
    profilePhoto: profile.profilePicture || profile.photoURL || profile.avatar || 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq',
    role: profile.professionalTitle || profile.currentPosition || (profile.role || 'Researcher'),
    institution: profile.institution || profile.affiliation || profile.university || 'Aurenix Research Network',
    country: profile.country || profile.location || 'Nigeria',
    bio: profile.bio || profile.professionalBio || '',
    researchInterests: Array.isArray(profile.researchInterests) && profile.researchInterests.length > 0 
      ? profile.researchInterests 
      : (profile.primaryResearchArea ? [profile.primaryResearchArea] : ['Bioenergy']),
    verified: Boolean(profile.isVerified || profile.verified || profile.verificationStatus === 'verified'),
    followers: Array.isArray(profile.followers) ? profile.followers : (existingLocal?.followers || []),
    following: typeof profile.following === 'number' ? profile.following : (existingLocal?.following || 0),
    publicationCount: userPaperCount || (Array.isArray(profile.publishedPapers) ? profile.publishedPapers.length : (existingLocal?.publicationCount || 0)),
    downloads: typeof profile.downloads === 'number' ? profile.downloads : (existingLocal?.downloads || 0),
    views: typeof profile.views === 'number' ? profile.views : (existingLocal?.views || 1),
    citations: typeof profile.citations === 'number' ? profile.citations : (existingLocal?.citations || 0),
    createdAt: profile.createdAt?.toDate ? profile.createdAt.toDate().toISOString() : (profile.createdAt || existingLocal?.createdAt || new Date().toISOString()),
    orcid: profile.orcid || '',
    googleScholar: profile.googleScholar || '',
    linkedin: profile.linkedin || '',
    email: profile.privacySettings?.email === 'private' ? '' : (profile.email || ''),
    website: profile.privacySettings?.website === 'private' ? '' : (profile.website || ''),
    qualifications: Array.isArray(profile.academicQualifications) ? profile.academicQualifications : (Array.isArray(profile.qualifications) ? profile.qualifications : []),
    experienceYears: Number(profile.yearsOfExperience || profile.experienceYears || 0)
  };

  // 1. Update local storage cache
  const currentLocal = getLocalResearchers();
  const filteredLocal = currentLocal.filter(r => r.id !== userId);
  setLocalResearchers([researcherData, ...filteredLocal]);

  // 2. Sync to Firestore researchers collection
  if (!isFirestoreOffline && !isDemoModeActive(userId)) {
    try {
      const docRef = doc(db, 'researchers', userId);
      await setDoc(docRef, sanitizeForFirestore(researcherData), { merge: true });
    } catch (err) {
      console.warn('Could not sync researcher document to Firestore directly:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('researchers-updated', { detail: { userId, researcher: researcherData } }));
  }
}

export async function getUserProfileByEmail(email: string): Promise<any | null> {
  if (!email || isFirestoreOffline) {
    return null;
  }
  const normalizedEmail = email.toLowerCase().trim();
  const path = 'users';
  try {
    const colRef = collection(db, path);
    // Query lowercase
    const q1 = query(colRef, where('email', '==', normalizedEmail));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const docSnap = snap1.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    // Query exact as fallback
    const q2 = query(colRef, where('email', '==', email.trim()));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const docSnap = snap2.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.warn('Error querying user profile by email:', error);
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
    }
  }
  return null;
}

export async function consolidateDuplicateAccounts(targetUserId: string, email: string): Promise<void> {
  if (!targetUserId || !email || isFirestoreOffline) return;
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const colRef = collection(db, 'users');
    const q = query(colRef, where('email', '==', normalizedEmail));
    const snap = await getDocs(q);
    
    let mergedData: any = {};
    for (const docSnap of snap.docs) {
      if (docSnap.id !== targetUserId) {
        const data = docSnap.data();
        mergedData = { ...data, ...mergedData };
      }
    }

    if (Object.keys(mergedData).length > 0) {
      const targetDocRef = doc(db, 'users', targetUserId);
      const cleanMerged = sanitizeForFirestore({
        ...mergedData,
        email: normalizedEmail,
        updatedAt: serverTimestamp()
      });
      await setDoc(targetDocRef, cleanMerged, { merge: true });
      console.log(`[ACCOUNT UNIFICATION] Successfully unified profile data into target UID: ${targetUserId}`);
    }
  } catch (err) {
    console.warn('Could not complete duplicate account consolidation in background:', err);
  }
}

export async function createUserProfile(userId: string, profile: any): Promise<void> {
  // Check if an existing profile exists for this email to prevent wiping data
  let existingData: any = {};
  if (profile.email) {
    try {
      const existing = await getUserProfileByEmail(profile.email);
      if (existing) {
        existingData = existing;
      }
    } catch {}
  }

  const sanitizedProfile = {
    ...existingData,
    fullName: profile.fullName || existingData.fullName || '',
    email: (profile.email || existingData.email || '').toLowerCase(),
    role: profile.role || existingData.role || '',
    country: profile.country || existingData.country || '',
    institution: profile.institution || existingData.institution || '',
    researchInterests: profile.researchInterests && profile.researchInterests.length > 0 ? profile.researchInterests : (existingData.researchInterests || []),
    termsAccepted: profile.termsAccepted !== undefined ? Boolean(profile.termsAccepted) : (existingData.termsAccepted ?? true),
    needsOnboarding: profile.needsOnboarding !== undefined ? Boolean(profile.needsOnboarding) : false,
    onboardingCompleted: true,
    ...profile,
  };

  // Always store in local storage as well for instant responsiveness & offline fallback
  try {
    const localUpdated = {
      ...sanitizedProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`nexus_demo_profile_${userId}`, JSON.stringify(localUpdated));
    localStorage.setItem(`onboarding_completed_${userId}`, 'true');
    if (sanitizedProfile.email) {
      localStorage.setItem(`onboarding_completed_${sanitizedProfile.email.toLowerCase()}`, 'true');
    }
  } catch (e) {
    console.warn('Could not cache user profile to localStorage:', e);
  }

  if (isDemoModeActive(userId)) {
    const updated = {
      ...sanitizedProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await syncUserProfileToResearcher(userId, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: { userId, profile: updated } }));
    }
    return;
  }

  const path = 'users';
  try {
    const docRef = doc(db, path, userId);
    const cleanPayload = sanitizeForFirestore({
      ...sanitizedProfile,
      onboardingCompleted: true,
      needsOnboarding: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await setDoc(docRef, cleanPayload, { merge: true });
    await syncUserProfileToResearcher(userId, sanitizedProfile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: { userId, profile: sanitizedProfile } }));
    }
  } catch (error) {
    console.warn('Firestore user profile cloud save notice, falling back to local session profile:', error);
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
    }
    const updated = {
      ...sanitizedProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await syncUserProfileToResearcher(userId, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: { userId, profile: updated } }));
    }
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
    const updated = { ...parsed, ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(profileKey, JSON.stringify(updated));
    await syncUserProfileToResearcher(userId, updated);
    return;
  }
  const path = 'users';
  try {
    const docRef = doc(db, path, userId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    const fullProfile = await getUserProfile(userId);
    if (fullProfile) {
      await syncUserProfileToResearcher(userId, fullProfile);
    }
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return saveUserProfileByAdmin(userId, data);
    }
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${userId}`);
  }
}

export async function getUserProfile(userId: string): Promise<any> {
  const localCompleted = typeof window !== 'undefined' && localStorage.getItem(`onboarding_completed_${userId}`) === 'true';

  if (isDemoModeActive(userId)) {
    const data = localStorage.getItem(`nexus_demo_profile_${userId}`);
    if (!data && userId === 'sandbox-admin-bola') {
      const defaultAdminProfile = {
        fullName: 'Bola Adeyemi',
        email: 'bola.adeyemi@aurenix-research.org',
        role: 'super_admin',
        country: 'Nigeria',
        institution: 'Aurenix Core Labs',
        bio: 'Lead Bioenergy Systems Researcher & Administrator at Aurenix Core Labs.',
        researchInterests: ['Bioenergy', 'Circular Economy', 'Nuclear Energy'],
        termsAccepted: true,
        verified: true,
        verificationStatus: 'verified',
        needsOnboarding: false,
        onboardingCompleted: true
      };
      localStorage.setItem(`nexus_demo_profile_${userId}`, JSON.stringify(defaultAdminProfile));
      return defaultAdminProfile;
    }
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.onboardingCompleted || parsed.needsOnboarding === false || (parsed.role && parsed.country) || localCompleted) {
          parsed.needsOnboarding = false;
          parsed.onboardingCompleted = true;
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing local profile:', e);
      }
    }
    return null;
  }

  const path = 'users';
  try {
    const docRef = doc(db, path, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const isCompleted = data.onboardingCompleted === true || data.needsOnboarding === false || (Boolean(data.role) && Boolean(data.country)) || localCompleted;
      return { 
        id: docSnap.id, 
        ...data,
        needsOnboarding: isCompleted ? false : (data.needsOnboarding ?? true),
        onboardingCompleted: isCompleted
      };
    }

    // Check if the user already completed onboarding in local storage fallback
    const cachedData = typeof window !== 'undefined' ? localStorage.getItem(`nexus_demo_profile_${userId}`) : null;
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed && (parsed.role && parsed.country || parsed.onboardingCompleted || localCompleted)) {
          return {
            id: userId,
            ...parsed,
            needsOnboarding: false,
            onboardingCompleted: true
          };
        }
      } catch {}
    }

    if (localCompleted) {
      const currentUser = auth.currentUser;
      return {
        id: userId,
        needsOnboarding: false,
        onboardingCompleted: true,
        fullName: currentUser?.displayName || 'Google Scholar',
        email: currentUser?.email || '',
        role: 'Researcher',
        country: 'Nigeria',
        institution: '',
        researchInterests: [],
        termsAccepted: true
      };
    }

    // Check if the user is authenticated via Firebase but does not have a direct UID doc yet
    const currentUser = auth.currentUser;
    if (currentUser && (currentUser.uid === userId || !userId) && currentUser.email && !currentUser.isAnonymous) {
      // Check if an existing profile document was registered under this email (e.g. earlier account or Google login)
      try {
        const existingProfile = await getUserProfileByEmail(currentUser.email);
        if (existingProfile) {
          console.log(`[ACCOUNT UNIFICATION] Found existing unified profile for email: ${currentUser.email}. Linking to current UID: ${userId}`);
          const consolidated = {
            ...existingProfile,
            id: userId,
            email: currentUser.email.toLowerCase(),
            fullName: existingProfile.fullName || currentUser.displayName || 'Researcher',
            onboardingCompleted: true,
            needsOnboarding: false,
          };
          // Persist to current UID document in Firestore
          try {
            await setDoc(doc(db, path, userId), sanitizeForFirestore(consolidated), { merge: true });
          } catch {}
          return consolidated;
        }
      } catch (e) {
        console.warn('Error checking existing profile by email during getUserProfile:', e);
      }

      return {
        id: userId,
        needsOnboarding: true,
        onboardingCompleted: false,
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
    if (data) {
      try {
        return JSON.parse(data);
      } catch {}
    }
    return null;
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

// --- ORGANIZATION VERIFICATION SERVICES ---

export async function submitOrganizationVerification(
  userId: string,
  userEmail: string,
  userRole: string,
  orgType: any,
  orgData: Record<string, any>,
  documents: string[] = []
): Promise<void> {
  const now = new Date().toISOString();
  
  // Base publisher verification level if publisher
  let publisherVerificationLevel = undefined;
  if (orgType === 'publisher') {
    publisherVerificationLevel = 'identity_submitted';
  }

  const submissionPayload = {
    userId,
    userEmail,
    userRole,
    organizationType: orgType,
    organizationName: orgData.orgName || orgData.institutionName || orgData.companyName || orgData.agencyName || orgData.publisherName || orgData.fundName || 'Organization Account',
    country: orgData.country || 'Nigeria',
    contactPerson: orgData.contactPerson || orgData.contactName || 'Primary Contact',
    contactEmail: orgData.officialEmail || userEmail,
    website: orgData.website || '',
    submittedAt: now,
    status: 'under_review',
    publisherVerificationLevel,
    details: orgData,
    documents,
    history: [
      {
        status: 'under_review',
        date: now,
        note: 'Organization verification application submitted successfully.'
      }
    ]
  };

  const updateData = {
    organizationType: orgType,
    organizationName: submissionPayload.organizationName,
    organizationProfile: orgData,
    verificationStatus: 'under_review',
    publisherVerificationLevel,
    verificationSubmittedAt: now,
    verificationDocuments: documents,
    verificationHistory: submissionPayload.history,
    isOrganization: true,
  };

  if (isDemoModeActive(userId)) {
    const profileKey = `nexus_demo_profile_${userId}`;
    const data = localStorage.getItem(profileKey);
    const profile = data ? JSON.parse(data) : {};
    const updatedProfile = { ...profile, ...updateData };
    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));

    // Also store submission in global org queue local storage for admin portal demo
    const queueKey = 'nexus_demo_org_verification_queue';
    const existingQueue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    const filtered = existingQueue.filter((item: any) => item.userId !== userId);
    localStorage.setItem(queueKey, JSON.stringify([...filtered, submissionPayload]));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: { userId, profile: updatedProfile } }));
    }
    return;
  }

  const path = 'users';
  try {
    const docRef = doc(db, path, userId);
    await setDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Store separate record in organization_verifications collection
    const verificationRef = doc(db, 'organization_verifications', userId);
    await setDoc(verificationRef, {
      ...submissionPayload,
      updatedAt: serverTimestamp()
    }, { merge: true });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: { userId, profile: updateData } }));
    }
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return submitOrganizationVerification(userId, userEmail, userRole, orgType, orgData, documents);
    }
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${userId}`);
  }
}

export async function reviewOrganizationVerificationByAdmin(
  userId: string,
  action: 'approve' | 'request_info' | 'reject',
  notes: string = '',
  publisherLevel?: string,
  reviewerName: string = 'System Admin'
): Promise<void> {
  const now = new Date().toISOString();
  let targetStatus: 'verified' | 'action_required' | 'rejected' = 'verified';
  if (action === 'request_info') targetStatus = 'action_required';
  if (action === 'reject') targetStatus = 'rejected';

  // Get current profile
  const currentProfile = await getUserProfile(userId);
  const currentHistory = currentProfile?.verificationHistory || [];
  
  const historyEntry = {
    status: targetStatus,
    date: now,
    note: notes || (action === 'approve' ? 'Verification application approved.' : action === 'request_info' ? 'Additional information requested by admin.' : 'Verification request rejected.'),
    reviewer: reviewerName
  };

  const updateData: Record<string, any> = {
    verificationStatus: targetStatus,
    verificationReviewedAt: now,
    verificationReviewedBy: reviewerName,
    verificationNotes: notes || '',
    verificationHistory: [...currentHistory, historyEntry],
    isVerified: action === 'approve',
    verified: action === 'approve',
  };

  if (publisherLevel) {
    updateData.publisherVerificationLevel = publisherLevel;
  } else if (action === 'approve' && currentProfile?.organizationType === 'publisher') {
    updateData.publisherVerificationLevel = 'fully_verified';
  }

  // Create dashboard notification for user
  let notifTitle = 'Organization Verification Approved';
  let notifMessage = 'Your organization profile has been successfully verified! You now have full institutional capabilities.';
  let notifType: 'follower' | 'alliance' | 'grant' | 'citation' | 'comment' | 'workspace' | 'deadline' = 'workspace';

  if (action === 'request_info') {
    notifTitle = 'Organization Verification - Additional Info Required';
    notifMessage = `Admin review update: ${notes || 'Please review your organization application and provide the missing details.'}`;
    notifType = 'alliance';
  } else if (action === 'reject') {
    notifTitle = 'Organization Verification Status Update';
    notifMessage = `Your organization verification could not be completed at this time. Reason: ${notes || 'Information provided did not satisfy verification criteria.'}`;
    notifType = 'alliance';
  }

  await addNotification(userId, {
    title: notifTitle,
    message: notifMessage,
    type: notifType,
  });

  if (isDemoModeActive(userId)) {
    const profileKey = `nexus_demo_profile_${userId}`;
    const data = localStorage.getItem(profileKey);
    const profile = data ? JSON.parse(data) : {};
    const updatedProfile = { ...profile, ...updateData };
    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));

    // Update queue in local storage
    const queueKey = 'nexus_demo_org_verification_queue';
    const existingQueue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    const updatedQueue = existingQueue.map((item: any) => {
      if (item.userId === userId) {
        return {
          ...item,
          status: targetStatus,
          reviewedAt: now,
          reviewedBy: reviewerName,
          notes,
          publisherVerificationLevel: updateData.publisherVerificationLevel || item.publisherVerificationLevel,
          history: [...(item.history || []), historyEntry]
        };
      }
      return item;
    });
    localStorage.setItem(queueKey, JSON.stringify(updatedQueue));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: { userId, profile: updatedProfile } }));
    }
    return;
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...updateData, updatedAt: serverTimestamp() }, { merge: true });

    const queueDocRef = doc(db, 'organization_verifications', userId);
    await setDoc(queueDocRef, {
      status: targetStatus,
      reviewedAt: now,
      reviewedBy: reviewerName,
      notes,
      publisherVerificationLevel: updateData.publisherVerificationLevel || null,
      updatedAt: serverTimestamp()
    }, { merge: true });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: { userId, profile: updateData } }));
    }
  } catch (error) {
    console.error('Error updating organization verification review:', error);
  }
}

export async function getOrganizationVerificationQueue(): Promise<any[]> {
  if (isFirestoreOffline || isDemoModeActive()) {
    const queueKey = 'nexus_demo_org_verification_queue';
    const queue = localStorage.getItem(queueKey);
    return queue ? JSON.parse(queue) : [];
  }

  try {
    const colRef = collection(db, 'organization_verifications');
    const querySnapshot = await getDocs(colRef);
    const list: any[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching org verification queue:', error);
    const queueKey = 'nexus_demo_org_verification_queue';
    const queue = localStorage.getItem(queueKey);
    return queue ? JSON.parse(queue) : [];
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

  // 2. If user is an individual researcher/professor/student, add to researchers collection
  if (!userProfile.isOrganization && !userProfile.organizationType && userProfile.accountType !== 'organization' && isIndividualResearcherRole(userProfile.role || userProfile.professionalTitle, userProfile)) {
    const newResearcher: Researcher = {
      id: userId,
      fullName: userProfile.fullName || 'Verified Researcher',
      profilePhoto: userProfile.profilePicture || userProfile.photoURL || 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq',
      role: userProfile.role || userProfile.professionalTitle || 'Senior Researcher',
      institution: userProfile.verificationDetails?.institution || userProfile.institution || 'Aurenix Research Network',
      country: userProfile.country || 'Nigeria',
      bio: userProfile.verificationDetails?.bio || userProfile.bio || 'Verified academic contributor to the Aurenix Research repository.',
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
      const filtered = researchers.filter(r => r.id !== userId);
      setLocalResearchers([...filtered, newResearcher]);
    } else {
      try {
        const docRef = doc(db, 'researchers', userId);
        await setDoc(docRef, sanitizeForFirestore(newResearcher), { merge: true });
      } catch (error) {
        console.warn('Error creating researcher entry in Firestore, saving to local list:', error);
        const researchers = getLocalResearchers();
        const filtered = researchers.filter(r => r.id !== userId);
        setLocalResearchers([...filtered, newResearcher]);
      }
    }
  }
}

// --- RESEARCHERS & PUBLICATIONS SERVICES ---

// Helper to get/set local storage for demo
function getLocalResearchers(): Researcher[] {
  const data = localStorage.getItem('nexus_demo_researchers');
  if (!data) {
    return [];
  }
  return JSON.parse(data);
}

function setLocalResearchers(researchers: Researcher[]) {
  localStorage.setItem('nexus_demo_researchers', JSON.stringify(researchers));
}

function getLocalPublications(): Publication[] {
  const data = localStorage.getItem('nexus_demo_publications');
  if (!data) {
    return [];
  }
  return JSON.parse(data);
}

function setLocalPublications(publications: Publication[]) {
  localStorage.setItem('nexus_demo_publications', JSON.stringify(publications));
}

// FETCH RESEARCHERS
export async function getResearchers(): Promise<Researcher[]> {
  const localResearchers = getLocalResearchers();
  const customPapers = await getCustomPapers();

  // Helper to map and sync any complete user profile
  const syncCompleteProfiles = (users: any[], existingMap: Map<string, Researcher>) => {
    for (const u of users) {
      const uId = u.id || u.uid;
      if (!uId) continue;
      if (u.isOrganization === true || u.organizationType || u.accountType === 'organization') continue;
      if (!isIndividualResearcherRole(u.role || u.professionalTitle || u.currentPosition, u)) continue;
      if (isPublicProfileComplete(u)) {
        const uPapers = customPapers.filter(p => p.userId === uId || (u.email && p.userEmail === u.email)).length;
        const existing = existingMap.get(uId);
        const mapped: Researcher = {
          id: uId,
          fullName: (u.fullName || u.displayName || 'Researcher').trim(),
          profilePhoto: u.profilePicture || u.photoURL || u.avatar || 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq',
          role: u.professionalTitle || u.currentPosition || (u.role || 'Researcher'),
          institution: u.institution || u.organization || u.affiliation || 'Aurenix Research Network',
          country: u.country || u.location || 'Nigeria',
          bio: u.bio || u.professionalBio || '',
          researchInterests: Array.isArray(u.researchInterests) && u.researchInterests.length > 0 
            ? u.researchInterests 
            : (u.primaryResearchArea ? [u.primaryResearchArea] : ['Bioenergy']),
          verified: Boolean(u.isVerified || u.verified || u.verificationStatus === 'verified'),
          followers: Array.isArray(u.followers) ? u.followers : (existing?.followers || []),
          following: typeof u.following === 'number' ? u.following : (existing?.following || 0),
          publicationCount: uPapers || (Array.isArray(u.publishedPapers) ? u.publishedPapers.length : (existing?.publicationCount || 0)),
          downloads: typeof u.downloads === 'number' ? u.downloads : (existing?.downloads || 0),
          views: typeof u.views === 'number' ? u.views : (existing?.views || 1),
          citations: typeof u.citations === 'number' ? u.citations : (existing?.citations || 0),
          createdAt: u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : (u.createdAt || existing?.createdAt || new Date().toISOString()),
          orcid: u.orcid || '',
          googleScholar: u.googleScholar || '',
          linkedin: u.linkedin || '',
          email: u.privacySettings?.email === 'private' ? '' : (u.email || ''),
          website: u.privacySettings?.website === 'private' ? '' : (u.website || ''),
          qualifications: Array.isArray(u.academicQualifications) ? u.academicQualifications : (Array.isArray(u.qualifications) ? u.qualifications : []),
          experienceYears: Number(u.yearsOfExperience || u.experienceYears || 0)
        };
        existingMap.set(uId, mapped);
      }
    }
  };

  if (isDemoModeActive()) {
    const researcherMap = new Map<string, Researcher>();
    for (const r of localResearchers) {
      if (isIndividualResearcherRole(r.role, r)) {
        researcherMap.set(r.id, r);
      }
    }

    // Scan localStorage for all user profiles in demo mode
    if (typeof localStorage !== 'undefined') {
      try {
        const demoUsers: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('nexus_demo_profile_')) {
            const uId = key.replace('nexus_demo_profile_', '');
            const val = localStorage.getItem(key);
            if (val) {
              try {
                const parsed = JSON.parse(val);
                demoUsers.push({ id: uId, ...parsed });
              } catch {}
            }
          }
        }
        syncCompleteProfiles(demoUsers, researcherMap);
      } catch {}
    }

    const result = Array.from(researcherMap.values()).filter(r => isIndividualResearcherRole(r.role, r));
    setLocalResearchers(result);
    return result;
  }

  const path = 'researchers';
  try {
    const colRef = collection(db, path);
    const querySnapshot = await getDocs(colRef);
    const researcherMap = new Map<string, Researcher>();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const rObj: Researcher = {
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
      };
      if (isIndividualResearcherRole(rObj.role, rObj)) {
        researcherMap.set(docSnap.id, rObj);
      }
    });

    // Also load users from users collection to discover any complete profiles
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList: any[] = [];
      usersSnap.forEach((docSnap) => {
        usersList.push({ id: docSnap.id, ...docSnap.data() });
      });
      syncCompleteProfiles(usersList, researcherMap);
    } catch (usersErr) {
      console.warn('Notice: Could not query users collection, using researchers collection:', usersErr);
    }

    // Update accurate publication count for each researcher based on custom_papers
    for (const [id, res] of researcherMap.entries()) {
      const userPapers = customPapers.filter(p => p.userId === id || (res.email && p.userEmail === res.email)).length;
      if (userPapers > 0) {
        res.publicationCount = Math.max(res.publicationCount || 0, userPapers);
      }
    }

    const result = Array.from(researcherMap.values()).filter(r => isIndividualResearcherRole(r.role, r));
    setLocalResearchers(result);
    return result;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getResearchers();
    }
    console.warn('Error fetching researchers from Firestore, falling back to local storage:', error);
    return getLocalResearchers().filter(r => isIndividualResearcherRole(r.role, r));
  }
}

export async function getResearcherById(id: string): Promise<Researcher | null> {
  const researchers = await getResearchers();
  return researchers.find(r => r.id === id) || null;
}

// FETCH PUBLICATIONS
export async function getPublications(): Promise<Publication[]> {
  const customPapers = await getCustomPapers();
  const customPubs: Publication[] = customPapers
    .filter(p => !p.isDraft && p.status !== 'Draft')
    .map(p => ({
      id: p.id,
      researcherId: p.userId || p.leadResearcher || p.author || p.id,
      title: p.title || 'Untitled Research Paper',
      abstract: p.abstract || '',
      category: p.category || 'Bioenergy Technology',
      keywords: p.keywords || p.tags || [],
      pdfUrl: p.downloadUrl || p.uploads?.pdf || '#',
      coverImage: p.uploads?.coverImage,
      downloads: p.downloadsCount || 0,
      views: p.viewsCount || 0,
      citations: 0,
      createdAt: p.createdAt || (p.publishedYear ? `${p.publishedYear}-01-01T00:00:00.000Z` : new Date().toISOString())
    }));

  if (isDemoModeActive()) {
    const local = getLocalPublications();
    const pubMap = new Map<string, Publication>();
    for (const l of local) pubMap.set(l.id, l);
    for (const cp of customPubs) pubMap.set(cp.id, cp);
    return Array.from(pubMap.values());
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

    const pubMap = new Map<string, Publication>();
    for (const l of list) pubMap.set(l.id, l);
    for (const cp of customPubs) pubMap.set(cp.id, cp);
    return Array.from(pubMap.values());
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getPublications();
    }
    console.warn('Error fetching publications from Firestore, falling back to local storage:', error);
    const local = getLocalPublications();
    const pubMap = new Map<string, Publication>();
    for (const l of local) pubMap.set(l.id, l);
    for (const cp of customPubs) pubMap.set(cp.id, cp);
    return Array.from(pubMap.values());
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
  status: 'Draft' | 'Active' | 'Completed' | 'Archived' | 'Published' | 'Under Review';
  fundingStatus: 'Pending' | 'Approved' | 'Funded' | 'Rejected' | 'In Progress';
  progress: number;
  industryPartner: string;
  laboratoryPartner: string;
  description?: string;
  focusArea?: string;
  trlLevel?: number;
  budget?: number | string;
  lastUpdated: string;
}

function getLocalProjects(userId: string): InnovationProject[] {
  const data = localStorage.getItem(`nexus_demo_projects_${userId}`);
  if (data) return JSON.parse(data);
  return [];
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
    await setDoc(doc(db, path, newId), sanitizeForFirestore(fullProject));
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
  return [];
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
    await setDoc(doc(db, path, newId), sanitizeForFirestore(fullNotif));
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
  return [];
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
    await setDoc(doc(db, path, newId), sanitizeForFirestore(fullDeadline));
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

// COMMUNITY SERVICES
const LOCAL_POSTS_KEY = 'nexus_demo_community_posts';

function getLocalCommunityPosts(): CommunityPost[] {
  const data = localStorage.getItem(LOCAL_POSTS_KEY);
  if (!data) {
    return [];
  }
  return JSON.parse(data);
}

function setLocalCommunityPosts(posts: CommunityPost[]) {
  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts));
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const userId = auth.currentUser?.uid || 'anonymous';
  if (isDemoModeActive(userId)) {
    return getLocalCommunityPosts().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const path = 'community_posts';
  try {
    const colRef = collection(db, path);
    const snapshot = await getDocs(colRef);
    const list: CommunityPost[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as CommunityPost);
    });

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return getCommunityPosts();
    }
    console.warn('Firestore getCommunityPosts error, falling back to local storage:', error);
    return getLocalCommunityPosts().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function createCommunityPost(userId: string, postData: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'userId'>): Promise<string> {
  const newId = 'post_' + Math.random().toString(36).substring(2, 9);
  const fullPost: CommunityPost = {
    ...postData,
    id: newId,
    userId,
    likes: [],
    comments: []
  };

  if (isDemoModeActive(userId)) {
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts([fullPost, ...list]);
    return newId;
  }

  const path = 'community_posts';
  try {
    await setDoc(doc(db, path, newId), sanitizeForFirestore(fullPost));
    return newId;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return createCommunityPost(userId, postData);
    }
    console.warn('Firestore createCommunityPost error:', error);
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts([fullPost, ...list]);
    return newId;
  }
}

export async function likeCommunityPost(userId: string, postId: string, post: CommunityPost): Promise<void> {
  const likes = post.likes || [];
  const updatedLikes = likes.includes(userId)
    ? likes.filter(id => id !== userId)
    : [...likes, userId];

  const updatedPost = { ...post, likes: updatedLikes };

  if (isDemoModeActive(userId)) {
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.map(p => p.id === postId ? updatedPost : p));
    return;
  }

  const path = 'community_posts';
  try {
    await setDoc(doc(db, path, postId), sanitizeForFirestore(updatedPost));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return likeCommunityPost(userId, postId, post);
    }
    console.warn('Firestore likeCommunityPost error:', error);
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.map(p => p.id === postId ? updatedPost : p));
  }
}

export async function commentCommunityPost(userId: string, postId: string, post: CommunityPost, comment: CommunityComment): Promise<void> {
  const comments = post.comments || [];
  const updatedComments = [...comments, comment];
  const updatedPost = { ...post, comments: updatedComments };

  if (isDemoModeActive(userId)) {
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.map(p => p.id === postId ? updatedPost : p));
    return;
  }

  const path = 'community_posts';
  try {
    await setDoc(doc(db, path, postId), sanitizeForFirestore(updatedPost));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return commentCommunityPost(userId, postId, post, comment);
    }
    console.warn('Firestore commentCommunityPost error:', error);
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.map(p => p.id === postId ? updatedPost : p));
  }
}

export async function updateCommunityComments(userId: string, postId: string, post: CommunityPost, updatedComments: CommunityComment[]): Promise<void> {
  const updatedPost = { ...post, comments: updatedComments };

  if (isDemoModeActive(userId)) {
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.map(p => p.id === postId ? updatedPost : p));
    return;
  }

  const path = 'community_posts';
  try {
    await setDoc(doc(db, path, postId), sanitizeForFirestore(updatedPost));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return updateCommunityComments(userId, postId, post, updatedComments);
    }
    console.warn('Firestore updateCommunityComments error:', error);
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.map(p => p.id === postId ? updatedPost : p));
  }
}

export async function updateCommunityPost(userId: string, postId: string, updatedPost: CommunityPost): Promise<void> {
  if (isDemoModeActive(userId)) {
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.map(p => p.id === postId ? updatedPost : p));
    return;
  }

  const path = 'community_posts';
  try {
    await setDoc(doc(db, path, postId), sanitizeForFirestore(updatedPost));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return updateCommunityPost(userId, postId, updatedPost);
    }
    console.warn('Firestore updateCommunityPost error:', error);
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.map(p => p.id === postId ? updatedPost : p));
  }
}

export async function deleteCommunityPost(userId: string, postId: string): Promise<void> {
  if (isDemoModeActive(userId)) {
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.filter(p => p.id !== postId));
    return;
  }

  const path = 'community_posts';
  try {
    await deleteDoc(doc(db, path, postId));
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      return deleteCommunityPost(userId, postId);
    }
    console.warn('Firestore deleteCommunityPost error:', error);
    const list = getLocalCommunityPosts();
    setLocalCommunityPosts(list.filter(p => p.id !== postId));
  }
}

/* ============================================================================
 * TESTIMONIALS SYSTEM (FIREBASE PERSISTENCE)
 * ============================================================================ */

const LOCAL_TESTIMONIALS_KEY = 'aurenix_local_testimonials_v1';

const DEFAULT_SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testim_seed_1',
    userId: 'scholar-elena-rostova',
    fullName: 'Dr. Elena Rostova',
    occupation: 'Senior Biofuel Process Engineer',
    institution: 'Nordic Clean Energy Institute',
    country: 'Sweden',
    message: 'Aurenix Research Hub has transformed how our lab cross-references pyrolysis yields and thermodynamic models. The open data exchange and synthesis tools have saved us months of redundant bench testing.',
    rating: 5,
    approved: true,
    featured: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'testim_seed_2',
    userId: 'scholar-kwame-mensah',
    fullName: 'Prof. Kwame Mensah',
    occupation: 'Chair of Agricultural Biotechnology',
    institution: 'University of Ghana & WACCI',
    country: 'Ghana',
    message: 'The ability to find international partners and co-publish lignocellulosic biomass research has enabled our department to secure regional bioenergy transition grants effectively.',
    rating: 5,
    approved: true,
    featured: true,
    createdAt: '2026-02-10T14:30:00.000Z',
    updatedAt: '2026-02-10T14:30:00.000Z'
  },
  {
    id: 'testim_seed_3',
    userId: 'scholar-marcus-vance',
    fullName: 'Dr. Marcus Vance',
    occupation: 'Lead Catalysis Scientist',
    institution: 'Renewable Fuels Consortium',
    country: 'United Kingdom',
    message: 'The precision of the biochemical calculators and the real-time AI research assistant provide an indispensable workbench for peer-reviewed experimental validation.',
    rating: 5,
    approved: true,
    featured: true,
    createdAt: '2026-03-01T09:15:00.000Z',
    updatedAt: '2026-03-01T09:15:00.000Z'
  }
];

function getLocalTestimonials(): Testimonial[] {
  try {
    const raw = localStorage.getItem(LOCAL_TESTIMONIALS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_TESTIMONIALS_KEY, JSON.stringify(DEFAULT_SEED_TESTIMONIALS));
      return DEFAULT_SEED_TESTIMONIALS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEED_TESTIMONIALS;
  } catch {
    return DEFAULT_SEED_TESTIMONIALS;
  }
}

function setLocalTestimonials(items: Testimonial[]): void {
  try {
    localStorage.setItem(LOCAL_TESTIMONIALS_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save local testimonials', e);
  }
}

export async function submitTestimonial(
  testimonialData: Omit<Testimonial, 'id' | 'approved' | 'featured' | 'createdAt' | 'updatedAt'>
): Promise<Testimonial> {
  const newId = 'testim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  
  const testimonialItem: Testimonial = {
    id: newId,
    ...testimonialData,
    approved: false, // Must default to pending approval
    featured: false,
    createdAt: now,
    updatedAt: now
  };

  if (isDemoModeActive(testimonialData.userId)) {
    const list = getLocalTestimonials();
    list.unshift(testimonialItem);
    setLocalTestimonials(list);
    return testimonialItem;
  }

  const path = 'testimonials';
  try {
    await setDoc(doc(db, path, newId), sanitizeForFirestore(testimonialItem));
    return testimonialItem;
  } catch (error) {
    if (isOfflineError(error)) {
      setFirestoreOffline(true);
      const list = getLocalTestimonials();
      list.unshift(testimonialItem);
      setLocalTestimonials(list);
      return testimonialItem;
    }
    const list = getLocalTestimonials();
    list.unshift(testimonialItem);
    setLocalTestimonials(list);
    return testimonialItem;
  }
}

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  if (isFirestoreOffline) {
    return getLocalTestimonials().filter(t => t.approved);
  }

  const path = 'testimonials';
  try {
    const q = query(collection(db, path), where('approved', '==', true));
    const snapshot = await getDocs(q);
    const items: Testimonial[] = [];
    snapshot.forEach(d => {
      items.push({ id: d.id, ...d.data() } as Testimonial);
    });
    if (items.length === 0) {
      return getLocalTestimonials().filter(t => t.approved);
    }
    return items;
  } catch {
    return getLocalTestimonials().filter(t => t.approved);
  }
}

export async function getAllTestimonialsAdmin(): Promise<Testimonial[]> {
  if (isFirestoreOffline) {
    return getLocalTestimonials();
  }

  const path = 'testimonials';
  try {
    const snapshot = await getDocs(collection(db, path));
    const items: Testimonial[] = [];
    snapshot.forEach(d => {
      items.push({ id: d.id, ...d.data() } as Testimonial);
    });
    if (items.length === 0) {
      return getLocalTestimonials();
    }
    return items;
  } catch {
    return getLocalTestimonials();
  }
}

export async function updateTestimonialAdmin(
  testimonialId: string,
  updates: Partial<Testimonial>
): Promise<void> {
  const now = new Date().toISOString();
  const payload = sanitizeForFirestore({ ...updates, updatedAt: now });

  if (isFirestoreOffline) {
    const list = getLocalTestimonials();
    setLocalTestimonials(list.map(t => t.id === testimonialId ? { ...t, ...updates, updatedAt: now } : t));
    return;
  }

  const path = 'testimonials';
  try {
    const docRef = doc(db, path, testimonialId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.warn('Firestore updateTestimonialAdmin error:', error);
    const list = getLocalTestimonials();
    setLocalTestimonials(list.map(t => t.id === testimonialId ? { ...t, ...updates, updatedAt: now } : t));
  }
}

export async function deleteTestimonialAdmin(testimonialId: string): Promise<void> {
  if (isFirestoreOffline) {
    const list = getLocalTestimonials();
    setLocalTestimonials(list.filter(t => t.id !== testimonialId));
    return;
  }

  const path = 'testimonials';
  try {
    await deleteDoc(doc(db, path, testimonialId));
  } catch (error) {
    console.warn('Firestore deleteTestimonialAdmin error:', error);
    const list = getLocalTestimonials();
    setLocalTestimonials(list.filter(t => t.id !== testimonialId));
  }
}





