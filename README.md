# Campus Services API

A robust API for managing common campus operations such as student records, document request and processes, scheduling for offices, and other related administrative services.

## Important Note

As of **01/10/2025**, the only useful system/feature of **Campus Services API** is its Student Information System. Office scheduling services, and other functionalities and features are still to be developed.

## Usage Guide

### User Authentication & Authorization

Requests sent to the API may require authentication and authorization. The authentication requires the client to be a valid user that is logged in to the system. The authentication sends a JSON Web Token (JWT) that the frontend can bind to the specific client for the authentication to recognize the client as a user. The authorization on the other hand requires **roles** that is bound to specific authority.

#### Signing Up

Signing up is allowed for visitors to be able to interact with some features of the Campus Services. To sign up, the frontend can simply send a **POST** request to the **/api/services/auth/signup** with the body:

```json
{
    // NOTE: No need for credential validation as the API already validates them
    "email": "[EMAIL_ADDRESS]",
    "password": "[PASSWORD]"
}
```

The API will return data that implements the `SignupData` interface depending on the result:

```ts
export interface SignupData {
    signedUp: boolean;
    message: string;
}
```

Once the `signedUp` field becomes `true`, the credentials provided can now be used to login as a `Visitor` with limited access to the Campus Services.

### Logging In

To login, the frontend can simply send a **POST** request to the **/api/services/auth/login** with the body:

```json
{
    "credentialKey": "[CREDENTIAL_KEY]",
    "password": "[PASSWORD]"
}
```

Where `credentialKey` can either be the email address of the user, or the student number if the user is a student.

The API returns a data that implements the `LoginData` interface:

```ts
export type LoginData = { loggedIn: boolean; message: string } & (
    | { loggedIn: true; token: string; user: User }
    | { loggedIn: false }
);
```

Which if the login was successful, the `token` and the `user` field are present. The `token` will be used for requests that require authentication. It can simply be bound to the request by setting the `authorization` (or `Authorization`) header to `Bearer [TOKEN]` where `[TOKEN]` is the valid token returned by the login

**IMPORTANT NOTE**: Logging in to another account while another account is still active is possible and must be handled within the frontend to disable users from logging in while still being logged in to another account.

**ADDITIONAL NOTE**: To keep an account as logged in, the client-side must send a **POST** request to `/api/v1/auth/refresh` to refresh the lifetime of the session. This refresh is required every **15 minutes** as the expiration duration of the token is **15 minutes**

### Token/Session Refresh (Hearbeat)

The generated token when logging in only lasts for **15 minutes** and once invalidated, considers the client as "**Unauthenticated"**. As users may utilize the application and continue sending requests for longer than 15 minutes, the client may send a refresh request every 15 minutes (or even before). The client-side can simply send a **POST** request to `/api/v1/auth/refresh` with the `Authorization` header set to the valid token (for authentication purposes).

The API returns a data that implements the `RefreshData` interface

```ts
export interface RefreshData {
    message: string;
    token: string;

    /**
     * NOTE: Duration is saved in milliseconds
     */
    duration: number;
}
```

The `token` field is the newly generated token that can be used to update the currently bound auth token.

### Logging Out

Logging out from an account can simply be done by sending a **POST** request to the `/api/v1/auth/logout` with the `Authorization` header set that contains the token for authentication purposes.

The API returns a data that implements the `LogoutData` interface

```ts
export interface LogoutData {
    loggedOut: boolean;
    message: string;
}
```

Temporary data storages such as `sessionStorage` are suggested to be used for storing temporary credentials such as the token for authentication.

### Student Information System

The Student Information System (SIS) manages programs, courses, sections, enrollment, schedules, and grades.

Routes follow REST conventions, with pluralized resource names:

`POST /programs, POST /courses, POST /sections` → Create

`GET /programs/:code, GET /courses/:code, GET /sections/:code` → Retrieve

`PUT /programs/:code, PUT /courses/:code, PUT /sections/:code` → Update

`DELETE /programs/:code, DELETE /courses/:code, DELETE /sections/:code` → Delete

#### Programs

#### Program Creation

**Route**:
`POST /api/v1/sis/programs`

**Body**:

```json
{
    "code": "BSCpE",
    "name": "Bachelor of Science in Computer Engineering"
}
```

**Returns**:

```ts
export type ProgramRequestData = ProgramBasicRequestData &
    ({ success: true; program: ProgramModel } | { success: false });
```

#### Program Update

**Route**:
`PUT /api/v1/sis/programs/:code`

**Body**:

