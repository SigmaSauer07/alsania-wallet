# Alsania Wallet - Makefile Guide

## 📋 Overview

The Makefile provides a comprehensive, easy-to-use interface for all build, test, and deployment operations. It simplifies complex commands into simple, memorable targets.

## 🚀 Quick Start

```bash
# See all available commands
make help

# Check project status
make status

# Install dependencies and setup
make setup

# Build all platforms
make build

# Run tests
make test

# Start development
make dev
```

## 📚 Command Categories

### General Commands

#### `make help`
Display comprehensive help with all available commands, organized by category.

```bash
make help
```

**Output:** Beautiful formatted help menu with color-coded categories.

#### `make version`
Show current project version.

```bash
make version
# Output: Alsania Wallet v12.20.0
```

#### `make status`
Show detailed project status including:
- Version information
- Node.js and Yarn versions
- Dependency installation status
- Platform build status

```bash
make status
```

**Example Output:**
```
╔════════════════════════════════════════════════════════════════╗
║                    Project Status                              ║
╚════════════════════════════════════════════════════════════════╝

Version: 12.20.0
Node: v22.20.0
Yarn: 4.9.1

Dependencies:
  ✓ Installed

Platform Builds:
  ✓ Chrome
  ✓ Firefox
  ✓ Web
  ✗ Desktop
  ✗ Mobile
```

---

### Installation & Setup

#### `make install`
Install all project dependencies using Yarn.

```bash
make install
```

**What it does:**
- Enables Corepack
- Activates Yarn 4.9.1
- Installs all npm packages
- Shows installation progress

#### `make install-force`
Force reinstall all dependencies (useful when experiencing dependency issues).

```bash
make install-force
```

**What it does:**
- Removes `node_modules` and `yarn.lock`
- Clean install of all dependencies
- Useful for resolving version conflicts

#### `make setup`
Initial project setup (run once after cloning).

```bash
make setup
```

**What it does:**
- Installs dependencies
- Makes build scripts executable
- Creates necessary directories
- Prepares environment

---

### Building

#### `make build`
Build all platforms in one command.

```bash
make build
```

**Builds:**
- Chrome extension
- Firefox extension
- Web application
- Desktop applications (Linux, macOS, Windows)
- Mobile applications (Android, iOS)

**Output:** Build artifacts in `platforms/dist/`

#### `make build-chrome`
Build only Chrome extension.

```bash
make build-chrome
```

**Output:** `platforms/dist/chrome-extension/`

#### `make build-firefox`
Build only Firefox extension.

```bash
make build-firefox
```

**Output:** `platforms/dist/firefox-extension/`

#### `make build-web`
Build web application (PWA).

```bash
make build-web
```

**Output:** `platforms/dist/web/`

#### `make build-desktop`
Build desktop application for all operating systems.

```bash
make build-desktop
```

**Builds:**
- Linux: AppImage, deb, rpm, snap
- macOS: dmg, zip (Intel & Apple Silicon)
- Windows: exe, msi

**Output:** `platforms/dist/desktop/`

#### `make build-desktop-linux`
Build desktop application for Linux only.

```bash
make build-desktop-linux
```

#### `make build-desktop-mac`
Build desktop application for macOS only.

```bash
make build-desktop-mac
```

**Note:** Best run on macOS for native building.

#### `make build-desktop-windows`
Build desktop application for Windows only.

```bash
make build-desktop-windows
```

#### `make build-android`
Build Android application.

```bash
make build-android
```

**Requirements:**
- Android SDK
- Gradle

**Output:** `platforms/dist/mobile/android/*.apk`

#### `make build-ios`
Build iOS application.

```bash
make build-ios
```

**Requirements:**
- macOS
- Xcode
- CocoaPods

**Output:** `platforms/dist/mobile/ios/*.ipa`

#### `make build-summary`
Show summary of all builds with sizes.

```bash
make build-summary
```

---

### Development

#### `make dev`
Start development mode (Chrome extension by default).

```bash
make dev
```

Alias for `make dev-chrome`.

#### `make dev-chrome`
Start Chrome extension development with hot reload.

```bash
make dev-chrome
```

**Instructions:**
1. Run command
2. Open Chrome
3. Go to `chrome://extensions`
4. Enable Developer Mode
5. Click "Load unpacked"
6. Select `dist/chrome` folder
7. Edit code and reload extension

