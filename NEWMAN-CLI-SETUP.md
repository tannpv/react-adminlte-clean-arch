# 🚀 Postman CLI Tools Setup Guide

## Available CLI Tools

### 1. Newman (Collection Runner)
Newman is the command-line collection runner for Postman. It allows you to run and test Postman collections directly from the command line, making it perfect for:

### 2. Official Postman CLI
The official Postman CLI provides additional features like cloud integration, API publishing, and monitoring. It's perfect for:

- 🧪 **Automated Testing**
- 🔄 **CI/CD Integration**
- 📊 **API Monitoring**
- 🚀 **Quick API Validation**

## 📦 Installation

### Newman (Collection Runner)
```bash
npm install -g newman
```

### Official Postman CLI
```bash
npm install -g postman-cli
```

### Both Tools
```bash
npm install -g newman postman-cli
```

## ✅ Verify Installation
```bash
newman --version
postman --version
```

## 🎯 Quick Start

### 1. Test Health Endpoint
```bash
newman run postman/ReactAdminLTE.postman_collection.json \
    -e postman/Local.postman_environment.json \
    --folder "Health"
```

### 2. Test Authentication
```bash
newman run postman/ReactAdminLTE.postman_collection.json \
    -e postman/Local.postman_environment.json \
    --folder "Auth"
```

### 3. Test All Endpoints (Newman)
```bash
newman run postman/ReactAdminLTE.postman_collection.json \
    -e postman/Local.postman_environment.json
```

### 4. Test with Official Postman CLI
```bash
postman collection run postman/ReactAdminLTE.postman_collection.json
```

### 5. Login to Postman Cloud
```bash
postman login
```

## 🛠️ Available Scripts

We've created several convenience scripts:

### Import & Test
```bash
./scripts/import-postman.sh
```

### Test Authentication
```bash
./scripts/test-auth.sh
```

### Test All APIs
```bash
./scripts/test-all.sh
```

### Test with Official Postman CLI
```bash
./scripts/test-postman-cli.sh
```

## 📊 Reporters

### CLI Reporter (Default)
```bash
newman run collection.json --reporters cli
```

### HTML Reporter
```bash
newman run collection.json --reporters html --reporter-html-export report.html
```

### JSON Reporter
```bash
newman run collection.json --reporters json --reporter-json-export report.json
```

### Multiple Reporters
```bash
newman run collection.json \
    --reporters cli,html,json \
    --reporter-html-export html-report.html \
    --reporter-json-export json-report.json
```

## ⚙️ Common Options

### Delay Between Requests
```bash
newman run collection.json --delay-request 1000  # 1 second delay
```

### Iterations
```bash
newman run collection.json --iteration-count 5  # Run 5 times
```

### Specific Folder
```bash
newman run collection.json --folder "Auth"  # Only run Auth folder
```

### Environment Variables
```bash
newman run collection.json \
    -e environment.json \
    --env-var "baseUrl=http://localhost:3001"
```

### Global Variables
```bash
newman run collection.json \
    --global-var "token=your-jwt-token"
```

## 🔧 Advanced Usage

### With Custom Headers
```bash
newman run collection.json \
    --header "Authorization: Bearer your-token"
```

### With Data Files
```bash
newman run collection.json \
    --data data.csv  # CSV data file
```

### With Pre-request Scripts
```bash
newman run collection.json \
    --pre-request-script pre-request.js
```

## 🚨 Troubleshooting

### Common Issues

1. **Collection not found**
   ```bash
   # Check file path
   ls -la postman/ReactAdminLTE.postman_collection.json
   ```

2. **Environment not found**
   ```bash
   # Check environment file
   ls -la postman/Local.postman_environment.json
   ```

3. **Server not running**
   ```bash
   # Start backend server
   npm run dev:server
   ```

4. **Permission denied**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   ```

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: newman run postman/ReactAdminLTE.postman_collection.json -e postman/Local.postman_environment.json
```

### Jenkins Pipeline Example
```groovy
pipeline {
    agent any
    stages {
        stage('API Tests') {
            steps {
                sh 'npm install -g newman'
                sh 'newman run postman/ReactAdminLTE.postman_collection.json -e postman/Local.postman_environment.json'
            }
        }
    }
}
```

## 🎉 Benefits

- ✅ **Automated Testing**: Run tests without opening Postman
- ✅ **CI/CD Integration**: Include in your deployment pipeline
- ✅ **Multiple Reporters**: Generate HTML, JSON, or CLI reports
- ✅ **Environment Support**: Test against different environments
- ✅ **Data-Driven Testing**: Use CSV or JSON data files
- ✅ **Scheduled Testing**: Run tests on a schedule
- ✅ **Team Collaboration**: Share test results with your team

## 🔗 Useful Links

- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Postman Collection Format](https://schema.getpostman.com/json/collection/v2.1.0/collection.json)
- [Newman GitHub Repository](https://github.com/postmanlabs/newman)
