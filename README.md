# Campus Services API

A robust API for managing common campus operations such as student records, document request and processes, scheduling for offices, and other related administrative services.

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

### Logging Out

Logging out from an account can simply be done by sending a **POST** request to the `/api/v1/auth/logout` and provided with the body:

```json
{
    "email": "[EMAIL_ADDRESS]"
}
```

Hence, keeping track of the active email address from the frontend is also required as the API simply handles basic data transactions and requires the client to handle the storing of temporary data. It may be a good idea to store them in storages such as the `sessionStorage` which keeps the data even after reload but resets when the tab or browser is closed.

## Setup Guide

Setting up the API for a specific use case and implementation requires a few modification depending on the desired configurations.

### Running Tests

To execute the tests of the API, simply run the command:

```bash
npm run test
```

This command will execute the tests for specific features of the API.
