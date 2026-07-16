import { Project, AllianceOpportunity, InnovationChallenge, MatchScore, Workspace, CollaborationNotification, Application } from './types';

export const RESEARCH_AREAS = [
  'Decentralized Bioenergy & Anaerobic Kinetics',
  'Electrochemical Energy Storage & Supercapacitors',
  'Carbon Capture, Sequestration & CCU',
  'Hydrogen Production & Clean Fuels',
  'Distributed Micro-grids & Smart Power',
  'Circular Biomaterials & Green Chemistry',
  'Thermochemical Conversion & Pyrolysis',
  'Agro-ecological Engineering & Waste Valorization'
];

export const TECHNOLOGY_AREAS = [
  'Net-Zero Technologies',
  'Bio-Based Supercapacitors & Energy Storage',
  'Carbon Capture & Utilization (CCU)',
  'Hydrogen & Clean Fuels Production',
  'Smart Grids & Distributed Power Systems',
  'Circular Materials & Bio-plastics',
  'Waste-to-Energy Process Engineering',
  'Precision Agro-ecological Systems'
];

export const SDG_LIST = [
  'SDG 7: Affordable and Clean Energy',
  'SDG 13: Climate Action',
  'SDG 9: Industry, Innovation, and Infrastructure',
  'SDG 11: Sustainable Cities and Communities',
  'SDG 12: Responsible Consumption and Production',
  'SDG 2: Zero Hunger',
  'SDG 6: Clean Water and Sanitation'
];

export const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'Senegal',
  'South Africa',
  'Ethiopia',
  'United Kingdom',
  'United States',
  'Germany'
];

export const SUPPORT_OPTIONS = [
  'Funding',
  'Laboratory',
  'Equipment',
  'Data',
  'Technical Mentor',
  'Industry Partner',
  'Policy Partner',
  'University Partner',
  'Commercial Partner',
  'Manufacturing',
  'Investor',
  'Prototype Development',
  'Patent Support',
  'Commercialization'
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'High-Yield Anaerobic Digestor for Organic Poultry Waste in Kaduna',
    problemStatement: 'Poultry waste accumulation in northern Nigeria leads to heavy groundwater contamination and release of raw methane. Current digesters struggle with ammonia toxicity from high nitrogen concentration.',
    proposedSolution: 'A dual-stage co-digestion digester using carbon-rich crop residues (maize stover) to balance the C:N ratio, integrated with a local zeolite filter to adsorb ammonia and increase methane yield by 35%.',
    technologyArea: 'Waste-to-Energy Process Engineering',
    trl: 5,
    expectedImpact: 'Diversion of 12 tons of organic waste daily, generating clean gas for 200 off-grid cooperative farmers and producing high-grade nitrogenous organic fertilizer.',
    sdgs: ['SDG 7: Affordable and Clean Energy', 'SDG 12: Responsible Consumption and Production', 'SDG 2: Zero Hunger'],
    country: 'Nigeria',
    institution: 'Ahmadu Bello University',
    researchArea: 'Decentralized Bioenergy & Anaerobic Kinetics',
    supportNeeded: ['Funding', 'Laboratory', 'Equipment', 'Manufacturing'],
    budget: '$18,500',
    timeline: '12 Months',
    milestones: ['Substrate characterization', 'Batch reactor kinetic modeling', 'Bench-scale pilot validation', 'On-site farm installation'],
    currentStage: 'Prototype',
    prototypeAvailable: true,
    patentStatus: 'Pending',
    researchTeam: ['Dr. Yusuf Bello', 'Aisha Ibrahim (MSc)', 'Paul Okoye (PhD Candidate)'],
    createdAt: '2026-05-10T10:00:00Z',
    updatedAt: '2026-07-10T12:00:00Z',
    createdBy: 'sandbox-researcher',
    status: 'Published',
    visibility: 'Public'
  },
  {
    id: 'proj-2',
    title: 'Solar-Powered Pyrolysis Reactor for Cassava Peel Biochar Production',
    problemStatement: 'Cassava processing clusters generate mountains of wet peel residues which rot openly. Farmers lack cheap soil-conditioning agents to retain moisture in sandy acid soils.',
    proposedSolution: 'A solar-thermal concentrator-assisted pyrolysis unit that operates at 450°C without wood or electricity. It processes cassava peels into rich biochar and bio-oil.',
    technologyArea: 'Net-Zero Technologies',
    trl: 4,
    expectedImpact: 'Production of high-quality organic biochar capable of increasing crop yields by 22% in degraded soils, with concurrent bio-oil condensation for localized heating.',
    sdgs: ['SDG 13: Climate Action', 'SDG 9: Industry, Innovation, and Infrastructure', 'SDG 2: Zero Hunger'],
    country: 'Ghana',
    institution: 'KNUST',
    researchArea: 'Thermochemical Conversion & Pyrolysis',
    supportNeeded: ['Funding', 'Policy Partner', 'Prototype Development', 'Patent Support'],
    budget: '$25,000',
    timeline: '18 Months',
    milestones: ['Concentrator design review', 'Pyrolysis temp calibration', 'Biochar soil testing series', 'Intellectual Property filing'],
    currentStage: 'Research',
    prototypeAvailable: false,
    patentStatus: 'None',
    researchTeam: ['Prof. Kofi Mensah', 'Grace Anim'],
    createdAt: '2026-06-01T09:30:00Z',
    updatedAt: '2026-07-02T14:45:00Z',
    createdBy: 'sandbox-researcher',
    status: 'Published',
    visibility: 'Public'
  }
];

