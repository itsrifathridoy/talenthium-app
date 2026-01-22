# GitHub Installation API Flow - Complete Implementation Guide

## Overview

The GitHub App installation flow enables users to connect their GitHub repositories to projects in the Talenthium platform. The flow consists of:

1. **Authorization Request**: User clicks "Connect with GitHub" button
2. **GitHub Redirect**: User is taken to GitHub's OAuth consent screen
3. **Authorization Callback**: GitHub redirects back with installation details
4. **Repository Listing**: User can select from accessible repositories
5. **Project Creation**: Project is created with the selected repository

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GitHubRepoSelector Component                           │   │
│  │  - "Connect with GitHub" button                         │   │
│  │  - Repository dropdown selector                         │   │
│  │  - Real-time repo listing                               │   │
│  └──────────────┬──────────────────────────────────────────┘   │
│                 │                                                │
│                 │ 1. GET /github/authorization-url              │
│                 ├──────────────────────────────────────────────>│
│                 │                                                │
│                 │ 2. Receive authorizationUrl from backend      │
│                 │<──────────────────────────────────────────────┤
│                 │                                                │
│                 │ 3. Redirect to GitHub OAuth                   │
│                 ├──────────────────────> GitHub.com OAuth       │
│                 │                                                │
│                 │ 4. GitHub redirects callback                  │
│                 │<──────────────────────────────────────────────┤
│                 │    /github/callback?installation_id=X         │
│                 │                                                │
└─────────────────────────────────────────────────────────────────┘
                  │
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  InstallController                                      │   │
│  │  - GET /github/authorization-url                        │   │
│  │  - GET /github/callback                                 │   │
│  │  - GET /github/repos                                    │   │
│  │  - GET /github/installation-token                       │   │
│  └────────────────┬────────────────────────────────────────┘   │
│                   │                                              │
│                   │ Uses GitHubService for:                     │
│                   ├─ JWT Token Generation                       │
│                   ├─ Installation Token Creation                │
│                   ├─ Repository List Fetching                   │
│                   │                                              │
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GithubInstallService                                  │   │
│  │  - Save installation mapping (userId ↔ installationId)  │   │
│  │  - Retrieve installation by userId                      │   │
│  │  - Store repository metadata                            │   │
│  └────────────────────────────────────────────────────────┘   │
│                   │                                              │
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Database (PostgreSQL)                                  │   │
│  │  - GithubAppInstallation entity                         │   │
│  │    • userId (FK)                                         │   │
│  │    • installationId (from GitHub)                       │   │
│  │    • repositories (JSONB)                               │   │
│  │    • accessToken (encrypted)                            │   │
│  └────────────────────────────────────────────────────────┘   │
│                   │                                              │
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GitHub API (api.github.com)                            │   │
│  │  - /app/installations/{id}/access_tokens                │   │
│  │  - /installation/repositories                           │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Get Authorization URL
**Endpoint**: `GET /github/authorization-url`

**Headers**:
```
X-USERID: {userId}
```

**Response**:
```json
{
  "authorizationUrl": "https://github.com/apps/{appSlug}/installations/new?state={userId}",
  "message": "Visit this URL to authorize the GitHub App"
}
```

**Purpose**: Generates the GitHub App installation URL that users visit to authorize the app.

### 2. OAuth Callback
**Endpoint**: `GET /github/callback`

**Query Parameters**:
```
installation_id={installation_id}
state={userId}
```

**Purpose**: Handles the redirect from GitHub after user authorizes the app.

**Backend Actions**:
1. Validates installation_id and userId
2. Generates GitHub App JWT token
3. Creates installation access token
4. Fetches list of accessible repositories
5. Saves installation mapping to database
6. Redirects to frontend with status

**Redirect Destinations**:
- Success: `/projects/create?github=connected`
- Error: `/projects/create?error={error_code}`

### 3. Fetch Accessible Repositories
**Endpoint**: `GET /github/repos`

**Headers**:
```
X-USERID: {userId}
```

