export const GROUP_SIZE_LABELS = {
  one_on_one: 'One-on-one',
  small: 'Small group',
  large: 'Large group'
}

export const LIFE_STAGE_LABELS = {
  new_to_town: 'New to town',
  recent_grad: 'Recent grad',
  student: 'Student',
  relocating: 'Relocating'
}

export const RSVP_LABELS = {
  going: 'Going',
  maybe: 'Maybe',
  not_going: 'Not going'
}

export const COST_LEVEL_LABELS = {
  free: 'Free',
  low: '$ Low',
  medium: '$$ Medium',
  high: '$$$ High'
}

// "FRI, NOV 13 · 5:00 PM"
export const formatEventDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const day = date
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase()
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} · ${time}`
}

// "November 2026"
export const formatMonthYear = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

export const formatCost = (cost) => (Number(cost) === 0 ? 'Free' : `$${Number(cost).toFixed(2)}`)

// Date <-> the values used by <input type="date"> and <input type="time"> (local time)
const pad = (n) => String(n).padStart(2, '0')

export const toDateInput = (value) => {
  const d = new Date(value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const toTimeInput = (value) => {
  const d = new Date(value)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const fromDateTimeInputs = (date, time) => new Date(`${date}T${time}`).toISOString()

export const isPast = (value) => new Date(value) < new Date()
