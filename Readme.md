Global_Connect – Professional Networking Platform

Global_Connect is a full-stack professional networking platform designed to help users build professional profiles, connect with other users, share posts, communicate in real time, discover jobs, apply for opportunities, and receive notifications.

Live Application

Frontend: https://global-connect-lilac.vercel.app/

Backend: https://global-connect-backend-2uub.onrender.com

API Health Check: https://global-connect-backend-2uub.onrender.com/api/health

Features

Authentication

User registration and login

JWT-based authentication

Google OAuth authentication

Password reset through email

User Profiles

View and edit profiles

Profile picture and banner upload

Bio, skills, experience, and education

Connections

Send connection requests

Accept or reject requests

View connections

Connection notifications

Feed and Posts

Create text/image posts

Like, comment, and repost

Feed content from users and connections

Messaging

Real-time messaging using Socket.IO

Conversation history

Message notifications

Jobs

Create job postings

Search jobs

Apply for jobs

Save jobs

Track application status

Job applicant management

Global Search

Search across users, posts, and jobs with relevant filters.

Notifications

Persistent notifications

Real-time notifications

Connection, message, and job notifications

Admin Panel

Manage users, posts, and jobs

Review reports

Update report status

Delete reported content where applicable

Technology Stack

Frontend

React, Vite, Redux Toolkit, React Redux, React Router, Tailwind CSS, Axios, Socket.IO Client

Backend

Node.js, Express.js, MongoDB, Mongoose, JWT, Passport, Google OAuth, Socket.IO, Multer, Nodemailer

Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

Project Structure

Global_Connect/
├── client/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
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

Local Development

Prerequisites

Install Node.js and npm. A MongoDB Atlas database, Google Cloud OAuth credentials, and a Gmail App Password are required for the corresponding production features.

Clone

git clone https://github.com/Gowrav1624/Global_Connect.git
cd Global_Connect

Backend

cd server
npm install

Create server/.env:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173

Start:

node src/server.js

Backend:

http://localhost:5000

Frontend

cd client
npm install
npm run dev

Frontend:

http://localhost:5173

Production API variable:

VITE_API_URL=https://global-connect-backend-2uub.onrender.com/api

Authentication

Protected API requests use:

Authorization: Bearer <token>

Production Google OAuth callback:

https://global-connect-backend-2uub.onrender.com/api/auth/google/callback

API Overview

Main API modules:

/api/auth
/api/users
/api/connections
/api/posts
/api/jobs
/api/messages
/api/notifications
/api/search
/api/admin
/api/reports

Example endpoints:

GET  /api/health
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token

GET  /api/users/:id
PUT  /api/users/:id

POST /api/connections/request
GET  /api/connections
GET  /api/connections/requests

POST /api/posts
GET  /api/posts

POST /api/messages
GET  /api/messages/:userId

POST /api/jobs
GET  /api/jobs
POST /api/jobs/apply/:jobId

GET  /api/search

A complete API/Postman document is maintained separately.

Deployment

Frontend

The Vite frontend is deployed from the client directory on Vercel.

https://global-connect-lilac.vercel.app/

Environment variable:

VITE_API_URL=https://global-connect-backend-2uub.onrender.com/api

Backend

The Node/Express backend is deployed from the server directory on Render.

https://global-connect-backend-2uub.onrender.com

Render commands:

Build: npm install
Start: node src/server.js

Database

Production data is stored in MongoDB Atlas. Database credentials are stored as environment variables and must never be committed to Git.

Security

Environment secrets are excluded from Git.

JWT authentication protects private routes.

Passwords are hashed before storage.

Password-reset tokens expire.

Google OAuth credentials are stored as environment variables.

Admin operations require admin authorization.

Uploaded files are excluded from Git.

Testing

Major functional areas to test include authentication, Google OAuth, password reset, profiles, connections, posts, messaging, jobs, search, notifications, admin operations, and production deployment.

Detailed QA documents are maintained separately according to the project guide.

Documentation

Additional documentation includes:

docs/setup.md

API / Postman documentation

ER diagram

System architecture diagram

Authentication flow diagram

Developer Guide

Admin Guide

User Guide

Testing and QA documentation

Repository

https://github.com/Gowrav1624/Global_Connect

Deployment Summary

Component

Technology

Deployment

Frontend

React + Vite

Vercel

Backend

Node.js + Express

Render

Database

MongoDB + Mongoose

MongoDB Atlas

Authentication

JWT + Google OAuth

Render / Google Cloud

Real-time Communication

Socket.IO

Render + Vercel

Future Improvements

Advanced search and filtering

Additional moderation tools

Automated testing and CI/CD

Dedicated media storage

Performance monitoring and optimization

Additional accessibility improvements