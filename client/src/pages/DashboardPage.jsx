import { useEffect, useState } from "react";
import { fetchInventory } from "../api/api.js";
import ItemCard from "../components/ItemCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";


const locationColors = {
    "Istanbul": "red",
    "Mashhad": "green",
    "Kargo": "blue"
}


const DashboardPage = () => {
    const { isLoggedIn, user, logout } = useAuth();
    const [ items, setItems ] = useState([]);
    const [ error, setError ] = useState("");

    useEffect(() => {
        if (isLoggedIn) {
            fetchInventory().then(setItems).catch((err) => {
                console.error("Error fetching items:", err.message);
                setError(err.message || "Failed to fetch items. Please try again later.");
            });
        }
    }, [isLoggedIn]);
    
    if (!isLoggedIn) {
        return <p className="text-red-500">Please log in to view the dashboard.</p>;
    }



    return (
        <div className="p-6">
            <h2>Welcome {user?.name}</h2>
            {error && <p className="text-red-500">{error}</p>}
            <button onClick={logout} className="bg-red-500 text-white p-2 rounded-md">Logout</button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <ItemCard key={item.itemId} item={item} locationColors={locationColors} />
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;