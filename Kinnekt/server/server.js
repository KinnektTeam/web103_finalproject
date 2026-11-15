import './config/dotenv.js'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import categoriesRouter from './routes/categories.js'
import attendeesRouter from './routes/attendees.js'
import eventsRouter from './routes/events.js'
import resourcesRouter, { resourceCategoriesRouter } from './routes/resources.js'
import resetRouter from './routes/reset.js'

const PORT = process.env.PORT || 3000
const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url))
const API_INDEX = path.join(SERVER_DIR, 'index.html')
const CLIENT_BUILD = path.join(SERVER_DIR, 'public')

const app = express()

app.use(express.json())

// API routes
app.use('/api/categories', categoriesRouter)
app.use('/api/attendees', attendeesRouter)
app.use('/api/events', eventsRouter)
app.use('/api/resources', resourcesRouter)
app.use('/api/resource-categories', resourceCategoriesRouter)
app.use('/api/reset', resetRouter)

// API overview page (server/index.html)
app.get('/api', (_, res) => res.sendFile(API_INDEX))

// any other /api path is a 404, not the React app
app.use('/api', (_, res) => res.status(404).json({ error: 'API route not found' }))

// Body errors -> JSON instead of an HTML error page
app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' })
    next(error)
})

// Log unexpected async errors instead of letting them stop the server
process.on('unhandledRejection', (error) => {
    console.error('⚠️ unhandled promise rejection:', error)
})

if (process.env.NODE_ENV === 'production') {
    // Serve the built React app (vite builds into server/public)
    app.use(express.static(CLIENT_BUILD))
    app.get('*', (_, res) => res.sendFile(path.join(CLIENT_BUILD, 'index.html')))
} else {
    // In development the React app runs on Vite, so show the API overview here
    app.get('/', (_, res) => res.sendFile(API_INDEX))
}

app.listen(PORT, () => {
    console.log(`🚀 LocalMeet server listening on http://localhost:${PORT}`)
})