```json
{
    // NOTE: The object is partial, which means any field can be left undefined
    //       and only the fields that are to be updated specified.
    "code": "BSCpE",
    "name": "Bachelor of Science in Comp Engineering" // This is simply an example
}
```

**Returns**:

```ts
export interface ProgramBasicRequestData {
    message: string;
}
```

#### Program Delete

**Route**:
`DELETE /api/v1/sis/programs/:code`

**Returns**:

```ts
export type ProgramRequestData = ProgramBasicRequestData &
    ({ success: true; program: ProgramModel } | { success: false });
```

#### Program Retrieval

**Route**:
`GET /api/v1/sis/programs/:code`

**Returns**:

```ts
export type ProgramRequestData = ProgramBasicRequestData &
    ({ success: true; program: ProgramModel } | { success: false });
```

#### Course

#### Course Creation

**Route**:
`POST /api/v1/sis/courses`

**Body**:

```json
{
    "code": "COMP069",
    "name": "Systems Programming"
}
```

**Returns**:

```ts
export type CourseRequestData = CourseBasicRequestData &
    ({ success: true; course: CourseModel } | { success: false });
```

#### Courses Update

**Route**:
`PUT /api/v1/sis/courses/:code`

**Body**:

```json
{
    // NOTE: The object is partial, which means any field can be left undefined
    //       and only the fields that are to be updated specified.
    "code": "COMP420",
    "name": "Interpreter and Compiler Designs" // This is simply an example
}
```

**Returns**:

```ts
export interface CourseBasicRequestData {
    message: string;
}
```

#### Course Delete

**Route**:
`DELETE /api/v1/sis/courses/:code`

**Returns**:

```ts
export type CourseRequestData = CourseBasicRequestData &
    ({ success: true; course: CourseModel } | { success: false });
```

#### Course Retrieval

**Route**:
`GET /api/v1/sis/courses/:code`

**Returns**:

```ts
export type CourseRequestData = CourseBasicRequestData &
    ({ success: true; course: CourseModel } | { success: false });
```

#### Section

#### Section Creation

**Route**:
`POST /api/v1/sis/sections`

**Body**:

```json
{
    "program": "BSCS"
    "code": "BSCS2-1",
    "year": 2,
}
```

**Returns**:

```ts
export type SectionRequestData = SectionBasicRequestData &
    ({ success: true; section: SectionModel } | { success: false });
```

#### Section Update

**Route**:
`PUT /api/v1/sis/sections/:code`

**Body**:

```json
{
    // NOTE: The object is partial, which means any field can be left undefined
    //       and only the fields that are to be updated specified.
    "code": "BSCS2-1"
}
```

**Returns**:

```ts
export interface SectionBasicRequestData {
    message: string;
}
```

#### Section Delete

**Route**:
`DELETE /api/v1/sis/sections/:code`

**Returns**:

```ts
export type SectionRequestData = SectionBasicRequestData &
    ({ success: true; section: SectionModel } | { success: false });
```

#### Section Retrieval

**Route**:
`GET /api/v1/sis/sections/:code`

**Returns**:

```ts
export type SectionRequestData = SectionBasicRequestData &
    ({ success: true; section: SectionModel } | { success: false });
```

#### Section Course Scheduling

**Route**:
`POST /api/v1/sis/sections/schedule`

**Body**:

```json
{
    "data": {
        "code": "BSCS2-1", // Section Code
        "course": "COMP420", // Course Code
        "faculty": {
            "given": "John",
            "middle": "Dill", // Optional
            "last": "Doe"
        },
        "scheduleSlots": [
            {
                "weekDay": "Wednesday", // WeekDay.Wednesday
                "startTime": "09:30 AM", // Strict Format: 00:00 AM|PM (12-Hour Format)
                "endTime": "12:30 PM"
            },
            {
                // Can have multiple schedule slots
                "weekDay": "Friday", // WeekDay.Friday
                "startTime": "06:00 PM",
                "endTime": "09:00 PM"
            }
        ]
    }
}
```

**Returns**:

```ts
export interface SectionBasicRequestData {
    message: string;
}
```

**NOTE**: Only authorized clients are allowed to perform these actions. Attempting to send these requets as an unauthorized user will result to `Unauthorized` status code and data.

#### Students

### Student Registration

This is only allowed for users with the `UserRole.Administrator` role.

**Route**:
`POST /api/v1/sis/students/register`

**Body**:

