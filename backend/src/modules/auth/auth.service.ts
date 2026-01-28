import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../prisma/client'
import 'dotenv/config'

const env = {
  JWT_SECRET:
    process.env.JWT_SECRET ??
    (() => {
      throw new Error('Missing JWT_SECRET environment variable')
    })(),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_NAME: process.env.ADMIN_NAME ?? 'Admin',
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return null

  const token = jwt.sign(
    { id: user.id, role: user.role, departmentId: user.departmentId ?? null },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    },
  }
}

export async function ensureAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return

  const existing = await prisma.user.findUnique({ where: { email: env.ADMIN_EMAIL } })
  if (existing) return

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10)

  await prisma.user.create({
    data: {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Seeded ADMIN: ${env.ADMIN_EMAIL}`)
}
