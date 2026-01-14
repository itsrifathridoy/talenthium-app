# Quick Start Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8088`
- Google OAuth credentials configured on backend

## Installation

```bash
cd frontend
npm install
```

## Configuration

### 1. Create `.env.local`

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8088

# Optional: Google OAuth callback URL (defaults to current origin)
# NEXT_PUBLIC_OAUTH_CALLBACK_URL=http://localhost:3000/auth/oauth-callback
```

### 2. Verify Backend Connection

```bash
# Backend should be running on port 8088
# Check: http://localhost:8088/health or similar endpoint
```

## Running the Application

### Development Mode
```bash
npm run dev
```

Browser will open at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run start
```

## Testing Authentication

### Test Account
```
Username: rifathridoy
Password: securePass123
```

### Login Flow
1. Navigate to `http://localhost:3000`
2. Click "Sign In" or similar button
3. Enter test credentials
4. Should redirect to dashboard
5. Check DevTools → Application → Cookies for `access_token` and `refresh_token`

### Google OAuth Flow
1. Navigate to login page
2. Click "Continue with Google"
3. Complete Google authentication
4. Should redirect back to frontend
5. Automatically log in and redirect to dashboard

### Protected Routes
```
✅ /dashboard
✅ /profile
✅ /jobs
✅ /interviews
✅ /projects
✅ /mentorship
✅ /call

❌ Accessing without login redirects to /auth/login
```

### Public Routes
```
✅ /
✅ /protfolio
✅ /auth/login
✅ /auth/register
✅ /auth/forgot-password
✅ /auth/otp-verification

(Accessible without authentication)
```

## Debugging

### Enable Console Logging
Edit `lib/auth-context.tsx`:
```typescript
console.log('User authenticated:', user);
console.log('Token refreshed:', response);
```

### Check Cookies
DevTools → Application → Cookies → localhost:3000
```
✅ access_token (HttpOnly)
✅ refresh_token (HttpOnly)
```

### Check Network Requests
DevTools → Network
```
✅ POST /auth/login (should set cookies)
✅ GET /auth/me (should use cookies)
✅ Requests should include Cookie header
```

### Check Auth State
DevTools → Console
```javascript
// If you add a global debug function:
window.__auth?.user
window.__auth?.isAuthenticated
```

## Common Issues

### "API_URL is not defined"
- Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8088`
- Restart dev server

### Cookies Not Being Set
- Check backend CORS is configured for `http://localhost:3000`
- Verify backend is setting `Set-Cookie` headers
- Check Network tab for `Set-Cookie` response header

### 401 Unauthorized Loop
- Login again to refresh tokens
- Check if refresh token is expired
- Check backend token validation logic

### Google OAuth Fails
- Verify Google OAuth configured on backend
- Check OAuth callback URL in Google Cloud Console
- Check frontend OAuth route exists
- See backend logs for OAuth errors

## File Structure Overview

```
frontend/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── oauth-callback/
│   │   └── forgot-password/
│   ├── dashboard/         # Protected pages
│   ├── AuthWrapper.tsx    # Route protection
│   ├── AppWrappers.tsx    # Auth provider
│   └── layout.tsx         # Root layout
├── lib/
│   ├── auth.ts           # Auth service
│   ├── auth-context.tsx  # Auth context
│   ├── axios.ts          # API client
│   └── api-client.ts     # (deprecated, use axios.ts)
├── components/           # Reusable components
├── hooks/               # Custom hooks
├── types/               # TypeScript types
└── public/              # Static files
```

## Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Complete auth documentation
- [API_EXAMPLES.md](./API_EXAMPLES.md) - curl examples and testing
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Implementation summary
- [.env.example](./.env.example) - Environment variables template

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit
```

## Support

For authentication-related issues:
1. Check [AUTHENTICATION.md](./AUTHENTICATION.md)
2. Check [API_EXAMPLES.md](./API_EXAMPLES.md)
3. Review backend logs
4. Check DevTools Network and Application tabs

---

**Version**: 1.0.0  
**Last Updated**: January 14, 2026  
**Status**: ✅ Ready to Use
