# 🚀 Go Microservice API

A comprehensive microservice API built with Go, following Domain-Driven Design (DDD) and Clean Architecture principles.

## 🏗️ Architecture

```
go-apps/
├── cmd/
│   └── server/
│       └── main.go                    # Application entry point
├── internal/
│   ├── config/                        # Configuration management
│   │   └── config.go                  # App and database configuration
│   ├── infrastructure/                # Cross-cutting adapters
│   │   ├── database/                  # Database connection and migrations
│   │   ├── logger/                    # Structured logging
│   │   └── messaging/                 # Message queues (Redis)
│   ├── modules/                       # Domain modules
│   │   ├── users/                     # User management module
│   │   │   ├── handler/               # HTTP handlers
│   │   │   ├── service/               # Business logic
│   │   │   ├── repository/            # Data access layer
│   │   │   ├── model/                 # Domain models
│   │   │   └── dto/                   # Data transfer objects
│   │   ├── carrier/                   # Carrier management (future)
│   │   ├── customer/                  # Customer management (future)
│   │   └── pricing/                   # Pricing management (future)
│   └── shared/                        # Shared components
│       ├── kernel/                    # Base abstractions
│       ├── utils/                     # Helper libraries
│       └── dto/                       # Common DTOs, pagination
├── pkg/                               # Public packages
├── migrations/                        # Database migrations
├── scripts/                           # Utility scripts
├── docs/                              # Documentation
├── go.mod                            # Go module file
└── go.sum                            # Go module checksums
```

## 🚀 Features

### ✅ Implemented
- **User Management**: Complete CRUD operations for users
- **Role Management**: Complete CRUD operations for roles
- **Role Assignment**: Assign roles to users
- **Search & Pagination**: Advanced querying capabilities
- **Validation**: Comprehensive input validation
- **Logging**: Structured logging with context
- **Database**: GORM with MySQL/PostgreSQL support
- **Configuration**: Environment-based configuration
- **Health Checks**: Application health monitoring

### 🔄 In Progress
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Caching**: Redis caching layer
- **Messaging**: Event-driven architecture

### 📋 Planned
- **Carrier Module**: Carrier management functionality
- **Customer Module**: Customer management functionality
- **Pricing Module**: Pricing management functionality
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Comprehensive test coverage
- **Monitoring**: Metrics and observability
- **Docker**: Containerization support

## 🛠️ Technology Stack

- **Language**: Go 1.21+
- **Framework**: Gin (HTTP router)
- **Database**: GORM with MySQL/PostgreSQL
- **Logging**: Logrus (structured logging)
- **Configuration**: Environment variables
- **Validation**: Gin binding validation
- **Testing**: Testify (planned)

## 📦 Dependencies

### Core Dependencies
- `github.com/gin-gonic/gin` - HTTP web framework
- `gorm.io/gorm` - ORM library
- `gorm.io/driver/mysql` - MySQL driver
- `gorm.io/driver/postgres` - PostgreSQL driver
- `github.com/sirupsen/logrus` - Structured logging
- `github.com/joho/godotenv` - Environment variable loading

### Development Dependencies
- `github.com/stretchr/testify` - Testing framework
- `golang.org/x/crypto` - Cryptographic functions

## 🚀 Getting Started

### Prerequisites
- Go 1.21 or higher
- MySQL 8.0+ or PostgreSQL 13+
- Redis 6.0+ (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd go-apps
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE go_microservice_db;"
   # or
   psql -U postgres -c "CREATE DATABASE go_microservice_db;"
   ```

5. **Run the application**
   ```bash
   go run cmd/server/main.go
   ```

The API will be available at `http://localhost:3001`

## 📊 API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users` | Create a new user |
| `GET` | `/api/v1/users` | List users (paginated) |
| `GET` | `/api/v1/users/active` | List active users |
| `GET` | `/api/v1/users/count` | Get user count |
| `GET` | `/api/v1/users/email/:email` | Get user by email |
| `GET` | `/api/v1/users/role/:roleName` | Get users by role |
| `GET` | `/api/v1/users/exists/:email` | Check if email exists |
| `GET` | `/api/v1/users/:id` | Get user by ID |
| `PATCH` | `/api/v1/users/:id` | Update user |
| `PATCH` | `/api/v1/users/:id/roles` | Assign roles to user |
| `DELETE` | `/api/v1/users/:id` | Delete user |

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/roles` | Create a new role |
| `GET` | `/api/v1/roles` | List roles (paginated) |
| `GET` | `/api/v1/roles/active` | List active roles |
| `GET` | `/api/v1/roles/count` | Get role count |
| `GET` | `/api/v1/roles/permission/:permission` | Get roles by permission |
| `GET` | `/api/v1/roles/name/:name` | Get role by name |
| `GET` | `/api/v1/roles/exists/:name` | Check if role name exists |
| `GET` | `/api/v1/roles/:id` | Get role by ID |
| `PATCH` | `/api/v1/roles/:id` | Update role |
| `DELETE` | `/api/v1/roles/:id` | Delete role |

## 🔧 Configuration

### Environment Variables

```bash
# Application
APP_PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=password
DATABASE_NAME=go_microservice_db
DATABASE_SSL_MODE=disable
DATABASE_MAX_OPEN_CONNS=25
DATABASE_MAX_IDLE_CONNS=25
DATABASE_MAX_LIFETIME=5

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Gin
GIN_MODE=debug
```

## 📝 Usage Examples

### Create a User

```bash
curl -X POST http://localhost:3001/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "is_active": true,
    "role_ids": [1, 2]
  }'
```

### Create a Role

```bash
curl -X POST http://localhost:3001/api/v1/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "description": "Administrator role",
    "permissions": ["users.manage", "roles.manage", "system.admin"],
    "is_active": true
  }'
```

### Get Users with Pagination

```bash
curl "http://localhost:3001/api/v1/users?page=1&limit=10&search=john&sort_by=first_name&sort_order=asc"
```

### Assign Roles to User

```bash
curl -X PATCH http://localhost:3001/api/v1/users/1/roles \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": [1, 3, 5]
  }'
```

## 🧪 Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with verbose output
go test -v ./...
```

## 🐳 Docker Support (Planned)

```bash
# Build Docker image
docker build -t go-apps-api .

# Run with Docker Compose
docker-compose up -d
```

## 📈 Performance

- **Concurrent Requests**: Handles thousands of concurrent requests
- **Database Connection Pooling**: Optimized connection management
- **Memory Efficient**: Low memory footprint
- **Fast Response Times**: Sub-millisecond response times for simple operations

## 🔒 Security

- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: GORM provides protection
- **Environment Variables**: Sensitive data in environment variables
- **Structured Logging**: No sensitive data in logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Go and Clean Architecture principles**
