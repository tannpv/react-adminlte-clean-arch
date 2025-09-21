# Go Microservice Postman Collection

This directory contains the Postman collection and environment for testing the Southern Martin Go Microservice API.

## 📁 **Files**

- `Go-Microservice.postman_collection.json` - Complete API collection
- `Go-Microservice.postman_environment.json` - Environment variables
- `README.md` - This guide

## 🚀 **Quick Start**

### **1. Import Collection and Environment**

1. Open Postman
2. Click **Import** button
3. Import both files:
   - `Go-Microservice.postman_collection.json`
   - `Go-Microservice.postman_environment.json`

### **2. Select Environment**

1. Click the environment dropdown (top right)
2. Select **"Go Microservice Environment"**

### **3. Start the Go Microservice**

```bash
cd go-microservice
go run cmd/server/main.go
```

### **4. Test the API**

1. **Health Check**: `GET /health`
2. **Register User**: `POST /api/v1/auth/register`
3. **Login**: `POST /api/v1/auth/login`
4. **Test Protected Routes**: Use the JWT token from login

## 📋 **Collection Structure**

### **Health Check**
- `GET /health` - Verify service is running

### **Authentication**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### **Users**
- `GET /api/v1/users` - List users (with pagination and search)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### **Products**
- `GET /api/v1/products` - List products (with pagination and search)
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### **JWT Token Sharing**
- `Login and Test Token Sharing` - Demonstrates token sharing
- `Test Token with User Service` - Test token with user endpoints
- `Test Token with Product Service` - Test token with product endpoints

## 🔧 **Environment Variables**

### **Service URLs**
- `base_url` - Main service URL (default: http://localhost:8080)
- `auth_service_url` - Auth service URL
- `user_service_url` - User service URL
- `product_service_url` - Product service URL

### **Authentication**
- `jwt_token` - JWT token (auto-set after login)
- `user_id` - User ID (auto-set after login/register)
- `user_email` - Test user email
- `user_password` - Test user password

### **Test Data**
- `product_name`, `product_sku`, `product_price` - Product test data
- `page`, `limit`, `search` - Pagination and search parameters

## 🔐 **JWT Token Sharing Testing**

The collection includes a special section for testing JWT token sharing across microservices:

### **1. Login and Get Token**
```bash
POST /api/v1/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

### **2. Use Token with Different Services**
The same token can be used with:
- User Service endpoints
- Product Service endpoints
- Any other microservice that shares the JWT secret

### **3. Automatic Token Management**
- Token is automatically stored in `jwt_token` environment variable
- All protected requests automatically include the token
- Token is shared across all requests in the collection

## 🧪 **Test Scripts**

Each request includes comprehensive test scripts that:

### **Authentication Tests**
- Verify login returns valid token
- Check token is stored in environment
- Validate user data in response

### **CRUD Tests**
- Verify status codes (200, 201, 404, etc.)
- Check response structure
- Validate required fields
- Store IDs for subsequent requests

### **JWT Token Tests**
- Verify token works across services
- Check token format and validity
- Test token sharing functionality

## 🔄 **Workflow Examples**

### **Complete User Workflow**
1. Register new user
2. Login with credentials
3. Get user profile
4. Update user information
5. List all users
6. Delete user (optional)

### **Complete Product Workflow**
1. Login to get token
2. Create new product
3. Get product details
4. Update product information
5. List all products
6. Delete product (optional)

### **JWT Token Sharing Workflow**
1. Login to any service
2. Use same token with user service
3. Use same token with product service
4. Verify token works across all services

## 🛠️ **Customization**

### **Change Base URL**
Update the `base_url` environment variable:
- Local development: `http://localhost:8080`
- Docker: `http://localhost:8080`
- Production: `https://your-api-domain.com`

### **Add New Endpoints**
1. Create new request in appropriate folder
2. Add environment variables if needed
3. Include test scripts for validation
4. Update this README

### **Modify Test Data**
Update environment variables:
- `user_email`, `user_password` - Authentication data
- `product_name`, `product_sku` - Product test data
- `page`, `limit` - Pagination settings

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Connection Refused**
- Ensure Go microservice is running
- Check if port 8080 is available
- Verify base_url in environment

#### **2. Authentication Failed**
- Check if user exists (register first)
- Verify password is correct
- Ensure JWT token is set after login

#### **3. Token Expired**
- Login again to get new token
- Check token expiration time
- Verify JWT secret configuration

#### **4. 404 Not Found**
- Check endpoint URL
- Verify API version (v1)
- Ensure service is running

### **Debug Tips**

1. **Check Console**: Look at Postman console for logs
2. **Verify Environment**: Ensure correct environment is selected
3. **Test Health Check**: Start with `/health` endpoint
4. **Check Response**: Look at response body for error details

## 📚 **API Documentation**

For detailed API documentation, see:
- `../API.md` - Complete API reference
- `../docs/JWT_SHARING_GUIDE.md` - JWT token sharing guide
- `../examples/multi-service-setup.md` - Multi-service setup

## 🔗 **Related Files**

- `../cmd/server/main.go` - Main application
- `../.env` - Environment configuration
- `../docker-compose.yml` - Docker setup
- `../README.md` - Project overview

This Postman collection provides a complete testing environment for the Go microservice API, including JWT token sharing capabilities for multi-service architectures.
