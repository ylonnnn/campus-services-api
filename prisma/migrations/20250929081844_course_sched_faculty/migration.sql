/*
  Warnings:

  - You are about to drop the column `facultyId` on the `Course` table. All the data in the column will be lost.
  - Added the required column `facultyId` to the `CourseSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_facultyId_fkey";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "facultyId";

-- AlterTable
ALTER TABLE "public"."CourseSchedule" ADD COLUMN     "facultyId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."CourseSchedule" ADD CONSTRAINT "CourseSchedule_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."FacultyUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
