export type PricingModel = 'Free' | 'Paid' | 'Freemium';

export interface AITool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  pricingModel: PricingModel;
  professionCategories: string[];
  workCategories: string[];
  features: string[];
  pros: string[];
  cons: string[];
  rating: number;
  featured: boolean;
  approved: boolean;
  createdAt: string;
  seoTitle?: string;
  metaDescription?: string;
}

export interface Profession {
  id: string;
  name: string;
  slug: string;
  icon: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface WorkCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ToolSubmission extends Partial<AITool> {
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected';
}