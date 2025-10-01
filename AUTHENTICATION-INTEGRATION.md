# Authentication Integration - Admin Frontend & Apps API

This document describes the complete authentication system integration between the admin frontend and the apps API (NestJS microservice).

## Backend Authentication (Apps API)

### Dependencies Added
```json
{
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "passport": "^0.6.0",
  "passport-jwt": "^4.0.1",
  "bcrypt": "^5.1.0",
  "@types/bcrypt": "^5.0.0",
  "@types/passport-jwt": "^3.0.8"
}
```

### Authentication Module Structure
```
src/modules/auth/
├── api/
│   └── auth.controller.ts          # Authentication endpoints
├── application/
│   ├── dto/
│   │   ├── login.dto.ts           # Login request DTO
│   │   ├── register.dto.ts        # Registration request DTO
│   │   └── auth-response.dto.ts   # Authentication response DTO
│   └── services/
│       └── auth.service.ts        # Authentication business logic
├── infrastructure/
│   └── strategies/
│       └── jwt.strategy.ts        # JWT authentication strategy
└── auth.module.ts                 # Authentication module
```

### API Endpoints

#### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/profile` - Get current user profile
- `POST /api/v1/auth/logout` - User logout

#### Request/Response Examples

**Login Request:**
```json
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "fullName": "Admin User",
    "phone": "+1234567890",
    "isActive": true,
    "isEmailVerified": true,
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "description": "Administrator",
        "permissions": ["users.create", "users.read"],
        "isActive": true
      }
    ],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

**Register Request:**
```json
POST /api/v1/auth/register
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "phone": "+1234567890",
  "roleIds": [2]
}
```

### Security Features

1. **Password Hashing**: Uses bcrypt with salt rounds of 10
2. **JWT Tokens**: Secure token-based authentication
3. **Token Expiration**: Configurable token expiration (default: 24h)
4. **Role-based Access**: JWT payload includes user roles
5. **Input Validation**: Comprehensive DTO validation

### Environment Configuration
```env
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:5177
```

## Frontend Authentication (Admin)

### Updated API Client
The admin frontend has been updated to work with the new authentication endpoints:

```javascript
// Updated auth API functions
export async function login(credentials) {
  const res = await ApiClient.post('/auth/login', credentials)
  const { token, user, expiresIn } = res.data || {}
  return { token, user: normalizeUser(user || {}), expiresIn }
}

export async function register(payload) {
  const res = await ApiClient.post('/auth/register', payload)
  const { token, user, expiresIn } = res.data || {}
  return { token, user: normalizeUser(user || {}), expiresIn }
}

export async function getProfile() {
  const res = await ApiClient.get('/auth/profile')
  return normalizeUser(res.data || {})
}

export async function refreshToken() {
  const res = await ApiClient.post('/auth/refresh')
  const { token, user, expiresIn } = res.data || {}
  return { token, user: normalizeUser(user || {}), expiresIn }
}

export async function logout() {
  const res = await ApiClient.post('/auth/logout')
  return res.data
}
```

### Data Structure Compatibility
The admin frontend maintains compatibility with the existing user structure while supporting the new NestJS API format:

**User Normalization:**
```javascript
const normalizeUser = (user) => {
  const profile = normalizeProfile(user)
  return {
    id: user.id,
    email: user.email,
    roles: Array.isArray(user.roles) ? user.roles.map(role => role.id || role) : [],
    profile,
    displayName: computeDisplayName(profile, user.email),
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    phone: user.phone,
    address: user.address,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
```

## Database Schema Updates

### User Entity Changes
Added password field to the User entity:

```typescript
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;  // Added for authentication

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // ... other fields
}
```

### Migration Required
You'll need to run a database migration to add the password column:

```sql
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd apps/api
npm install
```

### 2. Environment Configuration
Create `.env` file in `apps/api/`:
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5177

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=adminlte_clean_arch

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

### 3. Database Migration
```bash
# Add password column to users table
npm run migration:generate -- AddPasswordToUsers
npm run migration:run
```

### 4. Start Services
```bash
# Start Apps API
cd apps/api
npm run start:dev

# Start Admin Frontend
cd admin
npm run dev
```

## Testing Authentication

### 1. Test Registration
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Route
```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret key in production
2. **Password Requirements**: Minimum 8 characters (configurable)
3. **Token Expiration**: Set appropriate expiration times
4. **HTTPS**: Use HTTPS in production
5. **CORS**: Configure CORS properly for your frontend domain
6. **Rate Limiting**: Consider implementing rate limiting for auth endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` matches your admin frontend URL
2. **JWT Errors**: Check JWT secret configuration
3. **Database Errors**: Ensure password column exists in users table
4. **Validation Errors**: Check DTO validation rules

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your environment file.

## Next Steps

1. **Password Reset**: Implement password reset functionality
2. **Email Verification**: Add email verification for new users
3. **Two-Factor Authentication**: Consider adding 2FA support
4. **Session Management**: Implement token blacklisting for logout
5. **Audit Logging**: Add authentication event logging

