import prisma, { UserRole, UserModel } from "../services/prisma";

import {
    StudentUserPayload,
    FacultyUserPayload,
    UserName,
    UserPayload,
} from "./@types";

import { inclusions } from "./inclusion";

export class User implements Omit<UserModel, "name" | "student" | "faculty"> {
    protected __user: UserPayload;

    public readonly id: number;

    public readonly email: string;
    public readonly password: string;

    public readonly name: UserName;

    public readonly role: UserRole;

    protected _student?: StudentUserPayload | undefined;
    protected _faculty?: FacultyUserPayload | undefined;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public constructor(user: UserPayload) {
        this.__user = user;

        this.id = user.id;
        this.email = user.email;
        this.password = user.password;
        this.name = user.name as object as UserName;
        this.role = user.role;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;

        this.initialize();
    }

    public async initialize() {
        this.__user.student =
            (this._student =
                (await prisma.studentUser.findUnique({
                    where: { userId: this.id },
                    include: inclusions.student,
                })) ?? undefined) ?? null;

        this.__user.faculty =
            (this._faculty =
                (await prisma.facultyUser.findUnique({
                    where: { userId: this.id },
                    include: inclusions.faculty,
                })) ?? undefined) ?? null;
    }

    public get ref(): UserPayload {
        return this.__user;
    }

    public get student(): StudentUserPayload | undefined {
        return this._student;
    }

    public get faculty(): FacultyUserPayload | undefined {
        return this._faculty;
    }
}
