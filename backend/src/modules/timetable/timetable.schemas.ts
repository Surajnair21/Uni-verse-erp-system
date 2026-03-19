import { z } from 'zod';

export const dayOfWeekSchema = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

export const createTimetableSlotSchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  room: z.string().optional(),
  sectionId: z.string().min(1),
  subjectId: z.string().min(1),
  facultyId: z.string().min(1),
});

export const updateTimetableSlotSchema = createTimetableSlotSchema.partial();
