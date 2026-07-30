#!/bin/bash

# GPC PHASE 2 → PRODUCTION DEPLOYMENT
# Quick-Start Guide — Copy-paste ready
# 
# Assumes: you have cloned veklom-byos-backend and veklom-control-plane
# Time: ~15 minutes for full integration

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

BACKEND_REPO="./veklom-byos-backend"
FRONTEND_REPO="./veklom-control-plane"
OUTPUTS_DIR="./outputs"

echo "🚀 Starting GPC Phase 2 → Production Deployment"
echo "=================================================="

# ============================================================================
# STEP 1: Backend Integration
# ============================================================================

echo ""
echo "📦 STEP 1: Backend Integration (Python)"
echo "---"

# Create GPC module directory
mkdir -p "$BACKEND_REPO/backend/gpc"
touch "$BACKEND_REPO/backend/gpc/__init__.py"

# Copy Python files
cp "$OUTPUTS_DIR/gpc_schemas.py" "$BACKEND_REPO/backend/gpc/schemas.py"
cp "$OUTPUTS_DIR/gpc_compiler.py" "$BACKEND_REPO/backend/gpc/compiler.py"

echo "✅ Created backend/gpc/ module"

# Create GPC routes app directory
mkdir -p "$BACKEND_REPO/backend/apps/gpc"
touch "$BACKEND_REPO/backend/apps/gpc/__init__.py"

cp "$OUTPUTS_DIR/gpc_routes.py" "$BACKEND_REPO/backend/apps/gpc/routes.py"

echo "✅ Created backend/apps/gpc/ routes"

# Add routes to main app
cat >> "$BACKEND_REPO/backend/main.py" << 'EOF'

# GPC Routes (Phase 2)
from backend.apps.gpc.routes import router as gpc_router
app.include_router(gpc_router)
EOF

echo "✅ Registered GPC router in main app"

# Create test file
cp "$OUTPUTS_DIR/test_gpc_suite.py" "$BACKEND_REPO/backend/tests/test_gpc_compiler.py"

echo "✅ Created test suite"

# ============================================================================
# STEP 2: Frontend Integration
# ============================================================================

echo ""
echo "📱 STEP 2: Frontend Integration (React/TypeScript)"
echo "---"

# Create GPC types
cp "$OUTPUTS_DIR/gpc_types.ts" "$FRONTEND_REPO/types/gpc.ts"
echo "✅ Created types/gpc.ts"

# Create GPC lib directory
mkdir -p "$FRONTEND_REPO/lib/gpc"
cp "$OUTPUTS_DIR/gpc_stores.ts" "$FRONTEND_REPO/lib/gpc/stores.ts"
cp "$OUTPUTS_DIR/useGpc.ts" "$FRONTEND_REPO/lib/gpc/useGpc.ts"

echo "✅ Created lib/gpc/ (stores + hook)"

# Create GPC components directory
mkdir -p "$FRONTEND_REPO/components/gpc"
cp "$OUTPUTS_DIR/GpcCanvas.tsx" "$FRONTEND_REPO/components/gpc/GpcCanvas.tsx"

echo "✅ Created components/gpc/"

# Replace GPC page
cp "$OUTPUTS_DIR/gpc_page.tsx" "$FRONTEND_REPO/app/gpc/page.tsx"

echo "✅ Replaced app/gpc/page.tsx (removed UACP iframe)"

# ============================================================================
# STEP 3: Dependencies
# ============================================================================

echo ""
echo "📥 STEP 3: Install Dependencies"
echo "---"

# Backend dependencies
echo "Installing Python dependencies..."
cd "$BACKEND_REPO"

# Add to pyproject.toml if not present
if ! grep -q "pydantic" pyproject.toml; then
  cat >> pyproject.toml << 'EOF'
pydantic = "^2.0"
pydantic-settings = "^2.0"
astor = "^0.8"
EOF
  echo "✅ Added Python deps to pyproject.toml"
fi

poetry install 2>/dev/null || echo "⚠️  poetry install skipped (use 'poetry install' manually)"

cd - > /dev/null

# Frontend dependencies
echo "Installing JavaScript dependencies..."
cd "$FRONTEND_REPO"

npm install reactflow zustand 2>/dev/null || echo "⚠️  npm install skipped (use 'npm install' manually)"

cd - > /dev/null

# ============================================================================
# STEP 4: Documentation
# ============================================================================

echo ""
echo "📚 STEP 4: Documentation"
echo "---"

mkdir -p "$BACKEND_REPO/docs/gpc"
mkdir -p "$FRONTEND_REPO/docs/gpc"

cp "$OUTPUTS_DIR/GPC_INTEGRATION_GUIDE.md" "$BACKEND_REPO/docs/gpc/INTEGRATION.md"
cp "$OUTPUTS_DIR/PHASE2_COMPLETION_SUMMARY.md" "$BACKEND_REPO/docs/gpc/COMPLETION_SUMMARY.md"

echo "✅ Copied documentation to repos"

# ============================================================================
# STEP 5: Verification
# ============================================================================

echo ""
echo "✅ STEP 5: Verification Checklist"
echo "---"

# Check files exist
FILES_TO_CHECK=(
  "$BACKEND_REPO/backend/gpc/schemas.py"
  "$BACKEND_REPO/backend/gpc/compiler.py"
  "$BACKEND_REPO/backend/apps/gpc/routes.py"
  "$BACKEND_REPO/backend/tests/test_gpc_compiler.py"
  "$FRONTEND_REPO/types/gpc.ts"
  "$FRONTEND_REPO/lib/gpc/stores.ts"
  "$FRONTEND_REPO/lib/gpc/useGpc.ts"
  "$FRONTEND_REPO/components/gpc/GpcCanvas.tsx"
  "$FRONTEND_REPO/app/gpc/page.tsx"
)

ALL_GOOD=true
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ MISSING: $file"
    ALL_GOOD=false
  fi
done

if [ "$ALL_GOOD" = true ]; then
  echo ""
  echo "🎉 All files integrated successfully!"
else
  echo ""
  echo "⚠️  Some files are missing. Check paths above."
  exit 1
fi

# ============================================================================
# STEP 6: Next Steps
# ============================================================================

echo ""
echo "📋 NEXT STEPS FOR GO-LIVE"
echo "========================="
echo ""
echo "1. Backend Tests:"
echo "   cd $BACKEND_REPO"
echo "   pytest backend/tests/test_gpc_compiler.py -v"
echo ""
echo "2. Start Backend:"
echo "   cd $BACKEND_REPO"
echo "   poetry run uvicorn backend.main:app --reload --port 8000"
echo ""
echo "3. Start Frontend:"
echo "   cd $FRONTEND_REPO"
echo "   npm run dev"
echo ""
echo "4. Test in Browser:"
echo "   http://localhost:3000/gpc"
echo ""
echo "5. Test API:"
echo "   curl -X POST http://localhost:8000/api/v1/gpc/components \\"
echo "     -H 'Authorization: Bearer test_token'"
echo ""
echo "6. Full Integration & Compliance:"
echo "   See: $BACKEND_REPO/docs/gpc/INTEGRATION.md"
echo ""
echo "7. Production Checklist:"
echo "   See: $BACKEND_REPO/docs/gpc/COMPLETION_SUMMARY.md"
echo ""
echo "🚀 Ready to go-live in 2-3 weeks after testing"
echo ""
