# Postman Collections for Go Microservice

This guide explains how to use the Postman collections for testing the Southern Martin Go Microservice API and JWT token sharing across multiple services.

## 📁 **Available Collections**

### **1. Go-Microservice.postman_collection.json**
- **Purpose**: Complete API testing for the Go microservice
- **Environment**: `Go-Microservice.postman_environment.json`
- **Use Case**: Single service testing, development, and debugging

### **2. JWT-Token-Sharing.postman_collection.json**
- **Purpose**: Test JWT token sharing across multiple microservices
- **Environment**: `Multi-Service.postman_environment.json`
- **Use Case**: Multi-service architecture testing, JWT token validation

## 🚀 **Quick Start Guide**

### **Step 1: Import Collections**

1. Open Postman
2. Click **Import** button
3. Import the following files:
   ```
   Go-Microservice.postman_collection.json
   Go-Microservice.postman_environment.json
   JWT-Token-Sharing.postman_collection.json
   Multi-Service.postman_environment.json
   ```

### **Step 2: Start the Go Microservice**

```bash
cd go-microservice
go run cmd/server/main.go
```

### **Step 3: Select Environment**

Choose the appropriate environment:
- **Single Service**: "Go Microservice Environment"
- **Multi-Service**: "Multi-Service Environment"

### **Step 4: Test the API**

1. **Health Check**: Verify service is running
2. **Register/Login**: Get JWT token
3. **Test Endpoints**: Use the token for protected routes

## 🔧 **Environment Configuration**

### **Single Service Environment**
```json
{
  "base_url": "http://localhost:8080",
  "jwt_token": "", // Auto-set after login
  "user_email": "test@example.com",
  "user_password": "password123"
}
```

### **Multi-Service Environment**
```json
{
  "auth_service_url": "http://localhost:8080",
  "user_service_url": "http://localhost:8081", 
  "product_service_url": "http://localhost:8082",
  "jwt_token": "", // Shared across all services
  "user_email": "test@example.com",
  "user_password": "password123"
}
```

## 📋 **Collection Features**

### **Automatic Token Management**
- JWT tokens are automatically stored after login
- All protected requests include the token
- Token is shared across all requests in the collection

### **Comprehensive Test Scripts**
- Status code validation
- Response structure verification
- Data extraction and storage
- Error handling and logging

### **JWT Token Sharing Tests**
- Login once, use everywhere
- Cross-service token validation
- Token expiration testing
- Invalid token rejection testing

## 🧪 **Testing Workflows**

### **Single Service Workflow**
1. **Health Check** → Verify service is running
2. **Register User** → Create test user account
3. **Login** → Get JWT token
4. **Test Protected Routes** → Use token for API calls
5. **CRUD Operations** → Test all endpoints

### **Multi-Service Workflow**
1. **Setup** → Clear environment, verify services
2. **Authentication** → Register and login to get token
3. **User Service Tests** → Test token with user endpoints
4. **Product Service Tests** → Test token with product endpoints
5. **Token Validation** → Verify token security features

## 🔐 **JWT Token Sharing Testing**

### **How It Works**
1. **Login to Auth Service** → Get JWT token
2. **Use Token with User Service** → Same token works
3. **Use Token with Product Service** → Same token works
4. **Verify Token Security** → Test expiration and validation

### **Test Scenarios**
- ✅ Valid token works across all services
- ✅ Invalid token is rejected
- ✅ Token structure is correct
- ✅ Token expiration is handled
- ✅ User context is preserved

## 🛠️ **Customization**

### **Change Service URLs**
Update environment variables:
```json
{
  "base_url": "http://your-api-domain.com",
  "auth_service_url": "http://auth.your-domain.com",
  "user_service_url": "http://users.your-domain.com",
  "product_service_url": "http://products.your-domain.com"
}
```

### **Modify Test Data**
Update environment variables:
```json
{
  "user_email": "your-test@email.com",
  "user_password": "your-password",
  "product_name": "Your Test Product",
  "product_sku": "YOUR-SKU-001"
}
```

### **Add New Endpoints**
1. Create new request in appropriate folder
2. Add required environment variables
3. Include test scripts for validation
4. Update documentation

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```
**Solution:**
- Ensure Go microservice is running
- Check if port 8080 is available
- Verify base_url in environment

#### **2. Authentication Failed**
```
Error: 401 Unauthorized
```
**Solution:**
- Check if user exists (register first)
- Verify password is correct
- Ensure JWT token is set after login

#### **3. Token Not Working**
```
Error: 401 Invalid token
```
**Solution:**
- Login again to get fresh token
- Check token expiration time
- Verify JWT secret configuration

#### **4. Multi-Service Issues**
```
Error: Token works with one service but not another
```
**Solution:**
- Ensure all services use same JWT secret
- Check service URLs in environment
- Verify all services are running

### **Debug Tips**

1. **Check Console**: Look at Postman console for detailed logs
2. **Verify Environment**: Ensure correct environment is selected
3. **Test Health Check**: Start with `/health` endpoint
4. **Check Response**: Look at response body for error details
5. **Validate Token**: Use jwt.io to decode and inspect token

## 📊 **Test Results**

### **Expected Results**

#### **Health Check**
```json
{
  "status": "ok"
}
```

#### **Login Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

#### **User List Response**
```json
{
  "users": [...],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### **Test Script Validation**
- ✅ Status codes are correct
- ✅ Response structure is valid
- ✅ Required fields are present
- ✅ Data types are correct
- ✅ JWT token is properly formatted

## 🔗 **Related Documentation**

- `../API.md` - Complete API reference
- `../docs/JWT_SHARING_GUIDE.md` - JWT token sharing guide
- `../examples/multi-service-setup.md` - Multi-service setup
- `../README.md` - Project overview

## 📝 **Best Practices**

### **Testing**
1. Always start with health check
2. Register user before testing protected routes
3. Use descriptive test names
4. Include comprehensive test scripts
5. Test both success and error scenarios

### **Security**
1. Use environment variables for sensitive data
2. Don't commit tokens to version control
3. Test token expiration and validation
4. Verify error handling for invalid tokens
5. Test cross-service token sharing

### **Maintenance**
1. Keep collections updated with API changes
2. Update test data regularly
3. Review and update test scripts
4. Document new endpoints and features
5. Share collections with team members

This comprehensive Postman setup provides everything needed to test the Go microservice API and JWT token sharing functionality across multiple services.
