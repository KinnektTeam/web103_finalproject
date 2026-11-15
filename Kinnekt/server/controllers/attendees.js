import { pool } from '../config/database.js'
import {
    LIFE_STAGES, isValidEmail, isPositiveInt, parseIdList, parseEnumList, whereBuilder, handleError
} from '../utils/helpers.js'

// Each attendee comes back with an `interests` array of { id, name, color }
const INTERESTS_JSON = `
    COALESCE(
        json_agg(json_build_object('id', c.id, 'name', c.name, 'color', c.color) ORDER BY c.name)
            FILTER (WHERE c.id IS NOT NULL),
        '[]'
    ) AS interests`

const INTERESTS_JOIN = `
    LEFT JOIN attendee_interests ai ON ai.attendee_id = a.id
    LEFT JOIN categories c ON c.id = ai.category_id`

const validateAttendee = (body, { partial = false } = {}) => {
    const errors = []
    const has = (key) => body[key] !== undefined

    if (!partial || has('name')) {
        if (!body.name?.trim()) errors.push('Name is required.')
    }
    if (!partial || has('email')) {
        if (!isValidEmail(body.email)) errors.push('A valid email is required.')
    }
    if (has('life_stage') && body.life_stage !== null && !LIFE_STAGES.includes(body.life_stage)) {
        errors.push(`Life stage must be one of: ${LIFE_STAGES.join(', ')}.`)
    }
    return errors
}

// GET /api/attendees  ("Find your people")
//   ?life_stage=new_to_town,student   filter by life stage
//   ?category_id=1,3                   attendees who picked any of these colors
//   ?similar_to=5                      attendees sharing a color with attendee 5 (excludes 5), most shared first
// Emails are not included in this public list.
const getAttendees = async (req, res) => {
    try {
        const where = whereBuilder()
        const lifeStages = parseEnumList(req.query.life_stage, LIFE_STAGES)
        const categoryIds = parseIdList(req.query.category_id)
        const similarTo = isPositiveInt(req.query.similar_to) ? Number(req.query.similar_to) : null

        if (lifeStages.length) where.add('a.life_stage = ANY($?)', lifeStages)
        if (categoryIds.length) {
            where.add(`EXISTS (SELECT 1 FROM attendee_interests x
                               WHERE x.attendee_id = a.id AND x.category_id = ANY($?))`, categoryIds)
        }

        let sharedCount = '0'
        if (similarTo) {
            const p = where.param(similarTo)
            where.add(`a.id <> ${p}`)
            where.add(`EXISTS (SELECT 1 FROM attendee_interests mine
                               JOIN attendee_interests theirs ON theirs.category_id = mine.category_id
                               WHERE mine.attendee_id = ${p} AND theirs.attendee_id = a.id)`)
            sharedCount = `(SELECT COUNT(*) FROM attendee_interests mine
                            JOIN attendee_interests theirs ON theirs.category_id = mine.category_id
                            WHERE mine.attendee_id = ${p} AND theirs.attendee_id = a.id)::int`
        }

        const results = await pool.query(`
            SELECT a.id, a.name, a.life_stage, a.created_at, ${sharedCount} AS shared_interests, ${INTERESTS_JSON}
            FROM attendees a
            ${INTERESTS_JOIN}
            ${where}
            GROUP BY a.id
            ORDER BY shared_interests DESC, a.name`, where.values)

        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error)
    }
}

// GET /api/attendees/:id -> profile with interests, organized events, and RSVPs
const getAttendeeById = async (req, res) => {
    try {
        const { id } = req.params
        const results = await pool.query(`
            SELECT a.*, ${INTERESTS_JSON}
            FROM attendees a
            ${INTERESTS_JOIN}
            WHERE a.id = $1
            GROUP BY a.id`, [id])
        if (results.rows.length === 0) return res.status(404).json({ error: 'Attendee not found' })

        const [organized, rsvps] = await Promise.all([
            pool.query(`
                SELECT e.*, c.name AS category_name, c.color AS category_color
                FROM events e JOIN categories c ON c.id = e.color_category_id
                WHERE e.organizer_id = $1
                ORDER BY e.date`, [id]),
            pool.query(`
                SELECT r.id, r.status, r.created_at, e.id AS event_id, e.title, e.date, e.location,
                       e.group_size, e.cost, c.name AS category_name, c.color AS category_color
                FROM rsvps r
                JOIN events e ON e.id = r.event_id
                JOIN categories c ON c.id = e.color_category_id
                WHERE r.attendee_id = $1
                ORDER BY e.date`, [id])
        ])

        res.status(200).json({ ...results.rows[0], organized_events: organized.rows, rsvps: rsvps.rows })
    } catch (error) {
        handleError(res, error)
    }
}

