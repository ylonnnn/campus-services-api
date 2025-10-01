import { User, UserAccountCreationStatus } from "../../user";

export interface StudentBasicRequestData {
    message: string;
}

export type StudentRequestData = StudentBasicRequestData &
    ({ success: true; user: User } | { success: false });

export enum StudentUserRegistrationStatus {
    UnknownProgram,
    UnknownSection,
}

export type StudentUserCreationStatus =
    | UserAccountCreationStatus
    | StudentUserRegistrationStatus;

export type StudentUserDataRetrievalData = { mesage: string } & (
    | { retrieved: true; user: User }
    | { retrieved: false }
);
