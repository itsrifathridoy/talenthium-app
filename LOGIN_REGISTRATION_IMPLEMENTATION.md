# Login and Registration Implementation

This document describes the login and registration functionality implemented for the Talenthium microservice ecosystem.

## Overview

The authentication system is built using:
- **Frontend**: Next.js with React Context for state management
- **Backend**: Spring Boot with JWT token-based authentication
- **Communication**: HTTP REST API with JSON payloads

## Frontend Implementation

### 1. API Client (`/frontend/lib/api-client.ts`)

A reusable HTTP client for making API requests with automatic token injection:

```typescript
// Usage
import { apiClient } from '@/lib/api-client';

const response = await apiClient.post('/api/auth/login', {
  username: 'user@example.com',
  password: 'password123'
});
```

**Features:**
- Automatic token injection from localStorage
- Error handling and JSON parsing
- Support for GET, POST, PUT, DELETE methods
- Credentials and CORS support

### 2. Auth Context (`/frontend/lib/auth-context.tsx`)

React Context for managing authentication state globally:

```typescript
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();
  
  // Access auth state and methods
}
```

**Provides:**
- User profile information
- Authentication status
- Loading state for async operations
- Error messages
- `login(email, password)` - Handle user login
- `register(data)` - Handle user registration
- `logout()` - Clear auth state
- `getMe()` - Fetch current user info

### 3. Login Page (`/frontend/app/auth/login/page.tsx`)

User login interface with:
- Email and password input fields
- Form validation
- Error display
- Loading state handling
- Forgot password link
- Redirect to registration

**Features:**
- Client-side validation
- Error feedback to users
- Automatic redirect to dashboard on success
- Loading state while submitting

### 4. Register Page (`/frontend/app/auth/register/page.tsx`)

User registration interface with:
- Name, email, password inputs
- User type selection (Developer/Recruiter)
- Password confirmation
- Form validation
- Error handling

**Features:**
- Role-based registration routing
- Password matching validation
- Automatic redirect to OTP verification on success

### 5. Protected Routes (`/frontend/components/ProtectedRoute.tsx`)

Wrapper component for protecting routes requiring authentication:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="DEVELOPER">
      <Dashboard />
    </ProtectedRoute>
  );
}
```

**Features:**
- Automatic redirection to login if not authenticated
- Role-based access control
- Loading state while checking auth
- Clean separation of concerns

## Backend Implementation

### 1. Auth Controller (`/auth-service/src/main/java/.../controller/AuthController.java`)

REST endpoints for authentication:

- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/register/developer` - Register as developer
- `POST /api/auth/register/recruiter` - Register as recruiter
- `GET /api/auth/me` - Get current user details
- `POST /api/auth/refresh` - Refresh JWT token

### 2. Auth Service (`/auth-service/src/main/java/.../service/AuthService.java`)

Core authentication logic:
- User registration (Developer/Recruiter specific logic)
- Login authentication using AuthenticationManager
- JWT token generation
- Token refresh handling
- User validation

### 3. JWT Service

Handles JWT token generation and validation:
- Create access tokens with user claims
- Create refresh tokens for token renewal
- Token validation and parsing
- Token expiration handling

### 4. Security Configuration (`/auth-service/src/main/java/.../config/SecurityConfig.java`)

Spring Security setup:
- OAuth2 integration (Google, GitHub)
- CORS configuration for frontend requests
- JWT filter chain configuration
- Public endpoint whitelisting
- Stateless session management

### 5. CORS Configuration (`/auth-service/src/main/java/.../config/CorsConfig.java`)

Cross-Origin Resource Sharing setup:

```java
// Allowed origins
- http://localhost:3000
- http://127.0.0.1:3000

// Allowed methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
// Allowed headers: Content-Type, Authorization, X-Requested-With, Accept
// Exposed headers: Authorization, Set-Cookie
```

## API Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

### Register Developer
```
POST /api/auth/register/developer
Content-Type: application/json

{
  "username": "johndev",
  "name": "John Developer",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15"
}
```

### Register Recruiter
```
POST /api/auth/register/recruiter
Content-Type: application/json

{
  "username": "janerecruitr",
  "name": "Jane Recruiter",
  "email": "jane@company.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "dateOfBirth": "1985-05-20"
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <accessToken>

Response:
{
  "userID": "uuid",
  "username": "user@example.com",
  "email": "user@example.com",
  "name": "User Name",
  "phone": "+1234567890",
  "role": "DEVELOPER",
  "dateOfBirth": "1990-01-15",
  "avatar": "https://...",
  "isActive": true
}
```

