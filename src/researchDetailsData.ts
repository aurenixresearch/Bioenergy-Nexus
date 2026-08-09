export interface DetailedResearch {
  id: string;
  title: string;
  author: string;
  category: string;
  publishedYear: number;
  abstract: string;
  introduction: string;
  methodology: string[];
  findings: string[];
  metrics: { label: string; value: string; description: string; color: string }[];
  recommendations: string[];
  citation: string;
  stats?: { name: string; value: number }[];
}

export const DETAILED_RESEARCH_DATA: Record<string, DetailedResearch> = {};
