import { Router } from "express";

import { Prisma, UserRole } from "../../../generated/prisma";

import { auth, AuthRequest } from "../../../auth";
import { programs } from "../../../sis/program/programs";

export const ProgramRouter = Router();

ProgramRouter.post(
    "/",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req: AuthRequest, res) => {
        const { data } = req.body;
        const result = programs.schema.safeParse(data);

        if (!result.success)
            return res.status(400).json({ message: "Invalid program data" });

        const { code, name } = result.data;
        const program = await programs.create(code, name);

        return res.status(program ? 200 : 409).json({
            message: program
                ? "Program created successfully"
                : "Program already exists",
            program,
        });
    }
);

ProgramRouter.put(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req: AuthRequest, res) => {
        const { data } = req.body;
        const result = programs.partialSchema.safeParse(data);

        if (!result.success)
            return res.status(400).json({ message: "Invalid program data" });

        const success = await programs.update(
            req.params.code as string,
            result.data as Prisma.ProgramUpdateInput
        );

        return res.status(success ? 200 : 404).json({
            message: success
                ? "Updated the program successfully"
                : "Program does not exist",
        });
    }
);

ProgramRouter.delete(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!code)
            return res
                .status(400)
                .json({ message: "Invalid or missing program code" });

        const program = await programs.delete(code);
        return res.status(program ? 200 : 404).json({
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
        if (!code)
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
