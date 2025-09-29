import prisma from "../../services/prisma";

class ProgramManager {
    public async create(code: string, name: string) {
        try {
            return await prisma.program.create({ data: { code, name } });
        } catch {
            return null;
        }
    }

    public async get(code: string) {
        return await prisma.program.findUnique({ where: { code } });
    }
}

export const programs = new ProgramManager();
