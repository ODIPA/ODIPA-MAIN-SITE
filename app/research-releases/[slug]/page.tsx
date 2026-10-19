import type { Metadata } from 'next'
import Link from 'next/link'
import { getRelease, releases } from '@/data/research-releases'

type Params = { slug: string }

// The site is a static export, and Next.js refuses to build a dynamic route
// that returns no params. Until the first release is added, a placeholder slug
// keeps the build working. It renders a "not found" message, so it is harmless.
export const dynamicParams = false

export function generateStaticParams(): Params[] {
  if (releases.length === 0) return [{ slug: 'coming-soon' }]
  return releases.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const release = getRelease(slug)
  if (!release) return {}
  const url = `https://www.odipa.org/research-releases/${release.slug}`
  return {
    title: release.title,
    description: release.summary,
    alternates: { canonical: url },
    authors: [{ name: release.author }],
    openGraph: {
      title: release.title,
      description: release.summary,
      url,
      type: 'article',
      publishedTime: release.date,
      authors: [release.author],
      images: ['https://www.odipa.org/og-image.png'],
    },
  }
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function ReleasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const release = getRelease(slug)
  if (!release) {
    return (
      <div className="bg-cream min-h-screen">
        <div className="max-w-3xl mx-auto px-6 pt-40 pb-24 text-center">
          <h1 className="font-display text-3xl font-bold text-navy mb-4">Release not found</h1>
          <p className="text-[15px] text-slate-500 mb-6">
            We could not find that research release. Our first release is on its way.
          </p>
          <Link href="/research-releases" className="text-blue-brand underline">
            See all research releases
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-14">
          <Link
            href="/research-releases"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors mb-8 no-underline"
          >
            ← ODIPA Research Releases
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[2px] text-gold-light border border-gold-light/30 px-3 py-1 rounded-full">
              {release.type}
            </span>
            <span className="font-mono text-[11px] text-white/50">{formatDate(release.date)}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            {release.title}
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-xl mb-4">{release.summary}</p>
          <p className="font-mono text-[12px] text-white/60">By {release.author}</p>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {release.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl font-bold text-navy mb-4">{s.heading}</h2>
            <div className="space-y-4">
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-[16px] text-slate-600 leading-[1.9]">{p}</p>
              ))}
            </div>
            {s.links && s.links.length > 0 && (
              <p className="mt-4 text-[14px] text-slate-500">
                Read more{' '}
                {s.links.map((l, i) => (
                  <span key={l.href}>
                    {i > 0 && ' | '}
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-blue-brand underline">
                      {l.label}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </section>
        ))}

        {release.sources && release.sources.length > 0 && (
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-display text-[18px] font-bold text-navy mb-3">Sources</h2>
            <ul className="space-y-1.5 text-[14px]">
              {release.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-blue-brand underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-[13px] text-slate-400 leading-relaxed">
          This release is general information, not legal advice. Corrections are welcome at{' '}
          <a href="mailto:research@odipa.org" className="text-blue-brand underline">research@odipa.org</a>.
        </p>
      </article>
    </div>
  )
}
