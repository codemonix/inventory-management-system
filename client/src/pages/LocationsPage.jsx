import { useEffect, useState } from "react";
import { getLocations, deleteLocation } from "../services/locationsService.js";
import LocationForm from "../components/LocationForm.jsx";
import LocationList from "../components/LocationList.jsx";
import { useAuth } from "../context/AuthContext.jsx";


export default function LocationsPage() {
    const [locations, setLocations] = useState([]);
    const { isAdmin, isManager } = useAuth();
    const isManagerOrAdmin = isAdmin || isManager;

    useEffect(() => {
        getLocations()
            .then(setLocations)
            .catch((error) => console.error("Error fetching locations:", error.message));
    }, []);

    const handleDelete = async (id) => {
        await deleteLocation(id);
        setLocations((prevLocations) => prevLocations.filter((location) => location._id !== id));
    };


    return (
        <div className="bg-gray-200 p-6">
            <h2 className="text-center text-2xl font-semibold mb-4">Locations</h2>
            { isManagerOrAdmin && 
                <LocationForm onLocationCreated={(newLocation) => setLocations((prevLocations) => [...prevLocations, newLocation.location])} />
            }
            <LocationList locations={locations} onDelete={handleDelete} />
        </div>
    );
}