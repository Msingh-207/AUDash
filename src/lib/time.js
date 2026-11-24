// Timetable times look like "9-11", "11-1", "1.30-3.30" or "1:30-3:30" (12-hour clock, no am/pm).
// Classes run roughly 8am–6pm, so any hour below 8 is treated as afternoon.
function toMinutes(part) {
  const [h, m = '0'] = part.trim().split(/[.:]/)
  let hour = parseInt(h, 10)
  if (hour < 8) hour += 12
  return hour * 60 + parseInt(m, 10)
}

export function parseRange(range) {
  const [start, end] = String(range).split('-')
  if (!start || !end) return null
  const s = toMinutes(start)
  const e = toMinutes(end)
  return Number.isNaN(s) || Number.isNaN(e) ? null : { start: s, end: e }
}

export function formatMinutes(total) {
  const h24 = Math.floor(total / 60)
  const m = total % 60
  const h12 = ((h24 + 11) % 12) + 1
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}

export function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes()
}
