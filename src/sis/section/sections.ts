import { z } from "zod";

import prisma, { Prisma } from "../../services/prisma";

import { programs } from "../program";

class SectionManager {
    protected _dataSchema = z.object({
        program: z.string(),
        code: z.string(),
        year: z.number(),
    });

    protected _partialDataSchema = this._dataSchema.partial();

    public get schema() {
        return this._dataSchema;
    }

    public get partialSchema() {
        return this._partialDataSchema;
    }

    public async create(programCode: string, code: string, year: number) {
        try {
            const program = await programs.get(programCode);
            if (!program) return null;

            return await prisma.section.create({
                data: { program: { connect: { id: program.id } }, code, year },
            });
        } catch {
            return null;
        }
    }

    public async update(code: string, data: Prisma.SectionUpdateInput) {
        return (
            (await prisma.section.updateMany({ where: { code }, data })).count >
            0
        );
    }

    public async delete(code: string) {
        try {
            return await prisma.section.delete({ where: { code } });
        } catch {
            return null;
        }
    }

    public async get(code: string) {
        return await prisma.section.findUnique({ where: { code } });
    }

    public async getAllFrom(programCode: string) {
        const program = await programs.get(programCode);
        if (!program) return [];

        return await prisma.section.findMany({ where: { program } });
    }
}

export const sections = new SectionManager();
