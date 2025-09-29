# CHANGES

## v1.0.0

#### 250929b

- Updated the `schema.prisma`
    - Moved `.faculty` from `Course` -> `CourseSchedule`
- Addition of `sis/courses/`
    - Addition of `routes/sis/courses`
    - Addition of `courses` that manages courses
        - Addition of `courses.create(code: string, name: string, units: number)`
        - Addition of `courses.delete(code: string)`
        - Addition of `courses.get(code: string)`
    - Addition of `routes/sis/programs`
    - Improvements within `programs`
        - Addition of `programs.create(code: string, name: string)`
        - Addition of `programs.delete(code: string)`
        - Addition of `programs.get(code: string)`

#### 250929a

- Renamed `users/user-authority.ts` -> `users/roles.ts`
- Updated `createAccount()` to validate roles
- Created `users` from `user/users.ts`
    - Moved `createAccount()` -> `users.create()`
    - Updated account creation to include additional information
    - Addition of `users.registerStudent()` which registers a `User` and a `StudentUser` with their informations bound to each other
    - Addition of `users.regenerateUserPassword()` which allows the users to regenerate their own passwords
    - Addition of `users.generate()` which generates a user with a randomly generated password. This is used for student registration
- Created `students/` which will be utilized for student ulities
    - Addition of `students.generateStudentNo()` which generates a student number based on the year, student count, branch code, etc
- Addition of `email/` which utilized `SendGrid` for sending users data such as regenerated password, etc
- Refactored `/api/v1/auth/login` handler
    - Created `auth.login()`
- Updated the way users sign-up
    - Addition of `UserRole.Visitor`
    - Made signing up only for visitors
    - Allowed students to login with their student numbers
    - Addition of `/api/v1/users/me/regen-pw`
- Addition of additional utility functions in `users`
- Updated almost every `UserPayload` to use `User` for convenience
- Created `sis/` for the Student Information System
    - Moved `student/` -> `sis/student/`
- Addition of `users/inclusion` for inclusion objects
- Addition of `sis.student.test`

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
