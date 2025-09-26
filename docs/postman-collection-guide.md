# Postman Collection Guide

This guide provides comprehensive documentation for the Modern Admin Dashboard API Postman collection, including all endpoints, authentication, and testing workflows.

## Collection Overview

**Collection Name**: Modern Admin Dashboard API  
**Description**: Local API for Users, Roles, Categories, Products, Storage and Auth (JWT)  
**Base URL**: `http://localhost:3001`  
**Authentication**: Bearer Token (JWT)

## Environment Setup

### Local Environment Variables

The collection uses the following environment variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:3001` |
| `token` | JWT authentication token | Auto-populated after login |
| `lastUserId` | Last created user ID | Auto-populated |
| `lastRoleId` | Last created role ID | Auto-populated |
| `lastCategoryId` | Last created category ID | Auto-populated |
| `lastSubcategoryId` | Last created subcategory ID | Auto-populated |
| `lastProductId` | Last created product ID | Auto-populated |
| `lastDirectoryId` | Last created directory ID | Auto-populated |
| `lastFileId` | Last created file ID | Auto-populated |

## API Endpoints

### 1. Health Check

#### GET /api/health
- **Purpose**: Check API health status
- **Authentication**: None required
- **Response**: Health status information

### 2. Authentication

#### POST /api/auth/login
- **Purpose**: User login
- **Authentication**: None required
- **Body**:
  ```json
  {
    "email": "leanne@example.com",
    "password": "secret"
  }
  ```
- **Response**: JWT token and user information
- **Auto-sets**: `token`, `userId` environment variables

#### POST /api/auth/register
- **Purpose**: User registration
- **Authentication**: None required
- **Body**:
  ```json
  {
    "name": "New User",
    "email": "new.user@example.com",
    "password": "secret"
  }
  ```
- **Response**: JWT token and user information
- **Auto-sets**: `token`, `userId` environment variables

#### GET /api/me
- **Purpose**: Get current user profile
- **Authentication**: Bearer token required
- **Response**: User profile with roles and permissions

### 3. Users Management

#### GET /api/users
- **Purpose**: List all users
- **Authentication**: Bearer token required
- **Response**: Array of user objects

#### GET /api/users?search=term
- **Purpose**: Search users by name or email
- **Authentication**: Bearer token required
- **Query Parameters**:
  - `search`: Search term for user name or email
- **Response**: Filtered array of user objects

#### POST /api/users
- **Purpose**: Create new user
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Test User",
    "email": "test.user@example.com",
    "roles": [2]
  }
  ```
- **Response**: Created user object
- **Auto-sets**: `lastUserId` environment variable

#### GET /api/users/:id
- **Purpose**: Get user by ID
- **Authentication**: Bearer token required
- **Response**: User object

#### PUT /api/users/:id
- **Purpose**: Update user
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Updated User",
    "roles": [1, 2]
  }
  ```
- **Response**: Updated user object

#### DELETE /api/users/:id
- **Purpose**: Delete user
- **Authentication**: Bearer token required
- **Response**: Deleted user object

### 4. Roles Management

#### GET /api/roles
- **Purpose**: List all roles
- **Authentication**: Bearer token required
- **Response**: Array of role objects

#### POST /api/roles
- **Purpose**: Create new role
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Manager"
  }
  ```
- **Response**: Created role object
- **Auto-sets**: `lastRoleId` environment variable

#### PUT /api/roles/:id
- **Purpose**: Update role
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Supervisor"
  }
  ```
- **Response**: Updated role object

#### DELETE /api/roles/:id
- **Purpose**: Delete role
- **Authentication**: Bearer token required
- **Response**: Deleted role object

### 5. Categories Management

#### GET /api/categories
- **Purpose**: List all categories with tree structure
- **Authentication**: Bearer token required
- **Response**:
  ```json
  {
    "categories": [...],
    "tree": [...],
    "hierarchy": [...]
  }
  ```

#### GET /api/categories?search=term
- **Purpose**: Search categories by name
- **Authentication**: Bearer token required
- **Query Parameters**:
  - `search`: Search term for category name
- **Response**: Filtered categories with tree structure

#### POST /api/categories
- **Purpose**: Create new category
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Electronics",
    "parentId": null
  }
  ```
- **Response**: Created category object
- **Auto-sets**: `lastCategoryId` environment variable

#### POST /api/categories (Subcategory)
- **Purpose**: Create subcategory
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Smartphones",
    "parentId": "{{lastCategoryId}}"
  }
  ```
- **Response**: Created subcategory object
- **Auto-sets**: `lastSubcategoryId` environment variable

#### PUT /api/categories/:id
- **Purpose**: Update category
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Electronics & Gadgets",
    "parentId": null
  }
  ```
