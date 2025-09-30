import { z } from "zod";

import prisma, { Prisma } from "../../services/prisma";

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
}

export const courses = new CourseManager();
