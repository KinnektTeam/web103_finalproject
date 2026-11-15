import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CategoriesAPI from '../services/CategoriesAPI'
import EventsAPI from '../services/EventsAPI'
import EventForm from '../components/EventForm'
import { EmptyState, ErrorMessage, Loading } from '../components/StatusMessage'
import { useCurrentUser } from '../context/useCurrentUser'
import './CreateEvent.css'

// /events/:eventId/edit
function EditEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { userId, loading: userLoading, refresh } = useCurrentUser()
  const [event, setEvent] = useState(null)
  const [categories, setCategories] = useState(null)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let ignore = false
    Promise.all([EventsAPI.getById(eventId), CategoriesAPI.getAll()])
      .then(([eventRow, categoryRows]) => {
        if (ignore) return
        setEvent(eventRow)
        setCategories(categoryRows)
      })
      .catch((err) => !ignore && setError(err))
    return () => {
      ignore = true
    }
  }, [eventId])

  const handleSave = async (payload) => {
    await EventsAPI.update(eventId, payload)
    refresh()
    navigate(`/events/${eventId}`)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Cancel "${event.title}"? This deletes the event and all of its RSVPs.`)) return
    setDeleting(true)
    try {
      await EventsAPI.remove(eventId)
      refresh()
      navigate('/')
    } catch (err) {
      setError(err)
      setDeleting(false)
    }
  }

  let content
  if (error?.status === 404 || error?.status === 400) {
    content = (
      <EmptyState title="Event not found">
        <Link to="/" className="lm-btn">
          Browse events
        </Link>
      </EmptyState>
    )
  } else if (error) {
    content = <ErrorMessage message={error.message} />
  } else if (!event || userLoading) {
    content = <Loading />
  } else if (event.organizer_id !== userId) {
    content = (
      <EmptyState title="Only the organizer can edit this event">
        <p>Switch to {event.organizer_name} under “Viewing as” to make changes.</p>
        <Link to={`/events/${eventId}`} className="lm-btn lm-btn--secondary">
          Back to event
        </Link>
      </EmptyState>
    )
  } else {
    content = (
      <EventForm
        initialEvent={event}
        categories={categories}
        onSubmit={handleSave}
        submitLabel="Save changes"
        cancelTo={`/events/${eventId}`}
        extraActions={
          <button
            type="button"
            className="ce__btn ce__btn--secondary lm-btn--danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Cancelling…' : 'Cancel event'}
          </button>
        }
      />
    )
  }

  return (
    <main className="ce">
      <nav className="ce__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        {event && <Link to={`/events/${eventId}`}>{event.title}</Link>}
        {event && <span aria-hidden="true">›</span>}
        <span aria-current="page">Edit</span>
      </nav>

      <div className="ce__heading">
        <div>
          <h1>Edit event</h1>
          <p className="ce__subtitle">Update the details, or cancel the event.</p>
        </div>
      </div>

      {content}
    </main>
  )
}

export default EditEvent
