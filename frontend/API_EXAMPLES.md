# Authentication API Examples

## Standard Login

### Request
```bash
curl -X POST http://localhost:8088/auth-service/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rifathridoy",
    "password": "securePass123"
  }' \
  -c cookies.txt
```

### Response
```json
{
  "message": "Login successful",
  "user": {
    "userID": "123",
    "username": "rifathridoy",
    "email": "user@example.com",
    "name": "Rifat Hridoy",
    "role": "developer",
    "avatar": "https://...",
    "isActive": true
  }
}
```

---

## Google OAuth Flow

### Step 1: Initiate OAuth
Navigate to:
```
http://localhost:8088/auth-service/auth/oauth2/authorization/google
```

Backend will:
1. Redirect to Google login
2. User authenticates with Google
3. Backend validates Google token
4. Backend sets `access_token` and `refresh_token` cookies
5. Redirects to frontend: `http://localhost:3000/auth/oauth-callback`

### Step 2: Frontend Callback Handler
Frontend `/auth/oauth-callback` page:
1. Calls `getCurrentUser()` to fetch user data (uses cookies)
2. Updates auth context
3. Redirects to `/dashboard`

---

## Get Current User

### Request
```bash
curl -X GET http://localhost:8088/auth-service/api/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Response
```json
{
  "userID": "123",
  "username": "rifathridoy",
  "email": "user@example.com",
  "name": "Rifat Hridoy",
  "role": "developer"
}
```

---

## Refresh Token

### Request
```bash
curl -X POST http://localhost:8088/auth-service/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Response
```json
{
  "message": "Token refreshed successfully",
  "user": { ... }
}
```

---

## Register User

### Request
```bash
curl -X POST http://localhost:8088/auth-service/api/auth/register/developer \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "name": "New User",
    "email": "newuser@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "password": "SecurePass123!"
  }'
```

### Response
```json
{
  "message": "Registration successful",
  "user": { ... }
}
```

---

## Logout

### Request
```bash
curl -X POST http://localhost:8088/auth-service/api/auth/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Response
```json
{
  "message": "Logout successful"
}
```

---

## Cookie Details

After successful login/OAuth, backend sets these cookies:

```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiI....; HttpOnly; Secure; SameSite=Lax; Path=/
Set-Cookie: refresh_token=eyJhbGciOiJIUzI1NiI....; HttpOnly; Secure; SameSite=Lax; Path=/
```

**Cookie Attributes:**
- `HttpOnly` - Cannot be accessed via JavaScript (XSS protection)
- `Secure` - Only sent over HTTPS (production)
- `SameSite=Lax` - CSRF protection
- `Path=/` - Available for all routes

---

## Frontend Integration

### Using AuthService in Components

```typescript
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/auth';

export function MyComponent() {
  const { user, isAuthenticated, clearUser } = useAuth();

  // Login
  const handleLogin = async () => {
    const response = await authService.login({
      username: 'rifathridoy',
      password: 'securePass123'
    });
    console.log('Logged in as:', response.user);
  };

  // Google Login
  const handleGoogleLogin = () => {
    authService.initiateGoogleLogin();
  };

  // Logout
  const handleLogout = async () => {
    await clearUser();
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.username}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleGoogleLogin}>Login with Google</button>
        </>
      )}
    </div>
  );
}
```

---

## Testing Locally

### Prerequisites
- Backend running on `http://localhost:8088`
- Frontend running on `http://localhost:3000`
- CORS enabled on backend for `http://localhost:3000`
- Google OAuth credentials configured on backend

### Test Scenarios

**1. Standard Login Flow**
```bash
npm run dev
# Visit http://localhost:3000/auth/login
# Enter: username=rifathridoy, password=securePass123
# Should redirect to /dashboard
```

**2. Google OAuth Flow**
```bash
# Visit http://localhost:3000/auth/login
# Click "Continue with Google"
# Complete Google auth
# Should redirect to /auth/oauth-callback then /dashboard
```

**3. Protected Route Access**
```bash
# Visit http://localhost:3000/dashboard (without login)
# Should redirect to /auth/login
```

**4. Token Refresh**
```bash
# Login successfully
# Make API request that returns 401
# Should auto-refresh and retry
```

---

## Troubleshooting

### Cookies Not Being Set
- Check backend CORS configuration
- Ensure `withCredentials: true` in axios
- Verify backend is setting `Set-Cookie` headers
- Check browser console for CORS errors

### Redirect Loop
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify OAuth callback URL matches
- Check backend redirect configuration

### 401 on Protected Routes
- Login again to get fresh tokens
- Check if refresh token is expired
- Verify backend token validation

### Google OAuth Not Working
- Verify Google OAuth credentials on backend
- Check redirect URI configuration in Google Console
- Ensure frontend OAuth callback route exists
- Check backend logs for OAuth errors
