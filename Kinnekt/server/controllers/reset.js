import { resetDatabase } from '../config/resetDatabase.js'
import { handleError } from '../utils/helpers.js'

let resetInProgress = false

// POST /api/reset  (non-RESTful action: restores the sample data)
const reset = async (req, res) => {
    if (resetInProgress) return res.status(409).json({ error: 'A reset is already running. Try again in a moment.' })

    resetInProgress = true
    try {
        await resetDatabase()
        res.status(200).json({ message: 'Database reset to its default sample data.' })
    } catch (error) {
        handleError(res, error)
    } finally {
        resetInProgress = false
    }
}

export default { reset }
