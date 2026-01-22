# Commit History & User Sync Implementation

## Overview
This implementation adds three key features to the project-service:
1. **Automatic Commit Fetching** - Fetches commits after project creation
2. **User Sync via Kafka** - Syncs users from auth-service to project-service
3. **Contribution Tracking** - Stores and manages project contributions

## Components Created

### 1. User Entity & Repository
**Files:**
- `entity/User.java` - Stores user information synced from auth-service
- `repository/UserRepository.java` - Data access for users

**Fields:**
- `userId` - PK, mapped from auth-service
- `username` - Unique username
- `email` - Unique email
- `name` - Full name
- `role` - User role (DEVELOPER, RECRUITER, etc.)
- `githubUsername` - GitHub username (added later)
- `githubId` - GitHub ID (added later)
- `createdAt`, `updatedAt` - Timestamps

### 2. Kafka Consumer for User Events
**Files:**
- `kafka/consumer/UserCreatedConsumer.java` - Listens to "create-account-event" topic
- `dto/event/UserCreatedEvent.java` - Event model

**Flow:**
```
Auth Service → UserCreatedPublisher
                ↓
            create-account-event (Kafka topic)
                ↓
Project Service ← UserCreatedConsumer
                ↓
             UserService
                ↓
          UserRepository (Save to DB)
```

### 3. Commit Fetching Service
**Files:**
- `service/ContributionService.java` - Orchestrates commit fetching
- `repository/ContributionRepository.java` - Commit data access
- `repository/ContributorRepository.java` - Contributor data access
- `dto/response/CommitResponse.java` - Commit API response model

**Features:**
- Fetches commits from GitHub API
- Creates/updates contributors
- Stores commit history
- Prevents duplicate commits (via unique commitSha)

### 4. Updated Entities

**Contribution Entity:**
- Added `commitSha` (unique) - SHA of the commit
- Added `commitMessage` - Commit message
- Added `commitDescription` - Full commit description
- Added `committedDate` - When commit was made
- Added `createdAt` - When record was created
- Removed redundant fields (commit, commitSummary, detailedDes)

**Contributor Entity:**
- Added `name` - Contributor name
- Added `githubUsername` - GitHub username
- Added `githubId` - GitHub user ID
- Added `email` - Contributor email
- Changed `role` to String for flexibility
- Added `createdAt` - When record was created

**Project Entity:**
- Added `defaultBranch` - Default repository branch

**User Entity:**
- `userId` - Maps to auth-service user ID
- `username` - Unique username
- `email` - Unique email
- `name` - Full name
- `role` - User role
- `githubUsername` - GitHub username (for later linking)
- `githubId` - GitHub user ID (for later linking)

## Flow Diagrams

### 1. Project Creation with Commit Fetching
```
User creates project
    ↓
ProjectController.createProject()
    ↓
ProjectService.createNewProject()
    ↓
Project saved to DB
    ↓
ProjectService.fetchAndStoreProjectCommits()
    ↓
Get GitHub installation token
    ↓
GitHubService.getCommits(repoFullName, token, branch)
    ↓
ContributionService.fetchAndStoreCommits()
    ↓
For each commit:
  - Check if already exists (via commitSha)
  - Find/create Contributor
  - Save Contribution
    ↓
Commit history stored ✓
```

### 2. User Creation & Sync
```
User registers (Auth Service)
    ↓
AuthService.registerDeveloper/Recruiter()
    ↓
User saved to Auth DB
    ↓
UserCreatedPublisher.emitEvent()
    ↓
create-account-event published to Kafka
    ↓
Project Service (UserCreatedConsumer)
    ↓
UserCreatedConsumer.listen()
    ↓
UserService.createUserFromEvent()
    ↓
User saved to Project Service DB
    ↓
User synced ✓
```

## GitHub Integration

### GitHubService Updates
Added new method: `getCommits(repoFullName, installationToken, branch, perPage)`

**Returns:** JsonNode array of commits with:
- `sha` - Commit SHA
- `commit.message` - Commit message
- `commit.author.name` - Author name
- `commit.author.email` - Author email
- `commit.author.date` - Commit date

