# Code Handoff Guide

## 1. Purpose
This guide provides the information required for another developer or client team to take over Global_Connect.

## 2. Repository Structure

```text
Global_Connect/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   ├── package.json
│   └── ...
├── docs/
├── .gitignore
└── README.md
```

## 3. Development Setup
1. Install Node.js and npm.
2. Clone the repository.
3. Install frontend dependencies.
4. Install backend dependencies.
5. Configure backend environment variables.
6. Configure frontend environment variables.
7. Ensure MongoDB access is available.
8. Start the backend.
9. Start the frontend.
10. Verify authentication and core workflows.

## 4. Key Dependencies
- React
- Vite
- Redux Toolkit
- React Router
- Axios
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Passport / Google OAuth
- Socket.IO
- Multer
- Nodemailer

## 5. Configuration
Do not copy real production secrets into documentation. Production credentials must be transferred through an approved secure credential-management process.

## 6. Development Rules
- Follow existing folder conventions.
- Keep frontend and backend responsibilities separated.
- Validate inputs.
- Protect restricted routes.
- Use meaningful commits.
- Test changes before deployment.
- Update documentation when behavior changes.

## 7. Deployment
Frontend is deployed through Vercel and backend through Render, with MongoDB Atlas providing database hosting.

## 8. Handoff Checklist
- [ ] Source repository transferred
- [ ] Environment variables documented securely
- [ ] Database access transferred
- [ ] OAuth configuration transferred
- [ ] Deployment access transferred
- [ ] API documentation provided
- [ ] Testing documentation provided
- [ ] Known issues documented
