import Location from "../models/location.model.js";

export async function createLocation(req, res) {
    try {
        const loaction = new Location(req.body);
        await loaction.save();
        res.status(201).json(location);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create location' });
    }
}

export async function getLocations(req, res) {
    try {
        const locations = await Location.find();
        res.json(locations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get locations' });
    }
    
}