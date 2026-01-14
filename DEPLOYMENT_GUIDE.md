# Deployment & Configuration Guide

## Environment Configurations

### Development Environment

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8088
NODE_ENV=development
```

#### Backend (application.yml)
Already configured for local development

#### Database
- PostgreSQL for user data
- Redis for session management
- Kafka for event publishing

---

## Docker Deployment

### Build Frontend Docker Image

```dockerfile
# Dockerfile for frontend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

### Build Backend Docker Image

Auth Service already has Dockerfile:
```dockerfile
FROM openjdk:24-jdk-slim

COPY target/auth-service-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
```

### Docker Compose Setup

```yaml
version: '3.8'
services:
  postgres-auth:
    image: postgres:16
    environment:
      POSTGRES_DB: auth_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - auth-db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api-gateway:
    build:
      context: ./api-gateway
    ports:
      - "8088:8088"
    depends_on:
      - discovery-service
    environment:
      EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE: http://discovery-service:8761/eureka/

  auth-service:
    build:
      context: ./auth-service
    ports:
      - "8081:8081"
    depends_on:
      - postgres-auth
      - redis
      - discovery-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-auth:5432/auth_db
      SPRING_DATASOURCE_USERNAME: admin
      SPRING_DATASOURCE_PASSWORD: password
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE: http://discovery-service:8761/eureka/

  discovery-service:
    build:
      context: ./discovery-service
    ports:
      - "8761:8761"

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - api-gateway
    environment:
      NEXT_PUBLIC_API_URL: http://api-gateway:8088

volumes:
  auth-db-data:
```

---

## Production Configuration

### Environment Variables (Production)

#### Frontend
```env
NEXT_PUBLIC_API_URL=https://api.talenthium.com
NODE_ENV=production
```

#### Backend (Auth Service)
```properties
# Database (Production PostgreSQL)
spring.datasource.url=jdbc:postgresql://prod-db.example.com:5432/auth_db
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

# Redis
spring.redis.host=prod-redis.example.com
spring.redis.password=${REDIS_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET_KEY}
jwt.expiration=3600000

# Eureka
eureka.client.serviceUrl.defaultZone=http://eureka.example.com:8761/eureka/

# CORS (Production Origins)
cors.allowed-origins=https://app.talenthium.com,https://www.talenthium.com

# OAuth2 (Production Credentials)
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET}
```

### Security in Production

1. **Enable HTTPS**
   - Use valid SSL/TLS certificates
   - Enforce HTTPS redirects
   - Set HSTS headers

2. **JWT Configuration**
   - Use strong secret key (256+ bits)
   - Set appropriate expiration times
   - Rotate secrets regularly

3. **Database Security**
   - Use prepared statements (already done)
   - Enable encryption at rest
   - Regular backups
   - Use VPC for database access

4. **Redis Security**
   - Enable password authentication
   - Use ACLs for user permissions
   - Encrypt in transit
   - Run in VPC

5. **API Security**
   - Rate limiting enabled
   - Request validation
   - CORS configured properly
   - API Key management (if needed)

6. **Monitoring**
   - Log all authentication events
   - Monitor failed login attempts
   - Alert on suspicious activities
   - Regular security audits

---

## AWS Deployment (Example)

### RDS PostgreSQL Database
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier talenthium-auth-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <strong-password> \
  --allocated-storage 20 \
  --storage-encrypted
```

### ElastiCache Redis
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id talenthium-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --engine-version 7.0
```

### ECS for Containers
```bash
# Create ECS task definition for auth-service
aws ecs register-task-definition \
  --family talenthium-auth-service \
  --container-definitions file://task-definition.json \
  --requires-compatibilities FARGATE \
  --network-mode awsvpc \
  --cpu 256 \
  --memory 512
```

### Load Balancer
```bash
# Create ALB for API Gateway
aws elbv2 create-load-balancer \
  --name talenthium-api-lb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678 \
  --scheme internet-facing \
  --type application
```

---

