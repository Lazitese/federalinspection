import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://federalinspection.gov.et';

  // Define public routes that should be indexed by search engines
  const publicRoutes = [
    '',
    '/about',
    '/contact',
    '/join',
    '/login',
    '/news',
    '/statistics',
    '/abetuta',
    '/asteyayet',
    '/tikoma',
    '/track',
    '/request-access',
    '/representative',
  ];

  const routes = publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
