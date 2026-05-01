import { prisma } from '../../prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const ChatService = {
  async handleChat(user: any, message: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in the backend environment variables.');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 1. Fetch the user's full record (JWT doesn't carry `name`)
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } });
    const studentName = dbUser?.name ?? 'Student';

    // 2. Fetch Student Profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        section: {
          include: {
            department: true,
            semester: true
          }
        }
      }
    });

    if (!profile) {
      throw new Error('Student profile not found.');
    }

    // 3. Fetch Attendance Summary (with per-subject breakdown)
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId: user.id },
      include: {
        session: {
          include: {
            subject: { select: { name: true, code: true } }
          }
        }
      }
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    // Per-subject tracking
    const subjectAttendance: Record<string, { name: string; code: string; present: number; absent: number; late: number; excused: number; total: number }> = {};

    attendanceRecords.forEach(r => {
      if (r.status === 'PRESENT') present++;
      if (r.status === 'ABSENT') absent++;
      if (r.status === 'LATE') late++;
      if (r.status === 'EXCUSED') excused++;

      // Group by subject
      const subCode = r.session?.subject?.code ?? 'UNKNOWN';
      const subName = r.session?.subject?.name ?? 'Unknown Subject';
      if (!subjectAttendance[subCode]) {
        subjectAttendance[subCode] = { name: subName, code: subCode, present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      }
      const entry = subjectAttendance[subCode];
      entry.total++;
      if (r.status === 'PRESENT') entry.present++;
      if (r.status === 'ABSENT') entry.absent++;
      if (r.status === 'LATE') entry.late++;
      if (r.status === 'EXCUSED') entry.excused++;
    });

    const totalSessions = present + absent + late + excused;
    const attendedSessions = present + late + excused;
    const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

    // 4. Fetch IA Marks
    const marks = await prisma.iAMark.findMany({
      where: { studentId: user.id },
      include: {
        component: {
          include: {
            subject: true
          }
        }
      }
    });

    const formattedMarks = marks.map(m => {
      return `${m.component.subject.name} (${m.component.subject.code}) - ${m.component.name}: ${m.marksObtained}/${m.component.maxMarks}`;
    }).join('\n');

    // 5. Construct System Prompt
    const systemPromptText = `You are a helpful and polite academic assistant AI for the Uni-Verse ERP system.
You are currently talking to a student named ${studentName} (Roll No: ${profile.rollNo}).
They are in Section ${profile.section?.name || 'N/A'}, Semester ${profile.section?.semester?.number || 'N/A'}, Department of ${profile.section?.department?.name || 'N/A'}.

Here is their current academic data:

ATTENDANCE SUMMARY:
- Total Sessions: ${totalSessions}
- Present: ${present}
- Absent: ${absent}
- Late: ${late}
- Excused: ${excused}
- Overall Attendance Percentage: ${attendancePercentage}%

PER-SUBJECT ATTENDANCE:
${Object.values(subjectAttendance).map(s => {
  const pct = s.total > 0 ? Math.round(((s.present + s.late + s.excused) / s.total) * 100) : 0;
  return `- ${s.name} (${s.code}): ${s.present + s.late + s.excused}/${s.total} sessions attended (${pct}%)`;
}).join('\n') || 'No subject-wise attendance data available.'}

INTERNAL ASSESSMENT (IA) MARKS:
${formattedMarks ? formattedMarks : 'No IA marks recorded yet.'}

IMPORTANT RULES:
1. ONLY answer questions based on the data provided above.
2. DO NOT make up any data, grades, or attendance records.
3. If the student asks about information not provided here (e.g., timetable, fee details, other students' data), politely explain that you only have access to their personal attendance and IA marks at this moment.
4. ABSOLUTELY DO NOT provide information about any other student. If asked about another student, refuse politely.
5. Keep your answers concise, clear, and encouraging.`;

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: {
          role: 'user',
          parts: [{ text: systemPromptText }],
        },
      });

      const chat = model.startChat();
      const result = await chat.sendMessage(message);
      return { reply: result.response.text() };
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to communicate with AI service.");
    }
  }
};