## Authentication Flow

### Login Flow
1. User enters email and password on login page
2. Frontend validates inputs (non-empty, valid email format)
3. Frontend calls `POST /api/auth/login` with username and password
4. Backend authenticates user using Spring Security
5. Backend generates JWT access token and refresh token
6. Frontend stores access token in localStorage
7. Frontend redirects user to dashboard
8. Protected routes automatically check authentication status

### Registration Flow
1. User fills registration form (name, email, password, role)
2. Frontend validates inputs (match, length, format)
3. Frontend calls appropriate register endpoint based on role
4. Backend validates all fields (uniqueness, format, business rules)
5. Backend creates new user account and publishes `UserCreatedEvent` to Kafka
6. Frontend redirects to OTP verification page
7. User completes OTP verification
8. User is now registered and can login

## Configuration

### Frontend Environment Variables
Create `.env.local` file in frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8088
```

### Backend Application Properties
Auth service uses standard Spring Boot configuration in `application.yml`:

```yaml
# API Gateway is configured to route /api/auth/** to auth-service
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/

spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_GOOGLE_CLIENT_ID
            client-secret: YOUR_GOOGLE_CLIENT_SECRET
          github:
            client-id: YOUR_GITHUB_CLIENT_ID
            client-secret: YOUR_GITHUB_CLIENT_SECRET
```

## Security Features

1. **Password Encryption**: BCrypt password hashing
2. **JWT Tokens**: Stateless authentication with JWT
3. **CORS**: Properly configured cross-origin requests
4. **HTTPS Ready**: Secure cookie settings (httpOnly, sameSite, secure flags)
5. **Token Refresh**: Automatic token refresh mechanism
6. **Input Validation**: Both frontend and backend validation
7. **Role-Based Access**: RBAC for protected routes

## Development Setup

### Prerequisites
- Node.js 18+ (frontend)
- Java 24 (backend)
- Maven (backend build)
- PostgreSQL (database)
- Redis (session management)

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

### Start Backend
```bash
cd auth-service
mvn clean install
mvn spring-boot:run
```
Auth service registers with Eureka and routes through API Gateway on port 8088

### Access Application
1. Navigate to `http://localhost:3000/auth/register` to create account
2. Navigate to `http://localhost:3000/auth/login` to login
3. Dashboard and protected routes redirect to login if not authenticated

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Please fill in all fields" | Missing input | Complete all form fields |
| "Please enter a valid email" | Invalid email format | Use valid email (user@domain.com) |
| "Password must be at least 6 characters" | Password too short | Use 6+ character password |
| "Passwords do not match" | Confirm password mismatch | Ensure both passwords match |
| "Login failed" | Invalid credentials | Check email and password |
| "Email already exists" | Email already registered | Use different email or login |
| CORS error | Frontend not in allowed origins | Add origin to CORS configuration |

## Best Practices

1. **Never store sensitive data in localStorage** - Only store JWT token
2. **Always validate on both frontend and backend** - Defense in depth
3. **Use HTTPS in production** - Secure token transmission
4. **Implement token refresh** - Extend user sessions without re-login
5. **Log security events** - Monitor for suspicious activities
6. **Test auth flows** - Ensure smooth user experience
7. **Handle token expiration** - Gracefully redirect to login

## Future Enhancements

1. **Multi-Factor Authentication (MFA)** - OTP/SMS verification
2. **Social Login** - Complete OAuth2 integration (Google, GitHub)
3. **Remember Me** - Extended session persistence
4. **Account Recovery** - Forgotten password reset flow
5. **Session Management** - Concurrent login limits, session timeout
6. **Audit Logging** - Track all authentication events
7. **Rate Limiting** - Prevent brute force attacks
8. **Email Verification** - Verify email before activation

## Troubleshooting

### Frontend Issues

**Issue**: "Failed to fetch" error
- Check if backend is running on correct port
- Verify CORS configuration includes your frontend origin
- Check browser console for actual error

**Issue**: Blank page on login
- Ensure AuthProvider wraps your routes
- Check if useAuth() is called within AuthProvider context
- Verify environment variables are set

### Backend Issues

**Issue**: "User not found" error
- Verify user exists in database
- Check username matches exactly
- Ensure password is correct

**Issue**: Token validation fails
- Verify JWT secret is configured
- Check token hasn't expired
- Ensure proper Authorization header format: `Bearer <token>`

## Support

For issues or questions, please refer to the project documentation or contact the development team.
