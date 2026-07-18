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

export const MOCK_USERS: AdminUser[] = [
  {
    uid: 'sandbox-samuel-adebayo',
    fullName: 'Dr. Samuel Adebayo',
    email: 'samuel.adebayo@aurenix-research.org',
    role: 'Lecturer',
    country: 'Nigeria',
    institution: 'University of Ibadan',
    researchCount: 14,
    projects: 3,
    followers: 245,
    joinedDate: '2023-01-15',
    status: 'active',
    verified: true,
    avatar: 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq'
  },
  {
    uid: 'sandbox-chidi-okafor',
    fullName: 'Engr. Chidi Okafor',
    email: 'chidi.okafor@aurenix-research.org',
    role: 'Industry',
    country: 'Kenya',
    institution: 'Aurenix Cleantech Partners',
    researchCount: 4,
    projects: 5,
    followers: 189,
    joinedDate: '2023-05-20',
    status: 'active',
    verified: true,
    avatar: 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq'
  },
  {
    uid: 'sandbox-blessing-williams',
    fullName: 'Blessing Williams',
    email: 'blessing.williams@aurenix-research.org',
    role: 'Student',
    country: 'Ghana',
    institution: 'KNUST',
    researchCount: 2,
    projects: 1,
    followers: 42,
    joinedDate: '2024-02-10',
    status: 'active',
    verified: false,
    avatar: 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq'
  },
  {
    uid: 'user-fatima-diop',
    fullName: 'Prof. Fatima Diop',
    email: 'f.diop@ucad.edu.sn',
    role: 'Researcher',
    country: 'Senegal',
    institution: 'Université Cheikh Anta Diop',
    researchCount: 22,
    projects: 6,
    followers: 512,
    joinedDate: '2022-11-04',
    status: 'active',
    verified: true,
    avatar: 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq'
  },
  {
    uid: 'user-kofi-mensah',
    fullName: 'Kofi Mensah',
    email: 'k.mensah@greenpower.com',
    role: 'Other',
    country: 'Ghana',
    institution: 'GreenPower Solutions',
    researchCount: 0,
    projects: 0,
    followers: 12,
    joinedDate: '2024-04-01',
    status: 'suspended',
    verified: false,
    avatar: 'https://lh3.googleusercontent.com/d/1utUCWpBRmKjeGRFF1Jo2Z3-ta7B8bgOq'
  }
];

export const MOCK_RESEARCH: AdminResearch[] = [
  {
    id: 'res-001',
    title: 'Characterization of Municipal Solid Waste for Waste-to-Energy Pyrolysis in Lagos',
    author: 'Dr. Samuel Adebayo',
    institution: 'University of Ibadan',
    category: 'Waste-to-Energy',
    views: 1240,
    downloads: 320,
    citations: 18,
    status: 'Approved',
    date: '2023-11-12',
    coverImage: 'https://lh3.googleusercontent.com/d/10ZBdCHZ037o-3k7c2VnRZGT8XXbKdzdy',
    abstract: 'Lagos produces over 13,000 metric tons of municipal solid waste daily. This research investigates the thermal characteristics and pyrolysis yields of municipal solid waste samples collected across five major landfills in Lagos, establishing an optimized feedstock blueprint for commercial waste-to-energy installations.'
  },
  {
    id: 'res-002',
    title: 'Off-grid Hybrid Solar-Biomass Microgrids for Rural Cooperatives',
    author: 'Prof. Fatima Diop',
    institution: 'Université Cheikh Anta Diop',
    category: 'Bioenergy Technology',
    views: 940,
    downloads: 215,
    citations: 12,
    status: 'Approved',
    date: '2024-01-18',
    coverImage: 'https://lh3.googleusercontent.com/d/10ZBdCHZ037o-3k7c2VnRZGT8XXbKdzdy',
    abstract: 'This paper proposes a mathematical control model for hybrid systems pairing photovoltaic arrays with agricultural-residue fueled biogas digesters. Results demonstrate a 98.7% power reliability rate for critical crop-processing operations in sub-Saharan communities.'
  },
  {
    id: 'res-003',
    title: 'Policy Frameworks for Carbon Credit Integration in West African Agriculture',
    author: 'Amina Belkacem',
    institution: 'Carthage University',
    category: 'Climate & Energy Policy',
    views: 480,
    downloads: 92,
    citations: 3,
    status: 'Pending',
    date: '2026-07-14',
    coverImage: 'https://lh3.googleusercontent.com/d/10ZBdCHZ037o-3k7c2VnRZGT8XXbKdzdy',
    abstract: 'Analyzing the micro-economic barriers facing smallholder farmers in enrolling in international voluntary carbon trading systems. Renders structural, regional-level policy designs to standardize carbon accounting.'
  }
];

