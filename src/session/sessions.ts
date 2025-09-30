import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

import prisma, { Prisma } from "../services/prisma";

import { inclusions, User, UserPayload } from "../user";

class SessionManager {
    /**
     * @param user The user payload to generate a token
     * @param expiration The expiration of the token in minutes
     * @returns Returns the token
     */
    public generateToken(user: UserPayload, expiration: number = 15) {
        return jwt.sign(
            { ...user, jti: randomUUID() },
            process.env.JWT_SECRET!,
            { expiresIn: `${expiration}m` }
        );
    }

    public async create(user: User) {
        let token = this.generateToken(user.ref);
        while (await this.get(token)) token = this.generateToken(user.ref);

        return await prisma.session.create({
            data: { token, user: { connect: { id: user.id } } },
            include: { user: { include: inclusions.user } },
        });
    }

    public async update(token: string, data: Prisma.SessionUpdateInput) {
        return (
            (await prisma.session.updateMany({ where: { token }, data }))
                .count > 0
        );
    }

    public async delete(token: string) {
        try {
            return await prisma.session.delete({ where: { token } });
        } catch {
            return null;
        }
    }

    public async get(token: string) {
        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: { include: inclusions.user } },
        });

        if (!session) return null;

        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            return session;
        } catch {
            this.delete(token);

            return null;
        }
    }

    public async getAll(userId: number, clean: boolean = true) {
        const entries = await prisma.session.findMany({
            where: { userId },
            include: { user: { include: inclusions.user } },
        });

        if (!clean) return entries;

        return entries.filter((entry) => {
            try {
                jwt.verify(entry.token, process.env.JWT_SECRET!);
                return true;
            } catch {
                this.delete(entry.token);

                return false;
            }
        });
    }

    public async refresh(
        token: string
    ): Promise<[token: string, duration: number]> {
        const session = await this.get(token);
        if (!session) return [token, 0];

        const duration = 15;
        const newToken = this.generateToken(session.user, duration);

        this.update(token, { token: newToken });

        return [token, duration];
    }

    /**
     * Verifies a token and attempts to refresh the session if it is still active
     * @param token The token of a session to be verified
     * @returns Returns the status of the verification and the existing valid token or regenerated token
     */
    public verify(token: string) {
        try {
            return jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as jwt.JwtPayload as jwt.JwtPayload & UserPayload;
        } catch {
            return null;
        }
    }
}

export const sessions = new SessionManager();
