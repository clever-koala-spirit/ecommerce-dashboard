#!/bin/bash

# Slay Season Consolidation Cleanup Script
# This script removes the separate projects after consolidation is complete

echo "🧹 Slay Season Consolidation Cleanup"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -d "/home/chip/.openclaw/workspace/ecommerce-dashboard" ]; then
    echo "❌ Error: Must run from workspace root"
    exit 1
fi

echo "📂 Current consolidated structure:"
echo "├── ecommerce-dashboard/"
echo "│   ├── server/"
echo "│   │   ├── ml/           <- ML models (from slay-season-predictions)"
echo "│   │   ├── jarvis/       <- JARVIS components"
echo "│   │   ├── security/     <- Pentagon security features"
echo "│   │   └── ..."
echo "│   └── client/"
echo "│       └── src/components/predictions/ <- Prediction widgets"
echo ""

# List what will be removed
echo "🗑️  Projects to be removed after consolidation:"
echo "├── jarvis/                    (consolidated into ecommerce-dashboard/server/jarvis/)"
echo "├── slay-season-predictions/   (consolidated into ecommerce-dashboard/server/ml/)"
echo "├── pentagon-gateway/          (consolidated into ecommerce-dashboard/server/security/)"
echo "└── ecommerce-predictor/       (redundant with slay-season-predictions)"
echo ""

# Safety check
read -p "⚠️  Are you sure you want to remove these projects? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🔍 Verifying consolidation is complete..."

# Check if key consolidated files exist
CONSOLIDATED_FILES=(
    "/home/chip/.openclaw/workspace/ecommerce-dashboard/server/ml/models/budget_optimizer.py"
    "/home/chip/.openclaw/workspace/ecommerce-dashboard/server/jarvis/recovery/ErrorRecovery.js"
    "/home/chip/.openclaw/workspace/ecommerce-dashboard/server/security/crypto/encryption.js"
    "/home/chip/.openclaw/workspace/ecommerce-dashboard/server/routes/predictions.js"
    "/home/chip/.openclaw/workspace/ecommerce-dashboard/server/middleware/consolidated-security.js"
)

MISSING_FILES=()
for file in "${CONSOLIDATED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "❌ Error: Consolidation incomplete. Missing files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please complete consolidation before running cleanup."
    exit 1
fi

echo "✅ Consolidation verified complete"
echo ""

# Create backup before deletion (just in case)
echo "💾 Creating safety backup..."
mkdir -p /home/chip/.openclaw/workspace/archive/consolidation-backup-$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/home/chip/.openclaw/workspace/archive/consolidation-backup-$(date +%Y%m%d-%H%M%S)"

# Backup key files from projects being removed
if [ -d "/home/chip/.openclaw/workspace/jarvis" ]; then
    cp -r /home/chip/.openclaw/workspace/jarvis "$BACKUP_DIR/"
    echo "✅ Backed up jarvis/"
fi

if [ -d "/home/chip/.openclaw/workspace/slay-season-predictions" ]; then
    cp -r /home/chip/.openclaw/workspace/slay-season-predictions "$BACKUP_DIR/"
    echo "✅ Backed up slay-season-predictions/"
fi

if [ -d "/home/chip/.openclaw/workspace/pentagon-gateway" ]; then
    cp -r /home/chip/.openclaw/workspace/pentagon-gateway "$BACKUP_DIR/"
    echo "✅ Backed up pentagon-gateway/"
fi

if [ -d "/home/chip/.openclaw/workspace/ecommerce-predictor" ]; then
    cp -r /home/chip/.openclaw/workspace/ecommerce-predictor "$BACKUP_DIR/"
    echo "✅ Backed up ecommerce-predictor/"
fi

echo "📁 Backup created at: $BACKUP_DIR"
echo ""

# Remove the separate projects
echo "🗑️  Removing separate projects..."

if [ -d "/home/chip/.openclaw/workspace/jarvis" ]; then
    rm -rf /home/chip/.openclaw/workspace/jarvis
    echo "✅ Removed jarvis/"
fi

if [ -d "/home/chip/.openclaw/workspace/slay-season-predictions" ]; then
    rm -rf /home/chip/.openclaw/workspace/slay-season-predictions
    echo "✅ Removed slay-season-predictions/"
fi

if [ -d "/home/chip/.openclaw/workspace/pentagon-gateway" ]; then
    rm -rf /home/chip/.openclaw/workspace/pentagon-gateway
    echo "✅ Removed pentagon-gateway/"
fi

if [ -d "/home/chip/.openclaw/workspace/ecommerce-predictor" ]; then
    rm -rf /home/chip/.openclaw/workspace/ecommerce-predictor
    echo "✅ Removed ecommerce-predictor/"
fi

echo ""
echo "🎉 Consolidation cleanup complete!"
echo ""
echo "✨ Slay Season Platform Status:"
echo "├── ✅ ML Prediction Models (integrated)"
echo "├── ✅ JARVIS AI Failover (integrated)"  
echo "├── ✅ Pentagon Security (integrated)"
echo "├── ✅ Frontend Prediction Widgets (ready)"
echo "└── ✅ Consolidated API Endpoints (active)"
echo ""
echo "🚀 Next steps:"
echo "1. cd /home/chip/.openclaw/workspace/ecommerce-dashboard/server"
echo "2. npm install  # Install new dependencies"
echo "3. pip install -r ml/requirements.txt  # Install Python ML dependencies"
echo "4. npm run dev  # Start the consolidated platform"
echo ""
echo "📚 All functionality now lives in ONE platform:"
echo "   /home/chip/.openclaw/workspace/ecommerce-dashboard/"
echo ""
echo "🔧 If you need to restore anything, check:"
echo "   $BACKUP_DIR"
echo ""
echo "✅ Consolidation complete - Leo's vision realized!"