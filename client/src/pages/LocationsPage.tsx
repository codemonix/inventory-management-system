import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// Services (Added updateLocation)
import { getLocations, deleteLocation, createLocation, updateLocation } from "../services/locationService";

// Components
import CreateForm from "../components/CreateForm";
import LocationList from "../components/LocationList";

// MUI components
import { Container, Alert, Paper, Box } from "@mui/material";

// Utility
import { logError, logDebug, logInfo } from "../utils/logger";
import { getErrorMessage } from "../utils/errorMessage";
import { ILocation, LocationResponse } from "../types/location.types";

export default function LocationsPage() {
    const [locations, setLocations] = useState<ILocation[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const { isAdmin, isManager } = useAuth();

    const isManagerOrAdmin = isAdmin || isManager;

    useEffect(() => {
        getLocations()
            .then(setLocations)
            .catch((error: unknown) => {
                const message = getErrorMessage(error, "Failed to load locations.");
                setErrorMessage(message);
                logError("LocationsPage -> Error fetching locations:", message);
            });
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await deleteLocation(id);
            setLocations((prevLocations) => prevLocations.filter((location) => location._id !== id));
        } catch (error: unknown) {
            // The service surfaces the server's reason (e.g. the location still holds stock)
            const message = getErrorMessage(error, "Failed to delete location.");
            logError("LocationsPage -> Error deleting location:", message);
            setErrorMessage(message);
        }
    };

    const handleLocationCreated = (response: LocationResponse) => {
        logDebug("LocationsPage -> handleLocationCreated -> response:", response);
        setLocations((prevLocations) => [...prevLocations, response.location]);
    };

    // Updates a location (e.g. its color) and replaces it in the list
    const handleUpdateLocation = async (id: string, updatedData: Partial<ILocation>) => {
        try {
            const updatedLocation = await updateLocation(id, updatedData);
            setLocations((prevLocations) => 
                prevLocations.map((loc) => loc._id === id ? updatedLocation.location : loc)
            );
            logInfo("LocationsPage -> handleUpdateLocation -> Location updated successfully");
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Failed to update location.");
            logError("LocationsPage -> Error updating location:", message);
            setErrorMessage(message);
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