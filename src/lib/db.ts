
import { AITool, Profession, WorkCategory } from './types';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  getDoc, 
  doc,
  Firestore,
  orderBy
} from 'firebase/firestore';

// Authorized Admin Emails
export const ADMIN_EMAILS = [
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
];

// Static categories for the UI
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

// Fallback Mock Data for initial load/testing
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
  }
];

export async function getToolsFromFirestore(db: Firestore) {
  try {
    const q = query(collection(db, 'tools'), where('approved', '==', true), limit(50));
    const snapshot = await getDocs(q);
    const firestoreTools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AITool));
    return firestoreTools.length > 0 ? firestoreTools : MOCK_TOOLS;
  } catch (error) {
    console.error("Error fetching tools from Firestore:", error);
    return MOCK_TOOLS;
  }
}

export async function getToolBySlug(slug: string, db?: Firestore) {
  if (db) {
    try {
      const q = query(collection(db, 'tools'), where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AITool;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return MOCK_TOOLS.find(t => t.slug === slug);
}

export async function getTrendingTools(db?: Firestore) {
  if (db) {
    try {
      const q = query(collection(db, 'tools'), where('featured', '==', true), limit(6));
      const snapshot = await getDocs(q);
      const firestoreTools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AITool));
      if (firestoreTools.length > 0) return firestoreTools;
    } catch (e) {
      console.error(e);
    }
  }
  return MOCK_TOOLS.filter(t => t.featured).slice(0, 6);
}
