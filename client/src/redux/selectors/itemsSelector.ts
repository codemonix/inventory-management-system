import type { RootState } from '../store';

export const selectItemsList = (state: RootState) => state.items.list;
export const selectItemsStatus = (state: RootState) => state.items.status;
export const selectItemsError = (state: RootState) => state.items.error;
export const selectItemsPage = (state: RootState) => state.items.page;
export const selectItemsLimit = (state: RootState) => state.items.limit;
export const selectItemsTotalCount = (state: RootState) => state.items.totalCount;
export const selectItemsSearch = (state: RootState) => state.items.search;
export const selectItemsSort = (state: RootState) => state.items.sort;

