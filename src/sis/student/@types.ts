import { User, UserAccountCreationStatus } from "../../user";

export enum StudentUserRegistrationStatus {
    UnknownProgram,
}

export type StudentUserCreationStatus =
    | UserAccountCreationStatus
    | StudentUserRegistrationStatus;

export type StudentUserDataRetrievalData = { mesage: string } & (
    | { retrieved: true; user: User }
    | { retrieved: false }
);
