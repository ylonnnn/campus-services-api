import dotenv from "dotenv";

import app from "../ExpressApp";

dotenv.config();

// Setup the routes
import "../routes";
import { users } from "../user";
import { UserRole } from "../generated/prisma";
import { auth } from "../auth";

const tempStorage = new Map<string, any>();

export const TEST_ADMIN = {
    email: "sample.admin@example.com",
    password: "Admin#123",
};

export const setup = async () => {
    await users.create(
        TEST_ADMIN.email,
        TEST_ADMIN.password,
        UserRole.Administrator,
        { name: { given: "Sample", last: "Admin" } }
    );

    const data = await auth.login(TEST_ADMIN.email, TEST_ADMIN.password);

    if (data.loggedIn) {
        tempStorage.set("token", data.token);
        tempStorage.set("email", data.user.email);
    }
};

export { app as TestApp, tempStorage };
