import { describe, it, expect } from "@jest/globals";
import request from "supertest";

import { TestApp } from "./app";

describe("Auth tests", () => {
    it("attempts to sign up a user", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/signup")
            .send({
                email: "anothertest@example.com",
                password: "Admin#123",
            });

        if (response.body.signedUp) {
            expect(response.status).toBe(200); // For the first time
            expect(response.body.message).toBe("Signed up successfully");
        } else {
            expect(response.status).toBe(403); // Already in use
            expect(response.body.message).toBe(
                "Email provided is already in use"
            );
        }
    });

    it("attempts to sign up a user with an invalid email", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/signup")
            .send({
                email: "invalidemailaddress",
                password: "ValidP@assw0rd",
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid login credentials");
    });

    it("attempts to login to an existing user", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                email: "test@example.com",
                password: "admin123",
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Logged in successfully");
    });

    it("attempts to login to an existing user with an incorrect password", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                email: "test@example.com",
                password: "ThisIsAnIncorrectPassword",
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid login credentials");
    });

    it("attempts to login to a user that does not exist", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                email: "nonexisting@account.com",
                password: "thisaccountdoesnotexist",
            });

        expect(response.status).toBe(401);
        console.log(response.body);
    });

    it("users patch", async () => {
        const response = await request(TestApp)
            .patch("/api/v1/users/1")
            .send({ randomdata: "hello world" });

        console.log(response.status, response.body);
    });
});
