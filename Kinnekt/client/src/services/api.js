// Shared fetch helper used by every service file.
// In development, Vite proxies /api to the Express server (see vite.config.js).

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details // list of validation messages from the server, if any
  }
}

// Turns { category_id: [1, 2], max_cost: '' } into "?category_id=1,2" (empty values are skipped)
const toQueryString = (query = {}) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','))
    } else {
      params.set(key, value)
    }
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

export const request = async (path, { method = 'GET', body, query } = {}) => {
  let response
  try {
    response = await fetch(`/api${path}${toQueryString(query)}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    })
  } catch {
    throw new ApiError('Could not reach the server. Is it running?', 0)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const details = data?.errors ?? []
    const message = details[0] ?? data?.error ?? `Request failed (${response.status})`
    throw new ApiError(message, response.status, details)
  }
  return data
}
