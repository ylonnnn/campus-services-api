-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('student', 'faculty', 'administrator');

-- CreateEnum
CREATE TYPE "public"."StudentScholasticStatus" AS ENUM ('Regular', 'Irregular', 'Returnee');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "session" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."StudentUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "studentNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 1,
    "section" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."StudentScholasticStatus" NOT NULL DEFAULT 'Regular'
);

-- CreateTable
CREATE TABLE "public"."FacultyUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facultyId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "public"."CourseSchedule" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "schedule" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."CourseEnrollment" (
    "id" SERIAL NOT NULL,
    "courseSchedId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" DOUBLE PRECISION NOT NULL DEFAULT 0.00
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentUser_id_key" ON "public"."StudentUser"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentUser_userId_key" ON "public"."StudentUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentUser_studentNo_key" ON "public"."StudentUser"("studentNo");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyUser_id_key" ON "public"."FacultyUser"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyUser_userId_key" ON "public"."FacultyUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_id_key" ON "public"."Course"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "public"."Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_facultyId_key" ON "public"."Course"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSchedule_id_key" ON "public"."CourseSchedule"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSchedule_courseId_key" ON "public"."CourseSchedule"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_id_key" ON "public"."CourseEnrollment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_courseSchedId_key" ON "public"."CourseEnrollment"("courseSchedId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_studentId_key" ON "public"."CourseEnrollment"("studentId");

-- AddForeignKey
ALTER TABLE "public"."StudentUser" ADD CONSTRAINT "StudentUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FacultyUser" ADD CONSTRAINT "FacultyUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."FacultyUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseSchedule" ADD CONSTRAINT "CourseSchedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseSchedId_fkey" FOREIGN KEY ("courseSchedId") REFERENCES "public"."CourseSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
