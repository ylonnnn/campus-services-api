import { Router } from "express";

import { Prisma, UserRole } from "../../../generated/prisma";

import { auth } from "../../../auth";
import {
    SectionBasicRequestData,
    SectionCourseScheduleCreationStatus,
    SectionRequestData,
    sections,
} from "../../../sis";
import { UserName } from "../../../user";

export const SectionRouter = Router();

SectionRouter.post(
    "/",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { data } = req.body;
        const result = sections.schema.safeParse(data);

        if (!result.success)
            return res.status(400).json({
                success: false,
                message: "Invalid section data",
            } as SectionRequestData);

        const { program, code, year } = result.data;
        const section = await sections.create(program, code, year);

        return res.status(section ? 200 : 409).json({
            success: true,
            message: section
                ? "Created section successfully"
                : "Section already exists",
            section,
        } as SectionRequestData);
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
            return res.status(400).json({
                message: "Invalid section data",
            } as SectionBasicRequestData);

        const success = await sections.update(
            req.params.code as string,
            result.data as Prisma.SectionUpdateInput
        );

        return res.status(success ? 200 : 404).json({
            message: success
                ? "Updated section successfully"
                : "Section does not exist",
        } as SectionBasicRequestData);
    }
);

SectionRouter.delete(
    "/:code",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { code } = req.params;
        if (!code)
            return res.status(400).json({
                success: false,
                message: "Missing section code",
            } as SectionRequestData);

        const section = await sections.delete(code);
        return res.status(section ? 200 : 404).json({
            success: true,
            message: section
                ? "Section deleted successfully"
                : "Section does not exist",
            section,
        } as SectionRequestData);
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

SectionRouter.post(
    "/schedule",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { data } = req.body;
        const result = sections.scheduleSchema.safeParse(data);

        if (!result.success)
            return res.status(400).json({
                message: "Invalid section course data",
            } as SectionBasicRequestData);

        const { data: rdata } = result;
        const status = await sections.createSchedule(
            rdata.code,
            rdata.course,
            rdata.faculty as UserName,
            rdata.scheduleSlots
        );

        switch (status) {
            case SectionCourseScheduleCreationStatus.UnknownSection:
                return res.status(404).json({
                    message: "Unknown section",
                } as SectionBasicRequestData);

            case SectionCourseScheduleCreationStatus.UnknownCourse:
                return res.status(404).json({
                    message: "Unknown course",
                } as SectionBasicRequestData);

            case SectionCourseScheduleCreationStatus.UnknownFaculty:
                return res.status(404).json({
                    message: "Unknown faculty",
                } as SectionBasicRequestData);

            case SectionCourseScheduleCreationStatus.Success:
                return res.status(200).json({
                    message: "Created schedule for section successfully",
                } as SectionRequestData);
        }
    }
);
