/*
  Warnings:

  - A unique constraint covering the columns `[date,timetableSlotId]` on the table `AttendanceSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropIndex
DROP INDEX "AttendanceSession_date_sectionId_subjectId_key";

-- AlterTable
ALTER TABLE "AttendanceSession" ADD COLUMN     "timetableSlotId" TEXT;

-- CreateTable
CREATE TABLE "TimetableSlot" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimetableSlot_sectionId_idx" ON "TimetableSlot"("sectionId");

-- CreateIndex
CREATE INDEX "TimetableSlot_facultyId_idx" ON "TimetableSlot"("facultyId");

-- CreateIndex
CREATE INDEX "TimetableSlot_dayOfWeek_idx" ON "TimetableSlot"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSession_date_timetableSlotId_key" ON "AttendanceSession"("date", "timetableSlotId");

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_timetableSlotId_fkey" FOREIGN KEY ("timetableSlotId") REFERENCES "TimetableSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
