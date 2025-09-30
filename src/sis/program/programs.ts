import { z } from "zod";

import prisma, { Prisma } from "../../services/prisma";

class ProgramManager {
    protected _dataSchema = z.object({
        code: z.string(),
        name: z.string(),
    });

    protected _partialDataSchema = this._dataSchema.partial();

    public get schema() {
        return this._dataSchema;
    }

    public get partialSchema() {
        return this._partialDataSchema;
    }

    public async create(code: string, name: string) {
        try {
            return await prisma.program.create({ data: { code, name } });
        } catch {
            return null;
        }
    }

    public async update(code: string, data: Prisma.ProgramUpdateInput) {
        this.update("", { code });
        return (
            (await prisma.program.updateMany({ where: { code }, data })).count >
            0
        );
    }

    public async delete(code: string) {
        try {
            return await prisma.program.delete({ where: { code } });
        } catch {
            return null;
        }
    }

    public async get(code: string) {
        return await prisma.program.findUnique({ where: { code } });
    }
}

export const programs = new ProgramManager();
