import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AttendeesAPI from '../services/AttendeesAPI'
import CategoriesAPI from '../services/CategoriesAPI'
import CategoryBadge from '../components/CategoryBadge'
import ColorPicker from '../components/ColorPicker'
import { FormErrors, Loading } from '../components/StatusMessage'
import { useCurrentUser } from '../context/useCurrentUser'
import { LIFE_STAGE_LABELS, RSVP_LABELS, formatEventDate, formatMonthYear, isPast } from '../utils/format'
import './Account.css'

/* ---------- Small pieces ---------- */
function UserIcon({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function EventCard({ event, statusLabel }) {
  return (
    <Link to={`/events/${event.id}`} className="ac__card">
      <div className="ac__card-image" style={{ background: event.category_color }} aria-hidden="true" />
      <div className="ac__card-body">
        <p className="ac__card-date">{formatEventDate(event.date)}</p>
        <h3 className="ac__card-title">{event.title}</h3>
        <p className="ac__card-meta">{event.location}</p>
        <div className="ac__card-footer">
          <span className="ac__card-status">{statusLabel}</span>
          <CategoryBadge name={event.category_name} color={event.category_color} />
        </div>
      </div>
    </Link>
  )
}

function EventSection({ title, subtitle, events, emptyText, action }) {
  return (
    <section className="ac__section">
      <div className="ac__inner">
        <div className="ac__section-head">
          <div>
            <h2>
              {title}
              <span className="ac__count">{events.length}</span>
            </h2>
            <p className="ac__section-sub">{subtitle}</p>
          </div>
          {action}
        </div>

        {events.length ? (
          <div className="ac__grid">
            {events.map(({ event, statusLabel }) => (
              <EventCard key={event.id} event={event} statusLabel={statusLabel} />
            ))}
          </div>
        ) : (
          <p className="ac__empty">{emptyText}</p>
        )}
      </div>
    </section>
  )
}

/* ---------- Profile form (create or edit) ---------- */
function ProfileForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    life_stage: initial?.life_stage ?? ''
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ ...form, life_stage: form.life_stage || null })
    } catch (err) {
      setError(err.status === 409 ? { message: 'That email is already used by another profile.' } : err)
      setSaving(false)
    }
  }

  return (
    <form className="lm-form ac__form" onSubmit={handleSubmit}>
      <FormErrors error={error} />
      <label>
        Name
        <input className="lm-input" name="name" value={form.name} onChange={handleChange} required />
      </label>
      <label>
        Email
        <input className="lm-input" type="email" name="email" value={form.email} onChange={handleChange} required />
      </label>
      <label>
        Life stage
        <select className="lm-select" name="life_stage" value={form.life_stage} onChange={handleChange}>
          <option value="">Prefer not to say</option>
          {Object.entries(LIFE_STAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="lm-form__actions">
        {onCancel && (
          <button type="button" className="lm-btn lm-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="lm-btn" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

/* ---------- Interest color picker ---------- */
function InterestsEditor({ user, categories, onSaved }) {
  const savedIds = user.interests.map((i) => i.id)
  const [selected, setSelected] = useState(savedIds)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)

  const changed =
    selected.length !== savedIds.length || selected.some((id) => !savedIds.includes(id))

  const toggle = (id) => {
    setStatus({ type: '', message: '' })
    setSelected((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const save = async () => {
    setSaving(true)
    try {
      await AttendeesAPI.setInterests(user.id, selected)
      setStatus({ type: 'success', message: 'Your colors are saved.' })
      onSaved()
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="ac__section">
      <div className="ac__inner">
        <div className="ac__section-head">
          <div>
            <h2>Your colors</h2>
            <p className="ac__section-sub">
              Pick the colors for what you enjoy. Events in your colors are highlighted across the app.
            </p>
          </div>
          <button type="button" className="lm-btn" onClick={save} disabled={!changed || saving}>
            {saving ? 'Saving…' : 'Save colors'}
          </button>
        </div>

        <div className="ac__colors">
          <ColorPicker categories={categories} selectedIds={selected} onToggle={toggle} label="Your interest colors" />
        </div>
        <p aria-live="polite" className="ac__status">
          {status.message && (
            <span className={`lm-alert ${status.type === 'success' ? 'lm-alert--success' : ''}`}>
              {status.message}
            </span>
          )}
        </p>
      </div>
    </section>
  )
}

/* ---------- Page ---------- */
function Account() {
  const { user, loading, setUserId, refresh } = useCurrentUser()
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    let ignore = false
    CategoriesAPI.getAll()
      .then((rows) => !ignore && setCategories(rows))
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  if (loading) {
    return (
      <main className="ac">
        <div className="ac__inner ac__padded">
          <Loading label="Loading your profile…" />
        </div>
      </main>
    )
  }

  // Guest: create a profile
  if (!user) {
    return (
      <main className="ac">
        <section className="ac__profile">
          <div className="ac__inner">
            <p className="ac__eyebrow">CREATE YOUR PROFILE</p>
            <h1 className="ac__title">Welcome! Tell us about you</h1>
            <p className="ac__section-sub">
              Or choose a sample person under “Viewing as” in the top bar to look around.
            </p>
            <ProfileForm
              submitLabel="Create profile"
              onSubmit={async (values) => {
                const created = await AttendeesAPI.create(values)
                setUserId(created.id)
              }}
            />
          </div>
        </section>
      </main>
    )
  }

  const upcoming = user.rsvps
    .filter((r) => r.status !== 'not_going' && !isPast(r.date))
    .map((r) => ({ event: { ...r, id: r.event_id }, statusLabel: RSVP_LABELS[r.status] }))

  const past = user.rsvps
    .filter((r) => r.status === 'going' && isPast(r.date))
    .reverse()
    .map((r) => ({ event: { ...r, id: r.event_id }, statusLabel: 'Attended' }))

  const hosting = user.organized_events.map((e) => ({
    event: e,
    statusLabel: isPast(e.date) ? 'Hosted' : 'Hosting'
  }))

  return (
    <main className="ac">
      {/* Profile */}
      <section className="ac__profile">
        <div className="ac__inner">
          <p className="ac__eyebrow">MY PROFILE</p>

          {editing ? (
            <ProfileForm
              initial={user}
              submitLabel="Save profile"
              onCancel={() => setEditing(false)}
              onSubmit={async (values) => {
                await AttendeesAPI.update(user.id, values)
                setEditing(false)
                refresh()
              }}
            />
          ) : (
            <>
              <div className="ac__profile-main">
                <div className="ac__avatar">
                  <UserIcon size={44} />
                </div>

                <div className="ac__profile-info">
                  <h1>{user.name}</h1>
                  <p className="ac__bio">{LIFE_STAGE_LABELS[user.life_stage] ?? 'Life stage not set'}</p>
                  <p className="ac__profile-meta">
                    {user.email}
                    <span aria-hidden="true">·</span>
                    Member since {formatMonthYear(user.created_at)}
                  </p>
                </div>

                <div className="ac__profile-actions">
                  <button type="button" className="ac__btn ac__btn--secondary" onClick={() => setEditing(true)}>
                    Edit profile
                  </button>
                  {/* Back to guest; the "Viewing as" picker reappears in the navbar */}
                  <button type="button" className="ac__btn ac__btn--secondary" onClick={() => setUserId(null)}>
                    Log out
                  </button>
                </div>
              </div>

              <div className="ac__profile-footer">
                <ul className="ac__chips">
                  {user.interests.length ? (
                    user.interests.map((c) => (
                      <li key={c.id}>
                        <CategoryBadge name={c.name} color={c.color} />
                      </li>
                    ))
                  ) : (
                    <li className="ac__chip">No colors picked yet</li>
                  )}
                </ul>
                <p className="ac__stats">
                  <strong>{upcoming.length} upcoming</strong>
                  <span aria-hidden="true">·</span>
                  {past.length} attended
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* key resets the picker when switching users */}
      <InterestsEditor key={user.id} user={user} categories={categories} onSaved={refresh} />

      <EventSection
        title="Upcoming events"
        subtitle="Your next plans, all in one place."
        events={upcoming}
        emptyText="You haven't RSVP'd to anything yet."
        action={
          <Link to="/" className="ac__link">
            Discover more events →
          </Link>
        }
      />

      <EventSection
        title="Events you're hosting"
        subtitle="Events you organized."
        events={hosting}
        emptyText="You aren't hosting any events."
        action={
          <Link to="/events/new" className="ac__link">
            Create an event →
          </Link>
        }
      />

      <EventSection
        title="Past events"
        subtitle="Good times and places you've been."
        events={past}
        emptyText="No past events yet."
        action={<span className="ac__sort">Most recent first</span>}
      />
    </main>
  )
}

export default Account
