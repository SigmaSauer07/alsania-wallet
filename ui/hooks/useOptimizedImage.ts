/**
 * Optimized Image Loading Hook
 * Lazy loads images with progressive enhancement
 */

import { useState, useEffect, useRef } from 'react';
import { imageCache } from '../../app/scripts/lib/optimization/cache-manager';

interface UseOptimizedImageOptions {
  placeholder?: string;
  lazy?: boolean;
  threshold?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const useOptimizedImage = (
  src: string | undefined,
  options: UseOptimizedImageOptions = {}
) => {
  const {
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E',
    lazy = true,
    threshold = 0.1,
    onLoad,
    onError,
  } = options;

  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cached = imageCache.get(src);
    if (cached) {
      setImageSrc(cached);
      setIsLoading(false);
      onLoad?.();
      return;
    }

    const loadImage = () => {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        setError(null);
        imageCache.set(src, src);
        onLoad?.();
      };

      img.onerror = () => {
        const err = new Error(`Failed to load image: ${src}`);
        setError(err);
        setIsLoading(false);
        onError?.(err);
      };

      img.src = src;
    };

    if (lazy && 'IntersectionObserver' in window) {
      // Lazy load with Intersection Observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observerRef.current?.disconnect();
            }
          });
        },
        {
          threshold,
          rootMargin: '50px', // Start loading 50px before visible
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Load immediately if not lazy or observer not supported
      loadImage();
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, lazy, threshold, placeholder, onLoad, onError]);

  return {
    src: imageSrc,
    isLoading,
    error,
    ref: imgRef,
  };
};

/**
 * Progressive image component
 */
export const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className, placeholder }) => {
  const { src: optimizedSrc, isLoading, ref } = useOptimizedImage(src, {
    placeholder,
  });

  return (
    <img
      ref={ref}
      src={optimizedSrc}
      alt={alt}
      className={className}
      style={{
        transition: 'opacity 0.3s',
        opacity: isLoading ? 0.5 : 1,
      }}
    />
  );
};
