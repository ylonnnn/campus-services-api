import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import generator from "generate-password";

import { UserRole } from "../generated/prisma";
import prisma from "../services/prisma";

import {
    StudentUserAdditionalInfo,
    StudentUserPayload,
    UserAccountCreationStatus,
    UserAdditionalInfo,
    UserRetrievalFn,
} from "./@types";

import { roleSet } from "./roles";
import {
    students,
    StudentUserCreationStatus,
    StudentUserRegistrationStatus,
} from "../sis";
import { email } from "../email";
import { AuthRequest } from "../auth";
import { User } from "./User";
import { inclusions } from "./inclusion";

export class Users {
    public async create(
        email: string,
        password: string,
        role: UserRole,
        info: UserAdditionalInfo
    ): Promise<[status: UserAccountCreationStatus, user: User | null]> {
        try {
            // Email and Password Validation
            if (
                !validator.isEmail(email) ||
                !validator.isStrongPassword(password, {
                    minLength: 8,
                    minSymbols: 0,
                }) ||
                !roleSet.has(role)
            )
                return [UserAccountCreationStatus.InvalidCredentials, null];

            // Usage Validation
            if (await prisma.user.findUnique({ where: { email } }))
                return [UserAccountCreationStatus.EmailAlreadyUsed, null];

            // Account Creation
            return [
                UserAccountCreationStatus.Success,
                new User(
                    await prisma.user.create({
                        data: {
                            email,
                            password: await bcrypt.hash(
                                password,
                                parseInt(process.env.SALT_LENGTH!)
                            ),
                            name: info.name as object,
                            role,
                        },
                        include: inclusions.user,
                    })
                ),
            ];
        } catch (err) {
            console.log("users.create() error:", err);
            return [UserAccountCreationStatus.InvalidCredentials, null];
        }
    }

    public async get(credential: string): Promise<User | null> {
        // Email
        if (validator.isEmail(credential))
            return await this.getByEmail(credential);
        // Student Number
        else if (students.isStudentNo(credential))
            return await this.getByStudentNo(credential);

        return null;
    }

    public async getById(id: number): Promise<User | null> {
        const entry = await prisma.user.findUnique({
            where: { id },
            include: inclusions.user,
        });

        return entry ? new User(entry) : null;
    }

    public async getByEmail(email: string): Promise<User | null> {
        const entry = await prisma.user.findUnique({
            where: { email },
            include: inclusions.user,
        });

        return entry ? new User(entry) : null;
    }

    public async getByStudentNo(studentNo: string): Promise<User | null> {
        const entry = await prisma.user.findFirst({
            where: { student: { studentNo } },
            include: inclusions.user,
        });

        return entry ? new User(entry) : null;
    }

    public async registerStudent(
        email: string,
        info: StudentUserAdditionalInfo
    ): Promise<[StudentUserCreationStatus, StudentUserPayload | null]> {
        const program = await prisma.program.findUnique({
            where: { code: info.program },
        });

        if (!program)
            return [StudentUserRegistrationStatus.UnknownProgram, null];

        const [status, user] = await this.generate(
            email,
            UserRole.Student,
            info
        );
        if (status != UserAccountCreationStatus.Success || !user)
            return [status, null];

        const student = await prisma.studentUser.create({
            data: {
                user: { connect: { id: user.id } },
                studentNo: await students.generateStudentNo(),
                year: info.year,
                section: info.section,
                program: { connect: { id: program.id } },
                courses: { create: [] },
            },
            include: inclusions.student,
        });

        return [status, student];
    }

    // TODO: Potentially improve the program by creating separation with the notification email and the actual password generation and updating logic
    /**
     * Regenerates a new password for the user with the credential provided
     * @param credential - The credential used for retrieving the user and
     * regenerating its password.
     *
     * NOTE: This can either be the user's email address or student number
     *
     * @returns Returns a promise that contains either a string (the recipient email address) or null
     */
    public async regenerateUserPassword(
        credential: string
    ): Promise<string | null> {
        const user = await this.get(credential);
        if (!user) return null;

        // Generate a new password
        const newPassword = this.generatePassword(8);
        const updated =
            (
                await prisma.user.updateMany({
                    where: { id: user.id },
                    data: {
                        password: await bcrypt.hash(
                            newPassword,
                            parseInt(process.env.SALT_LENGTH!)
                        ),
                    },
                })
            ).count > 0; // Unlikely

        if (!updated) return null;

        // Notify the user through e-mail
        await email.send({
            from: process.env.SENDGRID_VERIFIED_SENDER!,
            to: user.email,
            subject: `Campus Services Password Regeneration`,
            text: `Email: ${user.email}${user.student ? `\nStudent Number: ${user.student.studentNo}` : ""}\nPassword: ${newPassword}`,
            html: `
  <p><strong>Email:</strong> ${user.email}</p>
  ${user.student ? `<p><strong>Student Number:</strong> ${user.student.studentNo}</p>` : ""}
  <p><strong>Password:</strong> ${newPassword}</p>
`,
        });

        return user.email;
    }

    public generatePassword(length: number) {
        return generator.generate({
            length,
            lowercase: true,
            uppercase: true,
            numbers: true,
            strict: true,
        });
    }

    public async generate(
        email: string,
        role: UserRole,
        info: UserAdditionalInfo
    ) {
        return await this.create(email, this.generatePassword(8), role, info);
    }

    public retrieval(param: string, retrievalFn: UserRetrievalFn = users.get) {
        return async function userRetrievalMiddleware(
            { params, users: _users = [] }: AuthRequest,
            response: Response,
            next: NextFunction
        ) {
            const credential = params[param];
            if (!credential)
                return response
                    .status(401)
                    .json({ message: "Invalid or missing credential" });

            const user = await retrievalFn(credential as string);
            if (!user)
                return response
                    .status(404)
                    .json({ message: "Unknown user with the provided id" });

            _users.push(user);

            next();
        };
    }
}

export const users = new Users();
