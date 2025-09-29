export namespace inclusions {
    export const student = {
        user: true,
        courses: {
            include: {
                courseSched: {
                    include: {
                        course: {
                            include: {
                                faculty: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    export const faculty = {
        user: true,
        courses: {
            select: {
                id: true,
                code: true,
                name: true,
                units: true,
            },
        },
    };

    export const user = {
        student: { include: inclusions.student },
        faculty: { include: inclusions.faculty },
    };
}
