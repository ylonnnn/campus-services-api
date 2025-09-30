import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";

import prisma from "../services/prisma";

import {
    AuthRequest,
    AuthenticationData,
    AuthorizationCondition,
    AuthorizationData,
    LoginData,
} from "./@types";

import { students } from "../sis";
import { inclusions, User } from "../user";
import { sessions } from "../session";

class Auth {
    public constructor() {
        this.authenticate = this.authenticate.bind(this);
    }

    public tokenFromRequest(request: Request) {
        return request.headers.authorization?.split(" ")[1];
    }

    public async authenticate(
        request: AuthRequest,
        response: Response,
        next: NextFunction
    ) {
        const token = this.tokenFromRequest(request);
        if (!token)
            return response
                .status(401)
                .json({ message: "Invalid token" } as AuthenticationData);

        const payload = sessions.verify(token);
        if (!payload)
            return response
                .status(403)
                .json({ message: "Invalid or expired token" });

        request.users = [new User(payload)];
        next();
    }

    public authorization(condition: AuthorizationCondition) {
        return (
            request: AuthRequest,
            response: Response,
            next: NextFunction
        ) => {
            const [user] = request.users ?? [];
            if (!user)
                return response
                    .status(401)
                    .json({ message: "Unauthenticated" } as AuthorizationData);

            if (!condition(user, request))
                return response.status(403).json({
                    message: "Insufficient permissions",
                } as AuthorizationData);

            next();
        };
    }

    /**
     * Logs in to the user with the specified credential key and password
     * @param credentialKey The credential key to be used. This can be the user's email or student number
     * @param password The password of the user to log in to
     */
    public async login(
        credentialKey: string,
        password: string
    ): Promise<LoginData> {
        const user = validator.isEmail(credentialKey)
            ? await prisma.user.findUnique({
                where: { email: credentialKey },
                include: inclusions.user,
            })
            : students.isStudentNo(credentialKey)
                ? await prisma.user.findFirst({
                    where: { student: { studentNo: credentialKey } },
                    include: inclusions.user,
                })
                : null;

        if (!user || !(await bcrypt.compare(password, user.password)))
            return {
                loggedIn: false,
                message: "Invalid credentials",
            } as LoginData;

        // Create a session
        const session = await sessions.create(new User(user));
        return {
            loggedIn: true,
            message: "Logged in successfully",
            token: session.token,
            user: new User(user),
        } as LoginData;
    }

    public async logout(token: string) {
        return await sessions.delete(token);
    }
}

export const auth = new Auth();
