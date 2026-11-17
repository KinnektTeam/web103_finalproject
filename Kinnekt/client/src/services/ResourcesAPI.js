import { request } from './api'

// filters: { category_id: [ids], cost_level: ['free', 'low'], sort: 'cheapest' }
const getAll = (filters = {}) => request('/resources', { query: filters })

const getById = (id) => request(`/resources/${id}`)

const getCategories = () => request('/resource-categories')

export default { getAll, getById, getCategories }
