import { useState, useEffect, useRef, useCallback } from 'react';
import localforage from 'localforage';
import { useSelector } from 'react-redux';
import { getFormattedIpfsUrl } from '@metamask/assets-controllers';
import { getIpfsGateway } from '../selectors';

// Cache store for NFT metadata fetched via tokenURI
const nftMetadataCache = localforage.createInstance({
  name: 'alsania-wallet',
  storeName: 'nft-metadata-cache',
});

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type CachedValue = {
  value: { image?: string; name?: string };
  expiresAt: number;
};

function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

function decodeDataUrl(url: string): { image?: string; name?: string } | null {
  try {
    const [, meta, data] = url.match(/^data:([^,]*),(.*)$/) ?? [];
    if (!data) {
      return null;
    }
    const isBase64 = meta?.includes(';base64');
    const decoded = isBase64 ? atob(data) : decodeURIComponent(data);
    // Remove trailing commas to be tolerant of bad JSON
    const sanitized = decoded
      .replace(/,\s*}/g, '}')
      .replace(/,\s*\]/g, ']');
    const json = JSON.parse(sanitized);
    return { image: json.image ?? json.image_url, name: json.name };
  } catch {
    return null;
  }
}

async function toHttpUrl(tokenURI: string, ipfsGateway: string): Promise<string> {
  if (!tokenURI) {
    return tokenURI;
  }
  if (tokenURI.startsWith('ipfs://')) {
    try {
      // Prefer the shared utility which handles CID parsing quirks
      return await getFormattedIpfsUrl(ipfsGateway, tokenURI, true);
    } catch {
      // Fallback to a generic gateway pattern
      const cidPath = tokenURI.replace('ipfs://', '');
      return `https://${ipfsGateway}/ipfs/${cidPath}`;
    }
  }
  if (tokenURI.startsWith('ar://')) {
    // Basic Arweave support
    return `https://arweave.net/${tokenURI.replace('ar://', '')}`;
  }
  return tokenURI;
}

function now(): number {
  return Date.now();
}

const useFetchNftDetailsFromTokenURI = (
  tokenURI: string | undefined | null,
) => {
  const [image, setImage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const ipfsGateway = useSelector(getIpfsGateway);
  const abortRef = useRef<AbortController | null>(null);

  const readCache = useCallback(async (key: string) => {
    try {
      const cached = (await nftMetadataCache.getItem<CachedValue>(key)) ?? null;
      if (cached && cached.expiresAt > now()) {
        return cached.value;
      }
      if (cached) {
        await nftMetadataCache.removeItem(key);
      }
    } catch {
      // ignore cache failures
    }
    return null;
  }, []);

  const writeCache = useCallback(async (key: string, value: CachedValue) => {
    try {
      await nftMetadataCache.setItem(key, value);
    } catch {
      // ignore cache failures
    }
  }, []);

  useEffect(() => {
    if (!tokenURI) {
      setImage('');
      setName('');
      return () => undefined;
    }

    // Abort any in-flight request on param change
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      // Handle data: URLs synchronously
      if (isDataUrl(tokenURI)) {
        const decoded = decodeDataUrl(tokenURI);
        if (decoded) {
          setImage(decoded.image ?? '');
          setName(decoded.name ?? '');
        }
        return;
      }

      const cacheKey = `v1:${tokenURI}`;
      const cached = await readCache(cacheKey);
      if (cached) {
        setImage(cached.image ?? '');
        setName(cached.name ?? '');
      }

      try {
        const httpUrl = await toHttpUrl(tokenURI, ipfsGateway);
        // 10s timeout to avoid hanging
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const resp = await fetch(httpUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!resp.ok) {
          return;
        }
        let raw = await resp.text();
        // Remove trailing commas before parsing
        // eslint-disable-next-line require-unicode-regexp
        raw = raw.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        const data = JSON.parse(raw);

        const next = {
          image: data.image ?? data.image_url ?? '',
          name: data.name ?? '',
        };
        setImage(next.image);
        setName(next.name);
        // Cache for one day
        await writeCache(cacheKey, {
          value: next,
          expiresAt: now() + ONE_DAY_MS,
        });
      } catch {
        // ignore fetch/parse errors
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [tokenURI, ipfsGateway, readCache, writeCache]);

  return { image, name };
};

export default useFetchNftDetailsFromTokenURI;
