import { request } from './api'

const getAll = () => request('/categories')

export default { getAll }
