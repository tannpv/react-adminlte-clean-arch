# 🏗️ New Microservice Architecture Structure

## 📊 High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🎯 CLEAN ARCHITECTURE LAYERS                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        🌐 API LAYER (Controllers)                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │   │
│  │  │ CarrierController│  │CustomerController│  │ PricingController│         │   │
│  │  │                 │  │                 │  │   (Future)      │         │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    🔧 APPLICATION LAYER (Services)                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │   │
│  │  │ CarrierService  │  │ CustomerService │  │ PricingService  │         │   │
│  │  │                 │  │                 │  │   (Future)      │         │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      🏛️ DOMAIN LAYER (Core Business)                    │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │   │
│  │  │ Carrier Entity  │  │ Customer Entity │  │ Pricing Entity  │         │   │
│  │  │ Domain Events   │  │ Domain Events   │  │   (Future)      │         │   │
│  │  │ Repositories    │  │ Repositories    │  │                 │         │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                  🔌 INFRASTRUCTURE LAYER (Adapters)                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │   │
│  │  │ Database        │  │ Observability   │  │ Messaging       │         │   │
│  │  │ TypeORM         │  │ Logging         │  │ (Placeholder)   │         │   │
│  │  │ MySQL           │  │ Tracing         │  │                 │         │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure Diagram

