import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EventsAPI from '../services/EventsAPI'
import CategoryBadge from '../components/CategoryBadge'
import RsvpModal from '../components/RsvpModal'
import { EmptyState, ErrorMessage, Loading } from '../components/StatusMessage'
import { useCurrentUser } from '../context/useCurrentUser'
import { GROUP_SIZE_LABELS, RSVP_LABELS, formatCost, formatEventDate, isPast } from '../utils/format'
import './CreateEvent.css' // breadcrumb styles
import './EventDetails.css'

function AttendeeList({ title, people, currentUserId }) {
  return (
    <div className="ed-list">
      <h3>
        {title} <span className="ed-list__count">{people.length}</span>
      </h3>
      {people.length ? (
        <ul>
          {people.map((p) => (
            <li key={p.id}>
              {p.name}
              {p.id === currentUserId && <span className="ed-list__you"> (you)</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="ed-list__empty">No one yet</p>
      )}
    </div>
  )
}

// /events/:eventId — full details, who's going, and the RSVP pop-up
function EventDetails() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user, userId, setUserId, refresh } = useCurrentUser()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [showRsvp, setShowRsvp] = useState(false)
  const [notice, setNotice] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let ignore = false
    EventsAPI.getById(eventId)
      .then((row) => {
        if (ignore) return
        setEvent(row)
        setError(null)
      })
      .catch((err) => !ignore && setError(err))
    return () => {
      ignore = true
    }
  }, [eventId, reloadKey])

  if (error?.status === 404 || error?.status === 400) {
    return (
      <main className="lm-page">
        <EmptyState title="Event not found">
          <p>It may have been cancelled.</p>
          <Link to="/" className="lm-btn">
            Browse events
          </Link>
        </EmptyState>
      </main>
    )
  }
  if (error) {
    return (
      <main className="lm-page">
        <ErrorMessage message={error.message} onRetry={() => setReloadKey((k) => k + 1)} />
      </main>
    )
  }
  if (!event) {
    return (
      <main className="lm-page">
        <Loading label="Loading event…" />
      </main>
    )
  }

  const isOrganizer = userId === event.organizer_id
  const past = isPast(event.date)
  const myStatus = Object.keys(event.attendees).find((status) =>
    event.attendees[status].some((p) => p.id === userId)
  )

  const handleRsvpSaved = (rsvp) => {
    setShowRsvp(false)
    setNotice(`Your RSVP is saved: ${RSVP_LABELS[rsvp.status]}.`)
    setReloadKey((k) => k + 1)
    // Remember who just RSVP'd so the rest of the app is personalized for them
    if (!userId) setUserId(rsvp.attendee_id)
    else refresh()
  }

  const handleDelete = async () => {
    if (!window.confirm(`Cancel "${event.title}"? This deletes the event and all of its RSVPs.`)) return
    setDeleting(true)
    try {
      await EventsAPI.remove(event.id)
      refresh()
      navigate('/')
    } catch (err) {
      setNotice('')
      setError(err)
      setDeleting(false)
    }
  }

  return (
    <main className="lm-page ed" style={{ '--accent': event.category_color }}>
      <nav className="ce__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Events</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{event.title}</span>
      </nav>

      <div className="ed-hero">
        <div className="ed-hero__bar" aria-hidden="true" />        <div className="ed-hero__body">
          <CategoryBadge name={event.category_name} color={event.category_color} />
          <h1>{event.title}</h1>
          <p className="ed-hero__date">{formatEventDate(event.date)}</p>
          <p className="ed-hero__organizer">Hosted by {event.organizer_name}</p>

          <div className="ed-hero__actions">
            {past ? (
              <span className="ed-pill">This event has ended</span>
            ) : (
              <button type="button" className="lm-btn" onClick={() => setShowRsvp(true)}>
                {myStatus ? `Change RSVP (${RSVP_LABELS[myStatus]})` : 'RSVP'}
              </button>
            )}
            {event.ticket_url && !past && (
              <a className="lm-btn lm-btn--secondary" href={event.ticket_url} target="_blank" rel="noreferrer">
                Get tickets ↗
              </a>
            )}
            {isOrganizer && (
              <>
                <Link to={`/events/${event.id}/edit`} className="lm-btn lm-btn--secondary">
                  Edit event
                </Link>
                <button type="button" className="lm-btn lm-btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Cancelling…' : 'Cancel event'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="ed-notice" aria-live="polite">
        {notice && <span className="lm-alert lm-alert--success">{notice}</span>}
      </p>

      <div className="ed-layout">
        <section>
          <h2>About this event</h2>
          <p className="ed-description">{event.description || 'No description yet.'}</p>
        </section>

        <aside className="ed-facts">
          <dl>
            <div>
              <dt>Where</dt>
              <dd>{event.location}</dd>
            </div>
            <div>
              <dt>Group size</dt>
              <dd>{GROUP_SIZE_LABELS[event.group_size]}</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd>{formatCost(event.cost)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <section className="lm-section">
        <h2>Who's coming</h2>
        <div className="ed-lists">
          <AttendeeList title="Going" people={event.attendees.going} currentUserId={userId} />
          <AttendeeList title="Maybe" people={event.attendees.maybe} currentUserId={userId} />
          <AttendeeList title="Not going" people={event.attendees.not_going} currentUserId={userId} />
        </div>
      </section>

      {showRsvp && (
        <RsvpModal
          event={event}
          defaultName={user?.name}
          defaultEmail={user?.email}
          defaultStatus={myStatus ?? 'going'}
          onClose={() => setShowRsvp(false)}
          onSaved={handleRsvpSaved}
        />
      )}
    </main>
  )
}

export default EventDetails
