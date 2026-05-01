
import Location from '../models/location.model.js';
import { AppError } from '../errors/AppError.js';
import { ICreateLocationInput } from '../types/location.types.js';
import { IUser } from '../types/user.types.js';
import logger from '../utils/logger.js';



export const createLocationRecord = async (data: ICreateLocationInput) => {
    const location = new Location(data);
    await location.save();
    return location;
};

export const getAllLocations = async () => {
    const locations = await Location.find();
    logger.debug(`Found ${locations.length} locations`);
    logger.debug(locations[0]);
    return await Location.find();
};

export const removeLocation = async (id: string, user: IUser) => {
    const location = await Location.findByIdAndDelete(id);
    
    if (!location) {
        throw new AppError('Location not found with that ID', 404);
    }

    logger.info(`Location ${location.name} deleted by ${user.email}`)
    return location;
};

export const updateLocation = async (id: string, data: ICreateLocationInput) => {
    const location = await Location.findByIdAndUpdate(id, data, { new: true });
    if (!location) throw new AppError('Location not found with that ID', 404);
    logger.info(`Location ${location?.name} updated`);
    logger.debug(location);
    return location;
}