export interface AdminUser {
  uid: string;
  fullName: string;
  email: string;
  role: 'Student' | 'Researcher' | 'Lecturer' | 'Institution' | 'Industry' | 'Government' | 'NGO' | 'Other' | 'admin' | 'super_admin';
  adminRoleName?: string;
  country: string;
  institution: string;
  researchCount: number;
  projects: number;
  followers: number;
  joinedDate: string;
  status: 'active' | 'suspended' | 'deactivated';
  verified: boolean;
  avatar?: string;
}

export interface AdminResearch {
  id: string;
  title: string;
  author: string;
  institution: string;
  category: 'Bioenergy Technology' | 'Waste-to-Energy' | 'Environmental Sustainability' | 'Climate & Energy Policy';
  views: number;
  downloads: number;
  citations: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Archived';
  date: string;
  coverImage?: string;
  abstract: string;
  feedback?: string;
  featured?: boolean;
}

export interface AdminProject {
  id: string;
  title: string;
  researcher: string;
  trl: number;
  fundingStatus: 'Pending' | 'Approved' | 'Funded';
  progress: number;
  industryPartner: string;
  laboratory: string;
  country: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Archived';
  description?: string;
  featured?: boolean;
}

export interface AdminAlliance {
  id: string;
  organization: string;
  opportunity: string;
  funding: string;
  deadline: string;
  applicationsCount: number;
  views: number;
  status: 'Active' | 'Under Review' | 'Closed' | 'Archived';
  applications?: any[];
}

export interface AdminOrganization {
  id: string;
  name: string;
  category: 'Universities' | 'Industries' | 'Government' | 'NGOs' | 'Investors' | 'International Organizations';
  logo: string;
  country: string;
  website: string;
  verified: boolean;
  allianceCount: number;
  projectsSupported: number;
  followers: number;
  status: 'active' | 'suspended';
}

export interface AdminConsulting {
  id: string;
  researcher: string;
  consultant?: string;
  subject: string;
  status: 'Pending' | 'In Review' | 'Completed' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  date: string;
  message: string;
  files?: { name: string; size: string; url: string }[];
  chat?: { sender: string; msg: string; timestamp: string }[];
}

export interface AdminFunding {
  id: string;
  sponsor: string;
  amount: string;
  deadline: string;
  applicantsCount: number;
  status: 'Open' | 'Closed' | 'Draft' | 'Archived';
  type: 'Grant' | 'Fellowship' | 'Venture Capital' | 'Green Bond';
  description: string;
  applications?: any[];
}

export interface AdminChallenge {
  id: string;
  title: string;
  description: string;
  funding: string;
  timeline: string;
  expectedDeliverables: string;
  deadline: string;
  supportingOrganization: string;
  researchArea: string;
  status: 'Active' | 'Draft' | 'Archived';
  featured?: boolean;
}

export interface AdminReportedItem {
  id: string;
  type: 'User' | 'Research' | 'Comment' | 'Organization' | 'Message';
  reporter: string;
  reportedEntityName: string;
  entityId: string;
  reason: string;
  severity: 'Critical' | 'Major' | 'Minor';
  date: string;
  status: 'Pending' | 'Resolved' | 'Ignored';
  aiFlagged?: boolean;
  contentSnippet?: string;
}

export interface AdminAuditLog {
  id: string;
  administrator: string;
  action: string;
  affectedResource: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  ipAddress: string;
  browser: string;
  device: string;
}

export interface AdminRoleConfig {
  id: string;
  roleName: string;
  description: string;
  permissions: {
    dashboard: boolean;
    users: boolean;
    research: boolean;
    projects: boolean;
    alliances: boolean;
    organizations: boolean;
    consulting: boolean;
    funding: boolean;
    challenges: boolean;
    moderation: boolean;
    settings: boolean;
    auditLogs: boolean;
  };
}

export const MOCK_USERS: AdminUser[] = [];
export const MOCK_RESEARCH: AdminResearch[] = [];
export const MOCK_PROJECTS: AdminProject[] = [];
export const MOCK_ALLIANCES: AdminAlliance[] = [];
export const MOCK_ORGANIZATIONS: AdminOrganization[] = [];
export const MOCK_CONSULTING: AdminConsulting[] = [];
export const MOCK_FUNDING: AdminFunding[] = [];
export const MOCK_CHALLENGES: AdminChallenge[] = [];
export const MOCK_REPORTS: AdminReportedItem[] = [];
export const MOCK_AUDIT_LOGS: AdminAuditLog[] = [];

export const INITIAL_ADMIN_USERS: AdminUser[] = [];
export const INITIAL_ADMIN_RESEARCH: AdminResearch[] = [];
export const INITIAL_ADMIN_PROJECTS: AdminProject[] = [];
export const INITIAL_ADMIN_ALLIANCES: AdminAlliance[] = [];
export const INITIAL_ADMIN_ORGANIZATIONS: AdminOrganization[] = [];
export const INITIAL_ADMIN_CONSULTING: AdminConsulting[] = [];
export const INITIAL_ADMIN_FUNDING: AdminFunding[] = [];
export const INITIAL_ADMIN_CHALLENGES: AdminChallenge[] = [];
export const INITIAL_ADMIN_REPORTS: AdminReportedItem[] = [];
export const INITIAL_ADMIN_AUDIT_LOGS: AdminAuditLog[] = [];

export const MOCK_ADMIN_ROLES: AdminRoleConfig[] = [
  {
    id: 'role-super',
    roleName: 'Super Admin',
    description: 'Unrestricted control over every core aspect of the platform database, security, integrations, and administration accounts.',
    permissions: {
      dashboard: true, users: true, research: true, projects: true, alliances: true, organizations: true,
      consulting: true, funding: true, challenges: true, moderation: true, settings: true, auditLogs: true
    }
  },
  {
    id: 'role-mod',
    roleName: 'Research Moderator',
    description: 'Responsible for editing, approving, archiving, or removing research repository submissions, validating expert ORCID profiles, and handling reported comments.',
    permissions: {
      dashboard: true, users: true, research: true, projects: false, alliances: false, organizations: true,
      consulting: false, funding: false, challenges: false, moderation: true, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-fund',
    roleName: 'Funding Manager',
    description: 'Administers investment programs, innovation challenges, funding sponsorships, alliance opportunities, and approves financial proposals.',
    permissions: {
      dashboard: true, users: false, research: false, projects: true, alliances: true, organizations: true,
      consulting: true, funding: true, challenges: true, moderation: false, settings: false, auditLogs: false
    }
  }
];
