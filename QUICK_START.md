# Quick Start Guide - Login & Registration

## 🎯 What Was Implemented

Complete login and registration system with frontend forms, backend authentication, JWT tokens, and protected routes.

## ⚡ Quick Setup

### 1. Frontend Setup (5 minutes)
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Frontend runs on `http://localhost:3000`

### 2. Backend Setup (5 minutes)
```bash
# Terminal 1 - Start Eureka Discovery Service
cd discovery-service
mvn spring-boot:run

# Terminal 2 - Start API Gateway
cd api-gateway
mvn spring-boot:run

# Terminal 3 - Start Auth Service
cd auth-service
mvn spring-boot:run
```

Services will be available:
- Discovery Service: `http://localhost:8761`
- API Gateway: `http://localhost:8088`
- Auth Service: (registered with Eureka, accessed via gateway)

## 🧪 Test the Implementation

### 1. Create New Account
```
1. Go to http://localhost:3000/auth/register
2. Enter name, email, password
3. Select "Developer" or "Recruiter"
4. Click Register
5. (Setup OTP verification as next step)
```

### 2. Login
```
1. Go to http://localhost:3000/auth/login
2. Enter email/username and password
3. Click "Sign In Now"
4. Should redirect to dashboard
5. Token stored in localStorage
```

### 3. Test Protected Routes
```
1. Try accessing any protected route without logging in
2. You'll be redirected to login page
3. After login, access is granted
4. Refresh page - state persists (token from localStorage)
```

## 📝 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8088
```

### Backend (Optional Overrides)
Already configured in `application.yml` files

## 📂 Key Files Created/Updated

### Frontend
- ✅ `frontend/lib/api-client.ts` - HTTP client with auth
- ✅ `frontend/lib/auth-context.tsx` - Auth state management
- ✅ `frontend/components/ProtectedRoute.tsx` - Route protection
- ✅ `frontend/app/auth/login/page.tsx` - Updated with logic
- ✅ `frontend/app/auth/register/page.tsx` - Updated with logic
- ✅ `frontend/app/auth/layout.tsx` - Updated with AuthProvider
- ✅ `frontend/.env.local.example` - Config template

### Backend
- ✅ `auth-service/src/main/java/.../config/CorsConfig.java` - CORS setup
- ✅ `auth-service/src/main/java/.../config/SecurityConfig.java` - Updated security

## 🔐 How It Works

### Login Flow
```
User enters email/password
    ↓
Frontend validates input
    ↓
POST /api/auth/login (via API Gateway to Auth Service)
    ↓
Backend authenticates with AuthenticationManager
    ↓
JWT tokens generated (access + refresh)
    ↓
Token stored in localStorage
    ↓
User redirected to dashboard
    ↓
Protected routes automatically accessible
```

### Registration Flow
```
User fills form + selects role
    ↓
Frontend validates input
    ↓
POST /api/auth/register/developer or /recruiter
    ↓
Backend validates uniqueness (email, username)
    ↓
User created in database
    ↓
UserCreatedEvent published to Kafka
    ↓
Redirect to OTP verification page
```

### Token Injection
```
Every API request
    ↓
Check localStorage for access_token
    ↓
Add Authorization: Bearer <token> header
    ↓
Send request with credentials
```

## 🛠️ Common Tasks

### Access User Info in Component
```typescript
import { useAuth } from '@/lib/auth-context';

export default function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### Protect a Route
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute requiredRole="DEVELOPER">
      <div>Developer Only Content</div>
    </ProtectedRoute>
  );
}
```

### Make Authenticated API Call
```typescript
import { apiClient } from '@/lib/api-client';

const data = await apiClient.get('/api/users/profile');
// Token automatically included!
```

### Handle Logout
```typescript
import { useAuth } from '@/lib/auth-context';

function LogoutButton() {
  const { logout } = useAuth();
  
  return <button onClick={logout}>Logout</button>;
}
```

## 🐛 Troubleshooting

### "Failed to fetch" Error
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS configuration in SecurityConfig

### Blank Login Page
- Ensure `npm install` was run
- Check browser console for errors
- Verify `useAuth()` is within `AuthProvider`

### Login Button Not Working
- Check browser console for error details
- Verify database has the user
- Ensure backend is running and accessible

### "User not found" Error
- Backend expects `username` field (not `email`)
- Frontend converts email to username automatically
- Check user exists in database

## 📚 Documentation

For detailed information, see:
- `LOGIN_REGISTRATION_IMPLEMENTATION.md` - Complete technical docs
- `IMPLEMENTATION_SUMMARY.md` - Overview and checklist

## ✨ Next Steps

1. **Implement OTP Verification** - Email/SMS validation
2. **Add Password Reset** - Forgot password flow
3. **Social Login** - Google/GitHub OAuth completion
4. **Session Management** - Device login limits
5. **User Profile** - Edit account settings
6. **Audit Logging** - Track auth events

## 🚀 Ready to Go!

Your authentication system is now ready. Users can:
- ✅ Create accounts (Developer/Recruiter)
- ✅ Login with credentials
- ✅ Access protected routes
- ✅ Persist sessions across page refreshes
- ✅ Receive proper error messages

Happy coding! 🎉
