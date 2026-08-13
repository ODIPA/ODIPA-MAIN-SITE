export const dynamic = 'force-static'

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [],
      },
    ],
    sitemap: 'https://www.odipa.org/sitemap.xml',
    host: 'https://www.odipa.org',
  }
}

export async function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: https://www.odipa.org/sitemap.xml`)
}
