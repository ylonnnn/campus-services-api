import { Response, NextFunction, Router } from "express";

import { UserRole } from "../../generated/prisma";

import prisma from "../../services/prisma";
import { authenticate, authorization, AuthRequest, AuthUser } from "../../auth";
import { User, UserSelfData } from "../../user";
import { userAuthority } from "../../user/user-authority";

export const UserRouter = Router();

UserRouter.get("/me", authenticate, ({ users = [] }: AuthRequest, res) => {
    return res.status(200).json({
        authenticated: true,
        message: "Self data retrieval successful",
        user: users[0] as AuthUser, // users[0] is expected to be the self
    } as UserSelfData);
});

const retrieveUser = async (
    { users = [], params }: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const id = params.id as string; // id is guaranteed to be a parameter
    const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
    });

    if (!user)
        return res
            .status(404)
            .json({ message: "Unknown user with the provided id" });

    users.push(user);

    next();
};

UserRouter.get(
    "/:id",
    authenticate,
    retrieveUser, // Retrieves the user with the provided id
    authorization((user, { users = [] }) => {
        const [self, target] = users;
        if (!self || !target) return false;

        return self.id == target.id || user.role != UserRole.Student;
    }),

    ({ users = [] }: AuthRequest, res) => {
        res.json({
            status: 200,
            user: users[1] as AuthUser, //  users[1] is guaranteed to be the target user
        });
    }
);

UserRouter.patch(
    "/:id",
    authenticate,
    retrieveUser,
    authorization((user, { users = [] }: AuthRequest) => {
        const authorizedRoles = userAuthority.get(user.role);
        const target = users[1] as AuthUser;

        return !!authorizedRoles?.has(target.role);
    }),
    async (req: AuthRequest, res) => {
        const { users = [] } = req;
        const target = users[1] as AuthUser;
        const targetEntry = await prisma.user.findUnique({
            where: { id: target.id },
        });

        if (!targetEntry)
            return res
                .status(400)
                .json({ message: "Invalid user id provided" });

        const user = new User(targetEntry);

        console.log(user);

        res.status(200).json({
            message: "Patched user witht the provided id successfully",
        });
    }
);
