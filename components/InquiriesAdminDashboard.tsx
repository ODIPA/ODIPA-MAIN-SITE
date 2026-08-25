'use client'

/**
 * ODIPA Inquiry Review Inbox
 * Lists stored contact inquiries with AI-proposed drafts. Nothing sends
 * without the Approve button. Flagged items get a personal reply instead.
 * Auth matches the newsletter dashboard: x-admin-key per request.
 */

import { useState } from 'react'

type Inquiry = {
  id: string
  topic: string
  name: string
  email: string
  organization: string
  message: string
  routedTo: string
  status: string
  receivedAt: number
  draftSubject: string
  draftBody: string
  draftReason: string
  draftedAt: number
}

const STATUS_STYLES: Record<string, string> = {
  'drafted':         'bg-gold/15 text-amber-800 border-amber-300',
  'needs-attention': 'bg-red-50 text-red-700 border-red-300',
  'acked':           'bg-slate-100 text-slate-600 border-slate-300',
}

export default function InquiriesAdminDashboard() {
  const [key, setKey] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<Inquiry[]>([])
  const [edits, setEdits] = useState<Record<string, { subject: string; body: string }>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/inquiries?status=acked,drafted,needs-attention', {
        headers: { 'x-admin-key': key.trim() },
      })
      if (res.status === 401) { setError('Invalid admin key'); setLoading(false); return }
      const data = await res.json()
      setItems(data.inquiries || [])
      setUnlocked(true)
    } catch { setError('Failed to load inquiries') }
    finally { setLoading(false) }
  }

  const runDrafting = async () => {
    setBusy('draft-run'); setNotice('')
    try {
      const res = await fetch('/api/inquiries-draft', {
        method: 'POST', headers: { 'x-admin-key': key.trim() },
      })
      const data = await res.json()
      if (res.ok) setNotice(`Drafting run complete. ${data.drafted} drafted, ${data.flagged} flagged, ${data.examined} examined.`)
      else setNotice(data.error || 'Drafting run failed')
      await load()
    } catch { setNotice('Drafting run failed') }
    finally { setBusy(null) }
  }

  const act = async (id: string, action: 'send' | 'dismiss') => {
    setBusy(id); setNotice('')
    try {
      const item = items.find(i => i.id === id)
      const edit = edits[id] || { subject: item?.draftSubject || '', body: item?.draftBody || '' }
      const res = await fetch('/api/inquiries-act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key.trim() },
        body: JSON.stringify(action === 'send' ? { id, action, ...edit } : { id, action }),
      })
      const data = await res.json()
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id))
        setNotice(action === 'send' ? `Reply sent to ${item?.email}` : 'Dismissed')
      } else setNotice(data.error || 'Action failed')
    } catch { setNotice('Action failed') }
    finally { setBusy(null) }
  }

  const fmtDate = (ms: number) => ms ? new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

  if (!unlocked) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm">
          <h1 className="font-bold text-lg text-navy mb-1">Inquiry Inbox</h1>
          <p className="text-slate-500 text-sm mb-4">Review and approve replies to contact inquiries.</p>
          <label htmlFor="adminKey" className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 block mb-1.5">Admin key</label>
          <input id="adminKey" type="password" value={key} onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3" />
          {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
          <button onClick={load} disabled={loading || !key.trim()}
            className="w-full bg-navy text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50">
            {loading ? 'Loading…' : 'Open inbox'}
          </button>
        </div>
      </div>
    )
  }

  const flagged = items.filter(i => i.status === 'needs-attention')
  const drafted = items.filter(i => i.status === 'drafted')
  const waiting = items.filter(i => i.status === 'acked')

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-xl text-white">Inquiry Inbox</h1>
            <p className="text-slate-300 text-sm">{drafted.length} awaiting approval · {flagged.length} flagged · {waiting.length} in grace period</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={runDrafting} disabled={busy === 'draft-run'}
              className="bg-gold text-navy rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
              {busy === 'draft-run' ? 'Drafting…' : 'Run drafting now'}
            </button>
            <button onClick={load} className="border border-white/30 text-white rounded-lg px-4 py-2 text-sm">Refresh</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {notice && <div className="mb-4 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy">{notice}</div>}

        {items.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
            Inbox zero. New inquiries appear here after the grace period.
          </div>
        )}

        <div className="space-y-4">
          {[...flagged, ...drafted, ...waiting].map(inq => {
            const edit = edits[inq.id] || { subject: inq.draftSubject, body: inq.draftBody }
            return (
              <div key={inq.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest border rounded px-2 py-0.5 ${STATUS_STYLES[inq.status] || STATUS_STYLES.acked}`}>
                    {inq.status === 'needs-attention' ? 'Needs personal reply' : inq.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{inq.topic}</span>
                  <span className="text-[11px] text-slate-400 ml-auto">{fmtDate(inq.receivedAt)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Original message */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy">{inq.name}
                      <span className="font-normal text-slate-500"> · {inq.email}</span></p>
                    {inq.organization && <p className="text-xs text-slate-500">{inq.organization}</p>}
                    <p className="text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap break-words">{inq.message}</p>
                  </div>

                  {/* Draft or flag */}
                  <div className="min-w-0">
                    {inq.status === 'needs-attention' ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-xs font-semibold text-red-700 mb-1">Flagged for a personal reply</p>
                        <p className="text-sm text-red-800">{inq.draftReason}</p>
                        <p className="text-xs text-slate-500 mt-3">Reply from your own inbox to {inq.email}, then dismiss this item.</p>
                      </div>
                    ) : inq.status === 'drafted' ? (
                      <div>
                        <input value={edit.subject}
                          onChange={e => setEdits(p => ({ ...p, [inq.id]: { ...edit, subject: e.target.value } }))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold mb-2" />
                        <textarea value={edit.body} rows={7}
                          onChange={e => setEdits(p => ({ ...p, [inq.id]: { ...edit, body: e.target.value } }))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm leading-relaxed" />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">In grace period. Run drafting to propose a reply now, or reply personally and dismiss.</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {inq.status === 'drafted' && (
                    <button onClick={() => act(inq.id, 'send')} disabled={busy === inq.id}
                      className="bg-navy text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
                      {busy === inq.id ? 'Sending…' : 'Approve & send'}
                    </button>
                  )}
                  <button onClick={() => act(inq.id, 'dismiss')} disabled={busy === inq.id}
                    className="border border-slate-300 text-slate-600 rounded-lg px-4 py-2 text-sm disabled:opacity-50">
                    Dismiss
                  </button>
                  <a href={`mailto:${inq.email}`} className="text-sm text-slate-500 underline underline-offset-2 ml-auto">Reply personally</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
