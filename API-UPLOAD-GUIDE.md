# 🔑 API Upload Method Guide

## Overview

This guide shows you how to upload your Postman collection directly to your Postman cloud workspace using an API key, which will make it appear in your Postman desktop app.

## 🎯 Quick Start

### Direct API Key Upload (Only Working Method)
```bash
./scripts/postman/upload-collection.sh YOUR_API_KEY
```

## 📋 Step-by-Step Setup

### Step 1: Get Your Postman API Key

1. **Go to Postman API Keys page:**
   - Visit: https://web.postman.co/settings/me/api-keys
   - Or run: `open "https://web.postman.co/settings/me/api-keys"`

2. **Create a new API key:**
   - Click "Create API Key"
   - Give it a name (e.g., "CLI Upload Key")
   - Copy the generated API key

3. **Keep the API key secure:**
   - Don't share it publicly
   - Store it safely for future use

### Step 2: Upload Collection

#### Direct Upload (Only Working Method)
```bash
# Replace YOUR_API_KEY with your actual API key
./scripts/postman/upload-collection.sh YOUR_API_KEY
```

### Step 3: Verify Upload

1. **Open Postman desktop app**
2. **Refresh the app** (Cmd+R or Ctrl+R)
3. **Go to Collections tab**
4. **Look for "Modern Admin Dashboard API"**
5. **The collection should now be available**

## 🧪 Test the Collection

1. **Select "Local" environment** (if available)
2. **Use Login endpoint:**
   - `POST /api/auth/login`
   - Body: `{"email": "test@example.com", "password": "secret123"}`
3. **Verify authentication works**

## 🔧 Troubleshooting

### API Key Issues
- **Invalid API Key**: Check if the key is correct
- **Authentication Error**: Make sure you're logged into the correct Postman account
- **Permission Denied**: Ensure the API key has proper permissions

### Upload Issues
- **Collection Not Appearing**: Refresh Postman desktop app
- **Wrong Workspace**: Check if you're in the correct workspace
- **File Not Found**: Ensure collection file exists

### Common Solutions
1. **Create a new API key** if the current one doesn't work
2. **Check collection file** is valid JSON
3. **Verify workspace** is correct
4. **Try different upload method** if one fails

## 📊 Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `upload-collection.sh` | Direct upload with API key | `./scripts/postman/upload-collection.sh YOUR_API_KEY` |

## 🎉 Benefits of API Upload

- ✅ **Direct cloud integration**
- ✅ **Automatic workspace sync**
- ✅ **Team collaboration ready**
- ✅ **Version control support**
- ✅ **No manual import needed**

## 🔒 Security Notes

- **Keep API keys secure**
- **Don't commit API keys to version control**
- **Use environment variables for production**
- **Rotate API keys regularly**

## 📚 Alternative Methods

If API upload doesn't work, you can still use:
1. **Manual Import**: Use Postman's import feature with the collection file
2. **Drag & Drop**: Drag the collection file into Postman

## 🎯 Next Steps

After successful upload:
1. **Test all endpoints** in the collection
2. **Set up environment variables**
3. **Share with team members**
4. **Set up automated testing**
5. **Configure monitors** for API health
