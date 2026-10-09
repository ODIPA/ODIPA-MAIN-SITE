'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import toolsData from '@/api/_shared/tools.json'

// ─── Directory data ──────────────────────────────────────────────────────────
// Tools are defined in api/_shared/tools.json. This file only types and renders them.
type Tool = {
  id: string
  name: string
  tagline: string
  desc: string
  category: string
  author: string
  authorHandle: string
  lang: string
  platform: string[]
  license: string
  github: string
  docs: string
  stars: number
  featured: boolean
  approvedDate?: string
  tags: string[]
  // 'approved' tools passed the full review process. 'needs-help' tools are
  // community projects featured for contribution. They are experimental and
  // not reviewed, a project to help build, not a tool we recommend using yet.
  status?: 'approved' | 'needs-help'
  // For needs-help projects, where contributors should go (usually the issues page)
  contribute?: string
  // Who maintains the code. ODIPA's own tools show "ODIPA Built & Maintained".
  // Approved tools from outside authors show "ODIPA Reviewed & Approved" with the
  // review date, per the Tool Listing Policy. The code stays in the author's repo.
  maintainer?: 'odipa' | 'community'
  // Approval attaches to a specific version. The short commit that was reviewed.
  reviewedCommit?: string
  // Internal notes from the review, kept with the data. Not rendered.
  reviewNotes?: string
  // One plain sentence on what the review covered, shown under the badge when the
  // project is too large for a line-by-line read and the badge should not imply one.
  reviewScope?: string
}

// The tool list lives in api/_shared/tools.json, the single source of truth shared with
// the newsletter generator. Add a tool there after it clears review. See the file's comment.
const APPROVED_TOOLS: Tool[] = toolsData.approved as Tool[]
const COMMUNITY_PROJECTS: Tool[] = toolsData.communityProjects as Tool[]

const ALL_TOOLS: Tool[] = [...APPROVED_TOOLS, ...COMMUNITY_PROJECTS]

// Read by the review status panel as its fallback when GitHub is unreachable,
// so the "Approved & live" count can never drift from the directory itself.
export const APPROVED_TOOL_COUNT = APPROVED_TOOLS.length
export const COMMUNITY_PROJECT_COUNT = COMMUNITY_PROJECTS.length

const CATEGORIES = ['All', ...Array.from(new Set(ALL_TOOLS.map(t => t.category)))]
const LANGS = ['All Languages', ...Array.from(new Set(ALL_TOOLS.map(t => t.lang)))]

const LANG_COLORS: Record<string, string> = {
  Python:     'bg-blue-100 text-blue-700',
  JavaScript: 'bg-yellow-100 text-yellow-700',
  TypeScript: 'bg-sky-100 text-sky-700',
  Go:         'bg-cyan-100 text-cyan-700',
  Rust:       'bg-orange-100 text-orange-700',
}

function StarIcon({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-gold">
        <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
      </svg>
      {n >= 1000 ? `${(n/1000).toFixed(1)}k` : n}
    </span>
  )
}

