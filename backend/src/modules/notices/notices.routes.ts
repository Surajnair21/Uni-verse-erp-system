import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth'
import { can } from '../../middlewares/can'
import { NoticesService } from './notices.service'
import { z } from 'zod'

const router = Router()

const createNoticeSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  audience: z.enum(['ALL', 'FACULTY', 'STUDENT', 'DEPARTMENT']),
  departmentId: z.string().optional()
})

// GET /api/notices
router.get('/', requireAuth, async (req, res) => {
  try {
    const notices = await NoticesService.getNotices(req.user!)
    res.json(notices)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
})

// POST /api/notices (Admin/HOD only)
router.post('/', requireAuth, can('create', 'notices'), async (req, res) => {
  try {
    const data = createNoticeSchema.parse(req.body)
    const notice = await NoticesService.createNotice(req.user!, data)
    res.status(201).json(notice)
  } catch (e: any) {
    res.status(400).json({ message: e.errors || e.message })
  }
})

export { router as noticesRouter }
