import { UserModel } from "../services/prisma";

import { UserRole } from "./@types";

export class User implements UserModel {
    protected __user: UserModel;

    public readonly id: string;
    public readonly email: string;
    public readonly password: string;
    public readonly role: UserRole;
    public readonly session: number;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(user: UserModel) {
        this.__user = user;

        this.id = user.id;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role as UserRole;
        this.session = user.session;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }

    public get ref(): UserModel {
        return this.__user;
    }

    // TODO: Utility Functions
    public get studentNumber(): string {
        return "YYYY-NNNNN-CC-D";
    }

    public get isStudent(): boolean {
        return this.role == UserRole.Student;
    }

    public get isFacultyMember(): boolean {
        return this.role == UserRole.Faculty;
    }
}
