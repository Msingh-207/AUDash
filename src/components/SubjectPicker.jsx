import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

// Searchable multi-select: picked subjects show as removable chips under the box.
export default function SubjectPicker({ options, selected, onChange, disabled, loading }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const close = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (name) =>
    onChange(selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name])

  const q = query.trim().toLowerCase()
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options

  let placeholder = 'Add subjects'
  if (disabled) placeholder = 'Pick a semester first'
  else if (loading) placeholder = 'Loading subjects…'

  return (
    <div className="field" ref={rootRef}>
      <div className="field-label">Subjects</div>
      <div className="combo">
        <button
          type="button"
          className={`combo-trigger${open ? ' is-open' : ''}`}
          disabled={disabled || loading}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="muted">
            {selected.length > 0 && !disabled ? `${selected.length} selected — add more` : placeholder}
          </span>
          <ChevronDown size={16} className="muted" />
        </button>

        {open && (
          <div className="combo-panel">
            <div className="combo-search">
              <Search size={16} className="muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects…"
              />
            </div>
            <ul className="combo-list" role="listbox" aria-multiselectable="true">
              {filtered.length === 0 && <li className="combo-empty">No subjects found</li>}
              {filtered.map((name) => {
                const active = selected.includes(name)
                return (
                  <li key={name}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className="combo-option"
                      onClick={() => toggle(name)}
                    >
                      <Check size={16} style={{ opacity: active ? 1 : 0 }} />
                      <span>{name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="chips">
          {selected.map((name) => (
            <span key={name} className="chip">
              {name}
              <button type="button" onClick={() => toggle(name)} aria-label={`Remove ${name}`}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