// POST /api/attendees  { name, email, life_stage?, interest_ids? }
const createAttendee = async (req, res) => {
    const errors = validateAttendee(req.body)
    if (errors.length) return res.status(400).json({ errors })

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const { name, email, life_stage = null } = req.body
        const result = await client.query(
            'INSERT INTO attendees (name, email, life_stage) VALUES ($1, $2, $3) RETURNING *',
            [name.trim(), email.trim().toLowerCase(), life_stage]
        )
        const attendee = result.rows[0]
        const interestIds = parseIdList(req.body.interest_ids)
        if (interestIds.length) await replaceInterests(client, attendee.id, interestIds)
        await client.query('COMMIT')
        res.status(201).json(attendee)
    } catch (error) {
        await client.query('ROLLBACK')
        handleError(res, error)
    } finally {
        client.release()
    }
}

// PATCH /api/attendees/:id  { name?, email?, life_stage? }
const updateAttendee = async (req, res) => {
    const errors = validateAttendee(req.body, { partial: true })
    if (errors.length) return res.status(400).json({ errors })

    try {
        const { name, email, life_stage } = req.body
        const results = await pool.query(`
            UPDATE attendees SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                life_stage = CASE WHEN $3::boolean THEN $4 ELSE life_stage END
            WHERE id = $5
            RETURNING *`,
            [name?.trim() ?? null, email?.trim().toLowerCase() ?? null,
                life_stage !== undefined, life_stage ?? null, req.params.id])
        if (results.rows.length === 0) return res.status(404).json({ error: 'Attendee not found' })
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error)
    }
}

// DELETE /api/attendees/:id  (also removes their interests, RSVPs, and organized events)
const deleteAttendee = async (req, res) => {
    try {
        const results = await pool.query('DELETE FROM attendees WHERE id = $1 RETURNING *', [req.params.id])
        if (results.rows.length === 0) return res.status(404).json({ error: 'Attendee not found' })
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error)
    }
}

const replaceInterests = async (client, attendeeId, categoryIds) => {
    await client.query('DELETE FROM attendee_interests WHERE attendee_id = $1', [attendeeId])
    if (categoryIds.length) {
        await client.query(`
            INSERT INTO attendee_interests (attendee_id, category_id)
            SELECT $1, UNNEST($2::int[])`, [attendeeId, categoryIds])
    }
}

// GET /api/attendees/:id/interests
const getInterests = async (req, res) => {
    try {
        const results = await pool.query(`
            SELECT c.*, ai.created_at AS picked_at
            FROM attendee_interests ai JOIN categories c ON c.id = ai.category_id
            WHERE ai.attendee_id = $1
            ORDER BY c.name`, [req.params.id])
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error)
    }
}

// PUT /api/attendees/:id/interests  { category_ids: [1, 3] }  (interest color picker saves the full set)
const setInterests = async (req, res) => {
    if (!Array.isArray(req.body.category_ids)) {
        return res.status(400).json({ errors: ['category_ids must be an array of category ids.'] })
    }
    const categoryIds = [...new Set(parseIdList(req.body.category_ids.join(',')))]

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const exists = await client.query('SELECT 1 FROM attendees WHERE id = $1', [req.params.id])
        if (exists.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(404).json({ error: 'Attendee not found' })
        }
        await replaceInterests(client, req.params.id, categoryIds)
        await client.query('COMMIT')

        const results = await pool.query(`
            SELECT c.* FROM attendee_interests ai JOIN categories c ON c.id = ai.category_id
            WHERE ai.attendee_id = $1 ORDER BY c.name`, [req.params.id])
        res.status(200).json(results.rows)
    } catch (error) {
        await client.query('ROLLBACK')
        handleError(res, error)
    } finally {
        client.release()
    }
}

export default {
    getAttendees, getAttendeeById, createAttendee, updateAttendee, deleteAttendee, getInterests, setInterests
}
