/**
 * Advanced NFT Controller for Alsania Wallet
 * Provides enhanced NFT features including metadata caching,
 * IPFS optimization, and gallery management
 */

import { EventEmitter } from 'events';
import type {
  RestrictedControllerMessenger,
  StateMetadata,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { Hex } from '@metamask/utils';
import type { Nft } from '@metamask/assets-controllers';

// Types
export interface NftMetadataCache {
  [key: string]: {
    metadata: NftMetadata;
    cachedAt: number;
    expiresAt: number;
  };
}

export interface NftMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  animation_url?: string;
  external_url?: string;
  background_color?: string;
}

export interface NftGallery {
  id: string;
  name: string;
  description?: string;
  nfts: Array<{ address: Hex; tokenId: string; chainId: Hex }>;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface IPFSGatewayConfig {
  primary: string;
  fallbacks: string[];
  timeout: number;
}

export interface AdvancedNftState {
  metadataCache: NftMetadataCache;
  galleries: Record<string, NftGallery>;
  ipfsConfig: IPFSGatewayConfig;
  favoriteNfts: Array<{ address: Hex; tokenId: string; chainId: Hex }>;
  hiddenNfts: Array<{ address: Hex; tokenId: string; chainId: Hex }>;
  nftViewPreferences: {
    gridSize: 'small' | 'medium' | 'large';
    sortBy: 'date' | 'name' | 'collection' | 'value';
    showHidden: boolean;
  };
}

export const AdvancedNftControllerStateMetadata: StateMetadata<AdvancedNftState> =
  {
    metadataCache: {
      persist: true,
      anonymous: false,
    },
    galleries: {
      persist: true,
      anonymous: false,
    },
    ipfsConfig: {
      persist: true,
      anonymous: false,
    },
    favoriteNfts: {
      persist: true,
      anonymous: false,
    },
    hiddenNfts: {
      persist: true,
      anonymous: false,
    },
    nftViewPreferences: {
      persist: true,
      anonymous: false,
    },
  };

const defaultIPFSConfig: IPFSGatewayConfig = {
  primary: 'https://ipfs.io',
  fallbacks: [
    'https://cloudflare-ipfs.com',
    'https://gateway.pinata.cloud',
    'https://dweb.link',
  ],
  timeout: 10000,
};

const defaultState: AdvancedNftState = {
  metadataCache: {},
  galleries: {},
  ipfsConfig: defaultIPFSConfig,
  favoriteNfts: [],
  hiddenNfts: [],
  nftViewPreferences: {
    gridSize: 'medium',
    sortBy: 'date',
    showHidden: false,
  },
};

export type AdvancedNftControllerEvents = {
  nftMetadataCached: [string, NftMetadata];
  galleryCreated: [NftGallery];
  galleryUpdated: [NftGallery];
  galleryDeleted: [string];
  nftFavorited: [Hex, string, Hex];
  nftUnfavorited: [Hex, string, Hex];
  nftHidden: [Hex, string, Hex];
  nftUnhidden: [Hex, string, Hex];
};

export type AdvancedNftControllerMessenger = RestrictedControllerMessenger<
  'AdvancedNftController',
  never,
  AdvancedNftControllerEvents,
  never,
  never
>;

/**
 * AdvancedNftController manages enhanced NFT features
 */
export class AdvancedNftController extends BaseController<
  'AdvancedNftController',
  AdvancedNftState,
  AdvancedNftControllerMessenger
> {
  private hub = new EventEmitter();
  private readonly CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor({
    messenger,
    state,
  }: {
    messenger: AdvancedNftControllerMessenger;
    state?: Partial<AdvancedNftState>;
  }) {
    super({
      messenger,
      metadata: AdvancedNftControllerStateMetadata,
      name: 'AdvancedNftController',
      state: { ...defaultState, ...state },
    });
  }

  /**
   * Cache NFT metadata with expiry
   */
  cacheNftMetadata(
    address: Hex,
    tokenId: string,
    chainId: Hex,
    metadata: NftMetadata,
  ): void {
    const cacheKey = `${chainId}:${address}:${tokenId}`;
    const now = Date.now();

    this.update((state) => {
      state.metadataCache[cacheKey] = {
        metadata,
        cachedAt: now,
        expiresAt: now + this.CACHE_EXPIRY_MS,
      };
    });

    this.messagingSystem.publish(
      'AdvancedNftController:nftMetadataCached',
      cacheKey,
      metadata,
    );
    this.hub.emit('nft-metadata-cached', cacheKey, metadata);
  }

  /**
   * Get cached NFT metadata
   */
  getCachedMetadata(
    address: Hex,
    tokenId: string,
    chainId: Hex,
  ): NftMetadata | null {
    const cacheKey = `${chainId}:${address}:${tokenId}`;
    const cached = this.state.metadataCache[cacheKey];

    if (!cached || cached.expiresAt < Date.now()) {
      return null;
    }

    return cached.metadata;
  }

  /**
   * Clear expired cache entries
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    this.update((state) => {
      Object.keys(state.metadataCache).forEach((key) => {
        if (state.metadataCache[key].expiresAt < now) {
          delete state.metadataCache[key];
        }
      });
    });
  }

  /**
   * Resolve IPFS URL with fallbacks
   */
  async resolveIPFSUrl(ipfsUrl: string): Promise<string> {
    const ipfsHash = ipfsUrl.replace(/^ipfs:\/\//, '');
    const gateways = [
      this.state.ipfsConfig.primary,
      ...this.state.ipfsConfig.fallbacks,
    ];

    for (const gateway of gateways) {
      try {
        const url = `${gateway}/ipfs/${ipfsHash}`;
        const response = await fetch(url, {
          method: 'HEAD',
          signal: AbortSignal.timeout(this.state.ipfsConfig.timeout),
        });

        if (response.ok) {
          return url;
        }
      } catch (error) {
        // Try next gateway
        continue;
      }
    }

    // Return first gateway as fallback
    return `${this.state.ipfsConfig.primary}/ipfs/${ipfsHash}`;
  }

  /**
   * Update IPFS gateway configuration
   */
  updateIPFSConfig(config: Partial<IPFSGatewayConfig>): void {
    this.update((state) => {
      state.ipfsConfig = { ...state.ipfsConfig, ...config };
    });
  }

  /**
   * Create a new NFT gallery
   */
  createGallery(gallery: Omit<NftGallery, 'id' | 'createdAt' | 'updatedAt'>): NftGallery {
    const newGallery: NftGallery = {
      ...gallery,
      id: `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.update((state) => {
      state.galleries[newGallery.id] = newGallery;
    });

    this.messagingSystem.publish(
      'AdvancedNftController:galleryCreated',
      newGallery,
    );
    this.hub.emit('gallery-created', newGallery);

    return newGallery;
  }

  /**
   * Update an existing gallery
   */
  updateGallery(
    galleryId: string,
    updates: Partial<Omit<NftGallery, 'id' | 'createdAt'>>,
  ): void {
    this.update((state) => {
      if (state.galleries[galleryId]) {
        state.galleries[galleryId] = {
          ...state.galleries[galleryId],
          ...updates,
          updatedAt: Date.now(),
        };
      }
    });

    const updatedGallery = this.state.galleries[galleryId];
    if (updatedGallery) {
      this.messagingSystem.publish(
        'AdvancedNftController:galleryUpdated',
        updatedGallery,
      );
      this.hub.emit('gallery-updated', updatedGallery);
    }
  }

  /**
   * Delete a gallery
   */
  deleteGallery(galleryId: string): void {
    this.update((state) => {
      delete state.galleries[galleryId];
    });

    this.messagingSystem.publish(
      'AdvancedNftController:galleryDeleted',
      galleryId,
    );
    this.hub.emit('gallery-deleted', galleryId);
  }

  /**
   * Get all galleries
   */
  getGalleries(): NftGallery[] {
    return Object.values(this.state.galleries);
  }

  /**
   * Get a specific gallery
   */
  getGallery(galleryId: string): NftGallery | undefined {
    return this.state.galleries[galleryId];
  }

  /**
   * Add NFT to gallery
   */
  addNftToGallery(
    galleryId: string,
    nft: { address: Hex; tokenId: string; chainId: Hex },
  ): void {
    this.update((state) => {
      if (state.galleries[galleryId]) {
        const exists = state.galleries[galleryId].nfts.some(
          (n) =>
            n.address === nft.address &&
            n.tokenId === nft.tokenId &&
            n.chainId === nft.chainId,
        );

        if (!exists) {
          state.galleries[galleryId].nfts.push(nft);
          state.galleries[galleryId].updatedAt = Date.now();
        }
      }
    });
  }

  /**
   * Remove NFT from gallery
   */
  removeNftFromGallery(
    galleryId: string,
    address: Hex,
    tokenId: string,
    chainId: Hex,
  ): void {
    this.update((state) => {
      if (state.galleries[galleryId]) {
        state.galleries[galleryId].nfts = state.galleries[galleryId].nfts.filter(
          (n) =>
            !(
              n.address === address &&
              n.tokenId === tokenId &&
              n.chainId === chainId
            ),
        );
        state.galleries[galleryId].updatedAt = Date.now();
      }
    });
  }

  /**
   * Mark NFT as favorite
   */
  favoriteNft(address: Hex, tokenId: string, chainId: Hex): void {
    this.update((state) => {
      const exists = state.favoriteNfts.some(
        (n) =>
          n.address === address &&
          n.tokenId === tokenId &&
          n.chainId === chainId,
      );

      if (!exists) {
        state.favoriteNfts.push({ address, tokenId, chainId });
      }
    });

    this.messagingSystem.publish(
      'AdvancedNftController:nftFavorited',
      address,
      tokenId,
      chainId,
    );
    this.hub.emit('nft-favorited', address, tokenId, chainId);
  }

  /**
   * Remove NFT from favorites
   */
  unfavoriteNft(address: Hex, tokenId: string, chainId: Hex): void {
    this.update((state) => {
      state.favoriteNfts = state.favoriteNfts.filter(
        (n) =>
          !(
            n.address === address &&
            n.tokenId === tokenId &&
            n.chainId === chainId
          ),
      );
    });

    this.messagingSystem.publish(
      'AdvancedNftController:nftUnfavorited',
      address,
      tokenId,
      chainId,
    );
    this.hub.emit('nft-unfavorited', address, tokenId, chainId);
  }

  /**
   * Check if NFT is favorited
   */
  isFavorite(address: Hex, tokenId: string, chainId: Hex): boolean {
    return this.state.favoriteNfts.some(
      (n) =>
        n.address === address && n.tokenId === tokenId && n.chainId === chainId,
    );
  }

  /**
   * Hide an NFT
   */
  hideNft(address: Hex, tokenId: string, chainId: Hex): void {
    this.update((state) => {
      const exists = state.hiddenNfts.some(
        (n) =>
          n.address === address &&
          n.tokenId === tokenId &&
          n.chainId === chainId,
      );

      if (!exists) {
        state.hiddenNfts.push({ address, tokenId, chainId });
      }
    });

    this.messagingSystem.publish(
      'AdvancedNftController:nftHidden',
      address,
      tokenId,
      chainId,
    );
    this.hub.emit('nft-hidden', address, tokenId, chainId);
  }

  /**
   * Unhide an NFT
   */
  unhideNft(address: Hex, tokenId: string, chainId: Hex): void {
    this.update((state) => {
      state.hiddenNfts = state.hiddenNfts.filter(
        (n) =>
          !(
            n.address === address &&
            n.tokenId === tokenId &&
            n.chainId === chainId
          ),
      );
    });

    this.messagingSystem.publish(
      'AdvancedNftController:nftUnhidden',
      address,
      tokenId,
      chainId,
    );
    this.hub.emit('nft-unhidden', address, tokenId, chainId);
  }

  /**
   * Check if NFT is hidden
   */
  isHidden(address: Hex, tokenId: string, chainId: Hex): boolean {
    return this.state.hiddenNfts.some(
      (n) =>
        n.address === address && n.tokenId === tokenId && n.chainId === chainId,
    );
  }

  /**
   * Update NFT view preferences
   */
  updateViewPreferences(
    preferences: Partial<AdvancedNftState['nftViewPreferences']>,
  ): void {
    this.update((state) => {
      state.nftViewPreferences = { ...state.nftViewPreferences, ...preferences };
    });
  }

  /**
   * Get NFT view preferences
   */
  getViewPreferences(): AdvancedNftState['nftViewPreferences'] {
    return { ...this.state.nftViewPreferences };
  }
}