export const INITIAL_ALLIANCES: AllianceOpportunity[] = [
  {
    id: 'all-1',
    orgName: 'African Development Bank (AfDB)',
    orgType: 'International Organization',
    country: 'Ivory Coast',
    website: 'https://www.afdb.org',
    contactPerson: 'Dr. Albert Ndoumbe',
    email: 'a.ndoumbe@afdb.org',
    logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
    title: 'Sub-Saharan Clean Energy Innovation Grant 2026',
    description: 'A dedicated grant program to support local West African researchers and institutions developing operational, high-TRL solutions for municipal organic waste valorization, community grids, or biochar synthesis.',
    researchAreas: ['Agro-ecological Engineering & Waste Valorization', 'Decentralized Bioenergy & Anaerobic Kinetics', 'Thermochemical Conversion & Pyrolysis'],
    technologyAreas: ['Waste-to-Energy Process Engineering', 'Net-Zero Technologies'],
    eligibleCountries: ['Nigeria', 'Ghana', 'Kenya', 'Senegal'],
    fundingAmount: '$50,000',
    facilitiesAvailable: ['Technical Auditing', 'Global Networking Forums'],
    timeline: '24 Months',
    deadline: '2026-09-30',
    maxParticipants: 5,
    supportOffered: ['Funding', 'Mentorship', 'Policy Collaboration', 'Commercialization'],
    createdAt: '2026-06-15T08:00:00Z',
    updatedAt: '2026-06-15T08:00:00Z',
    createdBy: 'sandbox-stakeholder',
    status: 'Active',
    visibility: 'Public'
  },
  {
    id: 'all-2',
    orgName: 'University of Lagos Bio-Chemical Lab',
    orgType: 'University',
    country: 'Nigeria',
    website: 'https://unilag.edu.ng',
    contactPerson: 'Prof. Sarah Adebayo',
    email: 'sadebayo@unilag.edu.ng',
    logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
    title: 'Anaerobic Kinetics Gas Chromatography Lab Access',
    description: 'We are opening our advanced, ISO-certified biochemistry laboratory for external researchers working on feedstock characterization, digestate microbiological tracking, and high-performance gas chromatography.',
    researchAreas: ['Decentralized Bioenergy & Anaerobic Kinetics'],
    technologyAreas: ['Waste-to-Energy Process Engineering'],
    eligibleCountries: ['Nigeria'],
    fundingAmount: '$0 (In-Kind Facilities)',
    facilitiesAvailable: ['High-Performance Gas Chromatograph (HPLC)', 'Incubators', 'Methanogenic Genome Sequencer'],
    timeline: '6 Months',
    deadline: '2026-08-15',
    maxParticipants: 3,
    supportOffered: ['Laboratory', 'Equipment', 'Testing', 'Mentorship'],
    createdAt: '2026-07-01T11:00:00Z',
    updatedAt: '2026-07-01T11:00:00Z',
    createdBy: 'sandbox-stakeholder-unilag',
    status: 'Active',
    visibility: 'Public'
  },
  {
    id: 'all-3',
    orgName: 'GreenClimate Capital',
    orgType: 'Investor',
    country: 'United Kingdom',
    website: 'https://www.greenclimatecap.com',
    contactPerson: 'Marcus Vance',
    email: 'm.vance@greenclimate.com',
    logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
    title: 'Seed Funding for Decentralized Agricultural Waste Systems',
    description: 'Venture seed investment program focused on scaling functional prototypes (TRL 5+) into commercial bio-waste conversion or off-grid farm heating pilots in Sub-Saharan Africa.',
    researchAreas: ['Agro-ecological Engineering & Waste Valorization', 'Thermochemical Conversion & Pyrolysis'],
    technologyAreas: ['Net-Zero Technologies', 'Waste-to-Energy Process Engineering'],
    eligibleCountries: ['Nigeria', 'Ghana', 'Kenya', 'South Africa'],
    fundingAmount: '$120,000',
    facilitiesAvailable: ['Investment Modeling', 'Commercial Strategy Advising'],
    timeline: '12 Months',
    deadline: '2026-10-15',
    maxParticipants: 2,
    supportOffered: ['Funding', 'Commercialization', 'Manufacturing', 'Patent Support'],
    createdAt: '2026-07-05T14:30:00Z',
    updatedAt: '2026-07-05T14:30:00Z',
    createdBy: 'sandbox-stakeholder-greenclimate',
    status: 'Active',
    visibility: 'Public'
  }
];

