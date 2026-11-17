import express from 'express'
import CategoriesController from '../controllers/categories.js'

const router = express.Router()

router.get('/', CategoriesController.getCategories)

export default router
