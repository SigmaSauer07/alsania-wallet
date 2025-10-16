/**
 * NFT Gallery View Component
 * Beautiful, responsive gallery for displaying NFT collections
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, Button, Icon, IconName } from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { NftItem } from '../../multichain/nft-item';

interface NFT {
  address: string;
  tokenId: string;
  chainId: string;
  name?: string;
  image?: string;
  collection?: {
    name?: string;
  };
}

interface NFTGalleryViewProps {
  nfts: NFT[];
  gridSize?: 'small' | 'medium' | 'large';
  sortBy?: 'date' | 'name' | 'collection';
  onNftClick?: (nft: NFT) => void;
  onGridSizeChange?: (size: 'small' | 'medium' | 'large') => void;
  onSortChange?: (sort: 'date' | 'name' | 'collection') => void;
  showFilters?: boolean;
  isLoading?: boolean;
}

export const NFTGalleryView: React.FC<NFTGalleryViewProps> = ({
  nfts,
  gridSize = 'medium',
  sortBy = 'date',
  onNftClick,
  onGridSizeChange,
  onSortChange,
  showFilters = true,
  isLoading = false,
}) => {
  const t = useI18nContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Get unique collections
  const collections = useMemo(() => {
    const collectionSet = new Set<string>();
    nfts.forEach((nft) => {
      if (nft.collection?.name) {
        collectionSet.add(nft.collection.name);
      }
    });
    return Array.from(collectionSet).sort();
  }, [nfts]);

  // Filter and sort NFTs
  const displayedNfts = useMemo(() => {
    let filtered = [...nfts];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (nft) =>
          nft.name?.toLowerCase().includes(query) ||
          nft.collection?.name?.toLowerCase().includes(query) ||
          nft.tokenId.includes(query)
      );
    }

    // Filter by collection
    if (selectedCollection) {
      filtered = filtered.filter(
        (nft) => nft.collection?.name === selectedCollection
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'collection':
          return (a.collection?.name || '').localeCompare(b.collection?.name || '');
        case 'date':
        default:
          return 0; // Keep original order for date
      }
    });

    return filtered;
  }, [nfts, searchQuery, selectedCollection, sortBy]);

  const gridColumns = {
    small: 6,
    medium: 4,
    large: 3,
  };

  const handleNftClick = useCallback(
    (nft: NFT) => {
      if (onNftClick) {
        onNftClick(nft);
      }
    },
    [onNftClick]
  );

  if (isLoading) {
    return (
      <Box className="nft-gallery-loading" padding={8} textAlign="center">
        <Box className="loading-spinner" marginBottom={4} />
        <Text variant="bodyMd" color="text-alternative">
          {t('loadingNFTs')}
        </Text>
      </Box>
    );
  }

  return (
    <Box className="nft-gallery-view">
      {/* Header & Filters */}
      {showFilters && (
        <Box className="nft-gallery-header" marginBottom={4}>
          {/* Search & Grid Controls */}
          <Box display="flex" gap={2} marginBottom={3}>
            <Box flex={1}>
              <input
                type="text"
                className="nft-search-input"
                placeholder={t('searchNFTs')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-default)',
                  fontSize: '14px',
                }}
              />
            </Box>

            {/* Grid Size Controls */}
            <Box display="flex" gap={1} borderRadius="md" padding={1} backgroundColor="background-alternative">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={gridSize === size ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onGridSizeChange?.(size)}
                  style={{ minWidth: '40px' }}
                >
                  <Icon
                    name={
                      size === 'small'
                        ? IconName.Category
                        : size === 'medium'
                        ? IconName.Dashboard
                        : IconName.Square
                    }
                  />
                </Button>
              ))}
            </Box>
          </Box>

          {/* Collection Filter & Sort */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box>
              <select
                value={selectedCollection || ''}
                onChange={(e) => setSelectedCollection(e.target.value || null)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-background-default)',
                  fontSize: '14px',
                }}
              >
                <option value="">{t('allCollections')}</option>
                {collections.map((collection) => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </select>
            </Box>

            <Box>
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-background-default)',
                  fontSize: '14px',
                }}
              >
                <option value="date">{t('sortByDate')}</option>
                <option value="name">{t('sortByName')}</option>
                <option value="collection">{t('sortByCollection')}</option>
              </select>
            </Box>

            {/* Results Count */}
            <Box flex={1} display="flex" alignItems="center" justifyContent="flex-end">
              <Text variant="bodySm" color="text-alternative">
                {displayedNfts.length} {t('nfts')}
              </Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* Gallery Grid */}
      {displayedNfts.length === 0 ? (
        <Box
          className="nft-gallery-empty"
          padding={8}
          borderRadius="lg"
          backgroundColor="background-alternative"
          textAlign="center"
        >
          <Icon name={IconName.Nft} size="xl" color="icon-muted" marginBottom={3} />
          <Text variant="headingSm" marginBottom={2}>
            {searchQuery || selectedCollection
              ? t('noNFTsFound')
              : t('noNFTsYet')}
          </Text>
          <Text variant="bodySm" color="text-alternative">
            {searchQuery || selectedCollection
              ? t('tryDifferentSearch')
              : t('nftsWillAppearHere')}
          </Text>
        </Box>
      ) : (
        <Box
          className="nft-gallery-grid"
          display="grid"
          gap={3}
          style={{
            gridTemplateColumns: `repeat(${gridColumns[gridSize]}, 1fr)`,
          }}
        >
          {displayedNfts.map((nft) => (
            <Box
              key={`${nft.chainId}-${nft.address}-${nft.tokenId}`}
              className="nft-gallery-item"
              onClick={() => handleNftClick(nft)}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <NftItem
                src={nft.image}
                alt={nft.name || `NFT #${nft.tokenId}`}
                name={nft.name}
                tokenId={nft.tokenId}
                collectionName={nft.collection?.name}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
