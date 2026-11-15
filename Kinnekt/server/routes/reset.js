import express from 'express'
import ResetController from '../controllers/reset.js'

const router = express.Router()

router.post('/', ResetController.reset)

export default router
