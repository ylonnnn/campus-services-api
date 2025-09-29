import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
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
import { inclusions, User, UserPayload } from "../user";

class Auth {
    public async authenticate(
        request: AuthRequest,
        response: Response,
        next: NextFunction
    ) {
        const authHeader = request.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token)
            return response
                .status(401)
                .json({ message: "Invalid token" } as AuthenticationData);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!);
            request.users = [new User(decoded as UserPayload)];

            // TODO: Session Management for multiple clients on the same account
            // if (request.users?.[0]) {
            //     const [{ id, session }] = request.users;
            //     const user = await prisma.user.findUnique({ where: { id } });

            //     if (!user || session != user.session)
            //         return response.status(401).json({
            //             message: "Invalid token",
            //         } as AuthenticationData);
            // }

            next();
        } catch (err) {
            console.log(err);
            return response
                .status(401)
                .json({ message: "Invalid token" } as AuthenticationData);
        }
    }

    public authorization(condition: AuthorizationCondition) {
        return function authorizationMiddleware(
            request: AuthRequest,
            response: Response,
            next: NextFunction
        ) {
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

        // Generate JSON Web Token
        const token = jwt.sign(user, process.env.JWT_SECRET!, {
            expiresIn: "15m",
        });

        return {
            loggedIn: true,
            message: "Logged in successfully",
            token,
            user: new User(user),
        } as LoginData;
    }
}

export const auth = new Auth();
