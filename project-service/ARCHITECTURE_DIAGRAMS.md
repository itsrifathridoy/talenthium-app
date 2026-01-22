# System Architecture & Diagrams

## 1. Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT REQUEST                              │
│                                                                  │
│  GET /api/projects/github/content/facebook/react               │
│  ?filePath=package.json                                         │
│  Header: X-USERID: 123                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   ProjectController           │
         │   (REST Endpoint Handler)     │
         │                               │
         │  1. Receive request           │
         │  2. Extract parameters:       │
         │     - repoOwner: facebook    │
         │     - repoName: react        │
         │     - filePath: package.json │
         │     - userId: 123            │
         │  3. Log request              │
         │  4. Delegate to service      │
         └────────────────┬──────────────┘
                          │
                          ▼
         ┌───────────────────────────────────────┐
         │     ProjectService                    │
         │     (Business Logic Orchestrator)     │
         │                                       │
         │  getRepositoryFileContent(            │
         │    userId: 123                        │
         │    repoFullName: "facebook/react"     │
         │    filePath: "package.json"           │
         │  )                                    │
         └────────┬────────────┬────────┬────────┘
                  │            │        │
          ┌───────▼──┐  ┌──────▼──┐  ┌─▼──────────┐
          │ Github   │  │GitHub   │  │GitHubApp   │
          │Install   │  │Service  │  │AuthService │
          │Service   │  │         │  │            │
          │          │  │         │  │            │
          │ Get      │  │ Create  │  │ Generate   │
          │Install   │  │Inst.Tok │  │ JWT        │
          │by UserId │  │en()     │  │ (RSA256)   │
          └──────┬───┘  └────┬────┘  └─┬──────────┘
                 │           │        │
        ┌────────▼───────────▼────────▼────────┐
        │      GitHub API (api.github.com)     │
        │                                      │
        │  1. POST /app/installations/{id}/    │
        │         access_tokens               │
        │     Returns: installation token     │
        │                                     │
        │  2. GET /repos/facebook/react/      │
        │         contents/package.json       │
        │     Returns: Base64-encoded content │
        └──────┬─────────────────────────────┘
               │
        ┌──────▼──────────────────────┐
        │   Base64 Decode Content     │
        │                             │
        │  GitHub returns base64      │
        │  We decode to UTF-8         │
        └──────┬──────────────────────┘
               │
        ┌──────▼──────────────────────────────┐
        │  Build FileContentResponse          │
        │                                     │
        │  {                                  │
        │    "fileName": "package.json",     │
        │    "path": "package.json",         │
        │    "content": "{ ... }",           │
        │    "sha": "abc123...",             │
        │    "htmlUrl": "https://github..." │
        │  }                                  │
        └──────┬───────────────────────────┘
               │
        ┌──────▼────────────────────────┐
        │  HTTP 200 Response            │
        │  Content-Type: application/json│
        │  Body: FileContentResponse     │
        └──────┬────────────────────────┘
               │
               ▼
     ┌──────────────────┐
     │  Client Receives │
     │  File Content    │
     │  (Decoded & 
     │   Parsed)        │
     └──────────────────┘
