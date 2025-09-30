import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";

import { setup, tempStorage, TestApp } from "./app";

describe("SIS Sections test", () => {
    beforeAll(async () => {
        //
        await setup();
    });

    it("attempts to create a section", async () => {
        console.log("token", tempStorage.get("token"));
        const response = await request(TestApp)
            .post("/api/v1/sis/sections")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`)
            .send({
                data: {
                    program: "BSCS",
                    code: "BSCS1-1",
                    year: 1,
                },
            });

        console.log(response.body);
        expect(1).toBe(1);
    });

    it("attempts to delete a section", async () => {
        // Temporary section
        await request(TestApp)
            .post("/api/v1/sis/sections")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`)
            .send({
                data: {
                    program: "BSCS",
                    code: "BSCS2-1",
                    year: 2,
                },
            });

        const response = await request(TestApp)
            .delete("/api/v1/sis/sections/BSCS2-1")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`);

        console.log(response.body);
    });

    afterAll(async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`);

        console.log("sis.sections", response.body);
    });
});
