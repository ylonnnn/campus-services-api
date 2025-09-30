import { Router } from "express";

import { Prisma, UserRole } from "../../../generated/prisma";

import { auth } from "../../../auth";
import { sections } from "../../../sis";

export const SectionRouter = Router();

SectionRouter.post(
    "/",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { data } = req.body;
        const result = sections.schema.safeParse(data);

        if (!result.success)
            return res.status(400).json({ message: "Invalid section data" });

        const { program, code, year } = result.data;
        const section = await sections.create(program, code, year);

        return res.status(section ? 200 : 409).json({
            message: section
                ? "Created section successfully"
                : "Section already exists",
            section,
        });
    }
);

SectionRouter.put(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { data } = req.body;
        const result = sections.partialSchema.safeParse(data);

        if (!result.success)
            return res.status(400).json({ message: "Invalid section data" });

        const success = await sections.update(
            req.params.code as string,
            result.data as Prisma.SectionUpdateInput
        );

        return res.status(success ? 200 : 404).json({
            message: success
                ? "Updated section successfully"
                : "Section does not exist",
        });
    }
);

SectionRouter.delete(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!code)
            return res.status(400).json({ message: "Missing section code" });

        const section = await sections.delete(code);
        return res.status(section ? 200 : 404).json({
            message: section
                ? "Section deleted successfully"
                : "Section does not exist",
            section,
        });
    }
);

SectionRouter.get(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!code)
            return res.status(400).json({ message: "Missing section code" });

        const section = await sections.delete(code);
        return res.status(section ? 200 : 404).json({
            message: section
                ? "Section retrieved successfully"
                : "Section does not exist",
            section,
        });
    }
);
