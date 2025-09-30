#!/bin/bash

# Git Visual Graph Script
# Usage: ./git-graph.sh [number_of_commits]

# Default to 20 commits if no argument provided
COMMITS=${1:-20}

echo "🌳 Git Commit Graph - Last $COMMITS commits"
echo "=============================================="
echo ""

# Create a beautiful git graph
git log --graph \
  --pretty=format:'%C(yellow)%h%Creset -%C(red)%d%Creset %s %C(green)(%cr)%Creset %C(bold blue)<%an>%Creset' \
  --abbrev-commit \
  --all \
  --decorate \
  -$COMMITS

echo ""
echo "📊 Branch Information:"
echo "======================"
git branch -a --color=always

echo ""
echo "🏷️  Tags:"
echo "========"
git tag --sort=-version:refname | head -10

echo ""
echo "📈 Statistics:"
echo "=============="
echo "Total commits: $(git rev-list --count HEAD)"
echo "Total branches: $(git branch -a | wc -l)"
echo "Total tags: $(git tag | wc -l)"
echo "Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
