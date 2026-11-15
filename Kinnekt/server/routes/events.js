import express from 'express'
import EventsController from '../controllers/events.js'
import RsvpsController from '../controllers/rsvps.js'

const router = express.Router()

router.get('/', EventsController.getEvents)
router.get('/:id', EventsController.getEventById)
router.post('/', EventsController.createEvent)
router.patch('/:id', EventsController.updateEvent)
router.delete('/:id', EventsController.deleteEvent)

router.get('/:eventId/rsvps', RsvpsController.getRsvps)
router.post('/:eventId/rsvps', RsvpsController.upsertRsvp)
router.delete('/:eventId/rsvps/:attendeeId', RsvpsController.deleteRsvp)

export default router
