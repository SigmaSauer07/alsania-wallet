/**
 * Cross-Platform Integration Tests
 */

import fs from 'fs';
import path from 'path';

describe('Cross-Platform Build Artifacts', () => {
  const platformsDir = path.join(__dirname, '../..');

  describe('Browser Extensions', () => {
    it('Chrome manifest should be valid', () => {
      const manifestPath = path.join(platformsDir, 'chrome/manifest.v3.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.manifest_version).toBe(3);
      expect(manifest.name).toBe('Alsania Wallet');
      expect(manifest.permissions).toContain('storage');
      expect(manifest.permissions).toContain('activeTab');
    });

    it('Firefox manifest should be valid', () => {
      const manifestPath = path.join(platformsDir, 'firefox/manifest.v2.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.manifest_version).toBe(2);
      expect(manifest.name).toBe('Alsania Wallet');
      expect(manifest.permissions).toContain('storage');
    });
  });

  describe('Web Application', () => {
    it('PWA manifest should be valid', () => {
      const manifestPath = path.join(platformsDir, 'web/manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.name).toBe('Alsania Wallet');
      expect(manifest.short_name).toBe('Alsania');
      expect(manifest.display).toBe('standalone');
      expect(manifest.icons).toBeDefined();
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    it('Service worker should exist', () => {
      const swPath = path.join(platformsDir, 'web/service-worker.js');
      expect(fs.existsSync(swPath)).toBe(true);

      const content = fs.readFileSync(swPath, 'utf-8');
      expect(content).toContain('CACHE_NAME');
      expect(content).toContain('install');
      expect(content).toContain('activate');
      expect(content).toContain('fetch');
    });
  });

  describe('Desktop Application', () => {
    it('Electron config should be valid', () => {
      const configPath = path.join(platformsDir, 'desktop/electron.config.js');
      expect(fs.existsSync(configPath)).toBe(true);

      const config = require(configPath);
      expect(config.appId).toBe('ai.alsania.wallet');
      expect(config.productName).toBe('Alsania Wallet');
      expect(config.mac).toBeDefined();
      expect(config.win).toBeDefined();
      expect(config.linux).toBeDefined();
    });

    it('Electron main process should exist', () => {
      const mainPath = path.join(platformsDir, 'desktop/main.js');
      expect(fs.existsSync(mainPath)).toBe(true);

      const content = fs.readFileSync(mainPath, 'utf-8');
      expect(content).toContain('BrowserWindow');
      expect(content).toContain('createWindow');
      expect(content).toContain('ipcMain');
    });
  });

  describe('Mobile Applications', () => {
    it('Android build.gradle should be valid', () => {
      const gradlePath = path.join(platformsDir, 'mobile/android/app/build.gradle');
      expect(fs.existsSync(gradlePath)).toBe(true);

      const content = fs.readFileSync(gradlePath, 'utf-8');
      expect(content).toContain('com.android.application');
      expect(content).toContain('ai.alsania.wallet');
      expect(content).toContain('compileSdkVersion');
    });

    it('iOS Podfile should be valid', () => {
      const podfilePath = path.join(platformsDir, 'mobile/ios/Podfile');
      expect(fs.existsSync(podfilePath)).toBe(true);

      const content = fs.readFileSync(podfilePath, 'utf-8');
      expect(content).toContain('platform :ios');
      expect(content).toContain('AlsaniaWallet');
      expect(content).toContain('use_react_native');
    });
  });

  describe('Build Scripts', () => {
    it('Build-all script should exist and be executable', () => {
      const scriptPath = path.join(platformsDir, 'build-all.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);

      const stats = fs.statSync(scriptPath);
      // Check if executable bit is set (on Unix systems)
      if (process.platform !== 'win32') {
        expect(stats.mode & fs.constants.S_IXUSR).toBeTruthy();
      }

      const content = fs.readFileSync(scriptPath, 'utf-8');
      expect(content).toContain('#!/bin/bash');
      expect(content).toContain('chrome');
      expect(content).toContain('firefox');
      expect(content).toContain('web');
      expect(content).toContain('desktop');
      expect(content).toContain('android');
      expect(content).toContain('ios');
    });
  });
});

describe('Feature Availability', () => {
  const features = [
    'smart-wallet-controller',
    'advanced-nft-controller',
  ];

  features.forEach((feature) => {
    it(`${feature} should exist`, () => {
      const featurePath = path.join(
        __dirname,
        '../../app/scripts/controllers',
        `${feature}.ts`
      );
      expect(fs.existsSync(featurePath)).toBe(true);
    });
  });
});
