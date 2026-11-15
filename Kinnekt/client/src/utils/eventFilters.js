export const EMPTY_EVENT_FILTERS = { categoryIds: [], groupSize: '', maxCost: '' }

// UI filter state -> query params for GET /api/events
export const toEventQuery = (filters, attendeeId) => ({
  category_id: filters.categoryIds,
  group_size: filters.groupSize,
  max_cost: filters.maxCost,
  attendee_id: attendeeId ?? ''
})