**Response**:
```json
{
  "isInstalled": true,
  "repositories": [
    {
      "id": 123456,
      "name": "example-repo",
      "fullName": "owner/example-repo",
      "description": "A cool repository",
      "isPrivate": false,
      "language": "TypeScript",
      "starsCount": 42,
      "forksCount": 7,
      "defaultBranch": "main",
      "htmlUrl": "https://github.com/owner/example-repo",
      "owner": {
        "id": 789,
        "login": "owner",
        "avatarUrl": "https://avatars.githubusercontent.com/u/789?v=4",
        "type": "User"
      }
    }
  ],
  "count": 1
}
```

**Purpose**: Fetches fresh list of repositories the user has authorized for the GitHub App.

### 4. Get Installation Token
**Endpoint**: `GET /github/installation-token`

**Headers**:
```
X-USERID: {userId}
```

**Response**:
```json
{
  "token": "{installation_token}"
}
```

**Purpose**: Returns a JWT token that identifies the installation for this user.

## Frontend Implementation

### GitHubRepoSelector Component

Located at: `frontend/components/GitHubRepoSelector.tsx`

**Features**:
- Displays connection status
- "Connect with GitHub" button for authorization
- Repository dropdown selector
- Refresh and disconnect functionality
- Error handling and loading states

**Props**:
```typescript
interface GitHubRepoSelectorProps {
  theme: "light" | "dark";
  onRepositorySelect: (repo: Repository | null) => void;
  selectedRepository: Repository | null;
}
```

**Usage**:
```tsx
<GitHubRepoSelector
  theme={theme}
  onRepositorySelect={handleRepositorySelect}
  selectedRepository={selectedRepository}
/>
```

### Integration in Create Project Page

Located at: `frontend/app/projects/create/page.tsx`

**Flow**:
1. User fills in project details
2. Clicks "Connect with GitHub"
3. Redirected to GitHub consent screen
4. GitHub redirects back to `/github/callback`
5. Backend processes and redirects to `/projects/create?github=connected`
6. Component detects URL param and auto-loads repositories
7. User selects repository
8. Form submission includes selected repository

**Form Submission**:
```typescript
const payload = {
  name: formData.name,
  slogan: formData.slogan || null,
  shortDescription: formData.shortDescription,
  detailedDescription: formData.detailedDescription,
  projectLink: formData.projectLink || null,
  githubRepository: selectedRepository.fullName,
  githubRepositoryId: selectedRepository.id.toString(),
  defaultBranch: selectedRepository.defaultBranch,
};
```

## Backend Implementation

### InstallController Endpoints

Located at: `project-service/src/main/java/tech/talenthium/projectservice/controller/InstallController.java`

**Key Methods**:
- `getAuthorizationUrl()`: Returns GitHub App installation URL
- `postInstallCallback()`: Handles OAuth callback and redirects
- `getAccessibleRepositories()`: Fetches fresh repository list
- `resolvePrivateKey()`: Loads GitHub App private key from configuration

### GitHubService Integration

**Token Generation Flow**:
```
Private Key (PEM) 
    → RSA256 Signature 
    → GitHub App JWT 
    → Installation Token Request 
    → Access Token
    → Repository Listing
```

**Key Methods**:
- `createInstallationToken()`: Creates access token for installation
- `listInstallationRepos()`: Fetches repositories the app can access

### GithubInstallService

**Responsibilities**:
- Persist user-to-installation mappings
- Store repository metadata
- Retrieve installation by user ID
- Cache management

## DTO Definitions

### RepositoryResponse
```java
@Data
public class RepositoryResponse {
    private long id;
    private String name;
    private String fullName;
    private OwnerInfo owner;
    private String htmlUrl;
    private String description;
    private boolean isPrivate;
    private String language;
    private int starsCount;
    private int forksCount;
    private String defaultBranch;
    
    @Data
    public static class OwnerInfo {
        private long id;
        private String login;
        private String avatarUrl;
        private String type;
    }
}
```

### ProjectCreateRequest
```java
@Data
public class ProjectCreateRequest {
    private String name;
    private String slogan;
    private String shortDescription;
    private String detailedDescription;
    private String projectLink;
    private String githubRepository;      // "owner/repo"
    private String githubRepositoryId;    // GitHub repository ID
    private String defaultBranch;         // "main" or "develop"
    private Privacy privacy;              // PUBLIC or PRIVATE
}
```

