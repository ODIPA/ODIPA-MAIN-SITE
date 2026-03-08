'use client'

/**
 * ToolReviewStatus
 *
 * Fetches live counts from the ODIPA GitHub repo using the public Issues API.
 * No auth token required — the repo is public.
 *
 * GitHub label conventions expected in github.com/odipa/odipa-privacy-tools:
 *   tool-review      → tools under initial review
 *   security-audit   → tools in the security audit stage
 *   approved         → tools approved and live in the directory
 *
 * Falls back to the last known static counts if the API is unavailable.
 */

import { useEffect, useState } from 'react'

// ─── Config ─────────────────────────────────────────────────────────────────
const GITHUB_OWNER = 'odipa'
const GITHUB_REPO  = 'odipa-privacy-tools'   // The repo where tool submissions are tracked as Issues

// Fallback counts shown while loading or on API error
const FALLBACK = { review: 3, audit: 1, approved: 6 }

// ─── Types ───────────────────────────────────────────────────────────────────
interface Counts {
  review:   number
  audit:    number
  approved: number
}

type Status = 'loading' | 'live' | 'fallback' | 'error'

// ─── GitHub API helper ───────────────────────────────────────────────────────
async function fetchLabelCount(label: string): Promise<number> {
  // GitHub search API counts open issues with a given label
  const url = `https://api.github.com/search/issues?q=repo:${GITHUB_OWNER}/${GITHUB_REPO}+label:"${encodeURIComponent(label)}"+is:issue+is:open&per_page=1`
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
    // Cache for 5 minutes — GitHub rate limit is 10 unauthenticated requests/minute
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const data = await res.json()
  return data.total_count ?? 0
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ToolReviewStatus() {
  const [counts, setCounts]   = useState<Counts>(FALLBACK)
  const [status, setStatus]   = useState<Status>('loading')
  const [updated, setUpdated] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [review, audit, approved] = await Promise.all([
          fetchLabelCount('tool-review'),
          fetchLabelCount('security-audit'),
          fetchLabelCount('approved'),
        ])
        if (cancelled) return
        setCounts({ review, audit, approved })
        setStatus('live')
        setUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      } catch {
        if (cancelled) return
        // API unavailable — show fallback counts with a notice
        setStatus('fallback')
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const rows = [
    { label: 'Under review',    count: counts.review,   color: 'text-amber-400',  dot: 'bg-amber-400'  },
    { label: 'Security audit',  count: counts.audit,    color: 'text-blue-400',   dot: 'bg-blue-400'   },
    { label: 'Approved & live', count: counts.approved, color: 'text-green-400',  dot: 'bg-green-400'  },
  ]

  return (
    <div className="bg-navy rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[10px] text-gold-light uppercase tracking-[2px]">
          Tool Review Status
        </div>
        {/* Live / loading indicator */}
        {status === 'loading' && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
            <span className="font-mono text-[9px] text-white/30">fetching…</span>
          </div>
        )}
        {status === 'live' && (
          <div className="flex items-center gap-1.5" title={`Fetched at ${updated}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[9px] text-white/30">live</span>
          </div>
        )}
        {(status === 'fallback' || status === 'error') && (
          <div className="flex items-center gap-1.5" title="Showing last-known counts">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-mono text-[9px] text-white/30">cached</span>
          </div>
        )}
      </div>

      {/* Counts */}
      <div className="space-y-3">
        {rows.map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-white/50">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dot} ${status === 'loading' ? 'opacity-30' : ''}`} />
              {item.label}
            </div>
            <span className={`font-mono font-bold text-[13px] transition-all ${item.color} ${status === 'loading' ? 'opacity-30' : ''}`}>
              {status === 'loading' ? '—' : item.count}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
        <a
          href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-mono text-[10px] text-white/30 hover:text-white/60 transition-colors no-underline"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          View pipeline on GitHub
        </a>
        {status === 'fallback' && (
          <p className="font-mono text-[9px] text-amber-400/60 leading-relaxed">
            Live counts unavailable — showing cached data.
          </p>
        )}
        {status === 'live' && updated && (
          <p className="font-mono text-[9px] text-white/20">
            Updated {updated}
          </p>
        )}
      </div>
    </div>
  )
}
