
import Location from '../models/location.model.js';
import Inventory from '../models/inventory.model.js';
import Transfer from '../models/transfer.model.js';
import TempTransfer from '../models/tempTransfer.model.js';
import { AppError } from '../errors/AppError.js';
import { ICreateLocationInput } from '../types/location.types.js';
import { IUser } from '../types/user.types.js';
import logger from '../utils/logger.js';

// Only these fields may be set by clients (no mass assignment of _id, timestamps, ...)
const pickLocationFields = (data: Partial<ICreateLocationInput>): Partial<ICreateLocationInput> => {
    const result: Partial<ICreateLocationInput> = {};
    if (typeof data.name === 'string') result.name = data.name.trim();
    if (typeof data.color === 'string') result.color = data.color;
    if (typeof data.type === 'string') result.type = data.type;
    return result;
};

export const createLocationRecord = async (data: ICreateLocationInput) => {
    const location = new Location(pickLocationFields(data));
    await location.save();
    return location;
};

export const getAllLocations = async () => {
    const locations = await Location.find();
    logger.debug(`Found ${locations.length} locations`);
    return locations;
};

export const removeLocation = async (id: string, user: IUser) => {
    // Refuse while stock or open transfers still point at this location, otherwise that stock silently disappears
    const [hasStock, inTransfer, inTemp] = await Promise.all([
        Inventory.exists({ locationId: id, quantity: { $ne: 0 } }),
        Transfer.exists({ status: 'in_transit', $or: [{ fromLocation: id }, { toLocation: id }] }),
        TempTransfer.exists({ $or: [{ fromLocation: id }, { toLocation: id }] }),
    ]);
    if (hasStock) {
        throw new AppError('Location still holds stock. Move or remove the stock first.', 400);
    }
    if (inTransfer || inTemp) {
        throw new AppError('Location is part of an open transfer.', 400);
    }

    const location = await Location.findByIdAndDelete(id);
    if (!location) {
        throw new AppError('Location not found with that ID', 404);
    }
    // Clean up the empty inventory rows left behind
    await Inventory.deleteMany({ locationId: id });

    logger.info(`Location ${location.name} deleted by ${user.email}`)
    return location;
};

export const updateLocation = async (id: string, data: Partial<ICreateLocationInput>) => {
    const location = await Location.findByIdAndUpdate(id, pickLocationFields(data), { new: true, runValidators: true });
    if (!location) throw new AppError('Location not found with that ID', 404);
    logger.info(`Location ${location.name} updated`);
    return location;
}
