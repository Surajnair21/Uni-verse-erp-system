-- CreateEnum
CREATE TYPE "IAComponentType" AS ENUM ('QUIZ', 'ASSIGNMENT', 'MIDTERM', 'PROJECT', 'PRACTICAL');

-- CreateTable
CREATE TABLE "IAComponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "IAComponentType" NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL,
    "weightage" DOUBLE PRECISION,
    "subjectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IAComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IAMark" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "marksObtained" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IAMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IAComponent_sectionId_idx" ON "IAComponent"("sectionId");

-- CreateIndex
CREATE INDEX "IAComponent_facultyId_idx" ON "IAComponent"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "IAComponent_subjectId_sectionId_name_key" ON "IAComponent"("subjectId", "sectionId", "name");

-- CreateIndex
CREATE INDEX "IAMark_studentId_idx" ON "IAMark"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "IAMark_componentId_studentId_key" ON "IAMark"("componentId", "studentId");

-- AddForeignKey
ALTER TABLE "IAComponent" ADD CONSTRAINT "IAComponent_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAComponent" ADD CONSTRAINT "IAComponent_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAComponent" ADD CONSTRAINT "IAComponent_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAMark" ADD CONSTRAINT "IAMark_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "IAComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IAMark" ADD CONSTRAINT "IAMark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
