# Campus Services API

A robust API for managing common campus operations such as student records, document request and processes, scheduling for offices, and other related administrative services.

## Usage Guide

### User Authentication & Authorization

Requests sent to the API may require authentication and authorization. The authentication requires the client to be a valid user that is logged in to the system. The authentication sends a JSON Web Token (JWT) that the frontend can bind to the specific client for the authentication to recognize the client as a user. The authorization on the other hand requires **roles** that is bound to specific authority.

#### Signing Up

To sign up, the frontend can simply send a **POST** request to the **/api/services/auth/signup** with the body:

```json
{
    // NOTE: No need for credential validation as the API already validates them
    "email": "[EMAIL_ADDRESS]",
    "password": "[PASSWORD]"
}
```

The API will return data depending on the result:

- For invalid login credentials

- **Status Code: 401**

```json
{
    "message": "Invalid login credentials"
}
```

- For email addresses that are already in use
- **Status Code: 403**

```json
{
    "message": "Email provided is already in use"
}
```

- For successful signup
- **Status Code: 200**

```json
{
    "message": "Signed up successfully"
}
```

### Logging In

**TODO**: "Logging In" documentations

### Logging Out

**TODO**: "Logging Out" documentations

## Setup Guide

Setting up the API for a specific use case and implementation requires a few modification depending on the desired configurations.

### Running Tests

To execute the tests of the API, simply run the command:

```bash
npm run test
```

This command will execute the tests for specific features of the API.
