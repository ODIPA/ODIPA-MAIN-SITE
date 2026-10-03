'use client'

/**
 * ODIPA Subscribers and Members, look up a person and delete them.
 * Works on the same list as the newsletter. A person is a community member when their row is
 * flagged as one. Deleting removes the row for good and writes a log entry that holds no name
 * and no address. The admin key is held in component memory only and is sent solely to ODIPA's
 * own API.
 */

import { useState } from 'react'

type Person = {
  email: string
  name: string
  status: 'pending' | 'confirmed' | 'unsubscribed' | string
  source: string
  member: boolean
  memberSince: string
  memberTermsVersion: string
  memberTermsAcceptedAt: string
  createdAt: string
  confirmedAt: string
  unsubscribedAt: string
}
type Found = { results: Person[]; total: number; limit: number; mode: 'recent' | 'search' | 'exact'; scanCapped: boolean }
type Deletion = { deletedAt: string; reason: string; wasMember: boolean; statusAtDeletion: string; reference: string }

const REASONS: [string, string][] = [
  ['person-request', 'The person asked for their information to be deleted'],
  ['duplicate-or-test', 'Duplicate or test entry'],
  ['other', 'Other'],
]
const reasonLabel = (r: string) => REASONS.find(([k]) => k === r)?.[1] ?? r
const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '')

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-gold disabled:bg-slate-50'

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="font-mono text-[10px] uppercase tracking-[2px] text-slate-400 block mb-1.5">{children}</label>
}

function StatusChip({ status }: { status: string }) {
  const style = status === 'confirmed' ? 'text-green-700 border-green-300 bg-green-50'
    : status === 'unsubscribed' ? 'text-slate-500 border-slate-300 bg-slate-50'
    : 'text-amber-700 border-amber-300 bg-amber-50'
  return <span className={`font-mono text-[10px] uppercase tracking-wider border rounded px-2 py-0.5 ${style}`}>{status}</span>
}

