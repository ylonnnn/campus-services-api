import { describe, it, beforeAll } from "@jest/globals";
import request from "supertest";

import { setup, tempStorage, TestApp } from "./app";
import { programs } from "../sis/program/programs";

const registerPrograms = async () => {
    await programs.create("BSCS", "Bachelor of Science in Computer Science");
};

describe("SIS Students test", () => {
    beforeAll(async () => {
        // Login to an administrator account
        await setup();
        await registerPrograms();
    });

    it("attempts to retrieve student data", async () => {
        const token = tempStorage.get("token");
        if (!token) {
            console.log("[should not be possible] token is missing");
            return;
        }

        const response = await request(TestApp)
            .get("/api/v1/sis/students/2025-00000-MN-X")
            .set("Authorization", `Bearer ${token}`);

        console.log(
            "/sis/students/:credential",
            response.status,
            response.body.user
        );
    });
});
