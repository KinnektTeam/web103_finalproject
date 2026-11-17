import { request } from './api'

// filters: { category_id: [ids], group_size: [..], max_cost, life_stage: [..], attendee_id, include_past }
const getAll = (filters = {}) => request('/events', { query: filters })

const getById = (id) => request(`/events/${id}`)

const create = (event) => request('/events', { method: 'POST', body: event })

const update = (id, changes) => request(`/events/${id}`, { method: 'PATCH', body: changes })

const remove = (id) => request(`/events/${id}`, { method: 'DELETE' })

export default { getAll, getById, create, update, remove }