## Configuration Required

### application.yml
```yaml
github:
  app-id: ${GITHUB_APP_ID}
  app-slug: ${GITHUB_APP_SLUG}
  private-key-pem: ${GITHUB_PRIVATE_KEY_PEM}
```

**Supported Formats**:
- `classpath:secrets/github-app.pem` - File on classpath
- `/absolute/path/to/key.pem` - Absolute file path
- `-----BEGIN RSA PRIVATE KEY-----...` - Inline PEM content

## Security Considerations

1. **Private Key Management**:
   - Never commit private key to repository
   - Store in secure environment variables
   - Use file permissions on production servers

2. **Installation Token Storage**:
   - Tokens are short-lived (1 hour)
   - Generated on-demand for each request
   - Never exposed to frontend

3. **User Isolation**:
   - Each user's installation tracked separately
   - No cross-user repository access
   - Installation tied to specific user ID

4. **API Rate Limiting**:
   - GitHub API has rate limits
   - Consider implementing token caching
   - Implement request deduplication

## Error Handling

### Common Error Scenarios

| Scenario | Error Code | Frontend Message | Resolution |
|----------|-----------|-----------------|-----------|
| No installation found | `missing_installation` | "GitHub App not installed" | User clicks "Connect with GitHub" |
| Invalid private key | `key_error` | "Configuration error" | Check GITHUB_PRIVATE_KEY_PEM env var |
| GitHub API error | `github_api_error` | "Failed to fetch repositories" | Retry or check GitHub API status |
| Authorization revoked | `unauthorized` | "Please reconnect GitHub" | User must re-authorize |
| Network timeout | `timeout` | "Connection timeout" | Retry the operation |

## Testing

### Manual Testing Flow

1. **Setup**:
   - Configure GitHub App in organization
   - Set environment variables (GITHUB_APP_ID, GITHUB_APP_SLUG, GITHUB_PRIVATE_KEY_PEM)
   - Deploy backend and frontend

2. **Test Authorization**:
   ```bash
   # 1. Get authorization URL
   curl -H "X-USERID: 1" http://localhost:8080/github/authorization-url
   
   # 2. Visit the returned URL in browser
   # 3. Authorize the app on GitHub
   # 4. Should be redirected to /projects/create?github=connected
   ```

3. **Test Repository Listing**:
   ```bash
   # After authorization
   curl -H "X-USERID: 1" http://localhost:8080/github/repos
   
   # Should return list of accessible repositories
   ```

4. **Test Project Creation**:
   ```bash
   # Submit form with selected repository
   curl -X POST http://localhost:8080/api/projects/create \
     -H "X-USERID: 1" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "My Project",
       "githubRepository": "owner/repo",
       "shortDescription": "...",
       "detailedDescription": "..."
     }'
   ```

## Future Enhancements

1. **Token Caching**: Cache installation tokens to reduce GitHub API calls
2. **Repository Syncing**: Automatically sync repository data (branches, tags, commits)
3. **Webhook Integration**: Listen for GitHub webhooks to update project status
4. **Multiple Installations**: Support multiple GitHub Apps per user
5. **Repository Searching**: Add search/filter functionality for large repository lists
6. **Automatic Synchronization**: Sync code, issues, and pull requests to project platform

## Troubleshooting

### Issue: "Private key not found" error
**Solution**: 
- Verify GITHUB_PRIVATE_KEY_PEM is set correctly
- Check file permissions if using file path
- Ensure PEM format is correct (-----BEGIN...-----END-----)

### Issue: "Missing installation" after clicking authorize
**Solution**:
- GitHub callback may not have fired
- Check browser redirect URL
- Verify installation_id parameter is being passed
- Check backend logs for errors

### Issue: "No repositories found"
**Solution**:
- GitHub App may not have access to repositories
- Reinstall app with proper repository selection
- Verify organization permissions
- Check GitHub App installation settings

### Issue: Repository list not updating
**Solution**:
- Click "Refresh" button in GitHubRepoSelector
- Check that installation is still active on GitHub
- Verify token hasn't expired
