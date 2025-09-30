import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";

import { setup, tempStorage, TestApp } from "./app";

describe("Auth tests", () => {
    beforeAll(async () => {
        // Login to an administrator account
        await setup();
    });

    it("attempts to sign up a user", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/signup")
            .send({
                email: "anothertest@example.com",
                password: "Admin#123",
                info: { name: { given: "Another", last: "Test" } },
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

    it("attempts to sign up another user", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/signup")
            .send({
                email: "test@example.com",
                password: "ADMIN_test@123",
                info: { name: { given: "Test", last: "Test" } },
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
                info: { name: "Invalid Email Address" },
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
    });

    it("attempts to login to an existing user", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                credentialKey: "test@example.com",
                password: "ADMIN_test@123",
            });

        if (response.status == 200) {
            await request(TestApp)
                .post("/api/v1/auth/logout")
                .set("Authorization", `Bearer ${response.body.token}`);
        }
        // expect(response.status).toBe(200);
        // expect(response.body.message).toBe("Logged in successfully");
    });

    it("attempts to login to an existing user with an incorrect password", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                credentialKey: "test@example.com",
                password: "ThisIsAnIncorrectPassword",
            });

        response;
        // expect(response.status).toBe(401);
        // expect(response.body.message).toBe("Invalid credentials");
    });

    it("attempts to login to a user that does not exist", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                credentialKey: "nonexisting@account.com",
                password: "thisaccountdoesnotexist",
            });

        expect(response.status).toBe(401);
        console.log(response.body);
    });

    it("attempts to logout from a user", async () => {
        // Login temporarily to be able to logout
        const loginResponse = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                credentialKey: "test@example.com",
                password: "ADMIN_test@123",
            });

        console.log(loginResponse.body);
        if (loginResponse.status == 200) {
            await request(TestApp)
                .post("/api/v1/auth/logout")
                .set("Authorization", `Bearer ${loginResponse.body.token}`);

            // Attempt to logout from the account
            // const response = await request(TestApp)
            //     .post("/api/v1/auth/logout")
            //     .
        }
    });

    afterAll(async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`);
        console.log("auth", response.body);
    });
});
