# Global_Connect – Backend Functional Map

## 1. Purpose
This document maps the major backend modules, responsibilities, routes, models, middleware, and supporting services of Global_Connect.

## 2. Backend Architecture

```text
Client
  ↓
Express Routes
  ↓
Middleware
  ↓
Controllers / Business Logic
  ↓
Mongoose Models
  ↓
MongoDB Atlas
```

Socket.IO provides real-time communication for supported messaging and notification events.

## 3. Functional Map

| Module | Main Responsibility | Supporting Components |
|---|---|---|
| Authentication | Registration, login, JWT, OAuth, password reset | Auth routes, controllers, User model, auth middleware |
| User/Profile | User data and profile management | User/Profile models, user routes/controllers |
| Connections | Requests, acceptance/rejection, connections | Connection model, connection routes/controllers |
| Feed/Posts | Create and retrieve posts and interactions | Post model, post routes/controllers |
| Messaging | Conversations and messages | Message/Conversation models, Socket.IO |
| Jobs | Job creation, listing, search, applications | Job/Application models and routes |
| Notifications | User activity notifications | Notification model and notification services |
| Search | Search and filtering | Search routes/controllers and database queries |
| Reports/Admin | Moderation and administrative operations | Report model, admin middleware/routes |
| File Uploads | Profile/post media handling | Multer and configured storage |
| Email | Password-reset and supported email flows | Nodemailer/email configuration |

## 4. Middleware
Typical middleware responsibilities include:
- JWT authentication.
- Authorization/role checks.
- Request validation.
- CORS configuration.
- Error handling.
- File upload handling where required.

## 5. Security
Protected routes must validate authentication. Administrative routes must additionally validate authorization. Secrets and credentials must be provided through environment variables.

## 6. Maintenance
When a backend feature is added or modified, update the related route, controller/service, model, tests, and documentation as applicable.
