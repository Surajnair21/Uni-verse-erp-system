import { Router } from "express";
import { prisma } from "../../prisma/client";
import { requireAuth } from "../../middlewares/auth";
import { can } from "../../middlewares/can";
import { z } from "zod";

export const studentsRouter = Router();
studentsRouter.use(requireAuth);

// Admin: assign student -> section
studentsRouter.put(
  "/:userId/assign-section",
  can("update", "users"),
  async (req: any, res) => {
    const bodySchema = z.object({
      sectionId: z.string().min(1),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    // ✅ FIX: normalize param (string | string[])
    const userIdRaw = req.params.userId as string | string[];
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

    // ensure user is a student
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!u || u.role !== "STUDENT") {
      return res.status(400).json({ message: "User is not a student" });
    }

    // ✅ Prisma will accept sectionId ONLY after you updated schema + ran generate
    const updated = await prisma.studentProfile.upsert({
      where: { userId },
      update: { sectionId: parsed.data.sectionId },
      create: { userId, sectionId: parsed.data.sectionId },
      select: { userId: true, sectionId: true },
    });

    return res.json(updated);
  }
);

// Student: get my profile (section)
studentsRouter.get("/me", can("read", "users"), async (req: any, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      studentProfile: {
        select: {
          rollNo: true,
          batchYear: true,
          sectionId: true, // ✅ will exist after schema update
          section: {
            select: {
              id: true,
              name: true,
              batchYear: true,
              department: { select: { id: true, name: true, code: true } },
              semester: {
                select: {
                  number: true,
                  course: { select: { code: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return res.json(me);
});
