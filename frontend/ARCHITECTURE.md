# Authentication Architecture & Implementation Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER / CLIENT                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Next.js Frontend                    │  │
│  │                                                      │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │         app/ (Protected Routes)             │   │  │
│  │  │  • /dashboard                               │   │  │
│  │  │  • /profile, /jobs, /projects, etc.        │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                         ↑                          │  │
│  │                    (Protected by                   │  │
│  │                   AuthWrapper)                     │  │
│  │                                                      │  │
│  │  ┌──────────────┐           ┌────────────────┐    │  │
│  │  │  Login Page  │──────────→│  Google OAuth  │    │  │
│  │  │ /auth/login  │           │    Button      │    │  │
│  │  └──────────────┘           └────────────────┘    │  │
│  │         ↓                            ↓             │  │
│  │   POST /login                Redirect to Google   │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↑                                              │
│         (Uses Axios                                        │
│       with Cookies)                                        │
│              ↓                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          AuthContext (lib/auth-context.tsx)         │  │
│  │                                                      │  │
│  │  • Manages: user, isAuthenticated, isInitialized    │  │
│  │  • Token Refresh Interceptor                        │  │
│  │  • Auto-refresh on 401                              │  │
│  │  • Logout handler                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↓                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      AppWrappers (lib/axios.ts + api config)        │  │
│  │                                                      │  │
│  │  • Axios instance with withCredentials: true        │  │
│  │  • Request/Response interceptors                    │  │
│  │  • Error handling                                   │  │
│  │  • X-Timestamp header (cache prevention)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          ↑           ↓
    (Cookies)    (API Requests)
          ↑           ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND / API                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          AuthService Endpoints                       │  │
│  │                                                      │  │
│  │  POST /auth-service/api/auth/login                  │  │
│  │  ├─ Request: { username, password }               │  │
│  │  └─ Response: { message, user }                   │  │
│  │     Sets: access_token, refresh_token (cookies)   │  │
│  │                                                      │  │
│  │  GET /auth-service/auth/oauth2/authorization/google│  │
│  │  ├─ Redirects to Google                            │  │
│  │  ├─ Handles OAuth callback                         │  │
│  │  └─ Sets: access_token, refresh_token (cookies)   │  │
│  │                                                      │  │
│  │  GET /auth-service/api/auth/me                     │  │
│  │  ├─ Uses: access_token cookie                      │  │
│  │  └─ Returns: Current user data                     │  │
│  │                                                      │  │
│  │  POST /auth-service/api/auth/refresh-token         │  │
│  │  ├─ Uses: refresh_token cookie                     │  │
│  │  ├─ Creates: new access_token cookie              │  │
│  │  └─ Called: on 401 errors                          │  │
│  │                                                      │  │
│  │  POST /auth-service/api/auth/logout                │  │
│  │  ├─ Uses: access_token cookie                      │  │
│  │  └─ Clears: token cookies                          │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↑           ↓                                   │
│         (Validates)  (Sets Cookies)                         │
│              ↓                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Database                               │  │
│  │  • Users table                                      │  │
│  │  • OAuth tokens (refresh token storage)             │  │
│  │  • Session management                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagrams

### 1. Standard Login Flow

```
User enters credentials
        ↓
  [Login Page]
/auth/login
        ↓
 Form Submit
        ↓
authService.login({username, password})
        ↓
POST /auth-service/api/auth/login
        ↓
[Backend validates credentials]
        ↓
Response + Set-Cookie Headers:
├─ access_token (HttpOnly)
├─ refresh_token (HttpOnly)
└─ user data
        ↓
setUser(response.user)
setIsAuthenticated(true)
        ↓
router.push('/dashboard')
        ↓
[Protected Route]
All subsequent requests include cookies automatically
```

### 2. Google OAuth Flow

```
User clicks "Continue with Google"
        ↓
authService.initiateGoogleLogin()
        ↓
window.location.href = 
  /auth-service/auth/oauth2/authorization/google
        ↓
[Backend redirects to Google]
        ↓
[User logs in with Google]
        ↓
[Google redirects back to backend]
        ↓
[Backend validates Google token]
        ↓
Response + Set-Cookie Headers:
├─ access_token (HttpOnly)
├─ refresh_token (HttpOnly)
└─ redirect to /auth/oauth-callback
        ↓
[OAuthCallback Page]
        ↓
authService.getCurrentUser()
        ↓
GET /auth-service/api/auth/me
(using access_token cookie)
        ↓
setUser(user)
setIsAuthenticated(true)
        ↓
router.push('/dashboard')
        ↓
[User logged in]
```

