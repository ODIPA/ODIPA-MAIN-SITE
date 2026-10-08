interface Props {
  value: string
  onChange: (value: string) => void
}

/**
 * Hidden spam trap. Real people never see or fill it. The field name is deliberately
 * not something autofill recognizes (no "website", "url", "email", "name", "phone"),
 * and the common password manager opt-out attributes are set, so a legitimate visitor
 * is very unlikely to fill it by accident.
 */
export default function TrapField({ value, onChange }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
    >
      <input
        type="text"
        name="odipa_ref_note"
        value={value}
        onChange={e => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
      />
    </div>
  )
}