export const INITIAL_CHALLENGES: InnovationChallenge[] = [
  {
    id: 'chal-1',
    orgName: 'World Bank Climate Hub',
    logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
    title: 'Affordable Solar-Powered Cold Storage for Rural Cooperatives',
    description: 'Design and simulate (or prototype) an off-grid solar-thermal cold storage unit capable of maintaining food preservation at 4°C in tropical conditions (ambient 38°C) without chemical refrigerants or heavy battery storage. Solutions must be manufactured utilizing 80% locally sourced West African materials.',
    funding: '$40,000 + Manufacturing Contract',
    timeline: '9 Months',
    deadline: '2026-11-01',
    resourcesAvailable: ['CAD Design Libraries', 'Local Manufacturing Advisory', 'Field Implementation Sites'],
    expectedDeliverables: ['3D CAD Models & Simulation Data', 'Physical Component Bill of Materials', 'Functional 1:5 scale bench model'],
    status: 'Active',
    createdAt: '2026-06-10T10:00:00Z',
    createdBy: 'sandbox-stakeholder-wb'
  },
  {
    id: 'chal-2',
    orgName: 'UN Environment Programme (UNEP)',
    logo: 'https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF',
    title: 'Sargassum Bio-Fertilizer Valorization Scheme',
    description: 'Develop a highly efficient biochemical anaerobic digesting scheme to convert noxious beach-clogging Sargassum macroalgae into high-nitrogen liquid bio-fertilizer, optimizing the high salinity and sulfur pre-treatment.',
    funding: '$25,000',
    timeline: '6 Months',
    deadline: '2026-09-15',
    resourcesAvailable: ['Oceanographic Feedstock Datasets', 'Chemical Pre-treatment Guidelines'],
    expectedDeliverables: ['Salt Extraction Chemical Protocol', 'Methane Yield Kinetics Report', 'Small Crop Soil Impact Trials'],
    status: 'Active',
    createdAt: '2026-07-02T13:00:00Z',
    createdBy: 'sandbox-stakeholder-unep'
  }
];

