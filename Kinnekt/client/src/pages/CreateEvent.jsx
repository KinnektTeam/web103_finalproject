import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './CreateEvent.css'

const CATEGORIES = [
  'Music',
  'Food & drink',
  'Arts & culture',
  'Sports & fitness',
  'Community',
  'Business & networking',
  'Education',
  'Other'
]

const FORMATS = ['In person', 'Online', 'Hybrid']

const TIME_ZONES = [
  'Pacific Time (US & Canada)',
  'Mountain Time (US & Canada)',
  'Central Time (US & Canada)',
  'Eastern Time (US & Canada)',
  'Alaska',
  'Hawaii'
]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB

const initialForm = {
  name: '',
  category: '',
  organizer: '',
  format: 'In person',
  description: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  timeZone: 'Pacific Time (US & Canada)',
  venue: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  hasTickets: false,
  ticketName: '',
  ticketPrice: '',
  ticketCapacity: ''
}

function CreateEvent() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState(initialForm)
  const [image, setImage] = useState(null) // { file, preview }
  const [imageError, setImageError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  /* ---------- Image upload ---------- */
  const handleFile = (file) => {
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setImageError('Please upload a JPG or PNG image.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be 10 MB or smaller.')
      return
    }

    setImageError('')
    if (image) URL.revokeObjectURL(image.preview)
    setImage({ file, preview: URL.createObjectURL(file) })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.preview)
    setImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ---------- Submit ---------- */
  const buildPayload = (status) => ({
    ...form,
    status,
    image: image?.file ?? null,
    // Only include ticket info if the checkbox is on
    ...(form.hasTickets
      ? {}
      : { ticketName: '', ticketPrice: '', ticketCapacity: '' })
  })

  const handlePublish = (e) => {
    e.preventDefault() // browser validates required fields first
    const payload = buildPayload('published')
    console.log('Publish event:', payload)
    // TODO: send payload to your API, then:
    navigate('/')
  }

  const handleSaveDraft = () => {
    const payload = buildPayload('draft')
    console.log('Save draft:', payload)
    // TODO: send payload to your API
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
          <p className="ce__subtitle">
            Fill in the details below, then publish when you're ready.
          </p>
        </div>
        <span className="ce__badge">Unpublished draft</span>
      </div>

      <form className="ce__card" onSubmit={handlePublish}>
        {/* Cover image */}
        <div
          className={`ce__dropzone ${isDragging ? 'is-dragging' : ''} ${
            image ? 'has-image' : ''
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {image ? (
            <>
              <img
                src={image.preview}
                alt="Event cover preview"
                className="ce__preview"
              />
              <button
                type="button"
                className="ce__remove-image"
                onClick={removeImage}
              >
                Remove image
              </button>
            </>
          ) : (
            <div className="ce__dropzone-content">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="1.5" />
                <path d="m21 15-4.5-4.5L8 19" />
              </svg>
              <p className="ce__dropzone-title">
                Drag an image here or{' '}
                <button
                  type="button"
                  className="ce__link-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </button>
              </p>
              <p className="ce__hint">
                JPG or PNG · Up to 10 MB · Recommended 1600 × 900
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
        {imageError && <p className="ce__error ce__error--image">{imageError}</p>}

        <div className="ce__body">
          {/* Event basics */}
          <div className="ce__row ce__row--2-1">
            <div className="ce__field">
              <label htmlFor="name">Event name *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Neighborhood night market"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ce__row ce__row--2-1">
            <div className="ce__field">
              <label htmlFor="organizer">Organizer name *</label>
              <input
                id="organizer"
                name="organizer"
                type="text"
                placeholder="Your name or organization"
                value={form.organizer}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="format">Format</label>
              <select
                id="format"
                name="format"
                value={form.format}
                onChange={handleChange}
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ce__field">
            <label htmlFor="description">Event description *</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="What can attendees expect? Include the schedule, highlights, and anything they should bring."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Date & time */}
          <div className="ce__row ce__row--4">
            <div className="ce__field">
              <label htmlFor="startDate">Start date *</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="startTime">Start time *</label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="endDate">End date *</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                min={form.startDate}
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="endTime">End time *</label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ce__field">
            <label htmlFor="timeZone">Time zone</label>
            <select
              id="timeZone"
              name="timeZone"
              value={form.timeZone}
              onChange={handleChange}
            >
              {TIME_ZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="ce__row ce__row--2">
            <div className="ce__field">
              <label htmlFor="venue">Venue name *</label>
              <input
                id="venue"
                name="venue"
                type="text"
                placeholder="e.g. Waterfront Park"
                value={form.venue}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="street">Street address *</label>
              <input
                id="street"
                name="street"
                type="text"
                placeholder="Enter the event address"
                value={form.street}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ce__row ce__row--3">
            <div className="ce__field">
              <label htmlFor="city">City *</label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="Portland"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="state">State *</label>
              <input
                id="state"
                name="state"
                type="text"
                placeholder="Oregon"
                value={form.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ce__field">
              <label htmlFor="zip">ZIP code *</label>
              <input
                id="zip"
                name="zip"
                type="text"
                inputMode="numeric"
                placeholder="ZIP code"
                pattern="\d{5}(-\d{4})?"
                title="Enter a 5-digit ZIP code"
                value={form.zip}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Tickets (optional) */}
          <div className="ce__tickets">
            <label className="ce__checkbox">
              <input
                type="checkbox"
                name="hasTickets"
                checked={form.hasTickets}
                onChange={handleChange}
              />
              <span>
                <strong>Sell tickets for this event</strong>
                <small>Leave unchecked if attendance is free and open.</small>
              </span>
            </label>

            {form.hasTickets && (
              <div className="ce__row ce__row--3 ce__tickets-fields">
                <div className="ce__field">
                  <label htmlFor="ticketName">Ticket name *</label>
                  <input
                    id="ticketName"
                    name="ticketName"
                    type="text"
                    placeholder="General admission"
                    value={form.ticketName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="ce__field">
                  <label htmlFor="ticketPrice">Price per ticket *</label>
                  <div className="ce__prefix">
                    <span aria-hidden="true">$</span>
                    <input
                      id="ticketPrice"
                      name="ticketPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.ticketPrice}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="ce__field">
                  <label htmlFor="ticketCapacity">Capacity *</label>
                  <input
                    id="ticketCapacity"
                    name="ticketCapacity"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 100"
                    value={form.ticketCapacity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Actions */}
      <div className="ce__actions">
        <Link to="/" className="ce__cancel">
          Cancel
        </Link>
        <div className="ce__actions-right">
          <button
            type="button"
            className="ce__btn ce__btn--secondary"
            onClick={handleSaveDraft}
          >
            Save draft
          </button>
          {/* form attribute lets this button submit the form above */}
          <button
            type="submit"
            className="ce__btn ce__btn--primary"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('.ce__card').requestSubmit()
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            Publish event
          </button>
        </div>
      </div>
      <p className="ce__note">Publishing makes your event visible to everyone.</p>
    </main>
  )
}

export default CreateEvent