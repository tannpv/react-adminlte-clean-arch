# Postman Automatic Authentication Guide

## 🎯 Overview

The Modern Admin Dashboard Postman collection includes **automatic JWT token handling** that eliminates the need to manually copy and paste tokens between requests. Once you login, all subsequent requests are automatically authenticated.

## 🔄 How Automatic Authentication Works

### 1. **Collection-Level Authentication**
```json
{
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  }
}
```

### 2. **Automatic Token Storage**
When you run the Login or Register request, the response automatically stores the JWT token:

```javascript
// Login/Register Test Script
const json = pm.response.json();
if (json && json.token) {
    pm.environment.set('token', json.token);
    console.log('✅ JWT token stored successfully');
}
```

### 3. **Pre-request Token Check**
Before each request, the collection checks if a token exists:

```javascript
// Collection Pre-request Script
const token = pm.environment.get('token');
if (!token || token === '') {
    console.log('⚠️  No JWT token found. Please login first.');
} else {
    console.log('✅ JWT token found and will be sent with this request');
}
```

## 📋 Step-by-Step Usage

### Step 1: Import Collection
1. Import `ReactAdminLTE.postman_collection.json`
2. Import `Local.postman_environment.json`
3. Select "Local" environment

### Step 2: Login (Automatic Token Storage)
1. Go to **Auth > Login**
2. Click **Send**
3. ✅ Token automatically stored in `{{token}}` variable
4. ✅ Console shows "JWT token stored successfully"

### Step 3: Use Any Endpoint
1. Go to any other request (e.g., **Users > List Users**)
2. Click **Send**
3. ✅ Token automatically included in Authorization header
4. ✅ Console shows "JWT token found and will be sent with this request"

## 🔍 Visual Indicators

### Console Messages
- **✅ JWT token found and will be sent with this request** → You're authenticated
- **⚠️ No JWT token found. Please login first** → You need to login
- **✅ JWT token stored successfully** → Login was successful

### Test Results
- **Login successful** → HTTP 200/201 status
- **Token received** → JWT token validation
- **Registration successful** → HTTP 201 status

## 🛠️ Troubleshooting

### Problem: "No JWT token found"
**Solution**: Run the **Auth > Login** request first

### Problem: "401 Unauthorized"
**Possible Causes**:
1. Token expired (JWT tokens expire after 1 hour)
2. Invalid token
3. Backend not running

**Solution**: 
1. Run **Auth > Login** again to get a fresh token
2. Check that backend is running on port 3001

### Problem: Token not being stored
**Check**:
1. Login request returned HTTP 200/201
2. Response contains `token` field
3. Check Console tab for error messages

## 🔧 Manual Token Management (If Needed)

### View Current Token
1. Go to **Environment** tab
2. Look for `token` variable
3. Value shows current JWT token

### Clear Token
1. Go to **Environment** tab
2. Set `token` value to empty string
3. Or delete the variable

### Set Token Manually
1. Go to **Environment** tab
2. Set `token` value to your JWT token
3. All requests will now use this token

## 📊 Environment Variables

| Variable | Purpose | Auto-Set By |
|----------|---------|-------------|
| `token` | JWT authentication token | Login/Register |
| `userId` | Current user ID | Login/Register |
| `baseUrl` | API base URL | Manual setup |

## 🎉 Benefits

### ✅ **No Manual Copying**
- Never need to copy/paste tokens
- No risk of typos in token values

### ✅ **Automatic Updates**
- Token refreshed on each login
- Always using the latest valid token

### ✅ **Visual Feedback**
- Clear console messages
- Easy to see authentication status

### ✅ **Error Prevention**
- Automatic token validation
- Helpful error messages

### ✅ **Seamless Workflow**
- Login once, use everywhere
- Perfect for API testing and development

## 🔗 Related Documentation

- [Postman Collection Guide](postman-collection-guide.md) - Complete API documentation
- [Category Search Feature](category-search-feature.md) - Search functionality details
- [API Endpoints Overview](../README.md#api-endpoints-base-api) - Complete API reference
