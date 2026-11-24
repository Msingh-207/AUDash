async function post(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`)
  return response.json()
}

export const fetchSubjects = (semester) => post('/api/subjects', { semester })
export const fetchTimetable = (subjects) => post('/api/timetable', { subjects })

// Subject options for a semester: the section names found in the timetable,
// falling back to the plain subject names when the timetable has none.
export async function fetchSubjectOptions(semester) {
  const subjects = await fetchSubjects(semester)
  const baseNames = subjects.map((s) => s.subjectName)
  const timetable = await fetchTimetable(baseNames)
  const sectionNames = new Set(
    timetable.filter((e) => e.subject).map((e) => e.subject.trim())
  )
  return sectionNames.size > 0 ? [...sectionNames].sort() : baseNames.sort()
}
