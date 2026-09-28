# Third-Party Integration Notes

## 1. Purpose
This document records external services and libraries used by Global_Connect.

## 2. Google OAuth

### Purpose
Provides Google-based authentication.

### Configuration
Required OAuth client credentials are stored as protected environment variables.

### Important Configuration
- Authorized origins
- Redirect URIs
- Client ID
- Client secret

Never commit the client secret to source control.

## 3. Socket.IO

### Purpose
Provides real-time messaging and supported notification events.

### Integration
The frontend establishes a Socket.IO connection to the backend. Authentication and room/event handling must follow the implemented server logic.

## 4. MongoDB Atlas

### Purpose
Cloud-hosted MongoDB database.

### Configuration
The MongoDB connection string is stored in a protected backend environment variable.

## 5. Vercel

### Purpose
Frontend deployment.

### Configuration
Frontend build settings and public environment variables are configured through the Vercel project.

## 6. Render

### Purpose
Backend deployment.

### Configuration
Backend environment variables, build/start commands, and service settings are configured through Render.

## 7. Nodemailer / Email

### Purpose
Supports email-based workflows such as password reset where configured.

### Security
SMTP credentials must be stored securely and must never be committed to source control.

## 8. Multer

### Purpose
Handles supported multipart file uploads before the configured storage process.

## 9. Stripe
The project guide mentions Stripe as an example third-party integration. It is **not part of the current approved Global_Connect feature baseline unless separately configured and implemented**.

## 10. Integration Maintenance
Third-party integrations should be tested after dependency upgrades, provider configuration changes, or deployment changes.
