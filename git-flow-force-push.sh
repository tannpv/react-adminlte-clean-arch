#!/bin/bash

# Git Flow - Force push branches that have diverged
# This script handles branches that are ahead but behind their remotes

echo "🚀 Git Flow - Force pushing diverged branches..."

# List of branches that need force push (based on the output above)
branches_to_force_push=(
    "feature/F-000001-product-attribute-bug-fixes"
    "feature/F-000002-code-cleanup"
    "feature/F-000002-theme-modernization"
    "feature/F-000003-category-tree-product-form"
    "feature/F-000004-product-variants-management"
    "feature/F-000005-modal-forms-migration"
    "feature/F-000006-layout-migration"
    "feature/F-000007-theme-polish"
    "feature/F-000008-statistics-cards-consistency"
    "feature/F-000009-git-visualization-tools"
    "feature/F-000010-ui-layout-consistency"
    "feature/F-000011-fix-table-action-buttons"
    "feature/F-000012-improve-table-name-display"
    "feature/F-000013-fix-attribute-set-view-button"
    "feature/F-000014-migrate-attribute-set-details-tailwind"
    "feature/go-microservice-implementation"
    "feature/product-attribute-loading"
    "feature/redis-jwt-token-management"
)

echo "📊 Found ${#branches_to_force_push[@]} branches to force push"

for branch in "${branches_to_force_push[@]}"; do
    echo ""
    echo "🔄 Force pushing: $branch"
    
    # Check if branch exists locally
    if git show-ref --verify --quiet refs/heads/$branch; then
        echo "  ✅ Branch exists locally"
        
        # Force push the branch
        if git push --force-with-lease origin $branch; then
            echo "  ✅ Successfully force pushed $branch"
        else
            echo "  ❌ Failed to force push $branch"
        fi
    else
        echo "  ⚠️  Branch $branch does not exist locally"
    fi
done

echo ""
echo "🎉 Force push complete!"
echo ""
echo "📋 Current branch status:"
git branch -vv | grep -E "(ahead|behind)"
