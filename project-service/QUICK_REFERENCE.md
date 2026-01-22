# Quick Reference - GitHub File Content Fetching

## Files Created/Modified

| File | Type | Purpose |
|------|------|---------|
| `GitHubAppAuthService.java` | ✨ NEW | Generates JWT tokens for GitHub App authentication |
| `GitHubService.java` | 🔄 MODIFIED | Added `getFileContent()` method |
| `ProjectService.java` | 🔄 MODIFIED | Added `getRepositoryFileContent()` orchestration method |
| `ProjectController.java` | 🔄 MODIFIED | Added `/api/projects/github/content/{owner}/{repo}` endpoint |
| `FileContentResponse.java` | ✨ NEW | DTO for file content response |
| `GitHubFileValidationService.java` | ✨ NEW | Service for validating file content (e.g., package.json) |

## Quick Start

### 1. The Endpoint
```
GET /api/projects/github/content/{repoOwner}/{repoName}?filePath=path/to/file
```

### 2. Required Header
```
X-USERID: <user_id>
```

### 3. Example Request
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/owner/repo?filePath=package.json" \
  -H "X-USERID: 123"
```

### 4. Example Response
```json
{
  "fileName": "package.json",
  "path": "package.json",
  "content": "{ ... file content ... }",
  "sha": "abc123...",
  "htmlUrl": "https://github.com/owner/repo/blob/main/package.json"
}
```

---

## How It Works (In 5 Steps)

1. **Request arrives** → Controller validates userId and parameters
2. **Get installation** → Service finds user's GitHub App installation from DB
3. **Create JWT** → Generate app JWT using private key (valid 10 mins)
4. **Get token** → Exchange JWT for installation-specific access token
5. **Fetch file** → Call GitHub API to get file, decode base64 content

---

## Class Diagram

```
┌──────────────────────┐
│   ProjectController  │
│  [REST Endpoints]    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   ProjectService     │
│  [Orchestration]     │
└──────────┬───────────┘
           │
    ┌──────┴─────────┬────────────────────┐
    │                │                    │
    ▼                ▼                    ▼
┌─────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ GitHub      │  │ GithubInstall    │  │ GitHubAppAuth        │
│ Service     │  │ Service          │  │ Service              │
└─────────────┘  └──────────────────┘  └──────────────────────┘
    │                │                    │
    └────────────────┴────────────────────┘
            │
            ▼
    ┌───────────────┐
    │  GitHub API   │
    └───────────────┘
```

---

## Key Methods

### GitHubAppAuthService
```java
public String generateAppJWT() throws Exception
// Returns: JWT token signed with app's private key
// Used for: Authenticating as the GitHub App
```

### GitHubService
```java
public FileContentResponse getFileContent(
    String repoFullName,      // "owner/repo"
    String filePath,          // "path/to/file.json"
    String installationToken  // Token from createInstallationToken()
)
// Returns: FileContentResponse with decoded content
```

### ProjectService
```java
public FileContentResponse getRepositoryFileContent(
    Long userId,           // User who installed the app
    String repoFullName,   // "owner/repo"
    String filePath        // "path/to/file.json"
)
// Returns: FileContentResponse
// Throws: RuntimeException with error message
```

### GitHubFileValidationService
```java
public ValidationResult validateStrictDependencies(FileContentResponse fileContent)
// Validates package.json dependencies use strict versions (X.Y.Z)
// Returns: ValidationResult with isValid flag and list of violations
```

---

## Configuration

**File:** `application.yml`

```yaml
github:
  app-id: 1956914
  app-slug: talenthium
  private-key-pem: classpath:secrets/my-github-app-private-key-pkcs8.pem
  webhook-secret: secret1234
  callback-url: http://localhost:8088/project-service/github/callback
  install-token-secret: secret1234
```

**Ensure:**
- ✅ `github.app-id` matches your GitHub App ID
- ✅ `github.private-key-pem` points to your private key file
- ✅ User has installed the app via the install endpoint

---

## Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "You're not connected to any github account" | User hasn't installed app | Install GitHub App first |
| "Unable to create installation token" | Bad JWT or invalid installation ID | Check app ID and private key path |
| "Failed to fetch file: 404" | File doesn't exist or no access | Verify file path and install permissions |
| "classpath resource cannot be found" | .pem file not in classpath | Move .pem to `src/main/resources/secrets/` |
| "Path points to a directory" | Trying to fetch a folder | Use file path, not directory |

---

## Testing Checklist

- [ ] User has GitHub App installed
- [ ] GitHub installation ID is saved in database
- [ ] Private key file (.pem) is in correct location
- [ ] `X-USERID` header matches a user with GitHub installation
- [ ] File path is correct and accessible to the installation
- [ ] No typos in repo owner/name

---

## Performance Tips

1. **Cache Installation Tokens**
   - They expire after several hours
   - Reduce JWT generation overhead

2. **Batch File Requests**
   - Fetch multiple files in parallel
   - Consider rate limits

3. **Cache File Content**
   - GitHub files don't change frequently
   - Implement TTL-based caching

4. **Use Streaming for Large Files**
   - Don't load everything into memory

---

## Security Notes

✅ **Private Key Protection**
- Never commit to git
- Use .gitignore for secrets/
- Use environment variables in production

✅ **User Isolation**
- Each user can only access their installations
- X-USERID header is required

✅ **Token Expiration**
- JWTs expire after 10 minutes
- Installation tokens expire after several hours
- Regenerated per request

---

## Next Steps from Blog Example

The blog shows:

1. ✅ **Install GitHub App** (you've done this)
2. ✅ **Fetch file content** (just implemented)
3. ⏳ **Validate content** (use GitHubFileValidationService)
4. ⏳ **Create check runs** (POST to `/check-runs` endpoint)
5. ⏳ **Process webhooks** (in WebhookController)

---

## Debugging

### Enable Debug Logging
```yaml
logging:
  level:
    tech.talenthium.projectservice: DEBUG
```

### Check What's Happening
```
[GitHubAppAuthService] - Generated JWT for GitHub App with ID: 1956914
[GitHubService] - Exchanging JWT for installation token...
[GitHubService] - Fetching file from GitHub API: /repos/owner/repo/contents/package.json
[ProjectService] - Successfully fetched file package.json from repository owner/repo
```

### Common Debug Points
1. Check if JWT is generated correctly
2. Verify installation token is created
3. Inspect GitHub API response
4. Ensure base64 decoding works

---

## Useful Links

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [GitHub API - Repository Contents](https://docs.github.com/en/rest/repos/contents)
- [GitHub Check Runs API](https://docs.github.com/en/rest/checks/runs)
- [GitHub Webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks)

---

## Summary

**What you can do now:**

✅ Fetch any file from a GitHub repository
✅ Decode base64-encoded file content
✅ Access repository metadata (SHA, URL, etc.)
✅ Validate dependencies in package.json
✅ Integrate with your frontend/backend

**You're ready for:**
- Creating GitHub check runs
- Processing webhook events
- Building a code quality dashboard
- Automating dependency management