### 3. Token Refresh Flow

```
API request
        ↓
axios.get/post/put/delete(...)
        ↓
Request includes cookies automatically
(withCredentials: true)
        ↓
Server responds with 401 (token expired)
        ↓
[Response Interceptor]
api.interceptors.response
        ↓
Check: status === 401 && !originalRequest._retry
        ↓
originalRequest._retry = true
        ↓
POST /auth-service/api/auth/refresh-token
(using refresh_token cookie)
        ↓
[Backend validates refresh token]
        ↓
Sets new access_token cookie
        ↓
Response 200 OK
        ↓
Retry original request
(with new access_token cookie)
        ↓
Request succeeds ✓
```

### 4. Protected Route Flow

```
User visits protected route
e.g., /dashboard
        ↓
[AuthWrapper checks route]
        ↓
isPublicRoute?
├─ YES → Render immediately
└─ NO → Continue...
        ↓
isAuthRoute?
├─ YES → Check isAuthenticated
│        ├─ YES → Redirect to /dashboard
│        └─ NO → Render login page
└─ NO → Continue...
        ↓
isProtectedRoute?
├─ YES → Check isAuthenticated
│        ├─ YES → Render page
│        └─ NO → Show loading, redirect to /auth/login
└─ NO → Public route, render immediately
        ↓
User can access route or redirected appropriately
```

## Component Hierarchy

```
layout.tsx (Root)
    ↓
<html>
    ↓
<body>
    ↓
AppWrappers.tsx
    ├─ Disables SSR (dynamic import)
    ├─ Wraps with NoSSR component
    └─ Wraps with AuthProvider
        ↓
    AuthProvider (AuthContext)
        ├─ Initializes auth on load
        ├─ Sets up token refresh interceptor
        └─ Provides useAuth hook
        ↓
    AuthWrapper.tsx
        ├─ Checks route types
        ├─ Shows loading states
        ├─ Handles redirects
        └─ Protects routes
        ↓
    ClientLayout.tsx
        └─ Simple wrapper
        ↓
        {children}
        ↓
        Page Routes
        ├─ /auth/* (public auth pages)
        ├─ / (public home)
        ├─ /protfolio (public portfolio)
        └─ /dashboard, /profile, /jobs, etc. (protected)
```

## State Management Flow

```
[AuthContext State]
├─ user: User | null
├─ isAuthenticated: boolean
├─ isInitialized: boolean
└─ isRefreshing: boolean

[Updates]
├─ Initial load: fetchMe() → getMe() ✓
├─ Login: login() → setUser() + setIsAuthenticated()
├─ OAuth: getCurrentUser() → setUser()
├─ Token refresh: refresh() → interceptor retry
├─ Logout: clearUser() → setUser(null)
└─ Error: 401 → refresh() → redirect if failed

[Effects]
├─ useEffect: Initialize auth on mount
├─ useLayoutEffect: Setup token refresh interceptor
└─ useEffect: Handle redirects based on state
```

## API Request/Response Flow

```
[Frontend Component]
        ↓
[Axios Instance (withCredentials: true)]
    ├─ Request interceptor
    │   ├─ Add X-Timestamp header
    │   └─ Forward request
    │
    ├─ HTTP Request
    │   ├─ Method: GET/POST/PUT/DELETE
    │   ├─ Headers: Content-Type, X-Timestamp
    │   ├─ Cookies: access_token, refresh_token (automatic)
    │   └─ Body: (if applicable)
    │
    └─ Response interceptor
        ├─ Check status
        │   ├─ 200-299 → Return response
        │   ├─ 401 → Attempt refresh
        │   │       ├─ POST /refresh-token
        │   │       ├─ Retry original request
        │   │       └─ Return new response
        │   ├─ 4xx → Log error, reject
        │   └─ 5xx → Log error, reject
        └─ Return to caller
        ↓
[Response Data or Error]
```

## Cookie Management

