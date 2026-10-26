import { useEffect, useState } from 'react';
import { logWarning } from '../utils/logger';

type FetchFunction = (path: string) => Promise<string>;

// Blob URLs by image path. Uploaded images get a unique filename, so a path never changes content
// and can be reused by every card/row (and after remounts) instead of being downloaded again.
const MAX_CACHED_IMAGES = 300;
const blobCache = new Map<string, Promise<string>>();

const loadCachedBlob = (path: string, fetchFunction: FetchFunction): Promise<string> => {
  const cached = blobCache.get(path);
  if (cached) return cached;

  const request = fetchFunction(path).catch((error: unknown) => {
    blobCache.delete(path); // let a later render retry
    throw error;
  });
  blobCache.set(path, request);

  // Map keeps insertion order: drop the oldest entry once the cache is full
  if (blobCache.size > MAX_CACHED_IMAGES) {
    const [oldestPath, oldestRequest] = blobCache.entries().next().value as [string, Promise<string>];
    blobCache.delete(oldestPath);
    oldestRequest.then((url) => URL.revokeObjectURL(url)).catch(() => {});
  }
  return request;
};

export const useManagedImage = (
  imagePath: string | null | undefined,
  fetchFunction: FetchFunction,
  fallBackUrl: string,
) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadImages = async () => {
      setIsImageLoading(true);

      if (imagePath && imagePath !== fallBackUrl) {
        try {
          const blobUrl = await loadCachedBlob(imagePath, fetchFunction);
          if (cancelled) return;
          setDisplayUrl(blobUrl);
          setPreviewUrl(null);
          setIsImageLoading(false);
          return;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          logWarning('Fail to load image for path:', imagePath);
          logWarning('Image load failed:', message);
          logWarning('falling back to default image');
        }
      }

      let defaultUrl = fallBackUrl;
      try {
        defaultUrl = await loadCachedBlob(fallBackUrl, fetchFunction);
      } catch {
        logWarning('Failed to load default image, using its path');
      }
      if (cancelled) return;
      setDisplayUrl(defaultUrl);
      setIsImageLoading(false);
    };

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [imagePath, fallBackUrl, fetchFunction]);

  const setLocalPreview = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const newBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(newBlobUrl);
  };

  const clearLocalPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return { displayUrl: previewUrl || displayUrl, setLocalPreview, clearLocalPreview, isImageLoading };
};
