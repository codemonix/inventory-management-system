import Location from "../models/location.model.js";

export async function createLocation(req, res) {
    try {
        const location = new Location(req.body);
        await location.save();
        res.status(201).json({mesage: "Location created successfully", location: location});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create location' });
    }
}

export async function getLocations(req, res) {
    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get locations' });
    }
}

export async function deleteLocation(req, res) {
    try {
        const { id } = req.params;
        const location = await Location.findByIdAndDelete(id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete location' });
    }
}
