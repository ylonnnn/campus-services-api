import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AuthRequest, AuthUser } from "./@types";
import { UserRole } from "../../user";
import prisma from "../../services/prisma";

export async function authenticate(
    request: AuthRequest,
    response: Response,
    next: NextFunction,
) {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) return response.sendStatus(401);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        request.user = decoded as AuthUser;

        if (request.user) {
            const { id, session } = request.user;
            const user = await prisma.user.findUnique({ where: { id } });

            if (!user || session != user.session)
                return response.sendStatus(401).json({ message: "Invalid token" });
        }

        next();
    } catch (err) {
        // console.log(err);
        return response.status(401).json({ message: "Invalid token" });
    }
}

export function authorization(roles: Set<UserRole>) {
    return function authorizationMiddleware(
        request: AuthRequest,
        response: Response,
        next: NextFunction,
    ) {
        const { user } = request;
        if (!user) return response.status(401).json({ message: "Unauthenticated" });

        if (!roles.has(user.role) && user.id != request.params.id)
            return response.status(403).json({ message: "Insufficient permissions" });

        next();
    };
}