- **Response**: Updated category object

#### DELETE /api/categories/:id
- **Purpose**: Delete category
- **Authentication**: Bearer token required
- **Response**: Deleted category object

### 6. Products Management

#### GET /api/products
- **Purpose**: List all products
- **Authentication**: Bearer token required
- **Response**: Array of product objects

#### GET /api/products/:id
- **Purpose**: Get product by ID
- **Authentication**: Bearer token required
- **Response**: Product object

#### POST /api/products
- **Purpose**: Create new product
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with advanced features",
    "price": 999.99,
    "categoryId": "{{lastCategoryId}}",
    "sku": "IPH15PRO-256",
    "stock": 50
  }
  ```
- **Response**: Created product object
- **Auto-sets**: `lastProductId` environment variable

#### PUT /api/products/:id
- **Purpose**: Update product
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "iPhone 15 Pro Max",
    "description": "Latest iPhone with advanced features and larger screen",
    "price": 1099.99,
    "stock": 30
  }
  ```
- **Response**: Updated product object

#### DELETE /api/products/:id
- **Purpose**: Delete product
- **Authentication**: Bearer token required
- **Response**: Deleted product object

### 7. Storage Management

#### GET /api/storage
- **Purpose**: List root directory contents
- **Authentication**: Bearer token required
- **Response**: Directory contents

#### GET /api/storage?directoryId=:id
- **Purpose**: List directory contents
- **Authentication**: Bearer token required
- **Query Parameters**:
  - `directoryId`: Directory ID to list contents
- **Response**: Directory contents

#### POST /api/storage/directories
- **Purpose**: Create directory
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Project Assets",
    "parentId": null
  }
  ```
- **Response**: Created directory object
- **Auto-sets**: `lastDirectoryId` environment variable

#### PATCH /api/storage/directories/:id
- **Purpose**: Update directory
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "name": "Project Assets (Renamed)"
  }
  ```
- **Response**: Updated directory object

#### PUT /api/storage/directories/:id/grants
- **Purpose**: Set directory access grants
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "grants": [
      { "roleId": 2, "access": "read" }
    ]
  }
  ```
- **Response**: Updated grants

#### POST /api/storage/files
- **Purpose**: Upload file
- **Authentication**: Bearer token required
- **Body**: Form data
  - `directoryId`: Directory ID
  - `displayName`: File display name
  - `visibility`: File visibility (public/private)
  - `file`: File to upload
- **Response**: Created file object
- **Auto-sets**: `lastFileId` environment variable

#### PATCH /api/storage/files/:id
- **Purpose**: Update file metadata
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "displayName": "design-spec-v2.pdf",
    "visibility": "public"
  }
  ```
- **Response**: Updated file object

#### PUT /api/storage/files/:id/grants
- **Purpose**: Set file access grants
- **Authentication**: Bearer token required
- **Body**:
  ```json
  {
    "grants": [
      { "roleId": 2, "access": "read" },
      { "roleId": 3, "access": "write" }
    ]
  }
  ```
- **Response**: Updated grants

#### DELETE /api/storage/files/:id
- **Purpose**: Delete file
- **Authentication**: Bearer token required
- **Response**: Deleted file object

#### DELETE /api/storage/directories/:id
- **Purpose**: Delete directory
- **Authentication**: Bearer token required
- **Response**: Deleted directory object

## Testing Workflows

### 1. Authentication Workflow (Automatic Token Handling)

#### 🚀 **Quick Start (Recommended)**
1. **Import Collection & Environment** → Set up Postman
2. **Run Login Request** → Token automatically stored
3. **Run Any Other Request** → Token automatically included
4. **Done!** → No manual token copying needed

#### 📋 **Detailed Steps**
1. **Login** → 
   - Execute `Auth > Login` request
   - ✅ Token automatically stored in `{{token}}` variable
   - ✅ User ID automatically stored in `{{userId}}` variable
   - ✅ Console shows "JWT token stored successfully"
2. **Verify Authentication** → 
   - Execute `Auth > Me` request
   - ✅ Token automatically sent with request
   - ✅ Console shows "JWT token found and will be sent with this request"
3. **Use Any Endpoint** → 
   - All requests now automatically authenticated
   - No need to manually add Authorization headers

### 2. User Management Workflow
1. **List Users** → View existing users
2. **Search Users** → Test search functionality
3. **Create User** → Sets `lastUserId`
4. **Get User By Id** → Verify user creation
5. **Update User** → Modify user data
6. **Delete User** → Clean up

