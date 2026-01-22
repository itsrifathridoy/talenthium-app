# RabbitMQ Async Project Creation Implementation

## Overview
Project creation is now **instant**! The system no longer waits for GitHub commits to be fetched. Instead, it queues the work asynchronously using RabbitMQ.

## What Changed

### 1. **Added RabbitMQ Infrastructure**
- **Docker**: RabbitMQ container added to `docker-compose.yml`
  - Management UI: http://localhost:15672 (admin/admin)
  - AMQP Port: 5672
  
- **Dependency**: Added `spring-boot-starter-amqp` to `pom.xml`

- **Configuration**: Added RabbitMQ connection in `application.yml`
  ```yaml
  spring:
    rabbitmq:
      host: localhost
      port: 5672
      username: admin
      password: admin
  ```

### 2. **New Components**

#### RabbitMQConfig.java
- Configures queue: `project.commit.fetch`
- Sets up JSON message converter
- Configures 3-10 concurrent consumers for parallel processing

#### CommitFetchEvent.java
- Event/message sent to queue containing:
  - projectId
  - userId
  - projectName
  - gitLink
  - defaultBranch

#### CommitFetchListener.java
- Listens to the `project.commit.fetch` queue
- Processes commit fetching in the background
- Fetches commits from **all branches** (not just default)
- Comprehensive logging with visual separators

### 3. **Modified Components**

#### ProjectService.java
- **Before**: Called `fetchAndStoreProjectCommits()` synchronously
- **After**: Publishes `CommitFetchEvent` to RabbitMQ queue
- Project creation now returns immediately

## Flow Diagram

```
User → POST /api/projects/create
         ↓
    Create Project
         ↓
    Save to Database ✓
         ↓
    Queue Commit Fetch Event → RabbitMQ
         ↓
    Return Project (INSTANT!) ✓

                              ↓
                        RabbitMQ Queue
                              ↓
                      CommitFetchListener
                              ↓
                    Process in Background
                              ↓
              Fetch All Branches & Commits
                              ↓
                  Save Contributions ✓
```

## Multi-Branch Support

The commit fetching now supports **all repository branches**, not just the default branch:

### Updated Components

1. **GitHubService.java**
   - Added `getAllBranches()` method to fetch all branches from GitHub API

2. **ContributionService.java**
   - Modified `fetchAndStoreCommits()` to:
     - Fetch all branches
     - Iterate through each branch
     - Fetch commits from each branch
     - Store with branch name

3. **Contribution Entity**
   - Added `branch` field (non-null)
   - Removed unique constraint on `commitSha` (same commit can be on multiple branches)

4. **ContributionRepository.java**
   - Added `existsByCommitShaAndBranch()` method to check duplicates per branch

## Benefits

✅ **Instant Response**: Project creation returns immediately  
✅ **Better UX**: Users don't wait for slow GitHub API calls  
✅ **Scalability**: Multiple projects can be processed in parallel (3-10 consumers)  
✅ **Reliability**: Failed commits don't break project creation  
✅ **Multi-Branch**: All branches are processed, not just default  
✅ **Visibility**: Comprehensive logging for debugging

## Testing

### 1. Start RabbitMQ
```bash
cd d:\talenthium-microservice
docker-compose up -d rabbitmq
```

### 2. Check RabbitMQ Management UI
Visit: http://localhost:15672
- Username: admin
- Password: admin
- Check queue: `project.commit.fetch`

### 3. Create a Project
```bash
POST http://localhost:8088/project-service/api/projects/create
```

You should see:
1. Instant response with project data
2. Queue message appears in RabbitMQ
3. Background processing logs in console
4. Commits appear in database after processing

## Configuration

### Concurrent Consumers
Adjust in [RabbitMQConfig.java](d:\talenthium-microservice\project-service\src\main\java\tech\talenthium\projectservice\config\RabbitMQConfig.java):
```java
factory.setConcurrentConsumers(3);      // Minimum consumers
factory.setMaxConcurrentConsumers(10);  // Maximum consumers
```

### Queue Settings
- **Durable**: Yes (survives RabbitMQ restart)
- **Auto-delete**: No
- **Exclusive**: No

## Migration Required

The `contributions` table needs a database migration to add the `branch` column:

```sql
ALTER TABLE contributions ADD COLUMN branch VARCHAR(255) NOT NULL DEFAULT 'main';
ALTER TABLE contributions ALTER COLUMN commit_sha DROP CONSTRAINT IF EXISTS unique_commit_sha;
```

Or restart the service with Hibernate's `ddl-auto=update` to auto-apply changes.

## Monitoring

### Logs
Watch for:
```
===============================================
Processing commit fetch event for project: [NAME] (ID: [ID])
===============================================
```

### RabbitMQ Dashboard
- Queue depth (should be 0 when idle)
- Message rate (publish/deliver)
- Consumer count (should be 3-10)

## Troubleshooting

**Issue**: Project created but no commits  
**Solution**: Check RabbitMQ logs and listener logs for errors

**Issue**: Queue filling up  
**Solution**: Increase max concurrent consumers or check for stuck processing

**Issue**: Commits missing branch field  
**Solution**: Run database migration to add branch column

## Future Enhancements

- [ ] Retry logic for failed commit fetches
- [ ] Dead letter queue for permanently failed messages
- [ ] Progress tracking (store fetch status in project table)
- [ ] Webhook to notify frontend when commits are ready
- [ ] Rate limiting to avoid GitHub API throttling
