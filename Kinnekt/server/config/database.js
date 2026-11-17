import pg from 'pg'
import './dotenv.js'

// pg returns NUMERIC columns (events.cost) as strings by default; parse them as numbers
pg.types.setTypeParser(1700, (value) => parseFloat(value))

const isLocalHost = (host = '') => ['localhost', '127.0.0.1', '::1'].includes(host.trim())

const config = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    // Hosted databases (e.g. Render) need SSL; a local Postgres usually doesn't support it
    ssl: isLocalHost(process.env.PGHOST) ? false : { rejectUnauthorized: false },
    // Fail a request after 10s instead of hanging if the database can't be reached
    connectionTimeoutMillis: 10000,
    // Close idle connections ourselves before the hosted database drops them
    idleTimeoutMillis: 30000,
    keepAlive: true
}

export const pool = new pg.Pool(config)

// Render closes idle connections. pg reports that as an 'error' event on the pool,
// and an unhandled 'error' event crashes Node. Log it instead; the pool replaces
// the broken connection automatically on the next query.
pool.on('error', (error) => {
    console.error('⚠️ idle database connection closed:', error.message)
})