#### `make dev-firefox`
Start Firefox extension development with hot reload.

```bash
make dev-firefox
```

**Instructions:**
1. Run command
2. Open Firefox
3. Go to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select any file in `dist/firefox` folder

#### `make dev-web`
Start web application development server.

```bash
make dev-web
```

**Access:** http://localhost:3000

**Features:**
- Hot module replacement
- Automatic browser refresh
- Source maps for debugging

#### `make dev-desktop`
Start desktop application development.

```bash
make dev-desktop
```

**Features:**
- Runs web dev server
- Launches Electron window
- Hot reload support
- DevTools enabled

---

### Testing

#### `make test`
Run all tests with coverage.

```bash
make test
```

**Includes:**
- Unit tests
- Integration tests
- Controller tests
- Platform tests

#### `make test-unit`
Run only unit tests.

```bash
make test-unit
```

#### `make test-smart-wallet`
Test smart wallet controller specifically.

```bash
make test-smart-wallet
```

**Tests:**
- Session key management
- Paymaster integration
- Batch transactions
- Social recovery

#### `make test-nft`
Test NFT controller specifically.

```bash
make test-nft
```

**Tests:**
- Metadata caching
- IPFS resolution
- Gallery management
- Favorites system

#### `make test-platforms`
Test cross-platform integrations.

```bash
make test-platforms
```

**Validates:**
- Manifest files
- Configuration files
- Build artifacts
- Feature availability

#### `make test-e2e`
Run end-to-end tests for all platforms.

```bash
make test-e2e
```

**Tests:**
- User workflows
- Cross-browser compatibility
- Platform-specific features

#### `make test-e2e-chrome`
Run E2E tests for Chrome only.

```bash
make test-e2e-chrome
```

#### `make test-e2e-firefox`
Run E2E tests for Firefox only.

```bash
make test-e2e-firefox
```

#### `make test-watch`
Run tests in watch mode (re-run on file changes).

```bash
make test-watch
```

**Useful for:**
- TDD (Test-Driven Development)
- Continuous testing during development

#### `make test-coverage`
Generate detailed test coverage report.

```bash
make test-coverage
```

**Output:** `coverage/index.html`

**View:**
```bash
open coverage/index.html
```

---

### Quality Assurance

#### `make lint`
Run all linters (ESLint, Prettier, TypeScript).

```bash
make lint
```

**Checks:**
- JavaScript/TypeScript syntax
- Code style
- Type errors
- Best practices

#### `make lint-fix`
Automatically fix linting issues.

```bash
make lint-fix
```

**Fixes:**
- Code formatting
- Import organization
- Simple style issues

#### `make typecheck`
Run TypeScript type checking.

```bash
make typecheck
```

**Validates:**
- Type correctness
- Interface implementations
- Generic constraints

#### `make format`
Format code with Prettier.

```bash
make format
```

**Formats:**
- JavaScript/TypeScript
- JSON
- Markdown
- YAML

#### `make verify`
Run all quality checks (lint + typecheck + test).

```bash
make verify
```

**Perfect for:**
- Pre-commit checks
- CI/CD verification
- Release preparation

---

### Cleaning

#### `make clean`
Clean build artifacts.

```bash
make clean
```

**Removes:**
- `platforms/dist/`
- `build/`
- `dist/`

#### `make clean-deps`
Clean dependencies.

```bash
make clean-deps
```

**Removes:**
- `node_modules/`
- `yarn.lock`

#### `make clean-cache`
Clean build caches.

```bash
make clean-cache
```

**Removes:**
- Webpack cache
- `.cache/`
- `node_modules/.cache/`

#### `make clean-all`
Clean everything (artifacts + dependencies + caches).

```bash
make clean-all
```

**Use when:**
- Experiencing build issues
- Want fresh start
- Switching branches

---

### Deployment

#### `make package-chrome`
Build and package Chrome extension as ZIP.

```bash
make package-chrome
```

**Output:** `platforms/dist/chrome-extension.zip`

**Ready for:**
- Chrome Web Store upload
- Manual distribution

#### `make package-firefox`
Build and package Firefox extension as ZIP.

```bash
make package-firefox
```

**Output:** `platforms/dist/firefox-extension.zip`

**Ready for:**
- Firefox Add-ons upload
- Manual distribution

#### `make package-web`
Build and package web application as tar.gz.

```bash
make package-web
```

**Output:** `platforms/dist/web-app.tar.gz`

