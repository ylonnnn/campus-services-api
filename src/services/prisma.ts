import {
    Prisma,
    PrismaClient,
    User,
    StudentUser,
    FacultyUser,
    UserRole,
} from "../generated/prisma";

const prisma = new PrismaClient();
export default prisma;

export {
    Prisma,

    // Export models
    User as UserModel,
    StudentUser as StudentUserModel,
    FacultyUser as FacultyUserModel,
    UserRole,
};
