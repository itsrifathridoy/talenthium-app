# Authentication Setup Documentation

## Overview

This frontend uses a **client-side authentication pattern** with **httpOnly cookies** for secure token storage. The backend sets `access_token` and `refresh_token` cookies automatically on login and OAuth flows.

## Authentication Flow

### 1. **Standard Login**
- **Endpoint**: `POST /auth-service/api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "rifathridoy",
    "password": "securePass123"
  }
  ```
- **Response**: Sets `access_token` and `refresh_token` cookies automatically via backend
- **Flow**:
  1. User enters username and password on `/auth/login`
  2. Frontend calls `authService.login()`
  3. Backend validates credentials and sets httpOnly cookies
  4. Frontend calls `getCurrentUser()` to fetch user data
  5. User is redirected to `/dashboard`

### 2. **Google OAuth Login**
- **OAuth Endpoint**: `GET /auth-service/auth/oauth2/authorization/google`
- **Flow**:
  1. User clicks "Continue with Google" button
  2. Frontend redirects to `http://localhost:8088/auth-service/auth/oauth2/authorization/google`
  3. Backend handles Google OAuth, authenticates user, and sets httpOnly cookies
  4. Backend redirects to frontend OAuth callback: `/auth/oauth-callback`
  5. Callback page fetches current user and redirects to `/dashboard`

### 3. **Token Refresh**
- **Endpoint**: `POST /auth-service/api/auth/refresh-token`
- **Trigger**: When a 401 error occurs and token needs refresh
- **Handled By**: `AuthContext` axios interceptor
- **Flow**:
  1. API request gets 401 Unauthorized
  2. Interceptor attempts token refresh using refresh token cookie
  3. Original request is retried
  4. If refresh fails, user is redirected to login

### 4. **Logout**
- **Endpoint**: `POST /auth-service/api/auth/logout`
- **Flow**:
  1. User clicks logout
  2. Frontend calls `clearUser()` from auth context
  3. Backend clears cookie tokens
  4. User is redirected to `/auth/login`

## File Structure

```
lib/
├── auth.ts              # AuthService class - login, register, getCurrentUser, logout
├── auth-context.tsx     # React Context for auth state + token refresh interceptor
└── axios.ts            # Axios instance with httpOnly cookie support

app/
├── AppWrappers.tsx      # NoSSR wrapper + AuthProvider
├── AuthWrapper.tsx      # Client-side route protection
├── ClientLayout.tsx     # Layout wrapper
└── auth/
    ├── login/page.tsx           # Login with username + Google OAuth
    ├── register/page.tsx        # User registration
    ├── oauth-callback/page.tsx  # OAuth redirect handler
    └── forgot-password/page.tsx # Password reset
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8088
```

Available options in `.env.example`

## Key Components

### AuthService (`lib/auth.ts`)
Handles all authentication operations:
- `login(credentials)` - Username/password login
- `initiateGoogleLogin()` - Redirect to Google OAuth
- `register(data)` - User registration
- `getCurrentUser()` - Fetch authenticated user
- `refresh()` - Refresh access token
- `logout()` - Clear session
- `healthCheck()` - Verify API connectivity

### AuthContext (`lib/auth-context.tsx`)
Manages auth state and provides:
- `user` - Current authenticated user
- `isAuthenticated` - Login status
- `isInitialized` - Auth initialization complete
- `setUser(user)` - Update user
- `clearUser()` - Logout
- **Automatic token refresh interceptor** - Handles 401 errors

### AuthWrapper (`app/AuthWrapper.tsx`)
Client-side route protection:
- **Public routes**: `/`, `/protfolio` (no auth required)
- **Auth routes**: `/auth/*` (logged-in users redirected to dashboard)
- **Protected routes**: `/dashboard`, `/profile`, `/jobs`, etc. (require auth)
- Shows loading state during auth initialization

### AppWrappers (`app/AppWrappers.tsx`)
Disables SSR and wraps app with AuthProvider to prevent hydration issues

## Authentication Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├─→ /auth/login
       │       ├─ Standard Login
       │       │    └→ POST /auth/login
       │       │         └→ Cookies set (access_token, refresh_token)
       │       └─ Google OAuth
       │            └→ GET /auth/oauth2/authorization/google
       │                 └→ Backend handles OAuth
       │                     └→ Cookies set
       │                         └→ Redirect to /auth/oauth-callback
       │
       ├─→ /auth/oauth-callback
       │    └→ Fetch user & redirect to dashboard
       │
       ├─→ /dashboard (Protected)
       │    └→ AuthWrapper checks auth
       │         └→ Request made with cookies
       │              └→ If 401 → Refresh token → Retry
       │
       └─→ Logout
            └→ POST /logout
                 └→ Clear cookies
                     └→ Redirect to /auth/login
```

## Cookie-Based Authentication

### Why httpOnly Cookies?

✅ **Secure**: Cannot be accessed by JavaScript (XSS protection)  
✅ **Automatic**: Sent with every request automatically  
✅ **No Manual Token Management**: No need to store tokens in localStorage  
✅ **CSRF Protection**: Can be combined with CSRF tokens if needed

### Axios Configuration

```typescript
// Enable automatic cookie sending
export const api = axios.create({
  withCredentials: true,  // Critical for cookie support
  baseURL: API_URL,
});
```

## Protected Routes

Routes automatically protected by `AuthWrapper`:
- `/dashboard`
- `/profile`
- `/interviews`
- `/jobs` and `/jobs/[id]`
- `/mentorship` and `/mentorship/[mentorId]`
- `/projects` and `/projects/[projectId]`
- `/call`

## Development Notes

### Testing Login

```bash
# Start with dev server
npm run dev

# Visit http://localhost:3000/auth/login
# Use test credentials from backend
# Username: rifathridoy
# Password: securePass123
```

### Testing Google OAuth

1. Navigate to `/auth/login`
2. Click "Continue with Google"
3. Complete Google authentication
4. Should redirect back to frontend and set cookies
5. User redirected to `/dashboard`

### Debugging

Enable debug logging:
```typescript
// In AuthContext.tsx
console.log('Token refresh:', response);
console.log('Current user:', user);
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token expired | Automatic refresh or redirect to login |
| Network Error | API unreachable | Check `NEXT_PUBLIC_API_URL` |
| Hydration mismatch | SSR auth issues | AppWrappers disables SSR |
| Cookies not sent | `withCredentials` false | Check axios config |

## Security Best Practices

✅ httpOnly cookies prevent XSS attacks  
✅ Refresh token rotation on server-side  
✅ CORS properly configured on backend  
✅ Token refresh happens automatically  
✅ No sensitive data in localStorage  

## Future Enhancements

- [ ] Add CSRF token support
- [ ] Implement remember me functionality
- [ ] Add biometric authentication
- [ ] Session timeout warnings
- [ ] Rate limiting on login attempts
