import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export const selectDashboard = (state: RootState) => state.dashboard;
export const selectDashboardItems = (state: RootState) => state.dashboard.items;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectDashboardTotalItems = (state: RootState) => state.dashboard.totalItems;
export const selectDashboardPage = (state: RootState) => state.dashboard.page;
export const selectDashboardLimit = (state: RootState) => state.dashboard.limit;
export const selectDashboardSort = (state: RootState) => state.dashboard.sort;

export const selectDashboardTotalPages = createSelector(
  [selectDashboardTotalItems, selectDashboardLimit],
  (totalItems, limit) => Math.ceil(totalItems / limit),
);

