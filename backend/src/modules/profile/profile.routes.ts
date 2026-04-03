import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { prisma } from '../../prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const profileRouter = Router();
profileRouter.use(requireAuth);

// GET /api/profile/me — full profile for the logged-in user (all roles)
profileRouter.get('/me', async (req: any, res) => {
  const user = req.user;

  const base = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      department: { select: { id: true, name: true, code: true } },
      studentProfile: {
        select: {
          rollNo: true, batchYear: true, sectionId: true,
          section: {
            select: {
              id: true, name: true, batchYear: true,
              department: { select: { id: true, name: true, code: true } },
              semester: {
                select: {
                  number: true,
                  course: { select: { id: true, name: true, code: true } },
                },
              },
            },
          },
        },
      },
      facultyProfile: {
        select: { employeeId: true },
      },
    },
  });

  if (!base) return res.status(404).json({ message: 'User not found.' });
  res.json(base);
});

// PUT /api/profile/password — change own password
const pwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

profileRouter.put('/password', async (req: any, res) => {
  const parsed = pwSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ message: 'Password changed successfully.' });
});
