import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormErrors } from './StatusMessage'
import {
  GROUP_SIZE_LABELS, fromDateTimeInputs, toDateInput, toTimeInput
} from '../utils/format'
import '../pages/CreateEvent.css'

const EMPTY_FORM = {
  title: '',
  color_category_id: '',
  group_size: 'small',
  description: '',
  date: '',
  time: '',
  location: '',
  hasCost: false,
  cost: '',
  ticket_url: ''
}

const formFromEvent = (event) => ({
  title: event.title,
  color_category_id: String(event.color_category_id),
  group_size: event.group_size,
  description: event.description ?? '',
  date: toDateInput(event.date),
  time: toTimeInput(event.date),
  location: event.location,
  hasCost: Number(event.cost) > 0 || Boolean(event.ticket_url),
  cost: Number(event.cost) > 0 ? String(event.cost) : '',
  ticket_url: event.ticket_url ?? ''
})

// Shared form for creating and editing events (fields follow the `events` table).
// onSubmit(payload) should return a promise; if it rejects, the error is shown above the form.
function EventForm({ initialEvent, categories, onSubmit, submitLabel, cancelTo, extraActions }) {
  const [initialForm] = useState(() => (initialEvent ? formFromEvent(initialEvent) : EMPTY_FORM))
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const today = toDateInput(new Date())
  const dateChanged = form.date !== initialForm.date || form.time !== initialForm.time

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const date = fromDateTimeInputs(form.date, form.time)
    if (dateChanged && new Date(date) <= new Date()) {
      setError({ message: 'Event date must be in the future.' })
      return
    }

    const payload = {
      title: form.title.trim(),
      color_category_id: Number(form.color_category_id),
      group_size: form.group_size,
      description: form.description.trim(),
      location: form.location.trim(),
      cost: form.hasCost ? Number(form.cost || 0) : 0,
      ticket_url: form.hasCost && form.ticket_url.trim() ? form.ticket_url.trim() : null,
      // Only send the date when it changed, so editing an old event doesn't fail the "future date" rule
      ...(dateChanged ? { date } : {})
    }

    setSaving(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err)
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <FormErrors error={error} />

      <form id="event-form" className="ce__card" onSubmit={handleSubmit}>
        <div className="ce__body">
          <div className="ce__row ce__row--2-1">
            <div className="ce__field">
              <label htmlFor="title">Event name *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Sunrise hike at the lake"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="color_category_id">Color category *</label>
              <select
                id="color_category_id"
                name="color_category_id"
                value={form.color_category_id}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a color
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ce__field">
            <label htmlFor="description">Event description</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="What can attendees expect? Include the schedule and anything they should bring."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="ce__row ce__row--3">
            <div className="ce__field">
              <label htmlFor="date">Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                min={dateChanged ? today : undefined}
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="time">Start time *</label>
              <input
                id="time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="group_size">Group size *</label>
              <select id="group_size" name="group_size" value={form.group_size} onChange={handleChange}>
                {Object.entries(GROUP_SIZE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ce__field">
            <label htmlFor="location">Location *</label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Venue name and address, e.g. Waterfront Park, 98 Front Ave"
              value={form.location}
              onChange={handleChange}
              maxLength={255}
              required
            />
          </div>

          <div className="ce__tickets">
            <label className="ce__checkbox">
              <input type="checkbox" name="hasCost" checked={form.hasCost} onChange={handleChange} />
              <span>
                <strong>This event costs money</strong>
                <small>Leave unchecked if the event is free.</small>
              </span>
            </label>

            {form.hasCost && (
              <div className="ce__row ce__row--2 ce__tickets-fields">
                <div className="ce__field">
                  <label htmlFor="cost">Price per person *</label>
                  <div className="ce__prefix">
                    <span aria-hidden="true">$</span>
                    <input
                      id="cost"
                      name="cost"
                      type="number"
                      min="0"
                      max="999999"
                      step="0.01"
                      placeholder="0.00"
                      value={form.cost}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="ce__field">
                  <label htmlFor="ticket_url">Ticket link (optional)</label>
                  <input
                    id="ticket_url"
                    name="ticket_url"
                    type="url"
                    placeholder="https://"
                    value={form.ticket_url}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      <div className="ce__actions">
        <Link to={cancelTo} className="ce__cancel">
          Cancel
        </Link>
        <div className="ce__actions-right">
          {extraActions}
          <button type="submit" form="event-form" className="ce__btn ce__btn--primary" disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </>
  )
}

export default EventForm
