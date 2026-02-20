import { z } from "zod";

export const createAllocationSchema = z.object({
  facultyId: z.string().min(1),
  subjectId: z.string().min(1),
  sectionId: z.string().min(1),
});
