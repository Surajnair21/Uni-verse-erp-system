import { z } from 'zod';

export const createComponentSchema = z.object({
  name:       z.string().min(1),
  type:       z.enum(['QUIZ', 'ASSIGNMENT', 'MIDTERM', 'PROJECT', 'PRACTICAL']),
  maxMarks:   z.number().positive(),
  weightage:  z.number().min(0).max(100).optional(),
  subjectId:  z.string().cuid(),
  sectionId:  z.string().cuid(),
});

export const upsertMarksSchema = z.object({
  marks: z.array(z.object({
    studentId:    z.string().cuid(),
    marksObtained: z.number().min(0),
  })).min(1),
});
