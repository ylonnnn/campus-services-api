import { z } from "zod";

import prisma, { Prisma } from "../../services/prisma";
import { WeekDay } from "../../generated/prisma";

import {
    SectionCourseScheduleCreationStatus,
    SectionCourseScheduleOptions,
} from "./@types";

import { programs } from "../program";
import { inclusions, User, UserName, users } from "../../user";
import { courses } from "../course";

class SectionManager {
    protected _dataSchema = z.object({
        program: z.string(),
        code: z.string(),
        year: z.number(),
    });

    protected _partialDataSchema = this._dataSchema.partial();

    protected _scheduleSchema = z.object({
        code: z.string(),
        course: z.string(),
        faculty: z.object({
            given: z.string(),
            middle: z.string().optional(),
            last: z.string(),
        }),
        scheduleSlots: z.array(
            z.object({
                weekDay: z.enum(WeekDay),
                startTime: z
                    .string()
                    .regex(/^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/),
                endTime: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/),
            })
        ),
    });

    public get schema() {
        return this._dataSchema;
    }

    public get partialSchema() {
        return this._partialDataSchema;
    }

    public get scheduleSchema() {
        return this._scheduleSchema;
    }

    public async create(programCode: string, code: string, year: number) {
        try {
            const program = await programs.get(programCode);
            if (!program) return null;

            return await prisma.section.create({
                data: { program: { connect: { id: program.id } }, code, year },
            });
        } catch {
            return null;
        }
    }

    public async update(code: string, data: Prisma.SectionUpdateInput) {
        try {
            return (
                await prisma.section.update({ where: { code }, data }),
                true
            );
        } catch {
            return false;
        }
    }

    public async delete(code: string) {
        try {
            return await prisma.section.delete({ where: { code } });
        } catch {
            return null;
        }
    }

    public async get(code: string) {
        return await prisma.section.findUnique({
            where: { code },
            include: inclusions.section,
        });
    }

    public async getAllFrom(programCode: string) {
        const program = await programs.get(programCode);
        if (!program) return [];

        return await prisma.section.findMany({
            where: { program },
            include: inclusions.section,
        });
    }

    /**
     * @param code The section code of the section to create the schedule for
     * @param course The course to create the schedule for the given section
     * @param faculty The The faculty/professor to be assigned to the course and section
     */
    public async createSchedule(
        code: string,
        course: string,
        faculty: UserName,
        scheduleSlots: SectionCourseScheduleOptions[]
    ): Promise<SectionCourseScheduleCreationStatus> {
        const section = await this.get(code);
        if (!section) return SectionCourseScheduleCreationStatus.UnknownSection;

        const coursePayload = await courses.get(course);
        if (!coursePayload)
            return SectionCourseScheduleCreationStatus.UnknownCourse;

        const facultyUser = await users.getByName(faculty);
        await facultyUser?.initialize();

        if (!facultyUser || !facultyUser.faculty)
            return SectionCourseScheduleCreationStatus.UnknownFaculty;

        const schedule = await prisma.courseSchedule.create({
            data: {
                section: { connect: { id: section.id } },
                course: { connect: { id: coursePayload.id } },
                faculty: { connect: { id: facultyUser.faculty.id } },

                schedule: { create: scheduleSlots },
            },
        });

        const enrollments = section.students.map(async (student) => {
            const user = (await users.getById(student.user.id)) as User;
            courses.enroll(user, schedule);
        });

        await Promise.all(enrollments);

        return SectionCourseScheduleCreationStatus.Success;
    }

    public async assign(code: string, user: User) {
        if (!user.student) return;

        const section = await this.get(code);
        console.log(section);
        if (!section) return;

        await this.update(code, { students: { connect: { id: user.id } } });
        const enrollments = section.courses.map((schedule) =>
            courses.enroll(user, schedule)
        );

        await Promise.all(enrollments);
    }
}

export const sections = new SectionManager();
