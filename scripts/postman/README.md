# 📮 Postman Upload Script

This folder contains a single, comprehensive script for uploading your Postman collection and environment to the cloud.

## 📁 Script

### `upload-to-postman.sh` 🚀 (Complete Upload)
**Purpose**: Upload both collection and environment to Postman cloud  
**Usage**: `./scripts/postman/upload-to-postman.sh [YOUR_API_KEY]`  
**Description**: Uploads both the collection and environment with "Development-[ProjectName]" naming to your Postman cloud workspace in one command.

**Examples**:
```bash
# Try with stored API key first, then prompt for input
./scripts/postman/upload-to-postman.sh

# Use provided API key
./scripts/postman/upload-to-postman.sh YOUR_API_KEY_HERE
```

## 🎯 Features

- ✅ **Complete Upload System** - Both collection and environment in one command
- ✅ **Stored API Key** - No need to enter API key every time after first use
- ✅ **Secure Storage** - API key stored with base64 encoding and restricted permissions
- ✅ **Path Resolution** - Works from any directory
- ✅ **Comprehensive Status** - Detailed reporting for both uploads
- ✅ **Team Collaboration** - Shared workspace access
- ✅ **Version Control** - Track collection and environment changes
- ✅ **79 API endpoints** - Complete multi-seller marketplace API

## 📋 Requirements

- Postman API key (get from https://web.postman.co/settings/me/api-keys)
- Collection file: `postman/ReactAdminLTE.postman_collection.json`
- Environment file: `postman/Local.postman_environment.json`
- `jq` command-line JSON processor

## 🔗 Related Files

- `postman/ReactAdminLTE.postman_collection.json` - Main collection file
- `postman/Local.postman_environment.json` - Environment variables (uploaded as "Development")

## 🚀 Quick Start

1. **Get your API key**: Visit https://web.postman.co/settings/me/api-keys
2. **Run the script**: `./scripts/postman/upload-to-postman.sh`
3. **Enter your API key** when prompted (it will be stored for future use)
4. **Check your Postman desktop app** - both collection and environment will appear automatically

## 📊 What Gets Uploaded

**Collection:** "Development-[ProjectName]"
- 79 API endpoints
- Complete multi-seller marketplace API
- Authentication, users, products, orders, etc.

**Environment:** "Development-[ProjectName]" 
- Base URL: `http://localhost:3001`
- All project variables for testing
- Token storage for authenticated requests

**Project Name Detection:**
- Automatically reads from `package.json` name field
- Falls back to directory name if package.json not found
- Cleans and formats the name (removes special characters, title case)