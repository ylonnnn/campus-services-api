import { Router } from "express";

import { UserRole } from "../../../generated/prisma";

import { auth, AuthRequest } from "../../../auth";
import { programs } from "../../../sis/program/programs";
import { isString } from "../../../utils";

export const ProgramRouter = Router();

ProgramRouter.post(
    "/",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req: AuthRequest, res) => {
        const { code, name } = req.body;
        if (!isString(code) || !isString(name))
            return res
                .status(400)
                .json({ message: "Invalid or missing program data" });

        const program = await programs.create(code, name);
        return res.status(program ? 200 : 403).json({
            message: program
                ? "Program created successfully"
                : "Program already exists",
            program,
        });
    }
);

// TODO: CourseRouter.put()/CourseRouter.patch

ProgramRouter.delete(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!isString(code))
            return res
                .status(400)
                .json({ message: "Invalid or missing program code" });

        const program = await programs.delete(code);
        return res.status(program ? 200 : 403).json({
            message: program
                ? "Program deleted successfully"
                : "Program does not exist",
            program,
        });
    }
);

ProgramRouter.get(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!isString(code))
            return res
                .status(400)
                .json({ message: "Invalid or missing program code" });

        const program = await programs.get(code);
        return res.status(program ? 200 : 404).json({
            message: program
                ? "Program retrieved successfully"
                : "Unknown program with the provided program code",
            program,
        });
    }
);
