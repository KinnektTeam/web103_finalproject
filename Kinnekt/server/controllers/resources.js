import { pool } from '../config/database.js'
import { COST_LEVELS, parseIdList, parseEnumList, whereBuilder, handleError } from '../utils/helpers.js'

// Sort free -> low -> medium -> high instead of alphabetically
const COST_ORDER = `array_position(ARRAY['free', 'low', 'medium', 'high']::varchar[], r.cost_level)`

const RESOURCE_SELECT = `
    SELECT r.*, rc.name AS category_name
    FROM resources r
    JOIN resource_categories rc ON rc.id = r.resource_category_id`

// GET /api/resource-categories
const getResourceCategories = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM resource_categories ORDER BY name')
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error)
    }
}

// GET /api/resources  (Resource finder)
//   ?category_id=1,4          filter by resource category
//   ?cost_level=free,low      filter by cost level
//   ?sort=cheapest            cheapest first (default sorts by category, then name)
const getResources = async (req, res) => {
    try {
        const where = whereBuilder()
        const categoryIds = parseIdList(req.query.category_id)
        const costLevels = parseEnumList(req.query.cost_level, COST_LEVELS)

        if (categoryIds.length) where.add('r.resource_category_id = ANY($?)', categoryIds)
        if (costLevels.length) where.add('r.cost_level = ANY($?)', costLevels)

        const orderBy = req.query.sort === 'cheapest'
            ? `${COST_ORDER}, r.name`
            : `rc.name, r.name`

        const results = await pool.query(`${RESOURCE_SELECT} ${where} ORDER BY ${orderBy}`, where.values)
        res.status(200).json(results.rows)
    } catch (error) {
        handleError(res, error)
    }
}

// GET /api/resources/:id
const getResourceById = async (req, res) => {
    try {
        const results = await pool.query(`${RESOURCE_SELECT} WHERE r.id = $1`, [req.params.id])
        if (results.rows.length === 0) return res.status(404).json({ error: 'Resource not found' })
        res.status(200).json(results.rows[0])
    } catch (error) {
        handleError(res, error)
    }
}

export default { getResourceCategories, getResources, getResourceById }
