# Developer Guide

## 1. Purpose
This guide provides development conventions for Global Connect.

## 2. Project Structure
The project is divided into frontend and backend responsibilities. Keep UI components, API logic, models, routes, middleware, and configuration organized according to the existing project structure.

## 3. Development Workflow
1. Review the requirement.
2. Identify affected frontend/backend/database components.
3. Implement the smallest coherent change.
4. Validate inputs and errors.
5. Test the affected feature.
6. Run regression checks.
7. Update documentation when behavior changes.

## 4. Environment Variables
Sensitive values such as database credentials, JWT secrets, and OAuth credentials must be stored in environment configuration and must not be committed to source control.

## 5. API Development
- Use consistent HTTP methods and status codes.
- Validate request data.
- Protect restricted routes.
- Return useful but non-sensitive error information.
- Keep business logic maintainable.

## 6. Database Development
- Use Mongoose models consistently.
- Validate required fields.
- Avoid unnecessary database queries.
- Handle database errors gracefully.

## 7. Git Practices
- Use meaningful commits.
- Keep changes focused.
- Review changes before pushing.
- Do not commit secrets or generated sensitive files.
