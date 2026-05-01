import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { authRouter } from './modules/auth/auth.routes'
import { masterRouter } from './modules/master/master.routes'
import { errorHandler, notFound } from './middlewares/errorHandler'
import { usersRouter } from "./modules/users/users.routes";
import { allocationsRouter } from "./modules/allocations/allocations.routes";
import { studentsRouter } from "./modules/students/students.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import { timetableRouter } from './modules/timetable/timetable.routes';
import { iaRouter } from './modules/ia/ia.routes';
import { profileRouter } from './modules/profile/profile.routes';
import { resultsRouter } from './modules/results/results.routes';
import { noticesRouter } from './modules/notices/notices.routes';
import { chatRouter } from './modules/chat/chat.routes';
const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_, res) => {
  res.json({ status: 'OK', service: 'UniVerse Backend' })
})

app.use('/api/auth', authRouter)
app.use('/api/master', masterRouter)
app.use('/api/users', usersRouter)
app.use('/api/allocations', allocationsRouter)
app.use('/api/students', studentsRouter)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/timetable', timetableRouter)
app.use('/api/ia', iaRouter)
app.use('/api/profile', profileRouter)
app.use('/api/results', resultsRouter)
app.use('/api/notices', noticesRouter)
app.use('/api/chat', chatRouter)
app.use(notFound)
app.use(errorHandler)

export default app
