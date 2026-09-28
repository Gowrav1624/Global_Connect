# Global Connect API Documentation

## Base URL
`https://global-connect-backend-2uub.onrender.com/api`

## Authentication
Protected endpoints use a JWT supplied in the Authorization header:

`Authorization: Bearer <token>`

## Health
### GET `/health`
Checks backend availability.

## Authentication
### POST `/auth/register`
Creates a new user account.

### POST `/auth/login`
Authenticates a user and returns an authentication token.

## Users / Profiles
Endpoints support retrieving and updating authenticated user profile information and retrieving permitted user information.

## Connections
Endpoints support sending, accepting, rejecting, and managing connection requests.

## Posts
Endpoints support creating and retrieving posts/feed content according to the implemented authorization rules.

## Messaging
Messaging endpoints support conversations and messages. Socket.IO provides supported real-time messaging events.

## Jobs
Job endpoints support the job-related functionality included in the approved project scope.

## Notifications
Notification endpoints support retrieving and managing supported user notifications.

## Administration
Administrative endpoints are restricted to authorized administrator accounts.

## Common Responses
- `200` — Successful request
- `201` — Resource created
- `400` — Invalid request
- `401` — Authentication required/invalid
- `403` — Insufficient permission
- `404` — Resource not found
- `500` — Server error

> Exact endpoint paths and request/response schemas must remain synchronized with the implemented Express routes.
