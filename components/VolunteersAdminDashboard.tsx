'use client'

/**
 * ODIPA Volunteers Admin Dashboard
 * The volunteer roster. A person is added automatically when they apply, and
 * moves to "Intro call scheduled" when their card is moved to meeting on the
 * inquiry board. Everything else is changed here. The admin key is held in
 * component memory only and sent solely to ODIPA's own API.
 */

import { useState } from 'react'

type Volunteer = {
  id: string; email: string; name: string; roles: string; hours: string; status: string
  appliedAt: string; statusUpdatedAt: string; notes: string; inquiryId: string; memberRequested: boolean
}
type Status = { value: string; label: string }

const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')
const TONE: Record<string, string> = {
  applied: 'bg-amber-100 text-amber-800', 'intro-call': 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800', paused: 'bg-slate-200 text-slate-700', alumni: 'bg-purple-100 text-purple-800',
}

export default function VolunteersAdminDashboard() {
  const [key, setKey] = useState('')
  const [rows, setRows] = useState<Volunteer[] | null>(null)
  const [statuses, setStatuses] = useState<Status[]>([])
  const [filter, setFilter] = useState('all')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function call(init?: { body: object }) {
    const res = await fetch('/api/volunteers', {
      method: init ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key.trim() },
      body: init ? JSON.stringify(init.body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error('That key was not accepted.')
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
    return data
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true); setMsg('')
    try { await fn() } catch (e) { setMsg((e as Error).message) } finally { setBusy(false) }
  }

  const load = () => run(async () => {
    const d = await call()
    setRows(d.volunteers); setStatuses(d.statuses); setNotes({})
  })

  const change = (v: Volunteer, body: object, done: string) => run(async () => {
    await call({ body: { id: v.id, ...body } })
    const d = await call()
    setRows(d.volunteers); setMsg(done)
  })

  const remove = (v: Volunteer) => {
    if (!window.confirm(`Remove ${v.name || v.email} from the volunteer roster? Their original inquiry is not deleted.`)) return
    run(async () => { await call({ body: { id: v.id, action: 'delete' } }); const d = await call(); setRows(d.volunteers); setMsg('Removed from the roster.') })
  }

  const counts = statuses.map(s => ({ ...s, n: (rows || []).filter(r => r.status === s.value).length }))
  const shown = (rows || []).filter(r => filter === 'all' || r.status === filter)
  const field = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-gold'

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-10">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-3">
            <span className="block w-5 h-px bg-gold-light" />
            Admin
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Volunteers Dashboard</h1>
          <p className="text-white/60 text-[14px] mt-2 max-w-xl">Everyone who has applied to volunteer, with a status and notes. People are added when they apply.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="adminKey" className="font-mono text-[10px] uppercase tracking-[2px] text-slate-500 block mb-1.5">Admin key</label>
            <input id="adminKey" type="password" value={key} onChange={e => setKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') load() }} placeholder="Paste NEWSLETTER_ADMIN_KEY" autoComplete="off" className={field} />
          </div>
          <button onClick={load} disabled={busy || !key.trim()}
            className="font-mono text-[12px] font-semibold bg-gold text-navy px-5 py-2.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity">
            {rows ? 'Refresh' : 'Load volunteers'}
          </button>
          <p className="w-full text-[11px] text-slate-500">The key stays in this browser tab's memory only and is sent solely to ODIPA's own API.</p>
        </div>

        {msg && <p role="status" className="text-[13px] bg-white border border-slate-200 rounded-lg px-4 py-3 text-navy">{msg}</p>}

        {rows && (
          <>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
              <button onClick={() => setFilter('all')} aria-pressed={filter === 'all'}
                className={`font-mono text-[12px] px-3 py-1.5 rounded-full border ${filter === 'all' ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-slate-300'}`}>All ({rows.length})</button>
              {counts.map(c => (
                <button key={c.value} onClick={() => setFilter(c.value)} aria-pressed={filter === c.value}
                  className={`font-mono text-[12px] px-3 py-1.5 rounded-full border ${filter === c.value ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-slate-300'}`}>{c.label} ({c.n})</button>
              ))}
            </div>

            {shown.length === 0 && <p className="text-[14px] text-slate-500">No volunteers in this view.</p>}

            <ul className="space-y-4">
              {shown.map(v => (
                <li key={v.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="font-display text-lg font-bold text-navy">{v.name || 'No name'}</h2>
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${TONE[v.status] || 'bg-slate-100 text-slate-700'}`}>
                      {statuses.find(s => s.value === v.status)?.label || v.status}
                    </span>
                    {v.memberRequested && <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-gold/20 text-navy">Asked to join as member</span>}
                    <span className="font-mono text-[11px] text-slate-500 ml-auto">applied {day(v.appliedAt)} · status changed {day(v.statusUpdatedAt)}</span>
                  </div>
                  <p className="text-[14px] text-slate-600"><a href={`mailto:${v.email}`} className="underline">{v.email}</a></p>
                  <p className="text-[14px] text-slate-600 mt-1">Roles: {v.roles || 'Not sure yet'} · Time: {v.hours || 'Not given'}</p>
                  <div className="grid md:grid-cols-[200px_1fr] gap-4 mt-4">
                    <div>
                      <label htmlFor={`st-${v.id}`} className="font-mono text-[10px] uppercase tracking-[2px] text-slate-500 block mb-1.5">Status</label>
                      <select id={`st-${v.id}`} value={v.status} disabled={busy} className={field}
                        onChange={e => change(v, { status: e.target.value }, 'Status updated.')}>
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`nt-${v.id}`} className="font-mono text-[10px] uppercase tracking-[2px] text-slate-500 block mb-1.5">Notes (kept private, 1,000 characters)</label>
                      <textarea id={`nt-${v.id}`} rows={2} maxLength={1000} className={field}
                        value={notes[v.id] ?? v.notes} onChange={e => setNotes(n => ({ ...n, [v.id]: e.target.value }))} />
                      <div className="flex gap-3 mt-2">
                        <button onClick={() => change(v, { notes: notes[v.id] ?? v.notes }, 'Note saved.')} disabled={busy || notes[v.id] === undefined || notes[v.id] === v.notes}
                          className="font-mono text-[12px] font-semibold bg-gold text-navy px-4 py-2 rounded-lg disabled:opacity-40">Save note</button>
                        <button onClick={() => remove(v)} disabled={busy}
                          className="font-mono text-[12px] font-semibold border border-red-300 text-red-700 px-4 py-2 rounded-lg disabled:opacity-40">Remove from roster</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
