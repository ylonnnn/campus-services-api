# CHANGES

## v1.0.0

#### 250927a

- Updated the `schema.prisma`
    - Updated `User`
    - Addition of `StudentUser`
    - Addition of `FacultyUser`
    - Addition of `Course`
    - Addition of `CourseSchedule`
    - Addition of `CourseEnrollment`
- Updated `/api/services` -> `/api/v1`
- Addition of `/api/v1/users/me`
- Addition of extra and modular validation for `/api/v1/users/:id`
- Updated the `User.student` and `User.faculty` to include the relation fields
- Addition of `createAccount` for a general use case
