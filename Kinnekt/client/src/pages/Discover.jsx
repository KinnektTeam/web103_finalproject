import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AttendeesAPI from '../services/AttendeesAPI'
import EventsAPI from '../services/EventsAPI'
import CategoryBadge from '../components/CategoryBadge'
import EventCard from '../components/EventCard'
import { EmptyState, ErrorMessage, Loading } from '../components/StatusMessage'
import { useCurrentUser } from '../context/useCurrentUser'
import { LIFE_STAGE_LABELS } from '../utils/format'
import './Discover.css'

function PersonCard({ person, showShared }) {
  return (
    <article className="dc-person">
      <div className="dc-person__head">
        <span className="dc-person__avatar" aria-hidden="true">
          {person.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h3>{person.name}</h3>
          <p>{LIFE_STAGE_LABELS[person.life_stage] ?? 'Life stage not set'}</p>
        </div>
      </div>
      {showShared && person.shared_interests > 0 && (
        <p className="dc-person__shared">
          Shares {person.shared_interests} {person.shared_interests === 1 ? 'color' : 'colors'} with you
        </p>
      )}
      <div className="dc-person__colors">
        {person.interests.length ? (
          person.interests.map((c) => <CategoryBadge key={c.id} name={c.name} color={c.color} />)
        ) : (
          <span className="dc-person__none">No colors picked yet</span>
        )}
      </div>
    </article>
  )
}

// "Find your people": filter by life stage and see people and events that share your colors
function Discover() {
  const { user, userId } = useCurrentUser()
  const [lifeStages, setLifeStages] = useState([])
  const [onlyMyColors, setOnlyMyColors] = useState(true)
  const [people, setPeople] = useState(null)
  const [events, setEvents] = useState(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // A string so the effect only re-runs when the colors actually change
  const myColorKey = user?.interests.map((i) => i.id).join(',') ?? ''
  const matchColors = onlyMyColors && Boolean(myColorKey)
  const lifeStageKey = lifeStages.join(',')

  useEffect(() => {
    let ignore = false
    Promise.all([
      AttendeesAPI.getAll({ life_stage: lifeStageKey, similar_to: matchColors ? userId : '' }),
      EventsAPI.getAll({
        life_stage: lifeStageKey,
        category_id: matchColors ? myColorKey : '',
        attendee_id: userId ?? ''
      })
    ])
      .then(([peopleRows, eventRows]) => {
        if (ignore) return
        setPeople(peopleRows.filter((p) => p.id !== userId))
        setEvents(eventRows)
        setError('')
      })
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [lifeStageKey, matchColors, myColorKey, userId, reloadKey])

  const toggleLifeStage = (stage) =>
    setLifeStages((prev) => (prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]))

  return (
    <main className="lm-page">
      <div className="lm-page-head">
        <div>
          <h1>Find your people</h1>
          <p>Meet others at the same point in life who enjoy the same things you do.</p>
        </div>
      </div>

      <div className="lm-filters">
        <div className="lm-filter">
          <span className="lm-filter__label">Life stage</span>
          <div className="lm-toggles" role="group" aria-label="Filter by life stage">
            {Object.entries(LIFE_STAGE_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className="lm-toggle"
                aria-pressed={lifeStages.includes(value)}
                onClick={() => toggleLifeStage(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {myColorKey ? (
          <label className="dc-check">
            <input type="checkbox" checked={onlyMyColors} onChange={(e) => setOnlyMyColors(e.target.checked)} />
            Only show people and events that share my colors
          </label>
        ) : (
          <p className="dc-hint">
            <Link to="/account">Pick your interest colors</Link> to see people who share them.
          </p>
        )}
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : people === null ? (
        <Loading />
      ) : (
        <>
          <section>
            <h2 className="dc-heading">People ({people.length})</h2>
            {people.length ? (
              <div className="lm-grid">
                {people.map((person) => (
                  <PersonCard key={person.id} person={person} showShared={matchColors} />
                ))}
              </div>
            ) : (
              <EmptyState title="No one matches yet">
                <p>Try another life stage or turn off the color filter.</p>
              </EmptyState>
            )}
          </section>

          <section className="lm-section">
            <h2 className="dc-heading">Events for you ({events.length})</h2>
            <p className="lm-section-sub">
              {[
                matchColors ? 'Upcoming events in your colors' : 'All upcoming events',
                lifeStages.length ? ', organized or attended by people in these life stages.' : '.'
              ].join('')}
            </p>
            {events.length ? (
              <div className="lm-grid">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState title="No matching events">
                <p>Why not host one?</p>
                <Link to="/events/new" className="lm-btn">
                  Create an event
                </Link>
              </EmptyState>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default Discover
