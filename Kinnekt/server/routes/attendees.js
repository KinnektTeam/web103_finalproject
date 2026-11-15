import express from 'express'
import AttendeesController from '../controllers/attendees.js'

const router = express.Router()

router.get('/', AttendeesController.getAttendees)
router.get('/:id', AttendeesController.getAttendeeById)
router.post('/', AttendeesController.createAttendee)
router.patch('/:id', AttendeesController.updateAttendee)
router.delete('/:id', AttendeesController.deleteAttendee)

router.get('/:id/interests', AttendeesController.getInterests)
router.put('/:id/interests', AttendeesController.setInterests)

export default router
