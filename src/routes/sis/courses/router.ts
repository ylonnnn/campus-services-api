import { Router } from "express";

import { Prisma, UserRole } from "../../../generated/prisma";

import { auth, AuthRequest } from "../../../auth";
import { courses } from "../../../sis";

export const CourseRouter = Router();

CourseRouter.post(
    "/",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { data } = req.body;
        const result = courses.schema.safeParse(data);

        if (!result.success)
            return res.status(400).json({ message: "Invalid course data" });

        const { code, name, units } = result.data;
        const course = await courses.create(code, name, units);

        return res.status(course ? 200 : 409).json({
            message: course
                ? "Course created successfully"
                : "Course already exists",
            course,
        });
    }
);

CourseRouter.put(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req: AuthRequest, res) => {
        const { data } = req.body;
        const result = courses.partialSchema.safeParse(data);

        if (!result.success)
            return res.status(400).json({ message: "Invalid course data" });

        const success = await courses.update(
            req.params.code as string,
            result.data as Prisma.CourseUpdateInput
        );

        return res.status(success ? 200 : 404).json({
            message: success
                ? "Updated the course successfully"
                : "Course does not exist",
        });
    }
);

CourseRouter.delete(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!code)
            return res
                .status(400)
                .json({ message: "Invalid or missing course code" });

        const course = await courses.delete(code);
        return res.status(course ? 200 : 404).json({
            message: course
                ? "Course deleted successfully"
                : "Course does not exist",
            course,
        });
    }
);

CourseRouter.get(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!code)
            return res
                .status(400)
                .json({ message: "Invalid or missing course code" });

        const course = await courses.get(code);
        return res.status(course ? 200 : 404).json({
            message: course
                ? "Retrieved course data successfully"
                : "Unknown course with the provided code",
            course,
        });
    }
);
