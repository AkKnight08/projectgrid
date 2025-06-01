# FlowManager Backend

This is the backend server for the FlowManager project management application. It provides a RESTful API for managing projects, tasks, and users.

## Features

- User authentication and authorization
- Project management
- Task management with comments
- User management
- Role-based access control

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/flow-manager
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PATCH /api/auth/settings - Update user settings

### Projects
- POST /api/projects - Create a new project
- GET /api/projects - Get all projects for user
- GET /api/projects/:id - Get project by ID
- PATCH /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project
- POST /api/projects/:id/members - Add member to project
- DELETE /api/projects/:id/members/:userId - Remove member from project

### Tasks
- POST /api/tasks - Create a new task
- GET /api/tasks/project/:projectId - Get tasks for a project
- GET /api/tasks/:id - Get task by ID
- PATCH /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
- POST /api/tasks/:id/comments - Add comment to task
- DELETE /api/tasks/:id/comments/:commentId - Remove comment from task

### Users
- GET /api/users - Get all users (admin only)
- GET /api/users/:id - Get user by ID
- PATCH /api/users/:id - Update user
- DELETE /api/users/:id - Delete user
- PATCH /api/users/:id/role - Update user role (admin only)

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS enabled
- Helmet security headers
- Input validation

## License

ISC 