import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRotes.js'
import adminRouter from './routes/adminRoutes.js'
import performanceRouter from './routes/performance.routes.js'
import certificateRouter from './routes/certificate.routes.js'
import companyRouter from './routes/companyRoutes.js'
import programRouter from './routes/programRoutes.js'
import enrollmentRouter from './routes/enrollmentRoutes.js'
import internRouter from './routes/internRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import mentorRouter from './routes/mentorRoutes.js'
import superAdminRouter from './routes/superAdminRoutes.js'
import userRouter from './routes/userRoutes.js'
import publicChatRouter from './routes/publicChat.routes.js'
import privateChatRouter from './routes/privateChat.routes.js'
import joinRequestRouter from './routes/joinRequestRoutes.js'
import publicUserRouter from './routes/publicUserRouter.js'

const app = express()
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ims-frontend-3pzv.onrender.com"
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userRouter)
app.use('/api/superadmin', superAdminRouter)
app.use('/api/companies', companyRouter)
app.use('/api/programs', programRouter)
app.use('/api/enrollments', enrollmentRouter)
app.use('/api/intern', internRouter)
app.use('/api/mentor', mentorRouter)
app.use('/api/admin', adminRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/public-chat',publicChatRouter)
app.use('/api/private-chat',privateChatRouter)
app.use('/api/auth', authRouter)
app.use('/api/performance', performanceRouter)
app.use('/api/certificate', certificateRouter)
app.use('/api/join-request',joinRequestRouter)
app.use('/api/public-user',publicUserRouter)

export default app;