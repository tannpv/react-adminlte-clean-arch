# Admin Frontend - Apps API Integration

This document describes the integration between the admin frontend and the apps API (NestJS microservice).

## Configuration

### API Base URL
The admin frontend is configured to interact with the apps API at:
- **Development**: `http://localhost:3001/api/v1`
- **Production**: Set via `VITE_API_BASE_URL` environment variable

### Environment Variables
Create a `.env` file in the admin directory:
```bash
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_DEV_MODE=true
```

## API Endpoints

### Users API
- `GET /api/v1/users` - Get all users (paginated)
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/active` - Get active users
- `GET /api/v1/users/count` - Get user count

### Roles API
- `GET /api/v1/roles` - Get all roles (paginated)
- `POST /api/v1/roles` - Create role
- `PATCH /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role
- `GET /api/v1/roles/active` - Get active roles
- `GET /api/v1/roles/count` - Get role count

## Data Structure Changes

### User Structure
The admin frontend has been updated to handle the new user structure from the NestJS API:

**Before (Old Backend)**:
```javascript
{
  id: 1,
  email: "user@example.com",
  profile: {
    firstName: "John",
    lastName: "Doe"
  },
  roles: [1, 2]
}
```

**After (NestJS API)**:
```javascript
{
  id: 1,
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  fullName: "John Doe",
  phone: "+1234567890",
  isActive: true,
  isEmailVerified: false,
  dateOfBirth: "1990-01-01",
  address: {
    street: "123 Main St",
    city: "City",
    state: "State",
    zipCode: "12345",
    country: "Country"
  },
  preferences: {},
  roles: [
    {
      id: 1,
      name: "admin",
      description: "Administrator",
      permissions: ["users.create", "users.read"],
      isActive: true
    }
  ],
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
}
```

### Role Structure
**Before (Old Backend)**:
```javascript
{
  id: 1,
  name: "admin",
  permissions: ["users.create", "users.read"]
}
```

**After (NestJS API)**:
```javascript
{
  id: 1,
  name: "admin",
  description: "Administrator role",
  permissions: ["users.create", "users.read"],
  isActive: true,
  metadata: {},
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
}
```

## Pagination

The NestJS API returns paginated responses:
```javascript
{
  data: [...], // Array of items
  total: 100,  // Total count
  page: 1,     // Current page
  limit: 10    // Items per page
}
```

The admin frontend handles this by extracting the `data` array from the response.

## HTTP Methods

- **GET**: Retrieve data
- **POST**: Create new resources
- **PATCH**: Update existing resources (partial updates)
- **DELETE**: Remove resources

## Error Handling

The admin frontend includes global error handling for:
- 401 Unauthorized: Automatically redirects to login
- 400 Bad Request: Displays validation errors
- 500 Server Error: Shows generic error message

## Development Setup

1. Start the apps API (NestJS microservice):
   ```bash
   cd apps/api
   npm install
   npm run start:dev
   ```

2. Start the admin frontend:
   ```bash
   cd admin
   npm install
   npm run dev
   ```

3. The admin will be available at `http://localhost:5177`
4. The apps API will be available at `http://localhost:3001/api/v1`

## Testing

To test the integration:

1. Ensure both services are running
2. Open the admin interface
3. Navigate to Users or Roles sections
4. Try creating, updating, and deleting records
5. Check the browser's Network tab to verify API calls are going to the correct endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the apps API has CORS configured for the admin domain
2. **404 Errors**: Verify the API endpoints match the NestJS controller routes
3. **Data Format Errors**: Check that the data transformation in the API files matches the expected structure

### Debug Mode

Enable debug logging by setting `VITE_DEV_MODE=true` in the environment file. This will log API calls to the console.

