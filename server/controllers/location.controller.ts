import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import * as locationService from '../services/location.service.js';
import { AppError } from "../errors/AppError.js";
import { AuthenticatedRequest } from "../types/auth.types.js";


interface LocationParams {
    id: string;
}


export async function createLocation(
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.body || !req.body.name) {
            return next(new AppError("Location Name is required", 400));
        }
        logger.debug("location.controller -> createLocation -> req.body:", req.body);
        const location = await locationService.createLocationRecord(req.body);
        res.status(201).json({
            success: true,
            message: "Location created successfully",
            location
        });
    } catch (error) {
        logger.error("location.controller -> createLocation -> error:");
        next(error);
    }
}

export async function getLocations(
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const locations = await locationService.getAllLocations();
        res.status(200).json({
            success: true,
            message: "Locations fetched successfully",
            locations
        });
    } catch (error) {
        logger.error("location.controller -> getLocations -> error:");
        next(error);
    }
}

export async function deleteLocation(
    req: AuthenticatedRequest<LocationParams>, 
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = req.params.id;
        const user = req.user;
        if (!id) {
            return next(new AppError("Location ID parameter is missing", 400));
        }
        
        const location = await locationService.removeLocation(id, user);
        
        if (!location) {
            return next(new AppError("Location not found", 404));
        }
        res.status(200).json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
        logger.error("location.controller -> deleteLocation -> error:");
        next(error);
    }
}
