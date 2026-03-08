interface SectionHeaderProps {
  eyebrow: string
  title: React.ReactNode
  body?: string
  light?: boolean
  center?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  body,
  light = false,
  center = false,
}: SectionHeaderProps) {
  return (
    <div className={center ? 'text-center' : ''}>
      <div
        className={`inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[3px] mb-4 ${
          center ? 'justify-center' : ''
        } ${light ? 'text-gold-light' : 'text-blue-brand'}`}
      >
        <span
          className={`block h-px w-6 ${light ? 'bg-gold-light' : 'bg-blue-brand'} ${
            center ? 'hidden' : ''
          }`}
        />
        {eyebrow}
      </div>
      <h2
        className={`font-display text-[clamp(32px,4vw,48px)] font-bold leading-[1.15] tracking-[-0.5px] mb-5 ${
          light ? 'text-white' : 'text-navy'
        }`}
      >
        {title}
      </h2>
      {body && (
        <p
          className={`text-[16px] leading-[1.8] max-w-[600px] ${
            center ? 'mx-auto' : ''
          } ${light ? 'text-white/60' : 'text-slate-500'}`}
        >
          {body}
        </p>
      )}
    </div>
  )
}
