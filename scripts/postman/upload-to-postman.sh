#!/bin/bash

# Upload All Postman Assets Script
# This script uploads both the collection and environment to Postman

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Postman Complete Upload${NC}"
echo "=========================="
echo "This will upload both the collection and environment to Postman"
echo ""

# Ensure jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ 'jq' is not installed. Please install it to proceed (e.g., sudo apt-get install jq or brew install jq).${NC}"
    exit 1
fi

# API key file location
API_KEY_FILE="$HOME/.postman-api-key"

# Get project name
get_project_name() {
    # Try to get project name from package.json
    if [ -f "package.json" ]; then
        PROJECT_NAME=$(cat package.json | jq -r '.name' 2>/dev/null)
    elif [ -f "../../package.json" ]; then
        PROJECT_NAME=$(cat ../../package.json | jq -r '.name' 2>/dev/null)
    else
        # Fallback to directory name
        PROJECT_NAME=$(basename "$(pwd)")
    fi
    
    # Clean up project name (remove special characters, convert to title case)
    PROJECT_NAME=$(echo "$PROJECT_NAME" | sed 's/[^a-zA-Z0-9-]//g' | sed 's/-/ /g' | sed 's/\b\w/\U&/g' | sed 's/ //g')
    
    # Default fallback
    if [ -z "$PROJECT_NAME" ] || [ "$PROJECT_NAME" = "null" ]; then
        PROJECT_NAME="ReactAdminLTE"
    fi
    
    echo "$PROJECT_NAME"
}

# Function to get stored API key
get_stored_api_key() {
    if [ -f "$API_KEY_FILE" ]; then
        cat "$API_KEY_FILE" | base64 -d 2>/dev/null
    fi
}

# Function to store API key
store_api_key() {
    local api_key="$1"
    echo "$api_key" | base64 > "$API_KEY_FILE"
    chmod 600 "$API_KEY_FILE"
    echo -e "${GREEN}✅ API key stored securely for future use${NC}"
}

# Function to check if collection exists
check_collection_exists() {
    local api_key="$1"
    local collection_name="$2"
    local response=$(curl -s -X GET "https://api.getpostman.com/collections" -H "X-API-Key: $api_key")
    if echo "$response" | grep -q "\"name\":\"$collection_name\""; then
        return 0
    else
        return 1
    fi
}

# Function to get existing collection info
get_existing_collection_info() {
    local api_key="$1"
    local collection_name="$2"
    local response=$(curl -s -X GET "https://api.getpostman.com/collections" -H "X-API-Key: $api_key")
    echo "$response" | jq -r ".collections[] | select(.name == \"$collection_name\") | {name: .name, uid: .uid, id: .id, updatedAt: .updatedAt}" 2>/dev/null
}

# Function to handle collection conflict
handle_collection_conflict() {
    local api_key="$1"
    local method="$2"
    local collection_name="$3"
    
    echo -e "${YELLOW}⚠️  Collection '$collection_name' already exists!${NC}"
    echo ""
    
    # Get existing collection info
    local existing_info=$(get_existing_collection_info "$api_key" "$collection_name")
    if [ -n "$existing_info" ]; then
        echo -e "${BLUE}📋 Existing collection details:${NC}"
        echo "$existing_info"
        echo ""
    fi
    
    echo -e "${BLUE}🔧 Choose an action:${NC}"
    echo "1. Create a copy with timestamp (recommended)"
    echo "2. Override existing collection"
    echo "3. Cancel upload"
    echo ""
    
    # For now, always default to creating a copy to avoid infinite loops
    echo -e "${BLUE}📋 Creating a copy with timestamp (auto-selected)...${NC}"
    upload_collection_copy "$api_key" "$method" "$collection_name"
    return $?
}

