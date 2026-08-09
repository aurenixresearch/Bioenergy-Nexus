import { ResearchPaper } from './types';

export const RESEARCH_PAPERS: ResearchPaper[] = [];

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  points: string[];
}

export const CONSULTANCY_SERVICES: ServiceDetail[] = [
  {
    id: 'feasibility',
    title: 'Bioenergy Feasibility Studies',
    description: 'Rigorous technical and economic assessment of bioenergy and renewable energy projects.',
    points: [
      'Evaluating technical viability and feed stock supply chains',
      'Resource availability and chemical compatibility testing',
      'Economic modeling and life-cycle cost analysis',
      'Site-specific boundary conditions and constraint modeling'
    ]
  },
  {
    id: 'environmental-impact',
    title: 'Environmental Impact Analysis',
    description: 'Systematic evaluation of the environmental effects of proposed projects, policies, or installations.',
    points: [
      'Carbon footprint assessment and greenhouse gas accounting',
      'Waste stream analysis and circular economy design',
      'Regulatory compliance review for national and international standards',
      'Mitigation planning and sustainable land-use advisory'
    ]
  },
  {
    id: 'net-zero',
    title: 'Net-Zero Strategy & Advisory',
    description: 'Practical roadmaps for organisations, governments, and corporations committing to carbon neutrality.',
    points: [
      'Translating high-level climate ambition into actionable phases',
      'Identifying emission reduction and waste valorization opportunities',
      'Offset strategies and carbon credit market readiness',
      'Milestone tracking with transparent verification frameworks'
    ]
  },
  {
    id: 'research-support',
    title: 'Research & Practical Training',
    description: 'Structured training programs and custom research support on bioenergy systems and sustainable technologies.',
    points: [
      'Hands-on biodigester design and operation training',
      'Capacity building for corporate teams, NGOs, and government agencies',
      'Curriculum support for academic institutions',
      'Bespoke laboratory and field testing protocols'
    ]
  }
];

export interface CollaborationArea {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export const COLLABORATION_AREAS: CollaborationArea[] = [
  {
    id: 'industry',
    title: 'Industry Partnerships',
    description: 'Collaborate on pilot projects, technology deployment, and scaling biomass conversion systems.',
    iconName: 'Building2'
  },
  {
    id: 'policy',
    title: 'Policy & Advocacy',
    description: 'Engage in evidence-based policy research, national standards review, and clean energy lobbying.',
    iconName: 'FileText'
  },
  {
    id: 'funding',
    title: 'Funding & Joint Proposals',
    description: 'Co-apply for international climate grants, research funds, and sustainable development projects.',
    iconName: 'Coins'
  },
  {
    id: 'knowledge',
    title: 'Knowledge Exchange',
    description: 'Co-organize workshops, academic symposia, and practical field demonstrations of bioenergy tech.',
    iconName: 'Users'
  }
];

export interface StakeholderCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export const STAKEHOLDER_CATEGORIES: StakeholderCategory[] = [
  {
    id: 'academic',
    title: 'University & Research Institute',
    description: 'Academic institutions driving fundamental and applied research on organic waste and biotechnology.',
    iconName: 'GraduationCap'
  },
  {
    id: 'energy',
    title: 'Energy Companies & Industry',
    description: 'Private sector organizations developing and deploying physical bioenergy systems or seeking green transitions.',
    iconName: 'Zap'
  },
  {
    id: 'government',
    title: 'Funding & Government Bodies',
    description: 'National ministries, environmental regulators, development banks, and international climate funds.',
    iconName: 'Briefcase'
  },
  {
    id: 'ngo',
    title: 'NGO & Civil Society',
    description: 'Non-profits, advocacy groups, and local farming communities championing a just clean energy future.',
    iconName: 'Heart'
  }
];

export const FOUNDER_INFO = {
  name: 'Filani Olalekan Theophilus',
  title: 'Founder & Lead Renewable Energy Analyst',
  bio: 'Filani Olalekan Theophilus is a dedicated Renewable Energy and Environmental Feasibility/Impact Analyst with hands-on expertise in design, operation, and training of bioenergy systems. He holds a B.Sc. in Industrial Chemistry and has successfully applied his chemical and process foundations in several high-profile real-world implementations, such as configuring waste biodigesters at the Murtala Muhammed International Airport (MMA), Ikeja. Filani is passionate about scaling indigenous scientific capability across Africa and bridging the gap between university research and commercial, scalable clean energy projects.',
  mission: "Aurenix Research connects African research, innovation, and expertise with the global energy and climate ecosystem. We bridge the gap between academic research and real-world impact by empowering local innovators, fostering strategic partnerships, and deploying practical bioenergy solutions across Africa."
};

export const CONTACT_INFO = {
  address: 'NO 1 AINA AJAYI, ABULE EGBA, LAGOS, 340110, NIGERIA',
  email: 'aurenixresearch@gmail.com',
  phone: '(+234) 91-6936-5341',
  hours: 'Monday – Friday, 8:00 AM – 6:00 PM (WAT)',
  socials: {
    linkedin: 'https://www.linkedin.com/in/aurenix-research-hub-818836422?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com'
  }
};
