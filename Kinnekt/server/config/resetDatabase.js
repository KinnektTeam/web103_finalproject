import { pool } from './database.js'
import { categories, attendees, attendeeInterests, events, rsvps, resourceCategories, resources } from '../data/seed.js'

// Tables follow planning/entity_relationship_diagram.md
const createTables = async (db) => {
    await db.query(`
        DROP TABLE IF EXISTS rsvps;
        -- Left over from the removed image-upload feature; dropped so DROP TABLE events can't be blocked by it
        DROP TABLE IF EXISTS event_images;
        DROP TABLE IF EXISTS events;
        DROP TABLE IF EXISTS attendee_interests;
        DROP TABLE IF EXISTS resources;
        DROP TABLE IF EXISTS resource_categories;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS attendees;

        CREATE TABLE attendees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            life_stage VARCHAR(20)
                CHECK (life_stage IN ('new_to_town', 'recent_grad', 'student', 'relocating')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
        );

        CREATE TABLE attendee_interests (
            attendee_id INTEGER NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (attendee_id, category_id)
        );

        CREATE TABLE events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT,
            date TIMESTAMPTZ NOT NULL,
            location VARCHAR(255) NOT NULL,
            color_category_id INTEGER NOT NULL REFERENCES categories(id),
            group_size VARCHAR(20) NOT NULL
                CHECK (group_size IN ('one_on_one', 'small', 'large')),
            cost DECIMAL(8, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
            ticket_url VARCHAR(500),
            organizer_id INTEGER NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE rsvps (
            id SERIAL PRIMARY KEY,
            event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            attendee_id INTEGER NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (event_id, attendee_id)
        );

        CREATE TABLE resource_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );

        CREATE TABLE resources (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            cost_level VARCHAR(10) NOT NULL CHECK (cost_level IN ('free', 'low', 'medium', 'high')),
            resource_category_id INTEGER NOT NULL REFERENCES resource_categories(id) ON DELETE CASCADE
        );
    `)
    console.log('🎉 LocalMeet tables created')
}

// Seed rows reference each other by array position; this maps positions to the real ids
const insertAll = async (db, label, rows, sql, toValues) => {
    const ids = []
    for (const row of rows) {
        const result = await db.query(sql, toValues(row))
        ids.push(result.rows[0]?.id)
    }
    console.log(`✅ seeded ${rows.length} ${label}`)
    return ids
}

const seed = async (db) => {
    const categoryIds = await insertAll(db, 'categories', categories,
        'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING id',
        (c) => [c.name, c.color])

    const attendeeIds = await insertAll(db, 'attendees', attendees,
        'INSERT INTO attendees (name, email, life_stage) VALUES ($1, $2, $3) RETURNING id',
        (a) => [a.name, a.email, a.life_stage])

    await insertAll(db, 'attendee interests', attendeeInterests,
        'INSERT INTO attendee_interests (attendee_id, category_id) VALUES ($1, $2)',
        (i) => [attendeeIds[i.attendee], categoryIds[i.category]])

    const eventIds = await insertAll(db, 'events', events,
        `INSERT INTO events (title, description, date, location, color_category_id, group_size, cost, ticket_url, organizer_id)
         VALUES ($1, $2,
                 (date_trunc('day', NOW() AT TIME ZONE 'America/Los_Angeles')
                    + make_interval(days => $3, hours => $10)) AT TIME ZONE 'America/Los_Angeles',
                 $4, $5, $6, $7, $8, $9) RETURNING id`,
        (e) => [e.title, e.description, e.days_from_now, e.location, categoryIds[e.category],
            e.group_size, e.cost, e.ticket_url ?? null, attendeeIds[e.organizer], e.hour])

    await insertAll(db, 'rsvps', rsvps,
        'INSERT INTO rsvps (event_id, attendee_id, status) VALUES ($1, $2, $3)',
        (r) => [eventIds[r.event], attendeeIds[r.attendee], r.status])

    // Organizers are going to their own events (same rule as POST /api/events)
    await db.query(`
        INSERT INTO rsvps (event_id, attendee_id, status)
        SELECT id, organizer_id, 'going' FROM events
        ON CONFLICT (event_id, attendee_id) DO NOTHING`)

    const resourceCategoryIds = await insertAll(db, 'resource categories', resourceCategories,
        'INSERT INTO resource_categories (name) VALUES ($1) RETURNING id',
        (name) => [name])

    await insertAll(db, 'resources', resources,
        'INSERT INTO resources (name, description, cost_level, resource_category_id) VALUES ($1, $2, $3, $4)',
        (r) => [r.name, r.description, r.cost_level, resourceCategoryIds[r.category]])
}

// Drops, recreates, and seeds every table inside one transaction, so a failure
// leaves the old data in place. Used by `npm run reset` and POST /api/reset.
export const resetDatabase = async () => {
    const db = await pool.connect()
    try {
        await db.query('BEGIN')
        await createTables(db)
        await seed(db)
        await db.query('COMMIT')
    } catch (error) {
        await db.query('ROLLBACK')
        throw error
    } finally {
        db.release()
    }
}
