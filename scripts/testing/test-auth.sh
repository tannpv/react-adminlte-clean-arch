#!/bin/bash

# Test Authentication endpoints with Newman
echo "🔐 Testing Authentication Endpoints"
echo "===================================="

newman run postman/ReactAdminLTE.postman_collection.json \
    -e postman/Local.postman_environment.json \
    --folder "Auth" \
    --reporters cli \
    --reporter-cli-no-banner \
    --delay-request 1000
