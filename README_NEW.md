# 🌟 Alsania Wallet

> A comprehensive, cross-platform smart wallet with advanced NFT features and EIP-4337 support

[![Version](https://img.shields.io/badge/version-12.20.0-blue.svg)](https://github.com/alsania/wallet)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/alsania/wallet/actions)
[![Platforms](https://img.shields.io/badge/platforms-7-orange.svg)](#platforms)

## ✨ Features

### 🔐 Smart Wallet (EIP-4337)
- **Session Keys**: Temporary delegated access with time-bound permissions
- **Paymaster Integration**: Gasless transactions with configurable sponsorship
- **Batch Transactions**: Combine multiple operations efficiently
- **Social Recovery**: Guardian-based account recovery system

### 🎨 Advanced NFT Management
- **Metadata Caching**: 24-hour cache with automatic expiry for fast loading
- **IPFS Optimization**: Multiple gateway fallbacks for reliability
- **Custom Galleries**: Create and organize collections
- **Favorites System**: Quick access to important NFTs
- **Privacy Controls**: Hide/show NFTs as needed

### 🌐 Cross-Platform Support
- **Browser Extensions**: Chrome, Firefox, Edge, Brave, Opera
- **Web Application**: Progressive Web App with offline support
- **Desktop**: Linux, macOS, Windows (Electron-based)
- **Mobile**: Android and iOS with biometric authentication

## 🚀 Quick Start

### Using Makefile (Recommended)

```bash
# Initial setup
make setup

# Check project status
make status

# Build all platforms
make build

# Run tests
make test

# Start development
make dev
```

### Using Yarn

```bash
# Install dependencies
yarn install

# Build all platforms
yarn build:all

# Run tests
yarn test

# Start development
yarn dev:chrome
```

### Using Build Script

```bash
# Build all platforms at once
bash platforms/build-all.sh
```

## 📦 Build Platforms

### Browser Extensions

```bash
# Chrome/Edge/Brave/Opera
make build-chrome

# Firefox
make build-firefox
```

**Output**: `platforms/dist/chrome-extension/` and `platforms/dist/firefox-extension/`

### Web Application

```bash
# Progressive Web App
make build-web
```

**Output**: `platforms/dist/web/`

### Desktop Applications

```bash
# All platforms
make build-desktop

# Or individually
make build-desktop-linux    # AppImage, deb, rpm, snap
make build-desktop-mac      # dmg (Intel & Apple Silicon)
make build-desktop-windows  # exe, msi
```

**Output**: `platforms/dist/desktop/`

### Mobile Applications

```bash
# Android
make build-android

# iOS (requires macOS)
make build-ios
```

**Output**: `platforms/dist/mobile/`

## 🧪 Testing

```bash
# Run all tests
make test

# Specific test suites
make test-smart-wallet    # Smart wallet controller
make test-nft             # NFT controller
make test-platforms       # Platform integrations

# End-to-end tests
make test-e2e             # All platforms
make test-e2e-chrome      # Chrome only
make test-e2e-firefox     # Firefox only

# Development
make test-watch           # Auto-run on changes
make test-coverage        # Generate coverage report
```

## 🛠️ Development

### Start Development Server

```bash
# Browser extensions (hot reload)
make dev-chrome
make dev-firefox

# Web application
make dev-web

# Desktop application
make dev-desktop
```

### Code Quality

```bash
# Run linters
make lint

# Fix linting issues
make lint-fix

# Type checking
make typecheck

# Format code
make format

# All quality checks
make verify
```

## 📚 Documentation

- **[Makefile Guide](MAKEFILE_GUIDE.md)** - Complete Makefile documentation (60+ commands)
- **[Cross-Platform Guide](CROSS_PLATFORM_GUIDE.md)** - Platform-specific build instructions
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[Project Completion Report](PROJECT_COMPLETION_REPORT.md)** - Full project overview
- **[Platform README](platforms/README.md)** - Platform build documentation

## 🏗️ Architecture

### Smart Wallet Controller
**Location**: `app/scripts/controllers/smart-wallet-controller.ts`

```typescript
// Session key management
controller.addSessionKey({
  address: '0x...',
  validUntil: timestamp,
  validAfter: timestamp,
  permissions: ['eth_sendTransaction'],
  label: 'DApp Session',
});

// Paymaster configuration
controller.configurePaymaster('0x1', {
  url: 'https://paymaster.example.com',
  sponsorshipPolicy: 'always',
});

// Batch transactions
controller.addToBatch({ to: '0x...', value: '0x0', data: '0x...' });
await controller.executeBatch();
```

### Advanced NFT Controller
**Location**: `app/scripts/controllers/advanced-nft-controller.ts`

```typescript
// Cache metadata
controller.cacheNftMetadata(address, tokenId, chainId, metadata);

// Resolve IPFS with fallbacks
const url = await controller.resolveIPFSUrl('ipfs://QmHash...');

// Create gallery
const gallery = controller.createGallery({
  name: 'My Collection',
  description: 'Favorite NFTs',
  nfts: [],
  isPublic: false,
});

// Manage favorites
controller.favoriteNft(address, tokenId, chainId);
```

## 🔧 Makefile Commands

The project includes a comprehensive Makefile with **60+ commands**:

### General
- `make help` - Display all available commands
- `make status` - Show project status
- `make version` - Show current version

### Building
- `make build` - Build all platforms
- `make build-chrome` - Chrome extension
- `make build-firefox` - Firefox extension
- `make build-web` - Web application
- `make build-desktop` - Desktop apps (all OS)
- `make build-android` - Android app
- `make build-ios` - iOS app

### Testing
- `make test` - Run all tests
- `make test-unit` - Unit tests
- `make test-e2e` - E2E tests
- `make test-watch` - Watch mode
- `make test-coverage` - Coverage report

### Development
- `make dev` - Start dev mode
- `make dev-chrome` - Chrome dev
- `make dev-firefox` - Firefox dev
- `make dev-web` - Web dev

### Quality Assurance
- `make lint` - Run linters
- `make lint-fix` - Fix issues
- `make typecheck` - Type check
- `make verify` - All checks

### Deployment
- `make package-all` - Package all
- `make checksums` - Generate checksums
- `make release` - Prepare release

See `MAKEFILE_GUIDE.md` for complete documentation.

## 🌍 Supported Platforms

| Platform | Status | Features |
|----------|--------|----------|
| **Chrome** | ✅ | Full support with Manifest V3 |
| **Firefox** | ✅ | Full support with Manifest V2 |
| **Edge** | ✅ | Chrome-compatible |
| **Brave** | ✅ | Chrome-compatible |
| **Opera** | ✅ | Chrome-compatible |
| **Web** | ✅ | PWA with offline support |
| **Linux** | ✅ | AppImage, deb, rpm, snap |
| **macOS** | ✅ | Intel & Apple Silicon |
| **Windows** | ✅ | exe, msi, portable |
| **Android** | ✅ | APK with biometric auth |
| **iOS** | ✅ | IPA with Face ID/Touch ID |

## 🔒 Security

- ✅ Encrypted storage (AES-256)
- ✅ Secure key management
- ✅ No telemetry or tracking
- ✅ Open source and auditable
- ✅ Hardware wallet support
- ✅ Biometric authentication (mobile)
- ✅ Session key permissions
- ✅ Social recovery

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks: `make verify`
5. Submit a pull request

## 📊 Project Stats

- **Lines of Code**: 4,000+
- **Documentation**: 3,500+ lines
- **Test Coverage**: Comprehensive unit & E2E tests
- **Platforms**: 7 supported
- **Controllers**: 2 (Smart Wallet + NFT)
- **Makefile Commands**: 60+
- **CI/CD Jobs**: 8

## 🗺️ Roadmap

### Current Release (v12.20.0)
- ✅ Smart wallet with EIP-4337
- ✅ Advanced NFT features
- ✅ Cross-platform support
- ✅ Comprehensive build system

### Future Releases
- [ ] Hardware wallet integration enhancements
- [ ] Multi-chain support expansion
- [ ] Advanced DeFi integrations
- [ ] Enhanced privacy features
- [ ] Layer 2 optimizations

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

Portions derived from [MetaMask](https://metamask.io) under MIT License.

## 🙏 Acknowledgments

- Built on top of the excellent [MetaMask](https://github.com/MetaMask/metamask-extension) codebase
- EIP-4337 Account Abstraction standard
- Ethereum and blockchain community

## 📞 Support

- **Documentation**: See docs in project root
- **Issues**: [GitHub Issues](https://github.com/alsania/wallet/issues)
- **Discord**: [Join our community](https://discord.gg/alsania)
- **Email**: support@alsania.ai

## 🎉 Quick Reference

```bash
# Essential Commands
make help             # Show all commands
make status           # Check project status
make setup            # Initial setup
make build            # Build everything
make test             # Test everything
make dev              # Start development
make verify           # Quality checks
make release          # Prepare release
make clean-all        # Clean everything

# Get Started
make setup && make build && make test
```

---

**Built with ❤️ by the Alsania Labs team**

**Status**: ✅ Production Ready | **Version**: 12.20.0 | **License**: MIT
