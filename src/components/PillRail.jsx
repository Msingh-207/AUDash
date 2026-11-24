// A horizontally scrolling row of pill buttons where one is selected.
export default function PillRail({ label, items, value, onChange, fill = false }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className={`pill-rail${fill ? ' fill' : ''}`} role="radiogroup" aria-label={label}>
        {items.map((it) => (
          <button
            key={it.id}
            role="radio"
            aria-checked={it.id === value}
            className={`pill${it.id === value ? ' is-active' : ''}`}
            onClick={() => onChange(it.id)}
            title={it.title ?? it.name}
          >
            {it.short ? (
              <>
                <span className="only-mobile">{it.short}</span>
                <span className="only-desktop">{it.name}</span>
              </>
            ) : (
              it.name
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
