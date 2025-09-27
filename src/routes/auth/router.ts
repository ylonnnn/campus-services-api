import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

import prisma, { UserRole } from "../../services/prisma";

import {
    AccountCreationStatus,
    AuthUser,
    createAccount,
    LoginData,
    LogoutData,
    SignupData,
} from "../../auth";

export const AuthRouter = Router();

AuthRouter.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    const status = await createAccount(email, password, UserRole.Student);

    switch (status) {
        case AccountCreationStatus.InvalidCredentials:
            return res
                .status(401)
                .json({ message: "Invalid credentials" } as SignupData);

        case AccountCreationStatus.EmailAlreadyUsed:
            return res.status(403).json({
                message: "Email provided is already in use",
            } as SignupData);

        case AccountCreationStatus.Success:
            return res
                .status(200)
                .json({ message: "Signed up successfully" } as SignupData);
    }
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
