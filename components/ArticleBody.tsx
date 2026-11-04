/**
 * Renders an article from the parsed blocks the API returns. Plain React
 * elements only, so article text can never run as HTML.
 */

export type Part = { text: string; href?: string }
export type Block =
  | { t: 'h'; text: string }
  | { t: 'p'; parts: Part[] }
  | { t: 'ol' | 'ul'; items: Part[][] }

function Parts({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.href ? (
          <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className="text-navy underline decoration-gold underline-offset-2 hover:text-gold">
            {p.text}
          </a>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  )
}

export default function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[16px] leading-[1.8] text-slate-700">
      {blocks.map((b, i) => {
        if (b.t === 'h') return <h2 key={i} className="font-display text-2xl font-bold text-navy pt-4">{b.text}</h2>
        if (b.t === 'p') return <p key={i}><Parts parts={b.parts} /></p>
        const List = b.t === 'ol' ? 'ol' : 'ul'
        return (
          <List key={i} className={`${b.t === 'ol' ? 'list-decimal' : 'list-disc'} pl-6 space-y-3`}>
            {b.items.map((it, j) => <li key={j}><Parts parts={it} /></li>)}
          </List>
        )
      })}
    </div>
  )
}
