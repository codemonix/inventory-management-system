import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// Services
import { getLocations, deleteLocation, createLocation } from "../services/locationService.js";

// Components
import CreateForm from "../components/CreateForm.jsx";
import LocationList from "../components/LocationList.jsx";

// MUI components
import { Container, Typography, Alert } from "@mui/material";

// Utility
import { logInfo, logError, logDebug } from "../utils/logger.js";


export default function LocationsPage() {
    const [locations, setLocations] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const { isAdmin, isManager } = useAuth();


    const isManagerOrAdmin = isAdmin || isManager;

    useEffect(() => {
        getLocations()
            .then(setLocations)
            .catch((error) => {
                setErrorMessage(error.message);
                logError("LocationsPage.jsx -> Error fetching locations:", error.message)
            });
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteLocation(id);
            setLocations((prevLocations) => prevLocations.filter((location) => location._id !== id));
        } catch (error) {
            logError("LocationsPage.jsx -> Error deleting location:", error.message);
            setErrorMessage("Faled to delete location.");
        }
    };

    const handleLocationCreated = (response) => {
        logDebug("LocationsPage.jsx -> handleLocationCreated -> response.location:", response.location);
        const newLocation = response.location || response;
        setLocations((prevLocations) => [...prevLocations, newLocation]);
    };


    return (
        <div className="min-h-screen bg-gray-400 py-3 px-1 sm:px-2 lg:px-4">
            <Container maxWidth="md" className="space-y-8">

                {/* Error Notification */}
                {errorMessage && (
                    <Alert severity="error" className="rounded-lg shadow-sm" onClose={() => setErrorMessage("")}>
                        {error}
                    </Alert>
                )}

                {/* Conditional Create Form for Admins/Managers */}
                {isManagerOrAdmin && (
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <CreateForm 
                                title="Add New Location"
                                label="Location Name"
                                placeholder="e.g., Main Warehouse, Shelf B"
                                onCreate={createLocation}
                                onSuccess={handleLocationCreated}
                            />
                        </div>
                    </div>
                )}

                {/* Location List Container */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
                    <LocationList locations={locations} onDelete={handleDelete} />
                </div>

            </Container>
        </div>
    );
}