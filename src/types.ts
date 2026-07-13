export interface CoAuthor {
  name: string;
  institution?: string;
  department?: string;
  country?: string;
  orcid?: string;
  scholar?: string;
}

export interface ResearchVersion {
  id: string;
  version: string;
  title: string;
  abstract: string;
  publishedYear: number;
  date: string;
  notes: string;
  changes?: string[];
  // Store snapshot of other fields if changed
  status?: string;
  methodology?: string;
  findings?: string;
  conclusion?: string;
  problemStatement?: string;
  objectives?: string;
  keywords?: string[];
  tags?: string[];
  visibility?: string;
}

export interface ResearchContribution {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'Suggest Edit' | 'Add Data' | 'Upload Supporting Document' | 'Add Reference' | 'Join as Collaborator' | 'Peer Review' | 'Report an Error';
  explanation: string;
  uploadedFiles?: { name: string; type: string; url: string }[];
  additionalNotes?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Changes Requested';
  createdAt: string;
}

export interface ResearchComment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  author: string;
  category: 'Bioenergy Technology' | 'Waste-to-Energy' | 'Environmental Sustainability' | 'Climate & Energy Policy';
  abstract: string;
  downloadUrl: string;
  publishedYear: number;
  isCustom?: boolean;
  userId?: string; // Owner of custom research
  userEmail?: string;

  // Step 1: Basic Information
  subtitle?: string;
  keywords?: string[];
  status?: 'Ongoing' | 'Completed' | 'Under Review' | 'Published';
  language?: string;
  readingTime?: string;

  // Step 2: Authors details
  leadResearcher?: string;
  coAuthors?: CoAuthor[];
  institution?: string;
  department?: string;
  country?: string;
  orcid?: string;
  googleScholar?: string;

  // Step 3: Research Details
  problemStatement?: string;
  objectives?: string;
  researchQuestions?: string;
  researchMethodology?: string;
  materialsUsed?: string;
  dataCollectionMethod?: string;
  studyArea?: string;
  durationOfResearch?: string;

  // Step 4: Findings
  keyFindings?: string;
  discussion?: string;
  conclusion?: string;
  recommendations?: string;
  futureResearch?: string;

  // Step 5: Upload references (links or text)
  uploads?: {
    pdf?: string;
    coverImage?: string;
    figures?: string;
    tables?: string;
    datasets?: string;
    supplementary?: string;
  };

  // Step 6: Tags
  tags?: string[];

  // Step 7: Visibility
  visibility?: 'Public' | 'Registered Users' | 'Collaborators Only' | 'Private Draft';

  // Step 8: License
  license?: 'Copyright' | 'Creative Commons' | 'Open Access';
  isConfirmed?: boolean;

  // IEEE/APA style extra meta
  doi?: string;
  viewsCount?: number;
  downloadsCount?: number;
  bookmarksCount?: number;

  // Versions & Contributions & Comments
  versions?: ResearchVersion[];
  contributions?: ResearchContribution[];
  comments?: ResearchComment[];
}

export interface ConsultationInquiry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  organization: string;
  serviceType: string;
  message: string;
  createdAt: string;
  status: 'Pending' | 'In Review' | 'Completed';
}

export interface PartnershipSubmission {
  id: string;
  userId: string;
  userEmail: string;
  partnerName: string;
  stakeholderType: 'University & Research Institute' | 'Energy Companies & Industry' | 'Funding & Government Bodies' | 'NGO & Civil Society';
  collaborationArea: string;
  message: string;
  createdAt: string;
}

export interface UserSavedPaper {
  id: string;
  userId: string;
  paperId: string;
  savedAt: string;
}

export interface Researcher {
  id: string;
  fullName: string;
  profilePhoto: string;
  role: string;
  institution: string;
  country: string;
  bio: string;
  researchInterests: string[];
  verified: boolean;
  followers: string[]; // List of user IDs following
  following: number; // Number of people they follow
  publicationCount: number;
  downloads: number;
  views: number;
  citations: number;
  createdAt: string;
  orcid?: string;
  googleScholar?: string;
  linkedin?: string;
  email?: string;
  website?: string;
  qualifications?: string[];
  experienceYears?: number;
}

export interface Publication {
  id: string;
  researcherId: string;
  title: string;
  abstract: string;
  category: string;
  keywords: string[];
  pdfUrl: string;
  coverImage?: string;
  downloads: number;
  views: number;
  citations: number;
  createdAt: string;
}