# Function to upload collection copy
upload_collection_copy() {
    local api_key="$1"
    local method="$2"
    local original_name="$3"
    
    # Create timestamped name
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local new_name="${original_name} - ${timestamp}"
    
    echo -e "${BLUE}📝 Creating copy: $new_name${NC}"
    
    # Get collection file
    if [ -f "postman/ReactAdminLTE.postman_collection.json" ]; then
        COLLECTION_FILE="postman/ReactAdminLTE.postman_collection.json"
    elif [ -f "../../postman/ReactAdminLTE.postman_collection.json" ]; then
        COLLECTION_FILE="../../postman/ReactAdminLTE.postman_collection.json"
    else
        COLLECTION_FILE="postman/ReactAdminLTE.postman_collection.json"
    fi
    
    # Read the collection file and modify the name
    COLLECTION_DATA=$(cat "$COLLECTION_FILE" | jq ".info.name = \"$new_name\"")
    WRAPPED_DATA="{\"collection\": $COLLECTION_DATA}"
    
    # Upload collection
    RESPONSE=$(curl -s -X POST \
        "https://api.getpostman.com/collections" \
        -H "X-API-Key: $api_key" \
        -H "Content-Type: application/json" \
        -d "$WRAPPED_DATA")
    
    # Check if upload was successful
    if echo "$RESPONSE" | grep -q '"uid"'; then
        COLLECTION_UID=$(echo "$RESPONSE" | jq -r '.collection.uid')
        COLLECTION_NAME=$(echo "$RESPONSE" | jq -r '.collection.name')
        echo -e "${GREEN}✅ Collection copy uploaded successfully!${NC}"
        echo -e "${GREEN}   Name: $COLLECTION_NAME${NC}"
        echo -e "${GREEN}   UID: $COLLECTION_UID${NC}"
        echo -e "${GREEN}   Method: $method${NC}"
        return 0
    else
        echo -e "${RED}❌ Collection copy upload failed${NC}"
        echo -e "${RED}   Response: $RESPONSE${NC}"
        return 1
    fi
}

# Function to override existing collection
upload_collection_override() {
    local api_key="$1"
    local method="$2"
    local collection_name="$3"
    
    # Get existing collection UID
    local response=$(curl -s -X GET "https://api.getpostman.com/collections" -H "X-API-Key: $api_key")
    local existing_uid=$(echo "$response" | jq -r ".collections[] | select(.name == \"$collection_name\") | .uid" 2>/dev/null)
    
    if [ -z "$existing_uid" ] || [ "$existing_uid" = "null" ]; then
        echo -e "${RED}❌ Could not find existing collection UID${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📝 Overriding collection with UID: $existing_uid${NC}"
    
    # Get collection file
    if [ -f "postman/ReactAdminLTE.postman_collection.json" ]; then
        COLLECTION_FILE="postman/ReactAdminLTE.postman_collection.json"
    elif [ -f "../../postman/ReactAdminLTE.postman_collection.json" ]; then
        COLLECTION_FILE="../../postman/ReactAdminLTE.postman_collection.json"
    else
        COLLECTION_FILE="postman/ReactAdminLTE.postman_collection.json"
    fi
    
    # Read the collection file and modify the name
    COLLECTION_DATA=$(cat "$COLLECTION_FILE" | jq ".info.name = \"$collection_name\"")
    WRAPPED_DATA="{\"collection\": $COLLECTION_DATA}"
    
    # Update collection using PUT
    RESPONSE=$(curl -s -X PUT \
        "https://api.getpostman.com/collections/$existing_uid" \
        -H "X-API-Key: $api_key" \
        -H "Content-Type: application/json" \
        -d "$WRAPPED_DATA")
    
    # Check if update was successful
    if echo "$RESPONSE" | grep -q '"uid"'; then
        COLLECTION_UID=$(echo "$RESPONSE" | jq -r '.collection.uid')
        COLLECTION_NAME=$(echo "$RESPONSE" | jq -r '.collection.name')
        echo -e "${GREEN}✅ Collection overridden successfully!${NC}"
        echo -e "${GREEN}   Name: $COLLECTION_NAME${NC}"
        echo -e "${GREEN}   UID: $COLLECTION_UID${NC}"
        echo -e "${GREEN}   Method: $method${NC}"
        return 0
    else
        echo -e "${RED}❌ Collection override failed${NC}"
        echo -e "${RED}   Response: $RESPONSE${NC}"
        return 1
    fi
}

