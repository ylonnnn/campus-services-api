import { Router } from "express";

import { UserRole } from "../../../generated/prisma";

import { auth } from "../../../auth";
import { courses } from "../../../sis";
import { isNumber, isString } from "../../../utils";

export const CourseRouter = Router();

CourseRouter.post(
    "/",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code, name, units } = req.body;
        if (!isString(code) || !isString(name) || !isNumber(units))
            return res
                .status(400)
                .json({ message: "Invalid or missing course data" });

        const course = await courses.create(code, name, units);

        return res.status(course ? 200 : 403).json({
            message: course
                ? "Course created successfully"
                : "Course already exists",
            course,
        });
    }
);

// TODO: CourseRouter.put()/CourseRouter.patch

CourseRouter.delete(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!isString(code))
            return res
                .status(400)
                .json({ message: "Invalid or missing course code" });

        const course = await courses.delete(code);
        return res.status(course ? 200 : 403).json({
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
        if (!isString(code))
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
