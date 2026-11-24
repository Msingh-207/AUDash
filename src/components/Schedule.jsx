import { Clock, Hash, MapPin } from 'lucide-react'
import { formatMinutes } from '../lib/time.js'

function ClassCard({ item, active }) {
  const range = item.range
    ? `${formatMinutes(item.range.start)} – ${formatMinutes(item.range.end)}`
    : item.time
  return (
    <article className={`card${active ? ' is-now' : ''}`}>
      <div className="card-time">
        <Clock size={16} />
        <span>{range}</span>
        <span className="card-rule" />
        {active && <span className="now-badge">Now</span>}
      </div>
      <h2 className="card-title">{item.subject}</h2>
      <div className="card-divider" />
      <div className="badges">
        {item.courseCode && <span className="badge"><Hash size={16} /> {item.courseCode}</span>}
        <span className="badge"><MapPin size={16} /> {item.room || 'TBA'}</span>
      </div>
    </article>
  )
}

export default function Schedule({ classes, now, isToday }) {
  return (
    <ol className="timeline">
      {classes.map((item, i) => {
        const active = isToday && item.range && now >= item.range.start && now < item.range.end
        const prev = classes[i - 1]
        const showLabel = !prev || prev.time !== item.time
        return (
          <li key={`${item.time}-${item.subject}-${i}`} className={`timeline-row${active ? ' is-now' : ''}`}>
            <div className="timeline-rail">
              <span className="timeline-dot" />
              {showLabel && item.range && (
                <span className="timeline-label">{formatMinutes(item.range.start)}</span>
              )}
            </div>
            <ClassCard item={item} active={active} />
          </li>
        )
      })}
    </ol>
  )
}

export function ScheduleSkeleton() {
  return (
    <div className="timeline">
      {[0, 1, 2].map((i) => (
        <div key={i} className="timeline-row">
          <div className="timeline-rail"><span className="timeline-dot" /></div>
          <div className="card skeleton" />
        </div>
      ))}
    </div>
  )
}
