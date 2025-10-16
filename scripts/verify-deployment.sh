#!/bin/bash

###############################################################################
# Alsania Wallet - Deployment Verification Script
# Verifies all components are ready for deployment
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Alsania Wallet - Deployment Verification              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description: $file"
        return 0
    else
        echo -e "${RED}✗${NC} $description: $file ${RED}(MISSING)${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description: $dir"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $description: $dir ${YELLOW}(NOT FOUND)${NC}"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

echo -e "${YELLOW}━━━ Checking Core Controllers ━━━${NC}"
check_file "app/scripts/controllers/smart-wallet-controller.ts" "Smart Wallet Controller"
check_file "app/scripts/controllers/advanced-nft-controller.ts" "Advanced NFT Controller"

echo ""
echo -e "${YELLOW}━━━ Checking Optimization Libraries ━━━${NC}"
check_file "app/scripts/lib/optimization/performance-monitor.ts" "Performance Monitor"
check_file "app/scripts/lib/optimization/cache-manager.ts" "Cache Manager"

echo ""
echo -e "${YELLOW}━━━ Checking Security Utilities ━━━${NC}"
check_file "ui/lib/security/input-sanitizer.ts" "Input Sanitizer"
check_file "ui/lib/security/encryption.ts" "Encryption Utilities"

echo ""
echo -e "${YELLOW}━━━ Checking UI Components ━━━${NC}"
check_file "ui/components/smart-wallet/SessionKeyManager.tsx" "Session Key Manager"
check_file "ui/components/nft/NFTGalleryView.tsx" "NFT Gallery View"
check_file "ui/hooks/useOptimizedImage.ts" "Optimized Image Hook"
check_file "ui/theme/alsania-theme.ts" "Theme System"

echo ""
echo -e "${YELLOW}━━━ Checking Platform Configurations ━━━${NC}"
check_file "platforms/chrome/manifest.v3.json" "Chrome Manifest"
check_file "platforms/firefox/manifest.v2.json" "Firefox Manifest"
check_file "platforms/web/manifest.json" "Web App Manifest"
check_file "platforms/web/service-worker.js" "Service Worker"
check_file "platforms/desktop/electron.config.js" "Electron Config"
check_file "platforms/desktop/main.js" "Electron Main"
check_file "platforms/mobile/android/app/build.gradle" "Android Build Config"
check_file "platforms/mobile/ios/Podfile" "iOS Podfile"

echo ""
echo -e "${YELLOW}━━━ Checking Test Files ━━━${NC}"
check_file "platforms/tests/smart-wallet.test.ts" "Smart Wallet Tests"
check_file "platforms/tests/advanced-nft.test.ts" "NFT Controller Tests"
check_file "platforms/tests/cross-platform.test.ts" "Cross-Platform Tests"

echo ""
echo -e "${YELLOW}━━━ Checking Build System ━━━${NC}"
check_file "Makefile" "Makefile"
check_file "platforms/build-all.sh" "Build Script"
check_file ".github/workflows/ci.yml" "CI/CD Pipeline"

# Check if build script is executable
if [ -x "platforms/build-all.sh" ]; then
    echo -e "${GREEN}✓${NC} Build script is executable"
else
    echo -e "${YELLOW}⚠${NC} Build script needs execute permission"
    chmod +x platforms/build-all.sh
    echo -e "${GREEN}✓${NC} Fixed: Made build script executable"
fi

echo ""
echo -e "${YELLOW}━━━ Checking Documentation ━━━${NC}"
check_file "MAKEFILE_GUIDE.md" "Makefile Guide"
check_file "CROSS_PLATFORM_GUIDE.md" "Cross-Platform Guide"
check_file "IMPLEMENTATION_SUMMARY.md" "Implementation Summary"
check_file "OPTIMIZATION_GUIDE.md" "Optimization Guide"
check_file "DEPLOYMENT_CHECKLIST.md" "Deployment Checklist"
check_file "QUICK_START.md" "Quick Start Guide"

echo ""
echo -e "${YELLOW}━━━ Checking Node.js Version ━━━${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo -e "${GREEN}✓${NC} Node.js version: $(node -v) (>=20 required)"
else
    echo -e "${RED}✗${NC} Node.js version: $(node -v) (>=20 required)"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}━━━ Checking Dependencies ━━━${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Dependencies not installed"
    echo -e "${BLUE}→${NC} Run: make install"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo -e "${YELLOW}━━━ Validating JSON Files ━━━${NC}"

# Validate JSON files
for json_file in platforms/chrome/manifest.v3.json platforms/firefox/manifest.v2.json platforms/web/manifest.json; do
    if [ -f "$json_file" ]; then
        if python3 -m json.tool "$json_file" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} Valid JSON: $json_file"
        else
            echo -e "${RED}✗${NC} Invalid JSON: $json_file"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

echo ""
echo -e "${YELLOW}━━━ Checking Git Status ━━━${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    
    # Check if there are uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✓${NC} No uncommitted changes"
    else
        echo -e "${YELLOW}⚠${NC} Uncommitted changes present"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} Not a git repository"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}━━━ Checking TypeScript Configuration ━━━${NC}"
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓${NC} TypeScript configuration found"
else
    echo -e "${RED}✗${NC} TypeScript configuration missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}━━━ File Statistics ━━━${NC}"
echo -e "Controllers:        $(find app/scripts/controllers -name "*smart-wallet*" -o -name "*advanced-nft*" 2>/dev/null | wc -l) files"
echo -e "Optimization:       $(find app/scripts/lib/optimization -name "*.ts" 2>/dev/null | wc -l) files"
echo -e "Security:           $(find ui/lib/security -name "*.ts" 2>/dev/null | wc -l) files"
echo -e "UI Components:      $(find ui/components/smart-wallet ui/components/nft -name "*.tsx" 2>/dev/null | wc -l) files"
echo -e "Tests:              $(find platforms/tests -name "*.test.ts" 2>/dev/null | wc -l) files"
echo -e "Documentation:      $(find . -maxdepth 1 -name "*.md" 2>/dev/null | wc -l) files"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Verification Summary                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}✓ Ready for deployment${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo -e "${YELLOW}→ Review warnings before deploying${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    [ $WARNINGS -gt 0 ] && echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo -e "${RED}→ Fix errors before deploying${NC}"
    exit 1
fi