export const MOCK_PROJECTS: AdminProject[] = [
  {
    id: 'proj-001',
    title: 'Solar-Powered Bio-waste Digester for Off-grid Agro-processors',
    researcher: 'Dr. Samuel Adebayo',
    trl: 6,
    fundingStatus: 'Funded',
    progress: 75,
    industryPartner: 'GreenCycle West Africa Ltd',
    laboratory: 'Renewable Energy Lab, UNILAG',
    country: 'Nigeria',
    status: 'Active',
    description: 'Developing an automated, off-grid digester combining waste heat from solar panels to accelerate organic solid waste degradation into high-yield methane.'
  },
  {
    id: 'proj-002',
    title: 'Decentralized Microgrid Controller with Smart Contract Load-Shedding',
    researcher: 'Engr. Chidi Okafor',
    trl: 4,
    fundingStatus: 'Pending',
    progress: 35,
    industryPartner: 'NexaPower Grid Solutions',
    laboratory: 'Smart Power Systems Center, ABU',
    country: 'Kenya',
    status: 'Active',
    description: 'A hardware-in-the-loop microgrid controller using decentralized logic to coordinate agricultural processing loads based on localized battery states.'
  },
  {
    id: 'proj-003',
    title: 'Algae Biofuel Cultivation System in Arid Coastal Zones',
    researcher: 'Prof. Fatima Diop',
    trl: 2,
    fundingStatus: 'Pending',
    progress: 10,
    industryPartner: 'Senegal Bio-Fuels Group',
    laboratory: 'Marine Biotechnology Lab, UCAD',
    country: 'Senegal',
    status: 'Draft',
    description: 'Investigating high-lipid saline algae strains cultivable in northern Senegalese coastal ponds to synthesize alternative aviation fuels.'
  }
];

export const MOCK_ALLIANCES: AdminAlliance[] = [
  {
    id: 'all-001',
    organization: 'African Climate Foundation',
    opportunity: 'Off-grid Clean Cooking Alliance',
    funding: '$120,000',
    deadline: '2026-09-30',
    applicationsCount: 24,
    views: 1420,
    status: 'Active',
    applications: [
      { id: 'app-01', researcher: 'Dr. Samuel Adebayo', institution: 'UI', date: '2026-07-02', status: 'In Review' },
      { id: 'app-02', researcher: 'Prof. Fatima Diop', institution: 'UCAD', date: '2026-07-10', status: 'Submitted' }
    ]
  },
  {
    id: 'all-002',
    organization: 'UNEP Africa Office',
    opportunity: 'Circular Economy Landfill Recovery Research Initiative',
    funding: '$85,000',
    deadline: '2026-08-15',
    applicationsCount: 14,
    views: 890,
    status: 'Active',
    applications: [
      { id: 'app-03', researcher: 'Blessing Williams', institution: 'KNUST', date: '2026-07-11', status: 'Submitted' }
    ]
  }
];

export const MOCK_ORGANIZATIONS: AdminOrganization[] = [
  {
    id: 'org-001',
    name: 'University of Ibadan',
    category: 'Universities',
    logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
    country: 'Nigeria',
    website: 'https://ui.edu.ng',
    verified: true,
    allianceCount: 8,
    projectsSupported: 12,
    followers: 1240,
    status: 'active'
  },
  {
    id: 'org-002',
    name: 'GreenCycle West Africa Ltd',
    category: 'Industries',
    logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
    country: 'Nigeria',
    website: 'https://greencycle-wa.com',
    verified: true,
    allianceCount: 3,
    projectsSupported: 4,
    followers: 430,
    status: 'active'
  },
  {
    id: 'org-003',
    name: 'African Climate Foundation',
    category: 'NGOs',
    logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
    country: 'South Africa',
    website: 'https://africanclimatefoundation.org',
    verified: true,
    allianceCount: 15,
    projectsSupported: 24,
    followers: 3290,
    status: 'active'
  }
];

