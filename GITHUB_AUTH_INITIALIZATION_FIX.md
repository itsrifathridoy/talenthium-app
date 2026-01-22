# GitHub Installation - Auth Initialization Fix

## Problem

The frontend was showing: **"User information not available. Please refresh the page."**

### Root Cause

The components were trying to use the user ID before the auth context finished initializing. The `useAuth()` hook provides three states:
- `user` - The authenticated user object (null while loading)
- `isAuthenticated` - Whether user is logged in
- `isInitialized` - Whether auth has finished checking credentials

The components were checking only `isAuthenticated` and `user`, but not waiting for `isInitialized` to be true.

## Solution

Updated both components to:
1. Destructure `isInitialized` from `useAuth()`
2. Wait for `isInitialized === true` before accessing user data
3. Provide better error messages while auth is initializing
4. Disable form interactions during initialization

### Changes Made

#### 1. GitHubRepoSelector Component

**Added to useEffect:**
```typescript
const { user, isAuthenticated, isInitialized } = useAuth();

useEffect(() => {
  // Wait for auth to initialize before checking user
  if (!isInitialized) {
    return;  // Exit early, try again when initialized
  }

  if (isAuthenticated && user && user.id) {
    checkInstallationStatus(user.id.toString());
  } else if (isInitialized && !isAuthenticated) {
    setError("Please log in to connect GitHub");
  }
}, [isAuthenticated, user, isInitialized]);
```

**Updated handleAuthorizeGitHub:**
```typescript
if (!isInitialized) {
  setError("Authentication system is still initializing. Please wait...");
  return;
}
```

#### 2. CreateProjectPage Component

**Added isInitialized check:**
```typescript
const { user, isAuthenticated, isInitialized } = useAuth();

// In handleSubmit:
if (!isInitialized) {
  setError("Authentication system is initializing. Please wait...");
  return;
}
```

**Added loading state UI:**
```tsx
{!isInitialized && (
  <div className="p-4 rounded-lg border ...">
    Loading authentication... Please wait.
  </div>
)}
```

**Disabled form while loading:**
```tsx
<form ... disabled={!isInitialized}>
  <div className={!isInitialized ? "opacity-50 pointer-events-none" : ""}>
    {/* form fields */}
  </div>
</form>
```

## How It Works Now

1. **Page Loads**: Component renders but auth is not initialized yet
2. **Auth Initializes**: Auth context makes `GET /auth/me` request to fetch current user
3. **isInitialized Becomes True**: useEffect runs again with user data available
4. **Form Enabled**: User can now interact with GitHub selector and form

## Flow Diagram

```
Page Load
  ↓
isInitialized = false (auth checking credentials)
  ↓
useEffect returns early (waits for initialization)
  ↓
Auth context fetches GET /auth/me
  ↓
User data received, isInitialized = true
  ↓
useEffect runs again with user.id available
  ↓
checkInstallationStatus(user.id.toString()) called
  ↓
GitHub repos loaded successfully
  ↓
Form enabled, user can interact
```

## Testing

1. **Navigate to Create Project Page**
   - Should see "Loading authentication..." message briefly
   - Form should be disabled (greyed out) during loading

2. **After Auth Initializes**
   - Message disappears
   - Form becomes enabled
   - GitHubRepoSelector loads without error
   - Can click "Connect with GitHub" button

3. **If Not Logged In**
   - After initialization completes
   - See "Please log in to connect GitHub" message
   - Cannot use GitHub selector until logged in

## Error Messages

| Scenario | Message |
|----------|---------|
| Auth still initializing | "Authentication system is still initializing. Please wait..." |
| User not logged in | "Authentication required. Please log in first." |
| Form submission while auth loading | "Authentication system is initializing. Please wait..." |
| Auth failed to load user | "User not authenticated. Please log in again." |

## Key Pattern

Always check three things before using `user` data in a component:

```typescript
const { user, isAuthenticated, isInitialized } = useAuth();

// Safe pattern:
if (!isInitialized) {
  return <div>Loading...</div>;
}

if (!isAuthenticated || !user?.id) {
  return <div>Please log in</div>;
}

// Now safe to use user.id
```

## Files Modified

- `frontend/components/GitHubRepoSelector.tsx` - Added isInitialized checks
- `frontend/app/projects/create/page.tsx` - Added isInitialized checks and UI feedback

## No Backend Changes Required

All backend APIs remain unchanged. The fix is purely frontend to ensure we wait for auth initialization before making API calls that require the user ID.
