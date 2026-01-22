# GitHub File Content Fetching - Implementation Summary

## Changes Made

### 1. New Service: GitHubAppAuthService
**File:** `src/main/java/tech/talenthium/projectservice/service/GitHubAppAuthService.java`

Handles GitHub App JWT generation:
- Reads the private key from configuration (classpath or file path)
- Generates JWT tokens signed with RSA256
- Tokens are valid for 10 minutes
- Handles both classpath and regular file path resolution

**Key Method:**
```java
public String generateAppJWT() throws Exception
```

### 2. Enhanced GitHubService
**File:** `src/main/java/tech/talenthium/projectservice/service/GitHubService.java`

Added new method for fetching file content:
```java
public FileContentResponse getFileContent(
    String repoFullName, 
    String filePath, 
    String installationToken)
```

- Calls GitHub API `/repos/{owner}/{repo}/contents/{path}` endpoint
- Decodes base64-encoded content returned by GitHub
- Validates file vs directory (rejects directories)
- Returns FileContentResponse with metadata

### 3. Updated ProjectService
**File:** `src/main/java/tech/talenthium/projectservice/service/ProjectService.java`

New orchestration method:
```java
public FileContentResponse getRepositoryFileContent(
    Long userId, 
    String repoFullName, 
    String filePath)
```

Workflow:
1. Get user's GitHub installation
2. Generate app JWT
3. Create installation token
4. Fetch file content
5. Return response

### 4. New DTO: FileContentResponse
**File:** `src/main/java/tech/talenthium/projectservice/dto/response/FileContentResponse.java`

Contains:
- `fileName` - Name of the file
- `path` - Full path in repository
- `content` - Decoded file content
- `sha` - Commit SHA of the file
- `htmlUrl` - GitHub URL to the file

### 5. Updated ProjectController
**File:** `src/main/java/tech/talenthium/projectservice/controller/ProjectController.java`

New endpoint:
```
GET /api/projects/github/content/{repoOwner}/{repoName}?filePath=...
```

Headers:
- `X-USERID` (required) - User ID for GitHub App installation lookup

Query Parameters:
- `filePath` (required) - Path to the file in the repository

## How to Use

### 1. Basic File Fetch
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/owner/repo?filePath=package.json" \
  -H "X-USERID: 123"
```

### 2. Fetch Nested Files
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/owner/repo?filePath=src/config/settings.json" \
  -H "X-USERID: 123"
```

### 3. Response Example
```json
{
  "fileName": "package.json",
  "path": "package.json",
  "content": "{\n  \"name\": \"my-app\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"express\": \"4.18.2\"\n  }\n}",
  "sha": "abc1234567890",
  "htmlUrl": "https://github.com/owner/repo/blob/main/package.json"
}
```

## Flow Diagram

```
┌─────────────────┐
│   Controller    │ Request with userId & filePath
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   ProjectService                        │
│   getRepositoryFileContent()            │
└────────┬────────────────────────────────┘
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐    ┌─────────────────────────┐
│ GithubInstall    │    │ GitHubAppAuthService    │
│ Service          │    │ generateAppJWT()        │
└──────────────────┘    └─────────────────────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │   GitHubService        │
            │   - createInstallation │
            │     Token()            │
            │   - getFileContent()   │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │  GitHub API            │
            │  /repos/{}/contents/   │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ FileContentResponse    │
            │ (Decoded & formatted)  │
            └────────────────────────┘
```

## Dependencies Used

- **Spring Boot 3.5.4** - Web framework
- **Lombok** - Boilerplate reduction
- **Jackson** - JSON processing
- **Auth0 Java JWT** - JWT generation (already in pom.xml)
- **Spring Data JPA** - Database access

## Security & Error Handling

✅ User isolation - Each user can only access their installed repositories
✅ Proper exception handling - Meaningful error messages returned
✅ Private key security - Loaded from configuration, not hardcoded
✅ Token expiration - Tokens expire after set time
✅ Logging - All operations logged for debugging

## Configuration Required

Ensure your `application.yml` has these GitHub settings:
```yaml
github:
  app-id: <your-app-id>
  private-key-pem: classpath:secrets/my-github-app-private-key-pkcs8.pem
  # Other existing configs...
```

The private key should be in PKCS8 format (PEM file with standard headers/footers).

## Testing

1. Verify GitHub App is installed for the user
2. Test with a public repository first
3. Try fetching different file types (JSON, Markdown, source code)
4. Check logs for JWT generation and API call details

## Next Implementation Steps

From the blog example, you can now:
1. ✅ Install GitHub App (already done)
2. ✅ Fetch file content (just implemented)
3. ⏳ Validate file content (e.g., check dependencies)
4. ⏳ Create check runs to show validation results
5. ⏳ Process webhooks for automatic validation on push

All the infrastructure for steps 3-5 is in place; you just need to add the business logic!
