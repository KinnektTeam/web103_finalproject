import { pool } from '../config/database.js'
import { handleError } from '../utils/helpers.js'

// GET /api/categories -> interest colors for the color picker and event badges
const getCategories = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM categories ORDER BY name')
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error)
    }
}

export default { getCategories }
