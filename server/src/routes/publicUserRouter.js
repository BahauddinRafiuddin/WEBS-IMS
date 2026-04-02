import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { getAllCompaniesWithPrograms } from '../controllers/publicUser.controller.js'

const publicUserRouter=express.Router()

publicUserRouter.get('/companies',authMiddleware,roleMiddleware("public_user"),getAllCompaniesWithPrograms)

export default publicUserRouter