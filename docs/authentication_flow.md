# Authentication Flow

## 1. Registration
1. User submits registration information.
2. Backend validates the request.
3. Password is hashed before storage.
4. User record is created.
5. The system returns the appropriate registration response.

## 2. Login
1. User submits credentials.
2. Backend locates the account.
3. Password is verified against the stored hash.
4. A JWT is issued for successful authentication.
5. Client uses the token for protected requests.

## 3. Protected Request
1. Client sends the JWT with the request.
2. Authentication middleware validates the token.
3. User identity is attached to the request context.
4. Route authorization is evaluated.
5. The requested operation is performed if permitted.

## 4. Google OAuth
Where configured, the user authenticates through Google OAuth. The backend validates the OAuth flow and associates the authenticated identity with the application's user account.

## 5. Failure Handling
Invalid credentials, invalid tokens, expired sessions, and unauthorized operations should return appropriate error responses without exposing sensitive details.
