import { Moon, SlidersHorizontal, Sun } from 'lucide-react'

export default function Navbar({ theme, onToggleTheme, filtersOpen, onToggleFilters }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="wordmark">
          <span className="wordmark-strong">AUD</span>
          <span className="wordmark-light">ash</span>
        </div>
        <div className="navbar-actions">
          <a
            className="icon-btn"
            href="https://www.instagram.com/van1sh.me"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <span className="insta-icon" aria-hidden="true" />
          </a>
          <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className={`icon-btn${filtersOpen ? ' is-active' : ''}`}
            onClick={onToggleFilters}
            aria-label="Toggle filters"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
