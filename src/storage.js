// localStorage keys are unchanged from the old site, so returning users keep their data.
const KEYS = {
  semester: 'selectedSem',
  subjects: 'audSelectedSubjects',
  timetable: 'cachedTimetableData',
}

function read(key, parse = true) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return parse ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  } catch {
    // storage unavailable (private mode etc.) — the app still works without it
  }
}

export const loadSemester = () => {
  const sem = read(KEYS.semester, false)
  return sem ? parseInt(sem, 10) : null
}
export const saveSemester = (sem) => write(KEYS.semester, String(sem))
export const loadSubjects = () => read(KEYS.subjects) ?? []
export const saveSubjects = (subjects) => write(KEYS.subjects, subjects)
export const loadTimetable = () => read(KEYS.timetable) ?? []
export const saveTimetable = (timetable) => write(KEYS.timetable, timetable)

export const loadTheme = () => read('theme', false)
export const saveTheme = (theme) => write('theme', theme)
