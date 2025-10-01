import { Router } from "express";

import { Prisma, UserRole } from "../../../generated/prisma";

import { auth, AuthRequest } from "../../../auth";
import {
    programs,
    ProgramRequestData,
    ProgramBasicRequestData,
} from "../../../sis";

export const ProgramRouter = Router();

ProgramRouter.post(
    "/",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req: AuthRequest, res) => {
        const { data } = req.body;
        const result = programs.schema.safeParse(data);

        if (!result.success)
            return res.status(400).json({
                success: false,
                message: "Invalid program data",
            } as ProgramRequestData);

        const { code, name } = result.data;
        const program = await programs.create(code, name);

        return res.status(program ? 200 : 409).json({
            success: true,
            message: program
                ? "Program created successfully"
                : "Program already exists",
            program,
        } as ProgramRequestData);
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
            return res.status(400).json({
                message: "Invalid program data",
            } as ProgramBasicRequestData);

        const success = await programs.update(
            req.params.code as string,
            result.data as Prisma.ProgramUpdateInput
        );

        return res.status(success ? 200 : 404).json({
            message: success
                ? "Updated the program successfully"
                : "Program does not exist",
        } as ProgramBasicRequestData);
    }
);

ProgramRouter.delete(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!code)
            return res.status(400).json({
                success: false,
                message: "Invalid or missing program code",
            } as ProgramRequestData);

        const program = await programs.delete(code);
        return res.status(program ? 200 : 404).json({
            success: true,
            message: program
                ? "Program deleted successfully"
                : "Program does not exist",
            program,
        } as ProgramRequestData);
    }
);

ProgramRouter.get(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!code)
            return res.status(400).json({
                success: false,
                message: "Invalid or missing program code",
            } as ProgramRequestData);

        const program = await programs.get(code);
        return res.status(program ? 200 : 404).json({
            success: true,
            message: program
                ? "Program retrieved successfully"
                : "Unknown program with the provided program code",
            program,
        } as ProgramRequestData);
    }
);
