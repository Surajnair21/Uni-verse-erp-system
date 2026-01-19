import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

export type AuthedUser = {
  id: string
  role: 'ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT'
  departmentId?: string | null
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthedUser
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Missing Bearer token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthedUser
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
