import { pool } from '../config/database.js'
import {
    GROUP_SIZES, LIFE_STAGES, isPositiveInt, parseIdList, parseEnumList, whereBuilder, handleError
} from '../utils/helpers.js'

const EVENT_FIELDS = [
    'title', 'description', 'date', 'location', 'color_category_id',
    'group_size', 'cost', 'ticket_url', 'organizer_id'
]

// Event row + category badge info + organizer name + RSVP counts
const eventSelect = (extraColumns = '') => `
    SELECT e.*,
           c.name AS category_name,
           c.color AS category_color,
           o.name AS organizer_name,
           COUNT(r.id) FILTER (WHERE r.status = 'going')::int AS going_count,
           COUNT(r.id) FILTER (WHERE r.status = 'maybe')::int AS maybe_count,
           COUNT(r.id) FILTER (WHERE r.status = 'not_going')::int AS not_going_count
           ${extraColumns}
    FROM events e
    JOIN categories c ON c.id = e.color_category_id
    JOIN attendees o ON o.id = e.organizer_id
    LEFT JOIN rsvps r ON r.event_id = e.id`

const EVENT_GROUP_BY = 'GROUP BY e.id, c.id, o.id'

// Validates a full event (create, or existing row merged with a PATCH body)
const validateEvent = (event, { checkDate = true } = {}) => {
    const errors = []
    if (!event.title?.trim()) errors.push('Title is required.')
    if (!event.location?.trim()) errors.push('Location is required.')

    const date = new Date(event.date)
    if (!event.date || Number.isNaN(date.getTime())) errors.push('A valid date is required.')
    else if (checkDate && date <= new Date()) errors.push('Event date must be in the future.')

    if (!isPositiveInt(event.color_category_id)) errors.push('A color category is required.')
    if (!isPositiveInt(event.organizer_id)) errors.push('An organizer is required.')
    if (!GROUP_SIZES.includes(event.group_size)) errors.push(`Group size must be one of: ${GROUP_SIZES.join(', ')}.`)

    const cost = Number(event.cost ?? 0)
    if (!Number.isFinite(cost) || cost < 0) errors.push('Cost must be 0 (free) or more.')
    else if (cost >= 1000000) errors.push('Cost is too large.')

    if (event.ticket_url) {
        try {
            const url = new URL(event.ticket_url)
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
        } catch {
            errors.push('Ticket URL must be a valid http(s) link.')
        }
    }
    return errors
}

const toValues = (event) => [
    event.title.trim(),
    event.description?.trim() || null,
    new Date(event.date),
    event.location.trim(),
    Number(event.color_category_id),
    event.group_size,
    Number(event.cost ?? 0),
    event.ticket_url?.trim() || null,
    Number(event.organizer_id)
]

// GET /api/events  (home page "Browse and filter events")
//   ?category_id=1,2           filter by color
//   ?group_size=small,one_on_one
//   ?max_cost=10               cost <= 10   (?max_cost=0 for free only)
//   ?life_stage=student        events organized or attended (going/maybe) by people in that life stage
//   ?attendee_id=3             adds `matches_interests` so cards matching their colors can be highlighted
//   ?include_past=true         include events that already happened (default: upcoming only)
const getEvents = async (req, res) => {
    try {
        const where = whereBuilder()
        const categoryIds = parseIdList(req.query.category_id)
        const groupSizes = parseEnumList(req.query.group_size, GROUP_SIZES)
        const lifeStages = parseEnumList(req.query.life_stage, LIFE_STAGES)

        if (req.query.include_past !== 'true') where.add('e.date >= NOW()')
        if (categoryIds.length) where.add('e.color_category_id = ANY($?)', categoryIds)
        if (groupSizes.length) where.add('e.group_size = ANY($?)', groupSizes)
        if (req.query.max_cost !== undefined && req.query.max_cost !== '') {
            const maxCost = Number(req.query.max_cost)
            if (!Number.isFinite(maxCost) || maxCost < 0) {
                return res.status(400).json({ error: 'max_cost must be a number >= 0.' })
            }
            where.add('e.cost <= $?', maxCost)
        }
        if (lifeStages.length) {
            where.add(`(o.life_stage = ANY($?) OR EXISTS (
                            SELECT 1 FROM rsvps rr JOIN attendees aa ON aa.id = rr.attendee_id
                            WHERE rr.event_id = e.id AND rr.status IN ('going', 'maybe')
                              AND aa.life_stage = ANY($?)))`, lifeStages, lifeStages)
        }

        let matchColumn = ', false AS matches_interests'
        if (isPositiveInt(req.query.attendee_id)) {
            const p = where.param(Number(req.query.attendee_id))
            matchColumn = `, EXISTS (SELECT 1 FROM attendee_interests ai
                                    WHERE ai.attendee_id = ${p} AND ai.category_id = e.color_category_id)
                             AS matches_interests`
        }

        const results = await pool.query(`
            ${eventSelect(matchColumn)}
            ${where}
            ${EVENT_GROUP_BY}
            ORDER BY matches_interests DESC, e.date`, where.values)
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error)
    }
}

