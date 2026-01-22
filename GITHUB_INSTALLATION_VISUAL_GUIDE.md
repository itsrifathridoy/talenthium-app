# GitHub Installation API Flow - Visual Guide

## User Journey

```
START: User on Create Project Page
   │
   ├─ Fills form with project details
   │
   └─ Clicks "Connect with GitHub"
      │
      ├─ Frontend: GET /github/authorization-url
      │ (with X-USERID header)
      │
      └─ Backend returns authorizationUrl
         │
         └─ Frontend redirects to GitHub.com
            │
            ├─ User sees: "Authorize {AppName}"
            ├─ User selects: Which repos to allow
            └─ User clicks: "Authorize application"
               │
               └─ GitHub redirects to: /github/callback
                  (with installation_id and state=userId)
                  │
                  ├─ Backend validates parameters
                  ├─ Backend generates GitHub JWT token
                  ├─ Backend creates installation token
                  ├─ Backend fetches accessible repos
                  ├─ Backend saves to database
                  └─ Backend redirects to: /projects/create?github=connected
                     │
                     └─ Frontend detects URL param
                        │
                        ├─ Clears URL params (history.replaceState)
                        ├─ Calls GET /github/repos
                        │ (with X-USERID header)
                        │
                        └─ Shows repo dropdown with list
                           │
                           └─ User selects a repository
                              │
                              └─ Form updated with:
                                 - githubRepository: "owner/repo"
                                 - githubRepositoryId: "123456"
                                 - defaultBranch: "main"
                                 │
                                 └─ User clicks "Create Project"
                                    │
                                    ├─ Frontend validates form
                                    ├─ Frontend POST /api/projects/create
                                    │ (with X-USERID header)
                                    │
                                    └─ Backend creates project
                                       │
                                       └─ Success: Redirect to /projects/{id}
                                          │
                                          END
```

## Component Structure

```
CreateProjectPage (app/projects/create/page.tsx)
├── Form Fields
│   ├── Project Name (input)
│   ├── Slogan (input)
│   ├── Short Description (textarea)
│   ├── Detailed Description (textarea)
│   ├── Project Link (input)
│   │
│   └── GitHub Repository (GitHubRepoSelector)
│       │
│       └── GitHubRepoSelector Component
│           ├── Connection Status Display
│           │   ├── If NOT connected:
│           │   │   └── "Connect with GitHub" Button
│           │   │       ├── On Click:
│           │   │       ├── Fetch authorization URL
│           │   │       └── Redirect to GitHub
│           │   │
│           │   └── If connected:
│           │       ├── Status: "Connected to GitHub"
│           │       ├── Repository Dropdown
│           │       │   ├── Shows repo.fullName
│           │       │   ├── Shows repo.description (50 chars)
│           │       │   └── On Select: Update parent state
│           │       │
│           │       ├── Refresh Button
│           │       │   └── On Click: Reload repo list
│           │       │
│           │       └── Disconnect Button
│           │           └── On Click: Clear installation
│           │
│           ├── Error Display
│           │   └── Shows error messages
│           │
│           └── Loading States
│               ├── Authorization loading
│               ├── Repo list loading
│               └── Refresh loading
│
├── Form Actions
│   └── Submit Button ("Create Project")
│       ├── On Click:
│       ├── Validate all fields
│       ├── POST /api/projects/create
│       └── Show success/error
│
└── Status Messages
    ├── Success: "Project created! Redirecting..."
    └── Error: Display error message
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND STATE                              │
│  const [selectedRepository, setSelectedRepository] = useState(null)   │
│  const [isInstalled, setIsInstalled] = useState(false)               │
│  const [repositories, setRepositories] = useState([])                │
│  const [formData, setFormData] = useState({...})                     │
└──────────────────────────────────────────────────────────────────────┘
                            ▲                    ▲
                            │                    │
              POST /api/projects/create      GET /github/repos
              with selectedRepository         (when github=connected)
                            │                    │
                            │                    │
         ┌──────────────────▼────────────────────▼──────────────────┐
         │                  BACKEND API                             │
         │                                                          │
         │  ┌────────────────────────────────────────────────────┐ │
         │  │ InstallController                                  │ │
         │  │                                                    │ │
         │  │ GET /github/authorization-url                     │ │
         │  │   → Return GitHub OAuth URL                       │ │
         │  │                                                    │ │
         │  │ GET /github/callback                              │ │
         │  │   ← Receive installation_id from GitHub           │ │
         │  │   → Save to database                              │ │
         │  │   → Fetch repos                                   │ │
         │  │   → Redirect to frontend                          │ │
         │  │                                                    │ │
         │  │ GET /github/repos                                 │ │
         │  │   → Query database for user's installation        │ │
         │  │   → Create fresh access token                     │ │
         │  │   → Fetch current repos from GitHub               │ │
         │  │   → Format as RepositoryResponse[]                │ │
         │  │   → Return to frontend                            │ │
         │  └────────────────────────────────────────────────────┘ │
         │                        │                                 │
         │                        ▼                                 │
         │  ┌────────────────────────────────────────────────────┐ │
         │  │ ProjectController                                  │ │
         │  │                                                    │ │
         │  │ POST /api/projects/create                          │ │
         │  │   ← Receive ProjectCreateRequest                   │ │
         │  │      (includes githubRepository, etc.)             │ │
         │  │   → Validate input                                 │ │
         │  │   → Create Project entity                          │ │
         │  │   → Save to database                               │ │
         │  │   → Return Project with ID                         │ │
         │  └────────────────────────────────────────────────────┘ │
         │                        │                                 │
         │                        ▼                                 │
         │  ┌────────────────────────────────────────────────────┐ │
         │  │ Database (PostgreSQL)                              │ │
         │  │                                                    │ │
         │  │ ┌─ GithubAppInstallation                          │ │
         │  │ │  id, userId, installationId                     │ │
         │  │ │  repositories (JSONB), createdAt, updatedAt     │ │
         │  │ │                                                 │ │
         │  │ └─ Project                                        │ │
         │  │    id, name, slogan, shortDescription, ...        │ │
         │  │    gitLink (owner/repo), ownerId, ...             │ │
         │  └────────────────────────────────────────────────────┘ │
         │                        │                                 │
         │                        ▼                                 │
         │  ┌────────────────────────────────────────────────────┐ │
         │  │ GitHub API (api.github.com)                        │ │
         │  │                                                    │ │
         │  │ POST /app/installations/{id}/access_tokens        │ │
         │  │   ← Authenticated with GitHub App JWT             │ │
         │  │   → Returns short-lived access token              │ │
         │  │                                                    │ │
         │  │ GET /installation/repositories                     │ │
         │  │   ← Authenticated with access token               │ │
         │  │   → Returns list of accessible repos              │ │
         │  └────────────────────────────────────────────────────┘ │
         └────────────────────────────────────────────────────────┘
```

