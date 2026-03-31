import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPage, setLimit, setSort, setSearch } from '../redux/slices/dashboardSlice.js';
import { getDashboardData } from "../redux/thunks/dashboardThunks.js";
import { selectDashboardPage, selectDashboardLimit } from "../redux/selectors/dashboardSelectors.js";
import { loadTempTransfer, loadTransfers } from "../redux/thunks/transferThunks.js";

export const useDashboardData = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    // Redux State Selection
    const { items, totalItems, sort, loading, error, search } = useSelector((state) => state.dashboard);
    const page = useSelector(selectDashboardPage);
    const limit = useSelector(selectDashboardLimit);
    const transferStatus = useSelector((state) => state.transfer.status);

    // Sync URL Parameters with Redux State
    useEffect(() => {
        const pageParam = parseInt(searchParams.get('page')) || 1;
        const limitParam = parseInt(searchParams.get('limit')) || 10;
        const searchParam = searchParams.get('search') || '';
        const sortParam = searchParams.get('sort') || 'name_asc';

        if (!searchParams.get('page') || !searchParams.get('limit')) {
            setSearchParams({ page: pageParam, limit: limitParam, search: searchParam, sort: sortParam }, { replace: true });
        }

        dispatch(setPage(pageParam));
        dispatch(setLimit(limitParam));
        dispatch(setSearch(searchParam));
        dispatch(setSort(sortParam));
    }, [searchParams, dispatch, setSearchParams]);

    // Fetch Dashboard Data when params change
    useEffect(() => {
        dispatch(getDashboardData({ page, limit, sort, search }));
    }, [page, limit, sort, search, dispatch]);

    // Load Transfer Data
    useEffect(() => {
        if (transferStatus === 'idle') {
            dispatch(loadTempTransfer());
            dispatch(loadTransfers());
        }
    }, [dispatch, transferStatus]);

    // Helper to update URL params
    const updateSearchParams = (newParams) => {
        setSearchParams({ page, limit, search, sort, ...newParams });
    };

    // Helper to manually refresh data (used after a successful stock action)
    const refreshData = () => {
        dispatch(getDashboardData({ page, limit, sort, search }));
    };

    return { 
        items, totalItems, sort, loading, error, search, page, limit, 
        updateSearchParams, refreshData, dispatch 
    };
};