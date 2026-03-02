import { AITool, Profession, WorkCategory } from './types';

// Mock data
export const PROFESSIONS: Profession[] = [
  { id: '1', name: 'Developers', slug: 'developers', icon: 'Code' },
  { id: '2', name: 'Graphic Designers', slug: 'graphic-designers', icon: 'Palette' },
  { id: '3', name: 'Digital Marketers', slug: 'digital-marketers', icon: 'BarChart' },
  { id: '4', name: 'Content Writers', slug: 'content-writers', icon: 'PenTool' },
  { id: '5', name: 'Lawyers', slug: 'lawyers', icon: 'Scale' },
  { id: '6', name: 'Doctors', slug: 'doctors', icon: 'Stethoscope' },
  { id: '7', name: 'Teachers', slug: 'teachers', icon: 'GraduationCap' },
];

export const WORK_CATEGORIES: WorkCategory[] = [
  { id: 'w1', name: 'Content Creation', slug: 'content-creation', icon: 'FileText' },
  { id: 'w2', name: 'Image Generation', slug: 'image-generation', icon: 'Image' },
  { id: 'w3', name: 'Video Editing', slug: 'video-editing', icon: 'Video' },
  { id: 'w4', name: 'Code Generation', slug: 'code-generation', icon: 'Terminal' },
  { id: 'w5', name: 'Data Analysis', slug: 'data-analysis', icon: 'Database' },
];

export const MOCK_TOOLS: AITool[] = [
  {
    id: 't1',
    name: 'CodePilot AI',
    slug: 'codepilot-ai',
    tagline: 'Write better code, faster.',
    description: 'CodePilot AI is an advanced coding assistant that helps developers write, debug, and optimize code in real-time. It supports over 50 programming languages and integrates seamlessly with popular IDEs.',
    logoUrl: 'https://picsum.photos/seed/tool-1/200/200',
    websiteUrl: 'https://example.com',
    pricingModel: 'Freemium',
    professionCategories: ['developers'],
    workCategories: ['code-generation'],
    features: ['Real-time code completion', 'Automated bug detection', 'Code refactoring suggestions'],
    pros: ['Highly accurate', 'Extensive language support', 'Low latency'],
    cons: ['Paid version is pricey', 'Occasional hallucination'],
    rating: 4.8,
    featured: true,
    approved: true,
    createdAt: '2024-01-01T00:00:00Z',
    seoTitle: 'CodePilot AI Review - Best AI Coding Assistant 2024',
    metaDescription: 'Discover why CodePilot AI is the leading AI tool for developers. Read features, pricing, and comparison.'
  },
  {
    id: 't2',
    name: 'ArtGen Studio',
    slug: 'artgen-studio',
    tagline: 'From imagination to canvas in seconds.',
    description: 'ArtGen Studio uses state-of-the-art diffusion models to generate stunning digital art from simple text prompts. Perfect for graphic designers and marketers.',
    logoUrl: 'https://picsum.photos/seed/tool-2/200/200',
    websiteUrl: 'https://example.com',
    pricingModel: 'Paid',
    professionCategories: ['graphic-designers', 'digital-marketers'],
    workCategories: ['image-generation'],
    features: ['High-resolution export', 'Custom style training', 'Batch generation'],
    pros: ['Unique artistic styles', 'Intuitive UI'],
    cons: ['Steep learning curve for advanced prompts'],
    rating: 4.5,
    featured: true,
    approved: true,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 't3',
    name: 'CopyFlow',
    slug: 'copyflow',
    tagline: 'Scale your content production effortlessly.',
    description: 'CopyFlow is the ultimate AI writing partner for content teams. Generate blog posts, social media captions, and ad copy that resonates with your audience.',
    logoUrl: 'https://picsum.photos/seed/tool-3/200/200',
    websiteUrl: 'https://example.com',
    pricingModel: 'Freemium',
    professionCategories: ['content-writers', 'digital-marketers'],
    workCategories: ['content-creation'],
    features: ['SEO analysis', 'Tone of voice adjustment', 'Plagiarism checker'],
    pros: ['Great for short-form content', 'Collaboration tools'],
    cons: ['Long-form output needs editing'],
    rating: 4.2,
    featured: false,
    approved: true,
    createdAt: '2024-01-03T00:00:00Z',
  }
];

export async function getTools(filters?: { profession?: string; work?: string; search?: string }) {
  let filtered = MOCK_TOOLS.filter(t => t.approved);
  if (filters?.profession) filtered = filtered.filter(t => t.professionCategories.includes(filters.profession!));
  if (filters?.work) filtered = filtered.filter(t => t.workCategories.includes(filters.work!));
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(s) || 
      t.description.toLowerCase().includes(s) ||
      t.tagline.toLowerCase().includes(s) ||
      t.professionCategories.some(pc => pc.toLowerCase().includes(s)) ||
      t.workCategories.some(wc => wc.toLowerCase().includes(s))
    );
  }
  return filtered;
}

export async function getToolBySlug(slug: string) {
  return MOCK_TOOLS.find(t => t.slug === slug);
}

export async function getTrendingTools() {
  return MOCK_TOOLS.filter(t => t.featured).slice(0, 6);
}