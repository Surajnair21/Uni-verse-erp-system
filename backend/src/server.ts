import app from './app'
import { ensureAdmin } from './modules/auth/auth.service'
import 'dotenv/config'

const env = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  PORT: process.env.PORT ?? '3002',
}

;(async () => {
  await ensureAdmin()

  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Backend running on port ${env.PORT}`)
  })
})()
