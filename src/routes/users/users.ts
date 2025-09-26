import { Router } from "express";

import {
    authenticationMiddleware,
    authorizationMiddleware,
} from "../auth/utils";

export const UserRouter = Router();

UserRouter.get(
    "/:id",
    authenticationMiddleware,
    authorizationMiddleware,
    (_, res) => {
        const someRes = {
            test: 200,
            message: "OK",
        };

        res.status(200).json(someRes);
    },
);
