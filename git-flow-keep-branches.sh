#!/bin/bash

# Git Flow with Branch Preservation Script
# This script keeps feature branches after merging for better visualization

# Function to start a feature branch
start_feature() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo "Usage: start_feature <feature-name>"
        return 1
    fi
    
    echo "🚀 Starting feature branch: $feature_name"
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$feature_name"
    echo "✅ Feature branch 'feature/$feature_name' created and checked out"
}

# Function to finish a feature branch (keeping it for visualization)
finish_feature() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo "Usage: finish_feature <feature-name>"
        return 1
    fi
    
    local branch_name="feature/$feature_name"
    
    echo "🔀 Finishing feature branch: $branch_name"
    
    # Switch to develop
    git checkout develop
    git pull origin develop
    
    # Merge the feature branch
    git merge --no-ff "$branch_name" -m "Merge $branch_name: $feature_name"
    
    # Push develop
    git push origin develop
    
    # Keep the branch for visualization (don't delete it)
    echo "✅ Feature branch '$branch_name' merged and kept for visualization"
    echo "📊 Branch preserved for Git graph visualization"
    
    # Switch back to develop
    git checkout develop
}

# Function to show the branching structure
show_branches() {
    echo "🌳 Current Branching Structure:"
    echo "==============================="
    git log --graph --pretty=format:'%C(yellow)%h%Creset -%C(red)%d%Creset %s %C(green)(%cr)%Creset %C(bold blue)<%an>%Creset' --abbrev-commit --all --decorate --simplify-by-decoration -20
}

# Function to clean up old branches (optional)
cleanup_branches() {
    echo "🧹 Cleaning up merged branches (keeping feature branches for visualization)"
    git branch --merged develop | grep -v "develop\|master\|main" | xargs -n 1 git branch -d
    echo "✅ Cleaned up merged branches (feature branches preserved)"
}

# Main script logic
case "$1" in
    "start")
        start_feature "$2"
        ;;
    "finish")
        finish_feature "$2"
        ;;
    "show")
        show_branches
        ;;
    "cleanup")
        cleanup_branches
        ;;
    *)
        echo "Git Flow with Branch Preservation"
        echo "================================="
        echo ""
        echo "Usage:"
        echo "  $0 start <feature-name>    - Start a new feature branch"
        echo "  $0 finish <feature-name>   - Finish and merge a feature branch (keeping it)"
        echo "  $0 show                    - Show current branching structure"
        echo "  $0 cleanup                 - Clean up merged branches (preserving features)"
        echo ""
        echo "Examples:"
        echo "  $0 start F-000009-new-feature"
        echo "  $0 finish F-000009-new-feature"
        echo "  $0 show"
        ;;
esac
