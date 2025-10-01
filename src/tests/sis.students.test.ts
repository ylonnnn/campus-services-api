import { describe, it, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";

import { GradeStatus, WeekDay } from "../generated/prisma";

import { setup, tempStorage, TestApp } from "./app";
import { courses, programs, sections } from "../sis";

const registerPrograms = async () => {
    await programs.create("BSCS", "Bachelor of Science in Computer Science");
};

const registerSections = async () => {
    await sections.create("BSCS", "BSCS2-1", 2);
};

const registerCourses = async () => {
    await courses.create("COMP002", "Computer Programming 1", 3.0);
    await courses.create("COMP009", "Object-Oriented Programming", 3.0);
};

// @ts-expect-error
const ensure = async () => {
    await sections.createSchedule(
        "BSCS1-1",
        "COMP002",
        { given: "Fake", last: "Faculty" },
        [
            {
                weekDay: WeekDay.Tuesday,
                startTime: "03:00 PM",
                endTime: "07:00 PM",
            },
        ]
    );
};

describe("SIS Students test", () => {
    beforeAll(async () => {
        // Login to an administrator account
        await setup();
        await registerPrograms();
        await registerSections();
        await registerCourses();

        // await ensure();
    }, 20_000);

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
            response.body.user,
            response.body.user._student.courses
        );

        for (const course of response.body.user._student.courses) {
            console.log(course.courseSched);
            console.log(course.courseSched.course);
        }
    });

    it("attempts to retrieve student data #2", async () => {
        const token = tempStorage.get("token");
        if (!token) {
            console.log("[should not be possible] token is missing");
            return;
        }

        const response = await request(TestApp)
            .get("/api/v1/sis/students/2025-00001-MN-X")
            .set("Authorization", `Bearer ${token}`);

        console.log(
            "/sis/students/:credential",
            response.status,
            response.body.user,
            response.body.user._student.courses
        );

        for (const course of response.body.user._student.courses) {
            console.log(course.courseSched);
            console.log(course.courseSched.course);
        }
    });

    // it("attempts to enroll a student to the course", async () => {
    //     const response = await request(TestApp)
    //         .post("/api/v1/sis/students/enroll")
    //         .set("Authorization", `Bearer ${tempStorage.get("token")}`)
    //         .send({
    //             data: {
    //                 studentNo: "2025-00000-MN-X",
    //                 course: "COMP002",
    //             },
    //         });

    //     console.log(response.body);
    // }, 10_000);

    it("attempts to grade a student", async () => {
        const response = await request(TestApp)
            .post("/api/v1/sis/students/grade")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`)
            .send({
                data: {
                    studentNo: "2025-00000-MN-X",
                    course: "COMP002",
                    grade: 1.25,
                    gradeStatus: GradeStatus.Passed,
                },
            });

        console.log(response.body);
    });

    afterAll(async () => {
        const response = await request(TestApp)
            .post("/api/v1/auth/logout")
            .set("Authorization", `Bearer ${tempStorage.get("token")}`);
        console.log("sis.students", response.body);
    });
});
