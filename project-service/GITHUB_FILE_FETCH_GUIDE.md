# GitHub File Content Fetching - Implementation Guide

## Overview

This implementation allows your Spring Boot microservice to fetch file content from GitHub repositories using GitHub Apps authentication. The setup follows the same pattern as the Node.js blog example but implemented in Java/Spring Boot.

## Architecture

### Components Added

1. **GitHubAppAuthService** - Generates JWT tokens for GitHub App authentication
2. **GitHubService** - Enhanced with `getFileContent()` method to fetch files from GitHub API
3. **ProjectService** - Added `getRepositoryFileContent()` method to orchestrate the fetching process
4. **ProjectController** - New endpoint `/api/projects/github/content/{repoOwner}/{repoName}` to expose the functionality
5. **FileContentResponse** - DTO to return file content in a structured format

## Prerequisites

- GitHub App already installed (you mentioned you've done this)
- GitHub App ID, Client ID, and Client Secret configured in `application.yml`
- Private key file (.pem) stored at the path specified in config
- User has GitHub App installation linked to their account

## Configuration

Your `application.yml` already has the required GitHub configuration:

```yaml
github:
  app-id: 1956914                      # your GitHub App ID
  app-slug: talenthium            # slug from GitHub App URL
  private-key-pem: classpath:secrets/my-github-app-private-key-pkcs8.pem
  webhook-secret: secret1234
  callback-url: http://localhost:8088/project-service/github/callback
  install-token-secret: secret1234
```

## API Endpoint

### Fetch File Content

**Endpoint:** `GET /api/projects/github/content/{repoOwner}/{repoName}`

**Headers:**
- `X-USERID`: The user ID (required) - identifies which GitHub installation to use

**Query Parameters:**
- `filePath`: The path to the file in the repository (URL encoded if needed)

**Response:**
```json
{
  "fileName": "package.json",
  "path": "package.json",
  "content": "{\n  \"name\": \"my-project\",\n  \"version\": \"1.0.0\"\n}",
  "sha": "abc123...",
  "htmlUrl": "https://github.com/owner/repo/blob/main/package.json"
}
```

### Example Usage

**cURL:**
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/owner/repo?filePath=package.json" \
  -H "X-USERID: 123"
```

**JavaScript/Fetch:**
```javascript
const response = await fetch(
  'http://localhost:8088/project-service/api/projects/github/content/owner/repo?filePath=package.json',
  {
    method: 'GET',
    headers: {
      'X-USERID': '123'
    }
  }
);
const fileContent = await response.json();
console.log(fileContent.content); // The actual file content (decoded from base64)
```

**Axios:**
```javascript
const response = await axios.get(
  '/api/projects/github/content/owner/repo',
  {
    params: { filePath: 'package.json' },
    headers: { 'X-USERID': '123' }
  }
);
console.log(response.data.content);
```

## How It Works (Step by Step)

1. **Request arrives** at the controller endpoint with userId and file path
2. **Service retrieves** the user's GitHub App installation from the database
3. **Generate JWT** - GitHubAppAuthService creates a JWT signed with the app's private key
4. **Create Installation Token** - Exchange JWT for an installation-specific access token
5. **Fetch File from GitHub** - Use the installation token to request the file from GitHub API
6. **Decode Content** - GitHub returns base64-encoded content, which we decode to UTF-8
7. **Return Response** - Send back the file content along with metadata

## Error Handling

The implementation includes error handling for:
- User without GitHub App installation
- Invalid file paths (e.g., pointing to a directory)
- GitHub API errors
- JWT generation failures
- Invalid repository names

All errors are logged and returned with appropriate error messages.

## Security Considerations

1. **Private Key Protection** - The GitHub App private key is loaded from configuration, ensure it's stored securely
2. **User Isolation** - Each user can only access repositories that their GitHub App installation has access to
3. **Rate Limiting** - GitHub API has rate limits; consider implementing caching for frequently accessed files
4. **Token Expiration** - JWT tokens expire in 10 minutes; installation tokens are regenerated per request

## Advanced Features to Consider

### 1. Implement Caching
Cache installation tokens to avoid regenerating them on every request:

```java
private final Map<Long, String> tokenCache = new ConcurrentHashMap<>();

public String getCachedInstallationToken(long installationId, String appJwt) throws Exception {
    return tokenCache.computeIfAbsent(installationId, id -> 
        gitHubService.createInstallationToken(id, appJwt)
    );
}
```

### 2. Support Multiple File Formats
Check the file extension and handle different encodings if needed.

### 3. Add File Validation
Implement checks to enforce the package.json dependency format (as shown in the blog):

```java
public boolean isStrictDependencies(JsonNode deps) {
    return !deps.fieldNames().hasNext() || 
           deps.fieldNames().forEachRemaining(key -> {
               String value = deps.get(key).asText();
               if (!value.matches("^\\d+\\.\\d+\\.\\d+$")) {
                   return false;
               }
           });
}
```

### 4. Create Check Runs
After validating dependencies, create a GitHub check run to show results directly on the commit:

```java
public void createCheckRun(String repoFullName, String sha, boolean success, String installationToken) {
    // POST to /repos/{repo}/check-runs endpoint
    // Similar to the Node.js example in the blog
}
```

## Testing the Implementation

1. **Test with a real repository:**
   ```bash
   curl -X GET "http://localhost:8088/project-service/api/projects/github/content/your-username/your-repo?filePath=README.md" \
     -H "X-USERID: 1"
   ```

2. **Test error handling** - Try fetching a non-existent file or directory path

3. **Monitor logs** - Check application logs for JWT generation and API call details

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "You're not connected to any GitHub account" | Ensure the user has installed the GitHub App via the installation endpoint |
| "Unable to create installation token" | Verify the app JWT is being generated correctly and the private key path is correct |
| "Failed to fetch file content: 404" | Verify the file path exists in the repository and the installation has access to it |
| "classpath resource cannot be found" | Ensure the .pem file is in the resources folder (classpath:secrets/) |

## Next Steps

To complete the implementation from the blog example:

1. **Implement check runs** - Create GitHub check runs to show validation results
2. **Add webhook handling** - Process GitHub push events automatically
3. **Add scheduling** - Periodically check repositories for dependency updates
4. **Create a UI** - Add a frontend to browse and validate files from GitHub
