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
  records: AttendanceRecordInput[];
};

function normalizeDate(dateStr: string) {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const AttendanceService = {
  async markSession(userId: string, data: MarkSessionInput) {
    const { date, sectionId, subjectId, records } = data;
    const normalizedDate = normalizeDate(date);

    // 🔐 Check allocation
    const allocation = await prisma.facultySubjectAllocation.findFirst({
      where: {
        facultyId: userId,
        sectionId,
        subjectId
      }
    });

    if (!allocation) {
      throw new Error("You are not allocated to this section & subject.");
    }

    // Validate students belong to this section
    const enrolledStudents = await prisma.enrollment.findMany({
      where: { sectionId },
      select: { studentId: true }
    });

    const enrolledIds = enrolledStudents.map(s => s.studentId);

    for (const record of records) {
      if (!enrolledIds.includes(record.studentId)) {
        throw new Error(`Student ${record.studentId} not in section.`);
      }
    }

    // Upsert session
    const session = await prisma.attendanceSession.upsert({
      where: {
        date_sectionId_subjectId: {
          date: normalizedDate,
          sectionId,
          subjectId
        }
      },
      update: {},
      create: {
        date: normalizedDate,
        sectionId,
        subjectId,
        facultyId: userId
      }
    });

    // Upsert records
    await Promise.all(
      records.map((record: AttendanceRecordInput) =>
        prisma.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId: session.id,
              studentId: record.studentId
            }
          },
          update: {
            status: record.status as any
          },
          create: {
            sessionId: session.id,
            studentId: record.studentId,
            status: record.status as any
          }
        })
      )
    );

    return { message: "Attendance saved successfully." };
  },

  async getSectionStudents(sectionId: string) {
    const students = await prisma.enrollment.findMany({
      where: { sectionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return students.map(s => s.student);
  },

  async getStudentSummary(studentId: string) {
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        session: {
          include: {
            subject: true
          }
        }
      }
    });

    const summary: Record<string, any> = {};

    records.forEach(record => {
      const subject = record.session.subject.name;

      if (!summary[subject]) {
        summary[subject] = {
          total: 0,
          present: 0
        };
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

    return Object.entries(summary).map(([subject, data]: any) => ({
      subject,
      totalSessions: data.total,
      presentCount: data.present,
      percentage: ((data.present / data.total) * 100).toFixed(2)
    }));
  }
};
