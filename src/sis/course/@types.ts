import { CourseModel } from "../../services/prisma";

export interface CourseBasicRequestData {
    message: string;
}

export type CourseRequestData = CourseBasicRequestData &
    ({ success: true; course: CourseModel } | { success: false });