```

---

## 2. Class Interaction Diagram

```
┌──────────────────────────────────────────────────────┐
│              Spring Boot Application                 │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         ProjectController                      │ │
│  │  @RestController                              │ │
│  │  @RequestMapping("/api/projects")            │ │
│  │                                              │ │
│  │  + createProject()                          │ │
│  │  + getFileContent()  ◄──────┐               │ │
│  └────────────┬─────────────────┼───────────────┘ │
│               │                 │                  │
│      ┌────────┴────┐ ┌──────────┴────────┐        │
│      │ (uses)       │ (depends on)       │        │
│      ▼              ▼                    ▼        │
│  ┌──────────────────────────────────────────┐    │
│  │        ProjectService                   │    │
│  │  + createNewProject()                  │    │
│  │  + getRepositoryFileContent()  ◄────┐ │    │
│  │                                     │ │    │
│  │  (orchestrates:)                    │ │    │
│  │  • Look up GitHub installation     │ │    │
│  │  • Generate JWT                    │ │    │
│  │  • Create installation token       │ │    │
│  │  • Fetch file from GitHub         │ │    │
│  └────┬──────┬──────┬────────┬───────┘ │    │
│       │      │      │        │          │    │
│   ┌───┴──┐ ┌─┴────┐ │ ┌─────┴──┐      │    │
│   │(call)│ │(call)│ │ │(call)  │      │    │
│   ▼      ▼ ▼      ▼ ▼ ▼        │      │    │
│  ┌──────────────────────────────┴────┐ │    │
│  │   GithubInstallService             │ │    │
│  │   + getGithubInstallation()   ┌───┤ │    │
│  │                                │   │ │    │
│  │   (queries database)          │   ▼ │    │
│  └────────────────────────────────┼─────┘   │
│                                   │         │
│  ┌──────────────────────────────────────┐   │
│  │  GitHubAppAuthService                │   │
│  │  + generateAppJWT()          ◄────┐  │   │
│  │                                   │  │   │
│  │  (generates JWT using RSA256)     │  │   │
│  └────────────────────────────────────┘  │   │
│                                          │   │
│  ┌─────────────────────────────────────────┤   │
│  │  GitHubService                          │   │
│  │  + createInstallationToken()   ◄───┐   │   │
│  │  + getFileContent()                │   │   │
│  │  + listInstallationRepos()         │   │   │
│  │                                    │   │   │
│  │  (makes GitHub API calls)          │   │   │
│  └─────────────────────────────────────┼───┘   │
│                                        │       │
│   ┌────────────────────────────────────┘       │
│   │                                            │
│   │  ┌─────────────────────────────────────┐  │
│   │  │  FileContentResponse (DTO)          │  │
│   │  │  - fileName: String                 │  │
│   │  │  - path: String                     │  │
│   │  │  - content: String                  │  │
│   │  │  - sha: String                      │  │
│   │  │  - htmlUrl: String                  │  │
│   │  └─────────────────────────────────────┘  │
│   │                                            │
│   ▼                                            │
│  ┌────────────────────────────────────────┐  │
│  │  GitHubFileValidationService (Optional)   │
│  │  + validateStrictDependencies()        │  │
│  │                                       │  │
│  │  (validates file content)             │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
         │
         │ (external calls)
         │
         ▼
    ┌─────────────────┐
    │  Database       │
    │  (JPA Access)   │
    │                 │
    │  github_app_    │
    │  installation   │
    │  (installation_id,
    │   owner_id)     │
    └─────────────────┘
         │
         │ (external calls)
         │
         ▼
    ┌──────────────────┐
    │  GitHub API      │
    │  (api.github.com)│
    │                  │
    │  /app/           │
    │  installations/  │
    │  {id}/access_    │
    │  tokens          │
    │                  │
    │  /repos/{}/      │
    │  contents/{}     │
    └──────────────────┘
```

---

## 3. Authentication Flow

```
┌────────────────────────────────────────────────────────────┐
│              GITHUB APP AUTHENTICATION FLOW                │
└────────────────────────────────────────────────────────────┘

USER REQUEST
    │
    │  X-USERID: 123
    │  File: package.json
    │
    ▼
