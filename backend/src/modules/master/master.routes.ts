import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../prisma/client'
import { requireAuth } from '../../middlewares/auth'
import { can } from '../../middlewares/can'

export const masterRouter = Router()

// All master routes require auth
masterRouter.use(requireAuth)

// -------- Departments --------
const deptSchema = z.object({ name: z.string().min(2), code: z.string().min(2) })

masterRouter.get('/departments', can('read', 'departments'), async (_req, res) => {
  const data = await prisma.department.findMany({ orderBy: { name: 'asc' } })
  res.json(data)
})

masterRouter.post('/departments', can('create', 'departments'), async (req, res) => {
  const parsed = deptSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const created = await prisma.department.create({ data: parsed.data })
  res.status(201).json(created)
})

masterRouter.put('/departments/:id', can('update', 'departments'), async (req, res) => {
  const parsed = deptSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const updated = await prisma.department.update({ where: { id: req.params.id as string }, data: parsed.data })
  res.json(updated)
})

masterRouter.delete('/departments/:id', can('delete', 'departments'), async (req, res) => {
  await prisma.department.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})

// -------- Programs --------
const programSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  departmentId: z.string().min(1),
})

masterRouter.get('/programs', can('read', 'programs'), async (_req, res) => {
  const data = await prisma.program.findMany({
    include: { department: true },
    orderBy: { name: 'asc' },
  })
  res.json(data)
})

masterRouter.post('/programs', can('create', 'programs'), async (req, res) => {
  const parsed = programSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const created = await prisma.program.create({ data: parsed.data })
  res.status(201).json(created)
})

masterRouter.put('/programs/:id', can('update', 'programs'), async (req, res) => {
  const parsed = programSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const updated = await prisma.program.update({ where: { id: req.params.id as string }, data: parsed.data })
  res.json(updated)
})

masterRouter.delete('/programs/:id', can('delete', 'programs'), async (req, res) => {
  await prisma.program.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})

// -------- Courses --------
const courseSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  programId: z.string().min(1),
})

masterRouter.get('/courses', can('read', 'courses'), async (_req, res) => {
  const data = await prisma.course.findMany({
    include: { program: { include: { department: true } } },
    orderBy: { name: 'asc' },
  })
  res.json(data)
})

masterRouter.post('/courses', can('create', 'courses'), async (req, res) => {
  const parsed = courseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const created = await prisma.course.create({ data: parsed.data })
  res.status(201).json(created)
})

masterRouter.put('/courses/:id', can('update', 'courses'), async (req, res) => {
  const parsed = courseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const updated = await prisma.course.update({ where: { id: req.params.id as string }, data: parsed.data })
  res.json(updated)
})

masterRouter.delete('/courses/:id', can('delete', 'courses'), async (req, res) => {
  await prisma.course.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})

// -------- Subjects --------
const subjectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  credits: z.number().int().min(1).max(10),
  departmentId: z.string().min(1),
})

masterRouter.get('/subjects', can('read', 'subjects'), async (_req, res) => {
  const data = await prisma.subject.findMany({
    include: { department: true },
    orderBy: { name: 'asc' },
  })
  res.json(data)
})

masterRouter.post('/subjects', can('create', 'subjects'), async (req, res) => {
  const parsed = subjectSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const created = await prisma.subject.create({ data: parsed.data })
  res.status(201).json(created)
})

masterRouter.put('/subjects/:id', can('update', 'subjects'), async (req, res) => {
  const parsed = subjectSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const updated = await prisma.subject.update({ where: { id: req.params.id as string }, data: parsed.data })
  res.json(updated)
})

masterRouter.delete('/subjects/:id', can('delete', 'subjects'), async (req, res) => {
  await prisma.subject.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})

// -------- Semesters --------
const semesterSchema = z.object({
  number: z.number().int().min(1).max(12),
  courseId: z.string().min(1),
})

masterRouter.get('/semesters', can('read', 'semesters'), async (_req, res) => {
  const data = await prisma.semester.findMany({
    include: { course: { include: { program: true } } },
    orderBy: [{ courseId: 'asc' }, { number: 'asc' }],
  })
  res.json(data)
})

masterRouter.post('/semesters', can('create', 'semesters'), async (req, res) => {
  const parsed = semesterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const created = await prisma.semester.create({ data: parsed.data })
  res.status(201).json(created)
})

masterRouter.put('/semesters/:id', can('update', 'semesters'), async (req, res) => {
  const parsed = semesterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const updated = await prisma.semester.update({ where: { id: req.params.id as string }, data: parsed.data })
  res.json(updated)
})

masterRouter.delete('/semesters/:id', can('delete', 'semesters'), async (req, res) => {
  await prisma.semester.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})

// -------- Sections --------
const sectionSchema = z.object({
  name: z.string().min(1).max(10),
  batchYear: z.number().int().min(2000).max(2100),
  departmentId: z.string().min(1),
  semesterId: z.string().min(1),
})

masterRouter.get('/sections', can('read', 'sections'), async (_req, res) => {
  const data = await prisma.section.findMany({
    include: {
      department: true,
      semester: { include: { course: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(data)
})

masterRouter.post('/sections', can('create', 'sections'), async (req, res) => {
  const parsed = sectionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const created = await prisma.section.create({ data: parsed.data })
  res.status(201).json(created)
})

masterRouter.put('/sections/:id', can('update', 'sections'), async (req, res) => {
  const parsed = sectionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() })

  const updated = await prisma.section.update({ where: { id: req.params.id as string }, data: parsed.data })
  res.json(updated)
})

masterRouter.delete('/sections/:id', can('delete', 'sections'), async (req, res) => {
  await prisma.section.delete({ where: { id: req.params.id as string } })
  res.status(204).send()
})
