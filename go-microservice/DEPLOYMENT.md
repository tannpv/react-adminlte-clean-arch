# Go Microservice Deployment Guide

## Prerequisites

- Go 1.21 or higher
- Docker and Docker Compose
- PostgreSQL 15 or higher (if not using Docker)

## Local Development Setup

### 1. Clone and Setup

```bash
git clone <repository-url>
cd go-microservice
```

### 2. Install Dependencies

```bash
go mod tidy
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Server Configuration
SERVER_PORT=8080
SERVER_GIN_MODE=debug

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=go_microservice
DB_SSL_MODE=disable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=console
```

### 4. Start Database

Using Docker Compose:
```bash
docker-compose up -d postgres
```

Or manually with PostgreSQL:
```bash
# Create database
createdb go_microservice

# Or using psql
psql -U postgres -c "CREATE DATABASE go_microservice;"
```

### 5. Run the Application

```bash
go run cmd/server/main.go
```

The server will start on `http://localhost:8080`

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t go-microservice .
```

### 2. Run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Go microservice on port 8080

### 3. Check Logs

```bash
docker-compose logs -f go-microservice
```

## Production Deployment

### 1. Environment Variables

Set the following environment variables for production:

```bash
export SERVER_PORT=8080
export SERVER_GIN_MODE=release
export DB_HOST=your-db-host
export DB_PORT=5432
export DB_USER=your-db-user
export DB_PASSWORD=your-secure-password
export DB_NAME=go_microservice
export DB_SSL_MODE=require
export JWT_SECRET=your-very-secure-jwt-secret
export JWT_EXPIRES_IN=24h
export LOG_LEVEL=info
export LOG_FORMAT=json
```

### 2. Database Setup

Ensure PostgreSQL is running and create the database:

```sql
CREATE DATABASE go_microservice;
CREATE USER go_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE go_microservice TO go_user;
```

### 3. Build and Run

```bash
# Build the application
go build -o bin/server cmd/server/main.go

# Run the application
./bin/server
```

### 4. Using Docker in Production

```bash
# Build production image
docker build -t go-microservice:latest .

# Run with production environment
docker run -d \
  --name go-microservice \
  -p 8080:8080 \
  -e SERVER_GIN_MODE=release \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-secure-password \
  -e JWT_SECRET=your-very-secure-jwt-secret \
  go-microservice:latest
```

## Health Checks

### Application Health

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok"
}
```

### Database Health

The application will automatically check database connectivity on startup. If the database is not available, the application will fail to start.

## Monitoring and Logging

### Logs

The application uses structured logging with Zap. Logs are written to stdout in JSON format in production.

### Metrics

Currently, no metrics are exposed. Consider adding Prometheus metrics for production monitoring.

## Security Considerations

### 1. JWT Secret

- Use a strong, random JWT secret
- Store it securely (environment variables, secret management system)
- Rotate regularly

### 2. Database Security

- Use SSL/TLS for database connections in production
- Use strong passwords
- Limit database user permissions
- Enable database logging and monitoring

### 3. CORS

Configure CORS appropriately for your frontend domains:

```go
// In middleware/cors.go
config.AllowOrigins = []string{"https://yourdomain.com"}
```

### 4. Rate Limiting

Consider implementing rate limiting for production:

```go
// Example with gin-rate-limit
import "github.com/ulule/limiter/v3"
```

## Scaling

### Horizontal Scaling

The application is stateless and can be scaled horizontally:

1. Run multiple instances behind a load balancer
2. Use a shared database
3. Consider using Redis for session storage if needed

### Database Scaling

- Use read replicas for read-heavy workloads
- Consider database connection pooling
- Monitor database performance

## Backup and Recovery

### Database Backups

```bash
# Create backup
pg_dump -h localhost -U postgres go_microservice > backup.sql

# Restore backup
psql -h localhost -U postgres go_microservice < backup.sql
```

### Application Backups

- Store application code in version control
- Keep configuration files secure
- Document deployment procedures

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database is running
   - Verify connection parameters
   - Check network connectivity

2. **JWT Token Invalid**
   - Verify JWT secret matches
   - Check token expiration
   - Ensure proper token format

3. **Port Already in Use**
   - Change SERVER_PORT in environment
   - Kill existing process: `lsof -ti:8080 | xargs kill`

### Logs

Check application logs for detailed error information:

```bash
# Docker logs
docker-compose logs go-microservice

# System logs
journalctl -u go-microservice -f
```

## Performance Optimization

### 1. Database Optimization

- Add appropriate indexes
- Use connection pooling
- Monitor slow queries

### 2. Application Optimization

- Enable GOMAXPROCS
- Use pprof for profiling
- Consider caching strategies

### 3. Infrastructure Optimization

- Use CDN for static assets
- Implement caching layers
- Monitor resource usage
