import { Router } from "express";

import { UserRole } from "../../../generated/prisma";

import { User, userAuthority, users } from "../../../user";
import { auth, AuthRequest } from "../../../auth";

export const StudentRouter = Router();

StudentRouter.get(
    "/:studentno",
    auth.authenticate,
    users.retrieval("studentno", users.getByStudentNo),
    auth.authorization(
        (user) => !!userAuthority.get(user.role)?.has(UserRole.Student)
    ),
    async (req: AuthRequest, res) => {
        if (!req.users)
            return res.status(404).json({ message: "Missing expected users" });

        return res.status(200).json({ user: req.users[1] as User });
    }
);
