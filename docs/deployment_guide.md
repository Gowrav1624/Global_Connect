# Global_Connect – Deployment Guide

## 1. Deployment Architecture

```text
User Browser
     ↓
Vercel
React Frontend
     ↓
Render
Node.js / Express Backend
     ↓
MongoDB Atlas
Database
```

## 2. Frontend Deployment – Vercel

1. Connect the GitHub repository to Vercel.
2. Select the frontend/client directory if required by the repository structure.
3. Install dependencies.
4. Configure the production build command according to `package.json`.
5. Configure the required public environment variables.
6. Deploy.
7. Open the generated production URL.
8. Verify API communication and authentication.

## 3. Backend Deployment – Render

1. Create a Render web service.
2. Connect the GitHub repository.
3. Select the backend/server directory if required.
4. Configure the Node.js build/install command.
5. Configure the production start command.
6. Add required environment variables.
7. Deploy the service.
8. Review logs for startup or database errors.
9. Verify the health endpoint.

## 4. Database – MongoDB Atlas

1. Create or select the MongoDB Atlas cluster.
2. Create the application database user.
3. Configure network access appropriately.
4. Obtain the MongoDB connection string.
5. Store the connection string as a protected backend environment variable.
6. Verify the backend can connect successfully.

## 5. OAuth Configuration
Configure Google OAuth authorized origins and redirect URIs to match the production frontend/backend configuration.

## 6. Production Verification

- [ ] Frontend loads
- [ ] Backend is reachable
- [ ] API health endpoint works
- [ ] Database connection works
- [ ] Registration works
- [ ] Login works
- [ ] Protected routes work
- [ ] Google OAuth works where enabled
- [ ] Core application features work
- [ ] No critical deployment errors appear in logs

## 7. Rollback
If a critical production problem occurs, follow `rollback_plan.md` and restore the last known stable release.

## 8. Security
Never place production passwords, API tokens, JWT secrets, database credentials, or OAuth client secrets in source code or this document.