export const MOCK_CONSULTING: AdminConsulting[] = [
  {
    id: 'con-001',
    researcher: 'Dr. Samuel Adebayo',
    consultant: 'Dr. Sarah Adebayo',
    subject: 'Pyrolysis Reactor Feasibility Review',
    status: 'In Review',
    priority: 'High',
    date: '2026-07-15',
    message: 'Requesting expert engineering oversight on custom pyrolysis vessel stress limits and gas condenser sizing designed for high-humidity municipal organic fractions.',
    files: [
      { name: 'Pyrolysis_Reactor_v2.pdf', size: '4.8 MB', url: '#' },
      { name: 'Condenser_Thermal_Calcs.xlsx', size: '1.2 MB', url: '#' }
    ],
    chat: [
      { sender: 'System', msg: 'Consultation initialized with Dr. Sarah Adebayo.', timestamp: '2026-07-15T11:00:00Z' },
      { sender: 'Dr. Sarah Adebayo', msg: 'Hi Samuel, I received the thermal load spreadsheet. Can you clarify the expected moisture content threshold of input sorting?', timestamp: '2026-07-16T09:24:00Z' }
    ]
  },
  {
    id: 'con-002',
    researcher: 'Blessing Williams',
    subject: 'Academic Mentorship in Circular Economy Research',
    status: 'Pending',
    priority: 'Medium',
    date: '2026-07-16',
    message: 'Need help refining the focus scope for my master\'s proposal investigating e-waste tracking across Ghana.',
    files: [{ name: 'Proposal_Draft_Ghana_E_Waste.docx', size: '840 KB', url: '#' }]
  }
];

export const MOCK_FUNDING: AdminFunding[] = [
  {
    id: 'fund-001',
    sponsor: 'African Climate Foundation',
    amount: '$150,000',
    deadline: '2026-10-15',
    applicantsCount: 34,
    status: 'Open',
    type: 'Grant',
    description: 'Supporting high-potential clean technology innovations originating in African universities and transitioning into local commercial initiatives.'
  },
  {
    id: 'fund-002',
    sponsor: 'Venture Green Ventures',
    amount: '$300,000',
    deadline: '2026-09-01',
    applicantsCount: 18,
    status: 'Open',
    type: 'Venture Capital',
    description: 'Seed stage capital for clean microgrid or storage startups across East and West Africa demonstrating positive TRL-5 development.'
  }
];

export const MOCK_CHALLENGES: AdminChallenge[] = [
  {
    id: 'chal-001',
    title: 'The Great Lagos Waste-to-Energy Hackathon',
    description: 'Designing low-cost, decentralized community organic composters capable of self-generating heating energy without external power requirements.',
    funding: '$25,000',
    timeline: '3 Months (Aug - Oct 2026)',
    expectedDeliverables: 'Working TRL-5 physical prototype, energy simulation logs, and local integration schema.',
    deadline: '2026-08-10',
    supportingOrganization: 'GreenCycle West Africa Ltd',
    researchArea: 'Waste-to-Energy',
    status: 'Active',
    featured: true
  }
];

export const MOCK_REPORTS: AdminReportedItem[] = [
  {
    id: 'rep-001',
    type: 'Comment',
    reporter: 'Prof. Fatima Diop',
    reportedEntityName: 'Spam Comment on Bio-waste pyrolyzer research',
    entityId: 'comment-4912',
    reason: 'Unprofessional language and self-promotional link spam.',
    severity: 'Minor',
    date: '2026-07-16',
    status: 'Pending',
    contentSnippet: 'Buy crypto coins here: http://spammed-coins.xyz'
  },
  {
    id: 'rep-002',
    type: 'Research',
    reporter: 'Engr. Chidi Okafor',
    reportedEntityName: 'Reported Paper: Carbon offsets via fake claims',
    entityId: 'res-999',
    reason: 'Plagiarism. Copied figures and datasets directly from South African Renewable Reports without citation.',
    severity: 'Critical',
    date: '2026-07-15',
    status: 'Pending',
    aiFlagged: true,
    contentSnippet: 'Abstract mimics directly the 2021 study by CSIR.'
  }
];

