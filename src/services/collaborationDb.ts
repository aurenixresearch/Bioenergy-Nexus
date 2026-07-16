import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  query, 
  where, 
  addDoc 
} from 'firebase/firestore';
import { db, auth, isFirestoreOffline, setFirestoreOffline } from '../firebase';
import { isOfflineError } from './db';
import { Project, AllianceOpportunity, Application, InnovationChallenge, Workspace, CollaborationNotification } from '../components/collaboration/types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_ALLIANCES, 
  INITIAL_CHALLENGES, 
  INITIAL_APPLICATIONS, 
  INITIAL_WORKSPACES, 
  INITIAL_NOTIFICATIONS 
} from '../components/collaboration/mockData';

// DB operation types for logging and security specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMsg = error instanceof Error ? error.message : String(error);
  if (
    errMsg.includes('unavailable') || 
    errMsg.includes('offline') || 
    errMsg.includes('Could not reach') || 
    errMsg.includes('Connection failed') ||
    errMsg.includes('failed to connect')
  ) {
    setFirestoreOffline(true);
    console.warn("Detected Firestore connection failure in collaboration operation. Falling back to local demo mode.");
  }

  const errInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Collaboration Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check if demo mode is active
export function isDemoModeActive(userId?: string): boolean {
  if (userId && (userId === 'sandbox-guest-user' || userId.startsWith('sandbox-'))) {
    return true;
  }
  return localStorage.getItem('nexus_demo_mode') === 'true' || 
         localStorage.getItem('nexus_demo_user') !== null || 
         !auth.currentUser || 
         isFirestoreOffline;
}

// 1. PROJECTS DB INTERACTION
export async function getProjects(userId?: string): Promise<Project[]> {
  if (isDemoModeActive()) {
    const data = localStorage.getItem('collab_demo_projects');
    if (!data) {
      localStorage.setItem('collab_demo_projects', JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    const projects: Project[] = JSON.parse(data);
    return userId ? projects.filter(p => p.createdBy === userId) : projects;
  }

  try {
    const collRef = collection(db, 'projects');
    const q = userId ? query(collRef, where('createdBy', '==', userId)) : collRef;
    const snap = await getDocs(q);
    const list: Project[] = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Project);
    });
    return list;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return getProjects(userId);
    }
    handleFirestoreError(err, OperationType.LIST, 'projects');
  }
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Project> {
  const creatorId = auth.currentUser?.uid || 'sandbox-researcher';
  const newProj: Project = {
    ...project,
    id: `proj-${Date.now()}`,
    createdBy: creatorId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isDemoModeActive()) {
    const list = await getProjects();
    list.unshift(newProj);
    localStorage.setItem('collab_demo_projects', JSON.stringify(list));
    return newProj;
  }

  try {
    const docRef = doc(collection(db, 'projects'));
    newProj.id = docRef.id;
    await setDoc(docRef, { ...newProj });
    return newProj;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return createProject(project);
    }
    handleFirestoreError(err, OperationType.CREATE, `projects/${newProj.id}`);
  }
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  if (isDemoModeActive()) {
    const list = await getProjects();
    const idx = list.findIndex(p => p.id === projectId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('collab_demo_projects', JSON.stringify(list));
    }
    return;
  }

  try {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return updateProject(projectId, updates);
    }
    handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
  }
}

// 2. ALLIANCE OPPORTUNITIES DB INTERACTION
export async function getAlliances(userId?: string): Promise<AllianceOpportunity[]> {
  if (isDemoModeActive()) {
    const data = localStorage.getItem('collab_demo_alliances');
    if (!data) {
      localStorage.setItem('collab_demo_alliances', JSON.stringify(INITIAL_ALLIANCES));
      return INITIAL_ALLIANCES;
    }
    const alliances: AllianceOpportunity[] = JSON.parse(data);
    return userId ? alliances.filter(a => a.createdBy === userId) : alliances;
  }

  try {
    const collRef = collection(db, 'alliance_opportunities');
    const q = userId ? query(collRef, where('createdBy', '==', userId)) : collRef;
    const snap = await getDocs(q);
    const list: AllianceOpportunity[] = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AllianceOpportunity);
    });
    return list;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return getAlliances(userId);
    }
    handleFirestoreError(err, OperationType.LIST, 'alliance_opportunities');
  }
}

export async function createAlliance(alliance: Omit<AllianceOpportunity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<AllianceOpportunity> {
  const creatorId = auth.currentUser?.uid || 'sandbox-stakeholder';
  const newAll: AllianceOpportunity = {
    ...alliance,
    id: `all-${Date.now()}`,
    createdBy: creatorId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isDemoModeActive()) {
    const list = await getAlliances();
    list.unshift(newAll);
    localStorage.setItem('collab_demo_alliances', JSON.stringify(list));
    return newAll;
  }

  try {
    const docRef = doc(collection(db, 'alliance_opportunities'));
    newAll.id = docRef.id;
    await setDoc(docRef, { ...newAll });
    return newAll;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return createAlliance(alliance);
    }
    handleFirestoreError(err, OperationType.CREATE, `alliance_opportunities/${newAll.id}`);
  }
}

