import { useEffect, useState } from "react";
import { fetchInventory } from "../services/inventoryServices.js";
import ItemCard from "../components/ItemCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";


const locationColors = {
    "Istanbul": "#BC1063",
    "Mashhad": "#10BC5A",
    "Kargo": "blue"
}


const DashboardPage = () => {
    const { isLoggedIn, user, loading } = useAuth();
    const [ items, setItems ] = useState([]);
    const [ error, setError ] = useState("");
    
    console.log("DashboardPage -> user", user);

    useEffect(() => {
        if (isLoggedIn) {
            fetchInventory().then(setItems).catch((err) => {
                console.error("Error fetching items:", err.message);
                setError(err.message || "Failed to fetch items. Please try again later.");
            });
        }
    }, [isLoggedIn]);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }
    
    if (!isLoggedIn) {
        return <p className="text-red-500">Please log in to view the dashboard.</p>;
    }



    return (
        <div className="bg-gray-400 p-6">
            <h2 className="text-center p-2">Welcome {user?.user.name}</h2>
            {error && <p className="text-red-500">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <ItemCard key={item.itemId} item={item} locationColors={locationColors} />
                ))}
            </div>
            {/* <div className="flex justify-center mt-4">
              <button onClick={logout} className="bg-red-500 text-white p-2 rounded-md">Logout</button>
            </div> */}
        </div>
    );
};

export default DashboardPage;