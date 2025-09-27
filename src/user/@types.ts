import prisma from "../services/prisma";

import { AuthUser } from "../auth";

export type UserSelfData = { authenticated: boolean; message: string } & (
    | {
          authenticated: true;
          user: AuthUser;
      }
    | { authenticated: false }
);

const testStudentPayload = prisma.studentUser.findUnique({
    where: { id: 0 },
    include: { courses: true },
});

const testFacultyPayload = prisma.facultyUser.findUnique({
    where: { id: 0 },
    include: { courses: true },
});

export type StudentUserPayload = Awaited<typeof testStudentPayload>;
export type FacultyUserPayload = Awaited<typeof testFacultyPayload>;