function ToolCard({ tool, stars }: { tool: Tool; stars: number }) {
  return (
    <div className={`bg-white rounded-xl border-2 p-6 flex flex-col gap-4 hover:shadow-md transition-all group ${
      tool.featured ? 'border-gold/40 hover:border-gold' : 'border-slate-200 hover:border-blue-brand/30'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-[10px] text-blue-brand bg-blue-brand/8 border border-blue-brand/20 px-2 py-0.5 rounded-full">
              {tool.category}
            </span>
            {tool.featured && (
              <span className="font-mono text-[10px] text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                ✦ Featured
              </span>
            )}
            {tool.status === 'needs-help' && (
              <span className="font-mono text-[10px] text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                ⚑ Needs Help
              </span>
            )}
          </div>
          <h3 className="font-display text-[17px] font-bold text-navy leading-tight">{tool.name}</h3>
        </div>
        <span className={`font-mono text-[10px] font-semibold px-2 py-1 rounded flex-shrink-0 ${LANG_COLORS[tool.lang] || 'bg-slate-100 text-slate-600'}`}>
          {tool.lang}
        </span>
      </div>

      {/* Tagline + desc */}
      <div>
        <p className="text-[13px] font-semibold text-navy mb-1">{tool.tagline}</p>
        <p className="text-[13px] text-slate-500 leading-[1.75]">{tool.desc}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tool.tags.slice(0, 4).map(tag => (
          <span key={tag} className="font-mono text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center text-[10px] font-bold text-gold-light">
            {tool.author.charAt(0)}
          </div>
          <span className="text-[12px] text-slate-500">{tool.authorHandle}</span>
        </div>
        <div className="flex items-center gap-4">
          <StarIcon n={stars} />
          <div className="flex gap-2">
            <a href={tool.docs} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[10px] text-slate-400 hover:text-navy transition-colors no-underline" title="Documentation">
              Docs
            </a>
            <a href={tool.github} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[10px] text-slate-400 hover:text-navy transition-colors no-underline flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Status badge */}
      {tool.status === 'needs-help' ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-300 rounded-lg px-3 py-1.5">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 4a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 4zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
            Needs Help · Community Project · Not yet reviewed
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Experimental. A project to help build, not a tool we recommend using yet.
          </p>
          <a href={tool.contribute || tool.github} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg px-3 py-1.5 text-center no-underline transition-colors">
            Contribute on GitHub →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4.5-4.5z"/>
          </svg>
          {tool.maintainer === 'community'
            ? <>ODIPA Reviewed &amp; Approved · {tool.approvedDate}{tool.reviewedCommit ? ` · ${tool.reviewedCommit}` : ''}</>
            : <>ODIPA Built &amp; Maintained · {tool.approvedDate}</>}
        </div>
        {tool.reviewScope && (
          <p className="text-[11px] text-slate-500 leading-snug">{tool.reviewScope}</p>
        )}
        </div>
      )}
    </div>
  )
}

export default function CommunityTools() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [lang, setLang] = useState('All Languages')

  // Live GitHub stargazer counts, one API call for the whole org.
  // Static values in the tool list are the fallback if the API is
  // unavailable, so the display degrades to last known counts, never breaks.
  const [liveStars, setLiveStars] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    fetch('https://api.github.com/orgs/odipa/repos?per_page=100')
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((repos: { name: string; stargazers_count: number }[]) => {
        if (cancelled) return
        const map: Record<string, number> = {}
        for (const r of repos) map[r.name.toLowerCase()] = r.stargazers_count
        setLiveStars(map)
      })
      .catch(() => { /* keep static fallback counts */ })
    return () => { cancelled = true }
  }, [])

  // Repo name from the tool's github URL, used to look up live stars
  const repoName = (t: Tool) => t.github.split('/').pop()?.toLowerCase() ?? ''

  // Tools whose code lives outside the ODIPA org are not in the org listing above,
  // so each gets its own small request. Static counts remain the fallback.
  useEffect(() => {
    let cancelled = false
    const external = ALL_TOOLS.filter(t => !/github\.com\/odipa\//i.test(t.github))
    for (const t of external) {
      const path = t.github.replace(/^https?:\/\/github\.com\//i, '').replace(/\/+$/, '')
      fetch(`https://api.github.com/repos/${path}`)
        .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
        .then((repo: { stargazers_count: number }) => {
          if (cancelled) return
          setLiveStars(prev => ({ ...prev, [repoName(t)]: repo.stargazers_count }))
        })
        .catch(() => { /* keep static fallback count */ })
    }
    return () => { cancelled = true }
  }, [])

  const starsFor = (t: Tool) => liveStars[repoName(t)] ?? t.stars

  const filtered = useMemo(() => {
    return ALL_TOOLS.filter(t => {
      const q = search.toLowerCase()
      const matchSearch = !q || t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
      const matchCat  = category === 'All' || t.category === category
      const matchLang = lang === 'All Languages' || t.lang === lang
      return matchSearch && matchCat && matchLang
    }).sort((a, b) =>
      ((a.status === 'needs-help' ? 1 : 0) - (b.status === 'needs-help' ? 1 : 0)) ||
      ((b.featured ? 1 : 0) - (a.featured ? 1 : 0)) ||
      (starsFor(b) - starsFor(a))
    )
  }, [search, category, lang, liveStars])

  return (
    <section id="community-tools">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-blue-brand uppercase tracking-[3px] mb-2">
            <span className="block w-5 h-px bg-blue-brand" />Community Privacy Tools
          </div>
          <p className="text-[14px] text-slate-500 max-w-[480px]">
            {APPROVED_TOOLS.length} open-source tools built and maintained by ODIPA,
            plus community projects seeking contributors. Every listing status here
            follows our{' '}
            <Link href="/get-involved/tool-listing-policy" className="text-blue-brand underline">
              Tool Listing Policy
            </Link>.
          </p>
        </div>
        <Link href="#submit-tool"
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy font-bold text-[13px] px-5 py-2.5 rounded-lg transition-colors no-underline flex-shrink-0">
          <span>+</span> Submit a Tool
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
          </svg>
          <input
            type="text" placeholder="Search tools, tags, languages…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-navy placeholder-slate-400 focus:outline-none focus:border-blue-brand focus:ring-2 focus:ring-blue-brand/10 transition-all"
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-navy focus:outline-none focus:border-blue-brand transition-all cursor-pointer">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={lang} onChange={e => setLang(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-navy focus:outline-none focus:border-blue-brand transition-all cursor-pointer">
          {LANGS.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map(tool => <ToolCard key={tool.id} tool={tool} stars={starsFor(tool)} />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="text-[36px] mb-3">🔍</div>
          <h3 className="font-display text-[18px] font-bold text-navy mb-2">No tools match your search</h3>
          <p className="text-[13px] text-slate-500 mb-5">Try different keywords or browse all categories.</p>
          <button onClick={() => { setSearch(''); setCategory('All'); setLang('All Languages') }}
            className="font-mono text-[12px] text-blue-brand hover:text-navy transition-colors border border-slate-200 px-4 py-2 rounded-lg">
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}
