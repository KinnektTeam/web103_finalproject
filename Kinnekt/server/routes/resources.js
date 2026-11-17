import express from 'express'
import ResourcesController from '../controllers/resources.js'

const router = express.Router()

router.get('/', ResourcesController.getResources)
router.get('/:id', ResourcesController.getResourceById)

export const resourceCategoriesRouter = express.Router()
resourceCategoriesRouter.get('/', ResourcesController.getResourceCategories)

export default router
