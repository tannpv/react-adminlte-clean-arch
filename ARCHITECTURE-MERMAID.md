# 🏗️ Professional Architecture Diagrams

## 📊 High-Level Architecture (Mermaid)

```mermaid
graph TB
    subgraph "🌐 Client Layer"
        WEB[Web Frontend]
        MOBILE[Mobile App]
        API_CLIENT[API Client]
    end
    
    subgraph "🎯 API Gateway Layer"
        GATEWAY["API Gateway - Port: 3001"]
    end
    
    subgraph "🏛️ Application Layer"
        subgraph "🚛 Carrier Module"
            C_CTRL[Carrier Controller]
            C_SVC[Carrier Service]
            C_ENTITY[Carrier Entity]
        end
        
        subgraph "👥 Customer Module"
            CU_CTRL[Customer Controller]
            CU_SVC[Customer Service]
            CU_ENTITY[Customer Entity]
        end
        
        subgraph "💰 Pricing Module"
            P_CTRL["Pricing Controller (Future)"]
            P_SVC["Pricing Service (Future)"]
            P_ENTITY["Pricing Entity (Future)"]
        end
    end
    
    subgraph "🔌 Infrastructure Layer"
        DB[(MySQL Database)]
        CACHE[(Redis Cache)]
        LOGS[Logging System]
        MSG["Message Queue (Future)"]
    end
    
    subgraph "🔗 Shared Components"
        KERNEL["Shared Kernel - BaseEntity, Result, Events"]
        DTO["Common DTOs - Pagination, Response"]
        UTILS[Utility Functions]
    end
    
    %% Client connections
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    API_CLIENT --> GATEWAY
    
    %% API Gateway to Controllers
    GATEWAY --> C_CTRL
    GATEWAY --> CU_CTRL
    GATEWAY --> P_CTRL
    
    %% Controller to Service
    C_CTRL --> C_SVC
    CU_CTRL --> CU_SVC
    P_CTRL --> P_SVC
    
    %% Service to Entity
    C_SVC --> C_ENTITY
    CU_SVC --> CU_ENTITY
    P_SVC --> P_ENTITY
    
    %% Infrastructure connections
    C_ENTITY --> DB
    CU_ENTITY --> DB
    P_ENTITY --> DB
    
    C_SVC --> CACHE
    CU_SVC --> CACHE
    P_SVC --> CACHE
    
    C_SVC --> LOGS
    CU_SVC --> LOGS
    P_SVC --> LOGS
    
    %% Shared components
    C_ENTITY -.-> KERNEL
    CU_ENTITY -.-> KERNEL
    P_ENTITY -.-> KERNEL
    
    C_CTRL -.-> DTO
    CU_CTRL -.-> DTO
    P_CTRL -.-> DTO
    
    C_SVC -.-> UTILS
    CU_SVC -.-> UTILS
    P_SVC -.-> UTILS
    
    %% Styling
    classDef clientClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef apiClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef serviceClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef entityClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef infraClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef sharedClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class WEB,MOBILE,API_CLIENT clientClass
    class GATEWAY,C_CTRL,CU_CTRL,P_CTRL apiClass
    class C_SVC,CU_SVC,P_SVC serviceClass
    class C_ENTITY,CU_ENTITY,P_ENTITY entityClass
    class DB,CACHE,LOGS,MSG infraClass
    class KERNEL,DTO,UTILS sharedClass
```

## 🏗️ Clean Architecture Layers (Mermaid)

```mermaid
graph TB
    subgraph "🎯 Clean Architecture Layers"
        subgraph "🌐 API Layer"
            CTRL["Controllers - HTTP Handlers - Request/Response"]
        end
        
        subgraph "🔧 Application Layer"
            SVC["Services - Use Cases - Business Logic"]
            DTO["DTOs - Data Transfer - Validation"]
        end
        
        subgraph "🏛️ Domain Layer"
            ENT["Entities - Business Objects - Domain Rules"]
            EVT["Events - Domain Events - Business Events"]
            REPO["Repositories - Data Access - Interfaces"]
        end
        
        subgraph "🔌 Infrastructure Layer"
            DB_REPO["Database - Repositories - TypeORM"]
            CACHE_REPO["Cache - Redis - In-Memory"]
            EXT["External - Services - APIs"]
        end
    end
    
    %% Dependencies (pointing inward)
    CTRL --> SVC
    SVC --> ENT
    SVC --> EVT
    SVC --> REPO
    REPO --> DB_REPO
    REPO --> CACHE_REPO
    SVC --> EXT
    
    %% Styling
    classDef apiLayer fill:#e3f2fd,stroke:#0277bd,stroke-width:3px
    classDef appLayer fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef domainLayer fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    classDef infraLayer fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    
    class CTRL apiLayer
    class SVC,DTO appLayer
    class ENT,EVT,REPO domainLayer
    class DB_REPO,CACHE_REPO,EXT infraLayer
```

## 📁 Directory Structure (Mermaid)