```
apps/api/src/
├── 🚀 main.ts                           # Application Bootstrap
├── 📦 app.module.ts                     # Root Module Configuration
│
├── ⚙️ config/                           # Configuration Management
│   ├── database.config.ts               # Database Configuration
│   └── app.config.ts                    # Application Configuration
│
├── 🔌 infrastructure/                   # Cross-Cutting Adapters
│   ├── 📊 observability/                # Logging & Monitoring
│   │   └── observability.module.ts      # Observability Module
│   ├── 🗄️ database/                     # Data Persistence
│   │   └── database.module.ts           # Database Module
│   └── 📨 messaging/                    # Inter-Service Communication
│       └── messaging.module.ts          # Messaging Module (Placeholder)
│
├── 🏛️ modules/                          # Domain Modules (DDD)
│   ├── 🚛 carrier/                      # Carrier Management Domain
│   │   ├── 🌐 api/                      # API Layer
│   │   │   └── carrier.controller.ts    # Carrier REST Controller
│   │   ├── 🔧 application/              # Application Layer
│   │   │   ├── dto/                     # Data Transfer Objects
│   │   │   │   ├── create-carrier.dto.ts
│   │   │   │   ├── update-carrier.dto.ts
│   │   │   │   └── carrier-response.dto.ts
│   │   │   └── services/                # Application Services
│   │   │       └── carrier.service.ts   # Carrier Business Logic
│   │   ├── 🏛️ domain/                   # Domain Layer
│   │   │   ├── entities/                # Domain Entities
│   │   │   │   └── carrier.entity.ts    # Carrier Entity
│   │   │   ├── repositories/            # Repository Interfaces
│   │   │   │   └── carrier.repository.interface.ts
│   │   │   └── events/                  # Domain Events
│   │   │       └── carrier-created.event.ts
│   │   ├── 🔌 infrastructure/           # Infrastructure Layer
│   │   │   └── (TypeORM Repositories)   # Data Access Implementation
│   │   ├── 🧪 tests/                    # Test Suite
│   │   └── carrier.module.ts            # Carrier Module
│   │
│   ├── 👥 customer/                     # Customer Management Domain
│   │   ├── 🌐 api/                      # API Layer
│   │   │   └── customer.controller.ts   # Customer REST Controller
│   │   ├── 🔧 application/              # Application Layer
│   │   │   ├── dto/                     # Data Transfer Objects
│   │   │   │   ├── create-customer.dto.ts
│   │   │   │   ├── update-customer.dto.ts
│   │   │   │   └── customer-response.dto.ts
│   │   │   └── services/                # Application Services
│   │   │       └── customer.service.ts  # Customer Business Logic
│   │   ├── 🏛️ domain/                   # Domain Layer
│   │   │   ├── entities/                # Domain Entities
│   │   │   │   └── customer.entity.ts   # Customer Entity
│   │   │   ├── repositories/            # Repository Interfaces
│   │   │   └── events/                  # Domain Events
│   │   ├── 🔌 infrastructure/           # Infrastructure Layer
│   │   ├── 🧪 tests/                    # Test Suite
│   │   └── customer.module.ts           # Customer Module
│   │
│   └── 💰 pricing/                      # Pricing Domain (Future Sprint)
│       ├── 🌐 api/                      # API Layer (Placeholder)
│       ├── 🔧 application/              # Application Layer (Placeholder)
│       ├── 🏛️ domain/                   # Domain Layer (Placeholder)
│       ├── 🔌 infrastructure/           # Infrastructure Layer (Placeholder)
│       ├── 🧪 tests/                    # Test Suite (Placeholder)
│       └── pricing.module.ts            # Pricing Module (Placeholder)
│
└── 🔗 shared/                           # Shared Components
    ├── 🏗️ kernel/                       # Base Abstractions
    │   ├── base.entity.ts               # Base Entity Class
    │   ├── result.ts                    # Result Pattern
    │   ├── domain-event.ts              # Domain Event Base
    │   └── index.ts                     # Kernel Exports
    ├── 🛠️ utils/                        # Utility Functions
    │   └── index.ts                     # Helper Functions
    ├── 📋 dto/                          # Common DTOs
    │   ├── pagination.dto.ts            # Pagination DTOs
    │   └── index.ts                     # DTO Exports
    └── shared.module.ts                 # Shared Module
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              🔄 REQUEST FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  📱 Client Request                                                              │
│         │                                                                       │
│         ▼                                                                       │
│  🌐 API Controller (CarrierController)                                         │
│         │                                                                       │
│         ▼                                                                       │
│  🔧 Application Service (CarrierService)                                       │
│         │                                                                       │
│         ▼                                                                       │
│  🏛️ Domain Entity (Carrier)                                                    │
│         │                                                                       │
│         ▼                                                                       │
│  🔌 Infrastructure (TypeORM Repository)                                        │
│         │                                                                       │
│         ▼                                                                       │
│  🗄️ Database (MySQL)                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              🔄 RESPONSE FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  🗄️ Database (MySQL)                                                           │
│         │                                                                       │
│         ▼                                                                       │
│  🔌 Infrastructure (TypeORM Repository)                                        │
│         │                                                                       │
│         ▼                                                                       │
│  🏛️ Domain Entity (Carrier)                                                    │
│         │                                                                       │
│         ▼                                                                       │
│  🔧 Application Service (CarrierService)                                       │
│         │                                                                       │
│         ▼                                                                       │
│  📋 DTO (CarrierResponseDto)                                                   │
│         │                                                                       │
│         ▼                                                                       │
│  🌐 API Controller (CarrierController)                                         │
│         │                                                                       │
│         ▼                                                                       │
│  📱 Client Response                                                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Domain Module Structure (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🚛 CARRIER MODULE DETAIL                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           🌐 API LAYER                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ CarrierController                                               │   │   │
│  │  │ ├── POST   /api/v1/carriers          (create)                   │   │   │
│  │  │ ├── GET    /api/v1/carriers          (findAll)                  │   │   │
│  │  │ ├── GET    /api/v1/carriers/:id      (findOne)                  │   │   │
│  │  │ ├── PATCH  /api/v1/carriers/:id      (update)                   │   │   │
│  │  │ ├── DELETE /api/v1/carriers/:id      (remove)                   │   │   │
│  │  │ └── GET    /api/v1/carriers/active   (findActive)               │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      🔧 APPLICATION LAYER                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ CarrierService                                                  │   │   │
│  │  │ ├── create(carrierDto) → CarrierResponseDto                     │   │   │
│  │  │ ├── findAll(pagination) → PaginatedResponseDto                  │   │   │
│  │  │ ├── findOne(id) → CarrierResponseDto                            │   │   │
│  │  │ ├── update(id, dto) → CarrierResponseDto                        │   │   │
│  │  │ ├── remove(id) → void                                           │   │   │
│  │  │ └── findActive() → CarrierResponseDto[]                         │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ DTOs                                                            │   │   │
│  │  │ ├── CreateCarrierDto (Input)                                   │   │   │
│  │  │ ├── UpdateCarrierDto (Input)                                   │   │   │
│  │  │ └── CarrierResponseDto (Output)                                │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         🏛️ DOMAIN LAYER                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Carrier Entity                                                  │   │   │
│  │  │ ├── id: number                                                  │   │   │
│  │  │ ├── name: string (unique)                                       │   │   │
│  │  │ ├── description: string                                         │   │   │
│  │  │ ├── isActive: boolean                                           │   │   │
│  │  │ ├── contactEmail: string                                        │   │   │
│  │  │ ├── contactPhone: string                                        │   │   │
│  │  │ ├── metadata: Record<string, any>                               │   │   │
│  │  │ ├── createdAt: Date                                             │   │   │
│  │  │ └── updatedAt: Date                                             │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Domain Events                                                   │   │   │
│  │  │ └── CarrierCreatedEvent                                         │   │   │
│  │  │     ├── carrierId: number                                       │   │   │
│  │  │     ├── carrierName: string                                     │   │   │
│  │  │     └── createdBy: number                                       │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Repository Interface                                            │   │   │
│  │  │ ├── findAll(): Promise<Carrier[]>                               │   │   │
│  │  │ ├── findById(id): Promise<Carrier | null>                       │   │   │
│  │  │ ├── findByName(name): Promise<Carrier | null>                   │   │   │
│  │  │ ├── create(carrier): Promise<Carrier>                           │   │   │
│  │  │ ├── update(id, carrier): Promise<Carrier>                       │   │   │
│  │  │ ├── delete(id): Promise<void>                                   │   │   │
│  │  │ └── findActive(): Promise<Carrier[]>                            │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    🔌 INFRASTRUCTURE LAYER                             │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ TypeORM Repository Implementation                               │   │   │
│  │  │ ├── Database Connection (MySQL)                                │   │   │
│  │  │ ├── Entity Mapping                                             │   │   │
│  │  │ ├── Query Building                                             │   │   │
│  │  │ └── Transaction Management                                     │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Shared Components

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🔗 SHARED COMPONENTS                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           🏗️ KERNEL                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ BaseEntity                                                      │   │   │
│  │  │ ├── id: number (Primary Key)                                    │   │   │
│  │  │ ├── createdAt: Date                                             │   │   │
│  │  │ └── updatedAt: Date                                             │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Result<T> Pattern                                               │   │   │
│  │  │ ├── isSuccess: boolean                                          │   │   │
│  │  │ ├── isFailure: boolean                                          │   │   │
│  │  │ ├── error: string | null                                        │   │   │
│  │  │ ├── getValue(): T                                               │   │   │
│  │  │ ├── getErrorValue(): string                                     │   │   │
│  │  │ ├── static ok<U>(value?): Result<U>                             │   │   │
│  │  │ └── static fail<U>(error): Result<U>                            │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ DomainEvent                                                     │   │   │
│  │  │ ├── occurredOn: Date                                            │   │   │
│  │  │ └── eventId: string                                             │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           📋 DTOs                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ PaginationDto                                                   │   │   │
│  │  │ ├── page?: number (default: 1)                                  │   │   │
│  │  │ ├── limit?: number (default: 10)                                │   │   │
│  │  │ ├── search?: string                                             │   │   │
│  │  │ ├── sortBy?: string                                             │   │   │
│  │  │ └── sortOrder?: 'ASC' | 'DESC'                                  │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ PaginatedResponseDto<T>                                         │   │   │
│  │  │ ├── data: T[]                                                   │   │   │
│  │  │ ├── total: number                                               │   │   │
│  │  │ ├── page: number                                                │   │   │
│  │  │ ├── limit: number                                               │   │   │
│  │  │ └── totalPages: number                                          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           🛠️ UTILS                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Utility Functions                                               │   │   │
│  │  │ ├── generateId(): string                                        │   │   │
│  │  │ ├── formatDate(date): string                                    │   │   │
│  │  │ └── isValidEmail(email): boolean                                │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 API Endpoints Summary

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🚀 API ENDPOINTS                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  🚛 CARRIER ENDPOINTS                                                           │
│  ├── POST   /api/v1/carriers          Create new carrier                       │
│  ├── GET    /api/v1/carriers          List carriers (paginated)               │
│  ├── GET    /api/v1/carriers/active   List active carriers                     │
│  ├── GET    /api/v1/carriers/:id      Get carrier by ID                        │
│  ├── PATCH  /api/v1/carriers/:id      Update carrier                           │
│  └── DELETE /api/v1/carriers/:id      Delete carrier                           │
│                                                                                 │
│  👥 CUSTOMER ENDPOINTS                                                          │
│  ├── POST   /api/v1/customers         Create new customer                      │
│  ├── GET    /api/v1/customers         List customers (paginated)              │
│  ├── GET    /api/v1/customers/active  List active customers                    │
│  ├── GET    /api/v1/customers/email/:email  Get customer by email             │
│  ├── GET    /api/v1/customers/:id     Get customer by ID                       │
│  ├── PATCH  /api/v1/customers/:id     Update customer                          │
│  └── DELETE /api/v1/customers/:id     Delete customer                          │
│                                                                                 │
│  💰 PRICING ENDPOINTS (Future Sprint)                                          │
│  └── (To be implemented)                                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Benefits of This Architecture

### 🏛️ **Domain-Driven Design (DDD)**
- **Clear Domain Boundaries**: Each module represents a business domain
- **Rich Domain Models**: Entities contain business logic
- **Domain Events**: Business events for decoupled communication
- **Repository Pattern**: Abstract data access

### 🧩 **Clean Architecture**
- **Dependency Inversion**: Dependencies point inward
- **Separation of Concerns**: Each layer has single responsibility
- **Testability**: Easy to unit test and mock
- **Independence**: Business logic independent of frameworks

### 🚀 **Microservice Ready**
- **Modular Design**: Each domain can become a microservice
- **Loose Coupling**: Modules communicate through interfaces
- **Scalability**: Independent scaling of domains
- **Technology Agnostic**: Easy to change infrastructure

### 🔧 **Maintainability**
- **Consistent Structure**: Same pattern across all modules
- **Clear Naming**: Self-documenting code structure
- **Type Safety**: Full TypeScript support
- **Validation**: Built-in request validation

This architecture provides a solid foundation for building scalable, maintainable, and testable applications following industry best practices! 🎉
