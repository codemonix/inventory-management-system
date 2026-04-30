import { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";

// Context and Services
import { useAuth } from "../context/AuthContext.jsx";
import { getLocations } from "../services/locationService.js"

// Custom Hooks
import { useDashboardData } from "../hooks/useDashboardData.js";
import { useStockAction } from "../hooks/useStockAction.js";

// Components
import StatusHandler from "../components/StatusHandler.jsx";
import PaginationControls from "../components/PaginationControls.jsx";
import ItemCardDashboard from "../components/ItemCardDashboard.jsx";
import DesktopInventoryTable from "../components/DesktopInventoryTable.jsx"; 
import SearchFilterBar from "../components/SearchFilterBar.jsx";
import StockActionDialog from "../components/StockActionDialog.jsx";

import { logDebug, logError, logInfo } from "../utils/logger.js";

const locationColors = {
    "Istanbul": "#BC1063",
    "RTM": "#10BC5A",
    "Dubai": "blue"
}

const DashboardPage = () => {
    logInfo("loading Dashboard Page ...")
    const { isLoggedIn } = useAuth();
    const [ locations , setLocations ] = useState([]);
    
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    
    const { 
        items, totalItems, sort, loading, error, search, page, limit, 
        updateSearchParams, refreshData, dispatch 
    } = useDashboardData();
    
    const {
        dialogOpen, currentItemId, actionType, defaultLocation, localError: stockError,
        openDialog, closeDialog, submitAction
    } = useStockAction({ onSuccess: refreshData });

    useEffect(() => {
        if (isLoggedIn) {
            getLocations()
                .then(setLocations)
                .catch((error) => logError("DashboardPage -> getLocations -> error:", error.message))
        }
    },[isLoggedIn]);

    logDebug("DashboardPage -> inventory", items);
    
    if (!isLoggedIn) {
        return <p className="text-red-500">Please log in to view the dashboard.</p>;
    }

    const handlePageChange = ( newPage ) => {
        logDebug("DashboardPage -> handlePageChange -> newPage:", newPage);
        dispatch({ type: 'dashboard/setPage', payload: newPage });
        updateSearchParams({ page: newPage });
    };

    return (
        <div className="bg-gray-400 min-h-screen p-2 md:p-6">
            {stockError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-7xl mx-auto">
                    {stockError}
                </div>
            )}
            
            <div className="max-w-7xl mx-auto">
                <SearchFilterBar 
                    search={search}
                    limit={limit}
                    page={page}
                    sort={sort}
                    onSearchChange={(newSearch) => {
                        dispatch({ type: 'dashboard/setSearch', payload: newSearch });
                        updateSearchParams({ search: newSearch, page: 1 });
                    }}
                    onLimitChange={(newLimit) => {
                        dispatch({ type: 'dashboard/setLimit', payload: newLimit });
                        updateSearchParams({ limit: newLimit, page: 1 });
                    }}
                    onSortChange={(newSort) => {
                        dispatch({ type: 'dashboard/setSort', payload: newSort });
                        updateSearchParams({ sort: newSort, page: 1 });
                    }}
                />
                
                <StatusHandler status={loading ? 'loading' : ""} error={error}>
                    <div className="mt-6">
                        {isDesktop ? (
                            <DesktopInventoryTable 
                                items={items}
                                locations={locations}
                                locationColors={locationColors}
                                onIn={(item) => openDialog(item, 'IN')}
                                onOut={(item) => openDialog(item, 'OUT')}
                                onAddToTransfer={(item) => openDialog(item, 'TRANSFER')}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {items.map((item) => (
                                    <div key={item.itemId} className="flex justify-center h-full w-full">
                                        <ItemCardDashboard 
                                            item={item} 
                                            locationColors={locationColors} 
                                            locations={locations}
                                            onIn={() => openDialog(item, 'IN')}
                                            onOut={() => openDialog(item, 'OUT')}
                                            onAddToTransfer={() => openDialog(item, 'TRANSFER')}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </StatusHandler>

                <StockActionDialog
                    open={dialogOpen}
                    onClose={closeDialog}
                    onSubmit={submitAction}
                    itemId={currentItemId}
                    locations={locations}
                    type={actionType}
                    errorMessage={stockError}
                    defaultLocation={defaultLocation}
                />
                
                <div className="mt-8 mb-6 flex justify-center">
                    <PaginationControls 
                        page={page}
                        totalCount={totalItems}
                        limit={limit}
                        onChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;