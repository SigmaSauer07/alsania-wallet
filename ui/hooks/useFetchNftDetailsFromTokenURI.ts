import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
// eslint-disable-next-line import/no-restricted-paths
import fetchWithCache from '../../shared/lib/fetch-with-cache';
import { getIpfsGateway } from '../selectors';

const useFetchNftDetailsFromTokenURI = (
  tokenURI: string | undefined | null,
) => {
  const [image, setImage] = useState<string>('');
  const [name, setName] = useState<string>('');

  const ipfsGateway = useSelector(getIpfsGateway);

  useEffect(() => {
    const fetchRemoteTokenURI = async () => {
      if (!tokenURI) {
        return;
      }

      try {
        const toHttpUrl = (uri: string) => {
          if (!uri) return uri;
          if (uri.startsWith('ipfs://')) {
            const cidAndPath = uri.replace('ipfs://', '');
            const base = ipfsGateway?.replace(/\/$/, '') || 'https://ipfs.io';
            return `${base}/ipfs/${cidAndPath}`;
          }
          return uri;
        };

        const requestUrl = toHttpUrl(tokenURI);

        // Try cached JSON request first
        try {
          const data = await fetchWithCache({
            url: requestUrl,
            cacheOptions: { cacheRefreshTime: 5 * 60 * 1000 },
            functionName: 'useFetchNftDetailsFromTokenURI',
            allowStale: true,
          });
          if (data) {
            setImage(toHttpUrl(data.image));
            setName(data.name);
            return;
          }
        } catch {
          // Fall through to manual fetch + lenient JSON parse
        }

        const response = await fetch(requestUrl);
        if (!response.ok) return;
        let rawData = await response.text();
        // Remove trailing commas before parsing
        // eslint-disable-next-line require-unicode-regexp
        rawData = rawData.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        const data = JSON.parse(rawData);
        setImage(toHttpUrl(data.image));
        setName(data.name);
      } catch {
        // ignore network/parse errors
      }
    };

    fetchRemoteTokenURI();
  }, [tokenURI, ipfsGateway]);

  return { image, name };
};

export default useFetchNftDetailsFromTokenURI;
