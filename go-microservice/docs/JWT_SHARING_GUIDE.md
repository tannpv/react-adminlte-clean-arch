# JWT Token Sharing Guide for Microservices

This guide explains how to implement shared JWT authentication across multiple microservices in the Southern Martin system.

## 🔐 **Authentication Strategies**

### **1. Shared Secret (Simplest)**

All microservices use the same JWT secret to sign and verify tokens.

#### Configuration
```bash
# .env file for all microservices
JWT_SECRET=your-shared-secret-key-for-all-microservices
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=24h
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis
```

#### Usage
```go
// In your main.go
middleware := shared_auth.SharedAuthMiddleware(cfg.JWT.Secret)
router.Use(middleware)
```

#### Pros
- Simple to implement
- No additional infrastructure
- Fast token verification

#### Cons
- Security risk if one service is compromised
- Hard to rotate secrets across services

---

### **2. RSA Public/Private Key (Recommended)**

Use RS256 algorithm with public/private key pairs.

#### Configuration
```bash
# Auth service (signs tokens)
JWT_ALGORITHM=RS256
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_EXPIRES_IN=24h
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis

# Other services (verify tokens)
JWT_ALGORITHM=RS256
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis
```

#### Generate Keys
```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key
openssl rsa -in private.pem -pubout -out public.pem
```

#### Usage
```go
// Auth service
privateKey, err := cfg.LoadRSAPrivateKey()
token, err := rsa_auth.GenerateRSAToken(userID, email, privateKey, expiresIn)

// Other services
publicKey, err := cfg.LoadRSAPublicKey()
middleware := rsa_auth.RSAAuthMiddleware(publicKey)
router.Use(middleware)
```

#### Pros
- More secure
- Easy to rotate keys
- Services only need public key

#### Cons
- Slightly more complex setup
- Need key management

---

### **3. Centralized Auth Service (Most Scalable)**

One dedicated authentication service that all others trust.

#### Configuration
```bash
# Auth service
JWT_SECRET=your-auth-service-secret
JWT_EXPIRES_IN=24h
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis

# Other services
AUTH_SERVICE_URL=http://auth-service:8080
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis
```

#### Usage
```go
// Other services
authClient := centralized_auth.NewAuthServiceClient(cfg.AuthServiceURL)
middleware := centralized_auth.CentralizedAuthMiddleware(authClient)
router.Use(middleware)
```

#### Auth Service Endpoint
```go
// POST /api/v1/auth/validate
func ValidateToken(c *gin.Context) {
    var req struct {
        Token string `json:"token"`
    }
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request"})
        return
    }
    
    // Validate token logic here
    // Return user info if valid
    
    c.JSON(200, gin.H{
        "valid": true,
        "user_id": "user-id",
        "email": "user@example.com",
    })
}
```

#### Pros
- Centralized user management
- Easy to implement token revocation
- Single source of truth

#### Cons
- Additional service to maintain
- Potential single point of failure

---

## 🚀 **Implementation Steps**

### **Step 1: Choose Your Strategy**

Based on your requirements:
- **Shared Secret**: For simple setups with trusted services
- **RSA Keys**: For production environments requiring security
- **Centralized Auth**: For complex systems with many services

### **Step 2: Update Configuration**

Add JWT configuration to your `.env` files based on chosen strategy.

### **Step 3: Update Main Application**

```go
// In cmd/server/main.go
func setupRouter(cfg *config.Config) *gin.Engine {
    router := gin.New()
    
    // Choose middleware based on configuration
    var authMiddleware gin.HandlerFunc
    
    if cfg.JWT.IsCentralizedAuth() {
        authClient := centralized_auth.NewAuthServiceClient(cfg.AuthServiceURL)
        authMiddleware = centralized_auth.CentralizedAuthMiddleware(authClient)
    } else if cfg.JWT.IsRSAAlgorithm() {
        publicKey, err := cfg.LoadRSAPublicKey()
        if err != nil {
            log.Fatal("Failed to load public key:", err)
        }
        authMiddleware = rsa_auth.RSAAuthMiddleware(publicKey)
    } else {
        authMiddleware = shared_auth.SharedAuthMiddleware(cfg.JWT.Secret)
    }
    
    // Apply middleware to protected routes
    protected := router.Group("/api/v1")
    protected.Use(authMiddleware)
    {
        // Your protected routes here
    }
    
    return router
}
```

### **Step 4: Test Token Sharing**

1. Login to one service to get a token
2. Use the same token to access other services
3. Verify user context is available in all services

---

## 🔧 **Docker Compose Example**

```yaml
version: '3.8'
services:
  auth-service:
    build: ./auth-service
    environment:
      - JWT_SECRET=shared-secret-key
      - JWT_ALGORITHM=HS256
    ports:
      - "8080:8080"
  
  user-service:
    build: ./user-service
    environment:
      - JWT_SECRET=shared-secret-key
      - JWT_ALGORITHM=HS256
    ports:
      - "8081:8080"
  
  product-service:
    build: ./product-service
    environment:
      - JWT_SECRET=shared-secret-key
      - JWT_ALGORITHM=HS256
    ports:
      - "8082:8080"
```

---

## 🛡️ **Security Best Practices**

1. **Use HTTPS** in production
2. **Rotate secrets/keys** regularly
3. **Set appropriate token expiration** times
4. **Validate token audience** and issuer
5. **Implement token revocation** for centralized auth
6. **Monitor authentication failures**
7. **Use strong secrets/keys** (minimum 256-bit)

---

## 📝 **Token Structure**

All tokens should include:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "southern-martin-auth",
  "aud": "southern-martin-apis"
}
```

This ensures consistent user identification across all microservices.
