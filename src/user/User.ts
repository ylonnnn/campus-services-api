import prisma, { UserRole, UserModel } from "../services/prisma";

import { StudentUserPayload, FacultyUserPayload } from "./@types";

export class User implements UserModel {
    protected __user: UserModel;

    public readonly id: number;
    public readonly email: string;
    public readonly password: string;

    public readonly role: UserRole;
    public readonly session: number;

    protected _student?: StudentUserPayload | undefined;
    protected _faculty?: FacultyUserPayload | undefined;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(user: UserModel) {
        this.__user = user;

        this.id = user.id;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role;
        this.session = user.session;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;

        this.initialize();
    }

    protected async initialize() {
        this._student =
            (await prisma.studentUser.findUnique({
                where: { userId: this.id },
                include: { courses: true },
            })) ?? undefined;

        this._faculty =
            (await prisma.facultyUser.findUnique({
                where: { userId: this.id },
                include: { courses: true },
            })) ?? undefined;
    }

    public get ref(): UserModel {
        return this.__user;
    }

    public get student(): StudentUserPayload | undefined {
        return this._student;
    }

    public get faculty(): FacultyUserPayload | undefined {
        return this._faculty;
    }
}
