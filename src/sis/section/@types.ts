import { WeekDay } from "../../generated/prisma";
import { SectionModel } from "../../services/prisma";

export interface SectionBasicRequestData {
    message: string;
}

export type SectionRequestData = SectionBasicRequestData &
    ({ success: true; section: SectionModel } | { success: false });

export enum SectionCourseScheduleCreationStatus {
    UnknownSection,
    UnknownCourse,
    UnknownFaculty,
    Success,
}

export interface SectionCourseScheduleOptions {
    weekDay: WeekDay;
    startTime: string;
    endTime: string;
}
