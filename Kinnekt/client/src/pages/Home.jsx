import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoriesAPI from '../services/CategoriesAPI'
import EventsAPI from '../services/EventsAPI'
import EventCard from '../components/EventCard'
import EventFilters from '../components/EventFilters'
import { EmptyState, ErrorMessage, Loading } from '../components/StatusMessage'
import { useCurrentUser } from '../context/useCurrentUser'
import { EMPTY_EVENT_FILTERS, toEventQuery } from '../utils/eventFilters'
import './Home.css'

// Browse and filter upcoming events. Events in the user's colors are highlighted and listed first.
function Home() {
  const { user, userId } = useCurrentUser()
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState(EMPTY_EVENT_FILTERS)
  const [events, setEvents] = useState(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false
    CategoriesAPI.getAll()
      .then((rows) => !ignore && setCategories(rows))
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false
    EventsAPI.getAll(toEventQuery(filters, userId))
      .then((rows) => {
        if (ignore) return
        setEvents(rows)
        setError('')
      })
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [filters, userId, reloadKey])

  const myColorIds = user?.interests.map((i) => i.id) ?? []

  return (
    <main className="lm-page">
      <div className="lm-page-head">
        <div>
          <h1>Upcoming events</h1>
          <p>
            {myColorIds.length ? (
              'Events in your colors are highlighted and shown first.'
            ) : (
              <>
                <Link to="/account">Pick your interest colors</Link> to highlight events you'll enjoy.
              </>
            )}
          </p>
        </div>
        {myColorIds.length > 0 && (
          <button
            type="button"
            className="lm-btn lm-btn--secondary"
            onClick={() => setFilters({ ...filters, categoryIds: myColorIds })}
          >
            Show only my colors
          </button>
        )}
      </div>

      <EventFilters categories={categories} filters={filters} onChange={setFilters} />

      {error ? (
        <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : events === null ? (
        <Loading label="Loading events…" />
      ) : events.length === 0 ? (
        <EmptyState title="No events match these filters">
          <p>Try clearing a filter, or start something yourself.</p>
          <Link to="/events/new" className="lm-btn">
            Create an event
          </Link>
        </EmptyState>
      ) : (
        <>
          <p className="home__count" aria-live="polite">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </p>
          <div className="lm-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}

export default Home
