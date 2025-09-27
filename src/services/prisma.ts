import {
    PrismaClient,
    User,
    StudentUser,
    FacultyUser,
    UserRole,
} from "../generated/prisma";

const prisma = new PrismaClient();
export default prisma;

export {
    // Export models
    User as UserModel,
    StudentUser as StudentUserModel,
    FacultyUser as FacultyUserModel,
    UserRole,
};