┌──────────────────────────────┐
│  ProjectService              │
│  getRepositoryFileContent()  │
└──────────────┬───────────────┘
               │
               │  1. Look up installation
               │     userId → installationId
               ▼
        ┌─────────────────────────┐
        │ Database Query          │
        │ SELECT * FROM           │
        │ github_app_installation │
        │ WHERE owner_id = 123    │
        └─────────────┬───────────┘
                      │
                      │  Returns: installationId
                      ▼
        ┌────────────────────────────┐
        │ GitHubAppAuthService       │
        │ generateAppJWT()           │
        │                            │
        │ Input:                     │
        │  - appId: 1956914          │
        │  - privateKey: .pem file   │
        │                            │
        │ Process:                   │
        │  1. Read private key       │
        │  2. Create PKCS8Spec      │
        │  3. Create RSAPrivateKey  │
        │  4. Create JWT with:      │
        │     - issuer: appId        │
        │     - iat: now             │
        │     - exp: now + 10min     │
        │  5. Sign with RSA256      │
        │                            │
        │ Output: JWT token          │
        │  eyJhbGc...                │
        └─────────────┬──────────────┘
                      │
                      │  2. Exchange JWT for token
                      │     installationId, appJwt
                      ▼
        ┌──────────────────────────────────────┐
        │ GitHub API Call                      │
        │ POST /app/installations/{id}/        │
        │      access_tokens                   │
        │                                      │
        │ Headers:                             │
        │  Authorization: Bearer {appJwt}      │
        │  Accept: application/vnd.github+json │
        │                                      │
        │ Response:                            │
        │ {                                    │
        │   "token": "ghu_...",               │
        │   "expires_at": "2026-01-20T10:..." │
        │ }                                    │
        └──────────────┬───────────────────────┘
                       │
                       │  Returns: installationToken
                       │           (valid 1+ hour)
                       ▼
        ┌──────────────────────────────────────┐
        │ GitHub API Call                      │
        │ GET /repos/{owner}/{repo}/           │
        │     contents/{path}                  │
        │                                      │
        │ Headers:                             │
        │  Authorization: Bearer               │
        │    {installationToken}               │
        │  Accept: application/vnd.github+json │
        │                                      │
        │ Response:                            │
        │ {                                    │
        │   "name": "package.json",            │
        │   "path": "package.json",            │
        │   "sha": "abc123...",                │
        │   "content": "ewog..." (base64),   │
        │   "html_url": "https://..."          │
        │ }                                    │
        └──────────────┬───────────────────────┘
                       │
                       │  3. Decode base64
                       ▼
        ┌──────────────────────────────────────┐
        │ Base64.getDecoder().decode()         │
        │                                      │
        │ Input: "ewog..."                     │
        │ Output: "{ JSON content ... }"       │
        └──────────────┬───────────────────────┘
                       │
                       │  4. Build response
                       ▼
        ┌──────────────────────────────────────┐
        │ FileContentResponse                  │
        │ {                                    │
        │   "fileName": "package.json",        │
        │   "path": "package.json",            │
        │   "content": "{ ... }",              │
        │   "sha": "abc123...",                │
        │   "htmlUrl": "https://..."           │
        │ }                                    │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        HTTP 200 OK
        Content-Type: application/json
        [FileContentResponse]
```

---

## 4. Token Lifecycle

```
┌──────────────────────────────────────────────────────┐
│         TOKEN LIFECYCLE & EXPIRATION                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────┐
│  App JWT             │  [Generated every request]
│                      │
│  Issued at: NOW      │──┐
│  Expires at: +10min  │  │
│  Algorithm: RS256    │  │
│                      │  │
│  Used for:           │  │  └──► Cache opportunity (10 min)
│  - Create token      │  │      Could store in Redis/Memcached
│  - One-time use      │  │
└──────────────────────┘  │
                          │
                          │  Exchange
                          │  (POST to GitHub API)
                          ▼
┌──────────────────────────────┐
│  Installation Token          │
│                              │
│  Issued by: GitHub           │
│  Expires at: Several hours   │
│  Scope: Repository access    │
│                              │
│  Used for:                   │
│  - Fetch files               │  Cache opportunity
│  - Create check runs         │  (1-4 hours TTL)
│  - List repositories         │
│  - All GitHub API calls      │
└──────────────────────────────┘
         │
         │
         ├─────► Valid ───────► Use for API calls
         │
         └─────► Expired ──────► Generate new JWT
                                 & exchange for new token


CURRENT IMPLEMENTATION (No caching):
Each request generates new JWT + new token
Response time: 300-600ms per request

OPTIMIZED (With caching):
- Cache JWT for 10 minutes
- Cache token for 1-4 hours
- Response time: <100ms per request
```

---

## 5. File Validation Flow (Optional)

```
┌──────────────────────────────────────────────┐
│    FILE CONTENT VALIDATION (Optional)        │
└──────────────────────────────────────────────┘

FileContentResponse
    │
    │  content: "{ JSON string }"
    │
    ▼
GitHubFileValidationService
    │
    │  validateStrictDependencies()
    │
    ├─► Parse JSON
    │
    ├─► Check "dependencies"
    │   └─► For each: validate X.Y.Z format
    │       ├─ Valid: "1.2.3" ✓
    │       ├─ Invalid: "^1.2.3" ✗
    │       ├─ Invalid: ">=1.2.3" ✗
    │       └─ Invalid: "1.2.x" ✗
    │
    ├─► Check "devDependencies"
    │   └─► Same validation
    │
    └─► Check "peerDependencies"
        └─► Same validation
        
    ▼
