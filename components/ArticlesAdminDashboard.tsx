'use client'

/**
 * ODIPA Articles Admin Dashboard
 * Draft, preview, publish and email ad hoc articles. The admin key is held in
 * component memory only and sent solely to ODIPA's own API. Nothing is public
 * until Publish, and nothing is emailed until a send button is pressed.
 */

import { useState } from 'react'
import ArticleBody, { Block } from '@/components/ArticleBody'
import { STARTER_ARTICLE } from '@/data/articles-starter'

type Row = {
  slug: string; title: string; summary: string; author: string; body: string; sources: string
  status: 'draft' | 'published'; updatedAt: string; publishedAt: string; emailedAt: string; emailedCount: number
}
type Preview = { blocks: Block[]; sources: { label: string; href: string }[]; problems: string[] }

const blank = { slug: '', title: '', summary: '', author: '', body: '', sources: '' }
const fmt = (iso: string) => (iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '')

export default function ArticlesAdminDashboard() {
  const [key, setKey] = useState('')
  const [rows, setRows] = useState<Row[] | null>(null)
  const [form, setForm] = useState(blank)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [testTo, setTestTo] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [posts, setPosts] = useState<{ linkedin: string; short: string; published: boolean } | null>(null)
  const [copied, setCopied] = useState('')

  const current = rows?.find(r => r.slug === form.slug) || null
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function call(path: string, init?: { method?: string; body?: object }) {
    const res = await fetch(path, {
      method: init?.method || 'GET',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key.trim() },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error('That key was not accepted.')
    if (!res.ok) throw new Error([data.error, ...(data.problems || [])].filter(Boolean).join(' '))
    return data
  }

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true); setMsg('')
    try { return await fn() } catch (e) { setMsg((e as Error).message || 'Something went wrong.') } finally { setBusy(false) }
  }

  const load = () => run(async () => {
    const d = await call('/api/articles?all=1')
    setRows(d.articles)
    return d.articles as Row[]
  })

  const open = (r: Row) => { setPosts(null); setForm({ slug: r.slug, title: r.title, summary: r.summary, author: r.author, body: r.body, sources: r.sources }); setPreview(null); setMsg('') }
  const startNew = () => { setForm(blank); setPreview(null); setPosts(null); setMsg('') }
  const startVoter = () => { setForm({ ...blank, ...STARTER_ARTICLE }); setPreview(null); setPosts(null); setMsg('Loaded the voter privacy article. Confirm the author, check every claim against the sources, then save a draft.') }

  const save = () => run(async () => {
    const d = await call('/api/articles', { method: 'POST', body: { action: 'save', ...form } })
    const list = await call('/api/articles?all=1')
    setRows(list.articles)
    setForm(f => ({ ...f, slug: d.slug }))
    setMsg(current?.status === 'published' ? 'Saved. The changes are live now.' : 'Saved as a draft. It is not public yet.')
  })

  const doPreview = () => run(async () => {
    const d = await call('/api/articles', { method: 'POST', body: { action: 'preview', ...form } })
    setPreview(d)
    setMsg(d.problems.length ? `Before this can be published: ${d.problems.join(' ')}` : 'Preview ready. It meets the publishing rules.')
  })

  const act = (action: 'publish' | 'unpublish' | 'delete') => run(async () => {
    if (action === 'delete' && !window.confirm('Delete this article for good? This cannot be undone.')) return
    if (action === 'publish') await call('/api/articles', { method: 'POST', body: { action: 'save', ...form } })
    await call('/api/articles', { method: 'POST', body: { action, slug: form.slug } })
    const list = await call('/api/articles?all=1')
    setRows(list.articles)
    if (action === 'delete') { setForm(blank); setPosts(null) }
    setMsg(action === 'publish' ? 'Published. It is now live at /articles.' : action === 'unpublish' ? 'Unpublished. It is a draft again.' : 'Deleted.')
  })

  const genPosts = () => run(async () => {
    setMsg('Drafting the posts from the saved article. This takes about 15 seconds.')
    const d = await call('/api/articles-social', { method: 'POST', body: { slug: form.slug } })
    setPosts({ linkedin: d.linkedin, short: d.short, published: d.published })
    setMsg(d.published ? 'Posts drafted. Read them, edit if needed, copy and post them yourself.' : 'Posts drafted, but the article is not published yet, so the link will not work until you publish it.')
  })

  const copy = async (which: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(which); setMsg(which === 'li' ? 'Copied the LinkedIn post.' : 'Copied the short post.'); setTimeout(() => setCopied(''), 1500) } catch { setMsg('Could not copy. Select the text and copy it by hand.') }
  }

  const sendTest = () => run(async () => {
    await call('/api/articles-send', { method: 'POST', body: { slug: form.slug, testTo } })
    setMsg(`Test sent to ${testTo}. Check the inbox, then email the subscribers.`)
  })

  const sendAll = () => run(async () => {
    const again = !!current?.emailedAt
    if (!window.confirm(`${again ? 'This article was already emailed. Send it AGAIN' : 'Email'} "${form.title}" to every confirmed subscriber? This cannot be undone.`)) return
    const d = await call('/api/articles-send', { method: 'POST', body: { slug: form.slug, resend: again } })
    const list = await call('/api/articles?all=1')
    setRows(list.articles)
    setMsg(`Sent to ${d.sent} of ${d.total} confirmed subscribers${d.failed ? `, ${d.failed} failed` : ''}.`)
  })

  const field = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-gold'
  const label = 'font-mono text-[10px] uppercase tracking-[2px] text-slate-500 block mb-1.5'
  const btn = 'font-mono text-[12px] font-semibold px-4 py-2.5 rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity'

  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-10">
          <div className="inline-flex items-center gap-2.5 font-mono text-[11px] text-gold-light uppercase tracking-[3px] mb-3">
            <span className="block w-5 h-px bg-gold-light" />
            Admin
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Articles Dashboard</h1>
          <p className="text-white/60 text-[14px] mt-2 max-w-xl">Draft, preview, publish and email ad hoc articles. Separate from the Monthly Digest and the Research Releases.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="adminKey" className={label}>Admin key</label>
            <input id="adminKey" type="password" value={key} onChange={e => setKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') load() }} placeholder="Paste NEWSLETTER_ADMIN_KEY" autoComplete="off" className={field} />
          </div>
          <button onClick={load} disabled={busy || !key.trim()} className={`${btn} bg-gold text-navy`}>{rows ? 'Refresh' : 'Load articles'}</button>
          <p className="w-full text-[11px] text-slate-500">The key stays in this browser tab's memory only and is sent solely to ODIPA's own API.</p>
        </div>

        {/* The message sits in a fixed bar so it is visible wherever the button that caused it is on the page. */}
        <div role="status" aria-live="polite">
          {msg && (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md z-50 text-[13px] bg-navy text-white border border-gold rounded-lg shadow-lg px-4 py-3 flex items-start gap-3">
              <span className="flex-1">{msg}</span>
              <button onClick={() => setMsg('')} className="font-mono text-[11px] underline flex-shrink-0">Dismiss</button>
            </div>
          )}
        </div>

        {rows && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="font-display text-xl font-bold text-navy mr-auto">Your articles</h2>
              <button onClick={startNew} className={`${btn} border border-navy text-navy`}>New article</button>
              <button onClick={startVoter} className={`${btn} border border-navy text-navy`}>Start from the voter privacy article</button>
            </div>
            {rows.length === 0 ? <p className="text-[14px] text-slate-500">No articles yet.</p> : (
              <ul className="divide-y divide-slate-100">
                {rows.map(r => (
                  <li key={r.slug} className="py-3 flex flex-wrap items-center gap-3">
                    <button onClick={() => open(r)} className="text-left text-[15px] font-semibold text-navy underline decoration-gold underline-offset-2">{r.title}</button>
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${r.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{r.status}</span>
                    {r.emailedAt && <span className="font-mono text-[11px] text-slate-500">emailed {fmt(r.emailedAt)} to {r.emailedCount}</span>}
                    <span className="font-mono text-[11px] text-slate-500 ml-auto">edited {fmt(r.updatedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {rows && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="font-display text-xl font-bold text-navy">{form.slug ? 'Edit article' : 'New article'}</h2>
            <div><label htmlFor="a-title" className={label}>Title</label><input id="a-title" value={form.title} onChange={set('title')} maxLength={160} className={field} /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label htmlFor="a-author" className={label}>Author (required to publish)</label><input id="a-author" value={form.author} onChange={set('author')} maxLength={120} className={field} /></div>
              <div><span className={label}>Web address</span><p className="text-[14px] text-slate-600 py-2">/articles?a={form.slug || '(set when you first save)'}</p></div>
            </div>
            <div><label htmlFor="a-summary" className={label}>Summary (shown in the list and the email, 1 to 2 sentences)</label><textarea id="a-summary" value={form.summary} onChange={set('summary')} rows={2} maxLength={400} className={field} /></div>
            <div>
              <label htmlFor="a-body" className={label}>Article text</label>
              <textarea id="a-body" value={form.body} onChange={set('body')} rows={18} className={`${field} font-mono text-[13px]`} />
              <p className="text-[11px] text-slate-500 mt-1">Start a heading with ##. Separate paragraphs with a blank line. Start lines with 1. or - for lists. Links: [text](https://...). Do not use em dashes.</p>
            </div>
            <div>
              <label htmlFor="a-sources" className={label}>Sources, one per line as: Label | https://link (at least one to publish)</label>
              <textarea id="a-sources" value={form.sources} onChange={set('sources')} rows={3} className={`${field} font-mono text-[13px]`} />
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={save} disabled={busy || !form.title.trim()} className={`${btn} bg-gold text-navy`}>Save draft</button>
              <button onClick={doPreview} disabled={busy || !form.title.trim()} className={`${btn} border border-navy text-navy`}>Preview</button>
              {form.slug && current?.status !== 'published' && <button onClick={() => act('publish')} disabled={busy} className={`${btn} bg-navy text-white`}>Save and publish</button>}
              {form.slug && current?.status === 'published' && <button onClick={() => act('unpublish')} disabled={busy} className={`${btn} border border-navy text-navy`}>Unpublish</button>}
              {form.slug && <button onClick={() => act('delete')} disabled={busy} className={`${btn} border border-red-300 text-red-700`}>Delete</button>}
            </div>

            {form.slug && (
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h3 className="font-semibold text-navy text-[15px]">Social media posts</h3>
                <p className="text-[13px] text-slate-600">Drafts a LinkedIn post and a short post for X, Bluesky and Mastodon from the saved article. Nothing is posted for you. Save your edits first.</p>
                <button onClick={genPosts} disabled={busy} className={`${btn} border border-navy text-navy`}>{posts ? 'Regenerate posts' : 'Generate social posts'}</button>
                {posts && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="p-li" className={label}>LinkedIn</label>
                        <button onClick={() => copy('li', posts.linkedin)} aria-label="Copy the LinkedIn post" className="font-mono text-[11px] text-navy underline">{copied === 'li' ? 'Copied' : 'Copy'}</button>
                      </div>
                      <textarea id="p-li" value={posts.linkedin} onChange={e => setPosts({ ...posts, linkedin: e.target.value })} rows={10} className={field} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="p-sh" className={label}>X, Bluesky, Mastodon</label>
                        <button onClick={() => copy('sh', posts.short)} aria-label="Copy the short post" className="font-mono text-[11px] text-navy underline">{copied === 'sh' ? 'Copied' : 'Copy'}</button>
                      </div>
                      <textarea id="p-sh" aria-describedby="p-sh-count" value={posts.short} onChange={e => setPosts({ ...posts, short: e.target.value })} rows={10} className={field} />
                      <p id="p-sh-count" className={`text-[11px] mt-1 ${posts.short.length > 280 ? 'text-red-600' : 'text-slate-500'}`}>{posts.short.length} characters{posts.short.length > 280 ? ', too long for X' : ''}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {form.slug && current?.status === 'published' && (
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h3 className="font-semibold text-navy text-[15px]">Email this article</h3>
                <p className="text-[13px] text-slate-600">Sends the title, summary and a link to confirmed subscribers, each with their own unsubscribe link. Not the full text. Save any edits first.</p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[240px]">
                    <label htmlFor="a-test" className={label}>Send test to</label>
                    <input id="a-test" type="email" value={testTo} onChange={e => setTestTo(e.target.value)} placeholder="you@example.com" className={field} />
                  </div>
                  <button onClick={sendTest} disabled={busy || !testTo.trim()} className={`${btn} border border-navy text-navy`}>Send test</button>
                  <button onClick={sendAll} disabled={busy} className={`${btn} bg-navy text-white`}>{busy ? 'Working…' : 'Email all confirmed subscribers'}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {preview && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[2px] text-slate-500 mb-4">Preview, as readers will see it</p>
            <h2 className="font-display text-3xl font-bold text-navy mb-2">{form.title}</h2>
            <p className="font-mono text-[12px] text-slate-500 mb-6">{form.author ? `By ${form.author}` : 'No author yet'}</p>
            <ArticleBody blocks={preview.blocks} />
            {preview.sources.length > 0 && (
              <ul className="list-disc pl-6 mt-8 space-y-1 text-[14px]">
                {preview.sources.map((s, i) => <li key={i}>{s.label}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
