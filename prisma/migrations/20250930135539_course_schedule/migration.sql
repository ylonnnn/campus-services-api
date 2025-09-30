/*
  Warnings:

  - You are about to drop the column `schedule` on the `CourseSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `CourseSchedule` table. All the data in the column will be lost.
  - Added the required column `sectionId` to the `CourseSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."WeekDay" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- AlterTable
ALTER TABLE "public"."CourseSchedule" DROP COLUMN "schedule",
DROP COLUMN "section",
ADD COLUMN     "sectionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."ScheduleSlot" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "weekDay" "public"."WeekDay" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "ScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_id_key" ON "public"."ScheduleSlot"("id");

-- AddForeignKey
ALTER TABLE "public"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."CourseSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSchedule" ADD CONSTRAINT "CourseSchedule_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
