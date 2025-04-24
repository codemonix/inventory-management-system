import { useEffect, useState } from "react";
import { fetchItems } from "../api/api.js";
import ItemCard from "../components/ItemCard.jsx";


const locationColors = {
    "Istanbul": "red-400",
    "Mashhad": "green-400",
    "Kargo": "blue-400",
}


const DashboardPage = () => {
    const [ items, setItems ] = useState([]);
    const [ error, setError ] = useState("");

    useEffect(() => {
        const loadItems = async () => {
            try {
                const data = await fetchItems();
                setItems(data);
            } catch (error) {
                console.error("Error fetching items:", error);
                setError("Failed to load items. Please try again later.");
            }
        };
        loadItems();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <ItemCard key={item._id} item={item} locationColors={locationColors} />
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;