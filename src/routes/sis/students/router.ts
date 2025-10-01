import { Router } from "express";

import { UserRole } from "../../../generated/prisma";

import { User, userAuthority, users } from "../../../user";
import { auth, AuthRequest } from "../../../auth";
import { courses, sections, students } from "../../../sis";
import prisma from "../../../services/prisma";

export const StudentRouter = Router();

StudentRouter.get(
    "/:studentno",
    auth.authenticate,
    users.retrieval("studentno", users.getByStudentNo),
    auth.authorization(
        (user) => !!userAuthority.get(user.role)?.has(UserRole.Student)
    ),
    async (req: AuthRequest, res) => {
        if (!req.users)
            return res.status(404).json({ message: "Missing expected users" });

        return res.status(200).json({ user: req.users[1] as User });
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
            return res.status(400).json({ message: "Invalid enrollment data" });

        const { studentNo, course } = result.data;
        let section: string | undefined = result.data.section;

        const user = await users.getByStudentNo(studentNo);
        if (!user || !user.student)
            return res.status(404).json({
                message: "Unknown student with the provided student number",
            });

        section ??= user.student.section?.code;
        if (!section)
            return res
                .status(403)
                .json({ message: "Section must be provided" });

        const sectionPayload = await sections.get(section);
        if (!sectionPayload)
            return res.status(404).json({
                message: "Unknown section with the provided section code",
            });

        const courseSched = sectionPayload.courses.find(
            (sched) => sched.course.code == course
        );

        if (!courseSched)
            return res.status(404).json({
                message:
                    "Course does not exist in the course schedule of the section with the provided section code",
            });

        console.log("courseSched", courseSched);

        await courses.enroll(user, courseSched);
        return res.status(200).json({
            messge: "Enrolled the provided student to the provided course schedule of the provided section successfully",
        });
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
            return res.status(400).json({ message: "Invalid grading data" });

        const { studentNo, course, grade, gradeStatus } = result.data;
        const user = await users.getByStudentNo(studentNo);
        await user?.initialize();

        if (!user || !user.student)
            return res.status(404).json({
                message: "Unknown student with the provided student number",
            });

        const { student } = user;
        const enrollment = student.courses.find(
            (enrollment) => enrollment.courseSched.course.code == course
        );
        if (!enrollment)
            return res.status(404).json({
                message:
                    "Unknown course. Student is not enrolled to this course",
            });

        const { courseSched } = enrollment;
        if (
            faculty.role != UserRole.Administrator &&
            courseSched.facultyId != faculty.id
        )
            return res.status(403).json({
                message:
                    "Client is not the faculty assigned to the provided course and student",
            });

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
        console.log(success);

        return res.status(success ? 200 : 404).json({
            message: success
                ? "Updated the grade of the student in the provided course successfully"
                : "Unknown enrollment",
        });
    }
);
