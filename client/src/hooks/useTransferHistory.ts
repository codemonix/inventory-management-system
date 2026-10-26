import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelTransfer, confirmTransfer, getTransferHistory } from '../services/transferService';
import { ITransfer, TransferHistoryFilters } from '../types/transfer.types';
import { logError } from '../utils/logger';

const PAGE_SIZE = 20;

export interface UseTransferHistoryReturn {
  transfers: ITransfer[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;       // first page for the current filters
  isLoadingMore: boolean;   // a following page
  error: string | null;
  loadMore: () => void;
  reload: () => void;
  confirm: (transferId: string) => Promise<void>;
  cancel: (transferId: string) => Promise<void>;   // admin only
}

// Transfer history loaded page by page from the server. Changing the filters starts over at page 1;
// requests made for outdated filters are cancelled so their results never overwrite newer ones.
export const useTransferHistory = (filters: TransferHistoryFilters): UseTransferHistoryReturn => {
  const [transfers, setTransfers] = useState<ITransfer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const controllerRef = useRef<AbortController | null>(null);
  const filtersKey = JSON.stringify(filters);

  const fetchPage = useCallback(async (pageToLoad: number) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const isFirstPage = pageToLoad === 1;
    if (isFirstPage) setIsLoading(true); else setIsLoadingMore(true);
    setError(null);

    try {
      const result = await getTransferHistory(JSON.parse(filtersKey), pageToLoad, PAGE_SIZE, controller.signal);
      if (controller.signal.aborted) return;
      setTransfers((prev) => {
        if (isFirstPage) return result.transfers;
        // Skip rows already shown (new transfers can shift page boundaries)
        const seen = new Set(prev.map((t) => t._id));
        return [...prev, ...result.transfers.filter((t) => !seen.has(t._id))];
      });
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(pageToLoad);
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Failed to load transfers.';
      logError('useTransferHistory -> fetchPage failed', message);
      setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [filtersKey]);

  // New filters (or an explicit reload) start from the first page
  useEffect(() => {
    void fetchPage(1);
    return () => controllerRef.current?.abort();
  }, [fetchPage, reloadKey]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore || error) return;
    void fetchPage(page + 1);
  }, [hasMore, isLoading, isLoadingMore, error, page, fetchPage]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Confirms one transfer and updates its row in place, keeping the loaded pages
  const confirm = useCallback(async (transferId: string) => {
    const { transfer } = await confirmTransfer(transferId);
    setTransfers((prev) => prev.map((t) => (t._id === transferId
      ? { ...t, status: transfer.status, confirmedAt: transfer.confirmedAt }
      : t)));
  }, []);

  // Cancels one in-transit transfer and updates its row in place
  const cancel = useCallback(async (transferId: string) => {
    const { transfer } = await cancelTransfer(transferId);
    setTransfers((prev) => prev.map((t) => (t._id === transferId
      ? { ...t, status: transfer.status, cancelledAt: transfer.cancelledAt }
      : t)));
  }, []);

  return { transfers, total, hasMore, isLoading, isLoadingMore, error, loadMore, reload, confirm, cancel };
};
