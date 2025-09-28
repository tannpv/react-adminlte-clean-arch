#!/bin/bash

# Postman Upload Script
# Uploads collection and environment to Postman cloud workspace
# Author: Clean Code Refactor
# Version: 2.0

set -euo pipefail

# =============================================================================
# CONSTANTS AND CONFIGURATION
# =============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
readonly API_KEY_FILE="$HOME/.postman-api-key"

# Postman API endpoints
readonly POSTMAN_API_BASE="https://api.getpostman.com"
readonly COLLECTIONS_ENDPOINT="$POSTMAN_API_BASE/collections"
readonly ENVIRONMENTS_ENDPOINT="$POSTMAN_API_BASE/environments"

# File paths
readonly COLLECTION_FILE_NAME="ReactAdminLTE.postman_collection.json"
readonly ENVIRONMENT_FILE_NAME="Local.postman_environment.json"

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Print colored output
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if required tools are installed
check_dependencies() {
    local missing_tools=()
    
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_info "Please install them to proceed:"
        for tool in "${missing_tools[@]}"; do
            case "$tool" in
                "jq") echo "  - jq: sudo apt-get install jq or brew install jq" ;;
                "curl") echo "  - curl: sudo apt-get install curl or brew install curl" ;;
            esac
        done
        exit 1
    fi
}

# =============================================================================
# PROJECT NAME DETECTION
# =============================================================================

get_project_name() {
    local project_name=""
    
    # Try to get project name from package.json
    for package_file in "package.json" "../../package.json"; do
        if [ -f "$package_file" ]; then
            project_name=$(jq -r '.name // empty' "$package_file" 2>/dev/null)
            [ -n "$project_name" ] && break
        fi
    done
    
    # Fallback to directory name
    if [ -z "$project_name" ] || [ "$project_name" = "null" ]; then
        project_name=$(basename "$(pwd)")
    fi
    
    # Clean up project name (remove special characters, convert to title case)
    project_name=$(echo "$project_name" | sed 's/[^a-zA-Z0-9-]//g' | sed 's/-/ /g' | sed 's/\b\w/\U&/g' | sed 's/ //g')
    
    # Default fallback
    if [ -z "$project_name" ]; then
        project_name="ReactAdminLTE"
    fi
    
    echo "$project_name"
}

# =============================================================================
# API KEY MANAGEMENT
# =============================================================================

get_stored_api_key() {
    if [ -f "$API_KEY_FILE" ]; then
        base64 -d "$API_KEY_FILE" 2>/dev/null || return 1
    fi
}

store_api_key() {
    local api_key="$1"
    echo "$api_key" | base64 > "$API_KEY_FILE"
    chmod 600 "$API_KEY_FILE"
    print_success "API key stored securely for future use"
}

# =============================================================================
# FILE PATH RESOLUTION
# =============================================================================

