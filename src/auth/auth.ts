import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

import prisma, { UserRole } from "../services/prisma";

import {
    AccountCreationStatus,
    AuthRequest,
    AuthUser,
    AuthenticationData,
    AuthorizationCondition,
    AuthorizationData,
} from "./@types";

export async function authenticate(
    request: AuthRequest,
    response: Response,
    next: NextFunction
) {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token)
        return response
            .status(401)
            .json({ message: "Invalidk token" } as AuthenticationData);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        request.users = [decoded as AuthUser];

        if (request.users?.[0]) {
            const [{ id, session }] = request.users;
            const user = await prisma.user.findUnique({ where: { id } });

            if (!user || session != user.session)
                return response
                    .status(401)
                    .json({ message: "Invalid token" } as AuthenticationData);
        }

        next();
    } catch (err) {
        console.log(err);
        return response
            .status(401)
            .json({ message: "Invalid token" } as AuthenticationData);
    }
}

export function authorization(condition: AuthorizationCondition) {
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

export async function createAccount(
    email: string,
    password: string,
    role: UserRole
): Promise<AccountCreationStatus> {
    // Email and Password Validation
    if (
        !validator.isEmail(email) ||
        !validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 1,
        })
    )
        return AccountCreationStatus.InvalidCredentials;

    // Usage Validation
    if (await prisma.user.findUnique({ where: { email } }))
        return AccountCreationStatus.EmailAlreadyUsed;

    // Account Creation
    await prisma.user.create({
        data: {
            email,
            password: await bcrypt.hash(password, process.env.SALT_LENGTH!),
            role,
        },
    });

    return AccountCreationStatus.Success;
}
