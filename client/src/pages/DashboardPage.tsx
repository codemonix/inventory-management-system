import { useTheme, useMediaQuery, Box, Container, Typography } from "@mui/material";

// Context and Services
import { useAuth } from "../context/AuthContext";

// Custom Hooks
import { useDashboardData } from "../hooks/useDashboardData";
import { useStockAction } from "../hooks/useStockAction";

// Components
import StatusHandler from "../components/StatusHandler";
import PaginationControls from "../components/PaginationControls";
import ItemCardDashboard from "../components/ItemCardDashboard";
import DesktopInventoryTable from "../components/DesktopInventoryTable"; 
import SearchFilterBar from "../components/SearchFilterBar";
import StockActionDialog from "../components/StockActionDialog";

import { logDebug, logInfo } from "../utils/logger";
import { setLimit, setPage, setSearch, setSort } from "../redux/slices/dashboardSlice";
import { IInventoryRecord } from "../types/inventory.types";
import { useLocations } from "../hooks/useLocations";

const DashboardPage = () => {
    logInfo("loading Dashboard Page ...")
    const { isLoggedIn } = useAuth();
    const { locations } = useLocations();
    
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    
    const { 
        items, totalItems, sort, loading, error, search, page, limit, 
        updateSearchParams, refreshData, dispatch 
    } = useDashboardData();
    
    const {
        dialogOpen, actionType, defaultLocation, localError: stockError,
        openDialog, closeDialog, submitAction
    } = useStockAction({ onSuccess: refreshData });

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

    // The stock dialog works with item ids
    const openFor = (item: IInventoryRecord, type: 'IN' | 'OUT' | 'TRANSFER') => openDialog({ itemId: item.itemId }, type);

    const handlePageChange = ( newPage: number ) => {
        logDebug("DashboardPage -> handlePageChange -> newPage:", newPage);
        dispatch(setPage(newPage));
        updateSearchParams({ page: newPage });
    };

    return (
        <Box sx={{ pt: { xs: 0.5, md: 1 }, pb: { xs: 2, md: 3 }, px: { xs: 1, md: 2 } }}>
            {/* Stock action errors are shown inside StockActionDialog */}
            <Container maxWidth="xl" disableGutters sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <SearchFilterBar 
                    search={search}
                    limit={limit}
                    sort={sort}
                    onSearchChange={(newSearch) => {
                        dispatch(setSearch(newSearch));
                        updateSearchParams({ search: newSearch, page: 1 });
                    }}
                    onLimitChange={(newLimit) => {
                        dispatch(setLimit(newLimit));
                        updateSearchParams({ limit: newLimit, page: 1 });
                    }}
                    onSortChange={(newSort) => {
                        dispatch(setSort(newSort));
                        updateSearchParams({ sort: newSort, page: 1 });
                    }}
                />
                
                <StatusHandler status={loading ? 'loading' : error ? 'failed' : 'succeeded'} error={error} keepContentWhileLoading={items.length > 0}>
                    <Box>
                        {isDesktop ? (
                            <DesktopInventoryTable 
                                items={items}
                                locations={locations}
                                onIn={(item) => openFor(item, 'IN')}
                                onOut={(item) => openFor(item, 'OUT')}
                                onAddToTransfer={(item) => openFor(item, 'TRANSFER')}
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
                                            locations={locations}
                                            onIn={() => openFor(item, 'IN')}
                                            onOut={() => openFor(item, 'OUT')}
                                            onAddToTransfer={() => openFor(item, 'TRANSFER')}
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