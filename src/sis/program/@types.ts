import { ProgramModel } from "../../services/prisma";

export interface ProgramBasicRequestData {
    message: string;
}

export type ProgramRequestData = ProgramBasicRequestData &
    ({ success: true; program: ProgramModel } | { success: false });
