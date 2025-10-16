/**
 * Advanced NFT Controller Tests
 */

import { AdvancedNftController } from '../../app/scripts/controllers/advanced-nft-controller';
import type { Hex } from '@metamask/utils';

describe('AdvancedNftController', () => {
  let controller: AdvancedNftController;
  let messenger: any;

  beforeEach(() => {
    messenger = {
      publish: jest.fn(),
      call: jest.fn(),
    };
    
    controller = new AdvancedNftController({
      messenger,
      state: {},
    });
  });

  describe('Metadata Caching', () => {
    it('should cache NFT metadata', () => {
      const address = '0x1234567890123456789012345678901234567890' as Hex;
      const tokenId = '1';
      const chainId = '0x1' as Hex;
      const metadata = {
        name: 'Test NFT',
        description: 'A test NFT',
        image: 'ipfs://test',
      };

      controller.cacheNftMetadata(address, tokenId, chainId, metadata);

      const cached = controller.getCachedMetadata(address, tokenId, chainId);
      expect(cached).toEqual(metadata);
    });

    it('should return null for expired cache', () => {
      const address = '0x1234567890123456789012345678901234567890' as Hex;
      const tokenId = '1';
      const chainId = '0x1' as Hex;
      const metadata = {
        name: 'Test NFT',
      };

      // Manually set expired cache
      const cacheKey = `${chainId}:${address}:${tokenId}`;
      controller.state.metadataCache[cacheKey] = {
        metadata,
        cachedAt: Date.now() - 48 * 60 * 60 * 1000,
        expiresAt: Date.now() - 24 * 60 * 60 * 1000,
      };

      const cached = controller.getCachedMetadata(address, tokenId, chainId);
      expect(cached).toBeNull();
    });

    it('should clean expired cache entries', () => {
      const address = '0x1234567890123456789012345678901234567890' as Hex;
      const tokenId = '1';
      const chainId = '0x1' as Hex;
      
      // Add expired entry
      const cacheKey = `${chainId}:${address}:${tokenId}`;
      controller.state.metadataCache[cacheKey] = {
        metadata: { name: 'Test' },
        cachedAt: Date.now() - 48 * 60 * 60 * 1000,
        expiresAt: Date.now() - 1000,
      };

      controller.cleanExpiredCache();
      expect(controller.state.metadataCache[cacheKey]).toBeUndefined();
    });
  });

  describe('IPFS Resolution', () => {
    it('should resolve IPFS URL', async () => {
      const ipfsUrl = 'ipfs://QmTest123';
      const resolved = await controller.resolveIPFSUrl(ipfsUrl);
      
      expect(resolved).toContain('QmTest123');
      expect(resolved).toMatch(/^https?:\/\//);
    });

    it('should update IPFS config', () => {
      const newConfig = {
        primary: 'https://custom-gateway.com',
        timeout: 5000,
      };

      controller.updateIPFSConfig(newConfig);

      expect(controller.state.ipfsConfig.primary).toBe(newConfig.primary);
      expect(controller.state.ipfsConfig.timeout).toBe(newConfig.timeout);
    });
  });

  describe('Galleries', () => {
    it('should create a gallery', () => {
      const gallery = controller.createGallery({
        name: 'My Collection',
        description: 'Test gallery',
        nfts: [],
        isPublic: true,
      });

      expect(gallery.id).toBeDefined();
      expect(gallery.name).toBe('My Collection');
      expect(gallery.createdAt).toBeDefined();
      expect(gallery.updatedAt).toBeDefined();

      const retrieved = controller.getGallery(gallery.id);
      expect(retrieved).toEqual(gallery);
    });

    it('should update a gallery', () => {
      const gallery = controller.createGallery({
        name: 'Original Name',
        nfts: [],
        isPublic: false,
      });

      controller.updateGallery(gallery.id, {
        name: 'Updated Name',
        description: 'New description',
      });

      const updated = controller.getGallery(gallery.id);
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('New description');
      expect(updated?.isPublic).toBe(false);
    });

    it('should delete a gallery', () => {
      const gallery = controller.createGallery({
        name: 'Temporary',
        nfts: [],
        isPublic: false,
      });

      controller.deleteGallery(gallery.id);

      const retrieved = controller.getGallery(gallery.id);
      expect(retrieved).toBeUndefined();
    });

    it('should add NFT to gallery', () => {
      const gallery = controller.createGallery({
        name: 'Test',
        nfts: [],
        isPublic: false,
      });

      const nft = {
        address: '0x1234567890123456789012345678901234567890' as Hex,
        tokenId: '1',
        chainId: '0x1' as Hex,
      };

      controller.addNftToGallery(gallery.id, nft);

      const updated = controller.getGallery(gallery.id);
      expect(updated?.nfts).toHaveLength(1);
      expect(updated?.nfts[0]).toEqual(nft);
    });

    it('should not add duplicate NFT to gallery', () => {
      const gallery = controller.createGallery({
        name: 'Test',
        nfts: [],
        isPublic: false,
      });

      const nft = {
        address: '0x1234567890123456789012345678901234567890' as Hex,
        tokenId: '1',
        chainId: '0x1' as Hex,
      };

      controller.addNftToGallery(gallery.id, nft);
      controller.addNftToGallery(gallery.id, nft);

      const updated = controller.getGallery(gallery.id);
      expect(updated?.nfts).toHaveLength(1);
    });

    it('should remove NFT from gallery', () => {
      const gallery = controller.createGallery({
        name: 'Test',
        nfts: [],
        isPublic: false,
      });

      const nft = {
        address: '0x1234567890123456789012345678901234567890' as Hex,
        tokenId: '1',
        chainId: '0x1' as Hex,
      };

      controller.addNftToGallery(gallery.id, nft);
      controller.removeNftFromGallery(gallery.id, nft.address, nft.tokenId, nft.chainId);

      const updated = controller.getGallery(gallery.id);
      expect(updated?.nfts).toHaveLength(0);
    });
  });

  describe('Favorites', () => {
    it('should favorite an NFT', () => {
      const address = '0x1234567890123456789012345678901234567890' as Hex;
      const tokenId = '1';
      const chainId = '0x1' as Hex;

      controller.favoriteNft(address, tokenId, chainId);

      expect(controller.isFavorite(address, tokenId, chainId)).toBe(true);
    });

    it('should unfavorite an NFT', () => {
      const address = '0x1234567890123456789012345678901234567890' as Hex;
      const tokenId = '1';
      const chainId = '0x1' as Hex;

      controller.favoriteNft(address, tokenId, chainId);
      expect(controller.isFavorite(address, tokenId, chainId)).toBe(true);

      controller.unfavoriteNft(address, tokenId, chainId);
      expect(controller.isFavorite(address, tokenId, chainId)).toBe(false);
    });
  });

  describe('Hidden NFTs', () => {
    it('should hide an NFT', () => {
      const address = '0x1234567890123456789012345678901234567890' as Hex;
      const tokenId = '1';
      const chainId = '0x1' as Hex;

      controller.hideNft(address, tokenId, chainId);

      expect(controller.isHidden(address, tokenId, chainId)).toBe(true);
    });

    it('should unhide an NFT', () => {
      const address = '0x1234567890123456789012345678901234567890' as Hex;
      const tokenId = '1';
      const chainId = '0x1' as Hex;

      controller.hideNft(address, tokenId, chainId);
      expect(controller.isHidden(address, tokenId, chainId)).toBe(true);

      controller.unhideNft(address, tokenId, chainId);
      expect(controller.isHidden(address, tokenId, chainId)).toBe(false);
    });
  });

  describe('View Preferences', () => {
    it('should update view preferences', () => {
      controller.updateViewPreferences({
        gridSize: 'large',
        sortBy: 'value',
      });

      const prefs = controller.getViewPreferences();
      expect(prefs.gridSize).toBe('large');
      expect(prefs.sortBy).toBe('value');
    });

    it('should maintain unchanged preferences', () => {
      controller.updateViewPreferences({
        gridSize: 'small',
      });

      const prefs = controller.getViewPreferences();
      expect(prefs.gridSize).toBe('small');
      expect(prefs.sortBy).toBe('date'); // default
    });
  });
});
