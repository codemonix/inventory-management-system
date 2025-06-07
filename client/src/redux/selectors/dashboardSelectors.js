import { createSelector } from "@reduxjs/toolkit";

export const selectDashboard = (state) => state.dashboard;
export const selectDashboardItems = (state) => state.dashboard.items;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardTotalItems = (state) => state.dashboard.totalItems;
export const selectDashboardPage = (state) => state.dashboard.page;
export const selectDashboardLimit = (state) => state.dashboard.limit;
export const selectDashboardSort = (state) => state.dashboard.sort;

export const selectDashboardTotalPages = createSelector(
    [selectDashboardTotalItems, selectDashboardLimit],
    (totalItems, limit) => Math.ceil(totalItems / limit)
);