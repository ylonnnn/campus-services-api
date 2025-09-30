import prisma from "../services/prisma";

import { StudentScholasticStatus } from "../generated/prisma";
import { User } from "./User";
import { inclusions } from "./inclusion";

export interface UserName {
    given: string;
    middle?: string;
    last: string;
}

export type UserSelfData = { authenticated: boolean; message: string } & (
    | {
        authenticated: true;
        user: User;
    }
    | { authenticated: false }
);

export type UserPasswordRegenerationData = { message: string } & (
    | { regenerated: true; sentTo: string }
    | { regenerated: false }
);

export type UserRetrievalFn = (credential: string) => Promise<User | null>;

const testUserPayload = prisma.user.findUnique({
    where: { id: 0 },
    include: inclusions.user,
});

const testStudentPayload = prisma.studentUser.findUnique({
    where: { id: 0 },
    include: inclusions.student,
});

const testFacultyPayload = prisma.facultyUser.findUnique({
    where: { id: 0 },
    include: inclusions.faculty,
});

export type UserPayload = NonNullable<Awaited<typeof testUserPayload>>;
export type StudentUserPayload = NonNullable<
    Awaited<typeof testStudentPayload>
>;
export type FacultyUserPayload = NonNullable<
    Awaited<typeof testFacultyPayload>
>;

export interface UserAdditionalInfoName extends UserName { }
export interface UserAdditionalInfo {
    name: UserAdditionalInfoName;
}

export interface StudentUserAdditionalInfo extends UserAdditionalInfo {
    scholasticStatus: StudentScholasticStatus;
    program: string;
    year: number;
    section: string;
}

export enum UserAccountCreationStatus {
    InvalidCredentials = 0,
    EmailAlreadyUsed,
    Success,
}

export enum UserPasswordRegenerationStatus {
    InvalidCredential,
    UnknownUser,
    Success,
}
