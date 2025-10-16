# Alsania Wallet - Cross-Platform Build Guide

This directory contains build configurations for all supported platforms.

## Supported Platforms

### Browser Extensions
- Chrome/Chromium-based browsers (Chrome, Edge, Brave, Opera)
- Firefox
- Safari (macOS/iOS)

### Web Application
- Progressive Web App (PWA) with service worker support
- Works on any modern browser

### Desktop Applications
- Linux (AppImage, deb, rpm)
- macOS (dmg, pkg)
- Windows (exe, msi)

### Mobile Applications
- Android (apk, aab)
- iOS (ipa)

## Build Instructions

### Prerequisites
```bash
# Install dependencies
yarn install

# Ensure you have the following tools installed:
# - Node.js >= 20.12.0
# - Yarn >= 4.9.1
```

### Browser Extensions

#### Chrome/Edge/Brave/Opera
```bash
yarn build:chrome
# Output: platforms/dist/chrome-extension/
```

#### Firefox
```bash
yarn build:firefox
# Output: platforms/dist/firefox-extension/
```

### Web Application
```bash
yarn build:web
# Output: platforms/dist/web/
```

### Desktop Applications

#### All Platforms
```bash
yarn build:desktop
# Outputs:
# - platforms/dist/desktop/linux/
# - platforms/dist/desktop/mac/
# - platforms/dist/desktop/windows/
```

#### Individual Platforms
```bash
yarn build:desktop:linux
yarn build:desktop:mac
yarn build:desktop:windows
```

### Mobile Applications

#### Android
```bash
yarn build:android
# Output: platforms/dist/mobile/android/
```

#### iOS
```bash
yarn build:ios
# Output: platforms/dist/mobile/ios/
```

## Platform-Specific Notes

### Browser Extensions
- Extensions use Manifest V3 for Chrome/Edge
- Firefox uses Manifest V2 (with V3 migration path)
- All browser APIs are polyfilled for cross-browser compatibility

### Web Application
- Fully responsive design
- Offline support via service workers
- Can be installed as PWA on supported devices

### Desktop
- Built with Electron
- Native system tray integration
- Auto-updates supported
- Hardware wallet support (Ledger, Trezor, Keystone, Lattice)

### Mobile
- React Native for maximum performance
- Biometric authentication (Face ID, Touch ID, fingerprint)
- Deep linking support
- WalletConnect integration
- In-app browser (dApp browser)

## Testing

### Unit Tests
```bash
yarn test:unit
```

### E2E Tests (All Platforms)
```bash
yarn test:e2e:all
```

### Platform-Specific E2E Tests
```bash
yarn test:e2e:chrome
yarn test:e2e:firefox
yarn test:e2e:web
yarn test:e2e:desktop
yarn test:e2e:android
yarn test:e2e:ios
```

## Distribution

### Browser Extension Stores
- Chrome Web Store
- Firefox Add-ons
- Edge Add-ons
- Safari Extensions Gallery

### App Stores
- Google Play Store (Android)
- Apple App Store (iOS, macOS)
- Microsoft Store (Windows)
- Snap Store (Linux)
- Flathub (Linux)

## Security

All builds are:
- Signed with appropriate certificates
- Built in isolated environments
- Scanned for vulnerabilities
- Audited for permissions

## Support Matrix

| Feature | Chrome | Firefox | Safari | Web | Desktop | Android | iOS |
|---------|--------|---------|--------|-----|---------|---------|-----|
| EIP-4337 Smart Accounts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NFT Gallery | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hardware Wallets | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| Biometric Auth | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| WalletConnect | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Snaps | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Legend:
- ✅ Fully Supported
- ⚠️ Partially Supported / Platform Limitations
- ❌ Not Supported
