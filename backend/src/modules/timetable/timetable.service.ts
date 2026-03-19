import { prisma } from '../../prisma/client';
import { Prisma } from '../../../generated/prisma/client';

export const TimetableService = {
    async createSlot(data: any) {
        return prisma.timetableSlot.create({
            data,
        });
    },

    async updateSlot(id: string, data: any) {
        return prisma.timetableSlot.update({
            where: { id },
            data,
        });
    },

    async deleteSlot(id: string) {
        return prisma.timetableSlot.delete({
            where: { id },
        });
    },

    async listSlots(user: any, filterSectionId?: string) {
        let where: Prisma.TimetableSlotWhereInput = {};

        // If explicitly requested by an ADMIN (or HOD for their dept), filter by section
        if (filterSectionId) {
            where.sectionId = filterSectionId;
        }

        // Faculty only sees their slots
        if (user.role === 'FACULTY') {
            where = { facultyId: user.id };
        }

        // Student only sees their section's slots
        if (user.role === 'STUDENT') {
            const profile = await prisma.studentProfile.findUnique({
                where: { userId: user.id },
                select: { sectionId: true },
            });
            if (!profile?.sectionId) return [];
            where = { sectionId: profile.sectionId };
        }

        // HOD sees slots for their department
        if (user.role === 'HOD') {
            if (!user.departmentId) return [];

            // if they didn't explicitly filter by a section, force department scope
            if (!where.sectionId) {
                where.section = {
                    departmentId: user.departmentId,
                };
            }
        }

        return prisma.timetableSlot.findMany({
            where,
            include: {
                subject: { select: { id: true, name: true, code: true } },
                section: { select: { id: true, name: true, batchYear: true } },
                faculty: { select: { id: true, name: true } },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' },
            ],
        });
    },
};
