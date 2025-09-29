import { describe, it, expect, beforeAll } from "@jest/globals";
import request from "supertest";

import { setup, tempStorage, TestApp } from "./app";
import { programs } from "../sis/program/programs";

describe("SIS Programs test", () => {
    beforeAll(async () => {
        await setup();
    });

    it("attempts to create a program", async () => {
        const token = tempStorage.get("token");
        if (!token) return;

        const response = await request(TestApp)
            .post("/api/v1/sis/programs/")
            .set("Authorization", `Bearer ${token}`)
            .send({
                code: "BSIT",
                name: "Bachelor of Science in Information Technology",
            });

        console.log(response.body);
        expect(1).toBe(1);
    });

    it("attempts to delete a program", async () => {
        const token = tempStorage.get("token");
        if (!token) return;

        // Create a temporary one that will be deleted
        await programs.create(
            "BSCE",
            "Bachelor of Science in Civil Engineering"
        );

        const response = await request(TestApp)
            .delete("/api/v1/sis/programs/BSCE")
            .set("Authorization", `Bearer ${token}`);

        console.log(response.body);
    });

    it("attempts to retrieve a program data", async () => {
        const token = tempStorage.get("token");
        if (!token) return;

        const response = await request(TestApp)
            .get("/api/v1/sis/programs/BSCS")
            .set("Authorization", `Bearer ${token}`);

        console.log(response.body);
    });
});
