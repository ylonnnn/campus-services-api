import { WeekDay } from "../../generated/prisma";

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
