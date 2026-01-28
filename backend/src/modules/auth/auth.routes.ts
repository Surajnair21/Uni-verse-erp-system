import { Router } from 'express'
import { loginSchema } from './auth.schemas'
import { login } from './auth.service'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })
  }

  const result = await login(parsed.data.email, parsed.data.password)
  if (!result) return res.status(401).json({ message: 'Invalid credentials' })

  res.json(result)
})