# Function to upload collection
upload_collection() {
    local api_key="$1"
    local method="$2"
    
    echo -e "${BLUE}📤 Uploading collection using $method...${NC}"
    
    # Check collection file (adjust path based on current directory)
    if [ -f "postman/ReactAdminLTE.postman_collection.json" ]; then
        COLLECTION_FILE="postman/ReactAdminLTE.postman_collection.json"
    elif [ -f "../../postman/ReactAdminLTE.postman_collection.json" ]; then
        COLLECTION_FILE="../../postman/ReactAdminLTE.postman_collection.json"
    else
        COLLECTION_FILE="postman/ReactAdminLTE.postman_collection.json"
    fi
    
    if [ ! -f "$COLLECTION_FILE" ]; then
        echo -e "${RED}❌ Collection file not found: $COLLECTION_FILE${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📁 Using collection file: $COLLECTION_FILE${NC}"
    
    # Get project name and create collection name
    PROJECT_NAME=$(get_project_name)
    COLLECTION_NAME="Development-$PROJECT_NAME"
    
    echo -e "${BLUE}📝 Collection will be named: $COLLECTION_NAME${NC}"
    
    # Check if collection already exists
    if check_collection_exists "$api_key" "$COLLECTION_NAME"; then
        handle_collection_conflict "$api_key" "$method" "$COLLECTION_NAME"
        return $?
    fi
    
    # Read the collection file and modify the name
    COLLECTION_DATA=$(cat "$COLLECTION_FILE" | jq ".info.name = \"$COLLECTION_NAME\"")
    WRAPPED_DATA="{\"collection\": $COLLECTION_DATA}"
    
    # Upload collection
    RESPONSE=$(curl -s -X POST \
        "https://api.getpostman.com/collections" \
        -H "X-API-Key: $api_key" \
        -H "Content-Type: application/json" \
        -d "$WRAPPED_DATA")
    
    # Check if upload was successful
    if echo "$RESPONSE" | grep -q '"uid"'; then
        COLLECTION_UID=$(echo "$RESPONSE" | jq -r '.collection.uid')
        COLLECTION_NAME=$(echo "$RESPONSE" | jq -r '.collection.name')
        echo -e "${GREEN}✅ Collection uploaded successfully!${NC}"
        echo -e "${GREEN}   Name: $COLLECTION_NAME${NC}"
        echo -e "${GREEN}   UID: $COLLECTION_UID${NC}"
        echo -e "${GREEN}   Method: $method${NC}"
        return 0
    else
        echo -e "${RED}❌ Collection upload failed${NC}"
        echo -e "${RED}   Response: $RESPONSE${NC}"
        return 1
    fi
}

# Function to check if environment exists
check_environment_exists() {
    local api_key="$1"
    local environment_name="$2"
    local response=$(curl -s -X GET "https://api.getpostman.com/environments" -H "X-API-Key: $api_key")
    if echo "$response" | grep -q "\"name\":\"$environment_name\""; then
        return 0
    else
        return 1
    fi
}

# Function to get existing environment info
get_existing_environment_info() {
    local api_key="$1"
    local environment_name="$2"
    local response=$(curl -s -X GET "https://api.getpostman.com/environments" -H "X-API-Key: $api_key")
    echo "$response" | jq -r ".environments[] | select(.name == \"$environment_name\") | {name: .name, uid: .uid, id: .id, updatedAt: .updatedAt}" 2>/dev/null
}

# Function to handle environment conflict
handle_environment_conflict() {
    local api_key="$1"
    local method="$2"
    local environment_name="$3"
    
    echo -e "${YELLOW}⚠️  Environment '$environment_name' already exists!${NC}"
    echo ""
    
    # Get existing environment info
    local existing_info=$(get_existing_environment_info "$api_key" "$environment_name")
    if [ -n "$existing_info" ]; then
        echo -e "${BLUE}📋 Existing environment details:${NC}"
        echo "$existing_info"
        echo ""
    fi
    
    echo -e "${BLUE}🔧 Choose an action:${NC}"
    echo "1. Create a copy with timestamp (recommended)"
    echo "2. Override existing environment"
    echo "3. Cancel upload"
    echo ""
    
    # For now, always default to creating a copy to avoid infinite loops
    echo -e "${BLUE}📋 Creating a copy with timestamp (auto-selected)...${NC}"
    upload_environment_copy "$api_key" "$method" "$environment_name"
    return $?
}

