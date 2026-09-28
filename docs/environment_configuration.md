# Environment Configuration

## 1. Purpose
This document describes environment configuration required by Global Connect without exposing actual secrets.

## 2. Backend Variables

Example placeholders:

```env
PORT=5000
MONGODB_URI=<mongodb-connection-string>
JWT_SECRET=<strong-secret>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
CLIENT_URL=<frontend-url>
```

## 3. Frontend Variables
Use the environment variable names required by the existing Vite configuration for the backend/API base URL and other public client configuration.

## 4. Rules
- Never commit `.env` files containing secrets.
- Use separate development and production values.
- Rotate compromised credentials immediately.
- Do not expose private secrets in frontend code.
- Keep production credentials in the deployment platform's secure environment settings.

## 5. Deployment
Configure required variables in Render, Vercel, MongoDB Atlas, and OAuth provider settings as applicable before production deployment.