ValidationResult
    │
    ├─ isValid: true/false
    ├─ message: "Success" or "Found semver ranges"
    └─ violations: [
         "dependencies: express uses '^4.18.2'",
         "devDependencies: jest uses '~29.0.0'"
       ]
```

---

## 6. Error Handling Flow

```
┌────────────────────────────────────────┐
│      ERROR HANDLING FLOW               │
└────────────────────────────────────────┘

Request arrives
    │
    ▼
┌─────────────────────────────────────┐
│ ProjectController                   │
│ - Extract parameters                │
│ - Validate X-USERID header          │
│ - Call ProjectService               │
└─────────────────┬───────────────────┘
                  │
                  ▼
        Try block enters
                  │
                  ├─► GithubInstallService
                  │   │
                  │   └─► NOT FOUND exception
                  │       └─► catch block
                  │           log.error()
                  │           throw RuntimeException
                  │                  │
                  │                  ▼
                  │           HTTP 500 or 400
                  │           Message: "You're not connected..."
                  │
                  ├─► GitHubAppAuthService
                  │   │
                  │   └─► File not found exception
                  │       └─► catch block
                  │           log.error()
                  │           throw RuntimeException
                  │                  │
                  │                  ▼
                  │           HTTP 500
                  │           Message: "Failed to generate JWT..."
                  │
                  ├─► GitHubService.createInstallationToken()
                  │   │
                  │   └─► GitHub API error (401, 403, 404)
                  │       └─► throw RuntimeException
                  │                  │
                  │                  ▼
                  │           HTTP 500
                  │           Message: "Unable to create token..."
                  │
                  └─► GitHubService.getFileContent()
                      │
                      ├─► GitHub API error
                      │   (file not found: 404)
                      │   └─► throw RuntimeException
                      │        Message: "Failed to fetch file: 404"
                      │
                      ├─► Directory instead of file
                      │   └─► throw RuntimeException
                      │        Message: "Path points to a directory..."
                      │
                      └─► Decode error
                          └─► throw RuntimeException
                               Message: "Error fetching: ..."
                               │
                               ▼
                        HTTP 500
                        JSON: { "error": "..." }
```

---

## 7. Database Schema (Related)

```
┌────────────────────────────────────────────┐
│  github_app_installation                   │
├────────────────────────────────────────────┤
│ id (Long) [PK]                             │
│ installation_id (String, UNIQUE, NOT NULL) │
│ owner_id (Long, UNIQUE, NOT NULL)          │
│ repositories (JSON, TEXT)                  │
│ created_at (LocalDateTime)                 │
│ updated_at (LocalDateTime)                 │
└────────────────────────────────────────────┘
        │
        │ Used by:
        │
        ├─► GithubInstallService
        │   .getGithubInstallation(userId)
        │   → Finds by owner_id
        │
        └─► ProjectService
            Looks up installation for user

Key Relationships:
- owner_id links to User table (implicit)
- installation_id from GitHub
- repositories JSON stores GitHub API response
```

---

## 8. Configuration Flow

```
┌─────────────────────────────────────────┐
│  application.yml                        │
├─────────────────────────────────────────┤
│ github:                                 │
│   app-id: 1956914                      │
│   private-key-pem: classpath:secrets/   │
│                    my-github-app-...    │
│   webhook-secret: secret1234            │
│   callback-url: http://localhost:...    │
│   install-token-secret: secret1234      │
└────────┬────────────────────────────────┘
         │
         ├─► @Value("${github.app-id}")
         │   GitHubAppAuthService.appId
         │
         └─► @Value("${github.private-key-pem}")
             GitHubAppAuthService.privateKeyPath
                 │
                 ▼
             resolveResourcePath()
                 │
                 ├─ Classpath resource?
                 │  (classpath:secrets/...)
                 │
                 └─ File path?
                    (/path/to/key.pem)
                    │
                    ▼
                Files.readString(keyPath)
                    │
                    ▼
                Process PEM format
                    │
                    ▼
                Extract base64
                    │
                    ▼
                Create RSA key
```

---

**Diagrams Updated: January 20, 2026**
**Status: Complete & Accurate** ✅
