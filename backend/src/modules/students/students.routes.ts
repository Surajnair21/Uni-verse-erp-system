import { Router } from "express";
import { prisma } from "../../prisma/client";
import { requireAuth } from "../../middlewares/auth";
import { can } from "../../middlewares/can";
import { z } from "zod";

export const studentsRouter = Router();
studentsRouter.use(requireAuth);

/*
|--------------------------------------------------------------------------
| Admin: assign student -> section
|--------------------------------------------------------------------------
*/
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

    const userIdRaw = req.params.userId as string | string[];
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

    // Ensure user exists and is student
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "STUDENT") {
      return res.status(400).json({ message: "User is not a student" });
    }

    const updated = await prisma.studentProfile.upsert({
      where: { userId },
      update: { sectionId: parsed.data.sectionId },
      create: { userId, sectionId: parsed.data.sectionId },
      select: { userId: true, sectionId: true },
    });

    return res.json(updated);
  }
);

/*
|--------------------------------------------------------------------------
| Student: get my own profile
|--------------------------------------------------------------------------
*/
studentsRouter.get("/me", async (req: any, res) => {
  // Only students should access this route
  if (req.user.role !== "STUDENT") {
    return res.status(403).json({ message: "Access denied" });
  }

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
          sectionId: true,
          section: {
            select: {
              id: true,
              name: true,
              batchYear: true,
              department: {
                select: { id: true, name: true, code: true },
              },
              semester: {
                select: {
                  number: true,
                  course: {
                    select: { code: true, name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!me) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(me);
});