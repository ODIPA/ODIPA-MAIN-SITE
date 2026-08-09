'use client'

/**
 * ODIPA Newsletter Archive
 * Public page listing sent issues of the Privacy Monthly Digest, with a
 * signup form. Issues are fetched from the public archive endpoint and
 * contain only published content, never subscriber data.
 */

import { useEffect, useState } from 'react'
import NewsletterSignup from '@/components/NewsletterSignup'

type Issue = { subject: string; sentAt: string; html: string }

export default function NewsletterArchive() {
  const [issues, setIssues] = useState<Issue[] | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/newsletter-archive')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => setIssues(d.issues || []))
      .catch(() => { setError(true); setIssues([]) })
  }, [])

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-14">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-4">
            <span className="block w-5 h-px bg-gold-light" />
            Free, Always
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Privacy Monthly Digest
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-xl">
            Breach alerts, new privacy laws, practical tips, and free open source tools,
            researched monthly and written for people who are not privacy experts.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <NewsletterSignup variant="inline" source="Archive" />
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-navy mb-5">Past issues</h2>

          {issues === null && <p className="text-[14px] text-slate-400">Loading issues…</p>}
          {error && <p className="text-[14px] text-slate-400">The archive could not be loaded right now. Please try again shortly.</p>}
          {issues !== null && !error && issues.length === 0 && (
            <p className="text-[14px] text-slate-500">
              The first issue is on its way. Subscribe above and it will land in your inbox.
            </p>
          )}

          <div className="space-y-4">
            {(issues || []).map(issue => (
              <div key={issue.sentAt} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpen(open === issue.sentAt ? null : issue.sentAt)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-cream/50 transition-colors"
                >
                  <span className="font-semibold text-[15px] text-navy">{issue.subject}</span>
                  <span className="font-mono text-[11px] text-slate-400 flex-shrink-0">
                    {new Date(issue.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="ml-3 text-gold">{open === issue.sentAt ? '−' : '+'}</span>
                  </span>
                </button>
                {open === issue.sentAt && (
                  <div className="px-6 pb-6 border-t border-slate-100 pt-5"
                    dangerouslySetInnerHTML={{ __html: issue.html }} />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