## State Transitions

```
NOT_INSTALLED
    │
    ├─ User clicks "Connect with GitHub"
    │  ↓
AUTHORIZING
    │
    ├─ GitHub redirects with installation_id
    │  ↓
INSTALLING
    │
    ├─ Backend processes callback, saves installation
    │  ├─ Frontend detects ?github=connected
    │  ├─ Frontend fetches repos
    │  ↓
INSTALLED
    │
    ├─ Repos loaded, dropdown shows list
    │  ├─ User selects repo
    │  ↓
REPO_SELECTED
    │
    ├─ Form fully valid
    │  ├─ User clicks "Create Project"
    │  ├─ Submit form
    │  ↓
SUBMITTING
    │
    ├─ Project created successfully
    │  ↓
SUCCESS → Redirect to /projects/{id}


ERROR STATES:

NOT_INSTALLED
    ├─ Authorization fails → ERROR_AUTH (show error message)
    │
INSTALLING
    ├─ Callback processing fails → ERROR_CALLBACK (redirect with ?error=)
    │
INSTALLED
    ├─ Repo list fetch fails → ERROR_REPOS (show refresh button)
    │
SUBMITTING
    ├─ Project creation fails → ERROR_SUBMIT (show error, allow retry)
```

## Key Sequences

### Authorization Sequence
```
1. GET /github/authorization-url?X-USERID=1
   Response: {
     "authorizationUrl": "https://github.com/apps/myapp/installations/new?state=1"
   }

2. Frontend redirects to authorizationUrl
   User authorizes on GitHub

3. GitHub redirects to /github/callback?installation_id=12345&state=1

4. Backend:
   - Validates installation_id=12345, state=1
   - Generates JWT token using GitHub App private key
   - POST to GitHub: /app/installations/12345/access_tokens (with JWT)
   - Receives: {token: "ghu_abc123..."}
   - GET from GitHub: /installation/repositories (with token)
   - Receives: {repositories: [{id:..., name:..., owner:..., ...}]}
   - INSERT into GithubAppInstallation (userId=1, installationId=12345, repos=JSON)
   - Redirect to: /projects/create?github=connected

5. Frontend:
   - Detects ?github=connected in URL
   - Calls GET /github/repos?X-USERID=1
   - Receives: {isInstalled: true, repositories: [...], count: N}
   - Updates state, shows repo dropdown
```

