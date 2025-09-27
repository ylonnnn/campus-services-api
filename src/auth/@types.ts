import { Request } from "express";

import { UserRole } from "../services/prisma";

export interface AuthUser {
    id: number;
    email: string;
    role: UserRole;
    session: number;
}

export enum AccountCreationStatus {
    InvalidCredentials = 0,
    EmailAlreadyUsed,
    Success,
}

export interface AuthRequest extends Request {
    /**
     * NOTE: This field is required to be optional regardless of it being empty
     * as the initial `Request` interface is the expected type. Requiring this
     * field creates a polymorphism error as it introduces a new field. Technically
     * just a polymorphic widening of sorts.
     */
    users?: AuthUser[];
}

export interface AuthenticationData {
    message: string;
}

export interface AuthorizationData {
    message: string;
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

export type AuthorizationCondition = (
    user: AuthUser,
    request: AuthRequest
) => boolean;
