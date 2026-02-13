#!/bin/bash

# Slay Season — Push Update Script
# Run this from your ecommerce-dashboard folder on your Mac to push changes to GitHub
# 
# This script:
#   1. Verifies you're in the correct directory
#   2. Removes orphaned temp files
#   3. Stages all changes
#   4. Creates a commit
#   5. Pushes to GitHub

set -e

# Check we're in the right directory
if [ ! -d ".git" ] || [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the ecommerce-dashboard root directory"
    echo "   Expected files: .git/, package.json"
    exit 1
fi

echo "🚀 Slay Season — Pushing latest update to GitHub"
echo ""

# Remove git lock files if they exist (from previous interrupted operations)
rm -f .git/index.lock 2>/dev/null || true
rm -f .git/HEAD.lock 2>/dev/null || true

# Remove orphan/temp files that shouldn't be committed
echo "🧹 Cleaning up temp files..."
rm -f "client/src/App 2.jsx" 2>/dev/null || true
rm -f "server/routes/data 2.js" 2>/dev/null || true
rm -rf client/dist2 2>/dev/null || true
echo "   Done"
echo ""

# Stage all new and modified files
echo "📦 Staging changes..."
git add -A
echo "   Done"
echo ""

# Show what's being committed
echo "📋 Files to commit:"
git status --short
echo ""

# Commit with detailed message
echo "💾 Creating commit..."
git commit -m "fix: add .npmrc for Vercel build compatibility

Add legacy-peer-deps=true to resolve @shopify/polaris peer dependency
conflict with React 19 during Vercel deployment.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "🎉 Success! Changes pushed to GitHub"
echo "   Vercel will auto-deploy to slayseason.com"
echo "   Monitor build status: https://vercel.com/dashboard"