### Selection Sequence
```
1. User clicks repo dropdown
   Shows list of repositories with metadata

2. User clicks specific repo
   onRepositorySelect(repo) called
   Parent component updates selectedRepository state

3. User sees in dropdown: selected repo highlighted
   User sees in form: githubRepository, defaultBranch populated

4. Form validation includes repository check
   If no repo selected: form submit disabled or shows error

5. User clicks "Create Project"
   POST /api/projects/create with:
   {
     name: "...",
     githubRepository: "owner/repo",  ← from selected repo
     githubRepositoryId: "12345",     ← from selected repo
     defaultBranch: "main",           ← from selected repo
     ...other fields...
   }

6. Backend creates Project with gitLink = githubRepository
   Response: {id: 99, name: "...", gitLink: "owner/repo", ...}

7. Frontend redirects to /projects/99
```

## Error Handling Flow

```
User Action → API Call → Response

┌─ Success (2xx)
│  └─ Process data, update UI, continue flow
│
├─ Client Error (4xx)
│  ├─ Missing X-USERID header
│  │  └─ Show: "Please log in again"
│  │
│  ├─ Validation failed
│  │  └─ Show: "Please fill all required fields"
│  │
│  └─ Not found (no installation)
│     └─ Show: "GitHub App not installed"
│
└─ Server Error (5xx) or Network Error
   ├─ Show: "Connection error, please try again"
   └─ Provide: Retry button
```

## Configuration Diagram

```
┌────────────────────────────────────────────────────────────┐
│                 Environment Variables                      │
│                                                            │
│  GITHUB_APP_ID="123456"                                   │
│  GITHUB_APP_SLUG="my-app-slug"                            │
│  GITHUB_PRIVATE_KEY_PEM="-----BEGIN RSA PRIVATE KEY..."  │
│                                                            │
└────────────────────────────────────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────────┐
│                application.yml                             │
│                                                            │
│  github:                                                   │
│    app-id: ${GITHUB_APP_ID}                               │
│    app-slug: ${GITHUB_APP_SLUG}                           │
│    private-key-pem: ${GITHUB_PRIVATE_KEY_PEM}             │
│                                                            │
└────────────────────────────────────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────────┐
│            InstallController                               │
│                                                            │
│  @Value("${github.app-id}")                               │
│  @Value("${github.app-slug}")                             │
│  @Value("${github.private-key-pem}")                      │
│                                                            │
│  - Loads values at startup                                │
│  - Uses for JWT generation                                │
│  - Passes to GitHubService                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Performance Considerations

```
API Call                Time Estimate    Caching
─────────────────────────────────────────────────
GET /authorization-url  ~10ms            Not needed
GET /callback           ~500ms           Not cached
  ├─ JWT generation       ~50ms
  ├─ GitHub token creation ~200ms
  └─ Repo listing         ~250ms

GET /github/repos       ~300ms            Optional (cache 1hr)
  ├─ JWT generation       ~50ms
  ├─ GitHub token creation ~100ms
  └─ Repo listing         ~150ms

POST /api/projects/create ~100ms          Not needed
  ├─ Validation           ~20ms
  ├─ Database insert      ~50ms
  └─ Response             ~30ms
```

## Success Criteria

✅ User can click "Connect with GitHub"  
✅ GitHub App authorization dialog appears  
✅ User can authorize the app  
✅ Application is redirected back  
✅ Repository list loads automatically  
✅ User can select a repository  
✅ Selected repo info displays in form  
✅ Form can be submitted successfully  
✅ Project is created with GitHub repo info  
✅ User is redirected to new project page  

## Links & References

- [Complete Flow Documentation](./GITHUB_INSTALLATION_FLOW.md)
- [Quick API Reference](./GITHUB_INSTALLATION_QUICK_REFERENCE.md)
- [Implementation Complete Document](./GITHUB_INSTALLATION_IMPLEMENTATION_COMPLETE.md)
