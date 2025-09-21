# Redis JWT Setup Example

This example shows how to implement JWT token management with Redis for session storage and token revocation.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  User Service   │    │ Product Service │
│   (Port 8080)   │    │   (Port 8081)   │    │   (Port 8082)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Port 6379)   │
                    └─────────────────┘
```

## 🐳 **Docker Compose Setup**

```yaml
version: '3.8'

services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  auth-service:
    build: ./auth-service
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your-jwt-secret
      - JWT_ALGORITHM=HS256
    depends_on:
      - postgres
      - redis
    volumes:
      - ./keys:/app/keys

  user-service:
    build: ./user-service
    ports:
      - "8081:8080"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your-jwt-secret
      - JWT_ALGORITHM=HS256
    depends_on:
      - postgres
      - redis

  product-service:
    build: ./product-service
    ports:
      - "8082:8080"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your-jwt-secret
      - JWT_ALGORITHM=HS256
    depends_on:
      - postgres
      - redis

volumes:
  redis_data:
  postgres_data:
```

## 🔧 **Environment Configuration**

### **Auth Service (.env)**
```bash
# Server Configuration
SERVER_PORT=8080
SERVER_GIN_MODE=debug

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=auth_service
DB_SSL_MODE=disable

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_POOL_SIZE=10
REDIS_MIN_IDLE_CONNS=5

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=24h
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=console
```

### **Other Services (.env)**
```bash
# Same configuration as auth service
# But with different service ports and database names
SERVER_PORT=8080
DB_NAME=user_service  # or product_service
# ... rest of config same
```

## 🚀 **Implementation Example**

### **Updated Main Application**

```go
// cmd/server/main.go
package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/southern-martin/go-microservice/internal/infrastructure/config"
    "github.com/southern-martin/go-microservice/internal/infrastructure/services"
    "github.com/southern-martin/go-microservice/internal/infrastructure/http/middleware"
)

func main() {
    // Load configuration
    cfg, err := config.LoadConfig()
    if err != nil {
        log.Fatal("Failed to load config:", err)
    }

    // Initialize Redis
    redisService, err := services.NewRedisService(cfg.Redis)
    if err != nil {
        log.Fatal("Failed to connect to Redis:", err)
    }
    defer redisService.Close()

    // Initialize Redis auth middleware
    redisAuth := middleware.NewRedisAuthMiddleware(redisService.GetClient(), cfg.JWT.Secret)

    // Setup router
    router := setupRouter(redisAuth)

    // Start server
    startServer(cfg, router)
}

func setupRouter(redisAuth *middleware.RedisAuthMiddleware) *gin.Engine {
    router := gin.New()
    
    // Middleware
    router.Use(gin.Logger())
    router.Use(gin.Recovery())
    router.Use(middleware.CORSMiddleware())

    // Health check
    router.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    // API routes
    api := router.Group("/api/v1")
    {
        // Auth routes (no auth required)
        auth := api.Group("/auth")
        {
            auth.POST("/login", loginHandler)
            auth.POST("/register", registerHandler)
            auth.POST("/logout", logoutHandler)
            auth.POST("/revoke", revokeHandler)
        }

        // Protected routes with Redis auth
        protected := api.Group("/")
        protected.Use(redisAuth.AuthMiddleware())
        {
            // User routes
            users := protected.Group("/users")
            {
                users.GET("", listUsersHandler)
                users.GET("/:id", getUserHandler)
                users.PUT("/:id", updateUserHandler)
                users.DELETE("/:id", deleteUserHandler)
            }

            // Product routes
            products := protected.Group("/products")
            {
                products.GET("", listProductsHandler)
                products.GET("/:id", getProductHandler)
                products.POST("", createProductHandler)
                products.PUT("/:id", updateProductHandler)
                products.DELETE("/:id", deleteProductHandler)
            }
        }
    }

    return router
}
```

### **Login Handler with Redis Session**

```go
// handlers/auth_handler.go
func loginHandler(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request"})
        return
    }

    // Validate user credentials
    user, err := userService.ValidateUser(req.Email, req.Password)
    if err != nil {
        c.JSON(401, gin.H{"error": "Invalid credentials"})
        return
    }

    // Create session in Redis
    sessionID, err := redisAuth.CreateSession(
        user.ID,
        user.Email,
        user.Name,
        user.Roles,
        24*time.Hour, // Session expiration
    )
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create session"})
        return
    }

    // Generate JWT token with session ID
    token, err := generateJWTWithSession(sessionID, user.ID, user.Email)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to generate token"})
        return
    }

    c.JSON(200, gin.H{
        "token": token,
        "user": gin.H{
            "id":    user.ID,
            "email": user.Email,
            "name":  user.Name,
        },
    })
}
```

### **Logout Handler**

```go
func logoutHandler(c *gin.Context) {
    // Get session ID from JWT token
    sessionID := c.GetString("session_id")
    if sessionID == "" {
        c.JSON(400, gin.H{"error": "No active session"})
        return
    }

    // Revoke session in Redis
    err := redisAuth.RevokeSession(sessionID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to logout"})
        return
    }

    c.JSON(200, gin.H{"message": "Logged out successfully"})
}
```

## 🧪 **Testing the Setup**

### **1. Start Services**
```bash
docker-compose up -d
```

### **2. Test Login**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **3. Use Token with Different Services**
```bash
# Get token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test with user service
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/api/v1/users

