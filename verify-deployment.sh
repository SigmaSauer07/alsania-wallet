#!/bin/bash

###############################################################################
# Alsania Wallet - Deployment Verification Script
###############################################################################

set -e

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

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2: $1"
        return 0
    else
        echo -e "${RED}✗${NC} $2: $1 ${RED}(MISSING)${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo -e "${YELLOW}━━━ Core Files ━━━${NC}"
check_file "app/scripts/controllers/smart-wallet-controller.ts" "Smart Wallet Controller"
check_file "app/scripts/controllers/advanced-nft-controller.ts" "Advanced NFT Controller"
check_file "app/scripts/lib/optimization/performance-monitor.ts" "Performance Monitor"
check_file "app/scripts/lib/optimization/cache-manager.ts" "Cache Manager"
check_file "ui/lib/security/input-sanitizer.ts" "Input Sanitizer"
check_file "ui/lib/security/encryption.ts" "Encryption Utils"

echo ""
echo -e "${YELLOW}━━━ UI Components ━━━${NC}"
check_file "ui/components/smart-wallet/SessionKeyManager.tsx" "Session Key Manager"
check_file "ui/components/nft/NFTGalleryView.tsx" "NFT Gallery View"
check_file "ui/hooks/useOptimizedImage.ts" "Optimized Image Hook"
check_file "ui/theme/alsania-theme.ts" "Theme System"

echo ""
echo -e "${YELLOW}━━━ Platform Configs ━━━${NC}"
check_file "platforms/chrome/manifest.v3.json" "Chrome Manifest"
check_file "platforms/firefox/manifest.v2.json" "Firefox Manifest"
check_file "platforms/web/manifest.json" "Web Manifest"
check_file "platforms/desktop/electron.config.js" "Electron Config"

echo ""
echo -e "${YELLOW}━━━ Build System ━━━${NC}"
check_file "Makefile" "Makefile"
check_file "platforms/build-all.sh" "Build Script"

echo ""
echo -e "${YELLOW}━━━ Tests ━━━${NC}"
check_file "platforms/tests/smart-wallet.test.ts" "Smart Wallet Tests"
check_file "platforms/tests/advanced-nft.test.ts" "NFT Tests"
check_file "platforms/tests/cross-platform.test.ts" "Platform Tests"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Summary                                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    exit 1
fi
