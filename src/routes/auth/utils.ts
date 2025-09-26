import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticationMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
) {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) return response.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
        console.log(err);
        console.log(JSON.stringify(decoded));
    });

    next();
}

export function authorizationMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
) {
    console.log("from authorization middleware: ", request.headers);
    response;

    next();
}
