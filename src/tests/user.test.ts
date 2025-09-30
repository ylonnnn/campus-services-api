import { describe, it, expect, beforeAll } from "@jest/globals";
import request from "supertest";

import { TestApp } from "./app";
import { StudentScholasticStatus, UserRole } from "../generated/prisma";
import { StudentUserAdditionalInfo, users } from "../user";

describe("User tests", () => {
    beforeAll(async () => {
        const students: [email: string, info: StudentUserAdditionalInfo][] = [
            [
                "arroyoxylon@gmail.com",
                {
                    name: {
                        given: "Xylon",
                        middle: "Dela Torre",
                        last: "Arroyo",
                    },
                    program: "BSCS",
                    year: 2,
                    section: "BSCS1-1",
                    scholasticStatus: StudentScholasticStatus.Regular,
                },
            ],
            [
                "clarkxavierarroyo@gmail.com",
                {
                    name: {
                        given: "Clark Xavier",
                        middle: "Dela Torre",
                        last: "Arroyo",
                    },
                    program: "BSCS",
                    year: 1,
                    scholasticStatus: StudentScholasticStatus.Irregular,
                },
            ],
        ];

        for (const [email, info] of students) {
            const [status, student] = await users.registerStudent(email, info);

            console.log(status);
            console.log(student);
        }

        await users.registerFaculty("fakefaculty@edu.ph", "FakeFaculty123", {
            name: { given: "Fake", last: "Faculty" },
        });
    });

    it("attempts to login as a student with student number", async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                credentialKey: "2025-00000-MN-X",
                password: "9LnwXNF2",
            });

        console.log(response.status);
        console.log(response.body);
        if (response.status == 200)
            await request(TestApp)
                .post("/api/v1/auth/logout")
                .set("Authorization", `Bearer ${response.body.token}`);
    });

    // it("temp: regenerates user password", async () => {
    //     const response = await request(TestApp)
    //         .post("/api/v1/users/regen-pw")
    //         .send({
    //             credentialKey: "2025-00000-MN-X",
    //         });

    //     console.log(response.body);
    // });

    it("attempts to retrieve information of the user itself", async () => {
        // Login
        const response = await request(TestApp)
            .post("/api/v1/auth/login")
            .send({
                credentialKey: "2025-00000-MN-X",
                password: "9LnwXNF2",
            });

        const { token, user } = response.body;

        // Unlikely - Not possible
        if (!token || !user) return;

        // Request in /me
        const response1 = await request(TestApp)
            .get("/api/v1/users/me")
            .set("Authorization", `Bearer ${token}`);

        console.log("[self user information]", response1.body);

        await request(TestApp)
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${response.body.token}`);
    });

    it("attempts to create a user", async () => {
        const response = await request(TestApp)
            .post("/api/v1/users/")
            .send({
                email: "sample.user@example.com",
                password: "samplePassword#123",
                role: UserRole.Faculty,
                info: { name: "Sample User" },
            });

        switch (response.status) {
            case 401: {
                console.log(response.body);
                break;
            }

            case 403: {
                expect(response.body.message).toBe(
                    "Email provided is already used"
                );
                break;
            }

            case 200: {
                expect(response.body.message).toBe("User created successfully");
                expect(response.body.user.role).toBe(UserRole.Faculty);

                break;
            }
        }
    });
});
