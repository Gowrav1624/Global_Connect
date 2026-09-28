# System Architecture

## 1. Overview
Global Connect follows a client-server architecture with a React frontend, Express backend, MongoDB database, and supporting authentication and real-time communication services.

## 2. Architecture Components

### Frontend
- React
- Vite
- Client-side routing/state management as implemented
- API communication with the backend
- User interface and interaction handling

### Backend
- Node.js
- Express
- REST API
- Authentication and authorization middleware
- Business logic
- Validation and error handling

### Database
- MongoDB
- Mongoose ODM
- Persistent storage for users and application data

### Authentication
- JWT for authenticated API sessions
- Google OAuth where configured

### Real-Time Layer
- Socket.IO for supported real-time messaging/events

## 3. Data Flow
1. User interacts with the React client.
2. The client sends an API request to the Express backend.
3. Authentication middleware validates protected requests.
4. Backend logic validates and processes the request.
5. Mongoose accesses MongoDB when persistence is required.
6. The backend returns the result to the client.
7. Socket.IO handles supported real-time events independently of normal REST requests.

## 4. Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 5. Security Boundaries
- Client credentials and secrets must not be hard-coded.
- Backend environment variables contain sensitive configuration.
- Protected API routes require authentication.
- Authorization controls administrative operations.
- Database access is performed through the backend rather than directly from the browser.
