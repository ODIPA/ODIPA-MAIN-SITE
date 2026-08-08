'use client'

/**
 * ODIPA Newsletter Admin Dashboard
 * Renders aggregate subscriber statistics from /api/newsletter-stats.
 * The admin key is held in component memory only. It is never stored,
 * logged, or sent anywhere except as the request header to ODIPA's own API.
 * Aggregate counts only, consistent with ODIPA's no-tracking commitment.
 */

import { useState } from 'react'

type Stats = {
  generatedAt: string
  totals: { pending: number; confirmed: number; unsubscribed: number; allTimeSignups: number }
  rates: { confirmationRate: number; unsubscribeRate: number }
  last30Days: { signups: number; confirmed: number; unsubscribed: number }
  signupsByMonth: Record<string, number>
  confirmedByMonth: Record<string, number>
  sources: Record<string, number>
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 mb-1">{label}</div>
      <div className={`font-display text-3xl font-bold ${accent || 'text-navy'}`}>{value}</div>
    </div>
  )
}

function MonthBars({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([k]) => k !== 'unknown').slice(-12)
  const max = Math.max(1, ...entries.map(([, v]) => v))
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 mb-4">{title}</div>
      {entries.length === 0 ? (
        <p className="text-[13px] text-slate-400">No data yet.</p>
      ) : (
        <div className="flex items-end gap-2 h-32">
          {entries.map(([month, v]) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] font-mono text-slate-500">{v}</span>
              <div
                className="w-full bg-gold rounded-t"
                style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
                title={`${month}: ${v}`}
              />
              <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">{month.slice(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NewsletterAdminDashboard() {
  const [key, setKey] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'unauthorized'>('idle')
  const [subject, setSubject] = useState('')
  const [topics, setTopics] = useState('')
  const [notes, setNotes] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [testTo, setTestTo] = useState('')
  const [composerMsg, setComposerMsg] = useState('')
  const [busy, setBusy] = useState<'' | 'generate' | 'test' | 'send'>('')

  async function adminPost(path: string, payload: object) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key.trim() },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
    return data
  }

  async function generateDraft() {
    if (!topics.trim()) { setComposerMsg('Add at least one topic first.'); return }
    setBusy('generate'); setComposerMsg('')
    try {
      const d = await adminPost('/api/newsletter-generate', { topics, notes })
      setSubject(d.subject || '')
      setBodyHtml(d.html || '')
      setComposerMsg('Draft generated. Review and edit before sending, the AI only drafts, you decide.')
    } catch (e: any) { setComposerMsg(e.message) }
    setBusy('')
  }

  async function sendTest() {
    if (!subject.trim() || !bodyHtml.trim() || !testTo.trim()) { setComposerMsg('Subject, body, and a test address are required.'); return }
    setBusy('test'); setComposerMsg('')
    try {
      await adminPost('/api/newsletter-send', { subject, html: bodyHtml, testTo })
      setComposerMsg(`Test sent to ${testTo}. Check the inbox, then send to all.`)
    } catch (e: any) { setComposerMsg(e.message) }
    setBusy('')
  }

  async function sendAll() {
    if (!subject.trim() || !bodyHtml.trim()) { setComposerMsg('Subject and body are required.'); return }
    const n = stats?.totals.confirmed ?? 0
    if (!window.confirm(`Send this newsletter to ${n} confirmed subscriber${n === 1 ? '' : 's'}? This cannot be undone.`)) return
    setBusy('send'); setComposerMsg('')
    try {
      const d = await adminPost('/api/newsletter-send', { subject, html: bodyHtml })
      setComposerMsg(`Sent to ${d.sent} of ${d.total}. ${d.failed ? `${d.failed} failed.` : 'No failures.'}`)
    } catch (e: any) { setComposerMsg(e.message) }
    setBusy('')
  }

  async function load() {
    if (!key.trim()) return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter-stats', { headers: { 'x-admin-key': key.trim() } })
      if (res.status === 401) { setState('unauthorized'); setStats(null); return }
      if (!res.ok) throw new Error(String(res.status))
      setStats(await res.json())
      setState('idle')
    } catch {
      setState('error')
      setStats(null)
    }
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-10">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-3">
            <span className="block w-5 h-px bg-gold-light" />
            Admin · Aggregate Data Only
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Newsletter Dashboard</h1>
          <p className="text-white/60 text-[14px] mt-2 max-w-xl">
            Subscriber statistics for the ODIPA newsletter. No per-subscriber telemetry exists,
            these are aggregate counts read live from first-party storage.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

        {/* Key entry */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="adminKey" className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 block mb-1.5">
              Admin key
            </label>
            <input
              id="adminKey"
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') load() }}
              placeholder="Paste NEWSLETTER_ADMIN_KEY"
              autoComplete="off"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <button
            onClick={load}
            disabled={state === 'loading' || !key.trim()}
            className="font-mono text-[12px] font-semibold bg-gold text-navy px-5 py-2.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {state === 'loading' ? 'Loading…' : stats ? 'Refresh' : 'Load stats'}
          </button>
          <p className="w-full text-[11px] text-slate-400 mt-1">
            The key stays in this browser tab's memory only and is sent solely to ODIPA's own API.
          </p>
        </div>

        {state === 'unauthorized' && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            That key was not accepted. Check the NEWSLETTER_ADMIN_KEY value in the Static Web App settings.
          </p>
        )}
        {state === 'error' && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Could not load stats. Confirm the newsletter-stats function is deployed and try again.
          </p>
        )}

        {stats && (
          <>
            {/* Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Confirmed" value={stats.totals.confirmed} accent="text-green-700" />
              <StatCard label="Pending" value={stats.totals.pending} accent="text-amber-600" />
              <StatCard label="Unsubscribed" value={stats.totals.unsubscribed} accent="text-slate-500" />
              <StatCard label="All-time signups" value={stats.totals.allTimeSignups} />
            </div>

            {/* Rates + last 30 days */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Confirmation rate" value={`${stats.rates.confirmationRate}%`} />
              <StatCard label="Unsubscribe rate" value={`${stats.rates.unsubscribeRate}%`} />
              <StatCard label="Signups · 30 days" value={stats.last30Days.signups} />
              <StatCard label="Confirmed · 30 days" value={stats.last30Days.confirmed} />
            </div>

            {/* Monthly series */}
            <div className="grid md:grid-cols-2 gap-4">
              <MonthBars title="Signups by month" data={stats.signupsByMonth} />
              <MonthBars title="Confirmations by month" data={stats.confirmedByMonth} />
            </div>

            {/* Sources */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 mb-3">Signup sources</div>
              <div className="space-y-2">
                {Object.entries(stats.sources).sort((a, b) => b[1] - a[1]).map(([src, n]) => (
                  <div key={src} className="flex items-center gap-3">
                    <span className="text-[13px] text-navy w-32 truncate">{src}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-navy h-2 rounded-full"
                        style={{ width: `${(n / Math.max(1, stats.totals.allTimeSignups)) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-[12px] text-slate-500 w-8 text-right">{n}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="font-mono text-[10px] text-slate-400">
              Generated {new Date(stats.generatedAt).toLocaleString()}
            </p>
          </>
        )}

        {/* Composer, visible once a key is entered */}
        {key.trim() && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400">Compose &amp; Send</div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-slate-500 block mb-1">Topics for this issue</label>
                <textarea value={topics} onChange={e => setTopics(e.target.value)} rows={3}
                  placeholder="e.g. New tool listing policy, elm.chat community project, volunteer spotlight"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
              <div>
                <label className="text-[12px] text-slate-500 block mb-1">Facts and notes the draft may use</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Paste real facts, links, dates. The AI is instructed to invent nothing."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
            </div>

            <button onClick={generateDraft} disabled={busy !== ''}
              className="font-mono text-[12px] font-semibold border border-navy text-navy px-4 py-2 rounded-lg disabled:opacity-40 hover:bg-navy hover:text-white transition-colors">
              {busy === 'generate' ? 'Generating…' : 'Generate draft with AI'}
            </button>

            <div>
              <label className="text-[12px] text-slate-500 block mb-1">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="text-[12px] text-slate-500 block mb-1">Body HTML, edit freely, header and unsubscribe footer are added automatically</label>
              <textarea value={bodyHtml} onChange={e => setBodyHtml(e.target.value)} rows={10}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>

            {bodyHtml.trim() && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 mb-2">Preview</div>
                <div className="border border-slate-200 rounded-lg p-5 bg-cream/60"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              </div>
            )}

            <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[12px] text-slate-500 block mb-1">Send test to</label>
                <input value={testTo} onChange={e => setTestTo(e.target.value)} placeholder="you@example.org"
                  className="border border-slate-300 rounded-lg px-3 py-2 text-[13px] w-56 focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
              <button onClick={sendTest} disabled={busy !== ''}
                className="font-mono text-[12px] font-semibold border border-slate-300 text-navy px-4 py-2.5 rounded-lg disabled:opacity-40 hover:border-navy transition-colors">
                {busy === 'test' ? 'Sending…' : 'Send test'}
              </button>
              <button onClick={sendAll} disabled={busy !== '' || !stats}
                className="font-mono text-[12px] font-semibold bg-gold text-navy px-5 py-2.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity"
                title={!stats ? 'Load stats first so the send count is known' : ''}>
                {busy === 'send' ? 'Sending…' : `Send to ${stats?.totals.confirmed ?? '…'} confirmed`}
              </button>
            </div>

            {composerMsg && <p className="text-[13px] text-navy bg-gold/10 border border-gold/30 rounded-lg px-4 py-2.5">{composerMsg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
