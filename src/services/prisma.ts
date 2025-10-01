import {
    Prisma,
    PrismaClient,
    User,
    StudentUser,
    FacultyUser,
    UserRole,
    Program,
    Course,
    CourseSchedule,
    CourseEnrollment,
    Section,
} from "../generated/prisma";

const prisma = new PrismaClient();
export default prisma;

export {
    Prisma,
    UserRole,

    // Export models
    User as UserModel,
    StudentUser as StudentUserModel,
    FacultyUser as FacultyUserModel,
    CourseSchedule as CourseScheduleModel,
    CourseEnrollment as CourseEnrollmentModel,
    Program as ProgramModel,
    Course as CourseModel,
    Section as SectionModel,
};
