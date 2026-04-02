import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { getJoinRequests, getMyRequests, reviewJoinRequest, sendJoinRequest } from '../controllers/joinRequest.controller.js'


const joinRequestRouter = express.Router()

joinRequestRouter.post('/', authMiddleware, roleMiddleware('public_user'), sendJoinRequest)
joinRequestRouter.get('/', authMiddleware,roleMiddleware('admin'), getJoinRequests)
joinRequestRouter.get('/my', authMiddleware,roleMiddleware('public_user'), getMyRequests)
joinRequestRouter.patch('/:id', authMiddleware, roleMiddleware('admin'), reviewJoinRequest)

export default joinRequestRouter