import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategoriesAPI from '../services/CategoriesAPI'
import EventsAPI from '../services/EventsAPI'
import EventForm from '../components/EventForm'
import { EmptyState, ErrorMessage, Loading } from '../components/StatusMessage'
import { useCurrentUser } from '../context/useCurrentUser'
import './CreateEvent.css'

function CreateEvent() {
  const navigate = useNavigate()
  const { user, userId, loading, refresh } = useCurrentUser()
  const [categories, setCategories] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    CategoriesAPI.getAll()
      .then((rows) => !ignore && setCategories(rows))
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [])

  const handleCreate = async (payload) => {
    const created = await EventsAPI.create({ ...payload, organizer_id: userId })
    refresh()
    navigate(`/events/${created.id}`)
  }

  let content
  if (error) content = <ErrorMessage message={error} />
  else if (loading || categories === null) content = <Loading />
  else if (!user) {
    content = (
      <EmptyState title="Create a profile first">
        <p>Events need an organizer. Set up your profile, or pick someone under “Viewing as”.</p>
        <Link to="/account" className="lm-btn">
          Set up profile
        </Link>
      </EmptyState>
    )
  } else {
    content = (
      <EventForm
        categories={categories}
        onSubmit={handleCreate}
        submitLabel="Publish event"
        cancelTo="/"
      />
    )
  }

  return (
    <main className="ce">
      <nav className="ce__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Create event</span>
      </nav>

      <div className="ce__heading">
        <div>
          <h1>Create your event</h1>
          <p className="ce__subtitle">Fill in the details below, then publish when you're ready.</p>
        </div>
        {user && <span className="ce__badge">Organizer: {user.name}</span>}
      </div>

      {content}
    </main>
  )
}

export default CreateEvent
