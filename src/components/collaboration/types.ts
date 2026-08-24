export type UserRole = 'researcher' | 'student' | 'stakeholder' | 'admin';

export type StakeholderType = 
  | 'University' 
  | 'Industry' 
  | 'Government' 
  | 'NGO' 
  | 'Investor' 
  | 'International Organization';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  institution?: string;
  country?: string;
  bio?: string;
  organizationType?: StakeholderType;
  website?: string;
  contactPerson?: string;
  logo?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Project {
  id: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  technologyArea: string;
  trl: number; // Technology Readiness Level (1-9)
  expectedImpact: string;
  sdgs: string[]; // Sustainable Development Goals
  country: string;
  institution: string;
  researchArea: string;
  supportNeeded: string[]; // Funding, Laboratory, etc.
  budget: string;
  timeline: string;
  milestones: string[];
  currentStage: string; // Idea, Research, Prototype, etc.
  prototypeAvailable: boolean;
  patentStatus: 'None' | 'Pending' | 'Granted';
  researchTeam: string[];
  supportingDocuments?: string[];
  projectImages?: string[];
  videos?: string[];
  researchPdf?: string;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  status: 'Draft' | 'Published' | 'Under Review' | 'Completed';
  visibility: 'Public' | 'Private' | 'Alliance Only';
}

export interface AllianceOpportunity {
  id: string;
  orgName: string;
  orgType: StakeholderType;
  country: string;
  website: string;
  contactPerson: string;
  email: string;
  logo: string;
  title: string;
  description: string;
  researchAreas: string[];
  technologyAreas: string[];
  eligibleCountries: string[];
  fundingAmount: string;
  facilitiesAvailable: string[];
  timeline: string;
  deadline: string;
  maxParticipants: number;
  supportOffered: string[]; // Funding, Lab, Testing, Mentorship, etc.
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  status: 'Active' | 'Closed' | 'Draft' | 'Open';
  visibility: 'Public' | 'Private';

  // Optional compatibility fields
  budget?: string;
  focusArea?: string;
  trlLevel?: number;
  applicationDeadline?: string;
  availableSpots?: number;
}

export interface Application {
  id: string;
  projectId: string;
  opportunityId?: string; // If applying to an Alliance
  challengeId?: string; // If applying to an Innovation Challenge
  applicantId: string;
  applicantName: string;
  projectTitle: string;
  status: 'Submitted' | 'Review' | 'Interview' | 'Accepted' | 'Rejected';
  timelineStep: number; // 1 to 11 for the funding/lab workflows
  feedback?: string;
  createdAt: any;
  updatedAt: any;
}

export interface InnovationChallenge {
  id: string;
  orgName: string;
  logo: string;
  title: string;
  description: string;
  funding: string;
  timeline: string;
  deadline: string;
  resourcesAvailable: string[];
  expectedDeliverables: string[];
  status: 'Active' | 'Completed';
  createdAt: any;
  createdBy: string;
}

export interface Workspace {
  id: string;
  applicationId: string;
  projectId: string;
  opportunityId?: string;
  challengeId?: string;
  title: string;
  status: 'Active' | 'Archived';
  members: {
    uid: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
  }[];
  researchNotes: {
    id: string;
    title: string;
    content: string;
    updatedBy: string;
    updatedAt: any;
  }[];
  tasks: {
    id: string;
    title: string;
    assignedTo: string; // User Name
    status: 'To Do' | 'In Progress' | 'Under Review' | 'Completed';
    dueDate: string;
  }[];
  milestones: {
    id: string;
    title: string;
    dueDate: string;
    status: 'Pending' | 'Completed';
    releaseState: 'Draft' | 'Released';
  }[];
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: any;
  }[];
  files: {
    id: string;
    name: string;
    size: string;
    uploadedBy: string;
    uploadedAt: any;
  }[];
  meetings: {
    id: string;
    title: string;
    time: string;
    link: string;
  }[];
  budget: {
    total: string;
    spent: string;
    remaining: string;
    lineItems: { description: string; amount: string; status: string }[];
  };
  deliverables: { id: string; name: string; status: 'Pending' | 'Submitted' | 'Approved' }[];
  versionHistory: { id: string; docName: string; version: string; author: string; date: string }[];
  activityLogs: { id: string; user: string; action: string; time: string }[];
  createdAt: any;
  updatedAt: any;
}

export interface MatchScore {
  id: string;
  projectId: string;
  opportunityId: string;
  score: number; // e.g. 96
  matchReasons: string[];
}

export interface CollaborationNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'application' | 'message' | 'milestone' | 'general';
  read: boolean;
  createdAt: any;
}
