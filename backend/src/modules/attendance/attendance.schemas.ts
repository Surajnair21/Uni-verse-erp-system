import { z } from "zod";

export const createSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sectionId: z.string(),
  subjectId: z.string(),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"])
    })
  )
});

export const analyticsQuerySchema = z.object({
  sectionId: z.string().optional(),
  subjectId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional()
});