export const INITIAL_MATCH_SCORES: MatchScore[] = [
  { id: 'm-1', projectId: 'proj-1', opportunityId: 'all-1', score: 96, matchReasons: ['High TRL alignment', 'Substrate fits AfDB target countries', 'High impact potential for agriculture'] },
  { id: 'm-2', projectId: 'proj-1', opportunityId: 'all-2', score: 94, matchReasons: ['Unilag offers HPLC/sequencing suited for kinetics', 'Geographic proximity (Lagos-Kaduna network)', 'Mentorship available for anaerobic digestors'] },
  { id: 'm-3', projectId: 'proj-2', opportunityId: 'all-3', score: 92, matchReasons: ['Venture-focused fund fits pyrolysis biochar system', 'Peel residue is a high-volume target feedstock', 'Eligible country matches Ghana KNUST'] },
  { id: 'm-4', projectId: 'proj-1', opportunityId: 'all-3', score: 88, matchReasons: ['High TRL bio-waste conversion is a primary target', 'Budget matches seed threshold'] }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    projectId: 'proj-1',
    opportunityId: 'all-1',
    applicantId: 'sandbox-researcher',
    applicantName: 'Dr. Yusuf Bello',
    projectTitle: 'High-Yield Anaerobic Digestor for Organic Poultry Waste in Kaduna',
    status: 'Interview',
    timelineStep: 5, // Interview stage in Funding workflow
    createdAt: '2026-07-02T10:00:00Z',
    updatedAt: '2026-07-12T11:00:00Z'
  },
  {
    id: 'app-2',
    projectId: 'proj-1',
    opportunityId: 'all-2',
    applicantId: 'sandbox-researcher',
    applicantName: 'Dr. Yusuf Bello',
    projectTitle: 'High-Yield Anaerobic Digestor for Organic Poultry Waste in Kaduna',
    status: 'Accepted',
    timelineStep: 5, // Testing stage in Lab workflow
    createdAt: '2026-07-05T09:00:00Z',
    updatedAt: '2026-07-14T10:00:00Z'
  }
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'work-1',
    applicationId: 'app-2',
    projectId: 'proj-1',
    opportunityId: 'all-2',
    title: 'Kaduna Digestor & UNILAG Chromatography Lab',
    status: 'Active',
    members: [
      { uid: 'sandbox-researcher', name: 'Dr. Yusuf Bello', role: 'Principal Investigator', email: 'ybello@abu.edu.ng' },
      { uid: 'sandbox-stakeholder-unilag', name: 'Prof. Sarah Adebayo', role: 'Lab Director & Host', email: 'sadebayo@unilag.edu.ng' },
      { uid: 'student-paul', name: 'Paul Okoye', role: 'PhD Researcher', email: 'p.okoye@abu.edu.ng' }
    ],
    researchNotes: [
      { id: 'n-1', title: 'Feedstock Kinetic Parameters (Kaduna Poultry)', content: 'Initial kinetic tests show a volatile fatty acids (VFA) buildup at day 4. Adding crop residues at 1.5:1 ratio stabilised the chemical pH to 7.1. Zeolite columns show high ammonia sorption capability of 14.8 mg N/g.', updatedBy: 'Dr. Yusuf Bello', updatedAt: '2026-07-12T14:00:00Z' },
      { id: 'n-2', title: 'HPLC Test Protocol', content: 'Samples must be centrifuged at 4000 rpm for 15 mins before filter injection. Running mobile phase with 0.05M sulfuric acid on the chromatography column.', updatedBy: 'Prof. Sarah Adebayo', updatedAt: '2026-07-13T10:00:00Z' }
    ],
    tasks: [
      { id: 't-1', title: 'Send 5L digested liquid substrate to Lagos', assignedTo: 'Paul Okoye', status: 'Completed', dueDate: '2026-07-10' },
      { id: 't-2', title: 'Calibrate chromatography column parameters', assignedTo: 'Prof. Sarah Adebayo', status: 'In Progress', dueDate: '2026-07-16' },
      { id: 't-3', title: 'Upload preliminary methane yield graphs', assignedTo: 'Dr. Yusuf Bello', status: 'To Do', dueDate: '2026-07-20' }
    ],
    milestones: [
      { id: 'm-1', title: 'Feedstock supply chain confirmation', dueDate: '2026-07-01', status: 'Completed', releaseState: 'Released' },
      { id: 'm-2', title: 'Chemical Chromatograph Series', dueDate: '2026-07-18', status: 'Pending', releaseState: 'Draft' },
      { id: 'm-3', title: 'Continuous-Flow Digester Integration', dueDate: '2026-08-10', status: 'Pending', releaseState: 'Draft' }
    ],
    messages: [
      { id: 'msg-1', senderId: 'sandbox-researcher', senderName: 'Dr. Yusuf Bello', content: 'Welcome Prof. Sarah! Glad to co-operate. The sample transport from Kaduna was dispatched yesterday.', createdAt: '2026-07-11T10:00:00Z' },
      { id: 'msg-2', senderId: 'sandbox-stakeholder-unilag', senderName: 'Prof. Sarah Adebayo', content: 'Understood. My lab technician has prepped the gas chromatography machinery. Let us log all results directly inside these shared research notes!', createdAt: '2026-07-11T11:15:00Z' }
    ],
    files: [
      { id: 'f-1', name: 'chemical_feedstock_characterisation_kaduna.pdf', size: '2.4 MB', uploadedBy: 'Paul Okoye', uploadedAt: '2026-07-11T12:00:00Z' },
      { id: 'f-2', name: 'hplc_calibration_guide_v2.docx', size: '1.1 MB', uploadedBy: 'Prof. Sarah Adebayo', uploadedAt: '2026-07-12T09:30:00Z' }
    ],
    meetings: [
      { id: 'meet-1', title: 'Weekly Kinetics Review', time: 'Every Thursday, 10:00 AM UTC', link: 'https://meet.google.com/abc-defg-hij' }
    ],
    budget: {
      total: '$18,500',
      spent: '$4,200',
      remaining: '$14,300',
      lineItems: [
        { description: 'Substrate Transport & Storage barrels', amount: '$850', status: 'Disbursed' },
        { description: 'HPLC Mobile Phase consumables & Columns', amount: '$2,350', status: 'Disbursed' },
        { description: 'Zeolite filtration core purchase', amount: '$1,000', status: 'Disbursed' },
        { description: 'Anaerobic sensors & Arduino monitoring', amount: '$1,200', status: 'Pending' }
      ]
    },
    deliverables: [
      { id: 'd-1', name: 'Zeolite Sorption Efficiency Report', status: 'Approved' },
      { id: 'd-2', name: 'Volatile Fatty Acids chromatography graphs', status: 'Pending' }
    ],
    versionHistory: [
      { id: 'v-1', docName: 'Joint kinetics research paper', version: 'v1.0 (Draft)', author: 'Dr. Yusuf Bello', date: '2026-07-10' }
    ],
    activityLogs: [
      { id: 'l-1', user: 'Dr. Yusuf Bello', action: 'Created the joint workspace', time: '2026-07-11 10:00' },
      { id: 'l-2', user: 'Prof. Sarah Adebayo', action: 'Uploaded hplc_calibration_guide_v2.docx', time: '2026-07-12 09:30' }
    ],
    createdAt: '2026-07-11T10:00:00Z',
    updatedAt: '2026-07-13T10:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: CollaborationNotification[] = [
  {
    id: 'not-1',
    userId: 'sandbox-researcher',
    title: 'High AI Match Score Found!',
    message: 'Your project on high-yield anaerobic digestion has a 96% match score with African Development Bank Sub-Saharan Grant opportunity.',
    type: 'match',
    read: false,
    createdAt: '2026-07-12T08:00:00Z'
  },
  {
    id: 'not-2',
    userId: 'sandbox-researcher',
    title: 'Application Progress Update',
    message: 'University of Lagos has accepted your laboratory access application. The joint Notion Workspace has been created!',
    type: 'application',
    read: false,
    createdAt: '2026-07-14T10:00:00Z'
  },
  {
    id: 'not-3',
    userId: 'sandbox-researcher',
    title: 'Workspace Message Received',
    message: 'Prof. Sarah Adebayo posted a new message in your Kaduna Digestor workspace.',
    type: 'message',
    read: true,
    createdAt: '2026-07-11T11:15:00Z'
  }
];
