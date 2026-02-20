import { Router } from "express";
import { prisma } from "../../prisma/client";
import { requireAuth } from "../../middlewares/auth";
import { can } from "../../middlewares/can";
import { createAllocationSchema } from "./allocations.schemas";

export const allocationsRouter = Router();
allocationsRouter.use(requireAuth);

// Create allocation (Admin only)
allocationsRouter.post("/", can("create", "allocations"), async (req, res) => {
  const parsed = createAllocationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const created = await prisma.facultySubjectAllocation.create({
    data: parsed.data,
  });

  res.status(201).json(created);
});

// List allocations (scoped by role)
allocationsRouter.get("/", can("read", "allocations"), async (req: any, res) => {
  const user = req.user; // from JWT payload
  const role = user.role;

  // ADMIN: all
  let where: any = {};

  // FACULTY: only their allocations
  if (role === "FACULTY") {
    where = { facultyId: user.id };
  }

  // HOD: only their department allocations
  if (role === "HOD") {
    if (!user.departmentId) {
      return res.json([]); // no dept assigned => nothing visible
    }
    where = {
      section: {
        departmentId: user.departmentId,
      },
    };
  }
  // STUDENT: only allocations for their section
if (role === "STUDENT") {
  const sp = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    select: { sectionId: true },
  });

  if (!sp?.sectionId) {
    return res.json([]); // not linked yet
  }

  where = {
    sectionId: sp.sectionId,
  };
}

  const data = await prisma.facultySubjectAllocation.findMany({
    where,
    include: {
      faculty: { select: { id: true, name: true, email: true, role: true } },
      subject: { select: { id: true, name: true, code: true, credits: true } },
      section: {
        select: {
          id: true,
          name: true,
          batchYear: true,
          department: { select: { id: true, name: true, code: true } },
          semester: {
            select: {
              id: true,
              number: true,
              course: { select: { id: true, name: true, code: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(data);
});


// Delete allocation (Admin)
allocationsRouter.delete("/:id", can("delete", "allocations"), async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await prisma.facultySubjectAllocation.delete({ where: { id } });
  res.status(204).send();
});
