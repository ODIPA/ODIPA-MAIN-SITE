import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

/**
 * ODIPA Admin landing page. One place that lists every admin tool so none
 * of the URLs need remembering. Each tool still enforces its own admin-key
 * gate, this page is links only and holds no data.
 *
 * When a new admin tool ships, add a card here in the same commit.
 */

const TOOLS = [
  {
    href: '/admin/inquiries',
    name: 'Inquiry Pipeline',
    desc: 'Kanban board for contact inquiries, from received through meeting scheduled. AI reply drafts await approval here, volunteer prep sheets generate from the cards, and nothing emails without an explicit approve.',
    tag: 'Daily',
  },
  {
    href: '/admin/newsletter',
    name: 'Newsletter Dashboard',
    desc: 'Compose, schedule, and send the newsletter. Subscriber stats, archive, and the monthly generator live here.',
    tag: 'Monthly',
  },
]

export default function AdminLandingPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-navy">
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-8">
          <h1 className="font-bold text-xl text-white">ODIPA Admin</h1>
          <p className="text-slate-300 text-sm">Every internal tool in one place. Each tool asks for the admin key itself.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOOLS.map(t => (
            <Link key={t.href} href={t.href}
              className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-navy/40 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-bold text-navy">{t.name}</h2>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 ml-auto">{t.tag}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Bookmark this page. New admin tools get a card here when they ship.
        </p>
      </div>
    </div>
  )
}
