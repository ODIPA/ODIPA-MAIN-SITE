'use client'

/**
 * ODIPA Articles. One page for the list and for a single article, chosen by
 * the ?a=slug address, because articles are written in the admin dashboard
 * and are not part of the static build. Text comes from ODIPA's own API.
 */

import { useEffect, useState } from 'react'
import NewsletterSignup from '@/components/NewsletterSignup'
import ArticleBody, { Block } from '@/components/ArticleBody'

type Summary = { slug: string; title: string; summary: string; author: string; publishedAt: string }
type Full = Summary & { blocks: Block[]; sources: { label: string; href: string }[] }

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function ArticlesPublic() {
  const [slug, setSlug] = useState<string | null | undefined>(undefined)
  const [list, setList] = useState<Summary[] | null>(null)
  const [article, setArticle] = useState<Full | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'missing' | 'error'>('loading')

  useEffect(() => {
    setSlug(new URLSearchParams(window.location.search).get('a'))
  }, [])

  useEffect(() => {
    if (slug === undefined) return
    setState('loading')
    if (slug) {
      fetch(`/api/articles?slug=${encodeURIComponent(slug)}`)
        .then(r => {
          if (r.status === 404) { setState('missing'); return null }
          if (!r.ok) throw new Error()
          return r.json()
        })
        .then(d => { if (d) { setArticle(d.article); document.title = `${d.article.title} | ODIPA`; setState('ok') } })
        .catch(() => setState('error'))
    } else {
      fetch('/api/articles')
        .then(r => { if (!r.ok) throw new Error(); return r.json() })
        .then(d => { setList(d.articles || []); setState('ok') })
        .catch(() => setState('error'))
    }
  }, [slug])

  const header = (title: string, intro?: string) => (
    <div className="bg-navy">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-14">
        <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-4">
          <span className="block w-5 h-px bg-gold-light" />
          ODIPA Articles
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">{title}</h1>
        {intro && <p className="text-white/70 text-[15px] leading-relaxed max-w-xl">{intro}</p>}
      </div>
    </div>
  )

  if (slug && state === 'ok' && article) {
    return (
      <div className="bg-cream min-h-screen">
        {header(article.title)}
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
          <p className="font-mono text-[12px] text-slate-500">
            {article.author && <>By {article.author} · </>}{article.publishedAt && fmt(article.publishedAt)}
          </p>
          <article className="bg-white rounded-xl border border-slate-200 p-6 md:p-10">
            <ArticleBody blocks={article.blocks} />
            {article.sources.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200">
                <h2 className="font-display text-xl font-bold text-navy mb-3">Sources</h2>
                <ul className="list-disc pl-6 space-y-2 text-[15px] text-slate-700">
                  {article.sources.map((s, i) => (
                    <li key={i}><a href={s.href} target="_blank" rel="noopener noreferrer" className="text-navy underline decoration-gold underline-offset-2 hover:text-gold">{s.label}<span className="sr-only"> (opens in a new tab)</span></a></li>
                  ))}
                </ul>
              </div>
            )}
          </article>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <NewsletterSignup variant="inline" source="Article" />
          </div>
          <a href="/articles" className="inline-block text-[14px] text-navy underline decoration-gold underline-offset-2">All articles</a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      {header('Articles', 'Short, plain-language pieces on current privacy topics, written for people who are not privacy experts.')}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div role="status" aria-live="polite">
          {state === 'loading' && <p className="text-[14px] text-slate-500">Loading…</p>}
          {state === 'error' && <p className="text-[14px] text-slate-500">Articles could not be loaded right now. Please try again shortly.</p>}
          {state === 'missing' && <p className="text-[14px] text-slate-500">That article could not be found. It may have been moved or taken down. <a href="/articles" className="underline">See all articles</a>.</p>}
        </div>
        {state === 'ok' && !slug && list && list.length === 0 && (
          <p className="text-[14px] text-slate-500">The first article is on its way. Subscribe below and it will land in your inbox.</p>
        )}
        {state === 'ok' && !slug && (list || []).map(a => (
          <a key={a.slug} href={`/articles?a=${encodeURIComponent(a.slug)}`} className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-navy/40 transition-colors">
            <p className="font-mono text-[11px] text-slate-500 mb-2">{a.publishedAt && fmt(a.publishedAt)}{a.author && ` · ${a.author}`}</p>
            <h2 className="font-display text-xl font-bold text-navy mb-2">{a.title}</h2>
            <p className="text-[15px] text-slate-600 leading-relaxed">{a.summary}</p>
          </a>
        ))}
        {!slug && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <NewsletterSignup variant="inline" source="Articles" />
          </div>
        )}
      </div>
    </div>
  )
}