# Function to upload environment copy
upload_environment_copy() {
    local api_key="$1"
    local method="$2"
    local original_name="$3"
    
    # Create timestamped name
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local new_name="${original_name} - ${timestamp}"
    
    echo -e "${BLUE}📝 Creating copy: $new_name${NC}"
    
    # Get environment file
    if [ -f "postman/Local.postman_environment.json" ]; then
        ENVIRONMENT_FILE="postman/Local.postman_environment.json"
    elif [ -f "../../postman/Local.postman_environment.json" ]; then
        ENVIRONMENT_FILE="../../postman/Local.postman_environment.json"
    else
        ENVIRONMENT_FILE="postman/Local.postman_environment.json"
    fi
    
    # Read the environment file and modify the name
    ENVIRONMENT_DATA=$(cat "$ENVIRONMENT_FILE" | jq ".name = \"$new_name\"")
    WRAPPED_DATA="{\"environment\": $ENVIRONMENT_DATA}"
    
    # Upload environment
    RESPONSE=$(curl -s -X POST \
        "https://api.getpostman.com/environments" \
        -H "X-API-Key: $api_key" \
        -H "Content-Type: application/json" \
        -d "$WRAPPED_DATA")
    
    # Check if upload was successful
    if echo "$RESPONSE" | grep -q '"uid"'; then
        ENVIRONMENT_UID=$(echo "$RESPONSE" | jq -r '.environment.uid')
        ENVIRONMENT_NAME=$(echo "$RESPONSE" | jq -r '.environment.name')
        echo -e "${GREEN}✅ Environment copy uploaded successfully!${NC}"
        echo -e "${GREEN}   Name: $ENVIRONMENT_NAME${NC}"
        echo -e "${GREEN}   UID: $ENVIRONMENT_UID${NC}"
        echo -e "${GREEN}   Method: $method${NC}"
        return 0
    else
        echo -e "${RED}❌ Environment copy upload failed${NC}"
        echo -e "${RED}   Response: $RESPONSE${NC}"
        return 1
    fi
}

# Function to override existing environment
upload_environment_override() {
    local api_key="$1"
    local method="$2"
    local environment_name="$3"
    
    # Get existing environment UID
    local response=$(curl -s -X GET "https://api.getpostman.com/environments" -H "X-API-Key: $api_key")
    local existing_uid=$(echo "$response" | jq -r ".environments[] | select(.name == \"$environment_name\") | .uid" 2>/dev/null)
    
    if [ -z "$existing_uid" ] || [ "$existing_uid" = "null" ]; then
        echo -e "${RED}❌ Could not find existing environment UID${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📝 Overriding environment with UID: $existing_uid${NC}"
    
    # Get environment file
    if [ -f "postman/Local.postman_environment.json" ]; then
        ENVIRONMENT_FILE="postman/Local.postman_environment.json"
    elif [ -f "../../postman/Local.postman_environment.json" ]; then
        ENVIRONMENT_FILE="../../postman/Local.postman_environment.json"
    else
        ENVIRONMENT_FILE="postman/Local.postman_environment.json"
    fi
    
    # Read the environment file and modify the name
    ENVIRONMENT_DATA=$(cat "$ENVIRONMENT_FILE" | jq ".name = \"$environment_name\"")
    WRAPPED_DATA="{\"environment\": $ENVIRONMENT_DATA}"
    
    # Update environment using PUT
    RESPONSE=$(curl -s -X PUT \
        "https://api.getpostman.com/environments/$existing_uid" \
        -H "X-API-Key: $api_key" \
        -H "Content-Type: application/json" \
        -d "$WRAPPED_DATA")
    
    # Check if update was successful
    if echo "$RESPONSE" | grep -q '"uid"'; then
        ENVIRONMENT_UID=$(echo "$RESPONSE" | jq -r '.environment.uid')
        ENVIRONMENT_NAME=$(echo "$RESPONSE" | jq -r '.environment.name')
        echo -e "${GREEN}✅ Environment overridden successfully!${NC}"
        echo -e "${GREEN}   Name: $ENVIRONMENT_NAME${NC}"
        echo -e "${GREEN}   UID: $ENVIRONMENT_UID${NC}"
        echo -e "${GREEN}   Method: $method${NC}"
        return 0
    else
        echo -e "${RED}❌ Environment override failed${NC}"
        echo -e "${RED}   Response: $RESPONSE${NC}"
        return 1
    fi
}

