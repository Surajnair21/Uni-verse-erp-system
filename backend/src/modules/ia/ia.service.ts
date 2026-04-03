import { prisma } from '../../prisma/client';

export const IAService = {

  // ── Faculty/Admin: Create an IA Component ──────────────────────────────
  async createComponent(user: any, data: {
    name: string; type: any; maxMarks: number; weightage?: number;
    subjectId: string; sectionId: string;
  }) {
    // Verify faculty is allocated or has a timetable slot for this section+subject
    if (user.role === 'FACULTY') {
      const allocation = await prisma.facultySubjectAllocation.findFirst({
        where: { facultyId: user.id, sectionId: data.sectionId, subjectId: data.subjectId },
      });
      const slot = await prisma.timetableSlot.findFirst({
        where: { facultyId: user.id, sectionId: data.sectionId, subjectId: data.subjectId },
      });
      if (!allocation && !slot) throw new Error('Not authorized for this section & subject.');
    }

    return prisma.iAComponent.create({
      data: {
        name:      data.name,
        type:      data.type,
        maxMarks:  data.maxMarks,
        weightage: data.weightage,
        subjectId: data.subjectId,
        sectionId: data.sectionId,
        facultyId: user.id,
      },
      include: { subject: true, section: true },
    });
  },

  // ── List Components (scoped by role) ───────────────────────────────────
  async listComponents(user: any, filters: { sectionId?: string; subjectId?: string }) {
    const where: any = {};

    if (filters.sectionId) where.sectionId = filters.sectionId;
    if (filters.subjectId) where.subjectId = filters.subjectId;

    if (user.role === 'FACULTY') {
      where.facultyId = user.id;
    }

    if (user.role === 'STUDENT') {
      // Get student's section
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        select: { sectionId: true },
      });
      if (!profile?.sectionId) return [];
      where.sectionId = profile.sectionId;
    }

    return prisma.iAComponent.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true, batchYear: true } },
        faculty: { select: { id: true, name: true } },
        marks:   { select: { id: true, studentId: true, marksObtained: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ── Get a Single Component by ID ───────────────────────────────────────
  async getComponent(user: any, componentId: string) {
    const component = await prisma.iAComponent.findUnique({
      where: { id: componentId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true, batchYear: true } },
        faculty: { select: { id: true, name: true } },
        marks:   { select: { id: true, studentId: true, marksObtained: true } },
      },
    });
    if (!component) return null;
    // Students can only see components for their own section
    if (user.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id }, select: { sectionId: true } });
      if (profile?.sectionId !== component.sectionId) throw new Error('Access denied.');
    }
    return component;
  },

  // ── Faculty/Admin: Delete a Component ─────────────────────────────────
  async deleteComponent(user: any, componentId: string) {
    const component = await prisma.iAComponent.findUnique({ where: { id: componentId } });
    if (!component) throw new Error('Component not found.');
    if (user.role === 'FACULTY' && component.facultyId !== user.id) {
      throw new Error('Not authorized to delete this component.');
    }
    return prisma.iAComponent.delete({ where: { id: componentId } });
  },

  // ── Faculty/Admin: Upsert Marks for a Component ───────────────────────
  async upsertMarks(user: any, componentId: string, marks: Array<{ studentId: string; marksObtained: number }>) {
    const component = await prisma.iAComponent.findUnique({ where: { id: componentId } });
    if (!component) throw new Error('Component not found.');
    if (user.role === 'FACULTY' && component.facultyId !== user.id) {
      throw new Error('Not authorized to enter marks for this component.');
    }

    // Validate marksObtained <= maxMarks for each entry
    for (const m of marks) {
      if (m.marksObtained > component.maxMarks) {
        throw new Error(`Marks ${m.marksObtained} exceed max marks ${component.maxMarks}.`);
      }
    }

    const ops = marks.map(m =>
      prisma.iAMark.upsert({
        where: { componentId_studentId: { componentId, studentId: m.studentId } },
        update: { marksObtained: m.marksObtained },
        create: { componentId, studentId: m.studentId, marksObtained: m.marksObtained },
      })
    );

    await prisma.$transaction(ops);
    return { message: 'Marks saved successfully.' };
  },

  // ── Student: View own marks (grouped by subject) ───────────────────────
  async getMyMarks(user: any) {
    if (user.role !== 'STUDENT') throw new Error('Access denied.');

    const marks = await prisma.iAMark.findMany({
      where: { studentId: user.id },
      include: {
        component: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
          },
        },
      },
      orderBy: { component: { createdAt: 'asc' } },
    });

    // Group by subject
    const grouped: Record<string, { subject: any; components: any[] }> = {};
    for (const mark of marks) {
      const subjectId = mark.component.subjectId;
      if (!grouped[subjectId]) {
        grouped[subjectId] = { subject: mark.component.subject, components: [] };
      }
      grouped[subjectId].components.push({
        id:            mark.component.id,
        name:          mark.component.name,
        type:          mark.component.type,
        maxMarks:      mark.component.maxMarks,
        marksObtained: mark.marksObtained,
        percentage:    ((mark.marksObtained / mark.component.maxMarks) * 100).toFixed(1),
      });
    }

    return Object.values(grouped);
  },
};
