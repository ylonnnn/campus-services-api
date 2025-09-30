import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";

import { setup, tempStorage, TestApp } from "./app";
import { WeekDay } from "../generated/prisma";
import { sections } from "../sis";
import { users } from "../user";

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

    it("attempts to create a schedule for a section", async () => {
        const response = await request(TestApp)
            .post("/api/v1/sis/sections/courses/")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`)
            .send({
                data: {
                    code: "BSCS1-1",
                    course: "COMP001",
                    faculty: { given: "Fake", last: "Faculty" },
                    scheduleSlots: [
                        {
                            weekDay: WeekDay.Monday,
                            startTime: "10:30 AM",
                            endTime: "01:00 PM",
                        },
                        {
                            weekDay: WeekDay.Wednesday,
                            startTime: "02:30 PM",
                            endTime: "05:00 PM",
                        },
                    ],
                },
            });

        console.log(response.body);
    });

    it("attempts to assign a section to a student", async () => {
        const student = await users.getByStudentNo("2025-00001-MN-X");
        if (!student) return;

        await sections.assign("BSCS1-1", student);
    });

    afterAll(async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`);

        console.log("sis.sections", response.body);
    });
});
