import { prisma } from '../../prisma/client'
import { AuthedUser } from '../../middlewares/auth'

export class ResultsService {
  static getGrade(totalMarks: number) {
    if (totalMarks >= 90) return { grade: 'O', point: 10 }
    if (totalMarks >= 80) return { grade: 'A+', point: 9 }
    if (totalMarks >= 70) return { grade: 'A', point: 8 }
    if (totalMarks >= 60) return { grade: 'B+', point: 7 }
    if (totalMarks >= 50) return { grade: 'B', point: 6 }
    if (totalMarks >= 40) return { grade: 'C', point: 5 }
    return { grade: 'F', point: 0 }
  }

  // Calculate results for a given section (all students enrolled)
  static async calculateSectionResults(user: AuthedUser, sectionId: string) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        semester: { include: { course: true } },
        allocations: { include: { subject: true } }, // gives subjects in this section
        enrollments: { include: { student: true } }
      }
    });

    if (!section) throw new Error('Section not found');

    const subjects = section.allocations.map(a => a.subject);
    const students = section.enrollments.map(e => e.student);
    const semesterId = section.semesterId;

    // For each student, calculate their SubjectResult for all subjects in the section
    for (const student of students) {
      let earnedCredits = 0;
      let totalCredits = 0;
      let totalPoints = 0;

      for (const subject of subjects) {
        totalCredits += subject.credits;

        // Fetch IA marks for this student & subject in this section
        const iaMarks = await prisma.iAMark.findMany({
          where: {
            studentId: student.id,
            component: {
              subjectId: subject.id,
              sectionId: section.id
            }
          },
          include: { component: true }
        });

        // Sum up marks (basic implementation). If weightage is present, we could use that.
        // For simplicity, we just sum `marksObtained`.
        const internalMarks = iaMarks.reduce((acc, curr) => acc + curr.marksObtained, 0);
        const totalMarks = internalMarks; // Assuming 100% IA or no external for now

        const { grade, point } = this.getGrade(totalMarks);
        const passed = point > 0;
        const subjEarnedCredits = passed ? subject.credits : 0;

        earnedCredits += subjEarnedCredits;
        totalPoints += (point * subject.credits);

        // Upsert SubjectResult
        await prisma.subjectResult.upsert({
          where: {
            studentId_subjectId_semesterId: {
              studentId: student.id,
              subjectId: subject.id,
              semesterId
            }
          },
          update: {
            internalMarks,
            totalMarks,
            grade,
            gradePoint: point,
            creditsEarned: subjEarnedCredits,
            passed
          },
          create: {
            studentId: student.id,
            subjectId: subject.id,
            semesterId,
            internalMarks,
            totalMarks,
            grade,
            gradePoint: point,
            creditsEarned: subjEarnedCredits,
            passed
          }
        });
      }

      // Calculate SGPA
      const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

      // Upsert SemesterResult
      await prisma.semesterResult.upsert({
        where: {
          studentId_semesterId: {
            studentId: student.id,
            semesterId
          }
        },
        update: {
          sgpa,
          totalCredits,
          earnedCredits,
          status: earnedCredits === totalCredits ? 'PASS' : 'FAIL'
        },
        create: {
          studentId: student.id,
          semesterId,
          sgpa,
          totalCredits,
          earnedCredits,
          status: earnedCredits === totalCredits ? 'PASS' : 'FAIL'
        }
      });

      // Update CGPA in StudentProfile
      const allSemResults = await prisma.semesterResult.findMany({
        where: { studentId: student.id }
      });
      const cgpa = allSemResults.reduce((acc, curr) => acc + curr.sgpa, 0) / (allSemResults.length || 1);

      await prisma.studentProfile.update({
        where: { userId: student.id },
        data: { cgpa }
      });
    }

    return { message: 'Results calculated successfully.' }
  }

  static async getStudentResults(studentId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: studentId } });
    const semesters = await prisma.semesterResult.findMany({
      where: { studentId },
      include: {
        semester: { include: { course: true } }
      },
      orderBy: { semester: { number: 'asc' } }
    });

    const subjects = await prisma.subjectResult.findMany({
      where: { studentId },
      include: { subject: true }
    });

    return { cgpa: profile?.cgpa || 0, semesters, subjects };
  }
}
