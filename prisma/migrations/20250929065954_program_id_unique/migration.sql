/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Program` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Course_facultyId_key";

-- DropIndex
DROP INDEX "public"."CourseEnrollment_courseSchedId_key";

-- DropIndex
DROP INDEX "public"."CourseEnrollment_studentId_key";

-- DropIndex
DROP INDEX "public"."CourseSchedule_courseId_key";

-- DropIndex
DROP INDEX "public"."StudentUser_programId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "public"."Program"("code");