### CommitData Helper Class
Parses GitHub API response and extracts:
- `sha` - Commit hash
- `message` - Commit message (first line)
- `author` - Author name
- `authorEmail` - Author email
- `committedDate` - ISO-8601 timestamp

## Database Schema Changes

### New Table: users
```sql
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  github_username VARCHAR(255),
  github_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
```

### Updated: contributions
```sql
ALTER TABLE contribution ADD COLUMN commit_sha VARCHAR(255) UNIQUE;
ALTER TABLE contribution ADD COLUMN commit_message TEXT;
ALTER TABLE contribution ADD COLUMN commit_description TEXT;
ALTER TABLE contribution ADD COLUMN committed_date TIMESTAMP;
ALTER TABLE contribution ADD COLUMN created_at TIMESTAMP;
ALTER TABLE contribution DROP COLUMN commit;
ALTER TABLE contribution DROP COLUMN commit_summary;
ALTER TABLE contribution DROP COLUMN detailed_des;
```

### Updated: contributor
```sql
ALTER TABLE contributor ADD COLUMN name VARCHAR(255) NOT NULL;
ALTER TABLE contributor ADD COLUMN github_username VARCHAR(255);
ALTER TABLE contributor ADD COLUMN github_id VARCHAR(255);
ALTER TABLE contributor ADD COLUMN email VARCHAR(255);
ALTER TABLE contributor MODIFY COLUMN role VARCHAR(50);
ALTER TABLE contributor ADD COLUMN created_at TIMESTAMP;
ALTER TABLE contributor DROP COLUMN contributor_external_id;
ALTER TABLE contributor DROP COLUMN join_at;
```

### Updated: project
```sql
ALTER TABLE project ADD COLUMN default_branch VARCHAR(255);
```

## Configuration Required

### Kafka Configuration (application.yml)
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: project-service
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.type.mapping: "UserCreatedEvent:tech.talenthium.projectservice.dto.event.UserCreatedEvent"
```

## API Response Example

### GET /api/projects/my - With Contributions
```json
[
  {
    "id": 1,
    "name": "Mentor Connect",
    "tagline": "Platform to connect mentors and mentees",
    "shortDescription": "...",
    "gitLink": "owner/repo",
    "contributions": [
      {
        "id": 1,
        "contributor": {
          "name": "Jane Doe",
          "email": "jane@example.com",
          "githubUsername": "janedoe"
        },
        "commitSha": "abc123...",
        "commitMessage": "Add AI-powered mentor matching",
        "type": "Commit",
        "committedDate": "2024-01-15T10:30:00Z"
      }
    ]
  }
]
```

## Error Handling

### Commit Fetching Errors
- Invalid repository: Logs warning, continues with empty commits
- GitHub API unavailable: Logs error, doesn't fail project creation
- Duplicate commits: Skipped gracefully

### User Sync Errors
- Duplicate user creation: Checks and returns existing user
- Missing user on sync: Logs error, consumer continues

## Performance Considerations

### Commit Fetching
- Fetches max 100 commits per API call (configurable)
- Unique constraint on `commitSha` prevents duplicates
- Can be called multiple times safely
- Consider pagination for very large repositories

### User Sync
- Concurrent Kafka consumers (3 threads default)
- User lookup by email/username before creating
- Prefers existing user to duplicate creation

## Future Enhancements

1. **GitHub Username Linking**
   - After GitHub App auth, store `github_username` and `github_id` in User table
   - Link commits to authenticated users instead of just emails

2. **Incremental Sync**
   - Store last fetch timestamp
   - Only fetch commits since last update
   - Avoid re-fetching all history

3. **Contribution Analytics**
   - Calculate contribution stats by contributor
   - Track contribution trends over time
   - Generate developer activity reports

4. **Webhook Integration**
   - Listen to GitHub push events via webhook
   - Real-time commit updates instead of batch fetch
   - Immediate notification of new contributions

## Testing Checklist

- [ ] User created in auth-service → Kafka event emitted
- [ ] Project-service consumes event → User saved
- [ ] Project created → Commits fetched
- [ ] Commits stored with correct SHA, message, date
- [ ] Duplicate commits not stored
- [ ] Contributors created/linked correctly
- [ ] Contribution list returned in correct order
- [ ] GitHub API errors handled gracefully
