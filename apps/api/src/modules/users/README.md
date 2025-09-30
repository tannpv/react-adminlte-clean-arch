# 👥 Users Module

This module provides comprehensive user and role management functionality following Domain-Driven Design (DDD) and Clean Architecture principles.

## 🏗️ Architecture

```
users/
├── api/                    # API Layer (Controllers)
│   ├── user.controller.ts  # User REST endpoints
│   └── role.controller.ts  # Role REST endpoints
├── application/            # Application Layer
│   ├── dto/               # Data Transfer Objects
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── user-response.dto.ts
│   │   ├── assign-roles.dto.ts
│   │   ├── create-role.dto.ts
│   │   └── update-role.dto.ts
│   └── services/          # Application Services
│       ├── user.service.ts
│       └── role.service.ts
├── domain/                # Domain Layer
│   ├── entities/          # Domain Entities
│   │   ├── user.entity.ts
│   │   └── role.entity.ts
│   ├── events/            # Domain Events
│   │   ├── user-created.event.ts
│   │   ├── user-updated.event.ts
│   │   ├── user-deleted.event.ts
│   │   └── user-role-assigned.event.ts
│   └── repositories/      # Repository Interfaces
│       ├── user.repository.interface.ts
│       └── role.repository.interface.ts
├── infrastructure/        # Infrastructure Layer
│   ├── user.repository.ts # TypeORM User Repository
│   └── role.repository.ts # TypeORM Role Repository
└── users.module.ts        # Module Configuration
```

## 🚀 API Endpoints

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

## 📊 Data Models

### User Entity

```typescript
{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  dateOfBirth?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: Record<string, any>;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Role Entity

```typescript
{
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  permissions?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Features

### User Management
- ✅ Create, read, update, delete users
- ✅ Email uniqueness validation
- ✅ User activation/deactivation
- ✅ Email verification status
- ✅ User preferences and metadata
- ✅ Address information
- ✅ Role assignment and management
- ✅ Search and pagination
- ✅ User statistics and counting

### Role Management
- ✅ Create, read, update, delete roles
- ✅ Role name uniqueness validation
- ✅ Permission-based access control
- ✅ Role activation/deactivation
- ✅ Role metadata and descriptions
- ✅ Search and pagination
- ✅ Role statistics and counting

### Domain Events
- ✅ User created events
- ✅ User updated events
- ✅ User deleted events
- ✅ User role assignment events

### Business Logic
- ✅ Email normalization (lowercase, trim)
- ✅ Full name computation
- ✅ Role-based permission checking
- ✅ Admin user detection
- ✅ User management permissions

## 🎯 Usage Examples

### Create a User

```typescript
POST /api/v1/users
{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "isActive": true,
  "roleIds": [1, 2]
}
```

### Assign Roles to User

```typescript
PATCH /api/v1/users/1/roles
{
  "roleIds": [1, 3, 5]
}
```

### Create a Role

```typescript
POST /api/v1/roles
{
  "name": "admin",
  "description": "Administrator role",
  "permissions": ["users.manage", "roles.manage", "system.admin"],
  "isActive": true
}
```

### Search Users

```typescript
GET /api/v1/users?search=john&page=1&limit=10&sortBy=firstName&sortOrder=ASC
```

## 🔒 Security Considerations

- Email addresses are automatically normalized (lowercase, trimmed)
- Role-based access control for user management operations
- Permission-based authorization for sensitive operations
- Input validation on all endpoints
- SQL injection protection through TypeORM

## 🧪 Testing

The module includes comprehensive test coverage for:
- Domain entities and business logic
- Application services and use cases
- API controllers and endpoints
- Repository implementations
- Domain events

## 📈 Performance

- Efficient database queries with proper indexing
- Pagination support for large datasets
- Lazy loading for related entities
- Optimized search functionality
- Caching support for frequently accessed data

This module provides a solid foundation for user and role management in your microservice architecture! 🎉
