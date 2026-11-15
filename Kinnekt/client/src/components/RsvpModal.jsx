import { useEffect, useRef, useState } from 'react'
import RsvpsAPI from '../services/RsvpsAPI'
import { FormErrors } from './StatusMessage'
import { RSVP_LABELS } from '../utils/format'

// RSVP pop-up for the event details page. Uses the native <dialog> element,
// which handles focus and the Escape key. RSVPing again with the same email
// updates the status instead of creating a duplicate.
function RsvpModal({ event, defaultName = '', defaultEmail = '', defaultStatus = 'going', onClose, onSaved }) {
  const dialogRef = useRef(null)
  const [form, setForm] = useState({ name: defaultName, email: defaultEmail, status: defaultStatus })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const rsvp = await RsvpsAPI.save(event.id, form)
      onSaved(rsvp)
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  // Clicking the dark backdrop (outside the dialog box) closes it
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="lm-modal"
      aria-labelledby="rsvp-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
    >
      <div className="lm-modal__inner">
        <div className="lm-modal__head">
          <div>
            <h2 id="rsvp-title">RSVP</h2>
            <p>{event.title}</p>
          </div>
          <button type="button" className="lm-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <FormErrors error={error} />

        <form className="lm-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              className="lm-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </label>

          <label>
            Email
            <input
              className="lm-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <fieldset>
            <legend>Are you going?</legend>
            <div className="lm-radio-row">
              {Object.entries(RSVP_LABELS).map(([value, label]) => (
                <label key={value} className="lm-radio">
                  <input
                    type="radio"
                    name="status"
                    value={value}
                    checked={form.status === value}
                    onChange={handleChange}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="lm-form__actions">
            <button type="button" className="lm-btn lm-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="lm-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save RSVP'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default RsvpModal
