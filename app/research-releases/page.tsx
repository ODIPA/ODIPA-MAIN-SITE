import type { Metadata } from 'next'
import Link from 'next/link'
import { sortedReleases } from '@/data/research-releases'

export const metadata: Metadata = {
  title: 'ODIPA Research Releases',
  description:
    'Independent privacy research from ODIPA. Monthly privacy law digests, research briefs, and special investigations, free to read, cite, and share.',
  alternates: { canonical: 'https://www.odipa.org/research-releases' },
  openGraph: {
    title: 'ODIPA Research Releases',
    description:
      'Independent privacy research from ODIPA. Free to read, cite, and share.',
    url: 'https://www.odipa.org/research-releases',
    images: ['https://www.odipa.org/og-image.png'],
  },
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function ResearchReleasesPage() {
  const releases = sortedReleases()

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-14">
          <Link
            href="/programs/research-publications"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline"
          >
            ← Research &amp; Publications
          </Link>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-4">
            <span className="block w-5 h-px bg-gold-light" />
            Free to the public
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            ODIPA Research Releases
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-xl">
            Independent privacy research from ODIPA and our volunteer researchers.
            Every release is free to read, cite, and share, and every release names
            its author and its sources.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy mb-5">Latest releases</h2>

          {releases.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-[14px] text-slate-500 leading-relaxed">
                Our first research release is on its way. Subscribe to the{' '}
                <Link href="/newsletter" className="text-blue-brand underline">
                  Privacy Monthly Digest
                </Link>{' '}
                and it will arrive in your inbox the day it is published.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {releases.map((r) => (
              <Link
                key={r.slug}
                href={`/research-releases/${r.slug}`}
                className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-brand/30 hover:shadow-sm transition-all no-underline"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[2px] text-gold bg-gold/10 px-3 py-1 rounded-full">
                    {r.type}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{formatDate(r.date)}</span>
                </div>
                <h3 className="font-display text-[20px] font-bold text-navy mb-2">{r.title}</h3>
                <p className="text-[14px] text-slate-500 leading-[1.75] mb-3">{r.summary}</p>
                <span className="font-mono text-[11px] text-slate-400">By {r.author}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-display text-[18px] font-bold text-navy mb-2">How ODIPA research works</h2>
          <p className="text-[14px] text-slate-500 leading-[1.75]">
            ODIPA owns and publishes its research first, and researchers are credited by
            name. Sponsors may fund a topic, but they never influence methods, findings,
            or conclusions. Questions or corrections can go to{' '}
            <a href="mailto:research@odipa.org" className="text-blue-brand underline">research@odipa.org</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
