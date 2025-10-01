import { z } from "zod";

import prisma, { CourseScheduleModel, Prisma } from "../../services/prisma";

import { User } from "../../user";
import { GradeStatus } from "../../generated/prisma";

class CourseManager {
    protected _dataSchema = z.object({
        code: z.string(),
        name: z.string(),
        units: z.number(),
    });

    protected _partialDataSchema = this._dataSchema.partial();

    public get schema() {
        return this._dataSchema;
    }

    public get partialSchema() {
        return this._partialDataSchema;
    }

    public async create(code: string, name: string, units: number) {
        try {
            return await prisma.course.create({ data: { code, name, units } });
        } catch {
            return null;
        }
    }

    public async update(code: string, data: Prisma.CourseUpdateInput) {
        return (
            (await prisma.course.updateMany({ where: { code }, data })).count >
            0
        );
    }

    public async delete(code: string) {
        try {
            return await prisma.course.delete({ where: { code } });
        } catch {
            return null;
        }
    }

    public async get(code: string) {
        return await prisma.course.findUnique({ where: { code } });
    }

    public async enroll(user: User, schedule: CourseScheduleModel) {
        if (!user.student) return;

        await prisma.studentUser.update({
            where: { id: user.student.id },
            data: {
                courses: {
                    create: {
                        courseSched: { connect: { id: schedule.id } },
                        gradeStatus: GradeStatus.Pending,
                        grade: 0.0,
                    },
                },
            },
        });
    }
}

export const courses = new CourseManager();
