# Multi-Service JWT Authentication Setup

This example shows how to set up JWT token sharing across multiple microservices.

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
                    │   Frontend App  │
                    │   (Port 3000)   │
                    └─────────────────┘
```

## 📁 **Project Structure**

```
microservices/
├── auth-service/
│   ├── cmd/server/main.go
│   ├── .env
│   └── ...
├── user-service/
│   ├── cmd/server/main.go
│   ├── .env
│   └── ...
├── product-service/
│   ├── cmd/server/main.go
│   ├── .env
│   └── ...
├── docker-compose.yml
└── keys/
    ├── private.pem
    └── public.pem
```

## 🔧 **Configuration Files**

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

# JWT Configuration (Signs tokens)
JWT_ALGORITHM=RS256
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_EXPIRES_IN=24h
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=console
```

### **User Service (.env)**
```bash
# Server Configuration
SERVER_PORT=8080
SERVER_GIN_MODE=debug

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=user_service
DB_SSL_MODE=disable

# JWT Configuration (Verifies tokens)
JWT_ALGORITHM=RS256
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=console
```

### **Product Service (.env)**
```bash
# Server Configuration
SERVER_PORT=8080
SERVER_GIN_MODE=debug

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=product_service
DB_SSL_MODE=disable

# JWT Configuration (Verifies tokens)
JWT_ALGORITHM=RS256
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ISSUER=southern-martin-auth
JWT_AUDIENCE=southern-martin-apis

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=console
```

## 🐳 **Docker Compose Setup**

```yaml
version: '3.8'

services:
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
      - JWT_ALGORITHM=RS256
      - JWT_PRIVATE_KEY_PATH=./keys/private.pem
    volumes:
      - ./keys:/app/keys
    depends_on:
      - postgres

  user-service:
    build: ./user-service
    ports:
      - "8081:8080"
    environment:
      - DB_HOST=postgres
      - JWT_ALGORITHM=RS256
      - JWT_PUBLIC_KEY_PATH=./keys/public.pem
    volumes:
      - ./keys:/app/keys
    depends_on:
      - postgres

  product-service:
    build: ./product-service
    ports:
      - "8082:8080"
    environment:
      - DB_HOST=postgres
      - JWT_ALGORITHM=RS256
      - JWT_PUBLIC_KEY_PATH=./keys/public.pem
    volumes:
      - ./keys:/app/keys
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## 🚀 **Usage Example**

### **1. Start Services**
```bash
# Generate RSA keys
./scripts/generate_keys.sh

# Start all services
docker-compose up -d
```

### **2. Login to Auth Service**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### **3. Use Token with User Service**
```bash
curl -X GET http://localhost:8081/api/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **4. Use Token with Product Service**
```bash
curl -X GET http://localhost:8082/api/v1/products \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🔄 **Frontend Integration**

### **JavaScript Example**
```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:8080';
    this.token = localStorage.getItem('jwt_token');
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('jwt_token', this.token);
    }
    return data;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Use with any service
  async getUsers() {
    return this.makeAuthenticatedRequest('http://localhost:8081/api/v1/users');
  }

  async getProducts() {
    return this.makeAuthenticatedRequest('http://localhost:8082/api/v1/products');
  }
}

// Usage
const auth = new AuthService();

// Login once
await auth.login('user@example.com', 'password123');

// Use token across all services
const users = await auth.getUsers();
const products = await auth.getProducts();
```

## 🛡️ **Security Considerations**

### **1. Token Storage**
- Store tokens securely (httpOnly cookies in production)
- Implement token refresh mechanism
- Set appropriate expiration times

### **2. Key Management**
- Keep private keys secure
- Rotate keys regularly
- Use environment variables for key paths

### **3. Network Security**
- Use HTTPS in production
- Implement rate limiting
- Monitor authentication failures

### **4. Token Validation**
- Always validate token signature
- Check expiration time
- Verify issuer and audience

## 🔧 **Development Tips**

### **1. Local Development**
```bash
# Use shared secret for simplicity
JWT_SECRET=your-development-secret
JWT_ALGORITHM=HS256
```

### **2. Testing**
```bash
# Test token sharing
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' | jq -r .token)

# Test with user service
curl -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/v1/users

# Test with product service
curl -H "Authorization: Bearer $TOKEN" http://localhost:8082/api/v1/products
```

### **3. Debugging**
- Check token payload at jwt.io
- Verify key files are accessible
- Check service logs for authentication errors

This setup ensures that users can authenticate once and access all microservices seamlessly while maintaining security and scalability.