```
[Login/OAuth Success]
        ↓
Backend: Set-Cookie Headers
├─ access_token
│  ├─ HttpOnly: true
│  ├─ Secure: true (production)
│  ├─ SameSite: Lax
│  └─ Path: /
│
├─ refresh_token
│  ├─ HttpOnly: true
│  ├─ Secure: true (production)
│  ├─ SameSite: Lax
│  └─ Path: /
│
└─ User-Agent: Stores in secure cookie storage
        ↓
[Subsequent Requests]
        ↓
Browser automatically includes cookies
because: withCredentials: true
        ↓
Backend validates access_token
├─ Valid → Process request
├─ Expired → Return 401
└─ Invalid → Return 401
        ↓
[On 401 - Token Refresh]
        ↓
Frontend: POST /refresh-token
(refresh_token automatically sent in cookies)
        ↓
Backend: Validates refresh_token
├─ Valid → Create new access_token
│          ├─ Set-Cookie: new access_token
│          └─ Return 200
│
└─ Invalid → Return 401
             ├─ Logout user
             └─ Redirect to login
        ↓
Frontend: Retry original request
```

## Security Measures

```
[XSS Protection]
├─ HttpOnly cookies: Cannot be accessed by JavaScript
├─ Secure cookies: Only sent over HTTPS
└─ No token in localStorage (no JS access needed)

[CSRF Protection]
├─ SameSite=Lax cookies: Prevents cross-site requests
└─ Backend validates request origin (if implemented)

[Token Management]
├─ Short-lived access tokens (typically 15-30 min)
├─ Longer-lived refresh tokens (typically 7 days)
├─ Refresh token rotation on server-side
└─ Automatic token refresh on expiration

[API Security]
├─ withCredentials: true ensures cookies sent
├─ Backend validates every request
└─ Logout clears all tokens from database

[Session Management]
├─ Session per browser (cookies)
├─ No cross-device token sharing
└─ Each device maintains separate session
```

## Key Files & Their Responsibilities

```
lib/auth.ts
├─ AuthService class
├─ login(credentials)
├─ register(data)
├─ initiateGoogleLogin()
├─ getCurrentUser()
├─ refresh()
├─ logout()
└─ healthCheck()

lib/auth-context.tsx
├─ AuthContext creation
├─ AuthProvider component
├─ useAuth hook
├─ Auth state management
├─ Token refresh interceptor setup
└─ Auto-initialization on mount

lib/axios.ts
├─ Axios instance creation
├─ withCredentials: true
├─ Request interceptor
├─ Response interceptor
└─ Error handling

app/AppWrappers.tsx
├─ NoSSR wrapper (dynamic import)
├─ AuthProvider wrapper
└─ Prevents hydration mismatch

app/AuthWrapper.tsx
├─ Route type detection
├─ Public route handling
├─ Auth route handling
├─ Protected route handling
├─ Loading state management
└─ Redirect logic

app/auth/login/page.tsx
├─ Login form UI
├─ Username/password fields
├─ Google OAuth button
├─ authService.login() call
└─ Redirect on success

app/auth/oauth-callback/page.tsx
├─ OAuth callback handler
├─ Fetches current user
├─ Updates auth context
└─ Redirects to dashboard
```

## Testing Strategy

### Unit Tests
- AuthService methods
- Credential validation
- Error handling

### Integration Tests
- Login flow end-to-end
- OAuth flow end-to-end
- Token refresh flow
- Logout flow

### E2E Tests
- Full user journey: login → access protected route → logout
- OAuth flow: Google login → dashboard access
- Token expiration: 401 → refresh → retry
- Route protection: unauthenticated → redirect to login

### Manual Testing
```bash
# Test standard login
1. Open http://localhost:3000/auth/login
2. Enter test credentials
3. Check Network tab for Set-Cookie headers
4. Check Application tab for cookies
5. Should redirect to /dashboard
6. Check requests include Cookie header

# Test Google OAuth
1. Click "Continue with Google"
2. Complete Google auth
3. Should redirect to /auth/oauth-callback
4. Fetch user and redirect to /dashboard
5. Check cookies were set

# Test protected routes
1. Clear cookies or open private window
2. Try accessing /dashboard
3. Should redirect to /auth/login
4. Login and access /dashboard
5. Should render dashboard

# Test token refresh
1. Login successfully
2. Open Network tab
3. Look for API requests
4. Simulate token expiration (modify response status)
5. Should see auto-refresh occur
6. Original request should retry and succeed
```

---

This architecture ensures secure, scalable authentication with automatic token management and excellent user experience.
