import { Link } from 'react-router-dom'
import CategoryBadge from './CategoryBadge'
import { GROUP_SIZE_LABELS, formatCost, formatEventDate } from '../utils/format'

function EventCard({ event }) {
  const isMatch = Boolean(event.matches_interests)

  return (
    <Link
      to={`/events/${event.id}`}
      className={`lm-event ${isMatch ? 'is-match' : ''}`}
      style={{ '--accent': event.category_color }}
    >
      <div className="lm-event__bar" aria-hidden="true" />      <div className="lm-event__body">
        <div className="lm-event__top">
          <CategoryBadge name={event.category_name} color={event.category_color} />
          {isMatch && <span className="lm-event__match">★ Matches your colors</span>}
        </div>
        <p className="lm-event__date">{formatEventDate(event.date)}</p>
        <h3 className="lm-event__title">{event.title}</h3>
        <p className="lm-event__meta">{event.location}</p>
        <div className="lm-event__footer">
          <span>{GROUP_SIZE_LABELS[event.group_size]}</span>
          <span>{formatCost(event.cost)}</span>
          {event.going_count !== undefined && <span>{event.going_count} going</span>}
        </div>
      </div>
    </Link>
  )
}

export default EventCard
