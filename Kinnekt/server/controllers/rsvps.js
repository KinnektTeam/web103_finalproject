import { pool } from '../config/database.js'
import { RSVP_STATUSES, isValidEmail, handleError } from '../utils/helpers.js'

// GET /api/events/:eventId/rsvps
const getRsvps = async (req, res) => {
    try {
        const results = await pool.query(`
            SELECT r.id, r.event_id, r.attendee_id, r.status, r.created_at, a.name
            FROM rsvps r JOIN attendees a ON a.id = r.attendee_id
            WHERE r.event_id = $1
            ORDER BY r.created_at`, [req.params.eventId])
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error)
    }
}

// POST /api/events/:eventId/rsvps  { name, email, status }
// RSVP pop-up: finds the attendee by email (creating them if new), then creates or updates
// their RSVP. The UNIQUE (event_id, attendee_id) constraint means a repeat RSVP changes the
// status instead of adding a duplicate.
const upsertRsvp = async (req, res) => {
    const { name, email, status } = req.body
    const errors = []
    if (!name?.trim()) errors.push('Name is required.')
    if (!isValidEmail(email)) errors.push('A valid email is required.')
    if (!RSVP_STATUSES.includes(status)) errors.push(`Status must be one of: ${RSVP_STATUSES.join(', ')}.`)
    if (errors.length) return res.status(400).json({ errors })

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const event = await client.query('SELECT id FROM events WHERE id = $1', [req.params.eventId])
        if (event.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({ error: 'Event not found' })
        }

        // Existing attendees keep their saved name; the no-op update lets RETURNING give back the id
        const attendee = await client.query(`
            INSERT INTO attendees (name, email) VALUES ($1, $2)
            ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
            RETURNING id, name`, [name.trim(), email.trim().toLowerCase()])
        const attendeeId = attendee.rows[0].id

        const rsvp = await client.query(`
            INSERT INTO rsvps (event_id, attendee_id, status) VALUES ($1, $2, $3)
            ON CONFLICT (event_id, attendee_id) DO UPDATE SET status = EXCLUDED.status
            RETURNING *, (xmax = 0) AS created`, [req.params.eventId, attendeeId, status])

        await client.query('COMMIT')

        const { created, ...row } = rsvp.rows[0]
        res.status(created ? 201 : 200).json({ ...row, name: attendee.rows[0].name })
    } catch (error) {
        await client.query('ROLLBACK')
        handleError(res, error)
    } finally {
        client.release()
    }
}

// DELETE /api/events/:eventId/rsvps/:attendeeId
const deleteRsvp = async (req, res) => {
    try {
        const results = await pool.query(
            'DELETE FROM rsvps WHERE event_id = $1 AND attendee_id = $2 RETURNING *',
            [req.params.eventId, req.params.attendeeId]
        )
        if (results.rows.length === 0) return res.status(404).json({ error: 'RSVP not found' })
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error)
    }
}

export default { getRsvps, upsertRsvp, deleteRsvp }
