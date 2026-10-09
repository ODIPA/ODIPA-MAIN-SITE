'use client'

import { useEffect, useState } from 'react'

/**
 * Tool submissions waiting on ODIPA, shown on the inquiry page so there is one
 * place to look. Read-only. The source of truth is the public tracking repo:
 * every submission, whether it came through the form or was opened directly on
 * GitHub, is an issue in odipa/odipa-privacy-tools. The public status panel on the
 * site reads the same issues, so this list and the public counts always agree.
 *
 * Stage comes from the issue's labels. An issue with no stage label is a direct
 * submission nobody has triaged yet. "Waiting" is business days since the last
 * ODIPA activity, which is the last comment if there is one, else the open date.
 * Anything past the two business day acknowledgment window is flagged.
 */

const GITHUB_OWNER = 'odipa'
const GITHUB_REPO = 'odipa-privacy-tools'
const ACK_WINDOW_BUSINESS_DAYS = 2

type Issue = {
  number: number
  title: string
  html_url: string
  created_at: string
  updated_at: string
  comments: number
  user: { login: string }
  labels: { name: string }[]
  pull_request?: unknown
}

type Row = {
  number: number
  title: string
  url: string
  submitter: string
  openedAt: Date
  lastActivity: Date
  stage: string
  stageClass: string
  waitingDays: number
  overdue: boolean
}

const STAGES: { label: string; title: string; cls: string }[] = [
  { label: 'security-audit', title: 'Security audit', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  { label: 'tool-review',    title: 'Under review',   cls: 'text-amber-700 bg-amber-50 border-amber-300' },
  { label: 'needs-help',     title: 'Community project', cls: 'text-yellow-700 bg-yellow-50 border-yellow-300' },
]

/** Whole business days between two dates, Monday to Friday, ignoring holidays. */
export function businessDaysBetween(from: Date, to: Date): number {
  let days = 0
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  while (d < end) {
    d.setDate(d.getDate() + 1)
    const w = d.getDay()
    if (w !== 0 && w !== 6) days++
  }
  return days
}

export function toRow(issue: Issue, now = new Date()): Row {
  const names = issue.labels.map(l => l.name)
  const stage = STAGES.find(s => names.includes(s.label))
  const openedAt = new Date(issue.created_at)
  // A comment counts as ODIPA activity. updated_at also moves on label changes, which
  // is fine, since a label change is ODIPA acting on it too.
  const lastActivity = issue.comments > 0 ? new Date(issue.updated_at) : openedAt
  const waitingDays = businessDaysBetween(lastActivity, now)
  return {
    number: issue.number,
    title: issue.title.replace(/^\[Tool Submission\]\s*/i, '').replace(/^Tool submission:\s*/i, ''),
    url: issue.html_url,
    submitter: issue.user.login,
    openedAt,
    lastActivity,
    stage: stage ? stage.title : 'Not triaged',
    stageClass: stage ? stage.cls : 'text-red-700 bg-red-50 border-red-300',
    waitingDays,
    overdue: issue.comments === 0 && waitingDays > ACK_WINDOW_BUSINESS_DAYS,
  }
}

export default function ToolSubmissionsPanel() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open&per_page=50`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((issues: Issue[]) => {
        if (cancelled) return
        const list = issues.filter(i => !i.pull_request).map(i => toRow(i))
        list.sort((a, b) => Number(b.overdue) - Number(a.overdue) || b.waitingDays - a.waitingDays)
        setRows(list)
      })
      .catch(() => { if (!cancelled) setError('Could not reach GitHub. Open the tracker directly.') })
    return () => { cancelled = true }
  }, [])

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const overdueCount = rows ? rows.filter(r => r.overdue).length : 0

  return (
    <section className="max-w-7xl mx-auto px-4 pb-12">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-navy">Tool submissions</h2>
            <p className="text-slate-500 text-sm">
              {rows === null && !error ? 'Loading from the tracker' : rows ? `${rows.length} open${overdueCount ? ` · ${overdueCount} past the ${ACK_WINDOW_BUSINESS_DAYS} business day window` : ''}` : ''}
              {error ? error : ''}
            </p>
          </div>
          <a href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues`} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[11px] text-blue-brand underline hover:text-navy">
            Open the tracker
          </a>
        </div>

        {rows && rows.length === 0 && (
          <p className="text-sm text-slate-500">Nothing waiting. Every submission has a closed issue or none has arrived.</p>
        )}

        {rows && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-[1.5px] text-slate-400 border-b border-slate-100">
                  <th className="py-2 pr-4">Tool</th>
                  <th className="py-2 pr-4">Submitted by</th>
                  <th className="py-2 pr-4">Opened</th>
                  <th className="py-2 pr-4">Stage</th>
                  <th className="py-2 pr-4">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.number} className={`border-b border-slate-50 ${r.overdue ? 'bg-red-50/40' : ''}`}>
                    <td className="py-2.5 pr-4">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy hover:underline">
                        {r.title}
                      </a>
                      <span className="font-mono text-[10px] text-slate-400 ml-2">#{r.number}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">@{r.submitter}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{fmt(r.openedAt)}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`font-mono text-[10px] border rounded-full px-2 py-0.5 ${r.stageClass}`}>{r.stage}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={r.overdue ? 'text-red-700 font-semibold' : 'text-slate-600'}>
                        {r.waitingDays} business day{r.waitingDays === 1 ? '' : 's'}{r.overdue ? ', no reply yet' : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
          Read-only. Stage follows the issue labels (tool-review, security-audit, needs-help). An issue with no stage label was opened directly on GitHub and needs triage. To advance a tool, change its label on the issue. Closing an issue with the approved label is what moves it to Approved on the public status panel.
        </p>
      </div>
    </section>
  )
}
