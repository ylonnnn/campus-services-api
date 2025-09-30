export namespace inclusions {
    export const student = {
        user: true,
        program: true,
        section: { include: { program: true } },
        courses: {
            include: {
                courseSched: {
                    include: {
                        faculty: {
                            include: {
                                user: true,
                            },
                        },
                        course: true,
                    },
                },
            },
        },
    };

    export const faculty = {
        user: true,
        courses: {
            include: {
                course: true,
            },
        },
    };

    export const user = {
        student: { include: inclusions.student },
        faculty: { include: inclusions.faculty },
    };

    export const section = {
        students: { include: student },
        program: true,
        courses: {
            include: {
                course: true,
                faculty: { include: faculty },
                schedule: true,
            },
        },
    };
}