// 3. APPLICATIONS DB INTERACTION
export async function getApplications(userId?: string, isStakeholder?: boolean): Promise<Application[]> {
  if (isDemoModeActive()) {
    const data = localStorage.getItem('collab_demo_applications');
    if (!data) {
      localStorage.setItem('collab_demo_applications', JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    const apps: Application[] = JSON.parse(data);
    if (!userId) return apps;
    return isStakeholder 
      ? apps // Under demo mode, return relevant mock ones
      : apps.filter(a => a.applicantId === userId);
  }

  try {
    const collRef = collection(db, 'applications');
    const q = isStakeholder 
      ? collRef // Stakeholder gets all submitted apps (in real scenarios filtered by organization opportunity ownership)
      : query(collRef, where('applicantId', '==', userId));
    const snap = await getDocs(q);
    const list: Application[] = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Application);
    });
    return list;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return getApplications(userId, isStakeholder);
    }
    handleFirestoreError(err, OperationType.LIST, 'applications');
  }
}

export async function submitApplication(app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<Application> {
  const newApp: Application = {
    ...app,
    id: `app-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isDemoModeActive()) {
    const list = await getApplications();
    list.unshift(newApp);
    localStorage.setItem('collab_demo_applications', JSON.stringify(list));
    return newApp;
  }

  try {
    const docRef = doc(collection(db, 'applications'));
    newApp.id = docRef.id;
    await setDoc(docRef, { ...newApp });
    return newApp;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return submitApplication(app);
    }
    handleFirestoreError(err, OperationType.CREATE, `applications/${newApp.id}`);
  }
}

export async function updateApplicationStatus(appId: string, status: Application['status'], step?: number): Promise<void> {
  if (isDemoModeActive()) {
    const list = await getApplications();
    const idx = list.findIndex(a => a.id === appId);
    if (idx !== -1) {
      list[idx].status = status;
      if (step !== undefined) list[idx].timelineStep = step;
      list[idx].updatedAt = new Date().toISOString();
      localStorage.setItem('collab_demo_applications', JSON.stringify(list));

      // If accepted, automatically generate workspace
      if (status === 'Accepted') {
        await triggerWorkspaceAutoGeneration(list[idx]);
      }
    }
    return;
  }

  try {
    const docRef = doc(db, 'applications', appId);
    const updates: Partial<Application> = { status, updatedAt: new Date().toISOString() };
    if (step !== undefined) updates.timelineStep = step;
    await updateDoc(docRef, updates);

    if (status === 'Accepted') {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await triggerWorkspaceAutoGeneration(docSnap.data() as Application);
      }
    }
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return updateApplicationStatus(appId, status, step);
    }
    handleFirestoreError(err, OperationType.UPDATE, `applications/${appId}`);
  }
}

// 4. WORKSPACES DB INTERACTION
export async function getWorkspaces(userId?: string): Promise<Workspace[]> {
  if (isDemoModeActive()) {
    const data = localStorage.getItem('collab_demo_workspaces');
    if (!data) {
      localStorage.setItem('collab_demo_workspaces', JSON.stringify(INITIAL_WORKSPACES));
      return INITIAL_WORKSPACES;
    }
    const workspaces: Workspace[] = JSON.parse(data);
    if (!userId) return workspaces;
    return workspaces.filter(w => w.members.some(m => m.uid === userId));
  }

  try {
    const collRef = collection(db, 'workspaces');
    const snap = await getDocs(collRef);
    const list: Workspace[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data() as Workspace;
      if (!userId || data.members.some(m => m.uid === userId)) {
        list.push({ id: docSnap.id, ...data });
      }
    });
    return list;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return getWorkspaces(userId);
    }
    handleFirestoreError(err, OperationType.LIST, 'workspaces');
  }
}

export async function updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<void> {
  if (isDemoModeActive()) {
    const list = await getWorkspaces();
    const idx = list.findIndex(w => w.id === workspaceId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('collab_demo_workspaces', JSON.stringify(list));
    }
    return;
  }

  try {
    const docRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return updateWorkspace(workspaceId, updates);
    }
    handleFirestoreError(err, OperationType.UPDATE, `workspaces/${workspaceId}`);
  }
}

// Auto-generation of a Workspace when application is accepted
async function triggerWorkspaceAutoGeneration(app: Application): Promise<void> {
  const workspaces = await getWorkspaces();
  const exists = workspaces.some(w => w.applicationId === app.id);
  if (exists) return;

  const newWorkspace: Workspace = {
    id: `work-${Date.now()}`,
    applicationId: app.id,
    projectId: app.projectId,
    opportunityId: app.opportunityId,
    challengeId: app.challengeId,
    title: `${app.projectTitle.substring(0, 35)}... Collaborative Space`,
    status: 'Active',
    members: [
      { uid: app.applicantId, name: app.applicantName, role: 'Lead Researcher', email: 'applicant@aurenix.org' },
      { uid: 'sandbox-stakeholder', name: 'Opportunity Lead', role: 'Partner Supervisor', email: 'partner@aurenix.org' }
    ],
    researchNotes: [
      { id: 'n-init', title: 'Getting Started', content: 'Use this workspace to share lab files, design milestones, chat with collaborators, and draft progress reports.', updatedBy: 'System', updatedAt: new Date().toISOString() }
    ],
    tasks: [
      { id: 't-init', title: 'Submit Initial Project Draft', assignedTo: app.applicantName, status: 'To Do', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] }
    ],
    milestones: [
      { id: 'm-init', title: 'Kickoff and Alignment', dueDate: new Date().toISOString().split('T')[0], status: 'Completed', releaseState: 'Released' }
    ],
    messages: [
      { id: 'm-msg-init', senderId: 'system', senderName: 'Aurenix Engine', content: `Congratulations! Your application has been accepted. Welcome to your Notion-style workspace.`, createdAt: new Date().toISOString() }
    ],
    files: [],
    meetings: [
      { id: 'meet-init', title: 'Project Alignment Sync', time: 'Monday, 10:00 AM', link: 'https://meet.google.com/aurenix-collab' }
    ],
    budget: {
      total: '$15,000',
      spent: '$0',
      remaining: '$15,000',
      lineItems: []
    },
    deliverables: [],
    versionHistory: [],
    activityLogs: [
      { id: 'l-init', user: 'System', action: 'Created collaborative workspace', time: new Date().toLocaleDateString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isDemoModeActive()) {
    workspaces.unshift(newWorkspace);
    localStorage.setItem('collab_demo_workspaces', JSON.stringify(workspaces));

    // Also inject notification
    const notifications = await getNotifications(app.applicantId);
    notifications.unshift({
      id: `not-${Date.now()}`,
      userId: app.applicantId,
      title: 'New Workspace Created!',
      message: `A collaborative workspace has been generated for: ${app.projectTitle}`,
      type: 'application',
      read: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(`collab_notifications_${app.applicantId}`, JSON.stringify(notifications));
  } else {
    try {
      const docRef = doc(collection(db, 'workspaces'));
      newWorkspace.id = docRef.id;
      await setDoc(docRef, { ...newWorkspace });

      // Add notification
      const notRef = doc(collection(db, 'notifications'));
      await setDoc(notRef, {
        id: notRef.id,
        userId: app.applicantId,
        title: 'New Workspace Created!',
        message: `A collaborative workspace has been generated for: ${app.projectTitle}`,
        type: 'application',
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error auto-generating workspace:', err);
    }
  }
}

// 5. CHALLENGES INTERACTION
export async function getChallenges(): Promise<InnovationChallenge[]> {
  if (isDemoModeActive()) {
    const data = localStorage.getItem('collab_demo_challenges');
    if (!data) {
      localStorage.setItem('collab_demo_challenges', JSON.stringify(INITIAL_CHALLENGES));
      return INITIAL_CHALLENGES;
    }
    return JSON.parse(data);
  }

  try {
    const collRef = collection(db, 'innovation_challenges');
    const snap = await getDocs(collRef);
    const list: InnovationChallenge[] = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as InnovationChallenge);
    });
    return list;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return getChallenges();
    }
    handleFirestoreError(err, OperationType.LIST, 'innovation_challenges');
  }
}

// 6. NOTIFICATIONS INTERACTION
export async function getNotifications(userId: string): Promise<CollaborationNotification[]> {
  if (isDemoModeActive()) {
    const data = localStorage.getItem(`collab_notifications_${userId}`);
    if (!data) {
      localStorage.setItem(`collab_notifications_${userId}`, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(data);
  }

  try {
    const collRef = collection(db, 'notifications');
    const q = query(collRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: CollaborationNotification[] = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() } as CollaborationNotification);
    });
    return list;
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return getNotifications(userId);
    }
    handleFirestoreError(err, OperationType.LIST, 'notifications');
  }
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  if (isDemoModeActive()) {
    const list = await getNotifications(userId);
    const idx = list.findIndex(n => n.id === notificationId);
    if (idx !== -1) {
      list[idx].read = true;
      localStorage.setItem(`collab_notifications_${userId}`, JSON.stringify(list));
    }
    return;
  }

  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
  } catch (err) {
    if (isOfflineError(err)) {
      setFirestoreOffline(true);
      return markNotificationRead(notificationId, userId);
    }
    handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}
