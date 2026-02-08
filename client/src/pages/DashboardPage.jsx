import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    setPage,
    setLimit,
    setSort,
    setSearch
} from '../redux/slices/dashboardSlice.js';
import { selectDashboardPage, selectDashboardLimit } from "../redux/selectors/dashboardSelectors.js";
import { getDashboardData } from "../redux/thunks/dashboardThunks.js";
import StatusHandler from "../components/StatusHandler.jsx";
import PaginationControls from "../components/PaginationControls.jsx";
import { stockIn, stockOut } from "../services/inventoryServices.js";
import ItemCardDashboard from "../components/ItemCardDashboard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getLocations } from "../services/locationsService.js"
import StockActionDialog from "../components/stockActionDialog.jsx";
import  { useDispatch, useSelector }  from "react-redux";
import { addItem, loadTempTransfer, loadTransfers } from "../redux/slices/transferSlice.js";
import { logDebug, logInfo } from "../utils/logger.js";
import SearchFilterBar from "../components/SearchFilterBar.jsx";


const locationColors = {
    "Istanbul": "#BC1063",
    "RTM": "#10BC5A",
    "Dubai": "blue"
}


const DashboardPage = () => {
    const { isLoggedIn } = useAuth();
    const [ localError, setLocalError ] = useState("");
    const [ locations , setLocations ] = useState([]);
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ currentItemId, setCurrentItemId ] = useState(null);
    const [ actionType, setActionType ] = useState('IN');
    const [ triggerUpdate, setTriggerUpdate ] = useState(0);
    const [ defaultLocation, setDefaultLocation] = useState(null);
    const tempTransfer = useSelector((state) => state.transfer.tempTransfer);
    const transferStatus = useSelector((state) => state.transfer.status);

    const dispatch = useDispatch();
    const { items, totalItems, sort, loading, error, search } = useSelector(( state ) => state.dashboard);
    const page = useSelector(selectDashboardPage);
    const limit = useSelector(selectDashboardLimit);

    const [ searchParams, setSearchParams ] = useSearchParams();
    useEffect(() => {
        const pageParam = parseInt(searchParams.get('page')) || 1;
        const limitParam = parseInt(searchParams.get('limit')) || 10;
        const searchParam = searchParams.get('search') || '';
        const sortParam = searchParams.get('sort') || 'name_asc';

        dispatch(setPage(pageParam));
        dispatch(setLimit(limitParam));
        dispatch(setSearch(searchParam));
        dispatch(setSort(sortParam));
    }, [searchParams, dispatch]);

    useEffect(() => {
        if (isLoggedIn) {
            getLocations().then(setLocations).catch((error) => {
                console.error("Error getting locations:", error.message);
            })
        }}
    , [isLoggedIn]);

    useEffect(() => {
        dispatch(getDashboardData({ page, limit, sort, search }))
    },[ page, limit, sort, dispatch, search, triggerUpdate ]);

    useEffect(() => {
        if (!searchParams.get('page') || !searchParams.get('limit')) {
            setSearchParams({ page: 1, limit: 10 });
        }
    })

    useEffect(() => {
        if (transferStatus === 'idle') {
            dispatch(loadTempTransfer());
            dispatch(loadTransfers())
        }
    }, [dispatch, transferStatus]);

    logInfo("state tempTransfer:", tempTransfer);

    logDebug("inventory", items);
    
    if (!isLoggedIn) {
        return <p className="text-red-500">Please log in to view the dashboard.</p>;
    }

    const updateSearchParams = (newParams) => {
        setSearchParams({
            page,
            limit,
            search,
            sort,
            ...newParams
        });
    };


    const handleClick = ( item, type ) => {
        logInfo("handleClick -> item:", item)
        setCurrentItemId(item.itemId);
        setActionType(type);
        setDialogOpen(true);
        logInfo("tempT:", tempTransfer)
        if (type === 'TRANSFER') setDefaultLocation(tempTransfer.fromLocation)
    };

    const handlePageChange = ( newPage ) => {
        const params = Object.fromEntries(searchParams.entries());
        setSearchParams({
            ...params,
            page: newPage
        });
    };

    const handleSubmitDashbord = async ({ locationId, quantity }) => {
        logDebug("DashbordPage -> handleSubDash:", currentItemId, locationId, quantity)
        logDebug("tempTransfer: ", tempTransfer)
        if (actionType === 'IN') {
            await stockIn (currentItemId, locationId, quantity );
            setTriggerUpdate((prev) => prev + 1 );
        } else if (actionType === 'OUT') {
            await stockOut (currentItemId, locationId, quantity );
            setTriggerUpdate((prev) => prev + 1 );
        } else if (actionType === 'TRANSFER') {
            setDefaultLocation(tempTransfer.fromLocation)
            console.log("handleAddToTransferClick: ", currentItemId);


            
            if (tempTransfer.fromLocation !== locationId) {
                setLocalError("Location mismatch!")
                return;
            } else {
                // locationId is source location id to check in the backend
                handleAddItemToTempTransfer(currentItemId, quantity, locationId);
                logInfo("itemId:", currentItemId);
            }
            
            setTriggerUpdate((prev) => prev + 1 );
        }
    };

    const handleClose = () => {
        setDialogOpen(false);
        setLocalError("");
        setCurrentItemId(null);

    };

    const handleAddItemToTempTransfer = (itemId, quantity, sourceLocationId) => {
        logDebug("DashboardPage -> handleAddItemToTempTransfer:", itemId, quantity);
        dispatch(addItem({ itemId, quantity, sourceLocationId }));
    }



    return (
        <div className="bg-gray-400 ">
            {localError && <p className="text-red-500">{localError}</p>}
            <StatusHandler status={loading ? 'loading' : ""} error={error}>
                <SearchFilterBar 
                    search={search}
                    limit={limit}
                    page={page}
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
                <div className="flex flex-wrap justify-center">
                    {items.map((item) => (
                        <ItemCardDashboard 
                            key={item.itemId} 
                            item={item} 
                            locationColors={locationColors} 
                            locations={locations}
                            onIn={() => handleClick(item, 'IN')}
                            onOut={() => handleClick(item, 'OUT')}
                            onAddToTransfer={() => handleClick(item, 'TRANSFER')}
                            />
                    ))}
                    <StockActionDialog
                        open={dialogOpen}
                        onClose={handleClose}
                        onSubmit={handleSubmitDashbord}
                        itemId={currentItemId}
                        locations={locations}
                        type={actionType}
                        errorMessage={error}
                        defaultLocation={defaultLocation}
                    />
                </div>
                <PaginationControls 
                    page={page}
                    totalCount={totalItems}
                    limit={limit}
                    onChange={handlePageChange}
                />
            </StatusHandler>
        </div>
    );
};

export default DashboardPage;