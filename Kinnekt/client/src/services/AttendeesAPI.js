import { request } from './api'

// filters: { life_stage: [..], category_id: [ids], similar_to: attendeeId }
const getAll = (filters = {}) => request('/attendees', { query: filters })

const getById = (id) => request(`/attendees/${id}`)

const create = (attendee) => request('/attendees', { method: 'POST', body: attendee })

const update = (id, changes) => request(`/attendees/${id}`, { method: 'PATCH', body: changes })

const remove = (id) => request(`/attendees/${id}`, { method: 'DELETE' })

const getInterests = (id) => request(`/attendees/${id}/interests`)

// Replaces the attendee's full set of interest colors
const setInterests = (id, categoryIds) =>
  request(`/attendees/${id}/interests`, { method: 'PUT', body: { category_ids: categoryIds } })

export default { getAll, getById, create, update, remove, getInterests, setInterests }
