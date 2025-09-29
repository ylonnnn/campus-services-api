import { Router } from "express";

import prisma, { UserRole } from "../../services/prisma";

import { auth, LoginData, LogoutData, SignupData } from "../../auth";
import { users, UserAccountCreationStatus } from "../../user";
import { isString } from "../../utils";

export const AuthRouter = Router();

AuthRouter.post("/signup", async (req, res) => {
    const { email, password, info } = req.body;
    const [status] = await users.create(
        email,
        password,
        UserRole.Visitor,
        info
    );

    switch (status) {
        case UserAccountCreationStatus.InvalidCredentials:
            return res.status(401).json({
                signedUp: false,
                message: "Invalid credentials",
            } as SignupData);

        case UserAccountCreationStatus.EmailAlreadyUsed:
            return res.status(403).json({
                signedUp: false,
                message: "Email provided is already in use",
            } as SignupData);

        case UserAccountCreationStatus.Success:
            return res.status(200).json({
                signedUp: true,
                message: "Signed up successfully",
            } as SignupData);
    }
});

AuthRouter.post("/login", async (req, res) => {
    const { credentialKey, password } = req.body;
    if (!isString(credentialKey) || !isString(password))
        return res.status(400).json({
            loggedIn: false,
            message: "Missing credentials",
        } as LoginData);

    const data = await auth.login(credentialKey, password);
    return res.status(data.loggedIn ? 200 : 401).json(data);
});

AuthRouter.post("/logout", async (req, res) => {
    const { email } = req.body;
    if (!isString(email))
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
