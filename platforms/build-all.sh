#!/bin/bash

###############################################################################
# Alsania Wallet - Cross-Platform Build Script
# Builds all platform versions of the wallet
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="platforms/dist"
PLATFORMS="${PLATFORMS:-all}" # Default to building all platforms

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}    Alsania Wallet - Cross-Platform Build     ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Create dist directory
mkdir -p "$BUILD_DIR"

# Function to print status
print_status() {
    echo -e "${YELLOW}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js 20+ required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js version OK: $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    yarn install
    print_success "Dependencies installed"
fi

###############################################################################
# Build Browser Extensions
###############################################################################

if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "extensions" ] || [ "$PLATFORMS" = "chrome" ]; then
    print_status "Building Chrome extension..."
    ENABLE_MV3=true yarn build dist --build-target=chrome
    mkdir -p "$BUILD_DIR/chrome-extension"
    cp -r dist/chrome/* "$BUILD_DIR/chrome-extension/"
    print_success "Chrome extension built → $BUILD_DIR/chrome-extension"
fi

if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "extensions" ] || [ "$PLATFORMS" = "firefox" ]; then
    print_status "Building Firefox extension..."
    ENABLE_MV3=false yarn build dist --build-target=firefox
    mkdir -p "$BUILD_DIR/firefox-extension"
    cp -r dist/firefox/* "$BUILD_DIR/firefox-extension/"
    print_success "Firefox extension built → $BUILD_DIR/firefox-extension"
fi

###############################################################################
# Build Web Application
###############################################################################

if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "web" ]; then
    print_status "Building web application..."
    yarn build:web
    mkdir -p "$BUILD_DIR/web"
    cp -r build/web/* "$BUILD_DIR/web/"
    print_success "Web application built → $BUILD_DIR/web"
fi

###############################################################################
# Build Desktop Applications
###############################################################################

if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "desktop" ]; then
    print_status "Building desktop applications..."
    
    # Install Electron dependencies
    if [ ! -d "node_modules/electron" ]; then
        yarn add -D electron electron-builder
    fi
    
    # Build for all platforms
    if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "desktop:linux" ]; then
        print_status "Building for Linux..."
        yarn build:desktop:linux
        print_success "Linux builds completed"
    fi
    
    if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "desktop:mac" ]; then
        print_status "Building for macOS..."
        yarn build:desktop:mac
        print_success "macOS builds completed"
    fi
    
    if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "desktop:windows" ]; then
        print_status "Building for Windows..."
        yarn build:desktop:windows
        print_success "Windows builds completed"
    fi
    
    print_success "Desktop applications built → $BUILD_DIR/desktop"
fi

###############################################################################
# Build Mobile Applications
###############################################################################

if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "mobile" ]; then
    print_status "Building mobile applications..."
    
    if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "mobile:android" ]; then
        print_status "Building Android app..."
        cd platforms/mobile/android
        ./gradlew assembleRelease
        cd ../../..
        mkdir -p "$BUILD_DIR/mobile/android"
        cp platforms/mobile/android/app/build/outputs/apk/release/*.apk "$BUILD_DIR/mobile/android/"
        print_success "Android build completed"
    fi
    
    if [ "$PLATFORMS" = "all" ] || [ "$PLATFORMS" = "mobile:ios" ]; then
        if [ "$(uname)" = "Darwin" ]; then
            print_status "Building iOS app..."
            cd platforms/mobile/ios
            pod install
            xcodebuild -workspace AlsaniaWallet.xcworkspace \
                       -scheme AlsaniaWallet \
                       -configuration Release \
                       -archivePath "$BUILD_DIR/mobile/ios/AlsaniaWallet.xcarchive" \
                       archive
            cd ../../..
            print_success "iOS build completed"
        else
            print_error "iOS builds require macOS"
        fi
    fi
fi

###############################################################################
# Generate Checksums
###############################################################################

print_status "Generating checksums..."
cd "$BUILD_DIR"
find . -type f \( -name "*.zip" -o -name "*.dmg" -o -name "*.exe" -o -name "*.apk" -o -name "*.AppImage" \) -exec sha256sum {} \; > SHA256SUMS.txt
cd ../..
print_success "Checksums generated → $BUILD_DIR/SHA256SUMS.txt"

###############################################################################
# Summary
###############################################################################

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}              Build Complete!                  ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Build artifacts location: $BUILD_DIR"
echo ""
echo "Available builds:"
[ -d "$BUILD_DIR/chrome-extension" ] && echo "  ✓ Chrome Extension"
[ -d "$BUILD_DIR/firefox-extension" ] && echo "  ✓ Firefox Extension"
[ -d "$BUILD_DIR/web" ] && echo "  ✓ Web Application"
[ -d "$BUILD_DIR/desktop/linux" ] && echo "  ✓ Linux Desktop"
[ -d "$BUILD_DIR/desktop/mac" ] && echo "  ✓ macOS Desktop"
[ -d "$BUILD_DIR/desktop/windows" ] && echo "  ✓ Windows Desktop"
[ -d "$BUILD_DIR/mobile/android" ] && echo "  ✓ Android Mobile"
[ -d "$BUILD_DIR/mobile/ios" ] && echo "  ✓ iOS Mobile"
echo ""
echo "Next steps:"
echo "  1. Test the builds"
echo "  2. Sign the packages (for production)"
echo "  3. Distribute via app stores"
echo ""
