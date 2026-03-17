export const dynamic = 'force-static'

import { MetadataRoute } from 'next'

const BASE = 'https://odipa.org'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core ──────────────────────────────────────────────────────────────
    { url: BASE,                          lastModified: new Date(), changeFrequency: 'monthly',  priority: 1.0 },
    { url: `${BASE}/about`,               lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.9 },
    { url: `${BASE}/donate`,              lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.9 },
    { url: `${BASE}/contact`,             lastModified: new Date(), changeFrequency: 'yearly',   priority: 0.7 },
    { url: `${BASE}/transparency`,        lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.8 },
    { url: `${BASE}/press`,               lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.7 },
    { url: `${BASE}/annual-report`,       lastModified: new Date(), changeFrequency: 'yearly',   priority: 0.7 },
    { url: `${BASE}/privacy-policy`,      lastModified: new Date(), changeFrequency: 'yearly',   priority: 0.4 },

    // ── Programs ──────────────────────────────────────────────────────────
    { url: `${BASE}/programs/educational-outreach`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/programs/advocacy-policy`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/programs/research-publications`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/programs/community-building`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/programs/corporate-certification`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/programs/awareness-campaigns`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/programs/open-source-development`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/programs/international-cooperation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // ── Get Involved ──────────────────────────────────────────────────────
    { url: `${BASE}/get-involved/volunteer`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/get-involved/corporate-partner`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/get-involved/get-certified`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/get-involved/contribute-code`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // ── Actions ───────────────────────────────────────────────────────────
    { url: `${BASE}/become-a-sponsor`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/sponsor-research`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/board-application`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.6 },

    // NOTE: /donate/thank-you is intentionally excluded (robots: noindex)
  ]
}
