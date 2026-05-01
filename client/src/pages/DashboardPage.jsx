import { useEffect, useState } from "react";
import { useTheme, useMediaQuery, Box, Container, Alert, Typography } from "@mui/material";

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
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error" fontWeight="bold">
                    Please log in to view the dashboard.
                </Typography>
            </Box>
        );
    }

    const handlePageChange = ( newPage ) => {
        logDebug("DashboardPage -> handlePageChange -> newPage:", newPage);
        dispatch({ type: 'dashboard/setPage', payload: newPage });
        updateSearchParams({ page: newPage });
    };

    return (
        // 👇 1. Tightened outer padding (px is now 8px on mobile, 16px on desktop)
        <Box sx={{ pt: { xs: 0.5, md: 1 }, pb: { xs: 2, md: 3 }, px: { xs: 1, md: 2 } }}>
            {stockError && (
                // 👇 2. Added disableGutters to stop the double-padding
                <Container maxWidth="xl" disableGutters sx={{ mb: 2 }}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {stockError}
                    </Alert>
                </Container>
            )}
            
            {/* 👇 3. Added disableGutters here as well */}
            <Container maxWidth="xl" disableGutters sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                    <Box>
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
                            <Box 
                                sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                                    gap: 2 
                                }}
                            >
                                {items.map((item) => (
                                    <Box key={item.itemId} sx={{ display: 'flex', justifyContent: 'center', height: '100%', width: '100%' }}>
                                        <ItemCardDashboard 
                                            item={item} 
                                            locationColors={locationColors} 
                                            locations={locations}
                                            onIn={() => openDialog(item, 'IN')}
                                            onOut={() => openDialog(item, 'OUT')}
                                            onAddToTransfer={() => openDialog(item, 'TRANSFER')}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
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
                
                <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <PaginationControls 
                        page={page}
                        totalCount={totalItems}
                        limit={limit}
                        onChange={handlePageChange}
                    />
                </Box>
            </Container>
        </Box>
    );
};

export default DashboardPage;