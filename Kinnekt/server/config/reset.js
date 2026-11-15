// CLI entry point: `npm run reset`
import { pool } from './database.js'
import { resetDatabase } from './resetDatabase.js'

try {
    await resetDatabase()
    console.log('🌱 database reset complete')
} catch (error) {
    console.error('⚠️ error resetting database', error)
    process.exitCode = 1
} finally {
    await pool.end()
}
