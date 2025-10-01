import { z } from "zod";

import { GradeStatus } from "../../generated/prisma";
import prisma from "../../services/prisma";

class StudentManager {
    protected _studentNumberSchema = z
        .string()
        .regex(/^[0-9]{4,}-[0-9]{5,}-[A-Z]{2,}-[0-9|X]{1,}/);
    protected _enrollSchema = z.object({
        studentNo: this._studentNumberSchema,
        course: z.string(),
        section: z.string().optional(),
    });

    protected _gradeSchema = z.object({
        studentNo: this._studentNumberSchema,
        course: z.string(),
        grade: z.number(),
        gradeStatus: z.enum(GradeStatus),
    });

    public studentNumberSchema() {
        return this._studentNumberSchema;
    }

    public get enrollSchema() {
        return this._enrollSchema;
    }

    public get gradeSchema() {
        return this._gradeSchema;
    }

    public async generateStudentNo() {
        return `${new Date().getFullYear()}-${(await prisma.studentUser.count()).toString().padStart(5, "0")}-${process.env.BRANCH_CODE!}-X`;
    }

    public isStudentNo(credential: string) {
        const parts = credential.split("-");
        if (parts.length != 4) return false;

        const [year = "", n = "", branchCode = "", x = ""] = parts;
        return (
            year.length >= 4 &&
            n.length == 5 &&
            branchCode.length == 2 &&
            x.length == 1
        );
    }
}

export const students = new StudentManager();
