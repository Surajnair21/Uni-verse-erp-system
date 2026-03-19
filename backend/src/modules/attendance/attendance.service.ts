import { prisma } from "../../prisma/client";

type AttendanceStatusUnion = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

type AttendanceRecordInput = {
  studentId: string;
  status: AttendanceStatusUnion;
};

type MarkSessionInput = {
  date: string;
  sectionId: string;
  subjectId: string;
  timetableSlotId: string;
  records: AttendanceRecordInput[];
};

function normalizeDate(dateStr: string) {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const AttendanceService = {
  /*
  |--------------------------------------------------------------------------
  | Mark Attendance (Faculty / Admin)
  |--------------------------------------------------------------------------
  */
  async markSession(user: any, data: MarkSessionInput) {
    const { date, sectionId, subjectId, timetableSlotId, records } = data;
    const normalizedDate = normalizeDate(date);

    // ✅ Only FACULTY or ADMIN allowed
    if (!["FACULTY", "ADMIN"].includes(user.role)) {
      throw new Error("Not authorized to mark attendance.");
    }

    // ✅ Faculty must be allocated
    if (user.role === "FACULTY") {
      const allocation = await prisma.facultySubjectAllocation.findFirst({
        where: {
          facultyId: user.id,
          sectionId,
          subjectId,
        },
      });

      const slotAllocation = await prisma.timetableSlot.findFirst({
        where: {
          id: timetableSlotId,
          facultyId: user.id,
          sectionId,
          subjectId,
        },
      });

      if (!allocation && !slotAllocation) {
        throw new Error("You are not allocated to this section & subject.");
      }
    }

    // ✅ Validate students belong to section
    const sectionStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        studentProfile: { sectionId },
      },
      select: { id: true },
    });

    const allowedIds = new Set(sectionStudents.map((s) => s.id));

    for (const record of records) {
      if (!allowedIds.has(record.studentId)) {
        throw new Error(`Student ${record.studentId} not in section.`);
      }
    }

    // ✅ Upsert session (unique composite constraint)
    const session = await prisma.attendanceSession.upsert({
      where: {
        date_timetableSlotId: {
          date: normalizedDate,
          timetableSlotId,
        },
      },
      update: {},
      create: {
        date: normalizedDate,
        sectionId,
        subjectId,
        facultyId: user.id,
        timetableSlotId,
      },
    });

    // ✅ Upsert attendance records
    await Promise.all(
      records.map((record) =>
        prisma.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId: session.id,
              studentId: record.studentId,
            },
          },
          update: {
            status: record.status,
          },
          create: {
            sessionId: session.id,
            studentId: record.studentId,
            status: record.status,
          },
        })
      )
    );

    return { message: "Attendance saved successfully." };
  },

  /*
  |--------------------------------------------------------------------------
  | Get Students in Section (Scoped Access)
  |--------------------------------------------------------------------------
  */
  async getSectionStudents(user: any, sectionId: string) {
    // ADMIN can access everything
    if (user.role === "ADMIN") {
      return this.fetchSectionStudents(sectionId);
    }

    // FACULTY must be allocated
    if (user.role === "FACULTY") {
      const allocation = await prisma.facultySubjectAllocation.findFirst({
        where: {
          facultyId: user.id,
          sectionId,
        },
      });

      const slotAllocation = await prisma.timetableSlot.findFirst({
        where: {
          facultyId: user.id,
          sectionId,
        },
      });

      if (!allocation && !slotAllocation) {
        throw new Error("Not authorized for this section.");
      }

      return this.fetchSectionStudents(sectionId);
    }

    // HOD must belong to same department
    if (user.role === "HOD") {
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        select: { departmentId: true },
      });

      if (!section || section.departmentId !== user.departmentId) {
        throw new Error("Not authorized for this department.");
      }

      return this.fetchSectionStudents(sectionId);
    }

    throw new Error("Access denied.");
  },

  /*
  |--------------------------------------------------------------------------
  | Student Attendance Summary (Self Only)
  |--------------------------------------------------------------------------
  */
  async getStudentSummary(user: any) {
    if (user.role !== "STUDENT") {
      throw new Error("Access denied.");
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: user.id },
      include: {
        session: {
          include: { subject: true },
        },
      },
    });

    const summary: Record<string, { total: number; present: number }> = {};

    records.forEach((record) => {
      const subject = record.session.subject.name;

      if (!summary[subject]) {
        summary[subject] = { total: 0, present: 0 };
      }

      summary[subject].total += 1;

      if (
        record.status === "PRESENT" ||
        record.status === "LATE" ||
        record.status === "EXCUSED"
      ) {
        summary[subject].present += 1;
      }
    });

    return Object.entries(summary).map(([subject, data]) => ({
      subject,
      totalSessions: data.total,
      presentCount: data.present,
      percentage:
        data.total === 0
          ? "0.00"
          : ((data.present / data.total) * 100).toFixed(2),
    }));
  },

  /*
  |--------------------------------------------------------------------------
  | Faculty: Get Scheduled Classes For Date
  |--------------------------------------------------------------------------
  */
  async getScheduledClasses(user: any, dateStr: string) {
    if (user.role !== "FACULTY") {
      throw new Error("Only intended for faculty");
    }

    const normalizedDate = normalizeDate(dateStr);
    const dayOfWeekStr = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][normalizedDate.getDay()];

    // Get slots
    const slots = await prisma.timetableSlot.findMany({
      where: {
        facultyId: user.id,
        dayOfWeek: dayOfWeekStr as any,
      },
      include: {
        section: { select: { id: true, name: true, batchYear: true, department: { select: { code: true } } } },
        subject: { select: { id: true, name: true, code: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    // Find matching created sessions
    const sessionPromises = slots.map(async slot => {
      const session = await prisma.attendanceSession.findUnique({
        where: {
          date_timetableSlotId: {
            date: normalizedDate,
            timetableSlotId: slot.id
          }
        }
      });
      return {
        ...slot,
        attendanceStatus: session ? "MARKED" : "PENDING"
      };
    });

    return Promise.all(sessionPromises);
  },

  /*
  |--------------------------------------------------------------------------
  | Internal Helper
  |--------------------------------------------------------------------------
  */
  async fetchSectionStudents(sectionId: string) {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        studentProfile: { sectionId },
      },
      select: {
        id: true,
        name: true,
        email: true,
        studentProfile: {
          select: { rollNo: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      rollNo: s.studentProfile?.rollNo ?? null,
    }));
  },
};