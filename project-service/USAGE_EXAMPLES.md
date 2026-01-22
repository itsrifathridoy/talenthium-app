# GitHub File Content Fetching - Usage Examples

## 1. Basic File Content Fetch

### cURL Example
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/nodejs/node/package.json" \
  -H "X-USERID: 123" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "fileName": "package.json",
  "path": "package.json",
  "content": "{\n  \"name\": \"node\",\n  \"version\": \"20.0.0\",\n  \"description\": \"Node.js runtime\",\n  \"dependencies\": {\n    \"express\": \"4.18.2\",\n    \"lodash\": \"4.17.21\"\n  }\n}",
  "sha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "htmlUrl": "https://github.com/nodejs/node/blob/main/package.json"
}
```

---

## 2. Fetch Nested File Path

### cURL Example
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/facebook/react?filePath=packages/react/package.json" \
  -H "X-USERID: 456"
```

---

## 3. JavaScript/Frontend Integration

### React Component Example
```typescript
import { useState } from 'react';

export function GitHubFileViewer() {
  const [fileContent, setFileContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFile = async (repoOwner: string, repoName: string, filePath: string, userId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/projects/github/content/${repoOwner}/${repoName}?filePath=${encodeURIComponent(filePath)}`,
        {
          method: 'GET',
          headers: {
            'X-USERID': userId.toString(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const data = await response.json();
      setFileContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => fetchFile('facebook', 'react', 'package.json', 123)}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Load React package.json'}
      </button>

      {error && <div className="error">{error}</div>}

      {fileContent && (
        <div>
          <h2>{fileContent.fileName}</h2>
          <p>Path: {fileContent.path}</p>
          <p>SHA: {fileContent.sha}</p>
          <pre>{fileContent.content}</pre>
          <a href={fileContent.htmlUrl} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Axios Usage in Node.js Backend

### Express.js Middleware Example
```typescript
import axios, { AxiosInstance } from 'axios';

class GitHubFileClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8088/project-service') {
    this.client = axios.create({ baseURL });
  }

  async fetchPackageJson(
    userId: number,
    repoOwner: string,
    repoName: string
  ): Promise<any> {
    const response = await this.client.get(
      `/api/projects/github/content/${repoOwner}/${repoName}`,
      {
        params: { filePath: 'package.json' },
        headers: { 'X-USERID': userId }
      }
    );
    return response.data;
  }

  async fetchConfigFile(
    userId: number,
    repoOwner: string,
    repoName: string,
    configPath: string
  ): Promise<any> {
    const response = await this.client.get(
      `/api/projects/github/content/${repoOwner}/${repoName}`,
      {
        params: { filePath: configPath },
        headers: { 'X-USERID': userId }
      }
    );
    return response.data;
  }
}

// Usage
const client = new GitHubFileClient();

(async () => {
  try {
    const packageJson = await client.fetchPackageJson(123, 'vercel', 'next.js');
    console.log('Package name:', JSON.parse(packageJson.content).name);
    console.log('File SHA:', packageJson.sha);
  } catch (error) {
    console.error('Error fetching file:', error);
  }
})();
```

---

## 5. Validate Dependencies (Using GitHubFileValidationService)

### Service Integration Example
```java
@Service
@RequiredArgsConstructor
public class PackageValidationService {
    private final ProjectService projectService;
    private final GitHubFileValidationService validationService;

    public ValidationResult validateRepositoryDependencies(
            Long userId, 
            String repoOwner, 
            String repoName) {
        
        // Fetch package.json
        FileContentResponse packageJson = projectService.getRepositoryFileContent(
            userId, 
            repoOwner + "/" + repoName, 
            "package.json"
        );

        // Validate dependencies
        return validationService.validateStrictDependencies(packageJson);
    }
}
```

### Response Example
```json
{
  "isValid": false,
  "message": "Found semver ranges in dependencies",
  "violations": [
    "dependencies: express uses non-strict version '^4.18.2'",
    "devDependencies: jest uses non-strict version '~29.0.0'",
    "devDependencies: typescript uses non-strict version '>=4.0.0'"
  ]
}
```

---

## 6. Spring Boot Controller Integration

### Complete Controller Example
```java
@RestController
@RequestMapping("/api/github-files")
@RequiredArgsConstructor
public class GitHubFilesController {
    private final ProjectService projectService;
    private final GitHubFileValidationService validationService;

    /**
     * Get and validate package.json from a repository
     */
    @GetMapping("/validate-dependencies/{repoOwner}/{repoName}")
    public ResponseEntity<?> validateDependencies(
            @RequestHeader("X-USERID") Long userId,
            @PathVariable String repoOwner,
            @PathVariable String repoName) {
        
        try {
            // Fetch file
            FileContentResponse fileContent = projectService.getRepositoryFileContent(
                userId, 
                repoOwner + "/" + repoName, 
                "package.json"
            );

            // Validate
            GitHubFileValidationService.ValidationResult result = 
                validationService.validateStrictDependencies(fileContent);

            // Return validation result
            return ResponseEntity.ok(Map.of(
                "fileName", fileContent.getFileName(),
                "validation", result,
                "sha", fileContent.getSha(),
                "url", fileContent.getHtmlUrl()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Download and parse any text file from GitHub
     */
    @GetMapping("/read-file")
    public ResponseEntity<FileContentResponse> readFile(
            @RequestHeader("X-USERID") Long userId,
            @RequestParam String repoOwner,
            @RequestParam String repoName,
            @RequestParam String filePath) {
        
        FileContentResponse content = projectService.getRepositoryFileContent(
            userId,
            repoOwner + "/" + repoName,
            filePath
        );
        
        return ResponseEntity.ok(content);
    }
}
```

---

## 7. Error Scenarios & Handling

### Scenario 1: User Not Connected to GitHub
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/owner/repo?filePath=README.md" \
  -H "X-USERID: 999"
```

**Response:**
```json
{
  "error": "Failed to fetch file content: You're not connected to any github account yet."
}
```

### Scenario 2: File Not Found
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/owner/repo?filePath=nonexistent.json" \
  -H "X-USERID: 123"
```

**Response:**
```json
{
  "error": "Failed to fetch file content: Failed to fetch file: 404 NOT_FOUND"
}
```

### Scenario 3: Attempting to Fetch Directory
```bash
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/owner/repo?filePath=src" \
  -H "X-USERID: 123"
```

**Response:**
```json
{
  "error": "Failed to fetch file content: Path points to a directory, not a file"
}
```

---

## 8. Best Practices

### 1. Always Include X-USERID Header
The system uses this to find the correct GitHub App installation.

### 2. URL Encode File Paths
If your file path has special characters, encode them:
```javascript
const filePath = "src/config/settings (2024).json";
const encoded = encodeURIComponent(filePath);
// Use: ?filePath=src%2Fconfig%2Fsettings%20%282024%29.json
```

### 3. Handle Large Files
For very large files, consider:
- Setting a file size limit
- Streaming responses
- Caching frequently accessed files

### 4. Cache Installation Tokens
Tokens are valid for a long time. Consider caching them to reduce API calls.

### 5. Error Logging
Always log errors for debugging:
```java
log.error("Failed to fetch file from {} repo {}", userId, repoFullName, exception);
```

---

## 9. Testing with Different Repositories

### Test with Public Repositories
```bash
# React
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/facebook/react?filePath=package.json" \
  -H "X-USERID: 123"

# Express.js
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/expressjs/express?filePath=package.json" \
  -H "X-USERID: 123"

# TypeScript
curl -X GET "http://localhost:8088/project-service/api/projects/github/content/microsoft/TypeScript?filePath=package.json" \
  -H "X-USERID: 123"
```

---

## 10. Next Steps

1. **Create a webhook endpoint** to automatically fetch and validate files on push
2. **Create GitHub Check Runs** to show validation results directly on commits
3. **Implement file caching** to reduce GitHub API calls
4. **Add rate limiting** to prevent exceeding GitHub API quotas
5. **Create a dashboard** to visualize dependency compliance across repositories
