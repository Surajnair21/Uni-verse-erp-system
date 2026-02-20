import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),

  role: z.enum(["ADMIN", "HOD", "FACULTY", "STUDENT"]),
  departmentId: z.string().optional().nullable(), // for HOD/FACULTY

  // Student-only optional profile
  rollNo: z.string().optional().nullable(),
  batchYear: z.number().int().min(2000).max(2100).optional().nullable(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(["ADMIN", "HOD", "FACULTY", "STUDENT"]).optional(),
});
