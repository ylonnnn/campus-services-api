import prisma from "../../services/prisma";

class CourseManager {
    public async create(code: string, name: string, units: number) {
        try {
            return await prisma.course.create({ data: { code, name, units } });
        } catch {
            return null;
        }
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