### 3. Role Management Workflow
1. **List Roles** → View existing roles
2. **Create Role** → Sets `lastRoleId`
3. **Update Role** → Modify role data
4. **Delete Role** → Clean up

### 4. Category Management Workflow
1. **List Categories** → View existing categories
2. **Search Categories** → Test search functionality
3. **Create Category** → Sets `lastCategoryId`
4. **Create Subcategory** → Sets `lastSubcategoryId`
5. **Update Category** → Modify category data
6. **Delete Category** → Clean up

### 5. Product Management Workflow
1. **List Products** → View existing products
2. **Create Product** → Sets `lastProductId` (requires `lastCategoryId`)
3. **Get Product By Id** → Verify product creation
4. **Update Product** → Modify product data
5. **Delete Product** → Clean up

### 6. Storage Management Workflow
1. **List Root Directory** → View root contents
2. **Create Directory** → Sets `lastDirectoryId`
3. **List Directory Contents** → Verify directory creation
4. **Upload File** → Sets `lastFileId`
5. **Update File** → Modify file metadata
6. **Set File Grants** → Configure access
7. **Delete File** → Clean up
8. **Delete Directory** → Clean up

## Search Functionality

### User Search
- **Endpoint**: `GET /api/users?search=term`
- **Search Fields**: User name and email
- **Case-insensitive**: Yes
- **Partial Matching**: Yes

### Category Search
- **Endpoint**: `GET /api/categories?search=term`
- **Search Fields**: Category name
- **Case-insensitive**: Yes
- **Partial Matching**: Yes
- **Maintains Tree Structure**: Yes

## Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

Validation errors are returned in the following format:
```json
{
  "message": "Validation failed",
  "errors": {
    "field": "Error message"
  }
}
```

## Automatic Authentication

### JWT Token Management

The collection includes **automatic JWT token handling** that eliminates the need to manually copy and paste tokens:

#### 🔐 **Automatic Token Storage**
- **Login Request**: Automatically stores JWT token in `{{token}}` environment variable
- **Register Request**: Automatically stores JWT token in `{{token}}` environment variable
- **Collection-Level Auth**: All requests automatically use the stored token via Bearer authentication

#### 📋 **How It Works**
1. **Run Login/Register**: Execute the Auth > Login or Auth > Register request
2. **Token Auto-Stored**: JWT token is automatically saved to environment variable
3. **All Requests Authenticated**: Every subsequent request automatically includes the token
4. **No Manual Copying**: Never need to copy/paste tokens again!

#### 🔍 **Token Status Checking**
- **Pre-request Script**: Shows token status in console before each request
- **Visual Feedback**: 
  - ✅ "JWT token found and will be sent with this request"
  - ⚠️ "No JWT token found. Please login first using the Auth > Login request."

#### 🧪 **Enhanced Test Scripts**
- **Login/Register Tests**: Automatically validate response and token storage
- **Console Logging**: Clear feedback when tokens are stored successfully
- **Error Handling**: Helpful messages if token storage fails

### Environment Variables Auto-Population

The collection automatically populates environment variables when creating resources:

- **Login/Register** → `token`, `userId`
- **Create User** → `lastUserId`
- **Create Role** → `lastRoleId`
- **Create Category** → `lastCategoryId`
- **Create Subcategory** → `lastSubcategoryId`
- **Create Product** → `lastProductId`
- **Create Directory** → `lastDirectoryId`
- **Upload File** → `lastFileId`

## Import Instructions

1. **Import Collection**: Import `ModernAdminDashboard.postman_collection.json`
2. **Import Environment**: Import `Local.postman_environment.json`
3. **Set Environment**: Select "Local" environment in Postman
4. **Start Backend**: Ensure backend is running on `http://localhost:3001`
5. **Login**: Use the Login request to authenticate
6. **Test Endpoints**: Use the organized folder structure to test different features

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Ensure you're logged in and the token is valid
2. **Connection Refused**: Verify backend is running on port 3001
3. **Environment Variables Not Set**: Check that the test scripts are running correctly
4. **Search Not Working**: Verify search parameters are properly formatted

### Debug Tips

1. Check the **Console** tab in Postman for JavaScript errors
2. Verify environment variables in the **Environment** tab
3. Use the **Pre-request Script** tab to debug variable values
4. Check the **Test Results** tab for test script execution

## Related Documentation

- [API Endpoints Overview](../README.md#api-endpoints-base-api)
- [Category Search Feature](category-search-feature.md)
- [Search Features Overview](search-features-overview.md)
- [Backend Configuration](../backend/docs/configuration.md)
