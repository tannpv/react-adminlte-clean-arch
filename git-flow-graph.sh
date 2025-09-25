#!/bin/bash

# Git Flow Visualization Script
# Usage: ./git-flow-graph.sh [number_of_commits]

COMMITS=${1:-25}

echo "🌊 Git Flow Visualization - Last $COMMITS commits"
echo "=================================================="
echo ""

# Show the git flow with better visualization
git log --graph \
  --pretty=format:'%C(yellow)%h%Creset -%C(red)%d%Creset %s %C(green)(%cr)%Creset %C(bold blue)<%an>%Creset' \
  --abbrev-commit \
  --all \
  --decorate \
  --date=short \
  -$COMMITS

echo ""
echo "🔄 Current Git Flow Status:"
echo "==========================="

# Show current branch
echo "📍 Current branch: $(git branch --show-current)"

# Show recent feature branches
echo ""
echo "🚀 Recent Feature Branches:"
echo "---------------------------"
git branch -r --sort=-committerdate | grep "feature/" | head -10

# Show recent merge commits
echo ""
echo "🔀 Recent Merge Commits:"
echo "------------------------"
git log --merges --oneline --graph -10

echo ""
echo "📊 Branch Statistics:"
echo "===================="
echo "Feature branches: $(git branch -r | grep 'feature/' | wc -l)"
echo "Hotfix branches: $(git branch -r | grep 'hotfix/' | wc -l)"
echo "Release branches: $(git branch -r | grep 'release/' | wc -l)"

echo ""
echo "🎯 Git Flow Commands:"
echo "===================="
echo "• Start feature: git flow feature start <name>"
echo "• Finish feature: git flow feature finish <name>"
echo "• Start release: git flow release start <version>"
echo "• Finish release: git flow release finish <version>"
echo "• Start hotfix: git flow hotfix start <name>"
echo "• Finish hotfix: git flow hotfix finish <name>"
