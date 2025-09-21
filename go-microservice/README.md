# Go Microservice with Clean Architecture

A clean architecture microservice built with Go by Southern Martin, following the same patterns as the React AdminLTE project.

## Architecture

This microservice follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Business entities, repository interfaces, domain services, and events
- **Application Layer**: DTOs, application services, and mappers
- **Infrastructure Layer**: HTTP handlers, database implementations, middleware, and configuration
- **Shared Layer**: Common utilities, errors, and constants

## Project Structure

```
go-microservice/
├── cmd/server/                 # Application entry point
├── internal/
│   ├── domain/                # Domain layer
│   │   ├── entities/          # Business entities
│   │   ├── repositories/      # Repository interfaces
│   │   ├── services/          # Domain services
│   │   └── events/            # Domain events
│   ├── application/           # Application layer
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── services/          # Application services
│   │   └── mappers/           # Entity-DTO mappers
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── http/              # HTTP handlers and middleware
│   │   ├── persistence/       # Database implementations
│   │   ├── messaging/         # Event bus and messaging
│   │   └── config/            # Configuration management
│   └── shared/                # Shared utilities
│       ├── errors/            # Custom error types
│       ├── utils/             # Utility functions
│       └── constants/         # Application constants
├── api/                       # API definitions (OpenAPI, gRPC)
├── migrations/                # Database migrations
├── docker/                    # Docker configurations
├── scripts/                   # Build and deployment scripts
└── pkg/                       # Public packages (if needed)
```

## Features

- **Clean Architecture**: Clear separation of concerns with dependency inversion
- **JWT Authentication**: Secure token-based authentication
- **Database Integration**: PostgreSQL with GORM ORM
- **Event-Driven**: Domain events with event bus
- **Logging**: Structured logging with Zap
- **Configuration**: Environment-based configuration with Viper
- **Testing**: Unit and integration tests with mocks
- **Docker Support**: Containerization ready
- **API Documentation**: OpenAPI/Swagger documentation

## Quick Start

1. **Install Dependencies**:
   ```bash
   go mod tidy
   ```

2. **Set up Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the Application**:
   ```bash
   go run cmd/server/main.go
   ```

4. **Access the API**:
   - Health Check: `GET http://localhost:8080/health`
   - API Base: `http://localhost:8080/api/v1`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Users (Protected)
- `GET /api/v1/users` - List users with search
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Products (Protected)
- `GET /api/v1/products` - List products with search
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

## Development

### Running Tests
```bash
go test ./...
```

### Building
```bash
go build -o bin/server cmd/server/main.go
```

### Docker
```bash
docker build -t go-microservice .
docker run -p 8080:8080 go-microservice
```

## Dependencies

- **Gin**: HTTP web framework
- **GORM**: ORM library for database operations
- **Zap**: Structured logging
- **Viper**: Configuration management
- **JWT**: JSON Web Token authentication
- **UUID**: UUID generation
- **EventBus**: Event-driven architecture

## License

MIT License
