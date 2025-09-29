import { Router } from "express";

import { UserRole } from "../../generated/prisma";

import { auth, AuthRequest } from "../../auth";
import {
    User,
    UserAccountCreationStatus,
    UserPasswordRegenerationData,
    UserSelfData,
    userAuthority,
    users,
} from "../../user";
import { isArray, isString } from "../../utils";

export const UserRouter = Router();

UserRouter.post(
    "/",
    auth.authenticate,
    auth.authorization((user) => user.role == UserRole.Administrator),
    async (req, res) => {
        const { email, password, role, info } = req.body;
        if (!isArray<string>([email, password, role], isString) || !info)
            return res
                .status(400)
                .json({ message: "Invalid or missin credentials" });

        const [status, user] = await users.create(email, password, role, info);

        switch (status) {
            case UserAccountCreationStatus.InvalidCredentials:
                return res.status(401).json({ message: "Invalid credentials" });

            case UserAccountCreationStatus.EmailAlreadyUsed:
                return res
                    .status(403)
                    .json({ message: "Email provided is already used" });

            case UserAccountCreationStatus.Success:
                return res.status(200).json({
                    message: "User created successfully",
                    user,
                });
        }
    }
);

UserRouter.get("/me", auth.authenticate, ({ users = [] }: AuthRequest, res) => {
    return res.status(200).json({
        authenticated: true,
        message: "Self data retrieval successful",
        user: users[0] as User, // users[0] is expected to be the self
    } as UserSelfData);
});

UserRouter.post("/regen-pw", async (req: AuthRequest, res) => {
    const { credentialKey } = req.body;
    if (!isString(credentialKey))
        return res.status(400).json({
            regenerated: false,
            message: "Invalid or missing credentials",
        } as UserPasswordRegenerationData);

    const recipient = await users.regenerateUserPassword(credentialKey);

    return res.status(recipient ? 200 : 401).json({
        message: recipient
            ? "Regenerated password successfully"
            : "Failed to regenerate password",
        sentTo: recipient,
    } as UserPasswordRegenerationData);
});

UserRouter.get(
    "/:credential",
    auth.authenticate,
    users.retrieval("credential"),
    auth.authorization((user, { users = [] }) => {
        const [self, target] = users;
        if (!self || !target) return false;

        return self.id == target.id || user.role != UserRole.Student;
    }),

    ({ users = [] }: AuthRequest, res) => {
        res.json({
            status: 200,
            user: users[1] as User, //  users[1] is guaranteed to be the target user
        });
    }
);

UserRouter.patch(
    "/:credential",
    auth.authenticate,
    users.retrieval("credential"),
    auth.authorization((user, { users = [] }: AuthRequest) => {
        const authorizedRoles = userAuthority.get(user.role);
        const target = users[1] as User;

        return !!authorizedRoles?.has(target.role);
    }),
    async ({ users: _users = [] }: AuthRequest, res) => {
        const target = _users[1] as User;
        const user = users.getById(target.id);

        if (!user)
            return res
                .status(400)
                .json({ message: "Invalid user id provided" });

        // console.log(user);

        res.status(200).json({
            message: "Patched user witht the provided id successfully",
        });
    }
);
