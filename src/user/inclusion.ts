export namespace inclusions {
    export const student = {
        user: true,
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
}