## CI/CD Pipeline (GitHub Actions Example)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Build Frontend
      run: |
        cd frontend
        npm install
        npm run build

    - name: Build Backend
      run: |
        cd auth-service
        mvn clean package -DskipTests

    - name: Build Docker Images
      run: |
        docker build -t auth-service:latest ./auth-service
        docker build -t frontend:latest ./frontend

    - name: Push to Registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push auth-service:latest
        docker push frontend:latest

    - name: Deploy to ECS
      run: |
        aws ecs update-service \
          --cluster production \
          --service auth-service \
          --force-new-deployment
```

---

## Database Migrations

### Initial Setup
```sql
-- Create users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(320) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(50),
  phone VARCHAR(15),
  role VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
  token_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id),
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

## Performance Optimization

### Caching Strategy
```properties
# Redis cache for user data
spring.cache.type=redis
spring.redis.cache.time-to-live=3600000

# Cache current user for 1 hour
@Cacheable(value = "users", key = "#username")
public User findByUsername(String username) { ... }
```

### Database Optimization
```properties
# Connection pooling
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# Query optimization
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

### API Response Compression
```properties
server.compression.enabled=true
server.compression.min-response-size=1024
```

---

## Monitoring & Logging

### ELK Stack Integration
```properties
# Send logs to ELK
logging.level.tech.talenthium.authservice=INFO
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# Elasticsearch integration
spring.elasticsearch.rest.uris=https://elasticsearch:9200
logging.elasticsearch.enabled=true
```

### Metrics with Prometheus
```properties
# Expose metrics
management.endpoints.web.exposure.include=health,metrics,prometheus
management.metrics.export.prometheus.enabled=true
```

### CloudWatch Integration (AWS)
```properties
# Send metrics to CloudWatch
management.cloudwatch.namespace=Talenthium/Auth
management.cloudwatch.enabled=true
```

---

## Backup & Disaster Recovery

### Database Backups
```bash
# Daily automated backups
0 2 * * * pg_dump -h localhost -U admin auth_db | gzip > /backups/auth_db_$(date +\%Y\%m\%d).sql.gz

# Retention: Keep 30 days of backups
find /backups -name "auth_db_*" -mtime +30 -delete
```

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective)**: 1 hour
2. **RPO (Recovery Point Objective)**: 15 minutes
3. **Backup Location**: AWS S3 with cross-region replication
4. **Recovery Testing**: Monthly DR drills

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (ALB/NLB)
- Run multiple auth-service instances
- Shared PostgreSQL database
- Shared Redis cache

### Vertical Scaling
- Increase container memory and CPU
- Database instance type upgrade
- Redis cluster sizing

### Auto-Scaling Policy
```bash
# Scale based on CPU utilization
Target CPU Utilization: 70%
Min Instances: 2
Max Instances: 10
Scale-up: +1 instance when CPU > 80%
Scale-down: -1 instance when CPU < 50%
```

---

## Compliance & Security

### GDPR Compliance
- ✅ User data export endpoint
- ✅ User data deletion endpoint
- ✅ Consent management
- ✅ Data encryption

### HIPAA Compliance (if needed)
- ✅ Encryption in transit (TLS)
- ✅ Encryption at rest
- ✅ Access controls
- ✅ Audit logs

### PCI DSS Compliance (if handling payments)
- ✅ Secure authentication
- ✅ Data encryption
- ✅ Network segmentation
- ✅ Regular assessments

---

## Health Checks & Readiness

### Kubernetes Health Probe
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 8081
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8081
  initialDelaySeconds: 20
  periodSeconds: 5
```

### Health Endpoint Response
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "redis": {
      "status": "UP"
    },
    "kafkaProducer": {
      "status": "UP"
    }
  }
}
```

---

## Documentation

For more detailed information:
- See `QUICK_START.md` for local development setup
- See `LOGIN_REGISTRATION_IMPLEMENTATION.md` for technical details
- See `API_SPECIFICATIONS.md` for API contract details
- See `IMPLEMENTATION_SUMMARY.md` for feature overview
