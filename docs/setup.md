# Setup Guide

## 1. Prerequisites
Install:
- Node.js and npm
- Git
- MongoDB access through MongoDB Atlas or a local MongoDB instance
- A supported browser

## 2. Clone
```bash
git clone <repository-url>
cd Global_Connect
```

## 3. Backend
```bash
cd backend
npm install
```

Configure the backend environment variables using the project's environment configuration.

Start development server according to the existing package scripts.

## 4. Frontend
```bash
cd frontend
npm install
```

Configure the frontend environment variables required by the existing Vite application.

Start the development server using the existing npm script.

## 5. Verification
Confirm:
- Backend starts successfully.
- Database connection succeeds.
- Frontend loads.
- Authentication works.
- Frontend can communicate with the backend.

## 6. Troubleshooting
Check environment variables, backend logs, browser console errors, network requests, MongoDB connectivity, and OAuth configuration.