export default function SubscriberAdminDashboard() {
  const [key, setKey] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [q, setQ] = useState('')
  const [membersOnly, setMembersOnly] = useState(false)
  const [found, setFound] = useState<Found | null>(null)
  const [deletions, setDeletions] = useState<Deletion[]>([])
  const [selected, setSelected] = useState<Person | null>(null)
  const [reason, setReason] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const headers = () => ({ 'Content-Type': 'application/json', 'x-admin-key': key.trim() })

  async function api(path: string, init?: RequestInit) {
    const res = await fetch(path, { ...init, headers: { ...headers(), ...(init?.headers || {}) } })
    const data = await res.json().catch(() => ({}))
    return { res, data }
  }

  async function runSearch(query: string, onlyMembers: boolean) {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (onlyMembers) params.set('members', '1')
    const { res, data } = await api(`/api/subscriber-lookup?${params.toString()}`)
    if (res.status === 401) { setMsg({ kind: 'error', text: 'That key was not accepted. Check NEWSLETTER_ADMIN_KEY in the Static Web App settings.' }); return false }
    if (!res.ok) { setMsg({ kind: 'error', text: data.error || 'The lookup failed. Confirm the subscriber-lookup function is deployed and try again.' }); return false }
    setFound(data)
    return true
  }

  async function loadDeletions() {
    const { res, data } = await api('/api/subscriber-lookup?view=deletions')
    if (res.ok) setDeletions(data.deletions || [])
  }

  async function unlock() {
    setBusy('unlock'); setMsg(null)
    const ok = await runSearch('', false)
    if (ok) { setUnlocked(true); await loadDeletions() }
    setBusy('')
  }

  async function search(e?: React.FormEvent) {
    e?.preventDefault()
    setBusy('search'); setMsg(null); setSelected(null)
    await runSearch(q, membersOnly)
    setBusy('')
  }

  function choose(p: Person) {
    setSelected(p); setReason(''); setConfirmText(''); setMsg(null)
  }

  async function remove() {
    if (!selected) return
    setBusy('delete'); setMsg(null)
    const { res, data } = await api('/api/subscriber-delete', {
      method: 'POST',
      body: JSON.stringify({ email: selected.email, confirmEmail: confirmText, reason }),
    })
    if (!res.ok) { setBusy(''); setMsg({ kind: 'error', text: data.error || 'The delete failed.' }); return }
    const gone = selected.email
    setSelected(null); setConfirmText(''); setReason('')
    setMsg({ kind: 'ok', text: `${gone} was deleted.${data.logged ? '' : ' The deletion log entry could not be written, so note this deletion yourself.'} Remember to delete any notification emails about this person in the info@odipa.org inbox.` })
    await runSearch(q, membersOnly)
    await loadDeletions()
    setBusy('')
  }

  const matches = selected && confirmText.trim().toLowerCase() === selected.email.toLowerCase()
  const modeNote = !found ? '' : found.mode === 'recent'
    ? `Showing the ${found.results.length} most recent sign ups${membersOnly ? ' who are members' : ''}.`
    : found.mode === 'exact' ? (found.total ? 'Exact match.' : 'No one has that exact address.')
    : `${found.total} match${found.total === 1 ? '' : 'es'}${found.total > found.results.length ? `, showing the first ${found.results.length}. Narrow the search to see others.` : '.'}`

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-8">
          <h1 className="font-bold text-xl text-white">Subscribers and Members</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Look up a person on the newsletter list, see whether they joined as a community member, and delete them when they ask. <a href="/admin" className="underline text-gold-light">Back to admin</a>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        {!unlocked && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-md">
            <Label htmlFor="adminKey">Admin key</Label>
            <input id="adminKey" type="password" value={key} onChange={e => setKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && key.trim()) unlock() }}
              placeholder="Paste NEWSLETTER_ADMIN_KEY" autoComplete="off" className={inputCls} />
            <button type="button" onClick={unlock} disabled={!key.trim() || busy === 'unlock'}
              className="mt-3 font-mono text-[12px] font-semibold bg-gold text-navy px-5 py-2.5 rounded-lg disabled:opacity-40">
              {busy === 'unlock' ? 'Opening' : 'Open'}
            </button>
            <p className="text-[11px] text-slate-400 mt-2">The key stays in this browser tab's memory only and is sent solely to ODIPA's own API.</p>
          </div>
        )}

        {msg && (
          <p role={msg.kind === 'error' ? 'alert' : 'status'}
            className={`text-[13px] rounded-lg px-4 py-3 border ${msg.kind === 'error' ? 'text-red-700 bg-red-50 border-red-200' : 'text-green-800 bg-green-50 border-green-200'}`}>
            {msg.text}
          </p>
        )}

        {unlocked && (
          <>
            <form onSubmit={search} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[240px]">
                  <Label htmlFor="q">Email address or name</Label>
                  <input id="q" type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="jane@example.com, or part of an address or name"
                    autoComplete="off" className={inputCls} />
                </div>
                <button type="submit" disabled={busy === 'search'}
                  className="font-mono text-[12px] font-semibold bg-gold text-navy px-5 py-2.5 rounded-lg disabled:opacity-40">
                  {busy === 'search' ? 'Searching' : 'Search'}
                </button>
              </div>
              <label className="flex items-center gap-2 mt-3 text-[13px] text-slate-600 cursor-pointer">
                <input type="checkbox" checked={membersOnly} onChange={e => setMembersOnly(e.target.checked)} className="h-4 w-4 accent-[#0B1F3A]" />
                Community members only
              </label>
              <p className="text-[12px] text-slate-400 mt-2">{modeNote} Leave the box empty to browse recent sign ups.</p>
            </form>

            <div className="space-y-3">
              {found && found.results.length === 0 && <p className="text-[13px] text-slate-500">No one found.</p>}
              {found?.results.map(p => (
                <div key={p.email} className={`bg-white rounded-xl border p-4 ${selected?.email === p.email ? 'border-navy' : 'border-slate-200'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy text-[15px] break-all">{p.email}</span>
                    <StatusChip status={p.status} />
                    {p.member && <span className="font-mono text-[10px] uppercase tracking-wider border rounded px-2 py-0.5 text-navy border-navy/30 bg-navy/5">Member</span>}
                    <button type="button" onClick={() => choose(p)} className="ml-auto font-mono text-[11px] text-gold hover:underline">
                      {selected?.email === p.email ? 'Selected' : 'Select to delete'}
                    </button>
                  </div>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-3 text-[12px] text-slate-500">
                    <div><dt className="font-mono text-[9px] uppercase tracking-[1.5px] text-slate-400">Name</dt><dd>{p.name || 'Not given'}</dd></div>
                    <div><dt className="font-mono text-[9px] uppercase tracking-[1.5px] text-slate-400">Source</dt><dd>{p.source || 'Unknown'}</dd></div>
                    <div><dt className="font-mono text-[9px] uppercase tracking-[1.5px] text-slate-400">Signed up</dt><dd>{day(p.createdAt) || 'Unknown'}</dd></div>
                    <div><dt className="font-mono text-[9px] uppercase tracking-[1.5px] text-slate-400">{p.status === 'unsubscribed' ? 'Unsubscribed' : 'Confirmed'}</dt><dd>{day(p.status === 'unsubscribed' ? p.unsubscribedAt : p.confirmedAt) || 'Not yet'}</dd></div>
                    {p.member && (
                      <>
                        <div><dt className="font-mono text-[9px] uppercase tracking-[1.5px] text-slate-400">Joined as member</dt><dd>{day(p.memberSince) || 'Unknown'}</dd></div>
                        <div><dt className="font-mono text-[9px] uppercase tracking-[1.5px] text-slate-400">Terms accepted</dt><dd>{p.memberTermsVersion || 'Unknown'}{p.memberTermsAcceptedAt ? `, ${day(p.memberTermsAcceptedAt)}` : ''}</dd></div>
                      </>
                    )}
                  </dl>
                </div>
              ))}
            </div>

            {selected && (
              <section aria-labelledby="delete-heading" className="bg-white rounded-xl border-2 border-red-200 p-5">
                <h2 id="delete-heading" className="font-display text-[20px] font-bold text-navy mb-1">Delete {selected.email}</h2>
                <ul className="text-[13px] text-slate-600 leading-relaxed list-disc pl-5 space-y-1.5 my-3">
                  <li>This removes the person's record for good. It cannot be undone.</li>
                  <li>It does not delete the sign up notification emails in the info@odipa.org inbox, or any emails you sent them. Delete those yourself when you honor a deletion request.</li>
                  {selected.status === 'unsubscribed' && <li>This person unsubscribed. Deleting also removes the record of their opt-out. They will only receive email again if they sign up again.</li>}
                  {reason === 'person-request' && <li>The Community Member Terms promise deletion within 30 days of a request.</li>}
                </ul>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <select id="reason" value={reason} onChange={e => setReason(e.target.value)} className={inputCls}>
                      <option value="">Choose a reason</option>
                      {REASONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="confirm">Type the email address to confirm</Label>
                    <input id="confirm" type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
                      placeholder={selected.email} autoComplete="off" className={inputCls} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button type="button" onClick={remove} disabled={!matches || !reason || busy === 'delete'}
                    className="bg-red-700 text-white font-semibold text-[13px] px-5 py-2.5 rounded-lg disabled:opacity-40">
                    {busy === 'delete' ? 'Deleting' : 'Delete permanently'}
                  </button>
                  <button type="button" onClick={() => setSelected(null)} className="font-mono text-[12px] text-slate-500 hover:underline">Cancel</button>
                </div>
              </section>
            )}

            <section className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-display text-[18px] font-bold text-navy mb-1">Deletion log</h2>
              <p className="text-[12px] text-slate-400 mb-3">Shows when and why a record was deleted. It holds no names or email addresses. The reference is the first characters of a hash, so you can show a deletion was honored without keeping the address.</p>
              {deletions.length === 0 ? <p className="text-[13px] text-slate-500">No deletions yet.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] text-left">
                    <thead><tr className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-1.5 pr-4">Deleted</th><th className="pr-4">Reason</th><th className="pr-4">Member</th><th className="pr-4">Status then</th><th>Reference</th>
                    </tr></thead>
                    <tbody>
                      {deletions.map((d, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="py-2 pr-4 whitespace-nowrap">{day(d.deletedAt)}</td>
                          <td className="pr-4">{reasonLabel(d.reason)}</td>
                          <td className="pr-4">{d.wasMember ? 'Yes' : 'No'}</td>
                          <td className="pr-4">{d.statusAtDeletion}</td>
                          <td className="font-mono text-[12px]">{d.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
