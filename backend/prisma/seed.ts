import bcrypt from "bcryptjs";
import { PrismaClient, NoticeAudience } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { ResultsService } from "../src/modules/results/results.service";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "Password@123";
const BATCH_YEAR = Number(process.env.SEED_BATCH_YEAR ?? 2025);

async function main() {
  console.log("🌱 Starting Full Ecosystem Seed...");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // 1. CLEAR EXISTING DATA 🗑️
  console.log("🗑️ Clearing old data...");
  await prisma.subjectResult.deleteMany();
  await prisma.semesterResult.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.iAMark.deleteMany();
  await prisma.iAComponent.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.facultySubjectAllocation.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  // Keep admin if exists, or just wipe all to rebuild
  await prisma.user.deleteMany({ where: { role: { not: "ADMIN" } } });
  
  await prisma.section.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.course.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();

  // Create Admin if not exists
  let adminUser = await prisma.user.findUnique({ where: { email: "admin@universe.edu" } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: { name: "System Admin", email: "admin@universe.edu", passwordHash, role: "ADMIN" }
    });
  }

  // 2. ACADEMIC STRUCTURE 🏫
  console.log("🏫 Building Academic Structure...");
  const cse = await prisma.department.create({ data: { name: "Computer Science", code: "CSE" } });
  const it = await prisma.department.create({ data: { name: "Information Technology", code: "IT" } });

  const btechCse = await prisma.program.create({ data: { name: "B.Tech CSE", code: "BTECH_CSE", departmentId: cse.id } });
  const btechIt = await prisma.program.create({ data: { name: "B.Tech IT", code: "BTECH_IT", departmentId: it.id } });

  const courseCse = await prisma.course.create({ data: { name: "B.Tech CSE Core", code: "CSE_CORE", programId: btechCse.id } });
  const courseIt = await prisma.course.create({ data: { name: "B.Tech IT Core", code: "IT_CORE", programId: btechIt.id } });

  // Semesters (Sem 3, Sem 5)
  const cseS3 = await prisma.semester.create({ data: { courseId: courseCse.id, number: 3 } });
  const cseS5 = await prisma.semester.create({ data: { courseId: courseCse.id, number: 5 } });
  const itS3 = await prisma.semester.create({ data: { courseId: courseIt.id, number: 3 } });

  // Sections: CSE-3A, CSE-5A, IT-3A
  const secCse3A = await prisma.section.create({ data: { name: "3A", batchYear: BATCH_YEAR, departmentId: cse.id, semesterId: cseS3.id } });
  const secCse5A = await prisma.section.create({ data: { name: "5A", batchYear: BATCH_YEAR - 1, departmentId: cse.id, semesterId: cseS5.id } });
  const secIt3A = await prisma.section.create({ data: { name: "3A", batchYear: BATCH_YEAR, departmentId: it.id, semesterId: itS3.id } });

  // Subjects
  const subjCse3 = await Promise.all([
    prisma.subject.create({ data: { name: "Data Structures", code: "DSA", credits: 4, departmentId: cse.id } }),
    prisma.subject.create({ data: { name: "Database Systems", code: "DBMS", credits: 4, departmentId: cse.id } }),
  ]);
  const subjCse5 = await Promise.all([
    prisma.subject.create({ data: { name: "Operating Systems", code: "OS", credits: 4, departmentId: cse.id } }),
    prisma.subject.create({ data: { name: "Computer Networks", code: "CN", credits: 4, departmentId: cse.id } }),
  ]);
  const subjIt3 = await Promise.all([
    prisma.subject.create({ data: { name: "Web Programming", code: "WP", credits: 4, departmentId: it.id } }),
    prisma.subject.create({ data: { name: "Software Engineering", code: "SE", credits: 4, departmentId: it.id } }),
  ]);

  // 3. FACULTY & HOD 🧑‍🏫
  console.log("🧑‍🏫 Creating Faculty & HODs...");
  const hodCse = await prisma.user.create({ data: { name: "HOD CSE", email: "hod.cse@universe.edu", passwordHash, role: "HOD", departmentId: cse.id } });
  const hodIt = await prisma.user.create({ data: { name: "HOD IT", email: "hod.it@universe.edu", passwordHash, role: "HOD", departmentId: it.id } });

  const facCseA = await prisma.user.create({ data: { name: "Faculty Alan (CSE)", email: "alan@universe.edu", passwordHash, role: "FACULTY", departmentId: cse.id } });
  const facCseB = await prisma.user.create({ data: { name: "Faculty Betty (CSE)", email: "betty@universe.edu", passwordHash, role: "FACULTY", departmentId: cse.id } });
  const facItA = await prisma.user.create({ data: { name: "Faculty Carl (IT)", email: "carl@universe.edu", passwordHash, role: "FACULTY", departmentId: it.id } });

  // Faculty Subject Allocation
  await prisma.facultySubjectAllocation.createMany({
    data: [
      { facultyId: facCseA.id, subjectId: subjCse3[0].id, sectionId: secCse3A.id }, // Alan -> DSA -> CSE-3A
      { facultyId: facCseB.id, subjectId: subjCse3[1].id, sectionId: secCse3A.id }, // Betty -> DBMS -> CSE-3A
      { facultyId: facCseA.id, subjectId: subjCse5[0].id, sectionId: secCse5A.id }, // Alan -> OS -> CSE-5A
      { facultyId: facCseB.id, subjectId: subjCse5[1].id, sectionId: secCse5A.id }, // Betty -> CN -> CSE-5A
      { facultyId: facItA.id, subjectId: subjIt3[0].id, sectionId: secIt3A.id },    // Carl -> WP -> IT-3A
      { facultyId: facItA.id, subjectId: subjIt3[1].id, sectionId: secIt3A.id },    // Carl -> SE -> IT-3A
    ]
  });

  // 4. STUDENTS 👨‍🎓
  console.log("👨‍🎓 Creating Students...");
  const createStudents = async (section: any, prefix: string, count: number) => {
    const arr = [];
    for (let i = 1; i <= count; i++) {
      const roll = `${prefix}${String(i).padStart(3, "0")}`; // e.g. CSE3A001
      const student = await prisma.user.create({
        data: {
          name: `Student ${roll}`,
          email: `${roll.toLowerCase()}@universe.edu`,
          passwordHash,
          role: "STUDENT",
          studentProfile: { create: { sectionId: section.id, rollNo: roll, batchYear: section.batchYear } }
        }
      });
      await prisma.enrollment.create({ data: { studentId: student.id, sectionId: section.id } });
      arr.push(student);
    }
    return arr;
  };

  const studentsCse3A = await createStudents(secCse3A, "CSE3A", 20);
  const studentsCse5A = await createStudents(secCse5A, "CSE5A", 20);
  const studentsIt3A = await createStudents(secIt3A, "IT3A", 20);
  const allStudents = [...studentsCse3A, ...studentsCse5A, ...studentsIt3A];

  // 5. TIMETABLE 📅
  console.log("📅 Generating Timetables...");
  const generateTimetable = async (section: any, subjects: any[], faculties: any[]) => {
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    for (const day of days) {
      let currentHour = 9;
      // 4 slots per day
      for (let i = 0; i < 4; i++) {
        const subIndex = i % subjects.length;
        await prisma.timetableSlot.create({
          data: {
            dayOfWeek: day as any,
            startTime: `${String(currentHour).padStart(2, "0")}:00`,
            endTime: `${String(currentHour+1).padStart(2, "0")}:00`,
            sectionId: section.id,
            subjectId: subjects[subIndex].id,
            facultyId: faculties[subIndex].id,
            room: `Room-${100 + i}`
          }
        });
        currentHour++;
      }
    }
  };

  await generateTimetable(secCse3A, subjCse3, [facCseA, facCseB]);
  await generateTimetable(secCse5A, subjCse5, [facCseA, facCseB]);
  await generateTimetable(secIt3A, subjIt3, [facItA, facItA]);

  // 6. ATTENDANCE 📊
  console.log("📊 Generating 20 Days of Attendance (Forcing 5 flagged students)...");
  // Select 5 random students across the board to fail attendance (<75%)
  const flaggedIds = new Set(allStudents.sort(() => 0.5 - Math.random()).slice(0, 5).map(s => s.id));

  const markAttendance = async (section: any, subject: any, facId: string, students: any[]) => {
    for (let day = 1; day <= 20; day++) {
      const slot = await prisma.timetableSlot.findFirst({
        where: { sectionId: section.id, subjectId: subject.id, facultyId: facId }
      });

      if (!slot) continue;

      const dt = new Date(2025, 0, day);
      if (dt.getDay() === 0 || dt.getDay() === 6) continue; // Skip weekends
      
      const session = await prisma.attendanceSession.create({
        data: {
          date: dt,
          sectionId: section.id,
          subjectId: subject.id,
          facultyId: facId,
          timetableSlotId: slot.id
        }
      });

      const records = students.map(st => {
        let status = "PRESENT";
        if (flaggedIds.has(st.id)) {
          // Flagged students only show up 40% of the time
          status = Math.random() > 0.6 ? "PRESENT" : "ABSENT";
        } else {
          // Normal students show up 90%
          status = Math.random() > 0.1 ? "PRESENT" : "ABSENT";
        }
        return { sessionId: session.id, studentId: st.id, status: status as any };
      });
      await prisma.attendanceRecord.createMany({ data: records });
    }
  };

  await markAttendance(secCse3A, subjCse3[0], facCseA.id, studentsCse3A);
  await markAttendance(secCse3A, subjCse3[1], facCseB.id, studentsCse3A);
  await markAttendance(secCse5A, subjCse5[0], facCseA.id, studentsCse5A);

  // 7. INTERNAL ASSESSMENTS (IA) 📝
  console.log("📝 Generating IA Marks...");
  const assignIA = async (section: any, subject: any, maxM: number, students: any[], facultyId: string) => {
    const comp = await prisma.iAComponent.create({
        data: { name: "Mid Term", type: "MIDTERM", maxMarks: maxM, sectionId: section.id, subjectId: subject.id, facultyId }
    });
    const marks = students.map(st => ({
        componentId: comp.id,
        studentId: st.id,
        marksObtained: Math.floor(Math.random() * (maxM - 40 + 1) + 40) // Random between 40 and maxM
    }));
    await prisma.iAMark.createMany({ data: marks });
  };

  await assignIA(secCse3A, subjCse3[0], 100, studentsCse3A, facCseA.id);
  await assignIA(secCse3A, subjCse3[1], 100, studentsCse3A, facCseB.id);
  await assignIA(secCse5A, subjCse5[0], 100, studentsCse5A, facCseA.id);
  await assignIA(secCse5A, subjCse5[1], 100, studentsCse5A, facCseB.id);
  await assignIA(secIt3A, subjIt3[0], 100, studentsIt3A, facItA.id);
  await assignIA(secIt3A, subjIt3[1], 100, studentsIt3A, facItA.id);

  // 8. RESULT PROCESSING 📈
  console.log("📈 Calculating Results via Service...");
  // Use the actual ResultsService logic to compute everything identically for demo!
  await ResultsService.calculateSectionResults({ id: adminUser!.id, role: "ADMIN" } as any, secCse3A.id);
  await ResultsService.calculateSectionResults({ id: adminUser!.id, role: "ADMIN" } as any, secCse5A.id);
  await ResultsService.calculateSectionResults({ id: adminUser!.id, role: "ADMIN" } as any, secIt3A.id);

  // 9. NOTICES 📢
  console.log("📢 Publishing Notices...");
  const createNotice = (title: string, audience: NoticeAudience, dId?: string) => {
    return prisma.notice.create({
      data: { title, content: `This is a test notice regarding ${title}`, audience, departmentId: dId, authorId: adminUser!.id }
    });
  };
  await createNotice("Global Welcome", "ALL");
  await createNotice("Campus Closure due to Rain", "ALL");
  await createNotice("Annual Fest Call for Student Volunteers", "STUDENT");
  await createNotice("Student ID Card Collection", "STUDENT");
  await createNotice("Faculty Development Timeline Update", "FACULTY");
  await createNotice("Required Faculty Submissions for Auditing", "FACULTY");
  await createNotice("CSE Hackathon Registration Open", "DEPARTMENT", cse.id);
  await createNotice("CSE Lab Maintenance Timeline", "DEPARTMENT", cse.id);
  await createNotice("IT Network Systems Outage", "DEPARTMENT", it.id);
  await createNotice("IT Seminar Registration Link", "DEPARTMENT", it.id);

  console.log("✅ SEED COMPLETE!");
  console.log(`🔑 Login Info:
    Admin: admin@universe.edu
    HOD: hod.cse@universe.edu / hod.it@universe.edu
    Faculty: alan@universe.edu
    Student: cse3a001@universe.edu (up to 020)
    (Password for all: ${DEFAULT_PASSWORD})
  `);
}

main()
  .catch(e => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