```mermaid
graph TD
    ROOT[apps/api/src/] --> MAIN[main.ts]
    ROOT --> APP[app.module.ts]
    ROOT --> CONFIG[config/]
    ROOT --> INFRA[infrastructure/]
    ROOT --> MODULES[modules/]
    ROOT --> SHARED[shared/]
    
    CONFIG --> DB_CONFIG[database.config.ts]
    CONFIG --> APP_CONFIG[app.config.ts]
    
    INFRA --> OBS[observability/]
    INFRA --> DB[database/]
    INFRA --> MSG[messaging/]
    
    OBS --> OBS_MODULE[observability.module.ts]
    DB --> DB_MODULE[database.module.ts]
    MSG --> MSG_MODULE[messaging.module.ts]
    
    MODULES --> CARRIER[carrier/]
    MODULES --> CUSTOMER[customer/]
    MODULES --> PRICING[pricing/]
    
    CARRIER --> C_API[api/]
    CARRIER --> C_APP[application/]
    CARRIER --> C_DOMAIN[domain/]
    CARRIER --> C_INFRA[infrastructure/]
    CARRIER --> C_TESTS[tests/]
    CARRIER --> C_MODULE[carrier.module.ts]
    
    C_API --> C_CTRL[carrier.controller.ts]
    C_APP --> C_DTO[dto/]
    C_APP --> C_SVC[services/]
    C_DOMAIN --> C_ENT[entities/]
    C_DOMAIN --> C_EVT[events/]
    C_DOMAIN --> C_REPO[repositories/]
    
    CUSTOMER --> CU_API[api/]
    CUSTOMER --> CU_APP[application/]
    CUSTOMER --> CU_DOMAIN[domain/]
    CUSTOMER --> CU_INFRA[infrastructure/]
    CUSTOMER --> CU_TESTS[tests/]
    CUSTOMER --> CU_MODULE[customer.module.ts]
    
    PRICING --> P_API[api/]
    PRICING --> P_APP[application/]
    PRICING --> P_DOMAIN[domain/]
    PRICING --> P_INFRA[infrastructure/]
    PRICING --> P_TESTS[tests/]
    PRICING --> P_MODULE[pricing.module.ts]
    
    SHARED --> KERNEL[kernel/]
    SHARED --> DTO_SHARED[dto/]
    SHARED --> UTILS[utils/]
    SHARED --> SHARED_MODULE[shared.module.ts]
    
    KERNEL --> BASE_ENT[base.entity.ts]
    KERNEL --> RESULT[result.ts]
    KERNEL --> DOMAIN_EVT[domain-event.ts]
    
    DTO_SHARED --> PAGINATION[pagination.dto.ts]
    UTILS --> UTILS_INDEX[index.ts]
    
    %% Styling
    classDef rootClass fill:#ffebee,stroke:#c62828,stroke-width:3px
    classDef configClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef infraClass fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef moduleClass fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef sharedClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class ROOT,MAIN,APP rootClass
    class CONFIG,DB_CONFIG,APP_CONFIG configClass
    class INFRA,OBS,DB,MSG,OBS_MODULE,DB_MODULE,MSG_MODULE infraClass
    class MODULES,CARRIER,CUSTOMER,PRICING,C_API,C_APP,C_DOMAIN,C_INFRA,C_TESTS,C_MODULE,CU_API,CU_APP,CU_DOMAIN,CU_INFRA,CU_TESTS,CU_MODULE,P_API,P_APP,P_DOMAIN,P_INFRA,P_TESTS,P_MODULE moduleClass
    class SHARED,KERNEL,DTO_SHARED,UTILS,SHARED_MODULE,BASE_ENT,RESULT,DOMAIN_EVT,PAGINATION,UTILS_INDEX sharedClass
```

## 🔄 Data Flow (Mermaid)

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant Entity
    participant Repository
    participant Database
    
    Note over Client,Database: Request Flow
    Client->>Controller: HTTP Request
    Controller->>Service: Business Logic Call
    Service->>Entity: Domain Validation
    Entity->>Repository: Data Access
    Repository->>Database: SQL Query
    
    Note over Client,Database: Response Flow
    Database-->>Repository: Query Result
    Repository-->>Entity: Domain Object
    Entity-->>Service: Business Object
    Service-->>Controller: Response DTO
    Controller-->>Client: HTTP Response
```

## 🚀 API Endpoints (Mermaid)

```mermaid
graph LR
    subgraph "🚛 Carrier Endpoints"
        C1[POST /carriers]
        C2[GET /carriers]
        C3[GET /carriers/active]
        C4[GET /carriers/:id]
        C5[PATCH /carriers/:id]
        C6[DELETE /carriers/:id]
    end
    
    subgraph "👥 Customer Endpoints"
        CU1[POST /customers]
        CU2[GET /customers]
        CU3[GET /customers/active]
        CU4[GET /customers/email/:email]
        CU5[GET /customers/:id]
        CU6[PATCH /customers/:id]
        CU7[DELETE /customers/:id]
    end
    
    subgraph "💰 Pricing Endpoints"
        P1[Future Sprint]
    end
    
    %% Styling
    classDef carrierClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef customerClass fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef pricingClass fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    
    class C1,C2,C3,C4,C5,C6 carrierClass
    class CU1,CU2,CU3,CU4,CU5,CU6,CU7 customerClass
    class P1 pricingClass
```

## 🎯 How to Use These Diagrams

### **1. 📊 Mermaid Live Editor**
- Go to [mermaid.live](https://mermaid.live)
- Copy and paste any diagram code
- Export as PNG, SVG, or PDF

### **2. 🔧 VS Code**
- Install "Mermaid Preview" extension
- Create `.md` files with mermaid code blocks
- Preview and export diagrams

### **3. 📚 GitHub/GitLab**
- Native Mermaid support
- Just paste the code in markdown files
- Automatically renders in repositories

### **4. 📖 Documentation**
- GitBook, Notion, Confluence
- Most modern documentation tools support Mermaid
- Professional presentation ready

These Mermaid diagrams provide a professional, scalable way to visualize your architecture that can be easily maintained and updated as your system evolves! 🎉
