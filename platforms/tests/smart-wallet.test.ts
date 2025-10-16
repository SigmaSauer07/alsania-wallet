/**
 * Smart Wallet Controller Tests
 */

import { SmartWalletController } from '../../app/scripts/controllers/smart-wallet-controller';
import type { Hex } from '@metamask/utils';

describe('SmartWalletController', () => {
  let controller: SmartWalletController;
  let messenger: any;

  beforeEach(() => {
    messenger = {
      publish: jest.fn(),
      call: jest.fn(),
    };
    
    controller = new SmartWalletController({
      messenger,
      state: {},
    });
  });

  describe('Session Keys', () => {
    it('should add a session key', () => {
      const sessionKey = {
        address: '0x1234567890123456789012345678901234567890' as Hex,
        validUntil: Math.floor(Date.now() / 1000) + 3600,
        validAfter: Math.floor(Date.now() / 1000),
        permissions: ['eth_sendTransaction'],
        label: 'Test Session',
      };

      controller.addSessionKey(sessionKey);

      const activeKeys = controller.getActiveSessionKeys();
      expect(activeKeys).toHaveLength(1);
      expect(activeKeys[0]).toEqual(sessionKey);
    });

    it('should revoke a session key', () => {
      const sessionKey = {
        address: '0x1234567890123456789012345678901234567890' as Hex,
        validUntil: Math.floor(Date.now() / 1000) + 3600,
        validAfter: Math.floor(Date.now() / 1000),
        permissions: ['eth_sendTransaction'],
        label: 'Test Session',
      };

      controller.addSessionKey(sessionKey);
      controller.revokeSessionKey(sessionKey.address);

      const activeKeys = controller.getActiveSessionKeys();
      expect(activeKeys).toHaveLength(0);
    });

    it('should validate session key permissions', () => {
      const sessionKey = {
        address: '0x1234567890123456789012345678901234567890' as Hex,
        validUntil: Math.floor(Date.now() / 1000) + 3600,
        validAfter: Math.floor(Date.now() / 1000),
        permissions: ['eth_sendTransaction', 'eth_signTypedData'],
        label: 'Test Session',
      };

      controller.addSessionKey(sessionKey);

      expect(
        controller.validateSessionKey(sessionKey.address, 'eth_sendTransaction')
      ).toBe(true);
      expect(
        controller.validateSessionKey(sessionKey.address, 'eth_signTypedData')
      ).toBe(true);
      expect(
        controller.validateSessionKey(sessionKey.address, 'eth_accounts')
      ).toBe(false);
    });

    it('should filter expired session keys', () => {
      const expiredKey = {
        address: '0x1234567890123456789012345678901234567890' as Hex,
        validUntil: Math.floor(Date.now() / 1000) - 100,
        validAfter: Math.floor(Date.now() / 1000) - 200,
        permissions: ['eth_sendTransaction'],
        label: 'Expired Session',
      };

      controller.addSessionKey(expiredKey);
      const activeKeys = controller.getActiveSessionKeys();
      expect(activeKeys).toHaveLength(0);
    });
  });

  describe('Paymaster', () => {
    it('should configure paymaster for a chain', () => {
      const chainId = '0x1' as Hex;
      const config = {
        url: 'https://paymaster.example.com',
        sponsorshipPolicy: 'always' as const,
      };

      controller.configurePaymaster(chainId, config);

      const retrievedConfig = controller.getPaymasterConfig(chainId);
      expect(retrievedConfig).toEqual(config);
    });

    it('should return undefined for unconfigured chain', () => {
      const config = controller.getPaymasterConfig('0x999' as Hex);
      expect(config).toBeUndefined();
    });
  });

  describe('Batch Transactions', () => {
    it('should add transactions to batch', () => {
      const tx1 = {
        to: '0x1111111111111111111111111111111111111111' as Hex,
        value: '0x0' as Hex,
        data: '0x' as Hex,
      };
      const tx2 = {
        to: '0x2222222222222222222222222222222222222222' as Hex,
        value: '0x1' as Hex,
        data: '0xabcd' as Hex,
      };

      controller.addToBatch(tx1);
      controller.addToBatch(tx2);

      const batched = controller.getBatchedTransactions();
      expect(batched).toHaveLength(2);
      expect(batched[0]).toEqual(tx1);
      expect(batched[1]).toEqual(tx2);
    });

    it('should clear batch', () => {
      const tx = {
        to: '0x1111111111111111111111111111111111111111' as Hex,
        value: '0x0' as Hex,
        data: '0x' as Hex,
      };

      controller.addToBatch(tx);
      expect(controller.getBatchedTransactions()).toHaveLength(1);

      controller.clearBatch();
      expect(controller.getBatchedTransactions()).toHaveLength(0);
    });

    it('should execute batch', async () => {
      const tx = {
        to: '0x1111111111111111111111111111111111111111' as Hex,
        value: '0x0' as Hex,
        data: '0x' as Hex,
      };

      controller.addToBatch(tx);
      const hash = await controller.executeBatch();

      expect(hash).toBeDefined();
      expect(controller.getBatchedTransactions()).toHaveLength(0);
    });
  });

  describe('Social Recovery', () => {
    it('should add guardians', () => {
      const guardian1 = '0x1111111111111111111111111111111111111111' as Hex;
      const guardian2 = '0x2222222222222222222222222222222222222222' as Hex;

      controller.addGuardian(guardian1);
      controller.addGuardian(guardian2);

      const guardians = controller.getGuardians();
      expect(guardians).toHaveLength(2);
      expect(guardians).toContain(guardian1);
      expect(guardians).toContain(guardian2);
    });

    it('should not add duplicate guardians', () => {
      const guardian = '0x1111111111111111111111111111111111111111' as Hex;

      controller.addGuardian(guardian);
      controller.addGuardian(guardian);

      const guardians = controller.getGuardians();
      expect(guardians).toHaveLength(1);
    });

    it('should remove guardians', () => {
      const guardian = '0x1111111111111111111111111111111111111111' as Hex;

      controller.addGuardian(guardian);
      expect(controller.getGuardians()).toHaveLength(1);

      controller.removeGuardian(guardian);
      expect(controller.getGuardians()).toHaveLength(0);
    });
  });

  describe('Smart Account Settings', () => {
    it('should enable/disable smart account features', () => {
      controller.setSmartAccountEnabled(true);
      expect(controller.state.smartAccountEnabled).toBe(true);

      controller.setSmartAccountEnabled(false);
      expect(controller.state.smartAccountEnabled).toBe(false);
    });
  });
});
