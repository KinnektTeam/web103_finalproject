import { request } from './api'

const getForEvent = (eventId) => request(`/events/${eventId}/rsvps`)

// Creates the RSVP, or updates the status if this email already RSVP'd
const save = (eventId, { name, email, status }) =>
  request(`/events/${eventId}/rsvps`, { method: 'POST', body: { name, email, status } })

const remove = (eventId, attendeeId) =>
  request(`/events/${eventId}/rsvps/${attendeeId}`, { method: 'DELETE' })

export default { getForEvent, save, remove }