find_file() {
    local filename="$1"
    local search_paths=(
        "postman/$filename"
        "../../postman/$filename"
        "$PROJECT_ROOT/postman/$filename"
    )
    
    for path in "${search_paths[@]}"; do
        if [ -f "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    
    return 1
}

# =============================================================================
# POSTMAN API FUNCTIONS
# =============================================================================

# Make API request with error handling
make_api_request() {
    local method="$1"
    local url="$2"
    local api_key="$3"
    local data="${4:-}"
    local headers=(-H "X-API-Key: $api_key")
    
    if [ -n "$data" ]; then
        headers+=(-H "Content-Type: application/json")
    fi
    
    local response
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$url" "${headers[@]}" -d "$data")
    else
        response=$(curl -s -X "$method" "$url" "${headers[@]}")
    fi
    
    # Check for curl errors
    if [ $? -ne 0 ]; then
        print_error "API request failed"
        return 1
    fi
    
    echo "$response"
}

# Check if resource exists by name
resource_exists() {
    local api_key="$1"
    local resource_name="$2"
    local endpoint="$3"
    
    local response
    response=$(make_api_request "GET" "$endpoint" "$api_key")
    
    if echo "$response" | jq -e ".${endpoint##*/}[] | select(.name == \"$resource_name\")" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get resource UID by name
get_resource_uid() {
    local api_key="$1"
    local resource_name="$2"
    local endpoint="$3"
    
    local response
    response=$(make_api_request "GET" "$endpoint" "$api_key")
    
    echo "$response" | jq -r ".${endpoint##*/}[] | select(.name == \"$resource_name\") | .uid" 2>/dev/null
}

# Get resource info by name
get_resource_info() {
    local api_key="$1"
    local resource_name="$2"
    local endpoint="$3"
    
    local response
    response=$(make_api_request "GET" "$endpoint" "$api_key")
    
    echo "$response" | jq -r ".${endpoint##*/}[] | select(.name == \"$resource_name\") | {name: .name, uid: .uid, id: .id, updatedAt: .updatedAt}" 2>/dev/null
}

# =============================================================================
# COLLECTION FUNCTIONS
# =============================================================================

check_collection_exists() {
    resource_exists "$1" "$2" "$COLLECTIONS_ENDPOINT"
}

get_collection_uid() {
    get_resource_uid "$1" "$2" "$COLLECTIONS_ENDPOINT"
}

get_collection_info() {
    get_resource_info "$1" "$2" "$COLLECTIONS_ENDPOINT"
}

upload_collection() {
    local api_key="$1"
    local collection_name="$2"
    local collection_file="$3"
    
    local collection_data
    collection_data=$(jq ".info.name = \"$collection_name\"" "$collection_file")
    local wrapped_data="{\"collection\": $collection_data}"
    
    local response
    response=$(make_api_request "POST" "$COLLECTIONS_ENDPOINT" "$api_key" "$wrapped_data")
    
    if echo "$response" | jq -e '.collection.uid' >/dev/null 2>&1; then
        local uid name
        uid=$(echo "$response" | jq -r '.collection.uid')
        name=$(echo "$response" | jq -r '.collection.name')
        print_success "Collection uploaded successfully!"
        print_info "  Name: $name"
        print_info "  UID: $uid"
        return 0
    else
        print_error "Collection upload failed"
        print_error "  Response: $response"
        return 1
    fi
}

update_collection() {
    local api_key="$1"
    local collection_uid="$2"
    local collection_name="$3"
    local collection_file="$4"
    
    local collection_data
    collection_data=$(jq ".info.name = \"$collection_name\"" "$collection_file")
    local wrapped_data="{\"collection\": $collection_data}"
    
    local response
    response=$(make_api_request "PUT" "$COLLECTIONS_ENDPOINT/$collection_uid" "$api_key" "$wrapped_data")
    
    if echo "$response" | jq -e '.collection.uid' >/dev/null 2>&1; then
        local uid name
        uid=$(echo "$response" | jq -r '.collection.uid')
        name=$(echo "$response" | jq -r '.collection.name')
        print_success "Collection updated successfully!"
        print_info "  Name: $name"
        print_info "  UID: $uid"
        return 0
    else
        print_error "Collection update failed"
        print_error "  Response: $response"
        return 1
    fi
}

handle_collection_conflict() {
    local api_key="$1"
    local collection_name="$2"
    local collection_file="$3"
    
    print_warning "Collection '$collection_name' already exists!"
    
    # Get existing collection info
    local existing_info
    existing_info=$(get_collection_info "$api_key" "$collection_name")
    if [ -n "$existing_info" ]; then
        print_info "Existing collection details:"
        echo "$existing_info"
    fi
    
    # Auto-select creating a copy to avoid interactive loops
    print_info "Creating a copy with timestamp (auto-selected)..."
    
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local new_name="${collection_name} - ${timestamp}"
    
    upload_collection "$api_key" "$new_name" "$collection_file"
}

process_collection() {
    local api_key="$1"
    
    print_info "Processing collection..."
    
    # Find collection file
    local collection_file
    if ! collection_file=$(find_file "$COLLECTION_FILE_NAME"); then
        print_error "Collection file not found: $COLLECTION_FILE_NAME"
        return 1
    fi
    
    print_info "Using collection file: $collection_file"
    
    # Get project name and create collection name
    local project_name collection_name
    project_name=$(get_project_name)
    collection_name="Development-$project_name"
    
    print_info "Collection will be named: $collection_name"
    
    # Check if collection already exists
    if check_collection_exists "$api_key" "$collection_name"; then
        handle_collection_conflict "$api_key" "$collection_name" "$collection_file"
    else
        upload_collection "$api_key" "$collection_name" "$collection_file"
    fi
}

# =============================================================================
# ENVIRONMENT FUNCTIONS
# =============================================================================

check_environment_exists() {
    resource_exists "$1" "$2" "$ENVIRONMENTS_ENDPOINT"
}

get_environment_uid() {
    get_resource_uid "$1" "$2" "$ENVIRONMENTS_ENDPOINT"
}

get_environment_info() {
    get_resource_info "$1" "$2" "$ENVIRONMENTS_ENDPOINT"
}

upload_environment() {
    local api_key="$1"
    local environment_name="$2"
    local environment_file="$3"
    
    local environment_data
    environment_data=$(jq ".name = \"$environment_name\"" "$environment_file")
    local wrapped_data="{\"environment\": $environment_data}"
    
    local response
    response=$(make_api_request "POST" "$ENVIRONMENTS_ENDPOINT" "$api_key" "$wrapped_data")
    
    if echo "$response" | jq -e '.environment.uid' >/dev/null 2>&1; then
        local uid name
        uid=$(echo "$response" | jq -r '.environment.uid')
        name=$(echo "$response" | jq -r '.environment.name')
        print_success "Environment uploaded successfully!"
        print_info "  Name: $name"
        print_info "  UID: $uid"
        return 0
    else
        print_error "Environment upload failed"
        print_error "  Response: $response"
        return 1
    fi
}

update_environment() {
    local api_key="$1"
    local environment_uid="$2"
    local environment_name="$3"
    local environment_file="$4"
    
    local environment_data
    environment_data=$(jq ".name = \"$environment_name\"" "$environment_file")
    local wrapped_data="{\"environment\": $environment_data}"
    
    local response
    response=$(make_api_request "PUT" "$ENVIRONMENTS_ENDPOINT/$environment_uid" "$api_key" "$wrapped_data")
    
    if echo "$response" | jq -e '.environment.uid' >/dev/null 2>&1; then
        local uid name
        uid=$(echo "$response" | jq -r '.environment.uid')
        name=$(echo "$response" | jq -r '.environment.name')
        print_success "Environment updated successfully!"
        print_info "  Name: $name"
        print_info "  UID: $uid"
        return 0
    else
        print_error "Environment update failed"
        print_error "  Response: $response"
        return 1
    fi
}

handle_environment_conflict() {
    local api_key="$1"
    local environment_name="$2"
    local environment_file="$3"
    
    print_warning "Environment '$environment_name' already exists!"
    
    # Get existing environment info
    local existing_info
    existing_info=$(get_environment_info "$api_key" "$environment_name")
    if [ -n "$existing_info" ]; then
        print_info "Existing environment details:"
        echo "$existing_info"
    fi
    
    # Auto-select creating a copy to avoid interactive loops
    print_info "Creating a copy with timestamp (auto-selected)..."
    
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local new_name="${environment_name} - ${timestamp}"
    
    upload_environment "$api_key" "$new_name" "$environment_file"
}

process_environment() {
    local api_key="$1"
    
    print_info "Processing environment..."
    
    # Find environment file
    local environment_file
    if ! environment_file=$(find_file "$ENVIRONMENT_FILE_NAME"); then
        print_error "Environment file not found: $ENVIRONMENT_FILE_NAME"
        return 1
    fi
    
    print_info "Using environment file: $environment_file"
    
    # Get project name and create environment name
    local project_name environment_name
    project_name=$(get_project_name)
    environment_name="Development-$project_name"
    
    print_info "Environment will be named: $environment_name"
    
    # Check if environment already exists
    if check_environment_exists "$api_key" "$environment_name"; then
        handle_environment_conflict "$api_key" "$environment_name" "$environment_file"
    else
        upload_environment "$api_key" "$environment_name" "$environment_file"
    fi
}

# =============================================================================
# MAIN EXECUTION FUNCTIONS
# =============================================================================

show_usage() {
    echo "Usage: $0 [API_KEY]"
    echo ""
    echo "Upload Postman collection and environment to cloud workspace."
    echo ""
    echo "Arguments:"
    echo "  API_KEY    Optional Postman API key. If not provided, uses stored key."
    echo ""
    echo "Examples:"
    echo "  $0                                    # Use stored API key"
    echo "  $0 PMAK-xxxxxxxxxxxxxxxxxxxxxxxxx    # Use provided API key"
    echo ""
    echo "To get your API key:"
    echo "  1. Go to: https://web.postman.co/settings/me/api-keys"
    echo "  2. Click 'Generate API Key'"
    echo "  3. Copy the generated key"
}

upload_assets() {
    local api_key="$1"
    local method="$2"
    
    print_info "Starting upload process using $method..."
    echo ""
    
    # Upload Collection
    print_info "Step 1: Uploading Collection..."
    echo "=================================="
    local collection_success=false
    if process_collection "$api_key"; then
        collection_success=true
    fi
    
    echo ""
    
    # Upload Environment
    print_info "Step 2: Uploading Environment..."
    echo "===================================="
    local environment_success=false
    if process_environment "$api_key"; then
        environment_success=true
    fi
    
    echo ""
    print_info "Upload Summary"
    echo "================"
    
    if [ "$collection_success" = true ]; then
        print_success "Collection: Uploaded successfully"
    else
        print_error "Collection: Upload failed"
    fi
    
    if [ "$environment_success" = true ]; then
        print_success "Environment: Uploaded successfully"
    else
        print_error "Environment: Upload failed"
    fi
    
    echo ""
    if [ "$collection_success" = true ] && [ "$environment_success" = true ]; then
        print_success "All uploads completed successfully!"
        print_info "You can now use both the collection and environment in your Postman desktop app"
        return 0
    else
        print_warning "Some uploads failed. Check the output above for details."
        return 1
    fi
}

main() {
    # Show header
    print_info "Postman Upload Script v2.0"
    echo "=============================="
    echo "This will upload both the collection and environment to Postman"
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Handle help flag
    if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
        show_usage
        exit 0
    fi
    
    # Try stored API key first
    local stored_api_key
    if stored_api_key=$(get_stored_api_key); then
        print_success "Found stored API key"
        upload_assets "$stored_api_key" "stored API key"
        exit $?
    fi
    
    # Try provided API key
    if [ -n "${1:-}" ]; then
        print_info "Using provided API key..."
        upload_assets "$1" "provided API key"
        local exit_code=$?
        
        # Store API key for future use if upload was successful
        if [ $exit_code -eq 0 ]; then
            store_api_key "$1"
        fi
        exit $exit_code
    fi
    
    # No API key available
    print_warning "No API key available"
    print_info "Please provide an API key as an argument or run the script interactively first"
    echo ""
    show_usage
    exit 1
}

# =============================================================================
# SCRIPT ENTRY POINT
# =============================================================================

# Run main function with all arguments
main "$@"