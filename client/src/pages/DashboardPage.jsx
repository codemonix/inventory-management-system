import { useEffect, useState } from "react";
import { fetchInventory, stockIn, stockOut } from "../services/inventoryServices.js";
import ItemCardDashboard from "../components/ItemCardDashboard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getLocations } from "../services/locationsService.js"
import StockActionDialog from "../components/stockActionDialog.jsx";
import  { useDispatch, useSelector }  from "react-redux";
import { addItem } from "../redux/slices/transferSlice.js";
import { logDebug, logError, logInfo } from "../utils/logger.js";
import Inventory from "../../../server/models/inventory.model.js";
import { loadTempTransfer, loadTransfers } from "../redux/slices/transferSlice.js";


const locationColors = {
    "Istanbul": "#BC1063",
    "Mashhad": "#10BC5A",
    "Kargo": "blue"
}


const DashboardPage = () => {
    const { isLoggedIn, loading } = useAuth();
    const [ items, setItems ] = useState([]);
    const [ error, setError ] = useState("");
    const [ locations , setLocations ] = useState([]);
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ currentItemId, setCurrentItemId ] = useState(null);
    const [ actionType, setActionType ] = useState('IN');
    const [ triggerUpdate, setTriggerUpdate ] = useState(0);
    const [ defaultLocation, setDefaultLocation] = useState(null);
    const tempTransfer = useSelector((state) => state.transfer.tempTransfer)


    const dispatch = useDispatch();

    useEffect(() => {
        // logDebug("tempTransfer Updated:", tempTransfer)
        if (isLoggedIn) {
            fetchInventory().then(setItems).catch((error) => {
                
                logError("Error fetching items:", error.message);
                setError(error.message || "Failed to fetch items. Please try again later.");
            });

            getLocations().then(setLocations).catch((error) => {
                console.error("Error getting locations:", error.message);
                setError(error.message)
            })
        }
    }, [isLoggedIn, triggerUpdate]);

    useEffect(() => {
        dispatch(loadTempTransfer());
        dispatch(loadTransfers())
    }, [dispatch])

    
    logInfo("state tempTransfer:", tempTransfer)

    logDebug("inventory", items) 

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }
    
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

    const handleSubmitDashbord = async ({ itemId, locationId, quantity }) => {
        logDebug("DashbordPage -> handleSubDash:", itemId, locationId, quantity)
        logDebug("tempTransfer: ", tempTransfer)
        if (actionType === 'IN') {
            await stockIn (itemId, locationId, quantity );
            setTriggerUpdate((prev) => prev + 1 );
        } else if (actionType === 'OUT') {
            await stockOut (itemId, locationId, quantity );
            setTriggerUpdate((prev) => prev + 1 );
        } else if (actionType === 'TRANSFER') {
            setDefaultLocation(tempTransfer.fromLocation)
            console.log("handleAddToTransferClick: ", itemId);


            
            if (tempTransfer.fromLocation !== locationId) {
                setError("Location mismatch!")
                return;
            } else {
                // locationId is source location id to check in the backend
                handleAddItemToTempTransfer(itemId, quantity, locationId);
                logInfo("itemId:", itemId)
                await stockOut (itemId, locationId, quantity );
            }
            
            setTriggerUpdate((prev) => prev + 1 );
        }
    };

    const handleClose = () => {
        setDialogOpen(false);

    };

    const handleAddItemToTempTransfer = (itemId, quantity, sourceLocationId) => {
        logDebug("DashboardPage -> handleAddItemToTempTransfer:", itemId, quantity);
        dispatch(addItem({ itemId, quantity, sourceLocationId }));
    }



    return (
        <div className="bg-gray-400 p-2">
            {/* <h2 className="text-center p-2">Welcome {user?.user.name}</h2> */}
            {error && <p className="text-red-500">{error}</p>}
            
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

            {/* <div className="flex justify-center mt-4">
              <button onClick={logout} className="bg-red-500 text-white p-2 rounded-md">Logout</button>
            </div> */}
        </div>
    );
};

export default DashboardPage;