export const MOCK_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'aud-001',
    administrator: 'Bola Adeyemi (Super Admin)',
    action: 'Approved User Verification',
    affectedResource: 'User: Dr. Samuel Adebayo',
    oldValue: 'Status: Pending Verification',
    newValue: 'Status: Verified Researcher',
    timestamp: '2026-07-16T14:24:12Z',
    ipAddress: '102.89.23.44',
    browser: 'Chrome 125.0',
    device: 'MacBook Pro (macOS)'
  },
  {
    id: 'aud-002',
    administrator: 'Amina Alao (Moderator)',
    action: 'Flagged Research Paper',
    affectedResource: 'Research: Carbon offsets via fake claims',
    oldValue: 'Status: Active',
    newValue: 'Status: Under Investigation (Flagged)',
    timestamp: '2026-07-15T09:12:05Z',
    ipAddress: '197.210.8.192',
    browser: 'Safari 17.4',
    device: 'iPad (iOS)'
  }
];

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
  },
  {
    id: 'role-researcher',
    roleName: 'Researcher',
    description: 'Submits research publications, explores active energy networks, and manages academic collaboration teams.',
    permissions: {
      dashboard: true, users: false, research: true, projects: true, alliances: true, organizations: false,
      consulting: false, funding: false, challenges: false, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-senior-researcher',
    roleName: 'Senior Researcher',
    description: 'Advanced researchers with broad capability to consult, lead projects, and direct strategic circular research.',
    permissions: {
      dashboard: true, users: false, research: true, projects: true, alliances: true, organizations: true,
      consulting: true, funding: false, challenges: false, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-student-cohort',
    roleName: 'Student Cohort',
    description: 'Students and research trainees exploring modern climate energy modeling and submitting basic field research.',
    permissions: {
      dashboard: true, users: false, research: true, projects: false, alliances: false, organizations: false,
      consulting: false, funding: false, challenges: true, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-student',
    roleName: 'Student',
    description: 'Basic student tier with view access to research publications and active participation in innovation challenges.',
    permissions: {
      dashboard: true, users: false, research: true, projects: false, alliances: false, organizations: false,
      consulting: false, funding: false, challenges: true, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-consultant',
    roleName: 'Clean Tech Consultant',
    description: 'Advises partners on technology, coordinates consultation inquiries, and facilitates commercial scaling.',
    permissions: {
      dashboard: true, users: false, research: true, projects: true, alliances: false, organizations: false,
      consulting: true, funding: false, challenges: false, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-partner',
    roleName: 'Academic Partner',
    description: 'Institutional stakeholders managing alliance opportunities and overseeing sustainable ecosystem integrations.',
    permissions: {
      dashboard: true, users: false, research: true, projects: true, alliances: true, organizations: true,
      consulting: false, funding: false, challenges: false, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-industry',
    roleName: 'Industry Professional',
    description: 'Commercial partners matching consulting needs, viewing investment resources, and scaling circular business models.',
    permissions: {
      dashboard: true, users: false, research: true, projects: true, alliances: true, organizations: true,
      consulting: true, funding: false, challenges: false, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-ngo',
    roleName: 'NGO / Development',
    description: 'Non-governmental advocates coordinating development initiatives and distributing funding sponsorships.',
    permissions: {
      dashboard: true, users: false, research: true, projects: false, alliances: true, organizations: true,
      consulting: false, funding: true, challenges: false, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-lecturer',
    roleName: 'Lecturer / Professor',
    description: 'Academic instructors and professors organizing courses, managing research, and sponsoring student cohorts.',
    permissions: {
      dashboard: true, users: false, research: true, projects: true, alliances: true, organizations: true,
      consulting: false, funding: false, challenges: false, moderation: false, settings: false, auditLogs: false
    }
  },
  {
    id: 'role-platform-super-admin',
    roleName: 'Platform Super Admin',
    description: 'Ecosystem coordinator with master configurations over users, roles, and administrative tasks.',
    permissions: {
      dashboard: true, users: true, research: true, projects: true, alliances: true, organizations: true,
      consulting: true, funding: true, challenges: true, moderation: true, settings: true, auditLogs: true
    }
  }
];
