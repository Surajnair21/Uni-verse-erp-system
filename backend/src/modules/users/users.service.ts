import bcrypt from "bcryptjs";
import { prisma } from "../../prisma/client";

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "HOD" | "FACULTY" | "STUDENT";
  departmentId?: string | null;
  rollNo?: string | null;
  batchYear?: number | null;
};

export async function createUser(input: CreateUserInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      departmentId: input.departmentId ?? null,

      studentProfile:
        input.role === "STUDENT"
          ? {
              create: {
                rollNo: input.rollNo ?? null,
                batchYear: input.batchYear ?? null,
              },
            }
          : undefined,

      facultyProfile:
        input.role === "FACULTY"
          ? {
              create: {},
            }
          : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      createdAt: true,
    },
  });

  return user;
}

export async function listUsers(role?: "ADMIN" | "HOD" | "FACULTY" | "STUDENT") {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      department: { select: { id: true, name: true, code: true } },
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
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
