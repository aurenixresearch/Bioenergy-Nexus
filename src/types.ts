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
  isDraft?: boolean;
  draftStep?: number;
  userId?: string; // Owner of custom research
  userEmail?: string;

  // Compatibility aliases
  authors?: string;
  methodology?: string;
  journal?: string;
  year?: number | string;

  // Step 1: Basic Information
  subtitle?: string;
  keywords?: string[];
  status?: string;
  visibility?: 'Public' | 'Registered Users' | 'Collaborators Only' | 'Private Draft' | string;
  createdAt?: string;
  updatedAt?: string;
  completionStatus?: string;
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
  reads?: number;
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

export interface UserResearchPublication {
  id: string;
  title: string;
  authors: string;
  publishedYear: number | string;
  journal: string;
  doi: string;
  abstract: string;
  keywords: string | string[];
  publicationUrl: string;
  pdfUrl?: string;
  pdfFileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityComment {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  upvotes?: string[];
}

export interface CommunitySubreddit {
  id: string;
  name: string; // e.g. "a/bioenergy"
  title: string; // "Bioenergy & Clean Fuels"
  description: string;
  category: string;
  bannerColor: string;
  icon: string;
  membersCount: number;
  onlineCount: number;
  createdBy: string;
  createdAt: string;
  rules?: string[];
  isDefault?: boolean;
  views?: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorInstitution: string;
  authorCountry: string;
  authorAvatar?: string;
  title?: string;
  communityId?: string; // e.g. "bioenergy"
  communityName?: string; // e.g. "a/bioenergy"
  flair?: string; // e.g. "Research Paper", "Breakthrough", "Discussion", "Data"
  content: string;
  imageUrl?: string;
  researchLink?: string;
  createdAt: string;
  likes?: string[]; // Array of user IDs (kept for backward compatibility)
  upvotes?: string[]; // Array of user IDs who upvoted
  downvotes?: string[]; // Array of user IDs who downvoted
  comments?: CommunityComment[];
  views?: number;
}

export interface Testimonial {
  id: string;
  userId: string;
  fullName: string;
  occupation: string;
  institution: string;
  country: string;
  rating: number;
  message: string;
  imageUrl?: string;
  website?: string;
  socialProfile?: string;
  approved: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FeedbackType = 'bug' | 'feedback' | 'idea';

export type FeedbackCategory =
  | 'Bug report'
  | 'Feature request'
  | 'User interface feedback'
  | 'User experience feedback'
  | 'Performance issue'
  | 'Security issue'
  | 'Research submission issue'
  | 'Messaging issue'
  | 'Community issue'
  | 'Other';

export interface FeedbackFormValues {
  type: FeedbackType;
  fullName: string;
  email: string;
  subject: string;
  category: FeedbackCategory;
  message: string;
  screenshot?: string;
  browserInfo?: string;
  deviceInfo?: string;
}

export interface UserProfilePrivacySettings {
  email?: 'public' | 'private';
  website?: 'public' | 'private';
  orcid?: 'public' | 'private';
  googleScholar?: 'public' | 'private';
  linkedin?: 'public' | 'private';
  researchgate?: 'public' | 'private';
}

export interface UserProfileProject {
  id: string;
  title: string;
  description?: string;
  status?: string;
  category?: string;
  trl?: number;
  link?: string;
}

export interface UserProfilePatent {
  id: string;
  title: string;
  patentNumber?: string;
  year?: number | string;
  description?: string;
}

export interface UserProfile {
  id: string;
  accountType?: 'individual' | 'institution';
  isOrganization?: boolean;
  
  // Overview Tab - Basic
  profilePicture?: string;
  fullName?: string;
  professionalTitle?: string;
  bio?: string;
  country?: string;
  city?: string;
  institution?: string;
  department?: string;

  // Overview Tab - Academic
  primaryResearchArea?: string;
  secondaryResearchAreas?: string[];
  areasOfSpecialization?: string[];
  academicQualifications?: string[];
  professionalCertifications?: string[];
  currentPosition?: string;
  yearsOfExperience?: number;

  // Overview Tab - Skills
  technicalSkills?: string[];
  laboratorySkills?: string[];
  softwareSkills?: string[];
  languagesSpoken?: string[];

  // Research Tab
  researchInterests?: string[];
  researchKeywords?: string[];
  researchProjects?: UserProfileProject[];
  currentResearchWork?: string;
  researchCategories?: string[];

  // Publications Tab
  publishedPapers?: ResearchPaper[];
  ongoingResearch?: ResearchPaper[];
  draftResearch?: ResearchPaper[];
  patents?: UserProfilePatent[];

  // Collaborations Tab
  openToCollaboration?: boolean;
  openToMentoring?: boolean;
  openToConsulting?: boolean;
  collaborationAreasOfInterest?: string[];

  // Contact Information Tab
  email?: string;
  website?: string;
  orcid?: string;
  googleScholar?: string;
  linkedin?: string;
  researchgate?: string;
  privacySettings?: UserProfilePrivacySettings;

  // Organization Specifics (If Institution account)
  organizationName?: string;
  organizationLogo?: string;
  organizationType?: OrganizationCategory;
  organizationDescription?: string;
  organizationProfile?: Record<string, any>;

  // Organization Verification Architecture
  userRole?: string;
  verificationStatus?: OrgVerificationStatus;
  publisherVerificationLevel?: PublisherVerificationLevel;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationReviewedBy?: string;
  verificationNotes?: string;
  verificationDocuments?: string[];
  verificationHistory?: Array<{
    status: string;
    date: string;
    note?: string;
    reviewer?: string;
  }>;

  // Meta / Stats
  isVerified?: boolean;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type OrganizationCategory =
  | 'university'
  | 'lab'
  | 'company'
  | 'investor'
  | 'government'
  | 'ngo'
  | 'publisher'
  | 'professional'
  | 'other_org';

export type OrgVerificationStatus =
  | 'not_started'
  | 'under_review'
  | 'action_required'
  | 'verified'
  | 'rejected';

export type PublisherVerificationLevel =
  | 'identity_submitted'
  | 'identity_verified'
  | 'journal_verified'
  | 'practices_reviewed'
  | 'fully_verified';

export interface OrgVerificationSubmission {
  userId: string;
  userEmail: string;
  userName?: string;
  userRole?: string;
  organizationType: OrganizationCategory;
  organizationName: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  website?: string;
  submittedAt: string;
  status: OrgVerificationStatus;
  publisherVerificationLevel?: PublisherVerificationLevel;
  details: Record<string, any>;
  documents?: string[];
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  history?: Array<{
    status: string;
    date: string;
    note?: string;
    reviewer?: string;
  }>;
}



