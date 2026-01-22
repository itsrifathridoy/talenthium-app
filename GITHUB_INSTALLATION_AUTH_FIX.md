# GitHub Installation - Frontend Auth Fix

## Problem

The frontend was showing error: **"User ID not found. Please log in again."**

### Root Cause

The authentication system uses **httpOnly cookies** set by the backend for token storage, NOT localStorage. However, the GitHubRepoSelector and CreateProjectPage components were trying to get userId from localStorage:

```typescript
// ❌ WRONG - localStorage doesn't have userId
const storedUserId = localStorage.getItem("userId");
```

## Solution

Updated components to use the **auth context hook** (`useAuth()`) which provides the authenticated user object with the ID.

### Changes Made

#### 1. GitHubRepoSelector Component
**Before:**
```typescript
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) {
    setUserId(storedUserId);
    checkInstallationStatus(storedUserId);
  }
}, []);
```

**After:**
```typescript
import { useAuth } from "@/lib/auth-context";

const { user, isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated && user && user.id) {
    checkInstallationStatus(user.id.toString());
  } else if (!isAuthenticated) {
    setError("Please log in to connect GitHub");
  }
}, [isAuthenticated, user]);
```

#### 2. CreateProjectPage Component
**Before:**
```typescript
const userId = localStorage.getItem("userId");
if (!userId) {
  setError("User ID not found. Please log in again.");
  return;
}

const response = await fetch("/api/projects/create", {
  headers: {
    "X-USERID": userId,
  },
});
```

**After:**
```typescript
import { useAuth } from "@/lib/auth-context";

const { user, isAuthenticated } = useAuth();

if (!isAuthenticated || !user || !user.id) {
  setError("User not authenticated. Please log in again.");
  return;
}

const response = await fetch("/api/projects/create", {
  headers: {
    "X-USERID": user.id.toString(),
  },
});
```

## How It Works

1. **Authentication System** (Already implemented)
   - Backend sets `access_token` and `refresh_token` httpOnly cookies on login
   - No userId stored in localStorage

2. **AuthContext Hook** (In `lib/auth-context.tsx`)
   - Fetches current user on app initialization via `GET /auth/me` endpoint
   - Provides `user` object with `id` property
   - Available via `useAuth()` hook in any component

3. **GitHub Component Usage**
   - Calls `useAuth()` hook to get authenticated user
   - Extracts `user.id` for API headers
   - No localStorage access needed

## Benefits

✅ **Security**: No sensitive user data stored in localStorage  
✅ **Consistency**: Uses same auth mechanism as rest of app  
✅ **Reliability**: User data automatically refreshed on app load  
✅ **Simplicity**: No manual state management needed  

## Testing the Fix

1. **Login to application**
   - Go to `/auth/login`
   - Enter credentials or use Google OAuth
   - Should be redirected to dashboard

2. **Navigate to Create Project**
   - Go to `/projects/create`
   - GitHubRepoSelector should load without error
   - "Connect with GitHub" button should be clickable

3. **Authorize GitHub App**
   - Click "Connect with GitHub"
   - Should redirect to GitHub authorization page
   - After authorization, should return to create project page
   - Repository list should load automatically

4. **Create Project**
   - Select a repository from dropdown
   - Fill in project details
   - Click "Create Project"
   - Project should be created with GitHub repository info

## Key Takeaway

Always use the `useAuth()` hook to access user information instead of relying on localStorage. The auth system provides a centralized, secure way to manage user data:

```typescript
import { useAuth } from "@/lib/auth-context";

export default function MyComponent() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.name}</div>;
}
```

## Related Files Modified

- `frontend/components/GitHubRepoSelector.tsx` - Uses auth context instead of localStorage
- `frontend/app/projects/create/page.tsx` - Uses auth context instead of localStorage

## No Backend Changes Required

The backend APIs remain unchanged:
- `GET /github/authorization-url` - Still requires X-USERID header
- `GET /github/callback` - Still receives state parameter
- `GET /github/repos` - Still requires X-USERID header
- `POST /api/projects/create` - Still requires X-USERID header

The header is now sourced from `user.id` via auth context instead of localStorage.
