'use client'

/**
 * ODIPA Inquiry Pipeline (kanban)
 * Five sequential columns tracking each inquiry's lifecycle:
 *   Received (auto-ack sent) > Draft awaiting approval > Needs personal
 *   reply > Replied > Meeting scheduled
 * Cards are compact; clicking one opens a detail panel with the original
 * message, the editable AI draft, approve-and-send, dismiss, prep sheet
 * actions (volunteering only), and move controls. Drag a card between
 * columns for status moves; the same moves exist as buttons in the detail
 * panel since touch devices have no HTML5 drag. Nothing emails without the
 * explicit Approve & send. Auth matches the newsletter dashboard.
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
  prepSheetAt: number
}

const COLUMNS: { id: string; title: string; hint: string }[] = [
  { id: 'acked',           title: 'Received',        hint: 'Auto-ack sent, awaiting draft run' },
  { id: 'drafted',         title: 'Draft ready',     hint: 'AI draft awaiting your approval' },
  { id: 'needs-attention', title: 'Personal reply',  hint: 'Flagged, reply from your inbox' },
  { id: 'sent',            title: 'Replied',         hint: 'Reply sent or handled personally' },
  { id: 'meeting',         title: 'Meeting scheduled', hint: 'Call booked, prep sheet lives here' },
]

// Drag targets. 'drafted' is excluded, only the drafting run creates drafts.
const MOVE_TARGETS = new Set(['acked', 'needs-attention', 'sent', 'meeting'])

const COLUMN_ACCENT: Record<string, string> = {
  'acked':           'border-t-slate-300',
  'drafted':         'border-t-amber-400',
  'needs-attention': 'border-t-red-400',
  'sent':            'border-t-emerald-400',
  'meeting':         'border-t-navy',
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
  const [openId, setOpenId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const hdrs = () => ({ 'x-admin-key': key.trim() })

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/inquiries?status=acked,drafted,needs-attention,sent,meeting', { headers: hdrs() })
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
      const res = await fetch('/api/inquiries-draft', { method: 'POST', headers: hdrs() })
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
        headers: { 'Content-Type': 'application/json', ...hdrs() },
        body: JSON.stringify(action === 'send' ? { id, action, ...edit } : { id, action }),
      })
      const data = await res.json()
      if (res.ok) {
        if (action === 'send') {
          setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'sent' } : i))
          setNotice(`Reply sent to ${item?.email}`)
        } else {
          setItems(prev => prev.filter(i => i.id !== id))
          setNotice('Dismissed')
          setOpenId(null)
        }
      } else setNotice(data.error || 'Action failed')
    } catch { setNotice('Action failed') }
    finally { setBusy(null) }
  }

  const move = async (id: string, status: string) => {
    if (!MOVE_TARGETS.has(status)) return
    const item = items.find(i => i.id === id)
    if (!item || item.status === status) return
    setBusy(id); setNotice('')
    try {
      const res = await fetch('/api/inquiries-act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...hdrs() },
        body: JSON.stringify({ id, action: 'move', status }),
      })
      const data = await res.json()
      if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
      else setNotice(data.error || 'Move failed')
    } catch { setNotice('Move failed') }
    finally { setBusy(null) }
  }

  const viewPrep = async (id: string) => {
    setBusy(`prep-${id}`); setNotice('')
    try {
      const res = await fetch(`/api/inquiries-prep?id=${encodeURIComponent(id)}`, { headers: hdrs() })
      const data = await res.json()
      if (!res.ok) { setNotice(data.error || 'Could not load prep sheet'); return }
      const w = window.open('', '_blank')
      if (w) { w.document.write(data.html); w.document.close() }
      else setNotice('Popup blocked, allow popups for this site to view prep sheets')
    } catch { setNotice('Could not load prep sheet') }
    finally { setBusy(null) }
  }

  const generatePrep = async (id: string, regenerate = false) => {
    setBusy(`prep-${id}`); setNotice('')
    try {
      const res = await fetch('/api/inquiries-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...hdrs() },
        body: JSON.stringify({ id, regenerate }),
      })
      const data = await res.json()
      if (!res.ok) { setNotice(data.error || 'Prep sheet generation failed'); return }
      setItems(prev => prev.map(i => i.id === id ? { ...i, prepSheetAt: data.generatedAt || Date.now() } : i))
      await viewPrep(id)
    } catch { setNotice('Prep sheet generation failed') }
    finally { setBusy(null) }
  }

  const fmtDate = (ms: number) => ms ? new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''
  const ageDays = (ms: number) => Math.floor((Date.now() - ms) / 86400000)

  if (!unlocked) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-sm">
          <h1 className="font-bold text-lg text-navy mb-1">Inquiry Pipeline</h1>
          <p className="text-slate-500 text-sm mb-4">Track every inquiry from received to meeting scheduled.</p>
          <label htmlFor="adminKey" className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 block mb-1.5">Admin key</label>
          <input id="adminKey" type="password" value={key} onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3" />
          {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
          <button onClick={load} disabled={loading || !key.trim()}
            className="w-full bg-navy text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50">
            {loading ? 'Loading…' : 'Open pipeline'}
          </button>
        </div>
      </div>
    )
  }

  const byCol = (col: string) => items.filter(i => i.status === col)
  const open = openId ? items.find(i => i.id === openId) : null

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-xl text-white">Inquiry Pipeline</h1>
            <p className="text-slate-300 text-sm">
              {byCol('drafted').length} awaiting approval · {byCol('needs-attention').length} flagged · {byCol('acked').length} received · {byCol('meeting').length} meetings
            </p>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {notice && <div className="mb-4 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy">{notice}</div>}

        {/* Board */}
        <div className="flex gap-3 overflow-x-auto pb-4 items-start">
          {COLUMNS.map(col => {
            const cards = byCol(col.id)
            const droppable = dragId !== null && MOVE_TARGETS.has(col.id)
            return (
              <div key={col.id}
                onDragOver={e => { if (droppable) { e.preventDefault(); setDragOver(col.id) } }}
                onDragLeave={() => setDragOver(prev => prev === col.id ? null : prev)}
                onDrop={e => {
                  e.preventDefault(); setDragOver(null)
                  const id = e.dataTransfer.getData('text/plain') || dragId
                  if (id && MOVE_TARGETS.has(col.id)) move(id, col.id)
                  setDragId(null)
                }}
                className={`flex-shrink-0 w-64 bg-white/70 rounded-xl border border-slate-200 border-t-4 ${COLUMN_ACCENT[col.id]} ${dragOver === col.id ? 'ring-2 ring-gold' : ''}`}>
                <div className="px-3 pt-3 pb-2">
                  <p className="text-sm font-bold text-navy">{col.title}
                    <span className="ml-2 text-xs font-normal text-slate-400">{cards.length}</span></p>
                  <p className="text-[11px] text-slate-400 leading-tight">{col.hint}</p>
                </div>
                <div className="px-2 pb-2 space-y-2 min-h-[60px]">
                  {cards.map(inq => (
                    <div key={inq.id}
                      draggable
                      onDragStart={e => { setDragId(inq.id); e.dataTransfer.setData('text/plain', inq.id) }}
                      onDragEnd={() => { setDragId(null); setDragOver(null) }}
                      onClick={() => setOpenId(inq.id)}
                      className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:border-navy/40 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono text-slate-400">{inq.topic}</span>
                        {inq.topic === 'volunteer' && !!inq.prepSheetAt && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1">prep ✓</span>
                        )}
                        <span className="text-[10px] text-slate-400 ml-auto">{ageDays(inq.receivedAt)}d</span>
                      </div>
                      <p className="text-sm font-semibold text-navy truncate">{inq.name || inq.email}</p>
                      <p className="text-xs text-slate-500 leading-snug mt-0.5" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {inq.message}
                      </p>
                    </div>
                  ))}
                  {cards.length === 0 && <p className="text-[11px] text-slate-300 text-center py-4 select-none">empty</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      {open && (
        <div className="fixed inset-0 z-50 bg-navy/40 flex items-start justify-center overflow-y-auto p-4 pt-20"
          onClick={() => setOpenId(null)}>
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-3xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest border rounded px-2 py-0.5 bg-slate-100 text-slate-600 border-slate-300">
                {COLUMNS.find(c => c.id === open.status)?.title || open.status}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{open.topic}</span>
              <span className="text-[11px] text-slate-400">{fmtDate(open.receivedAt)}</span>
              <button onClick={() => setOpenId(null)} className="ml-auto text-slate-400 hover:text-navy text-lg leading-none px-1">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{open.name}
                  <span className="font-normal text-slate-500"> · {open.email}</span></p>
                {open.organization && <p className="text-xs text-slate-500">{open.organization}</p>}
                <p className="text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap break-words">{open.message}</p>
              </div>

              <div className="min-w-0">
                {open.status === 'needs-attention' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-red-700 mb-1">Flagged for a personal reply</p>
                    <p className="text-sm text-red-800">{open.draftReason}</p>
                    <p className="text-xs text-slate-500 mt-3">Reply from your own inbox to {open.email}, then drag to Replied or dismiss.</p>
                  </div>
                ) : open.status === 'drafted' ? (
                  <div>
                    <input value={(edits[open.id] || { subject: open.draftSubject, body: open.draftBody }).subject}
                      onChange={e => setEdits(p => ({ ...p, [open.id]: { ...(p[open.id] || { subject: open.draftSubject, body: open.draftBody }), subject: e.target.value } }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold mb-2" />
                    <textarea value={(edits[open.id] || { subject: open.draftSubject, body: open.draftBody }).body} rows={9}
                      onChange={e => setEdits(p => ({ ...p, [open.id]: { ...(p[open.id] || { subject: open.draftSubject, body: open.draftBody }), body: e.target.value } }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm leading-relaxed" />
                  </div>
                ) : open.status === 'acked' ? (
                  <p className="text-sm text-slate-400 italic">In grace period. Run drafting to propose a reply now, or reply personally and drag to Replied.</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    {open.status === 'sent' ? 'Replied. Drag to Meeting scheduled once a call is booked.' : 'Meeting scheduled. Generate or review the prep sheet below before the call.'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {open.status === 'drafted' && (
                <button onClick={() => act(open.id, 'send')} disabled={busy === open.id}
                  className="bg-navy text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
                  {busy === open.id ? 'Sending…' : 'Approve & send'}
                </button>
              )}
              {open.topic === 'volunteer' && (
                <button
                  onClick={() => open.prepSheetAt ? viewPrep(open.id) : generatePrep(open.id)}
                  disabled={busy === `prep-${open.id}`}
                  className="border border-navy/30 text-navy rounded-lg px-4 py-2 text-sm disabled:opacity-50">
                  {busy === `prep-${open.id}` ? 'Working…' : open.prepSheetAt ? 'View prep sheet' : 'Generate prep sheet'}
                </button>
              )}
              {open.topic === 'volunteer' && !!open.prepSheetAt && (
                <button onClick={() => generatePrep(open.id, true)} disabled={busy === `prep-${open.id}`}
                  className="text-xs text-slate-400 underline underline-offset-2 disabled:opacity-50">
                  regenerate
                </button>
              )}
              {open.status !== 'meeting' && (
                <button onClick={() => move(open.id, 'meeting')} disabled={busy === open.id}
                  className="border border-slate-300 text-slate-600 rounded-lg px-4 py-2 text-sm disabled:opacity-50">
                  Meeting scheduled
                </button>
              )}
              {(open.status === 'acked' || open.status === 'needs-attention') && (
                <button onClick={() => move(open.id, 'sent')} disabled={busy === open.id}
                  className="border border-slate-300 text-slate-600 rounded-lg px-4 py-2 text-sm disabled:opacity-50">
                  Handled personally
                </button>
              )}
              <button onClick={() => act(open.id, 'dismiss')} disabled={busy === open.id}
                className="border border-slate-300 text-slate-600 rounded-lg px-4 py-2 text-sm disabled:opacity-50">
                Dismiss
              </button>
              <a href={`mailto:${open.email}`} className="text-sm text-slate-500 underline underline-offset-2 ml-auto">Reply personally</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
