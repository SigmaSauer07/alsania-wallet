/**
 * Electron configuration for Alsania Wallet Desktop
 */

const path = require('path');

module.exports = {
  appId: 'ai.alsania.wallet',
  productName: 'Alsania Wallet',
  copyright: 'Copyright © 2025 Alsania Labs',
  
  directories: {
    buildResources: 'build',
    output: 'dist/desktop',
  },

  files: [
    'build/**/*',
    'node_modules/**/*',
    'package.json',
  ],

  // macOS configuration
  mac: {
    category: 'public.app-category.finance',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64'],
      },
    ],
    icon: 'build/icons/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    signIgnore: [
      'node_modules/usb',
      'node_modules/@ledgerhq',
      'node_modules/@trezor',
    ],
  },

  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications',
      },
    ],
    sign: false,
  },

  // Windows configuration
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32'],
      },
      {
        target: 'portable',
        arch: ['x64', 'ia32'],
      },
    ],
    icon: 'build/icons/icon.ico',
    publisherName: 'Alsania Labs',
    verifyUpdateCodeSignature: false,
  },

  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Alsania Wallet',
  },

  // Linux configuration
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'deb',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'rpm',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'snap',
        arch: ['x64'],
      },
    ],
    icon: 'build/icons',
    category: 'Finance',
    desktop: {
      StartupWMClass: 'Alsania Wallet',
      MimeType: 'x-scheme-handler/ethereum;',
    },
    executableArgs: ['--no-sandbox'],
  },

  snap: {
    confinement: 'classic',
    grade: 'stable',
    summary: 'Secure crypto wallet with smart account features',
  },

  // Auto-updater configuration
  publish: {
    provider: 'github',
    owner: 'alsania-labs',
    repo: 'alsania-wallet',
    private: false,
  },

  // Code signing (configure in CI/CD)
  afterSign: 'build/notarize.js',

  // Protocol handler
  protocols: {
    name: 'Ethereum URI',
    schemes: ['ethereum', 'alsania'],
  },
};
