import { MetadataRoute } from 'next';
import { PROFESSIONS, MOCK_TOOLS } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aitoolscompus.vercel.app';

  // Static routes
  const staticRoutes = [
    '',
    '/compare',
    '/submit-tool',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Profession routes
  const professionRoutes = PROFESSIONS.map((prof) => ({
    url: `${baseUrl}/profession/${prof.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Tool routes (using mock tools as base, Google will discover AI routes via links)
  const toolRoutes = MOCK_TOOLS.map((tool) => ({
    url: `${baseUrl}/tool/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...professionRoutes, ...toolRoutes];
}
