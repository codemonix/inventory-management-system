import { useEffect, useState } from "react";
import { fetchInventory, stockIn, stockOut } from "../services/inventoryServices.js";
import ItemCardDashboard from "../components/ItemCardDashboard.jsx";
// import ItemList from "../components/ItemList.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getLocations } from "../services/locationsService.js"
import StockActionDialog from "../components/stockActionDialog.jsx";
import  { useDispatch }  from "react-redux";
import { addItem } from "../redux/slices/transferSlice.js";


const locationColors = {
    "Istanbul": "#BC1063",
    "Mashhad": "#10BC5A",
    "Kargo": "blue"
}


const DashboardPage = () => {
    const { isLoggedIn, user, loading } = useAuth();
    const [ items, setItems ] = useState([]);
    const [ error, setError ] = useState("");
    const [ locations , setLocations ] = useState([]);
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ currentItemId, setCurrentItemId ] = useState(null);
    const [ actionType, setActionType ] = useState('IN');
    const [ triggerUpdate, setTriggerUpdate ] = useState(0);
    
    console.log("DashboardPage -> user", user);

    const dispatch = useDispatch();

    useEffect(() => {
        if (isLoggedIn) {
            fetchInventory().then(setItems).catch((error) => {
                console.error("Error fetching items:", error.message);
                setError(error.message || "Failed to fetch items. Please try again later.");
            });

            getLocations().then(setLocations).catch((error) => {
                console.error("Error getting locations:", error.message);
                setError(error.message)
            })
        }
    }, [isLoggedIn, triggerUpdate]);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }
    
    if (!isLoggedIn) {
        return <p className="text-red-500">Please log in to view the dashboard.</p>;
    }

    const handleClick = ( itemId, type ) => {
        setCurrentItemId(itemId);
        setActionType(type);
        setDialogOpen(true);
    };

    const handleSubmitDashbord = async ({ itemId, locationId, quantity }) => {
        console.log("DashbordPage -> handleSubDash:", itemId, locationId, quantity)
        if (actionType === 'IN') {
            await stockIn (itemId, locationId, quantity );
            setTriggerUpdate((prev) => prev + 1 );
        } else if (actionType === 'OUT') {
            await stockOut (itemId, locationId, quantity );
            setTriggerUpdate((prev) => prev + 1 );
        } else if (actionType === 'TRANSFER') {
            console.log("handleAddToTransferClick: ", itemId);
            handleAddItemToTempTransfer(itemId, quantity);
            await stockOut (itemId, locationId, quantity );
            setTriggerUpdate((prev) => prev + 1 );
        }
    };

    // const handleAddToTransfer = (itemId, quantity) => {
    //     console.log("handleAddToTransfer: ", itemId, quantity);
    //     dispatch(addItem({ itemId, quantity }));
    // }

    const handleClose = () => {
        console.log("handle onClose")
        const active = document.activeElement;
        if (active instanceof HTMLElement) {
            active.blur()
        }
        setDialogOpen(false);

    };

    const handleAddItemToTempTransfer = (itemId, quantity) => {
        console.log("DashboardPage -> handleAddItemToTempTransfer:", itemId, quantity);
        dispatch(addItem({ itemId, quantity }));
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
                        onIn={() => handleClick(item.itemId, 'IN')}
                        onOut={() => handleClick(item.itemId, 'OUT')}
                        onAddToTransfer={() => handleClick(item.itemId, 'TRANSFER')}
                         />
                ))}
                <StockActionDialog
                    open={dialogOpen}
                    onClose={handleClose}
                    onSubmit={handleSubmitDashbord}
                    itemId={currentItemId}
                    locations={locations}
                    type={actionType}
                />
            </div>

            {/* <div className="flex justify-center mt-4">
              <button onClick={logout} className="bg-red-500 text-white p-2 rounded-md">Logout</button>
            </div> */}
        </div>
    );
};

export default DashboardPage;