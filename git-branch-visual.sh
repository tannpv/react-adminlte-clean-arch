#!/bin/bash

# Git Branch Visualization Script
# Shows the true branching structure like the image
# Usage: ./git-branch-visual.sh [number_of_commits]

COMMITS=${1:-40}

echo "🌳 Git Branch Visualization - True Branching Structure"
echo "======================================================"
echo ""

# Show the complete branching structure with all commits
git log --graph \
  --pretty=format:'%C(yellow)%h%Creset -%C(red)%d%Creset %s %C(green)(%cr)%Creset %C(bold blue)<%an>%Creset' \
  --abbrev-commit \
  --all \
  --decorate \
  --simplify-by-decoration \
  -$COMMITS

echo ""
echo "🔍 Branch Analysis:"
echo "==================="

# Show current branch structure
echo "📍 Current branch: $(git branch --show-current)"

# Show active feature branches
echo ""
echo "🚀 Active Feature Branches:"
echo "---------------------------"
git branch -r --sort=-committerdate | grep "feature/" | head -10

# Show merge commits
echo ""
echo "🔀 Recent Merge Commits:"
echo "------------------------"
git log --merges --oneline --graph -10

# Show branch statistics
echo ""
echo "📊 Branch Statistics:"
echo "===================="
echo "Total branches: $(git branch -a | wc -l)"
echo "Feature branches: $(git branch -r | grep 'feature/' | wc -l)"
echo "Remote branches: $(git branch -r | wc -l)"
echo "Local branches: $(git branch | wc -l)"

echo ""
echo "🎯 To see more branching details:"
echo "================================="
echo "• Show all branches: git branch -a"
echo "• Show remote branches: git branch -r"
echo "• Show branch details: git show-branch --all"
echo "• Show merge history: git log --merges --oneline"