# Test with product service
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8082/api/v1/products
```

### **4. Test Token Revocation**
```bash
# Logout (revokes token)
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Try to use revoked token (should fail)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/api/v1/users
```

## 🔍 **Redis Session Data**

### **Session Structure**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test@example.com",
  "name": "Test User",
  "roles": ["user"],
  "created_at": "2024-01-01T00:00:00Z",
  "last_seen": "2024-01-01T12:00:00Z"
}
```

### **Redis Keys**
```
session:sess_1234567890_abcdef1234567890
```

### **Redis Commands**
```bash
# Connect to Redis
redis-cli

# List all sessions
KEYS session:*

# Get session data
GET session:sess_1234567890_abcdef1234567890

# Check session TTL
TTL session:sess_1234567890_abcdef1234567890

# Delete session
DEL session:sess_1234567890_abcdef1234567890
```

## 🛡️ **Security Features**

### **Token Revocation**
- Instantly revoke tokens by deleting Redis sessions
- Support for revoking all user sessions
- Automatic cleanup of expired sessions

### **Session Management**
- Track user login sessions
- Monitor last seen timestamps
- Support for multiple device sessions

### **Security Monitoring**
- Log authentication attempts
- Monitor session activity
- Track suspicious behavior

## 📊 **Performance Considerations**

### **Redis Optimization**
- Use connection pooling
- Implement local caching
- Monitor Redis performance
- Set appropriate TTL values

### **Caching Strategy**
```go
// Cache user data locally for performance
type UserCache struct {
    UserID    string
    Email     string
    Name      string
    CachedAt  time.Time
    TTL       time.Duration
}

// Check local cache first, then Redis
func getUserData(sessionID string) (*UserData, error) {
    // Check local cache
    if cached := getFromLocalCache(sessionID); cached != nil {
        return cached, nil
    }
    
    // Check Redis
    userData, err := getFromRedis(sessionID)
    if err != nil {
        return nil, err
    }
    
    // Cache locally
    setLocalCache(sessionID, userData)
    return userData, nil
}
```

## 🔄 **Migration from Stateless**

### **Step 1: Deploy Redis**
```bash
docker-compose up -d redis
```

### **Step 2: Update Configuration**
```bash
# Add Redis config to .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **Step 3: Update Code**
```go
// Replace stateless middleware with Redis middleware
// old: router.Use(StatelessAuthMiddleware(jwtSecret))
// new: router.Use(redisAuth.AuthMiddleware())
```

### **Step 4: Test Migration**
```bash
# Test existing tokens still work
# Test new login creates Redis sessions
# Test logout revokes sessions
```

This Redis JWT setup provides enterprise-grade session management with token revocation capabilities while maintaining the benefits of JWT tokens for microservice communication.
