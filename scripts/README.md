# 📁 Scripts Directory

This directory contains organized scripts for different aspects of the Modern Admin Dashboard project.

## 📂 Folder Structure

### 📮 `postman/` - Postman Collection Management
Scripts for managing Postman collections and API testing.

**Scripts**:
- `upload-collection.sh` - Upload collection to Postman cloud workspace
- `upload-smart.sh` ⭐ - Smart upload with stored API key and fallbacks
- `upload-with-stored-key.sh` - Upload using stored API key
- `setup-api-key.sh` 🚀 - One-time API key setup
- `manage-api-key.sh` - Manage stored API key
- `login-and-upload.sh` - Login to Postman CLI and upload collection
- `upload-with-auto-key.sh` - Upload using automatically extracted CLI API key

**Usage**:
```bash
# One-time setup (recommended first time)
./scripts/postman/setup-api-key.sh

# Smart upload with stored key (recommended)
./scripts/postman/upload-smart.sh

# Login and upload
./scripts/postman/login-and-upload.sh

# Direct upload with API key
./scripts/postman/upload-collection.sh YOUR_API_KEY
```

### 🧪 `testing/` - Testing and Quality Assurance
Scripts for running tests, API validation, and quality checks.

**Scripts**:
- `test-auth.sh` - Test authentication endpoints
- `test-all.sh` - Test all API endpoints
- `test-postman-cli.sh` - Test using official Postman CLI
- `smoke.mjs` - Smoke test for basic functionality

**Usage**:
```bash
./scripts/testing/test-auth.sh
./scripts/testing/test-all.sh
./scripts/testing/test-postman-cli.sh
node scripts/testing/smoke.mjs
```

### 🔧 `devops/` - Development Operations
Scripts for server management, deployment, and development operations.

**Scripts**:
- `stop-all.sh` - Stop all running Node.js processes

**Usage**:
```bash
./scripts/devops/stop-all.sh
```

## 🎯 Quick Reference

### Most Common Commands

```bash
# Setup API key (one-time)
./scripts/postman/setup-api-key.sh

# Upload Postman collection (smart with stored key)
./scripts/postman/upload-smart.sh

# Test authentication
./scripts/testing/test-auth.sh

# Test all APIs
./scripts/testing/test-all.sh

# Stop all processes
./scripts/devops/stop-all.sh
```

## 📋 Requirements

### For Postman Scripts
- Postman API key
- Collection and environment files

### For Testing Scripts
- Newman CLI: `npm install -g newman`
- Postman CLI: `npm install -g postman-cli`
- Backend server running

### For DevOps Scripts
- Node.js environment
- Appropriate permissions

## 🔗 Related Documentation

- `API-UPLOAD-GUIDE.md` - Postman collection upload guide
- `NEWMAN-CLI-SETUP.md` - Newman CLI setup guide
- `postman/` - Postman collection files
- `package.json` - Project dependencies and scripts

## 🎉 Benefits

- ✅ **Organized structure** - Clear separation of concerns
- ✅ **Easy navigation** - Find scripts by purpose
- ✅ **Documentation** - Each folder has its own README
- ✅ **Maintainable** - Easy to add new scripts
- ✅ **Team friendly** - Clear for all team members
