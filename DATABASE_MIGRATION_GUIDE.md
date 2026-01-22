# Database Migration Guide

## Liquibase Migration Files

Create migration files in `src/main/resources/db/changelog/`

### 1. Create Users Table
**File:** `2024-01-21-001-create-users-table.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 001-create-users-table
      author: system
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: user_id
                  type: BIGINT
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: username
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
                    unique: true
              - column:
                  name: email
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
                    unique: true
              - column:
                  name: name
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
              - column:
                  name: role
                  type: VARCHAR(50)
                  constraints:
                    nullable: false
              - column:
                  name: github_username
                  type: VARCHAR(255)
              - column:
                  name: github_id
                  type: VARCHAR(255)
              - column:
                  name: created_at
                  type: TIMESTAMP
                  constraints:
                    nullable: false
              - column:
                  name: updated_at
                  type: TIMESTAMP
```

### 2. Update Contributions Table
**File:** `2024-01-21-002-update-contributions-table.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 002-update-contributions-table
      author: system
      changes:
        - addColumn:
            tableName: contribution
            columns:
              - column:
                  name: commit_sha
                  type: VARCHAR(255)
                  constraints:
                    unique: true
        - addColumn:
            tableName: contribution
            columns:
              - column:
                  name: commit_message
                  type: TEXT
        - addColumn:
            tableName: contribution
            columns:
              - column:
                  name: commit_description
                  type: TEXT
        - addColumn:
            tableName: contribution
            columns:
              - column:
                  name: committed_date
                  type: TIMESTAMP
        - addColumn:
            tableName: contribution
            columns:
              - column:
                  name: created_at
                  type: TIMESTAMP
                  constraints:
                    nullable: false
```

### 3. Update Contributor Table
**File:** `2024-01-21-003-update-contributor-table.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 003-update-contributor-table
      author: system
      changes:
        - addColumn:
            tableName: contributor
            columns:
              - column:
                  name: name
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
        - addColumn:
            tableName: contributor
            columns:
              - column:
                  name: github_username
                  type: VARCHAR(255)
        - addColumn:
            tableName: contributor
            columns:
              - column:
                  name: github_id
                  type: VARCHAR(255)
        - addColumn:
            tableName: contributor
            columns:
              - column:
                  name: email
                  type: VARCHAR(255)
        - addColumn:
            tableName: contributor
            columns:
              - column:
                  name: created_at
                  type: TIMESTAMP
```

### 4. Update Project Table
**File:** `2024-01-21-004-update-project-table.yaml`

```yaml
databaseChangeLog:
  - changeSet:
      id: 004-update-project-table
      author: system
      changes:
        - addColumn:
            tableName: project
            columns:
              - column:
                  name: default_branch
                  type: VARCHAR(255)
```

## Alternative: JPA Auto-DDL

If using JPA auto-DDL (not recommended for production):

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Use 'validate' in production
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

## Verification Commands

### Check users table
```sql
SELECT * FROM users;
```

### Check contribution changes
```sql
SELECT 
  c.id, c.commit_sha, c.commit_message, 
  c.committed_date, c.created_at,
  c.contributor_id
FROM contribution c
ORDER BY c.committed_date DESC;
```

### Check contributor changes
```sql
SELECT 
  c.contributor_id, c.name, c.github_username, 
  c.email, c.role, c.created_at
FROM contributor c;
```

### Check project changes
```sql
SELECT 
  p.id, p.name, p.git_link, p.default_branch
FROM project p;
```

## Spring Boot Migration

The application will automatically run Liquibase migrations on startup if configured.

### Disable auto-migration (if needed)
```bash
java -jar app.jar --spring.liquibase.enabled=false
```

### Run specific migration
```bash
java -jar app.jar --spring.liquibase.changeLog=db/changelog/2024-01-21-001-create-users-table.yaml
```
