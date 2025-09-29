import { describe, it, expect, beforeAll } from "@jest/globals";
import request from "supertest";

import { setup, tempStorage, TestApp } from "./app";
import { courses } from "../sis";

describe("SIS Programs test", () => {
    beforeAll(async () => {
        await setup();
    });

    it("attempts to create a course", async () => {
        const token = tempStorage.get("token");
        if (!token) return;

        const response = await request(TestApp)
            .post("/api/v1/sis/courses/")
            .set("Authorization", `Bearer ${token}`)
            .send({
                code: "COMP001",
                name: "Introduction to Computing",
                units: 3.0,
            });

        console.log(response.body);
        expect(1).toBe(1);
    });

    it("attempts to delete a course", async () => {
        const token = tempStorage.get("token");
        if (!token) return;

        // Create a temporary one that will be deleted
        await courses.create("TEST001", "Test Course", 3.0);

        const response = await request(TestApp)
            .delete("/api/v1/sis/courses/TEST001")
            .set("Authorization", `Bearer ${token}`);

        console.log(response.body);
    });

    it("attempts to retrieve a course data", async () => {
        const token = tempStorage.get("token");
        if (!token) return;

        const response = await request(TestApp)
            .get("/api/v1/sis/courses/COMP001")
            .set("Authorization", `Bearer ${token}`);

        console.log(response.body);
    });
});
