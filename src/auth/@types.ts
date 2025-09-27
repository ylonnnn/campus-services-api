import { Request } from "express";

import { UserRole } from "../user";

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    session: number;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}

export interface SignupData {
    message: string;
}

export type LoginData = { loggedIn: boolean; message: string } & (
    | { loggedIn: true; token: string; user: AuthUser }
    | { loggedIn: false }
);

export interface LogoutData {
    loggedOut: boolean;
    message: string;
}