// GET /api/events/:id -> event details plus attendees grouped by RSVP status
const getEventById = async (req, res) => {
    try {
        const results = await pool.query(`${eventSelect()} WHERE e.id = $1 ${EVENT_GROUP_BY}`, [req.params.id])
        if (results.rows.length === 0) return res.status(404).json({ error: 'Event not found' })

        const rsvps = await pool.query(`
            SELECT r.status, a.id AS attendee_id, a.name
            FROM rsvps r JOIN attendees a ON a.id = r.attendee_id
            WHERE r.event_id = $1
            ORDER BY r.created_at`, [req.params.id])

        const attendees = { going: [], maybe: [], not_going: [] }
        for (const { status, attendee_id, name } of rsvps.rows) attendees[status].push({ id: attendee_id, name })

        res.status(200).json({ ...results.rows[0], attendees })
    } catch (error) {
        handleError(res, error)
    }
}

// POST /api/events
// The organizer is automatically RSVP'd as "going" to their own event.
const createEvent = async (req, res) => {
    const errors = validateEvent(req.body)
    if (errors.length) return res.status(400).json({ errors })

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const results = await client.query(`
            INSERT INTO events (${EVENT_FIELDS.join(', ')})
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`, toValues(req.body))
        const event = results.rows[0]
        await client.query(
            `INSERT INTO rsvps (event_id, attendee_id, status) VALUES ($1, $2, 'going')`,
            [event.id, event.organizer_id]
        )
        await client.query('COMMIT')
        res.status(201).json(event)
    } catch (error) {
        await client.query('ROLLBACK')
        handleError(res, error)
    } finally {
        client.release()
    }
}

// PATCH /api/events/:id  (send only the fields that changed)
const updateEvent = async (req, res) => {
    try {
        const existing = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id])
        if (existing.rows.length === 0) return res.status(404).json({ error: 'Event not found' })

        const merged = { ...existing.rows[0] }
        for (const field of EVENT_FIELDS) {
            if (req.body[field] !== undefined) merged[field] = req.body[field]
        }

        // Only reject past dates when the date is being changed
        const errors = validateEvent(merged, { checkDate: req.body.date !== undefined })
        if (errors.length) return res.status(400).json({ errors })

        const assignments = EVENT_FIELDS.map((field, i) => `${field} = $${i + 1}`).join(', ')
        const results = await pool.query(
            `UPDATE events SET ${assignments} WHERE id = $${EVENT_FIELDS.length + 1} RETURNING *`,
            [...toValues(merged), req.params.id]
        )
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error)
    }
}

// DELETE /api/events/:id  (RSVPs are removed by ON DELETE CASCADE)
const deleteEvent = async (req, res) => {
    try {
        const results = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [req.params.id])
        if (results.rows.length === 0) return res.status(404).json({ error: 'Event not found' })
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error)
    }
}

export default { getEvents, getEventById, createEvent, updateEvent, deleteEvent }
