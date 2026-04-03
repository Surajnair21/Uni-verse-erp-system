/**
 * Prisma Seed Script
 * Run with: npx prisma db seed
 *
 * This always inserts fresh data — it does NOT skip if data exists.
 * Use it to populate a fresh database or add additional seed data.
 */

import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "Password@123";
const BATCH_YEAR = Number(process.env.SEED_BATCH_YEAR ?? 2025);

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ── Clean existing seeded data (FK-safe order: children → parents) ──────
  console.log("🗑️  Clearing existing data...");
  await prisma.iAMark.deleteMany();
  await prisma.iAComponent.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.facultySubjectAllocation.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  // Delete non-admin users
  await prisma.user.deleteMany({ where: { role: { not: "ADMIN" } } });
  await prisma.section.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.course.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();
  console.log("✅ Cleared.\n");

  // ── Departments ──────────────────────────────────────────────────────────
  const cse = await prisma.department.create({
    data: { name: "Computer Science & Engineering", code: "CSE" },
  });
  const ece = await prisma.department.create({
    data: { name: "Electronics & Communication", code: "ECE" },
  });
  const mba = await prisma.department.create({
    data: { name: "Management", code: "MBA" },
  });

  // ---------- Programs ----------
  const btechCse = await prisma.program.create({
    data: { name: "B.Tech CSE", code: "BTECH_CSE", departmentId: cse.id },
  });
  const btechEce = await prisma.program.create({
    data: { name: "B.Tech ECE", code: "BTECH_ECE", departmentId: ece.id },
  });
  const mbaProg = await prisma.program.create({
    data: { name: "MBA", code: "MBA", departmentId: mba.id },
  });

  // ---------- Courses ----------
  const courseCse = await prisma.course.create({
    data: { name: "B.Tech CSE (4 Years)", code: "CSE_4Y", programId: btechCse.id },
  });
  const courseEce = await prisma.course.create({
    data: { name: "B.Tech ECE (4 Years)", code: "ECE_4Y", programId: btechEce.id },
  });
  const courseMba = await prisma.course.create({
    data: { name: "MBA (2 Years)", code: "MBA_2Y", programId: mbaProg.id },
  });

  // ---------- Semesters ----------
  const [cseS1, cseS2] = await Promise.all([
    prisma.semester.create({ data: { courseId: courseCse.id, number: 1 } }),
    prisma.semester.create({ data: { courseId: courseCse.id, number: 2 } }),
  ]);
  const [eceS1] = await Promise.all([
    prisma.semester.create({ data: { courseId: courseEce.id, number: 1 } }),
    prisma.semester.create({ data: { courseId: courseEce.id, number: 2 } }),
  ]);
  const [mbaS1] = await Promise.all([
    prisma.semester.create({ data: { courseId: courseMba.id, number: 1 } }),
    prisma.semester.create({ data: { courseId: courseMba.id, number: 2 } }),
  ]);

  // ---------- Sections ----------
  const [cseA, cseB, eceA, eceB, mbaA] = await Promise.all([
    prisma.section.create({ data: { name: "A", batchYear: BATCH_YEAR, departmentId: cse.id, semesterId: cseS1.id } }),
    prisma.section.create({ data: { name: "B", batchYear: BATCH_YEAR, departmentId: cse.id, semesterId: cseS1.id } }),
    prisma.section.create({ data: { name: "A", batchYear: BATCH_YEAR, departmentId: ece.id, semesterId: eceS1.id } }),
    prisma.section.create({ data: { name: "B", batchYear: BATCH_YEAR, departmentId: ece.id, semesterId: eceS1.id } }),
    prisma.section.create({ data: { name: "A", batchYear: BATCH_YEAR, departmentId: mba.id, semesterId: mbaS1.id } }),
  ]);

  // ---------- Subjects ----------
  const [cProg, cMath, cDsa] = await Promise.all([
    prisma.subject.create({ data: { name: "Programming Fundamentals", code: "CSE_PF", credits: 4, departmentId: cse.id } }),
    prisma.subject.create({ data: { name: "Engineering Mathematics I", code: "CSE_M1", credits: 4, departmentId: cse.id } }),
    prisma.subject.create({ data: { name: "Data Structures", code: "CSE_DS", credits: 4, departmentId: cse.id } }),
  ]);
  const [eBasic, eMath, eCir] = await Promise.all([
    prisma.subject.create({ data: { name: "Basics of Electronics", code: "ECE_BE", credits: 4, departmentId: ece.id } }),
    prisma.subject.create({ data: { name: "Engineering Mathematics I", code: "ECE_M1", credits: 4, departmentId: ece.id } }),
    prisma.subject.create({ data: { name: "Circuit Theory", code: "ECE_CT", credits: 4, departmentId: ece.id } }),
  ]);
  const [mOrg, mAcc] = await Promise.all([
    prisma.subject.create({ data: { name: "Organizational Behaviour", code: "MBA_OB", credits: 3, departmentId: mba.id } }),
    prisma.subject.create({ data: { name: "Financial Accounting", code: "MBA_FA", credits: 3, departmentId: mba.id } }),
  ]);

  // ---------- Users: HOD ----------
  await Promise.all([
    prisma.user.create({ data: { name: "HOD CSE", email: "hod.cse@universe.edu", passwordHash, role: "HOD", departmentId: cse.id } }),
    prisma.user.create({ data: { name: "HOD ECE", email: "hod.ece@universe.edu", passwordHash, role: "HOD", departmentId: ece.id } }),
    prisma.user.create({ data: { name: "HOD MBA", email: "hod.mba@universe.edu", passwordHash, role: "HOD", departmentId: mba.id } }),
  ]);

  // ---------- Users: Faculty ----------
  const facCse1 = await prisma.user.create({
    data: { name: "Aman Sharma", email: "aman.sharma@universe.edu", passwordHash, role: "FACULTY", departmentId: cse.id, facultyProfile: { create: { employeeId: "CSE-F-001" } } },
  });
  const facCse2 = await prisma.user.create({
    data: { name: "Neha Verma", email: "neha.verma@universe.edu", passwordHash, role: "FACULTY", departmentId: cse.id, facultyProfile: { create: { employeeId: "CSE-F-002" } } },
  });
  const facEce1 = await prisma.user.create({
    data: { name: "Ravi Mehta", email: "ravi.mehta@universe.edu", passwordHash, role: "FACULTY", departmentId: ece.id, facultyProfile: { create: { employeeId: "ECE-F-001" } } },
  });
  const facMba1 = await prisma.user.create({
    data: { name: "Simran Kaur", email: "simran.kaur@universe.edu", passwordHash, role: "FACULTY", departmentId: mba.id, facultyProfile: { create: { employeeId: "MBA-F-001" } } },
  });

  // ---------- Users: Students ----------
  async function createStudents(sectionId: string, prefix: string, count: number) {
    for (let i = 1; i <= count; i++) {
      const roll = `${prefix}${String(i).padStart(2, "0")}`;
      const student = await prisma.user.create({
        data: {
          name: `Student ${roll}`,
          email: `${roll.toLowerCase()}@student.universe.edu`,
          passwordHash,
          role: "STUDENT",
          studentProfile: { create: { sectionId, rollNo: roll, batchYear: BATCH_YEAR } },
        },
      });
      await prisma.enrollment.create({ data: { studentId: student.id, sectionId } });
    }
  }

  await createStudents(cseA.id, "CSEA", 10);
  await createStudents(cseB.id, "CSEB", 10);
  await createStudents(eceA.id, "ECEA", 10);
  await createStudents(eceB.id, "ECEB", 10);
  await createStudents(mbaA.id, "MBAA", 10);

  // ---------- Allocations ----------
  await prisma.facultySubjectAllocation.createMany({
    data: [
      { facultyId: facCse1.id, subjectId: cProg.id, sectionId: cseA.id },
      { facultyId: facCse2.id, subjectId: cMath.id, sectionId: cseA.id },
      { facultyId: facCse2.id, subjectId: cDsa.id,  sectionId: cseA.id },
      { facultyId: facCse1.id, subjectId: cProg.id, sectionId: cseB.id },
      { facultyId: facCse2.id, subjectId: cMath.id, sectionId: cseB.id },
      { facultyId: facEce1.id, subjectId: eBasic.id, sectionId: eceA.id },
      { facultyId: facEce1.id, subjectId: eCir.id,   sectionId: eceA.id },
      { facultyId: facEce1.id, subjectId: eBasic.id, sectionId: eceB.id },
      { facultyId: facEce1.id, subjectId: eMath.id,  sectionId: eceB.id },
      { facultyId: facMba1.id, subjectId: mOrg.id,   sectionId: mbaA.id },
      { facultyId: facMba1.id, subjectId: mAcc.id,   sectionId: mbaA.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding complete!");
  console.log(`🔐 Password for all seeded users: ${DEFAULT_PASSWORD}`);
  console.log("👤 HOD:     hod.cse@universe.edu | hod.ece@universe.edu | hod.mba@universe.edu");
  console.log("👨‍🏫 Faculty: aman.sharma@universe.edu | neha.verma@universe.edu | ravi.mehta@universe.edu | simran.kaur@universe.edu");
  console.log("🎓 Student: csea01@student.universe.edu (through csea10, cseb01, ecea01, eceb01, mbaa01...)");
}

main()
  .catch(e => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
