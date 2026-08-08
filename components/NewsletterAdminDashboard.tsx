'use client'

/**
 * ODIPA Newsletter Admin Dashboard
 * Stats plus the Monthly Digest composer. The admin key is held in component
 * memory only and sent solely to ODIPA's own API. AI drafts via server side
 * web search, a human reviews every item, and only the send buttons mail
 * anything. Aggregate counts only, no per subscriber telemetry.
 */

import { useState } from 'react'

type Item = { title: string; summary: string; url: string }
type Issue = { subject: string; sent: number; failed: number; sentAt: string }
type Stats = {
  generatedAt: string
  totals: { pending: number; confirmed: number; unsubscribed: number; allTimeSignups: number }
  rates: { confirmationRate: number; unsubscribeRate: number }
  last30Days: { signups: number; confirmed: number; unsubscribed: number }
  signupsByMonth: Record<string, number>
  confirmedByMonth: Record<string, number>
  sources: Record<string, number>
  issues?: Issue[]
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function assembleHtml(month: string, sections: { heading: string; items: Item[] }[]) {
  let html = `<p style="font-size:14px;color:#667">Your ${esc(month)} roundup of what happened in digital privacy and what to do about it.</p>`
  for (const sec of sections) {
    if (sec.items.length === 0) continue
    html += `<h2 style="color:#0B1F3A;font-size:19px;border-bottom:2px solid #B98A2E;padding-bottom:6px;margin-top:28px">${esc(sec.heading)}</h2>`
    for (const it of sec.items) {
      html += `<h3 style="color:#0B1F3A;font-size:15px;margin:16px 0 4px">${esc(it.title)}</h3>`
      html += `<p style="font-size:14px;line-height:1.7;color:#1C2536;margin:0">${esc(it.summary)}`
      if (it.url) html += ` <a href="${esc(it.url)}" style="color:#B98A2E">Source</a>`
      html += `</p>`
    }
  }
  return html
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
      {entries.length === 0 ? <p className="text-[13px] text-slate-400">No data yet.</p> : (
        <div className="flex items-end gap-2 h-32">
          {entries.map(([month, v]) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] font-mono text-slate-500">{v}</span>
              <div className="w-full bg-gold rounded-t" style={{ height: `${Math.max(4, (v / max) * 100)}%` }} title={`${month}: ${v}`} />
              <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">{month.slice(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionEditor({ heading, items, setItems, hint }: {
  heading: string; items: Item[]; setItems: (i: Item[]) => void; hint?: string
}) {
  const update = (idx: number, field: keyof Item, val: string) => {
    const next = items.slice(); next[idx] = { ...next[idx], [field]: val }; setItems(next)
  }
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-navy">{heading}</span>
        <button onClick={() => setItems([...items, { title: '', summary: '', url: '' }])}
          className="font-mono text-[11px] text-gold hover:underline">+ Add item</button>
      </div>
      {hint && items.length === 0 && <p className="text-[12px] text-slate-400 mb-2">{hint}</p>}
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="bg-cream/60 rounded-lg p-3 space-y-2">
            <div className="flex gap-2">
              <input value={it.title} onChange={e => update(idx, 'title', e.target.value)} placeholder="Title"
                className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-gold" />
              <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
                className="font-mono text-[11px] text-red-500 hover:underline flex-shrink-0">Remove</button>
            </div>
            <textarea value={it.summary} onChange={e => update(idx, 'summary', e.target.value)} rows={2} placeholder="Summary, two to three sentences"
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold" />
            <input value={it.url} onChange={e => update(idx, 'url', e.target.value)} placeholder="Source URL (optional)"
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-gold" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NewsletterAdminDashboard() {
  const [key, setKey] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'unauthorized'>('idle')

  const defaultMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const [month, setMonth] = useState(defaultMonth)
  const [extraNotes, setExtraNotes] = useState('')
  const [breaches, setBreaches] = useState<Item[]>([])
  const [laws, setLaws] = useState<Item[]>([])
  const [research, setResearch] = useState<Item[]>([])
  const [tips, setTips] = useState<Item[]>([])
  const [testTo, setTestTo] = useState('')
  const [composerMsg, setComposerMsg] = useState('')
  const [busy, setBusy] = useState<'' | 'generate' | 'test' | 'send'>('')

  const subject = `ODIPA Privacy Monthly Digest, ${month}`
  const sections = [
    { heading: 'Breach Alerts', items: breaches },
    { heading: 'New Privacy Laws', items: laws },
    { heading: 'ODIPA Research Releases', items: research },
    { heading: 'Practical Tips', items: tips },
  ]
  const bodyHtml = assembleHtml(month, sections)
  const hasContent = sections.some(s => s.items.length > 0)

  async function load() {
    if (!key.trim()) return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter-stats', { headers: { 'x-admin-key': key.trim() } })
      if (res.status === 401) { setState('unauthorized'); setStats(null); return }
      if (!res.ok) throw new Error(String(res.status))
      setStats(await res.json())
      setState('idle')
    } catch { setState('error'); setStats(null) }
  }

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
    setBusy('generate'); setComposerMsg('Researching real breaches, laws, and tips with web search. This can take up to a minute.')
    try {
      const d = await adminPost('/api/newsletter-generate', { month, extraNotes })
      setBreaches(d.breaches || []); setLaws(d.laws || []); setTips(d.tips || [])
      setComposerMsg('Draft researched. Verify every item and source link, add your Research Releases, then test and send. You are the editor, the AI only drafts.')
    } catch (e: any) { setComposerMsg(e.message) }
    setBusy('')
  }

  async function sendTest() {
    if (!hasContent || !testTo.trim()) { setComposerMsg('Add content and a test address first.'); return }
    setBusy('test'); setComposerMsg('')
    try {
      await adminPost('/api/newsletter-send', { subject, html: bodyHtml, testTo })
      setComposerMsg(`Test sent to ${testTo}. Check the inbox, then send to all.`)
    } catch (e: any) { setComposerMsg(e.message) }
    setBusy('')
  }

  async function sendAll() {
    if (!hasContent) { setComposerMsg('Add content first.'); return }
    const n = stats?.totals.confirmed ?? 0
    if (!window.confirm(`Send "${subject}" to ${n} confirmed subscriber${n === 1 ? '' : 's'}? This cannot be undone.`)) return
    setBusy('send'); setComposerMsg('')
    try {
      const d = await adminPost('/api/newsletter-send', { subject, html: bodyHtml })
      setComposerMsg(`Sent to ${d.sent} of ${d.total}. ${d.failed ? `${d.failed} failed.` : 'No failures.'}`)
      load()
    } catch (e: any) { setComposerMsg(e.message) }
    setBusy('')
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
            Subscriber statistics and the Monthly Digest composer. No per subscriber telemetry exists.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="adminKey" className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 block mb-1.5">Admin key</label>
            <input id="adminKey" type="password" value={key} onChange={e => setKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') load() }}
              placeholder="Paste NEWSLETTER_ADMIN_KEY" autoComplete="off"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <button onClick={load} disabled={state === 'loading' || !key.trim()}
            className="font-mono text-[12px] font-semibold bg-gold text-navy px-5 py-2.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity">
            {state === 'loading' ? 'Loading…' : stats ? 'Refresh' : 'Load stats'}
          </button>
          <p className="w-full text-[11px] text-slate-400 mt-1">The key stays in this browser tab's memory only and is sent solely to ODIPA's own API.</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Confirmed" value={stats.totals.confirmed} accent="text-green-700" />
              <StatCard label="Pending" value={stats.totals.pending} accent="text-amber-600" />
              <StatCard label="Unsubscribed" value={stats.totals.unsubscribed} accent="text-slate-500" />
              <StatCard label="All-time signups" value={stats.totals.allTimeSignups} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Confirmation rate" value={`${stats.rates.confirmationRate}%`} />
              <StatCard label="Unsubscribe rate" value={`${stats.rates.unsubscribeRate}%`} />
              <StatCard label="Signups · 30 days" value={stats.last30Days.signups} />
              <StatCard label="Confirmed · 30 days" value={stats.last30Days.confirmed} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <MonthBars title="Signups by month" data={stats.signupsByMonth} />
              <MonthBars title="Confirmations by month" data={stats.confirmedByMonth} />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 mb-3">Signup sources</div>
              <div className="space-y-2">
                {Object.entries(stats.sources).sort((a, b) => b[1] - a[1]).map(([src, n]) => (
                  <div key={src} className="flex items-center gap-3">
                    <span className="text-[13px] text-navy w-32 truncate">{src}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-navy h-2 rounded-full" style={{ width: `${(n / Math.max(1, stats.totals.allTimeSignups)) * 100}%` }} />
                    </div>
                    <span className="font-mono text-[12px] text-slate-500 w-8 text-right">{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {(stats.issues || []).length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 mb-3">Past issues</div>
                <div className="space-y-2">
                  {(stats.issues || []).map(issue => (
                    <div key={issue.sentAt} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
                      <span className="text-[13px] text-navy truncate">{issue.subject}</span>
                      <span className="font-mono text-[11px] text-slate-400 flex-shrink-0">
                        {new Date(issue.sentAt).toLocaleDateString()} · {issue.sent} sent{issue.failed ? ` · ${issue.failed} failed` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {key.trim() && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400">Compose Monthly Digest</div>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-[12px] text-slate-500 block mb-1">Issue month</label>
                <input value={month} onChange={e => setMonth(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-[13px] w-48 focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="text-[12px] text-slate-500 block mb-1">Editor notes for the AI (optional)</label>
                <input value={extraNotes} onChange={e => setExtraNotes(e.target.value)}
                  placeholder="e.g. include the new tool listing policy launch"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
              <button onClick={generateDraft} disabled={busy !== ''}
                className="font-mono text-[12px] font-semibold border border-navy text-navy px-4 py-2.5 rounded-lg disabled:opacity-40 hover:bg-navy hover:text-white transition-colors">
                {busy === 'generate' ? 'Researching…' : 'Research and draft with AI'}
              </button>
            </div>
            <p className="text-[12px] text-slate-400 -mt-1">
              Subject is fixed as "{subject}". The AI web searches for real items with sources and fills the first, second, and fourth sections. ODIPA Research Releases is yours to fill and is left out of the email when empty.
            </p>

            <SectionEditor heading="Breach Alerts" items={breaches} setItems={setBreaches} hint="Generated by AI research, or add manually." />
            <SectionEditor heading="New Privacy Laws" items={laws} setItems={setLaws} hint="Generated by AI research, or add manually." />
            <SectionEditor heading="ODIPA Research Releases" items={research} setItems={setResearch}
              hint="Manual only. Add real ODIPA releases when you have them. Empty means the section is omitted from the email." />
            <SectionEditor heading="Practical Tips" items={tips} setItems={setTips} hint="Generated by AI research, or add manually." />

            {hasContent && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 mb-2">Preview</div>
                <div className="border border-slate-200 rounded-lg p-5 bg-cream/60" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                <p className="text-[11px] text-slate-400 mt-2">The ODIPA logo header and the per recipient unsubscribe footer are added automatically on send.</p>
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