**Ready for:**
- Server deployment
- CDN upload

#### `make package-all`
Package all platforms.

```bash
make package-all
```

**Outputs:**
- `chrome-extension.zip`
- `firefox-extension.zip`
- `web-app.tar.gz`

#### `make checksums`
Generate SHA256 checksums for all builds.

```bash
make checksums
```

**Output:** `platforms/dist/SHA256SUMS.txt`

**Example:**
```
a1b2c3d4... chrome-extension.zip
e5f6g7h8... firefox-extension.zip
i9j0k1l2... web-app.tar.gz
```

**Use for:**
- Verifying downloads
- Security validation
- Release notes

#### `make sign`
Sign builds with code signing certificates.

```bash
make sign
```

**Requires:**
- Signing certificates
- Platform-specific tools

**Note:** Configure in CI/CD environment.

#### `make deploy-staging`
Deploy to staging environment.

```bash
make deploy-staging
```

**Includes:**
- Verification
- Build
- Package
- Checksum generation

#### `make deploy-production`
Deploy to production (with safety checks).

```bash
make deploy-production
```

**Includes:**
- All verification
- Signed builds
- Manual approval required

---

### Documentation

#### `make docs`
Generate/view documentation.

```bash
make docs
```

**Lists:**
- `CROSS_PLATFORM_GUIDE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `PROJECT_COMPLETION_REPORT.md`
- `platforms/README.md`

#### `make docs-serve`
Serve documentation on local server (if configured).

```bash
make docs-serve
```

---

### Utilities

#### `make update-deps`
Update dependencies interactively.

```bash
make update-deps
```

**Features:**
- Shows available updates
- Interactive selection
- Version management

#### `make audit`
Run security audit on dependencies.

```bash
make audit
```

**Checks:**
- Known vulnerabilities
- Security issues
- Outdated packages

#### `make list-platforms`
List all supported platforms.

```bash
make list-platforms
```

**Shows:**
- Browser extensions
- Web application
- Desktop platforms
- Mobile platforms

#### `make info`
Show detailed build information.

```bash
make info
```

**Displays:**
- Project name and version
- Node.js and Yarn versions
- Operating system
- Architecture
- Build directories
- Controller locations

#### `make benchmark`
Run performance benchmarks.

```bash
make benchmark
```

---

### CI/CD

#### `make ci-install`
CI: Install dependencies (immutable).

```bash
make ci-install
```

**Features:**
- Lockfile verification
- No interactive prompts
- Reproducible builds

#### `make ci-build`
CI: Build all platforms.

```bash
make ci-build
```

#### `make ci-test`
CI: Run all tests.

```bash
make ci-test
```

#### `make ci-verify`
CI: Full verification (install + lint + typecheck + test).

```bash
make ci-verify
```

**Perfect for:**
- GitHub Actions
- GitLab CI
- Jenkins
- Travis CI

#### `make ci-deploy`
CI: Complete deployment pipeline.

```bash
make ci-deploy
```

**Includes:**
- Verification
- Build
- Package
- Checksums

---

### Quick Actions

#### `make all`
Install, build, and test everything.

```bash
make all
```

**Perfect for:**
- Initial setup
- Full verification
- After pulling changes

#### `make quick-build`
Quick build (browser extensions only).

```bash
make quick-build
```

**Builds:**
- Chrome extension
- Firefox extension

**Use when:**
- Testing browser features
- Quick iterations

#### `make quick-test`
Quick test (controllers only).

```bash
make quick-test
```

**Tests:**
- Smart wallet controller
- NFT controller

**Use when:**
- Testing core features
- Fast feedback

#### `make fresh`
Fresh install and build (clean + install + build).

```bash
make fresh
```

**Perfect for:**
- Resolving issues
- Clean slate
- After major updates

#### `make release`
Prepare release (verify + build + package + checksums).

```bash
make release
```

**Includes:**
- All verification
- All builds
- All packages
- Checksums
- Release checklist

**Output:**
```
╔════════════════════════════════════════════════════════════════╗
║                  Release Prepared                              ║
╚════════════════════════════════════════════════════════════════╝

✓ Release v12.20.0 prepared

Next steps:
  1. Review builds in platforms/dist
  2. Test on all platforms
  3. Create git tag: git tag v12.20.0
  4. Push tag: git push origin v12.20.0
  5. Upload to stores
