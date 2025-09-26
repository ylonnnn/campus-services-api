import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../../services/prisma";

export const AuthRouter = Router();

const SALT_LENGTH = 10;

AuthRouter.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) return res.status(403).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, SALT_LENGTH);
    await prisma.user.create({ data: { email, password: hashed } });

    return res.status(200).json({ message: "User created successfully" });
});

AuthRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ message: "Invalid login credentials" });

    // Generate JSON Web Token
    const token = jwt.sign(
        {
            userId: user.id,
            userEmail: user.email,
        },
        process.env.JWT_SECRET! || "secret-bleh",
        { expiresIn: "1h" },
    );

    return res.status(200).json({
        token,
        user: { id: user.id, email: user.email },
        message: "Login successfully",
    });
});
