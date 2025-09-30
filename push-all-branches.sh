#!/bin/bash

# Script to push all local branches to remote
# This will push all branches that are ahead of their remote counterparts

echo "🚀 Starting Git Flow - Pushing all unpushed branches..."

# Get all local branches
branches=$(git branch | grep -v "^\*" | sed 's/^[ ]*//')

# Counter for tracking progress
total_branches=$(echo "$branches" | wc -l)
current=0

echo "📊 Found $total_branches local branches to process"

for branch in $branches; do
    current=$((current + 1))
    echo ""
    echo "[$current/$total_branches] Processing branch: $branch"
    
    # Check if branch has remote tracking
    remote_branch=$(git rev-parse --abbrev-ref --symbolic-full-name $branch@{upstream} 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Branch has remote tracking, check if it's ahead
        ahead=$(git rev-list --count $remote_branch..$branch 2>/dev/null)
        if [ "$ahead" -gt 0 ]; then
            echo "  📤 Pushing $branch (ahead by $ahead commits)"
            git push origin $branch
        else
            echo "  ✅ $branch is up to date"
        fi
    else
        # Branch has no remote tracking, push it
        echo "  📤 Pushing new branch: $branch"
        git push -u origin $branch
    fi
done

echo ""
echo "🎉 Git Flow Complete! All branches have been pushed."
echo ""
echo "📋 Summary:"
git branch -vv | grep -E "(ahead|behind)"
