import { useEffect, useState } from "react";

import {
    setPage,
    // setLimit,
    // setSort
} from '../redux/slices/dashboardSlice.js';
import { getDashboardData } from "../redux/thunks/dashboardThunks.js";
import StatusHandler from "../components/StatusHandler.jsx";
import PaginationControls from "../components/PaginationControls.jsx";
import { stockIn, stockOut } from "../services/inventoryServices.js";
import ItemCardDashboard from "../components/ItemCardDashboard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getLocations } from "../services/locationsService.js"
import StockActionDialog from "../components/stockActionDialog.jsx";
import  { useDispatch, useSelector }  from "react-redux";
import { addItem } from "../redux/slices/transferSlice.js";
import { logDebug, logInfo } from "../utils/logger.js";
import { loadTempTransfer, loadTransfers } from "../redux/slices/transferSlice.js";


const locationColors = {
    "Istanbul": "#BC1063",
    "Mashhad": "#10BC5A",
    "Kargo": "blue"
}


const DashboardPage = () => {
    const { isLoggedIn } = useAuth();
    // const [ items, setItems ] = useState([]);
    const [ localError, setLocalError ] = useState("");
    const [ locations , setLocations ] = useState([]);
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ currentItemId, setCurrentItemId ] = useState(null);
    const [ actionType, setActionType ] = useState('IN');
    const [ triggerUpdate, setTriggerUpdate ] = useState(0);
    const [ defaultLocation, setDefaultLocation] = useState(null);
    const tempTransfer = useSelector((state) => state.transfer.tempTransfer)
    // const {items, status} = useSelector(( state ) => state.items )
    const transferStatus = useSelector((state) => state.transfer.status)


    const dispatch = useDispatch();
    const { items, totalItems, page, limit, sort, loading, error } = useSelector(( state ) => state.dashboard);

    useEffect(() => {
        dispatch(getDashboardData({ page, limit, sort }))
    },[ page, limit, sort, dispatch, triggerUpdate ]);

    // const totalPages = Math.ceil(totalItems / limit);

    useEffect(() => {
        // logDebug("tempTransfer Updated:", tempTransfer)
        if (isLoggedIn) {
            getLocations().then(setLocations).catch((error) => {
                console.error("Error getting locations:", error.message);
            })
        }}
    , [isLoggedIn]);

    useEffect(() => {
        if (transferStatus === 'idle') {
            dispatch(loadTempTransfer());
            dispatch(loadTransfers())
        }
    }, [dispatch, transferStatus]);

    logInfo("state tempTransfer:", tempTransfer);

    logDebug("inventory", items);

    // if (loading) {
    //     return <div className="text-center">Loading...</div>;
    // }
    
    if (!isLoggedIn) {
        return <p className="text-red-500">Please log in to view the dashboard.</p>;
    }

    const handleClick = ( item, type ) => {
        logInfo("handleClick -> item:", item)
        setCurrentItemId(item.itemId);
        setActionType(type);
        setDialogOpen(true);
        logInfo("tempT:", tempTransfer)
        if (type === 'TRANSFER') setDefaultLocation(tempTransfer.fromLocation)
    };

    const handlePageChange = ( newPage ) => {
        dispatch(setPage(newPage));
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
                logInfo("itemId:", currentItemId)
                await stockOut (currentItemId, locationId, quantity );
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
        <div className="bg-gray-400 p-2">
            {/* <h2 className="text-center p-2">Welcome {user?.user.name}</h2> */}
            {localError && <p className="text-red-500">{localError}</p>}
            <StatusHandler status={loading ? 'loading' : ""} error={error}>
                <div className="p-2">
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

            {/* <div className="flex justify-center mt-4">
              <button onClick={logout} className="bg-red-500 text-white p-2 rounded-md">Logout</button>
            </div> */}
        </div>
    );
};

export default DashboardPage;