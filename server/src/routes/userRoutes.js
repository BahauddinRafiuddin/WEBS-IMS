import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { changePassword, getMe, getMyProfile } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get('/profile', authMiddleware, getMyProfile)
userRouter.put('/update-pass', authMiddleware, changePassword)
userRouter.get('/me',authMiddleware,getMe)
export default userRouter