# Function to upload environment
upload_environment() {
    local api_key="$1"
    local method="$2"
    
    echo -e "${BLUE}📤 Uploading environment using $method...${NC}"
    
    # Check environment file (adjust path based on current directory)
    if [ -f "postman/Local.postman_environment.json" ]; then
        ENVIRONMENT_FILE="postman/Local.postman_environment.json"
    elif [ -f "../../postman/Local.postman_environment.json" ]; then
        ENVIRONMENT_FILE="../../postman/Local.postman_environment.json"
    else
        ENVIRONMENT_FILE="postman/Local.postman_environment.json"
    fi
    
    if [ ! -f "$ENVIRONMENT_FILE" ]; then
        echo -e "${RED}❌ Environment file not found: $ENVIRONMENT_FILE${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📁 Using environment file: $ENVIRONMENT_FILE${NC}"
    
    # Get project name and create environment name
    PROJECT_NAME=$(get_project_name)
    ENVIRONMENT_NAME="Development-$PROJECT_NAME"
    
    echo -e "${BLUE}📝 Environment will be named: $ENVIRONMENT_NAME${NC}"
    
    # Check if environment already exists
    if check_environment_exists "$api_key" "$ENVIRONMENT_NAME"; then
        handle_environment_conflict "$api_key" "$method" "$ENVIRONMENT_NAME"
        return $?
    fi
    
    # Read the environment file and modify the name
    ENVIRONMENT_DATA=$(cat "$ENVIRONMENT_FILE" | jq ".name = \"$ENVIRONMENT_NAME\"")
    WRAPPED_DATA="{\"environment\": $ENVIRONMENT_DATA}"
    
    # Upload environment
    RESPONSE=$(curl -s -X POST \
        "https://api.getpostman.com/environments" \
        -H "X-API-Key: $api_key" \
        -H "Content-Type: application/json" \
        -d "$WRAPPED_DATA")
    
    # Check if upload was successful
    if echo "$RESPONSE" | grep -q '"uid"'; then
        ENVIRONMENT_UID=$(echo "$RESPONSE" | jq -r '.environment.uid')
        ENVIRONMENT_NAME=$(echo "$RESPONSE" | jq -r '.environment.name')
        echo -e "${GREEN}✅ Environment uploaded successfully!${NC}"
        echo -e "${GREEN}   Name: $ENVIRONMENT_NAME${NC}"
        echo -e "${GREEN}   UID: $ENVIRONMENT_UID${NC}"
        echo -e "${GREEN}   Method: $method${NC}"
        return 0
    else
        echo -e "${RED}❌ Environment upload failed${NC}"
        echo -e "${RED}   Response: $RESPONSE${NC}"
        return 1
    fi
}

# Main logic
echo -e "${BLUE}🔍 Checking for stored API key...${NC}"

# Try stored API key first
STORED_API_KEY=$(get_stored_api_key)
if [ -n "$STORED_API_KEY" ]; then
    echo -e "${GREEN}✅ Found stored API key${NC}"
    
    # Upload Collection
    echo -e "${BLUE}📦 Step 1: Uploading Collection...${NC}"
    echo "=================================="
    if upload_collection "$STORED_API_KEY" "stored API key"; then
        COLLECTION_SUCCESS=true
    else
        COLLECTION_SUCCESS=false
    fi
    
    echo ""
    
    # Upload Environment
    echo -e "${BLUE}🌍 Step 2: Uploading Environment...${NC}"
    echo "===================================="
    if upload_environment "$STORED_API_KEY" "stored API key"; then
        ENVIRONMENT_SUCCESS=true
    else
        ENVIRONMENT_SUCCESS=false
    fi
    
    echo ""
    echo -e "${BLUE}📊 Upload Summary${NC}"
    echo "================"
    
    if [ "$COLLECTION_SUCCESS" = true ]; then
        echo -e "${GREEN}✅ Collection: Uploaded successfully${NC}"
    else
        echo -e "${RED}❌ Collection: Upload failed${NC}"
    fi
    
    if [ "$ENVIRONMENT_SUCCESS" = true ]; then
        echo -e "${GREEN}✅ Environment: Uploaded successfully${NC}"
    else
        echo -e "${RED}❌ Environment: Upload failed${NC}"
    fi
    
    echo ""
    if [ "$COLLECTION_SUCCESS" = true ] && [ "$ENVIRONMENT_SUCCESS" = true ]; then
        echo -e "${GREEN}🎉 All uploads completed successfully!${NC}"
        echo -e "${BLUE}💡 You can now use both the collection and environment in your Postman desktop app${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Some uploads failed. Check the output above for details.${NC}"
        exit 1
    fi
