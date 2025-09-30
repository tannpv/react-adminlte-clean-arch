# Clean Architecture API

This is a NestJS application built with Domain-Driven Design (DDD) principles and Clean Architecture patterns.

## 🏗️ Architecture Overview

```
apps/api/src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── config/                    # Environment and configuration
├── infrastructure/            # Cross-cutting adapters
│   ├── observability/         # Logging, tracing
│   ├── database/              # TypeORM data-source, migrations
│   └── messaging/             # Message queues (placeholder)
├── modules/                   # Domain modules
│   ├── carrier/               # Carrier management
│   │   ├── api/               # Controllers, DTOs, filters
│   │   ├── application/       # Use cases, services
│   │   ├── domain/            # Entities, value objects, events
│   │   ├── infrastructure/    # Repositories, adapters
│   │   └── tests/             # Unit and integration tests
│   ├── customer/              # Customer management
│   └── pricing/               # Pricing (future sprint)
└── shared/                    # Shared components
    ├── kernel/                # Base abstractions
    ├── utils/                 # Helper libraries
    └── dto/                   # Common DTOs, pagination
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Update `.env` with your database credentials

4. Run the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📊 API Endpoints

### Carriers
- `GET /api/v1/carriers` - List all carriers
- `POST /api/v1/carriers` - Create a new carrier
- `GET /api/v1/carriers/:id` - Get carrier by ID
- `PATCH /api/v1/carriers/:id` - Update carrier
- `DELETE /api/v1/carriers/:id` - Delete carrier
- `GET /api/v1/carriers/active` - Get active carriers

### Customers
- `GET /api/v1/customers` - List all customers
- `POST /api/v1/customers` - Create a new customer
- `GET /api/v1/customers/:id` - Get customer by ID
- `PATCH /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer
- `GET /api/v1/customers/active` - Get active customers
- `GET /api/v1/customers/email/:email` - Get customer by email

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/infrastructure/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🏛️ Architecture Principles

### Domain-Driven Design (DDD)
- **Entities**: Core business objects with identity
- **Value Objects**: Immutable objects without identity
- **Domain Events**: Business events that occur in the domain
- **Repositories**: Abstract data access patterns

### Clean Architecture
- **Dependency Inversion**: Dependencies point inward
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to unit test and mock dependencies

### SOLID Principles
- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable
- **Interface Segregation**: Many specific interfaces are better than one general
- **Dependency Inversion**: Depend on abstractions, not concretions

## 🔧 Development

### Code Style
- Use TypeScript strict mode
- Follow NestJS conventions
- Use class-validator for DTOs
- Implement proper error handling
- Write comprehensive tests

### Adding New Modules

1. Create domain entity in `modules/{module}/domain/entities/`
2. Create repository interface in `modules/{module}/domain/repositories/`
3. Create DTOs in `modules/{module}/application/dto/`
4. Create service in `modules/{module}/application/services/`
5. Create controller in `modules/{module}/api/`
6. Create module file in `modules/{module}/`
7. Import module in `app.module.ts`

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
