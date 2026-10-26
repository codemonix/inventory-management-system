import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { getDashboardData } from '../redux/thunks/dashboardThunks';
import { selectDashboardLimit, selectDashboardPage } from '../redux/selectors/dashboardSelectors';
import { loadTempTransfer } from '../redux/thunks/transferThunks';
import { setLimit, setPage, setSearch, setSort } from '../redux/slices/dashboardSlice';

export const useDashboardData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isQueryRestored, setIsQueryRestored] = useState(false);

  const { items, totalItems, sort, loading, error, search } = useSelector(
    (state: RootState) => state.dashboard,
  );
  const page = useSelector(selectDashboardPage);
  const limit = useSelector(selectDashboardLimit);
  const transferStatus = useSelector((state: RootState) => state.transfer.tempTransferStatus);

  // Sync URL Parameters with Redux State
  useEffect(() => {
    const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '10', 10) || 10;
    const searchParam = searchParams.get('search') ?? '';
    const sortParam = searchParams.get('sort') ?? 'name_asc';

    if (!searchParams.get('page') || !searchParams.get('limit')) {
      setSearchParams(
        { page: String(pageParam), limit: String(limitParam), search: searchParam, sort: sortParam },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  // On first load, apply a shared/bookmarked URL to the list state before fetching.
  // Page goes last because the other setters reset it to 1.
  useEffect(() => {
    const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const pageParam = Number.parseInt(searchParams.get('page') ?? '', 10);
    if (limitParam > 0) dispatch(setLimit(limitParam));
    if (searchParam !== null) dispatch(setSearch(searchParam));
    if (sortParam) dispatch(setSort(sortParam));
    if (pageParam > 0) dispatch(setPage(pageParam));
    setIsQueryRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isQueryRestored) return;
    const request = dispatch(getDashboardData({ page, limit, sort, search }));
    // A newer query cancels the older request so a slow response cannot overwrite it
    return () => request.abort();
  }, [isQueryRestored, page, limit, sort, search, dispatch]);

  useEffect(() => {
    if (transferStatus === 'idle') {
      dispatch(loadTempTransfer());
    }
  }, [dispatch, transferStatus]);

  const updateSearchParams = (newParams: Record<string, string | number>) => {
    const merged = { page, limit, search, sort, ...newParams };
    setSearchParams(Object.fromEntries(Object.entries(merged).map(([k, v]) => [k, String(v)])));
  };

  const refreshData = () => {
    dispatch(getDashboardData({ page, limit, sort, search }));
  };

  return {
    items,
    totalItems,
    sort,
    loading,
    error,
    search,
    page,
    limit,
    updateSearchParams,
    refreshData,
    dispatch,
  };
};

