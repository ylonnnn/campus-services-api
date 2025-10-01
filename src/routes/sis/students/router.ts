import { Router } from "express";

import { UserRole } from "../../../generated/prisma";

import {
    StudentUserAdditionalInfo,
    User,
    UserAccountCreationStatus,
    userAuthority,
    users,
} from "../../../user";
import { auth, AuthRequest } from "../../../auth";
import {
    courses,
    sections,
    StudentBasicRequestData,
    StudentRequestData,
    students,
} from "../../../sis";
import prisma from "../../../services/prisma";
import { assert } from "console";

export const StudentRouter = Router();

StudentRouter.post(
    "/register",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { data } = req.body;
        const result = students.registrationSchema.safeParse(data);

        if (!result.success)
            return res.status(400).json({
                success: false,
                message: "Invalid registration data",
            } as StudentRequestData);

        const { email, info } = result.data;
        const [status, payload] = await users.registerStudent(
            email,
            info as StudentUserAdditionalInfo
        );

        switch (status) {
            case UserAccountCreationStatus.InvalidCredentials:
                return res.status(400).json({
                    success: false,
                    message: "Invalid credentials",
                } as StudentRequestData);

            case UserAccountCreationStatus.EmailAlreadyUsed:
                return res.status(403).json({
                    success: false,
                    message: "Provided email is already used",
                } as StudentRequestData);

            case UserAccountCreationStatus.Success:
                const student = payload as NonNullable<typeof payload>;
                const user = (await users.getById(student.user.id)) as User;
                await user.initialize();

                return res.status(200).json({
                    success: true,
                    message: "Registered student successfully",
                    user,
                } as StudentRequestData);
        }
    }
);

StudentRouter.get(
    "/:studentno",
    auth.authenticate,
    users.retrieval("studentno", users.getByStudentNo),
    auth.authorization(
        (user) => !!userAuthority.get(user.role)?.has(UserRole.Student)
    ),
    async (req: AuthRequest, res) => {
        if (!req.users)
            return res.status(404).json({
                success: false,
                message: "Missing expected users",
            } as StudentRequestData);

        return res.status(200).json({
            success: true,
            message: "Retrieved student user successfully",
            user: req.users[1] as User,
        } as StudentRequestData);
    }
);

StudentRouter.post(
    "/enroll",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { data } = req.body;
        const result = students.enrollSchema.safeParse(data);

        if (!result.success)
            return res.status(400).json({
                message: "Invalid enrollment data",
            } as StudentBasicRequestData);

        const { studentNo, course } = result.data;
        let section: string | undefined = result.data.section;

        const user = await users.getByStudentNo(studentNo);
        if (!user || !user.student)
            return res.status(404).json({
                message: "Unknown student with the provided student number",
            } as StudentBasicRequestData);

        section ??= user.student.section?.code;
        if (!section)
            return res.status(403).json({
                message: "Section must be provided",
            } as StudentBasicRequestData);

        const sectionPayload = await sections.get(section);
        if (!sectionPayload)
            return res.status(404).json({
                message: "Unknown section with the provided section code",
            } as StudentBasicRequestData);

        const courseSched = sectionPayload.courses.find(
            (sched) => sched.course.code == course
        );

        if (!courseSched)
            return res.status(404).json({
                message:
                    "Course does not exist in the course schedule of the section with the provided section code",
            } as StudentBasicRequestData);

        console.log("courseSched", courseSched);

        await courses.enroll(user, courseSched);
        return res.status(200).json({
            message:
                "Enrolled the provided student to the provided course schedule of the provided section successfully",
        } as StudentBasicRequestData);
    }
);

StudentRouter.post(
    "/grade",
    auth.authenticate,
    auth.authorization(
        (user) => !!userAuthority.get(user.role)?.has(UserRole.Student)
    ),
    async (req: AuthRequest, res) => {
        const faculty = req.users?.[0] as User;

        const { data } = req.body;
        const result = students.gradeSchema.safeParse(data);

        if (!result.success)
            return res.status(400).json({
                message: "Invalid grading data",
            } as StudentBasicRequestData);

        const { studentNo, course, grade, gradeStatus } = result.data;
        const user = await users.getByStudentNo(studentNo);
        await user?.initialize();

        if (!user || !user.student)
            return res.status(404).json({
                message: "Unknown student with the provided student number",
            } as StudentBasicRequestData);

        const { student } = user;
        const enrollment = student.courses.find(
            (enrollment) => enrollment.courseSched.course.code == course
        );
        if (!enrollment)
            return res.status(404).json({
                message:
                    "Unknown course. Student is not enrolled to this course",
            } as StudentBasicRequestData);

        const { courseSched } = enrollment;
        if (
            faculty.role != UserRole.Administrator &&
            courseSched.facultyId != faculty.id
        )
            return res.status(403).json({
                message:
                    "Client is not the faculty assigned to the provided course and student",
            } as StudentBasicRequestData);

        console.log(student.id, courseSched);
        const success =
            (
                await prisma.courseEnrollment.updateMany({
                    where: {
                        studentId: student.id,
                        courseSchedId: courseSched.id,
                    },
                    data: { grade, gradeStatus },
                })
            ).count > 0;

        return res.status(success ? 200 : 404).json({
            message: success
                ? "Updated the grade of the student in the provided course successfully"
                : "Unknown enrollment",
        } as StudentBasicRequestData);
    }
);
