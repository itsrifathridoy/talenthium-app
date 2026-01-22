# Quick Start: Commit History & User Sync

## 🚀 Getting Started in 5 Minutes

### Step 1: Configure Kafka (application.yml)
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

### Step 2: Run Database Migrations
```bash
# Option 1: Automatic (if Liquibase enabled)
java -jar project-service.jar

# Option 2: Manual SQL
# Run migrations from DATABASE_MIGRATION_GUIDE.md
```

### Step 3: Verify Installation
Check logs for:
```
✅ "Kafka consumer started successfully"
✅ "Database migrations completed"
✅ "UserCreatedConsumer initialized"
```

### Step 4: Test User Sync
```bash
# 1. Register user in auth-service
POST /auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "name": "Test User",
  "password": "...",
  "role": "DEVELOPER"
}

# 2. Check project-service logs
grep "successfully synced" project-service.log
# Expected: "User testuser successfully synced to project-service database"

# 3. Verify in project-service DB
SELECT * FROM users WHERE username = 'testuser';
# Should return 1 row
```

### Step 5: Test Project with Commits
```bash
# 1. Create project
POST /api/projects/create
{
  "name": "Test Project",
  "slogan": "Test",
  "shortDescription": "Testing commit fetch",
  "detailedDescription": "Full description",
  "githubRepository": "owner/repo",  // Real GitHub repo
  "defaultBranch": "main"
}

# 2. Check project-service logs
grep "Fetching commits" project-service.log
grep "Successfully fetched" project-service.log
# Expected: "Successfully fetched and stored commits for project: Test Project"

# 3. Verify contributions stored
SELECT COUNT(*) FROM contribution;
# Should return number > 0

# 4. View contributions
GET /api/projects/my
# Response should include contributions array with commits
```

## 📋 Deployment Checklist

- [ ] Kafka broker running on localhost:9092
- [ ] application.yml configured with Kafka
- [ ] Database migrations applied
- [ ] project-service restarted
- [ ] Auth service sending events to Kafka
- [ ] Test user sync (verify user appears)
- [ ] Test project creation (verify commits fetched)
- [ ] Frontend Contributions tab working

## 🔍 Monitoring

### Check User Sync Status
```sql
-- How many users synced?
SELECT COUNT(*) FROM users;

-- Show recent users
SELECT user_id, username, created_at FROM users ORDER BY created_at DESC LIMIT 10;
```

### Check Commit Status
```sql
-- How many commits stored?
SELECT COUNT(*) FROM contribution;

-- Show recent commits
SELECT 
  c.id, 
  c.commit_sha, 
  c.commit_message, 
  c.committed_date 
FROM contribution c 
ORDER BY c.committed_date DESC 
LIMIT 10;

-- Show contributors
SELECT 
  DISTINCT con.id,
  con.name, 
  con.github_username,
  COUNT(c.id) as commit_count
FROM contributor con
LEFT JOIN contribution c ON con.contributor_id = c.contributor_id
GROUP BY con.id, con.name, con.github_username;
```

### Check Logs
```bash
# User sync logs
grep "UserCreatedConsumer\|UserService" project-service.log

# Commit fetch logs
grep "Fetching commits\|Successfully fetched" project-service.log

# Kafka errors
grep "KafkaConsumer\|topic" project-service.log
```

## ⚡ Common Issues & Fixes

### Issue: "No consumers assigned"
```
Cause: Kafka topic doesn't exist or consumer group wrong
Fix: 
- Create topic: kafka-topics.sh --create --topic create-account-event
- Verify group-id in application.yml
```

### Issue: "Commit SHA duplicate"
```
Cause: Trying to insert same commit twice
Fix: 
- This is expected - duplicates are prevented
- Check logs for skip messages
- Verify unique constraint exists on commitSha
```

### Issue: "GitHub API 401 Unauthorized"
```
Cause: Installation token invalid or expired
Fix:
- Verify GitHub App installation still active
- Check installation token generation
- Re-authorize GitHub App if needed
```

### Issue: "User not found in project-service DB"
```
Cause: Kafka event not consumed or delayed
Fix:
- Verify Kafka broker running
- Check consumer logs
- Manually test consumer with test event
- Check deserialization config
```

## 🧪 Manual Testing

### Test 1: User Sync
```bash
# Terminal 1: Watch logs
tail -f project-service.log | grep "User"

# Terminal 2: Create user
POST http://localhost:8081/auth/register
{
  "username": "john_dev",
  "email": "john@dev.com",
  "name": "John Developer",
  "password": "Test123!",
  "role": "DEVELOPER"
}

# Result: Should see sync message in logs
```

### Test 2: Commit Fetching
```bash
# Terminal 1: Watch logs
tail -f project-service.log | grep "commit\|Contribution"

# Terminal 2: Get token and create project
# First authenticate and get token
POST http://localhost:8088/auth/login
{
  "username": "john_dev",
  "password": "Test123!"
}

# Then create project with real repo
POST http://localhost:8088/project-service/api/projects/create
{
  "name": "Real Test Project",
  "slogan": "Real test",
  "shortDescription": "Testing with real repo",
  "detailedDescription": "This tests commit fetching",
  "githubRepository": "facebook/react",  // Use a real repo
  "defaultBranch": "main"
}

# Result: Should see commit fetch messages in logs
```

### Test 3: View Contributions
```bash
# Get projects with contributions
GET http://localhost:8088/project-service/api/projects/my

# Result: Should include contributions array with commit data
```

## 📝 Useful Queries

### Show all projects with contributor count
```sql
SELECT 
  p.id, 
  p.name, 
  COUNT(DISTINCT c.contributor_id) as contributors,
  COUNT(con.id) as commits
FROM project p
LEFT JOIN contributor c ON p.id = c.project_id
LEFT JOIN contribution con ON p.id = con.project_id
GROUP BY p.id, p.name;
```

### Show commits by contributor
```sql
SELECT 
  con.name,
  COUNT(*) as commit_count,
  MAX(c.committed_date) as latest_commit
FROM contribution c
JOIN contributor con ON c.contributor_id = con.contributor_id
WHERE c.project_id = ?
GROUP BY con.name
ORDER BY commit_count DESC;
```

### Show sync performance
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as users_synced
FROM users
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🎯 Success Criteria

✅ Implementation complete when:
1. ✅ Users sync from auth-service to project-service
2. ✅ Commits fetch automatically on project creation
3. ✅ No duplicate commits stored
4. ✅ Contributors linked correctly
5. ✅ Contributions visible in frontend
6. ✅ No errors in logs
7. ✅ Database populated correctly

## 📚 Additional Resources

- **Full Guide:** COMMIT_HISTORY_USER_SYNC_GUIDE.md
- **DB Migrations:** DATABASE_MIGRATION_GUIDE.md
- **Implementation:** COMMIT_HISTORY_IMPLEMENTATION.md
- **Files List:** FILES_CREATED_AND_MODIFIED.md

---

**Ready to start?** Follow Steps 1-5 above! 🚀
