import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

import prisma from "../../services/prisma";

import { AuthUser, LoginData, LogoutData, SignupData } from "../../auth";
import { UserRole } from "../../user";

export const AuthRouter = Router();

const SALT_LENGTH = 10;

AuthRouter.post("/signup", async (req, res) => {
    const { email, password } = req.body;

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
        return res
            .status(401)
            .json({ message: "Invalid login credentials" } as LoginData);

    const user = await prisma.user.findUnique({ where: { email } });
    if (user)
        return res.status(403).json({
            message: "Email provided is already in use",
        } as SignupData);

    const hashed = await bcrypt.hash(password, SALT_LENGTH);
    await prisma.user.create({ data: { email, password: hashed } });

    return res
        .status(200)
        .json({ message: "Signed up successfully" } as SignupData);
});

AuthRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(401).json({
            loggedIn: false,
            message: "Invalid login credentials",
        } as LoginData);

    // Generate JSON Web Token
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            session: user.session,
        } as AuthUser,
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
    );

    return res.status(200).json({
        loggedIn: true,
        message: "Logged in successfully",
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            session: user.session,
        },
    } as LoginData);
});

AuthRouter.post("/logout", async (req, res) => {
    const { email } = req.body;
    console.log("email:", email);
    if (!email)
        return res.status(401).json({
            loggedOut: false,
            message: "Unknown user with the provided email",
        } as LogoutData);

    const updated = (
        await prisma.user.updateMany({
            where: { email },
            data: { session: { increment: 1 } },
        })
    ).count;

    if (!updated)
        return res.status(401).json({
            loggedOut: false,
            message: "Unknown user with the provided email",
        } as LogoutData);

    return res.status(200).json({
        loggedOut: true,
        message: "Logged out successfully",
    } as LogoutData);
});
