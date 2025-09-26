import { Router } from "express";

import {
    authenticate,
    authorization,
} from "../auth/authentication";
import { UserRole } from "../../user";

export const UserRouter = Router();

UserRouter.get(
    "/:id",
    authenticate,
    authorization(new Set<UserRole>().add(UserRole.Faculty)),
    (_, res) => {
        res.json({ status: 200 });
    },
);
