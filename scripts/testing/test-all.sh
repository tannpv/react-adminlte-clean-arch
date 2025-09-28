#!/bin/bash

# Test All API endpoints with Newman
echo "🧪 Testing All API Endpoints"
echo "============================="

newman run postman/ReactAdminLTE.postman_collection.json \
    -e postman/Local.postman_environment.json \
    --reporters cli,html \
    --reporter-html-export reports/api-test-results.html \
    --reporter-cli-no-banner \
    --delay-request 500
