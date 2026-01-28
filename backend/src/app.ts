import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { authRouter } from './modules/auth/auth.routes'
import { masterRouter } from './modules/master/master.routes'
import { errorHandler, notFound } from './middlewares/errorHandler'

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

app.use(notFound)
app.use(errorHandler)

export default app
