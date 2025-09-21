# Go Microservice API Documentation

## Overview

This Go microservice by Southern Martin provides a RESTful API for managing users and products with clean architecture principles. It includes JWT authentication, PostgreSQL database integration, and event-driven architecture.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check

#### GET /health
Check if the service is running.

**Response:**
```json
{
  "status": "ok"
}
```

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Doe",
  "status": "active",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "active",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Users (Protected Routes)

#### GET /users
List all users with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name or email

**Response:**
```json
{
  "users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "status": "active",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### GET /users/:id
Get a specific user by ID.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Doe",
  "status": "active",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### PUT /users/:id
Update a user.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.smith@example.com",
  "name": "John Smith",
  "status": "active",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T12:00:00Z"
}
```

#### DELETE /users/:id
Delete a user.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### Products (Protected Routes)

#### GET /products
List all products with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name, SKU, or description

**Response:**
```json
{
  "products": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Product Name",
      "sku": "SKU-001",
      "description": "Product description",
      "price": 99.99,
      "stock_quantity": 100,
      "category_id": "456e7890-e89b-12d3-a456-426614174000",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### GET /products/:id
Get a specific product by ID.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Product Name",
  "sku": "SKU-001",
  "description": "Product description",
  "price": 99.99,
  "stock_quantity": 100,
  "category_id": "456e7890-e89b-12d3-a456-426614174000",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### POST /products
Create a new product.

**Request Body:**
```json
{
  "name": "New Product",
  "sku": "SKU-002",
  "description": "New product description",
  "price": 149.99,
  "stock_quantity": 50,
  "category_id": "456e7890-e89b-12d3-a456-426614174000"
}
```

**Response:**
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174000",
  "name": "New Product",
  "sku": "SKU-002",
  "description": "New product description",
  "price": 149.99,
  "stock_quantity": 50,
  "category_id": "456e7890-e89b-12d3-a456-426614174000",
  "created_at": "2023-01-01T12:00:00Z",
  "updated_at": "2023-01-01T12:00:00Z"
}
```

#### PUT /products/:id
Update a product.

**Request Body:**
```json
{
  "name": "Updated Product",
  "price": 199.99,
  "stock_quantity": 75
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Product",
  "sku": "SKU-001",
  "description": "Product description",
  "price": 199.99,
  "stock_quantity": 75,
  "category_id": "456e7890-e89b-12d3-a456-426614174000",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T12:00:00Z"
}
```

#### DELETE /products/:id
Delete a product.

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": "Field validation errors"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

CORS is enabled for all origins. Configure appropriate CORS settings for production use.