```

---

## 🎯 Common Workflows

### First Time Setup
```bash
make setup          # Install and configure
make status         # Verify setup
make build          # Build all platforms
make test           # Verify everything works
```

### Daily Development
```bash
make dev            # Start development
# Edit code
make test-watch     # Run tests on changes
make lint-fix       # Fix linting issues
```

### Before Committing
```bash
make verify         # Run all checks
make format         # Format code
# Commit if all passes
```

### Preparing Release
```bash
make fresh          # Clean build
make release        # Prepare release
# Review and distribute
```

### CI/CD Pipeline
```bash
make ci-verify      # Verify code
make ci-build       # Build artifacts
make ci-deploy      # Deploy if tests pass
```

### Troubleshooting
```bash
make clean-all      # Clean everything
make install-force  # Reinstall dependencies
make fresh          # Fresh build
```

---

## 🎨 Color Legend

The Makefile uses colors for better readability:

- 🔵 **Blue**: Process starting
- 🟢 **Green**: Success
- 🟡 **Yellow**: Information/Warning
- 🔴 **Red**: Error
- 🟣 **Magenta**: Important information
- 🔷 **Cyan**: Headers and titles

---

## 💡 Tips & Tricks

### Tab Completion
```bash
# Most shells support tab completion
make bui<TAB>       # Completes to build targets
make test-<TAB>     # Shows test targets
```

### Combining Commands
```bash
# Run multiple commands
make clean && make build && make test

# Or use the convenience targets
make fresh          # Does all of above
```

### Parallel Builds
```bash
# Build multiple platforms in parallel
make build-chrome & make build-firefox & wait
```

### Custom Environment Variables
```bash
# Override build options
NODE_ENV=production make build
PLATFORM=chrome make build-chrome
```

### Quiet Mode
```bash
# Reduce output
make build -s       # Silent mode
make build 2>&1 | grep Error  # Show only errors
```

---

## 🔧 Customization

### Adding New Targets

Add to Makefile:
```makefile
my-target: ## Description
	@echo "$(BLUE)▶ Running my target...$(NC)"
	# Your commands here
	@echo "$(GREEN)✓ Complete$(NC)"
```

### Changing Default Behavior

Edit the `.DEFAULT_GOAL`:
```makefile
.DEFAULT_GOAL := status  # Shows status instead of help
```

---

## 📊 Performance

### Build Times (approximate)

| Command | Time | Output Size |
|---------|------|-------------|
| `make build-chrome` | ~2 min | ~15 MB |
| `make build-firefox` | ~2 min | ~15 MB |
| `make build-web` | ~3 min | ~10 MB |
| `make build-desktop` | ~10 min | ~250 MB |
| `make build-android` | ~5 min | ~30 MB |
| `make build-ios` | ~8 min | ~35 MB |
| `make build` (all) | ~15 min | ~355 MB |

### Test Times (approximate)

| Command | Time | Tests |
|---------|------|-------|
| `make test-unit` | ~30 sec | ~50 |
| `make test-e2e` | ~5 min | ~20 |
| `make test` (all) | ~6 min | ~70 |

---

## 🐛 Troubleshooting

### Error: "make: command not found"

**Solution:**
```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential

# Fedora/RHEL
sudo dnf install make
```

### Error: "yarn: command not found"

**Solution:**
```bash
corepack enable
make install
```

### Build Failures

**Solution:**
```bash
make clean-all
make install-force
make build
```

### Dependency Issues

**Solution:**
```bash
make clean-deps
make install
```

---

## 📚 Additional Resources

- **Full Documentation**: `CROSS_PLATFORM_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Platform Guide**: `platforms/README.md`
- **Completion Report**: `PROJECT_COMPLETION_REPORT.md`

---

## 🎉 Summary

The Makefile provides **60+ commands** organized into **13 categories**, making it easy to:

✅ Build all platforms with one command
✅ Test thoroughly with multiple test targets
✅ Deploy safely with verification steps
✅ Develop efficiently with hot reload
✅ Maintain code quality with linting
✅ Package for distribution easily
✅ Troubleshoot with cleaning commands
✅ Automate CI/CD pipelines

**Simple. Powerful. Complete.**

---

**Quick Reference:**
```bash
make help           # Show all commands
make status         # Check project status
make setup          # Initial setup
make build          # Build everything
make test           # Test everything
make dev            # Start development
make verify         # Check quality
make release        # Prepare release
```
