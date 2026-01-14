# API Contracts & Specifications

## Base URL
```
http://localhost:8088/api/auth
```

## Authentication Endpoints

### 1. Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "username": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Error Response** (401 Unauthorized):
```json
{
  "message": "Invalid username or password"
}
```

**Curl Example**:
```bash
curl -X POST http://localhost:8088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```

---

### 2. Register Developer

**Endpoint**: `POST /api/auth/register/developer`

**Request**:
```json
{
  "username": "johndev",
  "name": "John Developer",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15"
}
```

**Response** (200 OK):
```json
{
  "message": "User registered successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "message": "Email already exists"
}
```

**Field Validation**:
- `username`: Required, 3-30 characters, unique
- `name`: Required, 3-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 6 characters
- `phone`: Optional, 10-15 characters
- `dateOfBirth`: Optional, format YYYY-MM-DD

**Curl Example**:
```bash
curl -X POST http://localhost:8088/api/auth/register/developer \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndev",
    "name": "John Developer",
    "email": "john@example.com",
    "password": "securePassword123",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15"
  }'
```

---

### 3. Register Recruiter

**Endpoint**: `POST /api/auth/register/recruiter`

**Request**:
```json
{
  "username": "janerecruitr",
  "name": "Jane Recruiter",
  "email": "jane@company.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "dateOfBirth": "1985-05-20"
}
```

**Response** (200 OK):
```json
{
  "message": "User registered successfully"
}
```

**Field Validation** (same as Developer):
- `username`: Required, 3-30 characters, unique
- `name`: Required, 3-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 6 characters
- `phone`: Required, 10-15 characters
- `dateOfBirth`: Required, format YYYY-MM-DD

---

### 4. Get Current User

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "userID": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndev",
  "email": "john@example.com",
  "name": "John Developer",
  "phone": "+1234567890",
  "role": "DEVELOPER",
  "dateOfBirth": "1990-01-15",
  "avatar": "https://example.com/avatars/johndev.jpg",
  "isActive": true
}
```

**Error Response** (401 Unauthorized):
```json
{
  "message": "User is not authenticated"
}
```

**Curl Example**:
```bash
curl -X GET http://localhost:8088/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 5. Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

## OAuth2 Endpoints

### Google OAuth2

**Endpoint**: `GET /api/auth/oauth2/authorization/google`

Initiates Google OAuth2 login flow.

**Callback**: `GET /login/oauth2/code/google`

After Google authentication, user is redirected here.

---

### GitHub OAuth2

**Endpoint**: `GET /api/auth/oauth2/authorization/github`

Initiates GitHub OAuth2 login flow.

**Callback**: `GET /login/oauth2/code/github`

After GitHub authentication, user is redirected here.

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login successful, user retrieved |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Invalid credentials, expired token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | User not found |
| 409 | Conflict | Email/username already exists |
| 500 | Server Error | Database error, unexpected error |

---

## Authentication Token Format

**JWT Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**JWT Payload** (Access Token):
```json
{
  "sub": "johndev",
  "email": "john@example.com",
  "role": "DEVELOPER",
  "iat": 1704067200,
  "exp": 1704070800
}
```

---

## CORS Headers

**Allowed Origins**:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3001`

**Allowed Methods**:
- GET, POST, PUT, DELETE, OPTIONS, PATCH

**Allowed Headers**:
- Content-Type
- Authorization
- X-Requested-With
- Accept

**Exposed Headers**:
- Authorization
- Set-Cookie

---

## Cookie Configuration

**Refresh Token Cookie**:
```
Name: refresh_token
Value: <refresh_token_jwt>
HttpOnly: true
Secure: true (production only)
SameSite: None
Path: /
Max-Age: 9999999 seconds (~115 days)
```

---

## Error Codes & Messages

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| INVALID_CREDENTIALS | Invalid username or password | Wrong email/password | Check credentials |
| USER_NOT_FOUND | User not found | Email not registered | Register account |
| EMAIL_EXISTS | Email already exists | Email already used | Use different email |
| USERNAME_EXISTS | Username already exists | Username taken | Choose different username |
| INVALID_EMAIL | Email must be valid | Wrong format | Use valid email |
| PASSWORD_TOO_SHORT | Password must be at least 6 characters | Short password | Use 6+ char password |
| VALIDATION_FAILED | Validation failed | Invalid input | Check all fields |
| UNAUTHORIZED | User is not authenticated | No token/expired | Login first |
| TOKEN_EXPIRED | Token has expired | Expired token | Refresh token or login again |

---

## Request/Response Examples

### Frontend Login Example
```javascript
const response = await fetch('http://localhost:8088/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
// {
//   "accessToken": "eyJ...",
//   "refreshToken": "eyJ...",
//   "expiresIn": 3600
// }
```

### Using Access Token
```javascript
const response = await fetch('http://localhost:8088/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  credentials: 'include'
});

const userData = await response.json();
console.log(userData);
```

---

## Rate Limiting (Future Implementation)

Currently not implemented, but recommended for production:

- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Token Refresh**: 10 attempts per minute per user

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Never expose access tokens** in URLs
3. **Store tokens securely** (localStorage for web, secure storage for native)
4. **Include token in Authorization header** with Bearer scheme
5. **Handle token expiration** gracefully
6. **Validate on both client and server**
7. **Use CORS properly** to restrict origins
8. **Log security events** for audit trails

---

## Testing with Postman

### Import Postman Collection

1. Create new collection "Talenthium Auth"
2. Add requests:
   - Login
   - Register Developer
   - Register Recruiter
   - Get Current User
   - Refresh Token

3. Set Postman variables:
   - `{{base_url}}` = `http://localhost:8088`
   - `{{access_token}}` = (set after login)
   - `{{refresh_token}}` = (set after login)

### Pre-request Script (for Authorization)
```javascript
if (pm.variables.get("access_token")) {
  pm.request.headers.add({
    key: "Authorization",
    value: "Bearer " + pm.variables.get("access_token")
  });
}
```

---

## Changelog

### v1.0.0 (Current)
- ✅ Login endpoint
- ✅ Register Developer endpoint
- ✅ Register Recruiter endpoint
- ✅ Get Current User endpoint
- ✅ JWT Token generation
- ✅ Token Refresh endpoint
- ✅ CORS configuration
- ✅ OAuth2 Integration (Google, GitHub)

### v1.1.0 (Planned)
- ⏳ Email verification
- ⏳ OTP verification
- ⏳ Password reset flow
- ⏳ Rate limiting
- ⏳ Audit logging
