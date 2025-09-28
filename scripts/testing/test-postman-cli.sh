#!/bin/bash

# Test API endpoints with Official Postman CLI
echo "🚀 Testing with Official Postman CLI"
echo "====================================="

if command -v postman &> /dev/null; then
    echo "✅ Postman CLI found - Version: $(postman --version)"
    echo ""
    echo "🧪 Running collection with Postman CLI..."
    
    # Run the collection with official Postman CLI
    postman collection run postman/ReactAdminLTE.postman_collection.json
    
    echo ""
    echo "✅ Collection run completed!"
    echo ""
    echo "📋 Other Postman CLI commands:"
    echo "  postman login - Authenticate with Postman cloud"
    echo "  postman api - Publish and test APIs"
    echo "  postman monitor - Run monitors"
    echo "  postman spec - Lint and validate specifications"
else
    echo "❌ Official Postman CLI not found"
    echo ""
    echo "🔧 Install Postman CLI:"
    echo "  npm install -g postman-cli"
    echo ""
    echo "📋 Alternative: Use Newman CLI"
    echo "  ./scripts/test-auth.sh"
fi
