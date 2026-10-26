import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// Services (Added updateLocation)
import { getLocations, deleteLocation, createLocation, updateLocation } from "../services/locationService.js";

// Components
import CreateForm from "../components/CreateForm.jsx";
import LocationList from "../components/LocationList.jsx";

// MUI components
import { Container, Alert, Paper, Box } from "@mui/material";

// Utility
import { logError, logDebug } from "../utils/logger.js";

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
                logError("LocationsPage.jsx -> Error fetching locations:", error.message);
            });
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteLocation(id);
            setLocations((prevLocations) => prevLocations.filter((location) => location._id !== id));
        } catch (error) {
            logError("LocationsPage.jsx -> Error deleting location:", error.message);
            setErrorMessage("Failed to delete location.");
        }
    };

    const handleLocationCreated = (response) => {
        logDebug("LocationsPage.jsx -> handleLocationCreated -> response:", response);
        const newLocation = response.location || response;
        setLocations((prevLocations) => [...prevLocations, newLocation]);
    };

    // NEW: Handler for updating the color
    const handleUpdateLocation = async (id, updatedData) => {
        try {
            const updatedLocation = await updateLocation(id, updatedData);
            setLocations((prevLocations) => 
                prevLocations.map((loc) => loc._id === id ? updatedLocation.location : loc)
            );
            logInfo("LocationsPage.jsx -> handleUpdateLocation -> Location updated successfully");
            logDebug("LocationsPage.jsx -> handleUpdateLocation -> updatedLocation:", updatedLocation);
            logDebug("LocationsPage.jsx -> handleUpdateLocation -> locations:", locations);
        } catch (error) {
            logError("LocationsPage.jsx -> Error updating location:", error.message);
            setErrorMessage("Failed to update location color.");
        }
    };

    return (
        <Box sx={{ py: 3, px: { xs: 1, sm: 2, lg: 4 } }}>
            <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

                {errorMessage && (
                    <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setErrorMessage("")}>
                        {errorMessage}
                    </Alert>
                )}

                {isManagerOrAdmin && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: 'sm' }}>
                            <CreateForm 
                                title="Add New Location"
                                label="Location Name"
                                placeholder="e.g., Main Warehouse, Shelf B"
                                onCreate={createLocation}
                                onSuccess={handleLocationCreated}
                            />
                        </Box>
                    </Box>
                )}

                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 2, 
                        bgcolor: 'background.paper' 
                    }}
                >
                    {/* Passed onUpdate down to the list */}
                    <LocationList 
                        locations={locations} 
                        onDelete={handleDelete} 
                        onUpdate={handleUpdateLocation} 
                    />
                </Paper>

            </Container>
        </Box>
    );
}