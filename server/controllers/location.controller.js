import Location from "../models/location.model.js";

export async function createLocation(req, res) {
    try {
        const location = new Location(req.body);
        await location.save();
        res.status(201).json(location);
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