fi

# Try provided API key if available
if [ -n "$1" ]; then
    echo -e "${BLUE}🔑 Using provided API key...${NC}"
    
    # Upload Collection
    echo -e "${BLUE}📦 Step 1: Uploading Collection...${NC}"
    echo "=================================="
    if upload_collection "$1" "provided API key"; then
        COLLECTION_SUCCESS=true
    else
        COLLECTION_SUCCESS=false
    fi
    
    echo ""
    
    # Upload Environment
    echo -e "${BLUE}🌍 Step 2: Uploading Environment...${NC}"
    echo "===================================="
    if upload_environment "$1" "provided API key"; then
        ENVIRONMENT_SUCCESS=true
    else
        ENVIRONMENT_SUCCESS=false
    fi
    
    echo ""
    echo -e "${BLUE}📊 Upload Summary${NC}"
    echo "================"
    
    if [ "$COLLECTION_SUCCESS" = true ]; then
        echo -e "${GREEN}✅ Collection: Uploaded successfully${NC}"
    else
        echo -e "${RED}❌ Collection: Upload failed${NC}"
    fi
    
    if [ "$ENVIRONMENT_SUCCESS" = true ]; then
        echo -e "${GREEN}✅ Environment: Uploaded successfully${NC}"
    else
        echo -e "${RED}❌ Environment: Upload failed${NC}"
    fi
    
    echo ""
    if [ "$COLLECTION_SUCCESS" = true ] && [ "$ENVIRONMENT_SUCCESS" = true ]; then
        store_api_key "$1"
        echo -e "${GREEN}🎉 All uploads completed successfully!${NC}"
        echo -e "${BLUE}💡 You can now use both the collection and environment in your Postman desktop app${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Some uploads failed. Check the output above for details.${NC}"
        exit 1
    fi
fi

# Interactive API key input
echo -e "${YELLOW}⚠️  No stored API key found${NC}"
echo -e "${BLUE}📋 To get your Postman API key:${NC}"
echo "1. Go to: https://web.postman.co/settings/me/api-keys"
echo "2. Click 'Generate API Key'"
echo "3. Copy the generated key"
echo ""

# Check if API key is already stored
if [ -f "$API_KEY_FILE" ]; then
    echo -e "${BLUE}🔑 Using stored API key...${NC}"
    USER_API_KEY=$(get_stored_api_key)
else
    echo -e "${YELLOW}⚠️  No stored API key found.${NC}"
    echo -e "${YELLOW}   Please run the script interactively first to store your API key.${NC}"
    echo -e "${YELLOW}   Or manually create the file: $API_KEY_FILE${NC}"
    exit 1
fi

if [ -z "$USER_API_KEY" ]; then
    echo -e "${RED}❌ No API key available. Aborting upload.${NC}"
    exit 1
fi

# Upload Collection
echo -e "${BLUE}📦 Step 1: Uploading Collection...${NC}"
echo "=================================="
if upload_collection "$USER_API_KEY" "interactive API key"; then
    COLLECTION_SUCCESS=true
else
    COLLECTION_SUCCESS=false
fi

echo ""

# Upload Environment
echo -e "${BLUE}🌍 Step 2: Uploading Environment...${NC}"
echo "===================================="
if upload_environment "$USER_API_KEY" "interactive API key"; then
    ENVIRONMENT_SUCCESS=true
else
    ENVIRONMENT_SUCCESS=false
fi

echo ""
echo -e "${BLUE}📊 Upload Summary${NC}"
echo "================"

if [ "$COLLECTION_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Collection: Uploaded successfully${NC}"
else
    echo -e "${RED}❌ Collection: Upload failed${NC}"
fi

if [ "$ENVIRONMENT_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Environment: Uploaded successfully${NC}"
else
    echo -e "${RED}❌ Environment: Upload failed${NC}"
fi

echo ""
if [ "$COLLECTION_SUCCESS" = true ] && [ "$ENVIRONMENT_SUCCESS" = true ]; then
    store_api_key "$USER_API_KEY"
    echo -e "${GREEN}🎉 All uploads completed successfully!${NC}"
    echo -e "${BLUE}💡 You can now use both the collection and environment in your Postman desktop app${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some uploads failed. Check the output above for details.${NC}"
    exit 1
fi