#!/bin/bash

# Generate RSA keys for JWT authentication
# This script creates private and public keys for microservice authentication

echo "🔐 Generating RSA keys for JWT authentication..."

# Create keys directory if it doesn't exist
mkdir -p keys

# Generate private key (2048 bits)
echo "Generating private key..."
openssl genrsa -out keys/private.pem 2048

# Generate public key from private key
echo "Generating public key..."
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# Set proper permissions
chmod 600 keys/private.pem
chmod 644 keys/public.pem

echo "✅ Keys generated successfully!"
echo ""
echo "📁 Files created:"
echo "   - keys/private.pem (keep this secure!)"
echo "   - keys/public.pem (can be shared with other services)"
echo ""
echo "🔧 Configuration for your .env files:"
echo ""
echo "# Auth service (signs tokens)"
echo "JWT_ALGORITHM=RS256"
echo "JWT_PRIVATE_KEY_PATH=./keys/private.pem"
echo "JWT_EXPIRES_IN=24h"
echo "JWT_ISSUER=southern-martin-auth"
echo "JWT_AUDIENCE=southern-martin-apis"
echo ""
echo "# Other services (verify tokens)"
echo "JWT_ALGORITHM=RS256"
echo "JWT_PUBLIC_KEY_PATH=./keys/public.pem"
echo "JWT_ISSUER=southern-martin-auth"
echo "JWT_AUDIENCE=southern-martin-apis"
echo ""
echo "⚠️  Security Notes:"
echo "   - Keep private.pem secure and never commit to version control"
echo "   - Add keys/ directory to .gitignore"
echo "   - Distribute public.pem to all services that need to verify tokens"
echo "   - Consider using a key management service in production"
