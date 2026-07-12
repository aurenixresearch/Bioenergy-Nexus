export interface ResearchPaper {
  id: string;
  title: string;
  author: string;
  category: 'Bioenergy Technology' | 'Waste-to-Energy' | 'Environmental Sustainability' | 'Climate & Energy Policy';
  abstract: string;
  downloadUrl: string;
  publishedYear: number;
  isCustom?: boolean;
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
