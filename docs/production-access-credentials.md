# Production Access Credentials

> **SECURITY NOTICE:** Do not store real passwords, private keys, JWT secrets, OAuth client secrets, database credentials, or API tokens in this repository.

## Production Services

| Service | Account/Owner | Credential Location | Status |
|---|---|---|---|
| Vercel | Project owner/team | Secure password manager | Configured separately |
| Render | Project owner/team | Secure password manager | Configured separately |
| MongoDB Atlas | Project owner/team | Secure password manager | Configured separately |
| Google OAuth | Project owner/team | OAuth provider / secret manager | Configured separately |

## Required Secrets
- MongoDB connection string
- JWT secret
- Google OAuth client secret
- Other provider secrets used by the deployed application

## Access Procedure
1. Request access from the authorized project owner.
2. Retrieve credentials from the approved secret-management system.
3. Do not copy secrets into source files or public documentation.
4. Rotate credentials when personnel or security conditions change.

## Emergency
If a production credential is exposed, revoke/rotate it immediately and document the incident.
