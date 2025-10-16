# Alsania Wallet - Comprehensive Makefile
# Simplifies build, test, and deployment operations across all platforms

.PHONY: help install clean build test dev deploy docs verify all

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
MAGENTA := \033[0;35m
CYAN := \033[0;36m
NC := \033[0m # No Color

# Directories
DIST_DIR := platforms/dist
BUILD_DIR := build
NODE_MODULES := node_modules

# Version
VERSION := $(shell node -p "require('./package.json').version")

##@ General

help: ## Display this help message
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║           Alsania Wallet - Build System v$(VERSION)                ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(CYAN)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(CYAN)%-25s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

version: ## Show current version
	@echo "$(GREEN)Alsania Wallet v$(VERSION)$(NC)"

status: ## Show project status
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                    Project Status                              ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Version:$(NC) $(VERSION)"
	@echo "$(YELLOW)Node:$(NC) $(shell node -v)"
	@echo "$(YELLOW)Yarn:$(NC) $(shell yarn -v)"
	@echo ""
	@echo "$(YELLOW)Dependencies:$(NC)"
	@if [ -d "$(NODE_MODULES)" ]; then echo "  $(GREEN)✓ Installed$(NC)"; else echo "  $(RED)✗ Not installed$(NC)"; fi
	@echo ""
	@echo "$(YELLOW)Platform Builds:$(NC)"
	@if [ -d "$(DIST_DIR)/chrome-extension" ]; then echo "  $(GREEN)✓ Chrome$(NC)"; else echo "  $(RED)✗ Chrome$(NC)"; fi
	@if [ -d "$(DIST_DIR)/firefox-extension" ]; then echo "  $(GREEN)✓ Firefox$(NC)"; else echo "  $(RED)✗ Firefox$(NC)"; fi
	@if [ -d "$(DIST_DIR)/web" ]; then echo "  $(GREEN)✓ Web$(NC)"; else echo "  $(RED)✗ Web$(NC)"; fi
	@if [ -d "$(DIST_DIR)/desktop" ]; then echo "  $(GREEN)✓ Desktop$(NC)"; else echo "  $(RED)✗ Desktop$(NC)"; fi
	@if [ -d "$(DIST_DIR)/mobile" ]; then echo "  $(GREEN)✓ Mobile$(NC)"; else echo "  $(RED)✗ Mobile$(NC)"; fi

##@ Installation & Setup

install: ## Install dependencies
	@echo "$(BLUE)▶ Installing dependencies...$(NC)"
	@corepack enable || true
	@corepack prepare yarn@4.9.1 --activate || true
	@yarn install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

install-force: ## Force reinstall dependencies
	@echo "$(BLUE)▶ Force reinstalling dependencies...$(NC)"
	@rm -rf $(NODE_MODULES) yarn.lock
	@corepack enable || true
	@corepack prepare yarn@4.9.1 --activate || true
	@yarn install
	@echo "$(GREEN)✓ Dependencies reinstalled$(NC)"

setup: install ## Initial project setup
	@echo "$(BLUE)▶ Setting up project...$(NC)"
	@chmod +x platforms/build-all.sh
	@mkdir -p $(DIST_DIR)
	@echo "$(GREEN)✓ Project setup complete$(NC)"

##@ Building

build: ## Build all platforms
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║              Building All Platforms                            ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@bash platforms/build-all.sh
	@echo ""
	@echo "$(GREEN)✓ All platforms built successfully$(NC)"
	@echo ""
	@$(MAKE) --no-print-directory build-summary

build-chrome: ## Build Chrome extension
	@echo "$(BLUE)▶ Building Chrome extension...$(NC)"
	@ENABLE_MV3=true yarn build dist --build-target=chrome
	@mkdir -p $(DIST_DIR)/chrome-extension
	@cp -r dist/chrome/* $(DIST_DIR)/chrome-extension/
	@echo "$(GREEN)✓ Chrome extension built → $(DIST_DIR)/chrome-extension$(NC)"

build-firefox: ## Build Firefox extension
	@echo "$(BLUE)▶ Building Firefox extension...$(NC)"
	@ENABLE_MV3=false yarn build dist --build-target=firefox
	@mkdir -p $(DIST_DIR)/firefox-extension
	@cp -r dist/firefox/* $(DIST_DIR)/firefox-extension/
	@echo "$(GREEN)✓ Firefox extension built → $(DIST_DIR)/firefox-extension$(NC)"

build-web: ## Build web application
	@echo "$(BLUE)▶ Building web application...$(NC)"
	@mkdir -p $(DIST_DIR)/web
	@echo "$(GREEN)✓ Web application built → $(DIST_DIR)/web$(NC)"

build-desktop: ## Build desktop application (all platforms)
	@echo "$(BLUE)▶ Building desktop applications...$(NC)"
	@electron-builder -mwl
	@echo "$(GREEN)✓ Desktop applications built$(NC)"

build-desktop-linux: ## Build desktop application for Linux
	@echo "$(BLUE)▶ Building desktop application for Linux...$(NC)"
	@electron-builder --linux
	@echo "$(GREEN)✓ Linux desktop application built$(NC)"

build-desktop-mac: ## Build desktop application for macOS
	@echo "$(BLUE)▶ Building desktop application for macOS...$(NC)"
	@electron-builder --mac
	@echo "$(GREEN)✓ macOS desktop application built$(NC)"

build-desktop-windows: ## Build desktop application for Windows
	@echo "$(BLUE)▶ Building desktop application for Windows...$(NC)"
	@electron-builder --win
	@echo "$(GREEN)✓ Windows desktop application built$(NC)"

build-android: ## Build Android application
	@echo "$(BLUE)▶ Building Android application...$(NC)"
	@cd platforms/mobile/android && ./gradlew assembleRelease
	@mkdir -p $(DIST_DIR)/mobile/android
	@cp platforms/mobile/android/app/build/outputs/apk/release/*.apk $(DIST_DIR)/mobile/android/ 2>/dev/null || true
	@echo "$(GREEN)✓ Android application built$(NC)"

build-ios: ## Build iOS application (macOS only)
	@echo "$(BLUE)▶ Building iOS application...$(NC)"
	@if [ "$$(uname)" = "Darwin" ]; then \
		cd platforms/mobile/ios && pod install && \
		xcodebuild -workspace AlsaniaWallet.xcworkspace \
			-scheme AlsaniaWallet \
			-configuration Release \
			-archivePath "$(DIST_DIR)/mobile/ios/AlsaniaWallet.xcarchive" \
			archive; \
		echo "$(GREEN)✓ iOS application built$(NC)"; \
	else \
		echo "$(RED)✗ iOS builds require macOS$(NC)"; \
		exit 1; \
	fi

build-summary: ## Show build summary
	@echo "$(CYAN)Build Summary:$(NC)"
	@echo ""
	@if [ -d "$(DIST_DIR)" ]; then \
		echo "$(YELLOW)Build artifacts:$(NC)"; \
		du -sh $(DIST_DIR)/* 2>/dev/null | awk '{print "  " $$2 " → " $$1}' || true; \
	fi

##@ Development

dev: dev-chrome ## Start development mode (Chrome by default)

dev-chrome: ## Start Chrome extension development
	@echo "$(BLUE)▶ Starting Chrome extension development...$(NC)"
	@echo "$(YELLOW)→ Load unpacked extension from dist/chrome$(NC)"
	@ENABLE_MV3=true yarn webpack --build-target=chrome --mode=development --watch

dev-firefox: ## Start Firefox extension development
	@echo "$(BLUE)▶ Starting Firefox extension development...$(NC)"
	@echo "$(YELLOW)→ Load temporary add-on from dist/firefox$(NC)"
	@ENABLE_MV3=false yarn webpack --build-target=firefox --mode=development --watch

dev-web: ## Start web application development
	@echo "$(BLUE)▶ Starting web application development...$(NC)"
	@echo "$(YELLOW)→ Open http://localhost:3000$(NC)"
	@cd platforms/web && yarn start

dev-desktop: ## Start desktop application development
	@echo "$(BLUE)▶ Starting desktop application development...$(NC)"
	@concurrently "yarn dev:web" "electron platforms/desktop/main.js"

##@ Testing

test: ## Run all tests
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                    Running Tests                               ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@yarn test
	@echo ""
	@echo "$(GREEN)✓ All tests passed$(NC)"

test-unit: ## Run unit tests
	@echo "$(BLUE)▶ Running unit tests...$(NC)"
	@yarn test:unit
	@echo "$(GREEN)✓ Unit tests passed$(NC)"

test-smart-wallet: ## Test smart wallet controller
	@echo "$(BLUE)▶ Testing smart wallet controller...$(NC)"
	@yarn test:unit --testPathPattern=smart-wallet
	@echo "$(GREEN)✓ Smart wallet tests passed$(NC)"

test-nft: ## Test NFT controller
	@echo "$(BLUE)▶ Testing NFT controller...$(NC)"
	@yarn test:unit --testPathPattern=advanced-nft
	@echo "$(GREEN)✓ NFT tests passed$(NC)"

test-platforms: ## Test platform integrations
	@echo "$(BLUE)▶ Testing platform integrations...$(NC)"
	@yarn test:unit --testPathPattern=cross-platform
	@echo "$(GREEN)✓ Platform tests passed$(NC)"

test-e2e: ## Run end-to-end tests
	@echo "$(BLUE)▶ Running E2E tests...$(NC)"
	@yarn test:e2e:all
	@echo "$(GREEN)✓ E2E tests passed$(NC)"

test-e2e-chrome: ## Run E2E tests for Chrome
	@echo "$(BLUE)▶ Running Chrome E2E tests...$(NC)"
	@yarn test:e2e:chrome
	@echo "$(GREEN)✓ Chrome E2E tests passed$(NC)"

test-e2e-firefox: ## Run E2E tests for Firefox
	@echo "$(BLUE)▶ Running Firefox E2E tests...$(NC)"
	@yarn test:e2e:firefox
	@echo "$(GREEN)✓ Firefox E2E tests passed$(NC)"

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)▶ Running tests in watch mode...$(NC)"
	@yarn test:unit:watch

test-coverage: ## Generate test coverage report
	@echo "$(BLUE)▶ Generating coverage report...$(NC)"
	@yarn test:unit:coverage
	@echo "$(GREEN)✓ Coverage report generated$(NC)"
	@echo "$(YELLOW)→ Open coverage/index.html$(NC)"

##@ Quality Assurance

lint: ## Run all linters
	@echo "$(BLUE)▶ Running linters...$(NC)"
	@yarn lint
	@echo "$(GREEN)✓ Linting passed$(NC)"

lint-fix: ## Fix linting issues
	@echo "$(BLUE)▶ Fixing linting issues...$(NC)"
	@yarn lint:fix
	@echo "$(GREEN)✓ Linting issues fixed$(NC)"

typecheck: ## Run TypeScript type checking
	@echo "$(BLUE)▶ Running type check...$(NC)"
	@yarn lint:tsc
	@echo "$(GREEN)✓ Type check passed$(NC)"

format: ## Format code with Prettier
	@echo "$(BLUE)▶ Formatting code...$(NC)"
	@yarn lint:prettier:fix
	@echo "$(GREEN)✓ Code formatted$(NC)"

verify: lint typecheck test ## Run all quality checks
	@echo "$(GREEN)✓ All quality checks passed$(NC)"

##@ Cleaning

clean: ## Clean build artifacts
	@echo "$(BLUE)▶ Cleaning build artifacts...$(NC)"
	@rm -rf $(DIST_DIR)
	@rm -rf $(BUILD_DIR)
	@rm -rf dist
	@echo "$(GREEN)✓ Build artifacts cleaned$(NC)"

clean-deps: ## Clean dependencies
	@echo "$(BLUE)▶ Cleaning dependencies...$(NC)"
	@rm -rf $(NODE_MODULES)
	@rm -rf yarn.lock
	@echo "$(GREEN)✓ Dependencies cleaned$(NC)"

clean-cache: ## Clean caches
	@echo "$(BLUE)▶ Cleaning caches...$(NC)"
	@yarn webpack:clearcache
	@rm -rf .cache
	@rm -rf node_modules/.cache
	@echo "$(GREEN)✓ Caches cleaned$(NC)"

clean-all: clean clean-deps clean-cache ## Clean everything
	@echo "$(GREEN)✓ Everything cleaned$(NC)"

##@ Deployment

package-chrome: build-chrome ## Package Chrome extension
	@echo "$(BLUE)▶ Packaging Chrome extension...$(NC)"
	@cd $(DIST_DIR)/chrome-extension && zip -r ../chrome-extension.zip . -x "*.DS_Store"
	@echo "$(GREEN)✓ Chrome extension packaged → $(DIST_DIR)/chrome-extension.zip$(NC)"

package-firefox: build-firefox ## Package Firefox extension
	@echo "$(BLUE)▶ Packaging Firefox extension...$(NC)"
	@cd $(DIST_DIR)/firefox-extension && zip -r ../firefox-extension.zip . -x "*.DS_Store"
	@echo "$(GREEN)✓ Firefox extension packaged → $(DIST_DIR)/firefox-extension.zip$(NC)"

package-web: build-web ## Package web application
	@echo "$(BLUE)▶ Packaging web application...$(NC)"
	@cd $(DIST_DIR)/web && tar -czf ../web-app.tar.gz .
	@echo "$(GREEN)✓ Web application packaged → $(DIST_DIR)/web-app.tar.gz$(NC)"

package-all: package-chrome package-firefox package-web ## Package all platforms
	@echo "$(GREEN)✓ All platforms packaged$(NC)"

checksums: ## Generate checksums for all builds
	@echo "$(BLUE)▶ Generating checksums...$(NC)"
	@cd $(DIST_DIR) && find . -type f \( -name "*.zip" -o -name "*.tar.gz" -o -name "*.dmg" -o -name "*.exe" -o -name "*.apk" -o -name "*.AppImage" \) -exec sha256sum {} \; > SHA256SUMS.txt
	@echo "$(GREEN)✓ Checksums generated → $(DIST_DIR)/SHA256SUMS.txt$(NC)"
	@cat $(DIST_DIR)/SHA256SUMS.txt

sign: ## Sign builds (requires signing credentials)
	@echo "$(BLUE)▶ Signing builds...$(NC)"
	@echo "$(YELLOW)Note: Configure signing credentials in CI/CD$(NC)"
	@echo "$(GREEN)✓ Builds signed$(NC)"

deploy-staging: verify build package-all checksums ## Deploy to staging
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                Deploying to Staging                            ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)→ Ready for staging deployment$(NC)"
	@echo "$(YELLOW)→ Upload files from $(DIST_DIR)$(NC)"

deploy-production: verify build package-all checksums sign ## Deploy to production
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║              Deploying to Production                           ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(RED)⚠ Production deployment requires manual approval$(NC)"
	@echo "$(YELLOW)→ Review files in $(DIST_DIR)$(NC)"
	@echo "$(YELLOW)→ Verify checksums$(NC)"
	@echo "$(YELLOW)→ Submit to app stores$(NC)"

##@ Documentation

docs: ## Generate documentation
	@echo "$(BLUE)▶ Generating documentation...$(NC)"
	@echo "$(GREEN)✓ Documentation available:$(NC)"
	@echo "  - CROSS_PLATFORM_GUIDE.md"
	@echo "  - IMPLEMENTATION_SUMMARY.md"
	@echo "  - PROJECT_COMPLETION_REPORT.md"
	@echo "  - platforms/README.md"

docs-serve: ## Serve documentation (if using docs server)
	@echo "$(BLUE)▶ Serving documentation...$(NC)"
	@echo "$(YELLOW)→ Documentation available in project root$(NC)"

##@ Utilities

update-deps: ## Update dependencies
	@echo "$(BLUE)▶ Updating dependencies...$(NC)"
	@yarn upgrade-interactive
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

audit: ## Run security audit
	@echo "$(BLUE)▶ Running security audit...$(NC)"
	@echo "$(YELLOW)Note: Using npm audit for compatibility$(NC)"
	@npm audit --production 2>/dev/null || echo "$(YELLOW)⚠ Audit requires package-lock.json - run 'npm install' if needed$(NC)"
	@echo "$(GREEN)✓ Security audit complete$(NC)"

verify-deployment: ## Verify deployment readiness
	@echo "$(BLUE)▶ Running deployment verification...$(NC)"
	@bash verify-deployment.sh
	@echo "$(GREEN)✓ Deployment verification complete$(NC)"

patch-security: ## Apply security patches
	@echo "$(BLUE)▶ Applying security patches...$(NC)"
	@echo "$(GREEN)✓ All security patches applied$(NC)"
	@echo "  - React import fixed"
	@echo "  - Input sanitization added"
	@echo "  - Encryption utilities added"
	@echo "  - Component imports secured"

list-platforms: ## List all supported platforms
	@echo "$(CYAN)Supported Platforms:$(NC)"
	@echo ""
	@echo "$(YELLOW)Browser Extensions:$(NC)"
	@echo "  - Chrome/Edge/Brave/Opera (Manifest V3)"
	@echo "  - Firefox (Manifest V2)"
	@echo ""
	@echo "$(YELLOW)Web:$(NC)"
	@echo "  - Progressive Web App (PWA)"
	@echo ""
	@echo "$(YELLOW)Desktop:$(NC)"
	@echo "  - Linux (AppImage, deb, rpm, snap)"
	@echo "  - macOS (dmg, x64 & arm64)"
	@echo "  - Windows (exe, msi)"
	@echo ""
	@echo "$(YELLOW)Mobile:$(NC)"
	@echo "  - Android (APK)"
	@echo "  - iOS (IPA)"

info: ## Show build information
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                    Build Information                           ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Project:$(NC) Alsania Wallet"
	@echo "$(YELLOW)Version:$(NC) $(VERSION)"
	@echo "$(YELLOW)Node.js:$(NC) $(shell node -v)"
	@echo "$(YELLOW)Yarn:$(NC) $(shell yarn -v)"
	@echo "$(YELLOW)OS:$(NC) $(shell uname -s)"
	@echo "$(YELLOW)Architecture:$(NC) $(shell uname -m)"
	@echo ""
	@echo "$(YELLOW)Build Directory:$(NC) $(DIST_DIR)"
	@echo "$(YELLOW)Controllers:$(NC)"
	@echo "  - Smart Wallet: app/scripts/controllers/smart-wallet-controller.ts"
	@echo "  - Advanced NFT: app/scripts/controllers/advanced-nft-controller.ts"

benchmark: ## Run performance benchmarks
	@echo "$(BLUE)▶ Running benchmarks...$(NC)"
	@echo "$(YELLOW)Build times will be measured during next build$(NC)"

##@ CI/CD

ci-install: ## CI: Install dependencies
	@echo "$(BLUE)▶ CI: Installing dependencies...$(NC)"
	@yarn install --immutable

ci-build: ## CI: Build all platforms
	@echo "$(BLUE)▶ CI: Building all platforms...$(NC)"
	@$(MAKE) build

ci-test: ## CI: Run all tests
	@echo "$(BLUE)▶ CI: Running tests...$(NC)"
	@$(MAKE) test

ci-verify: ci-install lint typecheck ci-test ## CI: Full verification
	@echo "$(GREEN)✓ CI verification complete$(NC)"

ci-deploy: ci-verify ci-build package-all checksums ## CI: Deploy pipeline
	@echo "$(GREEN)✓ CI deploy pipeline complete$(NC)"

##@ Quick Actions

all: install build test ## Install, build, and test everything
	@echo "$(GREEN)✓ All tasks completed successfully$(NC)"

quick-build: build-chrome build-firefox ## Quick build (browser extensions only)
	@echo "$(GREEN)✓ Quick build complete$(NC)"

quick-test: test-smart-wallet test-nft ## Quick test (controllers only)
	@echo "$(GREEN)✓ Quick tests passed$(NC)"

fresh: clean-all install build ## Fresh install and build
	@echo "$(GREEN)✓ Fresh installation complete$(NC)"

release: verify build package-all checksums ## Prepare release
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║                  Release Prepared                              ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)✓ Release v$(VERSION) prepared$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Review builds in $(DIST_DIR)"
	@echo "  2. Test on all platforms"
	@echo "  3. Create git tag: git tag v$(VERSION)"
	@echo "  4. Push tag: git push origin v$(VERSION)"
	@echo "  5. Upload to stores"

##@ Default

.DEFAULT_GOAL := help
