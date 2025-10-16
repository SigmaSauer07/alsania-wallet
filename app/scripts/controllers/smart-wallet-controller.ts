/**
 * Smart Wallet Controller for Alsania Wallet
 * Provides advanced EIP-4337 features including paymaster support,
 * batch transactions, and session key management
 */

import { EventEmitter } from 'events';
import type {
  RestrictedControllerMessenger,
  StateMetadata,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { Hex } from '@metamask/utils';

// Types
export interface SessionKey {
  address: Hex;
  validUntil: number;
  validAfter: number;
  permissions: string[];
  label: string;
}

export interface PaymasterConfig {
  url: string;
  context?: Record<string, unknown>;
  sponsorshipPolicy?: 'always' | 'conditional' | 'never';
}

export interface BatchTransaction {
  to: Hex;
  value: Hex;
  data: Hex;
}

export interface SmartWalletState {
  sessionKeys: Record<Hex, SessionKey>;
  paymasterConfigs: Record<Hex, PaymasterConfig>; // chainId -> config
  batchedTransactions: BatchTransaction[];
  smartAccountEnabled: boolean;
  socialRecoveryGuardians: Hex[];
}

export const SmartWalletControllerStateMetadata: StateMetadata<SmartWalletState> =
  {
    sessionKeys: {
      persist: true,
      anonymous: false,
    },
    paymasterConfigs: {
      persist: true,
      anonymous: false,
    },
    batchedTransactions: {
      persist: true,
      anonymous: false,
    },
    smartAccountEnabled: {
      persist: true,
      anonymous: false,
    },
    socialRecoveryGuardians: {
      persist: true,
      anonymous: false,
    },
  };

const defaultState: SmartWalletState = {
  sessionKeys: {},
  paymasterConfigs: {},
  batchedTransactions: [],
  smartAccountEnabled: true,
  socialRecoveryGuardians: [],
};

export type SmartWalletControllerEvents = {
  sessionKeyAdded: [SessionKey];
  sessionKeyRevoked: [Hex];
  paymasterConfigured: [Hex, PaymasterConfig];
  transactionBatched: [BatchTransaction];
  batchExecuted: [Hex];
};

export type SmartWalletControllerMessenger = RestrictedControllerMessenger<
  'SmartWalletController',
  never,
  SmartWalletControllerEvents,
  never,
  never
>;

/**
 * SmartWalletController manages advanced smart wallet features
 * including session keys, paymaster integration, and batch transactions
 */
export class SmartWalletController extends BaseController<
  'SmartWalletController',
  SmartWalletState,
  SmartWalletControllerMessenger
> {
  private hub = new EventEmitter();

  constructor({
    messenger,
    state,
  }: {
    messenger: SmartWalletControllerMessenger;
    state?: Partial<SmartWalletState>;
  }) {
    super({
      messenger,
      metadata: SmartWalletControllerStateMetadata,
      name: 'SmartWalletController',
      state: { ...defaultState, ...state },
    });
  }

  /**
   * Add a session key for temporary delegated access
   */
  addSessionKey(sessionKey: SessionKey): void {
    this.update((state) => {
      state.sessionKeys[sessionKey.address] = sessionKey;
    });

    this.messagingSystem.publish('SmartWalletController:sessionKeyAdded', sessionKey);
    this.hub.emit('session-key-added', sessionKey);
  }

  /**
   * Revoke a session key
   */
  revokeSessionKey(address: Hex): void {
    this.update((state) => {
      delete state.sessionKeys[address];
    });

    this.messagingSystem.publish('SmartWalletController:sessionKeyRevoked', address);
    this.hub.emit('session-key-revoked', address);
  }

  /**
   * Get all active session keys
   */
  getActiveSessionKeys(): SessionKey[] {
    const now = Date.now() / 1000;
    return Object.values(this.state.sessionKeys).filter(
      (key) => key.validUntil > now && key.validAfter <= now,
    );
  }

  /**
   * Configure paymaster for a specific chain
   */
  configurePaymaster(chainId: Hex, config: PaymasterConfig): void {
    this.update((state) => {
      state.paymasterConfigs[chainId] = config;
    });

    this.messagingSystem.publish(
      'SmartWalletController:paymasterConfigured',
      chainId,
      config,
    );
    this.hub.emit('paymaster-configured', chainId, config);
  }

  /**
   * Get paymaster configuration for a chain
   */
  getPaymasterConfig(chainId: Hex): PaymasterConfig | undefined {
    return this.state.paymasterConfigs[chainId];
  }

  /**
   * Add transaction to batch
   */
  addToBatch(transaction: BatchTransaction): void {
    this.update((state) => {
      state.batchedTransactions.push(transaction);
    });

    this.messagingSystem.publish(
      'SmartWalletController:transactionBatched',
      transaction,
    );
    this.hub.emit('transaction-batched', transaction);
  }

  /**
   * Get all batched transactions
   */
  getBatchedTransactions(): BatchTransaction[] {
    return [...this.state.batchedTransactions];
  }

  /**
   * Clear batch
   */
  clearBatch(): void {
    this.update((state) => {
      state.batchedTransactions = [];
    });
  }

  /**
   * Execute batch of transactions
   */
  async executeBatch(): Promise<Hex> {
    const transactions = this.getBatchedTransactions();
    if (transactions.length === 0) {
      throw new Error('No transactions in batch');
    }

    // This would integrate with the UserOperationController
    // For now, we'll return a mock hash
    const batchHash = '0x' + '0'.repeat(64) as Hex;

    this.clearBatch();
    this.messagingSystem.publish(
      'SmartWalletController:batchExecuted',
      batchHash,
    );
    this.hub.emit('batch-executed', batchHash);

    return batchHash;
  }

  /**
   * Enable/disable smart account features
   */
  setSmartAccountEnabled(enabled: boolean): void {
    this.update((state) => {
      state.smartAccountEnabled = enabled;
    });
  }

  /**
   * Add social recovery guardian
   */
  addGuardian(guardianAddress: Hex): void {
    this.update((state) => {
      if (!state.socialRecoveryGuardians.includes(guardianAddress)) {
        state.socialRecoveryGuardians.push(guardianAddress);
      }
    });
  }

  /**
   * Remove social recovery guardian
   */
  removeGuardian(guardianAddress: Hex): void {
    this.update((state) => {
      state.socialRecoveryGuardians = state.socialRecoveryGuardians.filter(
        (addr) => addr !== guardianAddress,
      );
    });
  }

  /**
   * Get all guardians
   */
  getGuardians(): Hex[] {
    return [...this.state.socialRecoveryGuardians];
  }

  /**
   * Validate session key permissions
   */
  validateSessionKey(
    address: Hex,
    requiredPermission: string,
  ): boolean {
    const sessionKey = this.state.sessionKeys[address];
    if (!sessionKey) {
      return false;
    }

    const now = Date.now() / 1000;
    if (sessionKey.validUntil <= now || sessionKey.validAfter > now) {
      return false;
    }

    return sessionKey.permissions.includes(requiredPermission);
  }
}
