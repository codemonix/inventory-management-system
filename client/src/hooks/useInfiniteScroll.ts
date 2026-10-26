import { useEffect, useRef } from 'react';

interface InfiniteScrollOptions {
  enabled: boolean;
  // Re-attach after each load (e.g. the row count): a fresh observer fires right away when the
  // sentinel is still visible, so short pages keep loading until the screen is filled.
  watch?: unknown;
  rootMargin?: string;
}

// Calls onLoadMore when the returned sentinel element scrolls into view.
// Place the sentinel after the last row of a list.
export const useInfiniteScroll = <T extends Element>(
  onLoadMore: () => void,
  { enabled, watch, rootMargin = '200px' }: InfiniteScrollOptions,
) => {
  const sentinelRef = useRef<T | null>(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  });

  useEffect(() => {
    const node = sentinelRef.current;
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callbackRef.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, watch, rootMargin]);

  return sentinelRef;
};
