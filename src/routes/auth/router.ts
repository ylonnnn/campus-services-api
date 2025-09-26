import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../../services/prisma";

import { LoginData, LogoutData, SignedUpData } from "./@types";

import { UserRole } from "../../user";

export const AuthRouter = Router();

const SALT_LENGTH = 10;

AuthRouter.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        const data: SignedUpData = { message: "Email provided is already in use" };
        return res.status(403).json(data);
    }

    const hashed = await bcrypt.hash(password, SALT_LENGTH);
    await prisma.user.create({ data: { email, password: hashed } });

    const data: SignedUpData = { message: "User created successfully" };

    return res.status(200).json(data);
});

AuthRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // TODO: email validation
    // TODO: password (input and strength) validation

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        const data: LoginData = {
            loggedIn: false,
            message: "Invalid login credentials",
        };

        return res.status(401).json(data);
    }

    // Generate JSON Web Token
    const token = jwt.sign(
        {
            userId: user.id,
            userEmail: user.email,
            userRole: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" },
    );

    const data: LoginData = {
        loggedIn: true,
        message: "Logged in successfully",
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            session: user.session,
        },
    };

    return res.status(200).json(data);
});

AuthRouter.post("/logout", async (req, res) => {
    const { email } = req.body;
    const data: LogoutData = {
        loggedOut: false,
        message: "",
    };

    if (!email) {
        data.message = "Unknown user with the email provided";
        return res.status(401).json(data);
    }

    const updated = (
        await prisma.user.updateMany({
            where: { email },
            data: { session: { increment: 1 } },
        })
    ).count;

    if (!updated) {
        data.message = "Unknown user with email provided";
        return res.status(401).json(data);
    }

    data.loggedOut = true;
    data.message = "Logged out successfully";

    return res.status(200).json(data);
});
