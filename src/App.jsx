import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarX, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import PillRail from './components/PillRail.jsx'
import SubjectPicker from './components/SubjectPicker.jsx'
import Schedule, { ScheduleSkeleton } from './components/Schedule.jsx'
import Footer from './components/Footer.jsx'
import { fetchSubjectOptions, fetchTimetable } from './api.js'
import { nowMinutes, parseRange } from './lib/time.js'
import * as storage from './storage.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_ITEMS = DAYS.map((d) => ({ id: d, name: d, short: d.slice(0, 3) }))
const SEMESTER_ITEMS = [1, 3, 5, 7].map((n) => ({ id: n, name: `Sem ${n}`, title: `Semester ${n}` }))

const todayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' })
// No classes on Sunday, so open Monday's timetable instead.
const defaultDay = () => (DAYS.includes(todayName()) ? todayName() : 'Monday')

function initialTheme() {
  const saved = storage.loadTheme()
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Re-render at the start of each minute so the "Now" highlight moves with the clock.
// The timer stops while the tab is hidden, so a backgrounded tab does no work.
function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer
    const tick = () => {
      setNow(new Date())
      timer = setTimeout(tick, 60_000 - (Date.now() % 60_000))
    }
    const onVisibility = () => {
      clearTimeout(timer)
      if (!document.hidden) tick()
    }
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
  return now
}

const SUBJECT_CHANGE_DELAY = 400 // ms to wait for more subject picks before fetching

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [semester, setSemester] = useState(storage.loadSemester)
  const [subjectOptions, setSubjectOptions] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [selected, setSelected] = useState(storage.loadSubjects)
  const [timetable, setTimetable] = useState(storage.loadTimetable)
  const [timetableLoading, setTimetableLoading] = useState(false)
  const [day, setDay] = useState(defaultDay)
  const [slide, setSlide] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(() => storage.loadSubjects().length === 0)
  const now = useNow()
  const timetableRequest = useRef(0)
  const firstTimetableLoad = useRef(true)
  const optionsCache = useRef(new Map()) // semester -> subject names

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    storage.saveTheme(theme)
  }, [theme])

  // The subject list is only needed in the filters panel, so load it when the panel is
  // open (returning users start with it closed and skip these requests entirely).
  useEffect(() => {
    if (!semester || !filtersOpen) return
    const cached = optionsCache.current.get(semester)
    if (cached) {
      setSubjectOptions(cached)
      return
    }
    let cancelled = false
    setOptionsLoading(true)
    fetchSubjectOptions(semester)
      .then((opts) => {
        optionsCache.current.set(semester, opts)
        if (!cancelled) setSubjectOptions(opts)
      })
      .catch(console.error)
      .finally(() => !cancelled && setOptionsLoading(false))
    return () => { cancelled = true }
  }, [semester, filtersOpen])

  // Refetch the timetable when the chosen subjects change. Quick successive picks are
  // batched into one request; the first load (refreshing saved data) goes out at once.
  useEffect(() => {
    storage.saveSubjects(selected)
    const id = ++timetableRequest.current
    if (selected.length === 0) {
      setTimetable([])
      storage.saveTimetable([])
      setTimetableLoading(false)
      return
    }
    setTimetableLoading(true)
    const delay = firstTimetableLoad.current ? 0 : SUBJECT_CHANGE_DELAY
    firstTimetableLoad.current = false
    const timer = setTimeout(() => {
      fetchTimetable(selected)
        .then((data) => {
          if (id !== timetableRequest.current) return
          const json = JSON.stringify(data)
          // Skip the re-render when the refreshed data matches what's on screen.
          if (json !== JSON.stringify(storage.loadTimetable())) {
            setTimetable(data)
            storage.saveTimetable(json)
          }
        })
        .catch(console.error)
        .finally(() => id === timetableRequest.current && setTimetableLoading(false))
    }, delay)
    return () => clearTimeout(timer)
  }, [selected])

  function handleSemesterChange(sem) {
    if (sem === semester) return
    setSemester(sem)
    storage.saveSemester(sem)
    setSubjectOptions([])
    setSelected([])
  }

  // target: a day name, or +1 / -1 to step forward/back (wrapping around the week).
  const changeDay = useCallback((target) => {
    const from = DAYS.indexOf(day)
    const to = typeof target === 'number'
      ? (from + target + DAYS.length) % DAYS.length
      : DAYS.indexOf(target)
    if (to === from) return
    const forward = typeof target === 'number' ? target > 0 : to > from
    setSlide(forward ? 'slide-left' : 'slide-right')
    setDay(DAYS[to])
  }, [day])

  // Arrow keys change the day (unless the user is typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') changeDay(1)
      if (e.key === 'ArrowLeft') changeDay(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [changeDay])

  // Horizontal swipe on touch screens changes the day.
  const touchStart = useRef(null)
  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) changeDay(dx < 0 ? 1 : -1)
  }

  const classes = useMemo(
    () => timetable
      .filter((slot) => (slot.day || slot.dayName || '').toLowerCase().trim() === day.toLowerCase())
      .map((slot) => ({ ...slot, range: parseRange(slot.time) }))
      .sort((a, b) => (a.range?.start ?? 0) - (b.range?.start ?? 0) || a.subject.localeCompare(b.subject)),
    [timetable, day]
  )

  const isToday = day === todayName()
  let content
  if (selected.length === 0) {
    content = (
      <div className="empty">
        <p>{semester ? 'Add your subjects to see your classes.' : 'Pick your semester and subjects to see your classes.'}</p>
        {!filtersOpen && <button className="btn" onClick={() => setFiltersOpen(true)}>Open filters</button>}
      </div>
    )
  } else if (timetableLoading && timetable.length === 0) {
    content = <ScheduleSkeleton />
  } else if (classes.length === 0) {
    content = (
      <div className="empty">
        <CalendarX size={28} />
        <p>No classes on {day}.</p>
      </div>
    )
  } else {
    content = <Schedule classes={classes} now={nowMinutes(now)} isToday={isToday} />
  }

  return (
    <div className="app">
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((o) => !o)}
      />

      <main className="main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <section className={`filters${filtersOpen ? ' is-open' : ''}`} aria-hidden={!filtersOpen}>
          <div className="filters-inner">
            <div className="filters-card">
              <PillRail label="Semester" items={SEMESTER_ITEMS} value={semester} onChange={handleSemesterChange} />
              <SubjectPicker
                options={subjectOptions}
                selected={selected}
                onChange={setSelected}
                disabled={!semester}
                loading={optionsLoading}
              />
            </div>
          </div>
        </section>

        <PillRail label="Day" items={DAY_ITEMS} value={day} onChange={changeDay} fill />

        <div className="day-heading">
          <button className="icon-btn" onClick={() => changeDay(-1)} aria-label="Previous day"><ChevronLeft size={20} /></button>
          <h1>{day}</h1>
          {isToday && <span className="today-badge">Today</span>}
          <span className="spacer" />
          <button className="icon-btn" onClick={() => changeDay(1)} aria-label="Next day"><ChevronRight size={20} /></button>
        </div>

        <div key={day} className={`day-content ${slide}`}>{content}</div>

        {classes.length > 0 && (
          <p className="hint">
            <span className="only-mobile">Swipe left/right to change days</span>
            <span className="only-desktop">Use ← → arrow keys to change days</span>
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}
