import User from "../models/users.model.js";
import getSortOptions from "../utils/getSortOptions.js";
import { AppError } from "../errors/AppError.js";
import { IUpdateUserBody } from "../types/user.types.js";
import logger from "../utils/logger.js";

interface IGetUsersParams {
    page: number;
    limit: number;
    search: string;
    sortParam: string;
}

export const getUsers = async ({ page, limit, search, sortParam }: IGetUsersParams) => {
    const query = search ? {
        $or: [
            { name: { $regex: search, $options: 'i' }},
            { email: { $regex: search, $options: 'i' }},
        ],
    } : {};

    const totalCount = await User.countDocuments(query);

    const users = await User.find(query)
        .sort(getSortOptions(sortParam))
        .skip((page - 1) * limit)
        .limit(limit);

    return { users, totalCount };
};

export const toggleUserActive = async (id: string, isActive: boolean) => {
    const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
    );
    
    if (!user) {
        logger.warn("User not found")
        throw new AppError("User not found", 404);
    }
    return user;
};

export const updateUser = async (id: string, data: IUpdateUserBody) => {
    const user = await User.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );

    if (!user) {
        logger.warn("User not found.")
        throw new AppError("User not found", 404);
    } 
    return user;
};

export const toggleUserApproved = async (id: string, isApproved: boolean) => {
    logger.debug("toggleUserApproved for ID:", id);
    const user = await User.findByIdAndUpdate(
        id,
        { isApproved },
        { new: true }
    );

    if (!user) {
        logger.warn("User not found.")
        throw new AppError("User not found", 404);
    } 
    return user;
};