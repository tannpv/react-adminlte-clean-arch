# 🧪 Testing Scripts

This folder contains scripts for testing the application, APIs, and running automated tests.

## 📁 Scripts

### `test-auth.sh`
**Purpose**: Test authentication endpoints  
**Usage**: `./scripts/testing/test-auth.sh`  
**Description**: Runs Newman CLI tests for authentication endpoints (Login, Register, Me).

### `test-all.sh`
**Purpose**: Test all API endpoints  
**Usage**: `./scripts/testing/test-all.sh`  
**Description**: Runs Newman CLI tests for all API endpoints in the collection.

### `test-postman-cli.sh`
**Purpose**: Test using official Postman CLI  
**Usage**: `./scripts/testing/test-postman-cli.sh`  
**Description**: Runs tests using the official Postman CLI instead of Newman.

### `smoke.mjs`
**Purpose**: Smoke test for basic functionality  
**Usage**: `node scripts/testing/smoke.mjs`  
**Description**: JavaScript-based smoke test to verify basic application functionality.

## 🎯 Features

- ✅ **Automated testing** - Run tests from command line
- ✅ **Multiple test runners** - Newman CLI and Postman CLI support
- ✅ **Authentication testing** - Verify login/register functionality
- ✅ **Full API coverage** - Test all 79 endpoints
- ✅ **CI/CD ready** - Integrate with deployment pipelines

## 📋 Requirements

- Newman CLI: `npm install -g newman`
- Postman CLI: `npm install -g postman-cli`
- Backend server running on `http://localhost:3001`
- Collection file: `postman/ReactAdminLTE.postman_collection.json`
- Environment file: `postman/Local.postman_environment.json`

## 🔗 Related Files

- `postman/ReactAdminLTE.postman_collection.json` - Test collection
- `postman/Local.postman_environment.json` - Test environment
- `NEWMAN-CLI-SETUP.md` - Newman CLI setup guide
