# GitHub Installation API - Quick Reference

## Quick Start

### 1. Backend Configuration
Set environment variables:
```bash
export GITHUB_APP_ID=12345
export GITHUB_APP_SLUG=my-app-slug
export GITHUB_PRIVATE_KEY_PEM='-----BEGIN RSA PRIVATE KEY-----
...(private key content)...
-----END RSA PRIVATE KEY-----'
```

### 2. Frontend Usage
```tsx
import { GitHubRepoSelector } from '@/components/GitHubRepoSelector';

export default function CreateProject() {
  const [selectedRepo, setSelectedRepo] = useState(null);

  return (
    <GitHubRepoSelector
      theme="light"
      onRepositorySelect={setSelectedRepo}
      selectedRepository={selectedRepo}
    />
  );
}
```

### 3. API Flow
```
User Clicks "Connect" 
  → GET /github/authorization-url (backend)
  → Redirect to GitHub OAuth
  → GitHub redirects to GET /github/callback (backend)
  → Backend processes callback
  → Redirect to /projects/create?github=connected (frontend)
  → Frontend auto-loads repos via GET /github/repos
  → User selects repo
  → Form submit to POST /api/projects/create
```

## API Endpoints

| Method | Endpoint | Headers | Purpose |
|--------|----------|---------|---------|
| GET | `/github/authorization-url` | X-USERID | Get GitHub authorization URL |
| GET | `/github/callback` | - | Handle GitHub OAuth callback |
| GET | `/github/repos` | X-USERID | Fetch accessible repositories |
| GET | `/github/installation-token` | X-USERID | Get JWT installation token |

## Key Classes

### Frontend Components
- **GitHubRepoSelector.tsx**: UI component for connecting and selecting repos

### Backend Services
- **InstallController**: Handles authorization and callbacks
- **GitHubService**: GitHub API communication
- **GithubInstallService**: Installation data persistence

### DTOs
- **RepositoryResponse**: Repository information returned to frontend
- **ProjectCreateRequest**: Form data for creating projects with repos

## Common Patterns

### Check if GitHub is connected
```typescript
const response = await fetch("/github/repos", {
  headers: { "X-USERID": userId }
});
const data = await response.json();
if (data.isInstalled) {
  // GitHub App is installed
  const repos = data.repositories;
}
```

### Create project with GitHub repo
```typescript
const response = await fetch("/api/projects/create", {
  method: "POST",
  headers: {
    "X-USERID": userId,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "My Project",
    shortDescription: "...",
    detailedDescription: "...",
    githubRepository: "owner/repo",
    githubRepositoryId: "123456",
    defaultBranch: "main"
  })
});
```

## Error Handling

```typescript
try {
  const response = await fetch("/github/repos", {
    headers: { "X-USERID": userId }
  });
  const data = await response.json();
  
  if (!data.isInstalled) {
    // Show "Connect with GitHub" button
  } else {
    // Show repository list
  }
} catch (error) {
  // Handle network error
  console.error("Failed to fetch repositories:", error);
}
```

## Testing Commands

```bash
# Get authorization URL
curl -H "X-USERID: 1" http://localhost:8080/github/authorization-url

# Fetch repositories
curl -H "X-USERID: 1" http://localhost:8080/github/repos

# Create project with repository
curl -X POST http://localhost:8080/api/projects/create \
  -H "X-USERID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "shortDescription": "Test project",
    "detailedDescription": "Full description",
    "githubRepository": "owner/repo",
    "githubRepositoryId": "123",
    "defaultBranch": "main"
  }'
```

## Database Schema

```sql
CREATE TABLE github_app_installation (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  installation_id VARCHAR(255) NOT NULL,
  repositories JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Files Modified/Created

| File | Type | Changes |
|------|------|---------|
| InstallController.java | Modified | Added authorization and callback endpoints |
| GitHubRepoSelector.tsx | Created | Full component for repo selection |
| RepositoryResponse.java | Created | New DTO for repository data |
| CreateProjectPage.tsx | Modified | Integrated GitHubRepoSelector |
| ProjectCreateRequest.java | Modified | Added GitHub repository fields |
| GITHUB_INSTALLATION_FLOW.md | Created | Complete implementation guide |

## Key Features

✅ GitHub App OAuth 2.0 flow
✅ Automatic repository discovery
✅ Real-time repo listing with metadata
✅ Error handling and recovery
✅ Connection status indication
✅ Repository refresh functionality
✅ Disconnect/reconnect support
✅ Responsive UI with theme support

## Next Steps

1. Test the authorization flow manually
2. Verify repository listing works
3. Confirm project creation with repos
4. Implement repository file browsing (optional)
5. Add webhook processing for auto-sync (optional)
