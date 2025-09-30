import { Router } from "express";

import { UserRole } from "../../services/prisma";

import {
    auth,
    AuthRequest,
    LoginData,
    LogoutData,
    SignupData,
} from "../../auth";
import { users, UserAccountCreationStatus } from "../../user";
import { isString, MINUTE } from "../../utils";
import { sessions } from "../../session";

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

AuthRouter.post("/refresh", auth.authenticate, async (req, res) => {
    const token = auth.tokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Unauthenticated" });

    const [newToken, duration] = await sessions.refresh(token);
    return res.status(duration ? 200 : 403).json({
        message: duration
            ? "Refreshed session successfully"
            : "Session does not exist",
        token: newToken,
        duration: MINUTE(duration),
    });
});

AuthRouter.post("/logout", auth.authenticate, async (req: AuthRequest, res) => {
    const token = auth.tokenFromRequest(req);

    // Unlikely
    if (!token)
        return res.status(403).json({
            loggedOut: false,
            message: "Unauthenticated client",
        } as LogoutData);

    const session = await auth.logout(token);
    return res.status(session ? 200 : 403).json({
        loggedOut: true,
        message: session ? "Logged out successfully" : "Session does not exist",
    } as LogoutData);
});
