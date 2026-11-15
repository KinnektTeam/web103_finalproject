// Allowed values, matching the CHECK constraints in config/reset.js
export const LIFE_STAGES = ['new_to_town', 'recent_grad', 'student', 'relocating']
export const GROUP_SIZES = ['one_on_one', 'small', 'large']
export const RSVP_STATUSES = ['going', 'maybe', 'not_going']
export const COST_LEVELS = ['free', 'low', 'medium', 'high']

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (email) => typeof email === 'string' && EMAIL_PATTERN.test(email)

export const isPositiveInt = (value) => Number.isInteger(Number(value)) && Number(value) > 0

// "1,2,3" or ["1","2"] -> [1, 2, 3]; drops anything that isn't a positive integer
export const parseIdList = (value) =>
    String(value ?? '')
        .split(',')
        .map((part) => Number(part.trim()))
        .filter((n) => Number.isInteger(n) && n > 0)

// "small,large" -> ['small', 'large'], keeping only values in `allowed`
export const parseEnumList = (value, allowed) =>
    String(value ?? '')
        .split(',')
        .map((part) => part.trim())
        .filter((part) => allowed.includes(part))

// Collects WHERE clauses with numbered placeholders: where.add('x = $?', value)
export const whereBuilder = (values = []) => {
    const clauses = []
    return {
        values,
        add(sql, ...params) {
            let sqlWithIndexes = sql
            for (const param of params) {
                values.push(param)
                sqlWithIndexes = sqlWithIndexes.replace('$?', () => `$${values.length}`)
            }
            clauses.push(sqlWithIndexes)
        },
        param(value) {
            values.push(value)
            return `$${values.length}`
        },
        toString() {
            return clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
        }
    }
}

// Sends a consistent error response; maps common Postgres errors to 4xx codes
export const handleError = (res, error) => {
    if (error.code === '23505') return res.status(409).json({ error: 'That record already exists.', detail: error.detail })
    if (error.code === '23503') return res.status(400).json({ error: 'A referenced record does not exist.', detail: error.detail })
    if (error.code === '23514' || error.code === '22P02' || error.code === '22007' || error.code === '22008') {
        return res.status(400).json({ error: 'Invalid value.', detail: error.message })
    }
    console.error(error)
    res.status(500).json({ error: error.message })
}