```json
{
    "email": "user.email@example.com",
    "info": {
        "scholasticStatus": "Regular", // ScholasticStatus.Regular, Irregular, Returnee, etc.
        "program": "BSIT", // Program Code
        "section": "BSIT2-3", // Optional: Section Code
        "year": 2
    }
}
```

**Returns**:

```ts
export type StudentRequestData = StudentBasicRequestData &
    ({ success: true; user: User } | { success: false });
```

#### Student Data Retrieval

This is only allowed for users with the `UserRole.Administrator` or `UserRole.Faculty` role

**Route**:
`GET /api/v1/sis/students/:studentno`

**Returns**:

```ts
export type StudentRequestData = StudentBasicRequestData &
    ({ success: true; user: User } | { success: false });
```

#### Student Enrollment

For enrolling students to a specific course and/or even section. This is only allowed for users with the `UserRole.Administrator` role

**Route**:
`POST /api/v1/sis/students/enroll`

**Body**:

```json
{
    "data": {
        "studentNo": "2025-69420-MN-X",
        "course": "COMP069", // Course Code

        // Optional, as irregular students may have any current
        // permanent section
        "section": "BSCS3-2" // Section Code
    }
}
```

**Returns**:

```ts
export interface StudentBasicRequestData {
    message: string;
}
```

#### Student Grade Updating

For updating the grades of enrolled students to specific courses. This is only allowed for users with the `UserRole.Administrator` roles and `UserRole.Faculty` for the faculty assigned to the course.

**Route**:
`POST /api/v1/sis/students/grade`

**Body**:

```json
{
    "studentNo": "2025-69420-MN-X",
    "course": "COMP420",
    "grade": 1.0,

    // Optional. Can be used when grade calculation is not done/pending but the status can be immediately specified (e.g Passed, Incomplete, Withdrawn, etc.).
    "gradeStatus": "Passed" // GradeStatus.Passed
}
```

**Returns**:

```ts
export interface StudentBasicRequestData {
    message: string;
}
```

## Setup Guide

Setting up the API for a specific use case and implementation requires a few modification depending on the desired configurations.

### Technology Stack

### Core Framework & Server

`express`: Web framework for building the REST API routes.

`dotenv`: Loads environment variables from .env.

### Database & ORM

`prisma`: ORM for schema definition, migrations, and database queries.

`@prisma/client`: Generated client library to interact with the database.

### Authentication & Security

`bcryptjs`: Password hashing (e.g., for storing user credentials securely).

`jsonwebtoken`: For issuing and verifying JWTs (session/auth tokens).

`validator`: Validation utilities (emails, URLs, etc.).

`zod`: Schema validation library for runtime validation and type inference.

### Email & External Services

`@sendgrid/mail`: Send transactional emails (password reset, verification).

`@supabase/supabase-js`: Interact with Supabase services (storage, auth, DB).

### Development Tools

`typescript`: Type safety and better developer experience.

`ts-node`: Run TypeScript directly without compiling first.

`ts-jest`: Run Jest tests with TypeScript.

`jest`: Testing framework.

`supertest`: HTTP testing library for Express endpoints.

`nodemon`: Auto-restarts the server during development.

### Type Definitions (dev-only, improve DX with TypeScript)

`@types/express`

`@types/jest`

`@types/node`

`@types/bcryptjs`

`@types/jsonwebtoken`

`@types/supertest`

`@types/validator`

### Misc

`generate-password`: Utility to generate random passwords.

### System Prerequisites

`Node.js` (v18 or later) – required to run the backend (Express, Prisma, TypeScript).

`npm` (comes with Node.js) – used for managing dependencies.

`Git` – for cloning the repository and version control.

### Environment Configuration

Create a `.env` file in the root/project directory with the following variables

```env
# Port
PORT=

# Supabase Client Creation Data
SUPABASE_URL=
SUPABASE_KEY=

# Supabase Database URLs
DATABASE_URL=
DIRECT_URL=

# Salt Length used for Password Hashing
SALT_LENGTH=

# JSON Web Token Secret used for Signing Payloads
JWT_SECRET=

# API Key from SendGrid
SENDGRID_API_KEY=

# Email Addres of the Verified Sender in SendGrid
SENDGRID_VERIFIED_SENDER=

# Code of the university branch
# NOTE: This is only used depending on the student number format
BRANCH_CODE=

```

### Running Tests

To execute the tests of the API, simply run the command:

```bash
npm run test
```

This command will execute the tests for specific features of the API. The command will trigger `jest`, and it is suggested to update the script `test` and remove the `--runInBand` flag to utilize multiple threads for testing.
