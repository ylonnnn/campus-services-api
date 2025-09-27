import { Router } from "express";

import { authenticate, authorization, AuthRequest } from "../../auth";
import { UserRole } from "../../user";

export const UserRouter = Router();

UserRouter.get(
    "/:id",
    authenticate,
    authorization(new Set<UserRole>().add(UserRole.Faculty)),
    (req, res) => {
        const request = req as AuthRequest;
        res.json({ status: 200, user: request.user });
    }
);
