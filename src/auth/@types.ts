import { Request } from "express";

import { User } from "../user";

export interface AuthRequest extends Request {
    /**
     * NOTE: This field is required to be optional regardless of it being empty
     * as the initial `Request` interface is the expected type. Requiring this
     * field creates a polymorphism error as it introduces a new field. Technically
     * just a polymorphic widening of sorts.
     */
    users?: User[];
}

export type AuthorizationCondition = (
    user: User,
    request: AuthRequest
) => boolean;

// Response Data

export interface AuthenticationData {
    message: string;
}

export interface AuthorizationData {
    message: string;
}

export interface SignupData {
    signedUp: boolean;
    message: string;
}

export type LoginData = { loggedIn: boolean; message: string } & (
    | { loggedIn: true; token: string; user: User }
    | { loggedIn: false }
);

export interface RefreshData {
    message: string;
    token: string;

    /**
     * NOTE: Duration is saved in milliseconds
     */
    duration: number;
}

export interface LogoutData {
    loggedOut: boolean;
    message: string;
}
